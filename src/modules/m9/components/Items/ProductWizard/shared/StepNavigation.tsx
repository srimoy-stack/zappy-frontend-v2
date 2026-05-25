'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Save, Rocket } from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { WIZARD_STEPS } from '../../../../types/wizard';
import { cn } from '@/utils';

interface StepNavigationProps {
    onSaveDraft: () => void;
    onPublish: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({ onSaveDraft, onPublish }) => {
    const {
        currentStep, goToNextStep, goToPrevStep, canProceed,
        validateStep, isSubmitting, isDirty
    } = useWizardStore();

    const currentIdx = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    const isFirst = currentIdx === 0;
    const isLast = currentIdx === WIZARD_STEPS.length - 1;

    const handleNext = () => {
        const result = validateStep(currentStep);
        if (result.errors.length === 0) {
            goToNextStep();
        }
    };

    return (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
            {/* Left side: Back */}
            <div>
                {!isFirst && (
                    <button
                        onClick={goToPrevStep}
                        className="flex items-center gap-2 px-5 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Previous
                    </button>
                )}
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-3">
                {/* Auto-save indicator */}
                {isDirty && (
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Unsaved changes
                    </span>
                )}

                {/* Save Draft - always visible */}
                <button
                    onClick={onSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                >
                    <Save className="w-3.5 h-3.5 text-slate-400" />
                    Save Draft
                </button>

                {/* Next or Publish */}
                {isLast ? (
                    <button
                        onClick={onPublish}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                        {isSubmitting ? 'Publishing...' : 'Publish Product'}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Continue
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                )}
            </div>
        </div>
    );
};
