'use client';

/**
 * useOnboardingFlow — Orchestrates the provisioning wizard.
 *
 * Dynamic step flow based on entitlement selection:
 *   1. Brand Identity (always)
 *   2. Entitlements — unified module tree (always)
 *   3. Email Config (only if email-campaigns enabled)
 *   4. SMS Config (only if communication modules enabled)
 *   5. Tenant Admin (always)
 *   6. Review & Deploy (always)
 *
 * Steps 3 & 4 are conditionally shown based on Step 2 selections.
 * If a brand doesn't need email campaigns, those steps are auto-skipped.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
    OnboardingFormData,
    OnboardingStep,
    OrchestrationStepStatus,
    createInitialFormData,
} from '../types/onboarding.types';
import * as onboardingService from '../services/onboarding.service';
import { logAction } from '@/shared/utils/auditLogger';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '@/shared/types/audit';

const DRAFT_KEY = 'zyappy_onboarding_draft';

// ── Modules that trigger conditional steps ──────────────────────────────────
const EMAIL_MODULES = ['email-campaigns'];
const SMS_MODULES = ['email-campaigns', 'online-ordering']; // SMS needed for OTP, order notifications

function loadDraft(): OnboardingFormData | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (!raw) return null;

        const draft = JSON.parse(raw);
        const initial = createInitialFormData();

        return {
            ...initial,
            ...draft,
            brand: { ...initial.brand, ...(draft.brand || {}) },
            admin: { ...initial.admin, ...(draft.admin || {}) },
            email: { ...initial.email, ...(draft.email || {}) },
            sms: { ...initial.sms, ...(draft.sms || {}) },
            enabledModuleIds: draft.enabledModuleIds || initial.enabledModuleIds,
            selectedEntitlementPaths: draft.selectedEntitlementPaths || initial.selectedEntitlementPaths,
        };
    } catch {
        return null;
    }
}

function saveDraft(data: OnboardingFormData) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

function clearDraft() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(DRAFT_KEY);
}

const ORCHESTRATION_LABELS = [
    'Creating brand',
    'Enabling modules',
    'Configuring email',
    'Configuring SMS',
    'Creating tenant admin',
    'Finalizing onboarding',
];

export function useOnboardingFlow() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
    const [formData, setFormData] = useState<OnboardingFormData>(
        () => loadDraft() || createInitialFormData()
    );

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);
    const [orchestrationSteps, setOrchestrationSteps] = useState<OrchestrationStepStatus[]>(
        ORCHESTRATION_LABELS.map((label) => ({ label, status: 'pending' }))
    );
    const [submitError, setSubmitError] = useState<string | null>(null);
    const submitAttempted = useRef(false);

    // ── Conditional step visibility ──────────────────────────────────────────
    const needsEmail = useMemo(() => {
        return formData.enabledModuleIds.some(id => EMAIL_MODULES.includes(id));
    }, [formData.enabledModuleIds]);

    const needsSms = useMemo(() => {
        return formData.enabledModuleIds.some(id => SMS_MODULES.includes(id));
    }, [formData.enabledModuleIds]);

    /**
     * Active steps — dynamically computed based on entitlement selection.
     * Steps 3 (Email) and 4 (SMS) only appear if relevant modules are enabled.
     */
    const activeSteps = useMemo((): OnboardingStep[] => {
        const steps: OnboardingStep[] = [1, 2]; // Brand + Entitlements (always)
        if (needsEmail) steps.push(3);
        if (needsSms) steps.push(4);
        steps.push(5, 6); // Admin + Review (always)
        return steps;
    }, [needsEmail, needsSms]);

    /**
     * Total active step count (for progress bar).
     */
    const totalSteps = activeSteps.length;

    /**
     * Check if a step is active in current flow.
     */
    const isStepActive = useCallback((step: OnboardingStep) => {
        return activeSteps.includes(step);
    }, [activeSteps]);

    /**
     * Current step index within active steps (for progress display).
     */
    const currentStepIndex = activeSteps.indexOf(currentStep);

    // ── Persist draft on change ──────────────────────────────────────────────
    useEffect(() => {
        if (!submitted) {
            saveDraft(formData);
        }
    }, [formData, submitted]);

    // ── Step navigation (skips inactive steps) ───────────────────────────────
    const nextStep = useCallback(() => {
        setCurrentStep((prev) => {
            const currentIdx = activeSteps.indexOf(prev);
            if (currentIdx === -1 || currentIdx >= activeSteps.length - 1) return prev;
            return activeSteps[currentIdx + 1]!;
        });
    }, [activeSteps]);

    const prevStep = useCallback(() => {
        setCurrentStep((prev) => {
            const currentIdx = activeSteps.indexOf(prev);
            if (currentIdx <= 0) return prev;
            return activeSteps[currentIdx - 1]!;
        });
    }, [activeSteps]);

    const goToStep = useCallback((step: OnboardingStep) => {
        // Only allow jumping to active steps
        if (activeSteps.includes(step)) {
            setCurrentStep(step);
        }
    }, [activeSteps]);

    // ── Form updaters ────────────────────────────────────────────────────────
    const updateBrand = useCallback(
        (updates: Partial<OnboardingFormData['brand']>) => {
            setFormData((prev) => ({ ...prev, brand: { ...prev.brand, ...updates } }));
        },
        []
    );

    const updateAdmin = useCallback(
        (updates: Partial<OnboardingFormData['admin']>) => {
            setFormData((prev) => ({ ...prev, admin: { ...prev.admin, ...updates } }));
        },
        []
    );

    const updateEmail = useCallback(
        (updates: Partial<OnboardingFormData['email']>) => {
            setFormData((prev) => ({ ...prev, email: { ...prev.email, ...updates } }));
        },
        []
    );

    const updateSms = useCallback(
        (updates: Partial<OnboardingFormData['sms']>) => {
            setFormData((prev) => ({ ...prev, sms: { ...prev.sms, ...updates } }));
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

    // ── Submit — sequential API calls ────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        if (submitAttempted.current) return;
        submitAttempted.current = true;
        setSubmitting(true);
        setSubmitError(null);

        // Build dynamic orchestration labels based on active steps
        const dynamicLabels = [
            'Creating brand',
            'Enabling modules',
            ...(needsEmail ? ['Configuring email'] : []),
            ...(needsSms ? ['Configuring SMS'] : []),
            'Creating tenant admin',
            'Finalizing onboarding',
        ];
        setOrchestrationSteps(dynamicLabels.map((label) => ({ label, status: 'pending' })));

        logAction({ action: AUDIT_ACTIONS.ONBOARDING_STARTED, entity: AUDIT_ENTITIES.TENANT, metadata: { brandName: formData.brand.brandName } });

        try {
            let stepIdx = 0;

            // 1. Create tenant
            markStep(stepIdx, 'running');
            const tenant = await onboardingService.createTenant(formData.brand);
            setCreatedTenantId(tenant.id);
            markStep(stepIdx, 'done');
            logAction({ action: AUDIT_ACTIONS.TENANT_CREATED, entity: AUDIT_ENTITIES.TENANT, entityId: tenant.id, metadata: { brandName: formData.brand.brandName } });
            stepIdx++;

            // 2. Enable modules + entitlements
            markStep(stepIdx, 'running');
            await onboardingService.enableModules(tenant.id, formData.enabledModuleIds, formData.selectedEntitlementPaths);
            markStep(stepIdx, 'done');
            formData.enabledModuleIds.forEach((id) => logAction({ action: AUDIT_ACTIONS.MODULE_ENABLED, entity: AUDIT_ENTITIES.MODULE, entityId: id, metadata: { tenantId: tenant.id } }));
            stepIdx++;

            // 3. Configure email (only if enabled)
            if (needsEmail) {
                markStep(stepIdx, 'running');
                await onboardingService.configureEmail(tenant.id, formData.email);
                markStep(stepIdx, 'done');
                stepIdx++;
            }

            // 4. Configure SMS (only if enabled)
            if (needsSms) {
                markStep(stepIdx, 'running');
                await onboardingService.configureSms(tenant.id, formData.sms);
                markStep(stepIdx, 'done');
                stepIdx++;
            }

            // 5. Create tenant admin
            markStep(stepIdx, 'running');
            await onboardingService.createAdminUser(tenant.id, formData.admin);
            markStep(stepIdx, 'done');
            logAction({ action: AUDIT_ACTIONS.USER_CREATED, entity: AUDIT_ENTITIES.USER, metadata: { tenantId: tenant.id, role: 'BRAND_ADMIN', email: formData.admin.adminEmail } });
            stepIdx++;

            // 6. Finalize
            markStep(stepIdx, 'running');
            await onboardingService.finalizeOnboarding(tenant.id);
            markStep(stepIdx, 'done');

            // Done
            clearDraft();
            setSubmitted(true);
            logAction({ action: AUDIT_ACTIONS.ONBOARDING_COMPLETED, entity: AUDIT_ENTITIES.TENANT, entityId: tenant.id });
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Onboarding failed';
            setSubmitError(msg);
            logAction({ action: AUDIT_ACTIONS.ONBOARDING_FAILED, entity: AUDIT_ENTITIES.TENANT, metadata: { error: msg, brandName: formData.brand.brandName } });

            setOrchestrationSteps((prev) =>
                prev.map((s) =>
                    s.status === 'running' ? { ...s, status: 'error', error: msg } : s
                )
            );
        } finally {
            setSubmitting(false);
            submitAttempted.current = false;
        }
    }, [formData, markStep, needsEmail, needsSms]);

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
                    break;
                case 2:
                    // Entitlements — at least POS must be enabled
                    if (!formData.enabledModuleIds.includes('pos')) errors.push('POS module is required');
                    break;
                case 3:
                    // Email — only validated if step is active
                    if (needsEmail && formData.email.provider !== 'inherit' && !formData.email.senderEmail) {
                        errors.push('Sender email is required for custom providers');
                    }
                    break;
                case 4:
                    // SMS — only validated if step is active
                    if (needsSms && formData.sms.provider !== 'inherit' && !formData.sms.senderId) {
                        errors.push('Sender ID is required for custom providers');
                    }
                    break;
                case 5:
                    if (!formData.admin.adminName.trim()) errors.push('Admin name is required');
                    if (!formData.admin.adminEmail.trim()) errors.push('Admin email is required');
                    break;
                case 6:
                    // Review — no additional validation
                    break;
            }

            return { valid: errors.length === 0, errors };
        },
        [formData, needsEmail, needsSms]
    );

    const resetDraft = useCallback(() => {
        clearDraft();
        setFormData(createInitialFormData());
        setCurrentStep(1);
        setSubmitted(false);
        setCreatedTenantId(null);
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

        // Form data
        formData,
        updateBrand,
        updateAdmin,
        updateEmail,
        updateSms,
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
        resetDraft,
    };
}
