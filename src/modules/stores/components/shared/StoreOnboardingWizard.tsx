'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
    Store as StoreIcon, ChevronLeft, ChevronRight, Loader2,
    Building2, Zap, Clock, Truck, ShoppingBag, CreditCard,
    CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/utils';
import type { CreateStoreDTO } from '@/shared/types/store';
import type { StoreWizardData } from './wizard/wizard.types';
import { DEFAULT_WIZARD_DATA } from './wizard/wizard.types';

import { WizardStepBasicInfo } from './wizard/WizardStepBasicInfo';
import { WizardStepServices } from './wizard/WizardStepServices';
import { WizardStepHours } from './wizard/WizardStepHours';
import { WizardStepDelivery } from './wizard/WizardStepDelivery';
import { WizardStepPickupDineIn } from './wizard/WizardStepPickupDineIn';
import { WizardStepPaymentsTax } from './wizard/WizardStepPaymentsTax';
import { WizardStepReview } from './wizard/WizardStepReview';
import {
    validateStoreName,
    validateStoreCode,
    validateStoreEmail,
    validateStorePhone,
    validateStoreAddress,
    validateStorePostalCode,
    validateCoordinates,
    validateDeliveryRadius
} from '../../utils/storeValidation';

// ─── Steps ──────────────────────────────────────────────────────────────────

const STEPS = [
    { id: 'basic', label: 'Store Info', icon: Building2, desc: 'Identity, address & contact' },
    { id: 'services', label: 'Services', icon: Zap, desc: 'Enable order channels' },
    { id: 'hours', label: 'Hours', icon: Clock, desc: 'Operating schedule' },
    { id: 'delivery', label: 'Delivery', icon: Truck, desc: 'Delivery rules & zones' },
    { id: 'pickup', label: 'Pickup & Dine-In', icon: ShoppingBag, desc: 'Pickup & dine-in config' },
    { id: 'payments', label: 'Payments & Tax', icon: CreditCard, desc: 'Payment, tax, tips & fees' },
    { id: 'review', label: 'Review', icon: CheckCircle2, desc: 'Confirm & create store' },
];

// ─── Validation ─────────────────────────────────────────────────────────────

function validateBasicInfo(d: StoreWizardData): Record<string, string> {
    const e: Record<string, string> = {};
    
    const nameErr = validateStoreName(d.name);
    if (nameErr) e.name = nameErr;

    const codeErr = validateStoreCode(d.code);
    if (codeErr) e.code = codeErr;

    const emailErr = validateStoreEmail(d.email);
    if (emailErr) e.email = emailErr;

    const phoneErr = validateStorePhone(d.phone);
    if (phoneErr) e.phone = phoneErr;

    const addressErr = validateStoreAddress(d.address);
    if (addressErr) e.address = addressErr;

    const postalErr = validateStorePostalCode(d.postalCode);
    if (postalErr) e.postalCode = postalErr;

    if (!d.city || d.city.trim().length < 2) e.city = 'City is required';
    if (!d.province) e.province = 'Province/State is required';
    if (!d.timezone) e.timezone = 'Timezone is required';

    if (d.latitude || d.longitude) {
        const coordErrors = validateCoordinates(d.latitude, d.longitude);
        if (coordErrors.latitude) e.latitude = coordErrors.latitude;
        if (coordErrors.longitude) e.longitude = coordErrors.longitude;
    }

    return e;
}

function validateServices(d: StoreWizardData): Record<string, string> {
    const e: Record<string, string> = {};
    if (!d.enablePickup && !d.enableDelivery && !d.enableDineIn && !d.enableKiosk) {
        e.services = 'At least one service channel must be enabled';
    }
    return e;
}

function validateHours(d: StoreWizardData): Record<string, string> {
    const e: Record<string, string> = {};
    if (!d.posOpen || !d.posClose) e.posHours = 'POS operating hours are required';
    if (d.posOpen && d.posClose && d.posOpen >= d.posClose) e.posHours = 'POS opening time must be before closing time';
    if (d.onlineOpen && d.onlineClose && d.onlineOpen >= d.onlineClose) e.onlineHours = 'Online opening must be before closing';
    return e;
}

