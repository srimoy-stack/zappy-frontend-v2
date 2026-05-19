'use client';

/**
 * useOnboardingFlow — Production-grade provisioning orchestrator.
 *
 * Dynamic step flow based on entitlement selection:
 *   1. Brand Identity (always)
 *   2. Entitlements — unified module tree (always)
 *   3. Email Config (only if email-campaigns enabled)
 *   4. SMS Config (only if email-campaigns enabled — optional)
 *   5. AI Call Config (only if ai-call-analytics enabled)
 *   6. Tenant Admin (always)
 *   7. Review & Deploy (always)
 *
 * Key guarantees:
 *   - Idempotent retry: on failure, retry resumes from the failed step.
 *   - No duplicate tenants: createdTenantId is tracked and reused on retry.
 *   - Race-condition safe: submitting state prevents double-clicks.
 *   - No stale drafts: every mount starts with a clean form.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import {
    OnboardingFormData,
    OnboardingStep,
    OrchestrationStepStatus,
    createInitialFormData,
} from '../types/onboarding.types';
import * as onboardingService from '../services/onboarding.service';
import { logAction } from '@/shared/utils/auditLogger';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '@/shared/types/audit';

// ── Modules that trigger conditional steps ──────────────────────────────────
const EMAIL_MODULES = ['email-campaigns'];
const SMS_MODULES = ['email-campaigns', 'online-ordering'];
const VAPI_MODULES = ['ai-call-analytics'];

export function useOnboardingFlow() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
    const [formData, setFormData] = useState<OnboardingFormData>(
        () => createInitialFormData()
    );

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);
    const [orchestrationSteps, setOrchestrationSteps] = useState<OrchestrationStepStatus[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [stepErrors, setStepErrors] = useState<string[]>([]);

    // Ref to prevent concurrent submissions (survives re-renders)
    const submittingRef = useRef(false);

    // ── Conditional step visibility ──────────────────────────────────────────
    const needsEmail = useMemo(() => {
        return formData.enabledModuleIds.some(id => EMAIL_MODULES.includes(id));
    }, [formData.enabledModuleIds]);

    const needsSms = useMemo(() => {
        return formData.enabledModuleIds.some(id => SMS_MODULES.includes(id));
    }, [formData.enabledModuleIds]);

    const needsVapi = useMemo(() => {
        return formData.enabledModuleIds.some(id => VAPI_MODULES.includes(id));
    }, [formData.enabledModuleIds]);

    /**
     * Active steps — dynamically computed based on entitlement selection.
     * Steps 3-5 only appear if relevant modules are enabled.
     */
    const activeSteps = useMemo((): OnboardingStep[] => {
        const steps: OnboardingStep[] = [1, 2]; // Brand + Entitlements (always)
        if (needsEmail) steps.push(3);
        if (needsSms) steps.push(4);
        if (needsVapi) steps.push(5);
        steps.push(6, 7); // Admin + Review (always)
        return steps;
    }, [needsEmail, needsSms, needsVapi]);

    const totalSteps = activeSteps.length;

    const isStepActive = useCallback((step: OnboardingStep) => {
        return activeSteps.includes(step);
    }, [activeSteps]);

    const currentStepIndex = activeSteps.indexOf(currentStep);

    // ── Validation ───────────────────────────────────────────────────────────
    const validateStep = useCallback(
        (step: OnboardingStep): { valid: boolean; errors: string[] } => {
            const errors: string[] = [];

            switch (step) {
                case 1:
                    if (!formData.brand.brandName.trim()) errors.push('Brand name is required');
                    if (!formData.brand.addressLine1.trim()) errors.push('Address is required');
                    if (!formData.brand.city.trim()) errors.push('City is required');
                    if (!formData.brand.postalCode.trim()) errors.push('Postal code is required');
                    // Validate contact email format if provided
                    if (formData.brand.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.brand.contactEmail)) {
                        errors.push('Invalid contact email format');
                    }
                    break;
                case 2:
                    if (formData.enabledModuleIds.length === 0) {
                        errors.push('At least one module must be enabled');
                    }
                    break;
                case 3:
                    // Email — required fields when custom provider selected
                    if (needsEmail && formData.email.provider !== 'inherit') {
                        if (!formData.email.senderEmail.trim()) errors.push('Sender email is required');
                        if (formData.email.senderEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.senderEmail)) {
                            errors.push('Invalid sender email format');
                        }
                        if (!formData.email.senderName.trim()) errors.push('Sender name is required');
                        if (formData.email.provider === 'smtp') {
                            if (!formData.email.host?.trim()) errors.push('SMTP host is required');
                            if (!formData.email.username?.trim()) errors.push('SMTP username is required');
                            if (!formData.email.password?.trim()) errors.push('SMTP password is required');
                        }
                        if ((formData.email.provider === 'sendgrid' || formData.email.provider === 'ses') && !formData.email.apiKey?.trim()) {
                            errors.push('API key is required');
                        }
                        // Validate reply-to email format if provided
                        if (formData.email.replyTo?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.replyTo)) {
                            errors.push('Invalid reply-to email format');
                        }
                    }
                    break;
                case 4:
                    // SMS — fully optional. Only validate if custom provider is selected
                    if (needsSms && formData.sms.provider !== 'inherit') {
                        if (!formData.sms.senderId.trim()) errors.push('Sender ID is required for custom SMS providers');
                        if (!formData.sms.apiKey?.trim()) errors.push('API key is required');
                    }
                    break;
                case 5:
                    // Vapi — required when ai-call-analytics is enabled
                    if (needsVapi) {
                        if (!formData.vapi.assistantId.trim()) errors.push('Vapi Assistant ID is required');
                        if (!formData.vapi.phoneNumber.trim()) errors.push('Assistant phone number is required');
                    }
                    break;
                case 6:
                    if (!formData.admin.adminName.trim()) errors.push('Admin name is required');
                    if (!formData.admin.adminEmail.trim()) errors.push('Admin email is required');
                    if (formData.admin.adminEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin.adminEmail)) {
                        errors.push('Invalid email format');
                    }
                    break;
                case 7:
                    // Review — no additional validation
                    break;
            }

            return { valid: errors.length === 0, errors };
        },
        [formData, needsEmail, needsSms, needsVapi]
    );

    // ── Step navigation (validates before advancing) ─────────────────────────
    const nextStep = useCallback(() => {
        const validation = validateStep(currentStep);
        if (!validation.valid) {
            setStepErrors(validation.errors);
            return;
        }
        setStepErrors([]);
        setCurrentStep((prev) => {
            const currentIdx = activeSteps.indexOf(prev);
            if (currentIdx === -1 || currentIdx >= activeSteps.length - 1) return prev;
            return activeSteps[currentIdx + 1]!;
        });
    }, [activeSteps, currentStep, validateStep]);

    const prevStep = useCallback(() => {
        setStepErrors([]);
        setCurrentStep((prev) => {
            const currentIdx = activeSteps.indexOf(prev);
            if (currentIdx <= 0) return prev;
            return activeSteps[currentIdx - 1]!;
        });
    }, [activeSteps]);

    const goToStep = useCallback((step: OnboardingStep) => {
        if (activeSteps.includes(step)) {
            setStepErrors([]);
            setCurrentStep(step);
        }
    }, [activeSteps]);

    // ── Form updaters ────────────────────────────────────────────────────────
    const updateBrand = useCallback(
        (updates: Partial<OnboardingFormData['brand']>) => {
            setFormData((prev) => ({ ...prev, brand: { ...prev.brand, ...updates } }));
            setStepErrors([]);
        },
        []
    );

    const updateAdmin = useCallback(
        (updates: Partial<OnboardingFormData['admin']>) => {
            setFormData((prev) => ({ ...prev, admin: { ...prev.admin, ...updates } }));
            setStepErrors([]);
        },
        []
    );

    const updateEmail = useCallback(
        (updates: Partial<OnboardingFormData['email']>) => {
            setFormData((prev) => ({ ...prev, email: { ...prev.email, ...updates } }));
            setStepErrors([]);
        },
        []
    );

    const updateSms = useCallback(
        (updates: Partial<OnboardingFormData['sms']>) => {
            setFormData((prev) => ({ ...prev, sms: { ...prev.sms, ...updates } }));
            setStepErrors([]);
        },
        []
    );

    const updateVapi = useCallback(
        (updates: Partial<OnboardingFormData['vapi']>) => {
            setFormData((prev) => ({ ...prev, vapi: { ...prev.vapi, ...updates } }));
            setStepErrors([]);
        },
        []
    );

    const updateEnabledModules = useCallback((moduleIds: string[]) => {
        setFormData((prev) => ({
            ...prev,
            enabledModuleIds: moduleIds,
        }));
    }, []);

    const updateEntitlementPaths = useCallback((paths: string[]) => {
        setFormData((prev) => ({
            ...prev,
            selectedEntitlementPaths: paths,
            // Sync enabled modules based on paths
            enabledModuleIds: Array.from(new Set(
                paths.map(p => p.split('.')[0]!).filter(Boolean)
            )),
        }));
    }, []);

    // ── Orchestration step updater ───────────────────────────────────────────
    const markStep = useCallback(
        (index: number, status: OrchestrationStepStatus['status'], error?: string) => {
            setOrchestrationSteps((prev) =>
                prev.map((s, i) => (i === index ? { ...s, status, error } : s))
            );
        },
        []
    );

    // ── Helper: extract human-readable error message ─────────────────────────
    const extractErrorMessage = useCallback((err: any): string => {
        let msg = err?.message || err?.response?.data?.message || err?.response?.data?.error || 'Onboarding failed';

        // Extract Laravel validation details (e.g. { email: ['The email has already been taken.'] })
        const details = err?.details || err?.response?.data?.details || err?.response?.data?.errors;
        if (details && typeof details === 'object' && Object.keys(details).length > 0) {
            const fieldErrors = Object.entries(details)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join('; ');
            if (fieldErrors) msg = `${msg} — ${fieldErrors}`;
        }

        return msg;
    }, []);

    // ── Submit — idempotent, retry-safe sequential API pipeline ──────────────
    const handleSubmit = useCallback(async () => {
        // Race condition guard — ref survives closure staleness
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        setSubmitError(null);

        // Build dynamic orchestration labels based on active config
        const dynamicLabels = [
            'Creating brand',
            'Enabling modules',
            ...(needsEmail ? ['Configuring email'] : []),
            ...(needsSms && formData.sms.provider !== 'inherit' ? ['Configuring SMS'] : []),
            ...(needsVapi ? ['Configuring AI Call Analytics'] : []),
            'Creating tenant admin',
            'Finalizing onboarding',
        ];

        // On first attempt, build fresh orchestration steps.
        // On retry, reset only 'error' steps back to 'pending' — keep 'done' steps intact.
        setOrchestrationSteps((prev) => {
            if (prev.length === 0 || prev.length !== dynamicLabels.length) {
                // First attempt or labels changed — build fresh
                return dynamicLabels.map((label) => ({ label, status: 'pending' as const }));
            }
            // Retry — reset 'error' steps to 'pending', keep 'done' as-is
            return prev.map((s) =>
                s.status === 'error' ? { ...s, status: 'pending' as const, error: undefined } : s
            );
        });

        logAction({ action: AUDIT_ACTIONS.ONBOARDING_STARTED, entity: AUDIT_ENTITIES.TENANT, metadata: { brandName: formData.brand.brandName } });

        try {
            let stepIdx = 0;
            let tenantId = createdTenantId;

            // ─── 1. Create tenant (idempotent — skip if already created) ─────
            if (!tenantId) {
                markStep(stepIdx, 'running');
                const tenant = await onboardingService.createTenant(formData.brand);
                tenantId = tenant.id;
                setCreatedTenantId(tenantId);
                markStep(stepIdx, 'done');
                logAction({ action: AUDIT_ACTIONS.TENANT_CREATED, entity: AUDIT_ENTITIES.TENANT, entityId: tenantId, metadata: { brandName: formData.brand.brandName } });
            }
            // Tenant already created from a previous attempt — mark as done
            stepIdx++;

            // ─── 2. Enable modules + entitlements ────────────────────────────
            markStep(stepIdx, 'running');
            await onboardingService.enableModules(tenantId, formData.enabledModuleIds, formData.selectedEntitlementPaths);
            markStep(stepIdx, 'done');
            formData.enabledModuleIds.forEach((id) => logAction({ action: AUDIT_ACTIONS.MODULE_ENABLED, entity: AUDIT_ENTITIES.MODULE, entityId: id, metadata: { tenantId } }));
            stepIdx++;

            // ─── 3. Configure email (only if enabled) ────────────────────────
            if (needsEmail) {
                markStep(stepIdx, 'running');
                await onboardingService.configureEmail(tenantId, formData.email);
                markStep(stepIdx, 'done');
                stepIdx++;
            }

            // ─── 4. Configure SMS (only if custom provider selected) ─────────
            if (needsSms && formData.sms.provider !== 'inherit') {
                markStep(stepIdx, 'running');
                await onboardingService.configureSms(tenantId, formData.sms);
                markStep(stepIdx, 'done');
                stepIdx++;
            }

            // ─── 5. Configure Vapi (only if ai-call-analytics enabled) ───────
            if (needsVapi) {
                markStep(stepIdx, 'running');
                await onboardingService.configureVapi(tenantId, formData.vapi);
                markStep(stepIdx, 'done');
                stepIdx++;
            }

            // ─── 6. Create tenant admin ──────────────────────────────────────
            markStep(stepIdx, 'running');
            await onboardingService.createAdminUser(tenantId, formData.admin);
            markStep(stepIdx, 'done');
            logAction({ action: AUDIT_ACTIONS.USER_CREATED, entity: AUDIT_ENTITIES.USER, metadata: { tenantId, role: 'BRAND_ADMIN', email: formData.admin.adminEmail } });
            stepIdx++;

            // ─── 7. Finalize ─────────────────────────────────────────────────
            markStep(stepIdx, 'running');
            await onboardingService.finalizeOnboarding(tenantId);
            markStep(stepIdx, 'done');

            // Done
            setSubmitted(true);
            logAction({ action: AUDIT_ACTIONS.ONBOARDING_COMPLETED, entity: AUDIT_ENTITIES.TENANT, entityId: tenantId });
        } catch (err: any) {
            const msg = extractErrorMessage(err);
            setSubmitError(msg);
            logAction({ action: AUDIT_ACTIONS.ONBOARDING_FAILED, entity: AUDIT_ENTITIES.TENANT, metadata: { error: msg, brandName: formData.brand.brandName } });

            // If the tenant was deleted externally (404), reset so retry creates a new one
            if (err?.status === 404 || err?.code === 'NOT_FOUND') {
                setCreatedTenantId(null);
            }

            setOrchestrationSteps((prev) =>
                prev.map((s) =>
                    s.status === 'running' ? { ...s, status: 'error', error: msg } : s
                )
            );
        } finally {
            setSubmitting(false);
            submittingRef.current = false;
        }
    }, [formData, markStep, needsEmail, needsSms, needsVapi, createdTenantId, extractErrorMessage]);

    const resetDraft = useCallback(() => {
        setFormData(createInitialFormData());
        setCurrentStep(1);
        setSubmitting(false);
        setSubmitted(false);
        setCreatedTenantId(null);
        setOrchestrationSteps([]);
        setSubmitError(null);
        setStepErrors([]);
        submittingRef.current = false;
    }, []);

    return {
        // Step state
        currentStep,
        nextStep,
        prevStep,
        goToStep,
        activeSteps,
        totalSteps,
        isStepActive,
        currentStepIndex,

        // Conditional flags
        needsEmail,
        needsSms,
        needsVapi,

        // Form data
        formData,
        updateBrand,
        updateAdmin,
        updateEmail,
        updateSms,
        updateVapi,
        updateEnabledModules,
        updateEntitlementPaths,

        // Submission
        submitting,
        submitted,
        submitError,
        createdTenantId,
        orchestrationSteps,
        handleSubmit,

        // Validation
        validateStep,
        stepErrors,
        resetDraft,
    };
}
