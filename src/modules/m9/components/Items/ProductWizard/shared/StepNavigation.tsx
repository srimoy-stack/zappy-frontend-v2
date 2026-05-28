'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Save, Rocket, Check } from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { WIZARD_STEPS } from '../../../../types/wizard';
import { cn } from '@/utils';

interface StepNavigationProps {
    onSaveDraft: () => void;
    onPublish: () => void;
    onUpdateStep: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({ onSaveDraft, onPublish, onUpdateStep }) => {
    const {
        currentStep, goToNextStep, goToPrevStep, canProceed,
        validateStep, isSubmitting, isDirty, formData, editingItemId
    } = useWizardStore();

    const [justSaved, setJustSaved] = React.useState(false);

    const enabledSteps = WIZARD_STEPS.filter(step => {
        if (step.id === 'VARIANTS' && !formData.enableVariants) return false;
        if (step.id === 'MODIFIERS' && !formData.enableModifiers) return false;
        if (step.id === 'ADDONS' && !formData.enableAddons) return false;
        return true;
    });

    const currentIdx = enabledSteps.findIndex(s => s.id === currentStep);
    const isFirst = currentIdx === 0;
    const isLast = currentIdx === enabledSteps.length - 1;

    const handleNext = () => {
        const result = validateStep(currentStep);
        if (result.errors.length === 0) {
            goToNextStep();
        }
    };

    const handleUpdate = () => {
        onUpdateStep();
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
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
                {/* Visual feedback */}
                {justSaved && (
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                        Saved!
                    </span>
                )}

                {/* Auto-save indicator */}
                {isDirty && !justSaved && (
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5 animate-in fade-in duration-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Unsaved changes
                    </span>
                )}

                {/* Save & Close (Saves draft and closes wizard) */}
                <button
                    onClick={onSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                    title="Save draft and exit"
                >
                    Save & Close
                </button>

                {/* Update Step / Save Changes - active only when changes are made */}
                <button
                    onClick={handleUpdate}
                    disabled={isSubmitting || !isDirty}
                    className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                        isDirty
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 active:scale-95"
                            : "bg-slate-50 text-slate-350 border-slate-200 cursor-not-allowed shadow-none"
                    )}
                    title={isDirty ? "Save changes to this step immediately" : "No changes to save"}
                >
                    <Save className={cn("w-3.5 h-3.5", isDirty ? "text-emerald-100 animate-pulse" : "text-slate-300")} />
                    {editingItemId ? 'Update Product' : 'Save Progress'}
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
