'use client';

import React from 'react';
import { Layers, Percent, Leaf, Globe, Calendar } from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { StepHeader, StepCard } from '../shared/StepHeader';
import { FormField, SelectInput } from '../shared/FormField';
import { mockCategories } from '../../../../mock/items';
import { cn } from '@/utils';

const DIETARY_FLAGS = [
    { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
    { id: 'vegan', label: 'Vegan', emoji: '🌱' },
    { id: 'gluten-free', label: 'Gluten Free', emoji: '🌾' },
    { id: 'halal', label: 'Halal', emoji: '☪' },
    { id: 'contains-nuts', label: 'Contains Nuts', emoji: '🥜' },
    { id: 'dairy-free', label: 'Dairy Free', emoji: '🥛' },
    { id: 'keto', label: 'Keto Friendly', emoji: '🥑' },
    { id: 'organic', label: 'Organic', emoji: '🍃' },
];

const CHANNELS = [
    { id: 'POS', label: 'Point of Sale', desc: 'In-store register' },
    { id: 'ONLINE', label: 'Online Ordering', desc: 'Website & web app' },
    { id: 'KIOSK', label: 'Kiosk', desc: 'Self-service terminals' },
    { id: 'UBER', label: 'Uber Eats', desc: 'Marketplace' },
    { id: 'DOORDASH', label: 'DoorDash', desc: 'Marketplace' },
    { id: 'SKIP', label: 'SkipTheDishes', desc: 'Marketplace' },
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const CategoryMetadataStep: React.FC = () => {
    const { formData, updateFormData, stepValidations } = useWizardStore();
    const errors = stepValidations['CATEGORY_META']?.errors || [];

    const handleDayToggle = (day: string) => {
        const current = formData.availabilitySchedule;
        const currentDays = current?.days || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        updateFormData('availabilitySchedule', {
            days: newDays,
            timeStart: current?.timeStart || '00:00',
            timeEnd: current?.timeEnd || '23:59',
        });
    };

    return (
        <div className="space-y-6">
            <StepCard>
                <StepHeader
                    icon={<Layers className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Category & Taxonomy"
                    subtitle="Organizational placement within the menu structure"
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <FormField label="Primary Category" required error={errors.find(e => e.includes('category'))}>
                        <SelectInput value={formData.categoryId} onChange={(e) => updateFormData('categoryId', e.target.value)} hasError={!!errors.find(e => e.includes('category'))}>
                            <option value="">Select a category...</option>
                            {mockCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        </SelectInput>
                    </FormField>
                    <FormField label="Tax Rate (%)" required>
                        <div className="relative">
                            <Percent className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="number" step="0.01" min="0" max="100" value={formData.taxRate} onChange={(e) => updateFormData('taxRate', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-slate-900 outline-none transition-all pr-10" />
                        </div>
                    </FormField>
                </div>
            </StepCard>

            <StepCard>
                <StepHeader icon={<Leaf className="w-4.5 h-4.5 text-emerald-400" />} title="Dietary Information" subtitle="Help customers find products that match their dietary needs" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DIETARY_FLAGS.map(flag => {
                        const isActive = formData.dietaryFlags.includes(flag.id);
                        return (
                            <button key={flag.id} onClick={() => { const nf = isActive ? formData.dietaryFlags.filter(f => f !== flag.id) : [...formData.dietaryFlags, flag.id]; updateFormData('dietaryFlags', nf); }}
                                className={cn("flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all text-left", isActive ? "border-emerald-400 bg-emerald-50/50 shadow-sm" : "border-slate-150 hover:border-slate-300 bg-white")}>
                                <span className="text-lg">{flag.emoji}</span>
                                <span className={cn("text-[10px] font-black uppercase tracking-wider", isActive ? "text-emerald-700" : "text-slate-500")}>{flag.label}</span>
                            </button>
                        );
                    })}
                </div>
            </StepCard>

            <StepCard>
                <StepHeader icon={<Globe className="w-4.5 h-4.5 text-emerald-400" />} title="Channel Visibility" subtitle="Where this product will be available for ordering" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CHANNELS.map(ch => {
                        const isActive = formData.channelVisibility.includes(ch.id);
                        return (
                            <button key={ch.id} onClick={() => { const nc = isActive ? formData.channelVisibility.filter(c => c !== ch.id) : [...formData.channelVisibility, ch.id]; updateFormData('channelVisibility', nc); }}
                                className={cn("flex flex-col p-4 rounded-xl border-2 transition-all text-left", isActive ? "border-slate-950 bg-slate-50 shadow-sm" : "border-slate-150 hover:border-slate-300 bg-white")}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={cn("text-[10px] font-black uppercase tracking-wider", isActive ? "text-slate-950" : "text-slate-500")}>{ch.label}</span>
                                    <div className={cn("w-4 h-4 rounded-md border-2 flex items-center justify-center", isActive ? "border-emerald-500 bg-emerald-500" : "border-slate-300")}>
                                        {isActive && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{ch.desc}</span>
                            </button>
                        );
                    })}
                </div>
                {formData.channelVisibility.length === 0 && (<div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg"><span className="text-[9px] font-bold text-amber-700 uppercase tracking-tight">⚠ Product won't be visible on any channel</span></div>)}
            </StepCard>

            <StepCard>
                <StepHeader icon={<Calendar className="w-4.5 h-4.5 text-emerald-400" />} title="Availability Schedule" subtitle="Optional time-based availability restrictions" />
                <FormField label="Active Days" hint="Leave empty for always available">
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => {
                            const isActive = formData.availabilitySchedule?.days?.includes(day);
                            return (<button key={day} onClick={() => handleDayToggle(day)} className={cn("w-12 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border", isActive ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>{day}</button>);
                        })}
                    </div>
                </FormField>
                {formData.availabilitySchedule?.days && formData.availabilitySchedule.days.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <FormField label="Start Time">
                            <input type="time" value={formData.availabilitySchedule?.timeStart || '00:00'} onChange={(e) => updateFormData('availabilitySchedule', { ...formData.availabilitySchedule!, timeStart: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-slate-900 outline-none" />
                        </FormField>
                        <FormField label="End Time">
                            <input type="time" value={formData.availabilitySchedule?.timeEnd || '23:59'} onChange={(e) => updateFormData('availabilitySchedule', { ...formData.availabilitySchedule!, timeEnd: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-slate-900 outline-none" />
                        </FormField>
                    </div>
                )}
            </StepCard>
        </div>
    );
};
