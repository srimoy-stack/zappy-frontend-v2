'use client';

import React from 'react';
import { Check, Circle, AlertCircle } from 'lucide-react';
import { WIZARD_STEPS, WizardStepId, StepStatus } from '../../../../types/wizard';
import { useWizardStore } from '../../../../state/wizardStore';
import { cn } from '@/utils';

export const ProgressStepper: React.FC = () => {
    const { currentStep, setCurrentStep, visitedSteps, stepValidations } = useWizardStore();

    const getStepIcon = (stepId: WizardStepId) => {
        const validation = stepValidations[stepId];
        const isVisited = visitedSteps.has(stepId);
        const isCurrent = currentStep === stepId;

        if (validation?.status === 'ERROR' && isVisited) {
            return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
        }
        if (validation?.status === 'VALID' && isVisited && !isCurrent) {
            return <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />;
        }
        return null;
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/60 min-w-fit">
                {WIZARD_STEPS.map((step, idx) => {
                    const isCurrent = currentStep === step.id;
                    const isVisited = visitedSteps.has(step.id);
                    const validation = stepValidations[step.id];
                    const isValid = validation?.status === 'VALID';
                    const hasError = validation?.status === 'ERROR' && isVisited;

                    return (
                        <React.Fragment key={step.id}>
                            {idx > 0 && (
                                <div className={cn(
                                    "w-4 h-[2px] rounded-full flex-shrink-0 transition-colors duration-300",
                                    isVisited && isValid ? "bg-emerald-300" :
                                    isVisited ? "bg-slate-300" : "bg-slate-200"
                                )} />
                            )}
                            <button
                                onClick={() => setCurrentStep(step.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all duration-200 outline-none flex-shrink-0 group relative",
                                    isCurrent
                                        ? "bg-white text-slate-950 shadow-sm border border-slate-200/80 scale-[1.02]"
                                        : isVisited
                                            ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                                            : "text-slate-400 hover:text-slate-500"
                                )}
                            >
                                {/* Step number badge */}
                                <span className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all flex-shrink-0",
                                    isCurrent ? "bg-slate-950 text-white" :
                                    hasError ? "bg-rose-100 text-rose-600" :
                                    isValid && isVisited ? "bg-emerald-100 text-emerald-700" :
                                    "bg-slate-100 text-slate-400"
                                )}>
                                    {getStepIcon(step.id) || step.number}
                                </span>

                                {/* Step label */}
                                <div className="text-left hidden lg:block">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-wider block leading-none",
                                        isCurrent ? "text-slate-950" : "text-slate-500"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>

                                {/* Active indicator */}
                                {isCurrent && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                                )}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
