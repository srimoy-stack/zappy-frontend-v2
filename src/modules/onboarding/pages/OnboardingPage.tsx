'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, ChevronRight, Loader2, Rocket, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { STEP_CONFIG } from '../types/onboarding.types';
import { BrandStep } from '../components/BrandStep';
import { ModuleStep } from '../components/ModuleStep';
import { EmailConfigStep } from '../components/EmailConfigStep';
import { SmsConfigStep } from '../components/SmsConfigStep';
import { VapiConfigStep } from '../components/VapiConfigStep';
import { HostingConfigStep } from '../components/HostingConfigStep';
import { AdminStep } from '../components/AdminStep';
import { ReviewStep } from '../components/ReviewStep';

/**
 * Dynamic step wizard:
 *   1. Brand Identity (always)
 *   2. Entitlements (always)
 *   8. Hosting Details (only if online-ordering enabled)
 *   3. Email Config (only if email-campaigns enabled)
 *   4. SMS Config (only if email-campaigns enabled — optional)
 *   5. AI Call Config (only if ai-call-analytics enabled)
 *   6. Tenant Admin (always)
 *   7. Review (always)
 *
 * Steps 3–8 auto-skip if the brand doesn’t need them.
 * Validation is enforced before advancing to the next step.
 */

export function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resumeId = searchParams.get('resume');
    const flow = useOnboardingFlow(resumeId);

    // Show loading while resuming a draft tenant
    if (flow.resumeLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                    <span className="text-sm font-black text-slate-500">Loading draft tenant data...</span>
                </div>
            </div>
        );
    }

    // Active step config for progress bar
    const activeStepConfig = STEP_CONFIG.filter(s => flow.activeSteps.includes(s.id));

    // Determine next button label dynamically
    const getNextLabel = (): string => {
        const nextIdx = flow.currentStepIndex + 1;
        if (nextIdx >= flow.activeSteps.length) return 'Review & Submit';
        const nextStepId = flow.activeSteps[nextIdx];
        const nextConfig = STEP_CONFIG.find(s => s.id === nextStepId);
        return nextConfig?.title || 'Next';
    };

    const isLastStep = flow.currentStepIndex === flow.activeSteps.length - 1;

    // ── Submission Overlay ───────────────────────────────────────────────────
    // Show overlay while submitting, after success, OR when there's an error to display
    if (flow.submitting || flow.submitted || flow.submitError) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white p-12 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-100">
                    {!flow.submitted ? (
                        <div className="space-y-10">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">Provisioning Brand</h2>
                                <p className="text-xs text-slate-400 font-medium">Running orchestration pipeline...</p>
                            </div>
                            <div className="space-y-3">
                                {flow.orchestrationSteps.map((step, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                                        step.status === 'done' ? 'bg-emerald-50 border-emerald-200' :
                                        step.status === 'running' ? 'bg-blue-50 border-blue-200' :
                                        step.status === 'error' ? 'bg-red-50 border-red-200' :
                                        'bg-slate-50 border-slate-100'
                                    }`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                            step.status === 'done' ? 'bg-emerald-500 text-white' :
                                            step.status === 'running' ? 'bg-blue-500 text-white' :
                                            step.status === 'error' ? 'bg-red-500 text-white' :
                                            'bg-slate-200 text-slate-400'
                                        }`}>
                                            {step.status === 'done' ? <Check className="w-3.5 h-3.5" /> :
                                             step.status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                                             step.status === 'error' ? <span className="text-xs font-black">!</span> :
                                             <span className="text-[10px] font-black">{i + 1}</span>}
                                        </div>
                                        <span className={`text-xs font-bold ${
                                            step.status === 'done' ? 'text-emerald-700' :
                                            step.status === 'running' ? 'text-blue-700' :
                                            step.status === 'error' ? 'text-red-700' :
                                            'text-slate-400'
                                        }`}>{step.label}</span>
                                    </div>
                                ))}
                            </div>
                            {flow.submitError && (
                                <div className="p-5 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Provisioning Failed</p>
                                    <p className="text-xs font-bold text-red-700 leading-relaxed break-words">{flow.submitError}</p>
                                    <div className="flex gap-3 pt-1">
                                        <button
                                            onClick={flow.handleSubmit}
                                            disabled={flow.submitting}
                                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Retry from Failed Step
                                        </button>
                                        <button
                                            onClick={flow.resetDraft}
                                            className="px-6 py-2.5 bg-white text-slate-600 rounded-xl text-xs font-black border border-slate-200 hover:bg-slate-50 transition-colors"
                                        >
                                            Start Over
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-100">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900">Brand Provisioned!</h2>
                                <p className="text-sm text-slate-500 font-medium">All systems configured. The Tenant Admin can now log in and complete operational setup.</p>
                            </div>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => router.push('/platform/tenants')}
                                    className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    <Rocket className="w-5 h-5" />
                                    Go to Brands
                                </button>
                                <button
                                    onClick={flow.resetDraft}
                                    className="px-8 py-4 bg-white text-slate-600 rounded-2xl text-sm font-black border border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    Add Another
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Main Wizard ──────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
                    <button onClick={() => router.push('/platform/tenants')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                        <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight">Brand Onboarding</h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Provisioning Wizard</p>
                    </div>
                </div>

                {/* Dynamic progress bar — only active steps shown */}
                <div className="max-w-4xl mx-auto px-6 pb-4 pt-1">
                    <div className="flex items-center">
                        {activeStepConfig.map((step, idx) => {
                            const stepPosition = flow.activeSteps.indexOf(step.id);
                            const isCompleted = flow.currentStepIndex > stepPosition;
                            const isCurrent = flow.currentStep === step.id;

                            return (
                                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center gap-1.5 relative">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all shrink-0 ${
                                            isCompleted
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : isCurrent
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200'
                                                    : 'bg-white border-slate-200 text-slate-400'
                                        }`}>
                                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                        </div>
                                        <p className={`text-[8px] font-black uppercase tracking-wide leading-none transition-colors whitespace-nowrap ${
                                            isCurrent ? 'text-slate-900' :
                                            isCompleted ? 'text-emerald-600' : 'text-slate-400'
                                        }`}>{step.title}</p>
                                    </div>
                                    {idx < activeStepConfig.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-1.5 rounded-full transition-colors mt-[-18px] ${
                                            isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="max-w-3xl mx-auto">
                    {flow.currentStep === 1 && <BrandStep data={flow.formData.brand} onChange={flow.updateBrand} />}
                    {flow.currentStep === 2 && (
                        <ModuleStep
                            selectedPaths={flow.formData.selectedEntitlementPaths}
                            onUpdatePaths={flow.updateEntitlementPaths}
                        />
                    )}
                    {flow.currentStep === 3 && flow.needsEmail && (
                        <EmailConfigStep
                            email={flow.formData.email}
                            onUpdate={flow.updateEmail}
                        />
                    )}
                    {flow.currentStep === 4 && flow.needsSms && (
                        <SmsConfigStep
                            sms={flow.formData.sms}
                            onUpdate={flow.updateSms}
                        />
                    )}
                    {flow.currentStep === 5 && flow.needsVapi && (
                        <VapiConfigStep
                            vapi={flow.formData.vapi}
                            onUpdate={flow.updateVapi}
                        />
                    )}
                    {flow.currentStep === 8 && flow.needsHosting && (
                        <HostingConfigStep
                            hosting={flow.formData.hosting}
                            onUpdate={flow.updateHosting}
                        />
                    )}
                    {flow.currentStep === 6 && <AdminStep data={flow.formData.admin} onChange={flow.updateAdmin} />}
                    {flow.currentStep === 7 && (
                        <ReviewStep
                            data={flow.formData}
                            onGoToStep={flow.goToStep}
                            needsEmail={flow.needsEmail}
                            needsSms={flow.needsSms}
                            needsVapi={flow.needsVapi}
                            needsHosting={flow.needsHosting}
                        />
                    )}

                    {/* Validation Errors */}
                    {flow.stepErrors.length > 0 && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-red-800">Please fix the following before continuing:</p>
                                    <ul className="space-y-0.5">
                                        {flow.stepErrors.map((err, i) => (
                                            <li key={i} className="text-[11px] text-red-600 font-medium flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                                {err}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-8 mt-12 flex items-center justify-end gap-4 border-t border-slate-200">
                        {flow.currentStepIndex > 0 && (
                            <button onClick={flow.prevStep} className="px-8 py-4 bg-white text-slate-600 rounded-2xl text-sm font-black border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]">
                                Back
                            </button>
                        )}
                        {!isLastStep ? (
                            <button onClick={flow.nextStep} className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 flex items-center gap-2 group">
                                {getNextLabel()}
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button onClick={flow.handleSubmit} className="px-12 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-2xl shadow-emerald-100 flex items-center gap-2 group">
                                <Rocket className="w-5 h-5" />
                                Deploy Brand
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