function validateDelivery(d: StoreWizardData): Record<string, string> {
    const e: Record<string, string> = {};
    if (!d.enableDelivery) return e; // Skip if delivery not enabled
    
    const radiusErr = validateDeliveryRadius(d.deliveryRadius);
    if (radiusErr) e.deliveryRadius = radiusErr;

    const minOrder = parseFloat(d.deliveryMinOrder);
    if (isNaN(minOrder) || minOrder < 0) e.deliveryMinOrder = 'Minimum order must be ≥ $0';
    const baseFee = parseFloat(d.deliveryBaseFee);
    if (isNaN(baseFee) || baseFee < 0) e.deliveryBaseFee = 'Base fee must be ≥ $0';
    const estMin = parseInt(d.deliveryEstMinutes);
    if (isNaN(estMin) || estMin < 1 || estMin > 300) e.deliveryEstMinutes = 'Estimated time must be 1–300 minutes';
    return e;
}

function validatePickupDineIn(d: StoreWizardData): Record<string, string> {
    const e: Record<string, string> = {};
    if (d.enablePickup) {
        const prep = parseInt(d.pickupPrepTime);
        if (isNaN(prep) || prep < 1 || prep > 120) e.pickupPrepTime = 'Prep time must be 1–120 minutes';
        const slot = parseInt(d.pickupSlotDuration);
        if (isNaN(slot) || slot < 5 || slot > 60) e.pickupSlotDuration = 'Slot duration must be 5–60 minutes';
    }
    return e;
}

function validatePaymentsTax(d: StoreWizardData): Record<string, string> {
    const e: Record<string, string> = {};
    if (d.taxProfile === 'Override' && d.taxRules.length === 0) {
        e.taxRules = 'At least one tax rule is required in Override mode';
    }
    if (d.taxProfile === 'Override') {
        for (const rule of d.taxRules) {
            const rate = parseFloat(rule.rate);
            if (isNaN(rate) || rate < 0 || rate > 50) {
                e.taxRules = `Tax rate for "${rule.name || rule.type}" must be 0–50%`;
                break;
            }
        }
    }
    if (d.tipsEnabled) {
        const presets = d.tipPresets.split(',').map(v => v.trim()).filter(Boolean);
        if (presets.length === 0) e.tipPresets = 'At least one tip preset is required';
        for (const p of presets) {
            const n = parseFloat(p);
            if (isNaN(n) || n < 0 || n > 100) { e.tipPresets = 'Tip presets must be 0–100%'; break; }
        }
        if (d.autoGratuityEnabled) {
            const minParty = parseInt(d.autoGratuityMinParty);
            if (isNaN(minParty) || minParty < 1) e.autoGratuityMinParty = 'Min party size must be ≥ 1';
            const pct = parseFloat(d.autoGratuityPercent);
            if (isNaN(pct) || pct < 0 || pct > 30) e.autoGratuityPercent = 'Auto gratuity must be 0–30%';
        }
    }
    for (const fee of d.feeRules) {
        const val = parseFloat(fee.value);
        if (isNaN(val) || val < 0) {
            e.feeRules = `Fee value for "${fee.type}" must be ≥ 0`;
            break;
        }
    }
    return e;
}

