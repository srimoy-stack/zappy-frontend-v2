'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    X, ChevronLeft, ChevronRight, Loader2, Store as StoreIcon, Pencil,
    Building2, MapPin, Clock, Truck, ShoppingBag, CreditCard, Receipt,
    CheckCircle2, Zap,
} from 'lucide-react';
import { cn } from '@/utils';
import type { Store, CreateStoreDTO } from '@/shared/types/store';
import type { StoreWizardData } from './wizard/wizard.types';
import { DEFAULT_WIZARD_DATA } from './wizard/wizard.types';

import { WizardStepBasicInfo } from './wizard/WizardStepBasicInfo';
import { WizardStepServices } from './wizard/WizardStepServices';
import { WizardStepHours } from './wizard/WizardStepHours';
import { WizardStepDelivery } from './wizard/WizardStepDelivery';
import { WizardStepPickupDineIn } from './wizard/WizardStepPickupDineIn';
import { WizardStepPaymentsTax } from './wizard/WizardStepPaymentsTax';
import { WizardStepReview } from './wizard/WizardStepReview';

// ─── Step Config ────────────────────────────────────────────────────────────

const STEPS = [
    { id: 'basic', label: 'Store Info', icon: Building2 },
    { id: 'services', label: 'Services', icon: Zap },
    { id: 'hours', label: 'Hours', icon: Clock },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'pickup', label: 'Pickup & Dine-In', icon: ShoppingBag },
    { id: 'payments', label: 'Payments & Tax', icon: CreditCard },
    { id: 'review', label: 'Review', icon: CheckCircle2 },
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface StoreFormModalProps {
    store: Store | null;
    tenantId: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (dto: CreateStoreDTO, storeId?: string) => Promise<void>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function StoreFormModal({ store, tenantId, isOpen, onClose, onSubmit }: StoreFormModalProps) {
    const isEdit = !!store;
    const [step, setStep] = useState(0);
    const [data, setData] = useState<StoreWizardData>(DEFAULT_WIZARD_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;
        setStep(0);
        setErrors({});
        if (store) {
            setData({
                ...DEFAULT_WIZARD_DATA,
                name: store.name || '', code: store.code || '',
                businessType: store.businessType || 'single_store',
                address: store.address || '', city: store.city || '',
                province: store.province || 'Ontario', postalCode: store.postalCode || '',
                timezone: store.timezone || 'America/Toronto',
                phone: store.phone || '', email: store.email || '',
                website: store.website || '',
                latitude: store.latitude ? String(store.latitude) : '',
                longitude: store.longitude ? String(store.longitude) : '',
                deliveryRadius: String(store.deliveryRadiusKm || 5),
            });
        } else {
            setData(DEFAULT_WIZARD_DATA);
        }
    }, [isOpen, store]);

    const update = useCallback((field: keyof StoreWizardData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }, []);

    const validateStep = (): boolean => {
        const errs: Record<string, string> = {};
        if (step === 0) {
            if (!data.name || data.name.length < 3) errs.name = 'Name must be at least 3 characters';
            if (!isEdit && (!data.code || !/^[A-Z0-9-]{2,10}$/.test(data.code))) errs.code = '2-10 chars, uppercase + numbers + dashes';
            if (!data.city) errs.city = 'City is required';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const goNext = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
    const goBack = () => setStep(s => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const dto: CreateStoreDTO = {
                name: data.name, code: data.code, city: data.city,
                province: data.province, address: data.address || undefined,
                postalCode: data.postalCode || undefined, timezone: data.timezone,
                phone: data.phone || undefined, email: data.email || undefined,
                deliveryRadiusKm: parseFloat(data.deliveryRadius) || 5,
                latitude: parseFloat(data.latitude) || undefined,
                longitude: parseFloat(data.longitude) || undefined,
                paymentTerms: data.paymentTerms,
                taxSetup: data.taxProfile === 'Override' ? { scheme: data.taxScheme, rate: parseFloat(data.taxRate) || 0 } : undefined,
            };
            await onSubmit(dto, store?.id);
            onClose();
        } catch { /* caller handles */ } finally { setIsSubmitting(false); }
    };

    if (!isOpen) return null;

    const currentStep = STEPS[step] || STEPS[0];
    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="px-8 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                                isEdit ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                            )}>
                                {isEdit ? <Pencil size={18} /> : <StoreIcon size={18} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    {isEdit ? 'Edit Store' : 'New Store Setup'}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Step {step + 1} of {STEPS.length} — {currentStep.label}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                            <X size={18} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }} />
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const done = i < step;
                            const active = i === step;
                            return (
                                <button key={s.id} onClick={() => i < step && setStep(i)}
                                    disabled={i > step}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap',
                                        active ? 'bg-slate-900 text-white' :
                                        done ? 'bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100' :
                                        'bg-slate-50 text-slate-300 cursor-not-allowed'
                                    )}>
                                    {done ? <CheckCircle2 size={10} /> : <Icon size={10} />}
                                    {s.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {step === 0 && <WizardStepBasicInfo data={data} errors={errors} update={update} isEdit={isEdit} />}
                    {step === 1 && <WizardStepServices data={data} update={update} />}
                    {step === 2 && <WizardStepHours data={data} update={update} />}
                    {step === 3 && <WizardStepDelivery data={data} update={update} />}
                    {step === 4 && <WizardStepPickupDineIn data={data} update={update} />}
                    {step === 5 && <WizardStepPaymentsTax data={data} update={update} />}
                    {step === 6 && <WizardStepReview data={data} />}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
                    <button onClick={step === 0 ? onClose : goBack}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all">
                        <ChevronLeft size={14} />
                        {step === 0 ? 'Cancel' : 'Back'}
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button onClick={goNext}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
                            Next <ChevronRight size={14} />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all disabled:opacity-50">
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            {isSubmitting ? 'Creating...' : isEdit ? 'Save Changes' : 'Create Store'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
