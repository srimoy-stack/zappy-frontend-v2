'use client';

import React, { useState } from 'react';
import { 
    ChevronLeft, Check, Sparkles, AlertTriangle, Layers,
    Plus, Trash2, Settings2, Lock, Unlock, RefreshCw,
    Server, Star, Flame, Building2, ShoppingCart, Info, CheckCircle2,
    Calendar, ShieldCheck, Database, HelpCircle
} from 'lucide-react';
import { Item, Category, ItemVariant, ModifierOption } from '../../types/items';
import { useCatalogStore } from '../../state/catalogStore';
import { useModifierPoolStore } from '../../state/modifierPoolStore';
import { PricingEngine } from '../../engines/PricingEngine';
import { OverrideResolver } from '../../engines/OverrideResolver';
import { RuleInterpreter } from '../../engines/RuleInterpreter';
import { cn } from '@/utils';

interface ItemEditScreenProps {
    item: Item | null;
    onClose: () => void;
    categories: Category[];
}

type StepId = 'BASICS' | 'STRUCTURE' | 'VARIANTS' | 'MODIFIERS' | 'SIMULATION' | 'OVERRIDES' | 'PUBLISH';

export const ItemEditScreen: React.FC<ItemEditScreenProps> = ({ item, onClose, categories }) => {
    const { updateItem, createItem, isLoading, publishDraft } = useCatalogStore();
    const { pools } = useModifierPoolStore();

    // 1. Core Composition Draft State
    const [formData, setFormData] = useState<Item>(() => {
        if (item) return JSON.parse(JSON.stringify(item));
        return {
            id: 'temp-' + Date.now(),
            productType: 'SINGLE',
            name: '',
            description: '',
            categoryId: categories[0]?.id || '',
            isAvailable: true,
            taxRate: 5.0,
            variantGroups: [
                {
                    id: 'vg-size-' + Date.now(),
                    name: 'Size',
                    isRequired: true,
                    defaultVariantId: 'v-sm',
                    sortOrder: 1,
                    variants: [
                        { id: 'v-sm', name: 'Small (10")', basePrice: 9.99, isAvailable: true },
                        { id: 'v-med', name: 'Medium (12")', basePrice: 12.99, isAvailable: true },
                        { id: 'v-lg', name: 'Large (14")', basePrice: 15.99, isAvailable: true }
                    ]
                }
            ],
            modifierGroups: [],
            storeOverrides: [],
            storeOverridesResolver: [],
            equivalencyRules: [
                {
                    id: 'eq-paneer',
                    name: 'Paneer Equivalency',
                    targetId: 'opt-paneer',
                    multiplier: 2.0,
                    impactType: 'SELECTION_COUNT'
                }
            ]
        };
    });

    const [activeStep, setActiveStep] = useState<StepId>('BASICS');
    const [selectedPreviewVariantId, setSelectedPreviewVariantId] = useState<string>(
        formData.variantGroups[0]?.variants[0]?.id || ''
    );
    const [selectedPreviewModifiers, setSelectedPreviewModifiers] = useState<ModifierOption[]>([]);
    const [halfHalfToppingMap, setHalfHalfToppingMap] = useState<Record<string, 'WHOLE' | 'LEFT' | 'RIGHT'>>({});
    
    // UI Helpers
    const [newVariantName, setNewVariantName] = useState('');
    const [newVariantPrice, setNewVariantPrice] = useState('');

    // Combo Composition slot configurations state
    const [comboSlots, setComboSlots] = useState([
        { id: 'slot-1', name: 'Pizza Core Component', allowedCategory: 'cat-pizza', selectedItemId: 'test-pizza-1' },
        { id: 'slot-2', name: 'Complementary Side', allowedCategory: 'cat-sides', selectedItemId: 'test-sides-1' },
        { id: 'slot-3', name: 'Beverage Refreshment', allowedCategory: 'cat-drinks', selectedItemId: 'test-drinks-1' }
    ]);

    const steps = [
        { id: 'BASICS', label: '1. Product Basics', desc: 'Core name, tags, tax profiles' },
        { id: 'STRUCTURE', label: '2. Product Structure', desc: 'Single item vs Combo bundles' },
        { id: 'VARIANTS', label: '3. Sizing & Costs', desc: 'Variant price matrices' },
        { id: 'MODIFIERS', label: '4. Modifier Pools', desc: 'Toppings, half-half rules' },
        { id: 'SIMULATION', label: '5. Live Simulator', desc: 'POS checkout receipts testing' },
        { id: 'OVERRIDES', label: '6. Store Overrides', desc: 'Outlet specific price custom rules' },
        { id: 'PUBLISH', label: '7. Publishing & Sync', desc: 'Deploy pipelines and channels' }
    ] as const;

    // Pricing preview calculation engine integration
    const resolvedBasePrice = PricingEngine.calculateBasePrice(formData, selectedPreviewVariantId);
    
    const mockSelectedModifiers = selectedPreviewModifiers.map(opt => ({
        option: opt
    }));

    const mockPriceRules = [
        {
            id: 'HH',
            name: 'ONLINE HH DISCOUNT',
            scope: 'TENANT' as const,
            targetType: 'PRODUCT' as const,
            changeType: 'PERCENTAGE' as const,
            changeValue: -10, // 10% Off
            conditions: {
                days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                timeStart: '00:00',
                timeEnd: '23:59',
                channels: ['ONLINE']
            }
        }
    ];

    const currentTotalPOSPrice = PricingEngine.calculateTotalPrice(formData, {
        variantIds: [selectedPreviewVariantId],
        selectedModifiers: mockSelectedModifiers,
        pricingRules: mockPriceRules,
        channel: 'ONLINE',
        currentTime: '12:00',
        currentDay: 'MON'
    });

    const ruleToppingCount = RuleInterpreter.evaluateSelectionTotals(
        selectedPreviewModifiers.map(m => m.id),
        formData.equivalencyRules
    );

    const handleSave = () => {
        if (!formData.name.trim()) {
            alert('Validation Error: Product Display Name is required!');
            setActiveStep('BASICS');
            return;
        }

        if (formData.productType === 'SINGLE' && (!formData.variantGroups[0]?.variants || formData.variantGroups[0].variants.length === 0)) {
            alert('Validation Error: Single items must contain at least one pricing size variant!');
            setActiveStep('VARIANTS');
            return;
        }

        if (formData.productType === 'COMBO' && comboSlots.length === 0) {
            alert('Validation Error: Combo Deal must contain at least one component slot!');
            setActiveStep('STRUCTURE');
            return;
        }

        if (item) {
            updateItem(formData.id, formData);
            alert('Product composition draft updated successfully in state!');
        } else {
            // Deferred creation commit
            createItem(formData);
            alert('Product composition created and committed to master catalog index!');
        }
        onClose();
    };

    const handlePublishImmediate = async () => {
        if (!formData.name.trim()) {
            alert('Validation Error: Product Display Name is required before deployment!');
            setActiveStep('BASICS');
            return;
        }

        let targetId = formData.id;
        if (!item) {
            // Commit first if it's new
            const created = createItem(formData);
            targetId = created.id;
        } else {
            // Sync current form state first
            updateItem(formData.id, formData);
        }

        const success = await publishDraft(targetId);
        if (success) {
            alert('Product composition version released and synced across POS & Online pipelines successfully!');
            onClose();
        }
    };

    const handleTogglePreviewModifier = (opt: ModifierOption) => {
        const index = selectedPreviewModifiers.findIndex(m => m.id === opt.id);
        if (index > -1) {
            setSelectedPreviewModifiers(selectedPreviewModifiers.filter(m => m.id !== opt.id));
            const newMap = { ...halfHalfToppingMap };
            delete newMap[opt.id];
            setHalfHalfToppingMap(newMap);
        } else {
            const canAdd = RuleInterpreter.canAddSelection(
                opt.id,
                selectedPreviewModifiers.map(m => m.id),
                4.0, // Maximum allowed selection weights (Max: 4 toppings equivalent)
                formData.equivalencyRules
            );

            if (!canAdd) {
                alert('Equivalency Rule Alert: Paneer & Premium toppings count as 2 regular items. Selection count bounds exceeded (Max: 4.0).');
                return;
            }

            setSelectedPreviewModifiers([...selectedPreviewModifiers, opt]);
            setHalfHalfToppingMap({ ...halfHalfToppingMap, [opt.id]: 'WHOLE' });
        }
    };

    const handleSetToppingPlacement = (optId: string, placement: 'WHOLE' | 'LEFT' | 'RIGHT') => {
        setHalfHalfToppingMap({ ...halfHalfToppingMap, [optId]: placement });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Workspace Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl transition-all hover:scale-105"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                            {item ? `Composition: ${formData.name || 'Untitled'}` : 'Compose New Product'}
                        </h2>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight block mt-0.5">
                            Toast POS & Square inspired operational menu composer
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-5 py-3.5 border border-slate-900 text-slate-900 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center gap-2"
                    >
                        Save Draft
                    </button>
                    <button 
                        onClick={handlePublishImmediate}
                        disabled={isLoading}
                        className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Deploy Release
                    </button>
                </div>
            </div>

            {/* 1. Horizontal Linear Step Tracker Stepper */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-[2rem] border border-slate-200/60 overflow-x-auto shadow-inner w-full mb-6">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        {idx > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0 mx-1" />
                        )}
                        <button
                            onClick={() => setActiveStep(step.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all outline-none flex-shrink-0 relative group",
                                activeStep === step.id 
                                    ? "bg-white text-slate-950 border border-slate-200/60 shadow-sm scale-[1.01]" 
                                    : "text-slate-500 hover:text-slate-950 hover:bg-white/40"
                            )}
                        >
                            <span className="text-[10px] font-black uppercase tracking-wider">{step.label}</span>
                            {activeStep === step.id && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* 2. Spacious 2-Column Composition Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column: Active Step Form (2/3 width) */}
                <div className="lg:col-span-2 space-y-7">
                    
                    {/* BASICS STEP */}
                    {activeStep === 'BASICS' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Settings2 className="w-4 h-4 text-slate-500" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    Product Core Basics
                                </h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Composition Display Name</label>
                                    <input 
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter gourmet name..."
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 outline-none transition-all uppercase"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Detailed Menu Description</label>
                                    <textarea 
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Add descriptive product information..."
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 outline-none transition-all uppercase resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Tax Rate Profile (%)</label>
                                        <input 
                                            type="number"
                                            value={formData.taxRate}
                                            onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:border-slate-900 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Taxonomy Category</label>
                                        <select 
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 outline-none transition-all uppercase"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STRUCTURE STEP */}
                    {activeStep === 'STRUCTURE' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Layers className="w-4 h-4 text-slate-500" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    Product Composition Nature
                                </h3>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setFormData({ ...formData, productType: 'SINGLE' })}
                                        className={cn(
                                            "px-5 py-4.5 rounded-[22px] border-2 text-[10px] font-black uppercase tracking-widest text-left transition-all", 
                                            formData.productType === 'SINGLE' 
                                                ? 'border-slate-950 bg-slate-50 text-slate-950 shadow-sm scale-[1.01]' 
                                                : 'border-slate-100 hover:bg-slate-50 text-slate-500'
                                        )}
                                    >
                                        Single Product Structure
                                        <span className="text-[8px] font-bold text-slate-400 block uppercase mt-1.5 leading-relaxed">Pizzas, Beverages or Sides customization</span>
                                    </button>
                                    <button 
                                        onClick={() => setFormData({ ...formData, productType: 'COMBO' })}
                                        className={cn(
                                            "px-5 py-4.5 rounded-[22px] border-2 text-[10px] font-black uppercase tracking-widest text-left transition-all", 
                                            formData.productType === 'COMBO' 
                                                ? 'border-slate-950 bg-slate-50 text-slate-950 shadow-sm scale-[1.01]' 
                                                : 'border-slate-100 hover:bg-slate-50 text-slate-500'
                                        )}
                                    >
                                        Combo Deal Pack
                                        <span className="text-[8px] font-bold text-slate-400 block uppercase mt-1.5 leading-relaxed">Bundle multiple isolated components together</span>
                                    </button>
                                </div>

                                {formData.productType === 'COMBO' && (
                                    <div className="space-y-4 pt-4 border-t border-slate-50">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Combo Components Slots</h4>
                                            <button 
                                                onClick={() => setComboSlots([...comboSlots, { id: 'slot-' + Date.now(), name: 'Extra Component', allowedCategory: 'cat-sides', selectedItemId: 'test-sides-1' }])}
                                                className="px-3.5 py-1.5 border border-slate-900 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-xl hover:bg-slate-50"
                                            >
                                                Add Slot
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {comboSlots.map((slot, idx) => (
                                                <div key={slot.id} className="p-4.5 border border-slate-150 rounded-[1.5rem] flex flex-col justify-between bg-slate-50/50 relative group">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Slot #{idx + 1}</span>
                                                            <button 
                                                                onClick={() => setComboSlots(comboSlots.filter(s => s.id !== slot.id))}
                                                                className="text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <h4 className="text-xs font-black text-slate-950 uppercase tracking-tight">{slot.name}</h4>
                                                        <span className="text-[8px] font-mono text-slate-400 block mt-1 uppercase">Target: {slot.allowedCategory}</span>
                                                    </div>
                                                    <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                        <span className="text-[8px] font-black text-emerald-700 uppercase">Isolated pricing</span>
                                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[7px] uppercase tracking-wider font-mono">Synced</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VARIANTS STEP */}
                    {activeStep === 'VARIANTS' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Layers className="w-4 h-4 text-slate-500" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    Base Sizing Cost Topology
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {formData.variantGroups[0]?.variants.map(v => (
                                    <div key={v.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-300 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Layers className="w-4 h-4 text-slate-400" />
                                            <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-wide">{v.name}</h4>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="number"
                                                step="0.01"
                                                value={v.basePrice}
                                                onChange={(e) => {
                                                    const updatedVariants = formData.variantGroups[0].variants.map(val => 
                                                        val.id === v.id ? { ...val, basePrice: parseFloat(e.target.value) || 0 } : val
                                                    );
                                                    const updatedGroups = [{ ...formData.variantGroups[0], variants: updatedVariants }];
                                                    setFormData({ ...formData, variantGroups: updatedGroups });
                                                }}
                                                className="px-3.5 py-1.5 bg-white border border-slate-200 focus:border-slate-950 outline-none rounded-xl text-[11px] font-mono font-black text-right w-24"
                                            />
                                            <button 
                                                onClick={() => {
                                                    const updatedVariants = formData.variantGroups[0].variants.filter(val => val.id !== v.id);
                                                    const updatedGroups = [{ ...formData.variantGroups[0], variants: updatedVariants }];
                                                    setFormData({ ...formData, variantGroups: updatedGroups });
                                                }}
                                                className="p-2 hover:bg-rose-50 text-slate-350 hover:text-rose-600 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                                <input 
                                    type="text"
                                    placeholder="Variant Name (e.g. Extra Large)"
                                    value={newVariantName}
                                    onChange={(e) => setNewVariantName(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all uppercase"
                                />
                                <input 
                                    type="number"
                                    placeholder="Price ($)"
                                    value={newVariantPrice}
                                    onChange={(e) => setNewVariantPrice(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900 transition-all w-32"
                                />
                                <button 
                                    onClick={() => {
                                        if (!newVariantName || !newVariantPrice) return;
                                        const newVar = { id: 'v-' + Date.now(), name: newVariantName, basePrice: parseFloat(newVariantPrice), isAvailable: true };
                                        const updatedVariants = [...(formData.variantGroups[0]?.variants || []), newVar];
                                        const updatedGroups = [{ ...(formData.variantGroups[0] || { id: 'vg-1', name: 'Size', isRequired: true }), variants: updatedVariants }];
                                        setFormData({ ...formData, variantGroups: updatedGroups });
                                        setNewVariantName('');
                                        setNewVariantPrice('');
                                    }}
                                    className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-900"
                                >
                                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Sizing
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MODIFIERS STEP */}
                    {activeStep === 'MODIFIERS' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Sparkles className="w-4 h-4 text-slate-500" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    Interactive Topping & Half-Half Canvas
                                </h3>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
                                {/* Visual Pizza slice outline */}
                                <div className="relative w-44 h-44 rounded-full border-[10px] border-amber-500/20 bg-amber-50/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <div className="absolute left-0 w-22 h-44 border-r-2 border-dashed border-amber-600/30 bg-emerald-500/10 flex flex-col items-center justify-center p-2">
                                        <span className="text-[7.5px] font-black text-emerald-800 uppercase tracking-widest">Left</span>
                                        <div className="flex flex-wrap gap-1 mt-1 justify-center max-w-[80px]">
                                            {selectedPreviewModifiers.filter(m => halfHalfToppingMap[m.id] === 'LEFT').map(m => (
                                                <span key={m.id} className="px-1.5 py-0.5 bg-slate-900 text-white text-[7px] font-black uppercase rounded">{m.name.slice(0, 4)}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute right-0 w-22 h-44 bg-purple-500/10 flex flex-col items-center justify-center p-2">
                                        <span className="text-[7.5px] font-black text-purple-800 uppercase tracking-widest">Right</span>
                                        <div className="flex flex-wrap gap-1 mt-1 justify-center max-w-[80px]">
                                            {selectedPreviewModifiers.filter(m => halfHalfToppingMap[m.id] === 'RIGHT').map(m => (
                                                <span key={m.id} className="px-1.5 py-0.5 bg-slate-900 text-white text-[7px] font-black uppercase rounded">{m.name.slice(0, 4)}</span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Whole toppings indicator */}
                                    <div className="absolute z-10 flex flex-wrap gap-1.5 max-w-[120px] justify-center">
                                        {selectedPreviewModifiers.filter(m => halfHalfToppingMap[m.id] === 'WHOLE').map(m => (
                                            <span key={m.id} className="px-2 py-0.5 bg-slate-950 text-white text-[8px] font-black uppercase rounded-lg shadow-md border border-emerald-400">{m.name}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Placements controls list */}
                                <div className="flex-1 space-y-4 w-full">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Half-and-Half selections placement</span>
                                    {selectedPreviewModifiers.length === 0 ? (
                                        <p className="text-[9px] text-slate-350 uppercase font-black italic">Select toppings in simulator to map placements...</p>
                                    ) : (
                                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                            {selectedPreviewModifiers.map(m => (
                                                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{m.name}</span>
                                                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                                                        {(['LEFT', 'WHOLE', 'RIGHT'] as const).map(placement => (
                                                            <button
                                                                key={placement}
                                                                onClick={() => handleSetToppingPlacement(m.id, placement)}
                                                                className={cn(
                                                                    "px-2.5 py-1 text-[8px] font-black uppercase tracking-wide rounded-md transition-all", 
                                                                    halfHalfToppingMap[m.id] === placement 
                                                                        ? 'bg-slate-950 text-white shadow-sm' 
                                                                        : 'text-slate-400 hover:text-slate-950'
                                                                )}
                                                            >
                                                                {placement}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SIMULATION STEP */}
                    {activeStep === 'SIMULATION' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <ShoppingCart className="w-4 h-4 text-slate-500" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    POS Checkout Receipt Simulation
                                </h3>
                            </div>

                            <div className="bg-slate-950 p-6 rounded-[2.5rem] shadow-xl text-slate-100 font-mono space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4 text-emerald-400" />
                                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">POS Receipt Simulator</h4>
                                    </div>
                                    <span className="px-2 py-0.5 bg-slate-900 text-emerald-400 rounded text-[8px] uppercase tracking-widest font-black">
                                        Live
                                    </span>
                                </div>

                                <div className="space-y-3.5 text-xs">
                                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                                        <span className="uppercase font-sans font-black text-[11px] text-slate-200 max-w-[140px] truncate">
                                            {formData.name || 'Gourmet Cheese Pizza'}
                                        </span>
                                        <span className="text-slate-100 font-bold">${resolvedBasePrice.toFixed(2)}</span>
                                    </div>

                                    {selectedPreviewModifiers.length > 0 && (
                                        <div className="space-y-2 text-[11px] text-slate-400 pl-2">
                                            {selectedPreviewModifiers.map(m => (
                                                <div key={m.id} className="flex items-center justify-between">
                                                    <span>
                                                        + Extra {m.name} 
                                                        <span className="text-[8.5px] text-slate-500 uppercase ml-1">
                                                            ({halfHalfToppingMap[m.id] || 'WHOLE'})
                                                        </span>
                                                    </span>
                                                    <span>+ ${m.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 p-2 rounded-xl">
                                        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> ONLINE HH DISCOUNT (10%)</span>
                                        <span>- ${(resolvedBasePrice * 0.10).toFixed(2)}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-slate-200">
                                        <span className="uppercase text-[11px] font-black text-slate-400">Total POS charge</span>
                                        <span className="text-base font-black text-emerald-400">${currentTotalPOSPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OVERRIDES STEP */}
                    {activeStep === 'OVERRIDES' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Building2 className="w-4 h-4 text-slate-500" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    Store Override parameters matrix
                                </h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-4.5 h-4.5 text-slate-400" />
                                        <div>
                                            <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-wide">Chicago Loop Outlet</h4>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 block">Store Target ID: store-chicago</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] uppercase tracking-wider font-mono">
                                            Customized Price
                                        </span>
                                        <span className="font-mono text-xs font-black text-slate-900">$14.99</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/40 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-4.5 h-4.5 text-slate-400" />
                                        <div>
                                            <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Manhattan Broad Ave</h4>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 block">Store Target ID: store-newyork</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] uppercase tracking-wider font-bold">
                                            Inherited Locked
                                        </span>
                                        <span className="font-mono text-xs text-slate-400">$12.99</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PUBLISH STEP */}
                    {activeStep === 'PUBLISH' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <ShieldCheck className="w-4.5 h-4.5 text-slate-500" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    Deployment Replication Pipelines
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4.5 bg-slate-50 border border-slate-100 rounded-[1.75rem] flex items-center justify-between">
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Local Catalog State</span>
                                        <h4 className="text-xs font-black text-slate-900 uppercase mt-1">Pending Unsaved Revisions</h4>
                                    </div>
                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[9px] font-bold uppercase tracking-wide">
                                        DRAFT STATE
                                    </span>
                                </div>

                                {/* Visual Validation Gate Awareness */}
                                <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-[1.75rem] space-y-3">
                                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                        Pipeline Validation Gates
                                    </span>
                                    <div className="space-y-2 text-[10px] bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-50">
                                            <span className="text-slate-650 font-bold uppercase">Product Display Name</span>
                                            {formData.name.trim() ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-black uppercase text-[8.5px]"><CheckCircle2 className="w-3.5 h-3.5" /> PASSED</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-rose-600 font-black uppercase text-[8.5px]"><AlertTriangle className="w-3.5 h-3.5" /> REQUIRED</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-50">
                                            <span className="text-slate-650 font-bold uppercase font-sans">
                                                {formData.productType === 'SINGLE' ? 'Sizing Price Variants' : 'Combo Component Slots'}
                                            </span>
                                            {(formData.productType === 'SINGLE' ? (formData.variantGroups[0]?.variants?.length || 0) > 0 : comboSlots.length > 0) ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-black uppercase text-[8.5px]"><CheckCircle2 className="w-3.5 h-3.5" /> PASSED</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-rose-600 font-black uppercase text-[8.5px]"><AlertTriangle className="w-3.5 h-3.5" /> UNCONFIGURED</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-50">
                                            <span className="text-slate-650 font-bold uppercase">Tax Profile Assignment</span>
                                            {formData.taxRate >= 0 ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-black uppercase text-[8.5px]"><CheckCircle2 className="w-3.5 h-3.5" /> PASSED</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-rose-600 font-black uppercase text-[8.5px]"><AlertTriangle className="w-3.5 h-3.5" /> INVALID</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-650 font-bold uppercase">Taxonomy Categorization</span>
                                            {formData.categoryId ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-black uppercase text-[8.5px]"><CheckCircle2 className="w-3.5 h-3.5" /> PASSED</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-rose-600 font-black uppercase text-[8.5px]"><AlertTriangle className="w-3.5 h-3.5" /> MISSING</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white border border-slate-150 rounded-2xl text-center space-y-2">
                                        <Server className="w-5 h-5 text-emerald-500 mx-auto" />
                                        <h5 className="text-[10px] font-black text-slate-950 uppercase tracking-tight">Point-of-Sale (POS)</h5>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase font-mono">Synced</span>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-150 rounded-2xl text-center space-y-2">
                                        <Server className="w-5 h-5 text-purple-500 mx-auto" />
                                        <h5 className="text-[10px] font-black text-slate-950 uppercase tracking-tight">Online Web Channel</h5>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase font-mono">Synced</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handlePublishImmediate}
                                    className="w-full py-4 bg-slate-950 hover:bg-slate-900 text-white text-[9.5px] font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Server className="w-4 h-4 text-emerald-400" />
                                    Publish Composition Release
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Right Sticky Receipt / Progress Limits validation column */}
                <div className="space-y-7 lg:col-span-1 sticky top-4">
                    
                    {/* Live active configuration parameters helper details */}
                    <div className="bg-slate-950 p-6 rounded-[2.5rem] shadow-xl text-slate-100 font-mono space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Live Composition Summary</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="space-y-3 text-[11px]">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 uppercase">Nature</span>
                                <span className="uppercase text-slate-200">{formData.productType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 uppercase">Tax profile</span>
                                <span className="text-slate-200 font-mono">{formData.taxRate}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 uppercase">Sizing options</span>
                                <span className="text-slate-200">{formData.variantGroups[0]?.variants.length || 0} Tiers</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                                <span className="text-slate-400 uppercase">POS Total price</span>
                                <span className="text-emerald-400 font-black">${currentTotalPOSPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rule bounds progress validations */}
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-5">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                            Selection Limits Rule Awareness
                        </h4>

                        <div className="space-y-3.5">
                            <div>
                                <div className="flex items-center justify-between text-[8.5px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                    <span>Toppings equivalent weight</span>
                                    <span className="font-mono text-slate-900">{ruleToppingCount.toFixed(1)} / 4.0</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full transition-all duration-300", ruleToppingCount > 3 ? 'bg-amber-500' : 'bg-emerald-500')}
                                        style={{ width: `${Math.min(100, (ruleToppingCount / 4) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wide block">Test selector buttons</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => handleTogglePreviewModifier({ id: 'opt-onion', name: 'Onions', price: 0.99 })}
                                        className={cn(
                                            "py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all border outline-none",
                                            selectedPreviewModifiers.some(m => m.id === 'opt-onion')
                                                ? "bg-slate-950 text-white border-slate-950"
                                                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                                        )}
                                    >
                                        Onions (1.0 W)
                                    </button>
                                    <button 
                                        onClick={() => handleTogglePreviewModifier({ id: 'opt-paneer', name: 'Paneer (P)', price: 2.50, isPremium: true })}
                                        className={cn(
                                            "py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all border outline-none",
                                            selectedPreviewModifiers.some(m => m.id === 'opt-paneer')
                                                ? "bg-slate-950 text-white border-slate-950"
                                                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                                        )}
                                    >
                                        Paneer (2.0 W)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
