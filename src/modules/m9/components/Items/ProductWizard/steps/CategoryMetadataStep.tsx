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
                    title="Category"
                    subtitle="Organizational placement within the menu structure"
                />
                <div className="max-w-md">
                    <FormField label="Primary Category" required error={errors.find(e => e.includes('category'))}>
                        <SelectInput value={formData.categoryId} onChange={(e) => updateFormData('categoryId', e.target.value)} hasError={!!errors.find(e => e.includes('category'))}>
                            <option value="">Select a category...</option>
                            {mockCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        </SelectInput>
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