const STEP_VALIDATORS = [
    validateBasicInfo,
    validateServices,
    validateHours,
    validateDelivery,
    validatePickupDineIn,
    validatePaymentsTax,
    () => ({}), // Review — no validation
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface StoreOnboardingWizardProps {
    tenantId: string;
    onCancel: () => void;
    onSubmit: (dto: CreateStoreDTO) => Promise<void>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function StoreOnboardingWizard({ tenantId, onCancel, onSubmit }: StoreOnboardingWizardProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<StoreWizardData>(DEFAULT_WIZARD_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const update = useCallback((field: keyof StoreWizardData, value: any) => {
        setData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'name') {
                // Dynamic slugification to generate high-quality store codes
                next.code = value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
            }
            return next;
        });
        setErrors(prev => {
            const n = { ...prev };
            delete n[field];
            if (field === 'name') delete n.code;
            return n;
        });
    }, []);

    const validateStep = (): boolean => {
        const validator = STEP_VALIDATORS[step];
        const errs = validator ? validator(data) : {};
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const goNext = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
    const goBack = () => { if (step === 0) onCancel(); else setStep(s => s - 1); };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const dto: CreateStoreDTO = {
                name: data.name.trim(),
                storeName: data.name.trim(),
                storeCode: data.code.trim() || undefined,
                businessType: data.businessType,
                address: data.address.trim() || undefined,
                addressLine1: data.address.trim() || undefined,
                city: data.city.trim(),
                province: data.province,
                postalCode: data.postalCode.trim() || undefined,
                country: data.country || 'Canada',
                timezone: data.timezone,
                phone: data.phone.trim() || undefined,
                secondaryPhone: data.secondaryPhone.trim() || undefined,
                email: data.email.trim() || undefined,
                website: data.website.trim() || undefined,
                latitude: data.latitude ? parseFloat(data.latitude) : undefined,
                longitude: data.longitude ? parseFloat(data.longitude) : undefined,

                managerId: null as any,
                ownerId: user?.id ? parseInt(user.id) : null as any,

                // Services / Channels
                enablePickup: data.enablePickup,
                enableDelivery: data.enableDelivery,
                enableDinein: data.enableDineIn,
                enableKiosk: data.enableKiosk,

                // Hours preset/schedule
                posOpeningTime: data.posOpen,
                posClosingTime: data.posClose,
                onlineOpeningTime: data.onlineOpen,
                onlineClosingTime: data.onlineClose,

                // Operating Hours schedule
                operatingHours: data.posOpen && data.posClose ? {
                    pos: [
                        { day: 'Monday', openTime: data.posOpen, closeTime: data.posClose, isOpen: true },
                        { day: 'Tuesday', openTime: data.posOpen, closeTime: data.posClose, isOpen: true },
                        { day: 'Wednesday', openTime: data.posOpen, closeTime: data.posClose, isOpen: true },
                        { day: 'Thursday', openTime: data.posOpen, closeTime: data.posClose, isOpen: true },
                        { day: 'Friday', openTime: data.posOpen, closeTime: data.posClose, isOpen: true },
                        { day: 'Saturday', openTime: data.posOpen, closeTime: data.posClose, isOpen: true },
                        { day: 'Sunday', openTime: data.posOpen, closeTime: data.posClose, isOpen: true }
                    ]
                } : undefined,

                // Delivery Configuration
                deliveryRadiusKm: data.enableDelivery ? (parseFloat(data.deliveryRadius) || 5) : undefined,
                deliveryProvider: data.deliveryProvider,
                deliveryMinOrderAmount: parseFloat(data.deliveryMinOrder) || 0,
                deliveryBaseFee: parseFloat(data.deliveryBaseFee) || 0,
                freeDeliveryOverAmount: parseFloat(data.deliveryFreeThreshold) || 0,
                deliveryEstimatedMinutes: parseInt(data.deliveryEstMinutes) || 0,

                // Pickup & Dine-in Details
                pickupDineinConfig: {
                    pickup_prep_time_minutes: parseInt(data.pickupPrepTime) || 15,
                    pickup_slot_duration_minutes: parseInt(data.pickupSlotDuration) || 15,
                    pickup_curbside_enabled: data.pickupCurbside,
                    pickup_instructions: data.pickupInstructions,
                    dine_in_qr_ordering: data.dineInQR,
                    dine_in_table_service: data.dineInTableService,
                    dine_in_reservation: data.dineInReservation,
                    dine_in_waitlist: data.dineInWaitlist
                },

                // Payments
                paymentProvider: data.paymentProvider || 'moneris',
                tipsEnabled: data.tipsEnabled,
                refundsEnabled: data.refundEnabled,
                splitPaymentsEnabled: data.splitPayment,

                // Tax Configuration
                taxInheritBrand: data.taxProfile === 'Inherit',
                taxOverrideEnabled: data.taxProfile === 'Override',
                taxConfig: data.taxProfile === 'Override' && data.taxRules.length > 0 ? {
                    rules: data.taxRules.map(r => ({
                        name: r.name,
                        type: r.type,
                        rate: parseFloat(r.rate) || 0,
                        mode: r.mode,
                        channel_scope: r.channelScope,
                        priority: r.priority
                    }))
                } : {},

                // Tip Presets & Auto Gratuity
                tipPresets: data.tipPresets.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v)),
                tipCalculationMode: data.tipCalcMode,
                autoGratuityEnabled: data.autoGratuityEnabled,

                // Fee rules
                feeRules: data.feeRules.map(f => ({
                    name: f.name,
                    type: f.type,
                    method: f.method,
                    value: parseFloat(f.value) || 0,
                    taxable: f.taxable,
                    refundable: f.refundable,
                    enabled: f.enabled
                })),

                paymentTerms: data.paymentTerms,
                status: 'Draft',
            };
            await onSubmit(dto);
        } catch { /* caller handles */ } finally { setIsSubmitting(false); }
    };

    const currentStep = STEPS[step] as (typeof STEPS)[number];
    const progress = ((step + 1) / STEPS.length) * 100;


    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-400 space-y-8">
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                            <StoreIcon size={17} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">New Store Setup</h2>
                            <p className="text-[12px] text-slate-500 mt-0.5">
                                Step {step + 1} of {STEPS.length} — {currentStep.label}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[13px] text-slate-500 hidden md:block">
                        {data.name || 'Untitled Store'}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-semibold uppercase border border-amber-200">
                        Draft
                    </span>
                </div>
            </div>

            {/* ── Progress Steps ───────────────────────────────────────── */}
            <div className="hidden lg:block bg-white border border-slate-200 rounded-xl overflow-hidden">
                <nav aria-label="Progress">
                    <ol role="list" className="flex w-full">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const done = i < step;
                            const active = i === step;
                            const isLast = i === STEPS.length - 1;
                            return (
                                <li key={s.id} className={cn("relative flex-1", !isLast && "border-r border-slate-100")}>
                                    <button
                                        onClick={() => { if (i < step) setStep(i); }}
                                        disabled={i > step}
                                        className={cn(
                                            "flex items-center justify-center gap-2.5 w-full py-4 px-3 text-center transition-colors outline-none focus:outline-none focus-visible:bg-slate-50 disabled:cursor-default",
                                            active ? "bg-slate-50" : "bg-white hover:bg-slate-50/50"
                                        )}
                                    >
                                        <span className={cn(
                                            "flex h-7 w-7 items-center justify-center rounded-lg border transition-all shrink-0",
                                            active ? "bg-slate-900 border-slate-900 text-white" :
                                                done ? "bg-emerald-50 border-emerald-400 text-emerald-600" :
                                                    "border-slate-200 text-slate-400 bg-white"
                                        )}>
                                            {done ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                                        </span>
                                        <span className={cn(
                                            "text-[11px] font-medium whitespace-nowrap hidden xl:block",
                                            active ? "text-slate-900" : done ? "text-emerald-700" : "text-slate-400"
                                        )}>
                                            {s.label}
                                        </span>
                                    </button>
                                    {active && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500" />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            </div>



            {/* ── Content Card ─────────────────────────────────────────── */}
            <div className="w-full bg-white border border-slate-200 rounded-xl">
                {/* Step Header */}
                <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900">{currentStep.label}</h3>
                    <p className="text-[13px] text-slate-500 mt-1">{currentStep.desc}</p>
                </div>

                {/* Step Content */}
                <div className="px-8 py-8">
                    {step === 0 && <WizardStepBasicInfo data={data} errors={errors} update={update} isEdit={false} />}
                    {step === 1 && <WizardStepServices data={data} update={update} />}
                    {step === 2 && <WizardStepHours data={data} update={update} />}
                    {step === 3 && <WizardStepDelivery data={data} update={update} />}
                    {step === 4 && <WizardStepPickupDineIn data={data} update={update} />}
                    {step === 5 && <WizardStepPaymentsTax data={data} update={update} />}
                    {step === 6 && <WizardStepReview data={data} />}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 bg-slate-50/40 rounded-b-xl">
                    <button onClick={goBack}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
                        <ChevronLeft size={14} />
                        {step === 0 ? 'Cancel' : 'Back'}
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Mobile/Tablet dot indicators */}
                        <div className="flex items-center gap-1.5 lg:hidden">
                            {STEPS.map((_, i) => (
                                <div key={i} className={cn('h-1.5 rounded-full transition-all',
                                    i === step ? 'w-5 bg-slate-900' : i < step ? 'w-1.5 bg-emerald-400' : 'w-1.5 bg-slate-200'
                                )} />
                            ))}
                        </div>

                        {step < STEPS.length - 1 ? (
                            <button onClick={goNext}
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
                                Next <ChevronRight size={14} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting}
                                className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 text-white rounded-lg text-[13px] font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                {isSubmitting ? 'Creating…' : 'Create Store'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
