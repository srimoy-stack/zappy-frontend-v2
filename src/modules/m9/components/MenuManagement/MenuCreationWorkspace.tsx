'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    X, ArrowLeft, ArrowRight, Check, AlertTriangle, Search, Info,
    Eye, EyeOff, Edit, Copy, ChevronRight, ChevronDown, ChevronUp,
    Layers, Package, Calendar, Clock, Monitor, Globe, Truck,
    Settings2, Shield, Plus, Building, Star, Sparkles, GripVertical, Hash
} from 'lucide-react';
import { useMenuCreationStore, CreationStep } from '../../state/menuCreationStore';
import type { SectionType, MenuChannelType } from '../../types/menu';
import { useCatalogStore } from '../../state/catalogStore';
import { mockStores } from '../../mock/stores';
import { cn } from '@/utils';
import {
    validateStep, validateMenuName, validateTag,
    validateDescription, validateSectionName,
    type StepValidationResult
} from '../../validation/menuCreationValidation';
import { useToast, ToastContainer } from '../../email-campaigns/components/Toast';

const STEPS: { id: CreationStep; label: string; desc: string }[] = [
    { id: 'BASIC_DETAILS', label: '1. Basic Details', desc: 'Identity & type' },
    { id: 'CATEGORY_COMPOSITION', label: '2. Categories', desc: 'Link category assets' },
    { id: 'PLACEMENT_CONFIG', label: '3. Placement Config', desc: 'Arrange visual order' },
    { id: 'STORE_DEPLOYMENT', label: '4. Stores', desc: 'Target locations' },
    { id: 'CHANNEL_MATRIX', label: '5. Channels', desc: 'Per-store channel matrix' },
    { id: 'SCHEDULING', label: '6. Scheduling', desc: 'Global & overrides' },
    { id: 'DEPLOYMENT_SUMMARY', label: '7. Summary', desc: 'Validation & release' }
];

const CHANNELS: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'POS', label: 'POS Terminal', icon: <Monitor className="w-3.5 h-3.5" /> },
    { id: 'ONLINE', label: 'Online Store', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'UBER_EATS', label: 'Uber Eats', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'DOORDASH', label: 'DoorDash', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'KIOSK', label: 'Self Kiosk', icon: <Settings2 className="w-3.5 h-3.5" /> },
    { id: 'CATERING', label: 'Catering', icon: <Info className="w-3.5 h-3.5" /> },
    { id: 'CUSTOM', label: 'Custom App', icon: <Layers className="w-3.5 h-3.5" /> }
];

// ── Inline Field Error Component ──────────────────────────────────────
const FieldError: React.FC<{ error?: string; className?: string }> = ({ error, className }) => {
    if (!error) return null;
    return (
        <p className={cn(
            "flex items-center gap-1 mt-1 text-[9px] font-bold text-rose-600 animate-in fade-in slide-in-from-top-1 duration-200",
            className
        )}>
            <AlertTriangle className="w-3 h-3 shrink-0" />
            {error}
        </p>
    );
};

export const MenuCreationWorkspace: React.FC = () => {
    const {
        isOpen, currentStep, formData, isDirty, previewTarget, editMenuId,
        closeWizard, setStep, nextStep, prevStep, updateForm,
        setCategorySelected, updateSectionConfig, setItemSelected,
        toggleItemFeatured, toggleItemVisibility, setStoreChannelMatrix,
        bulkApplyChannels, setGlobalSchedule, setStoreSchedule, applyStoreScheduleToAll,
        addScheduleOverride, removeScheduleOverride, setPreviewTarget, submitMenu
    } = useMenuCreationStore();

    const { categories, items } = useCatalogStore();
    const isReadOnly = !!editMenuId;
    const { toasts, dismiss: dismissToast, success: toastSuccess, error: toastError, info: toastInfo } = useToast();

    // ── Local state for filtering / search
    const [catSearch, setCatSearch] = useState('');
    const [prodSearch, setProdSearch] = useState('');
    const [activeCategoryTab, setActiveCategoryTab] = useState<string>('');
    const [newTagInput, setNewTagInput] = useState('');
    const [activeScheduleStoreId, setActiveScheduleStoreId] = useState<string>('');
    const [activeScheduleChannelId, setActiveScheduleChannelId] = useState<string>('');

    // ── Validation State ──
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const [tagError, setTagError] = useState<string | null>(null);

    const markTouched = useCallback((field: string) => {
        setTouchedFields(prev => {
            const next = new Set(prev);
            next.add(field);
            return next;
        });
    }, []);

    // Real-time validation for current step
    const stepValidation: StepValidationResult = useMemo(
        () => validateStep(currentStep, formData),
        [currentStep, formData]
    );

    // Field-level error getter (only shows if field has been touched)
    const getFieldError = useCallback((field: string): string | undefined => {
        if (!touchedFields.has(field)) return undefined;
        return stepValidation.errors[field];
    }, [touchedFields, stepValidation.errors]);

    // ── Catalog Integrity & Quality Audit State ──
    const [auditMode, setAuditMode] = useState<'STANDARD' | 'STRICT'>('STANDARD');
    const [bypassCompliance, setBypassCompliance] = useState(false);
    const [reviewTab, setReviewTab] = useState<'categories' | 'stores' | 'schedules'>('categories');

    // Catalog quality audit rules (Standard vs Strict controls)
    const complianceIssues = useMemo(() => {
        const issues: {
            id: string;
            type: 'alcohol' | 'calories' | 'price' | 'allergen' | 'tax' | 'description';
            severity: 'error' | 'warning';
            title: string;
            message: string;
            targetName: string;
        }[] = [];

        formData.selectedCategoryIds.forEach(catId => {
            const sec = formData.categorySections[catId];
            const cat = categories.find(c => c.id === catId);
            if (!sec || !cat) return;

            // 1. Category-level description warning
            if (!sec.description && !cat.description) {
                issues.push({
                    id: `cat-desc-${catId}`,
                    type: 'description',
                    severity: 'warning',
                    title: 'Category Description Recommended',
                    message: 'Rich catalog structures require category descriptions to improve platform indexing and customer engagement.',
                    targetName: sec.displayName || cat.name
                });
            }

            sec.includedItemIds.forEach(itemId => {
                const item = items.find(i => i.id === itemId);
                if (!item) return;

                const nameLower = item.name.toLowerCase();
                const descLower = (item.description || '').toLowerCase();

                // 2. Price compliance checks (zero-price elements must be marked explicitly)
                if (item.baseProductPrice <= 0) {
                    issues.push({
                        id: `item-price-${itemId}`,
                        type: 'price',
                        severity: 'error',
                        title: 'Zero Base Price Restriction',
                        message: 'Base catalog menu items priced at $0.00 are rejected by upstream sync systems. Configure dynamic modifier values or a positive base price.',
                        targetName: item.name
                    });
                }

                // 3. Alcohol tagging checks (generic regulatory check)
                const alcoholKeywords = ['beer', 'wine', 'cider', 'alcohol', 'sake', 'whiskey', 'vodka', 'tequila', 'cocktail', 'mimosa', 'margarita', 'champagne', 'ipa', 'rum', 'liqueur', 'spirits'];
                const containsAlcoholKeyword = alcoholKeywords.some(kw => nameLower.includes(kw) || descLower.includes(kw));
                
                if (containsAlcoholKeyword) {
                    const hasAlcoholTag = item.tags.some(t => {
                        const tl = t.toLowerCase();
                        return tl === 'alcohol' || tl === 'age-restricted' || tl === 'alcoholic';
                    }) || item.dietaryFlags.some(f => {
                        const fl = f.toLowerCase();
                        return fl === 'alcohol' || fl === 'age-restricted';
                    });

                    if (!hasAlcoholTag) {
                        issues.push({
                            id: `item-alcohol-${itemId}`,
                            type: 'alcohol',
                            severity: 'error',
                            title: 'Unidentified Age-Restricted Item',
                            message: 'Catalog regulations mandate that alcoholic beverages carry a clear "Alcohol" or "Age-Restricted" flag to trigger ID validation at handoff.',
                            targetName: item.name
                        });
                    }
                }

                // Deep / Strict Mode only rules
                if (auditMode === 'STRICT') {
                    // 4. Nutritional / Calorie count recommendations
                    const hasCalorieMention = descLower.includes('cal') || descLower.includes('calorie') || descLower.includes('calories') || /\d+\s*c/i.test(descLower);
                    if (!hasCalorieMention) {
                        issues.push({
                            id: `item-calorie-${itemId}`,
                            type: 'calories',
                            severity: 'warning',
                            title: 'Nutritional Value Disclosure Recommended',
                            message: 'Strict catalog publishing compliance guidelines recommend providing calorie counts (e.g., "320 Cal") in the item description.',
                            targetName: item.name
                        });
                    }

                    // 5. Allergen Warning Alerts
                    const allergenKeywords = ['peanut', 'almond', 'pecan', 'walnut', 'shrimp', 'lobster', 'crab', 'shellfish', 'milk', 'egg', 'wheat', 'soy', 'sesame', 'crustacean', 'hazelnut', 'pistachio', 'cashew'];
                    const containsAllergenKeyword = allergenKeywords.some(kw => nameLower.includes(kw) || descLower.includes(kw));
                    if (containsAllergenKeyword) {
                        const hasAllergenTag = item.tags.some(t => {
                            const tl = t.toLowerCase();
                            return tl.includes('contains') || tl.includes('allergy') || tl.includes('allergen') || tl.includes('nuts') || tl.includes('dairy') || tl.includes('gluten');
                        }) || item.dietaryFlags.some(f => {
                            const fl = f.toLowerCase();
                            return fl.includes('contains') || fl.includes('allergen') || fl.includes('allergy');
                        }) || descLower.includes('contains') || descLower.includes('allergen') || descLower.includes('allergy');

                        if (!hasAllergenTag) {
                            issues.push({
                                id: `item-allergen-${itemId}`,
                                type: 'allergen',
                                severity: 'warning',
                                title: 'Missing Allergen Warning Statement',
                                message: 'Item name/description indicates allergen triggers. It is recommended to configure specific dietary allergen tags or add warning statements.',
                                targetName: item.name
                            });
                        }
                    }

                    // 6. Tax configuration mapping check
                    if (item.taxRate <= 0) {
                        issues.push({
                            id: `item-tax-${itemId}`,
                            type: 'tax',
                            severity: 'warning',
                            title: 'Zero Tax Rate Configuration',
                            message: 'Strict Mode Audit detected a zero tax rate configuration. Verify tax categories to ensure active collection.',
                            targetName: item.name
                        });
                    }
                }

                // 7. Product description length (always checked)
                if (!item.description || item.description.length < 15) {
                    issues.push({
                        id: `item-desc-${itemId}`,
                        type: 'description',
                        severity: 'warning',
                        title: 'Incomplete Product Description',
                        message: 'Descriptions longer than 15 characters are highly recommended to increase storefront conversion and platform SEO.',
                        targetName: item.name
                    });
                }
            });
        });

        return issues;
    }, [formData.selectedCategoryIds, formData.categorySections, formData.storeChannelMatrix, formData.selectedStoreIds, items, categories, auditMode]);

    const hasCriticalErrors = complianceIssues.some(issue => issue.severity === 'error');

    // ── Placement Config: two-level drag-and-drop state ──
    const [sectionDragIdx, setSectionDragIdx] = useState<number | null>(null);
    const [sectionDropIdx, setSectionDropIdx] = useState<number | null>(null);
    const [itemDrag, setItemDrag] = useState<{ catId: string; idx: number } | null>(null);
    const [itemDropIdx, setItemDropIdx] = useState<number | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [placementSearch, setPlacementSearch] = useState('');

    // Toggle section expand/collapse
    const toggleSection = (catId: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            next.has(catId) ? next.delete(catId) : next.add(catId);
            return next;
        });
    };
    const expandAll = () => setExpandedSections(new Set(formData.selectedCategoryIds));
    const collapseAll = () => setExpandedSections(new Set());

    // Section-level drag handlers
    const onSectionDragStart = (e: React.DragEvent, idx: number) => {
        setSectionDragIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'section');
    };
    const onSectionDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (e.dataTransfer.getData('text/plain') === 'item') return;
        if (sectionDragIdx !== idx) setSectionDropIdx(idx);
    };
    const onSectionDrop = (e: React.DragEvent, targetIdx: number) => {
        e.preventDefault();
        if (sectionDragIdx === null || sectionDragIdx === targetIdx) return;
        const newOrder = [...formData.selectedCategoryIds];
        const [moved] = newOrder.splice(sectionDragIdx, 1);
        newOrder.splice(targetIdx, 0, moved);
        updateForm({ selectedCategoryIds: newOrder });
        setSectionDragIdx(null);
        setSectionDropIdx(null);
    };
    const onSectionDragEnd = () => { setSectionDragIdx(null); setSectionDropIdx(null); };

    // Item-level drag handlers
    const onItemDragStart = (e: React.DragEvent, catId: string, idx: number) => {
        e.stopPropagation();
        setItemDrag({ catId, idx });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'item');
    };
    const onItemDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (itemDrag && itemDrag.idx !== idx) setItemDropIdx(idx);
    };
    const onItemDrop = (e: React.DragEvent, catId: string, targetIdx: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!itemDrag || itemDrag.catId !== catId || itemDrag.idx === targetIdx) return;
        const sec = formData.categorySections[catId];
        if (!sec) return;
        const newIds = [...sec.includedItemIds];
        const [moved] = newIds.splice(itemDrag.idx, 1);
        newIds.splice(targetIdx, 0, moved);
        updateSectionConfig(catId, { includedItemIds: newIds });
        setItemDrag(null);
        setItemDropIdx(null);
    };
    const onItemDragEnd = () => { setItemDrag(null); setItemDropIdx(null); };

    // Placement stats
    const placementStats = useMemo(() => {
        let totalItems = 0;
        let hiddenItems = 0;
        let featuredItems = 0;
        let hiddenSections = 0;
        formData.selectedCategoryIds.forEach(catId => {
            const sec = formData.categorySections[catId];
            if (!sec) return;
            if (!sec.isVisible) hiddenSections++;
            totalItems += sec.includedItemIds.length;
            hiddenItems += sec.excludedItemIds.length;
            featuredItems += sec.featuredItemIds.length;
        });
        return { sections: formData.selectedCategoryIds.length, totalItems, hiddenItems, featuredItems, hiddenSections };
    }, [formData.selectedCategoryIds, formData.categorySections]);

    // Previews / Contextual drawers
    const previewedCategory = useMemo(() => {
        if (previewTarget?.type === 'category') {
            return categories.find(c => c.id === previewTarget.id);
        }
        return null;
    }, [previewTarget, categories]);

    const previewedItem = useMemo(() => {
        if (previewTarget?.type === 'item') {
            return items.find(i => i.id === previewTarget.id);
        }
        return null;
    }, [previewTarget, items]);

    if (!isOpen) return null;

    // Set first selected category as active product composition tab if not set
    if (formData.selectedCategoryIds.length > 0 && !activeCategoryTab) {
        setActiveCategoryTab(formData.selectedCategoryIds[0]);
    }

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
        c.description?.toLowerCase().includes(catSearch.toLowerCase())
    );

    const activeCatProducts = items.filter(i => i.categoryId === activeCategoryTab);
    const filteredProducts = activeCatProducts.filter(i =>
        i.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        i.sku.toLowerCase().includes(prodSearch.toLowerCase())
    );

    // Store calculations
    const filteredStores = mockStores.filter(store => {
        if (formData.regionFilter === 'ALL') return true;
        return store.region === formData.regionFilter;
    });

    const isStepValid = useCallback(() => {
        if (editMenuId) return true;
        return stepValidation.isValid;
    }, [editMenuId, stepValidation.isValid]);

    // Guarded next-step handler with toast feedback
    const handleNextStep = useCallback(() => {
        if (editMenuId) { nextStep(); return; }

        const validation = validateStep(currentStep, formData);
        if (!validation.isValid) {
            // Mark all fields as touched to reveal errors
            const allFields = Object.keys(validation.errors);
            setTouchedFields(prev => {
                const next = new Set(prev);
                allFields.forEach(f => next.add(f));
                return next;
            });

            toastError(
                'Step Validation Failed',
                validation.firstError || 'Please fix the highlighted errors before continuing.'
            );
            return;
        }
        nextStep();
    }, [editMenuId, currentStep, formData, nextStep, toastError]);

    return (
        <div className="w-full bg-white rounded-3xl border border-slate-200/60 flex flex-col overflow-hidden animate-in fade-in duration-300 h-[calc(100vh-120px)] shadow-sm">
                
                {/* ── Top Bar ─────────────────────────────────────────────── */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-950 text-white rounded-2xl">
                            {editMenuId ? (
                                <Eye className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <Plus className="w-5 h-5 text-emerald-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                {editMenuId ? 'Menu Specifications View (Read-Only)' : 'New Presentation Layer Wizard'}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                {editMenuId ? 'Browse active store-channel visibility matrices and scheduling properties' : 'Deploy new menus from canonical catalog assets'}
                            </p>
                        </div>
                    </div>
                    
                    <button onClick={closeWizard} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* ── Horizontal Step Tracker ─────────────────────────────── */}
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto shrink-0">
                    <div className="flex items-center justify-between min-w-[800px] gap-2">
                        {STEPS.map((step, idx) => {
                            const isActive = currentStep === step.id;
                            const stepsList = STEPS.map(s => s.id);
                            const currentIdx = stepsList.indexOf(currentStep);
                            const stepIdx = stepsList.indexOf(step.id);
                            const isCompleted = stepIdx < currentIdx;

                            return (
                                <React.Fragment key={step.id}>
                                    {/* Step Tab Link */}
                                    <button
                                        onClick={() => setStep(step.id)}
                                        className="flex items-center gap-2.5 text-left focus:outline-none group relative py-1"
                                    >                                      
                                        <div className={cn(
                                            "w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all border shadow-sm",
                                            isActive 
                                                ? "bg-slate-950 text-white border-slate-950 scale-110" 
                                                : isCompleted
                                                    ? "bg-emerald-500 text-white border-emerald-500"
                                                    : "bg-white text-slate-400 border-slate-200 group-hover:border-slate-400 group-hover:text-slate-700"
                                        )}>
                                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                        </div>
                                        <div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-wider block leading-tight",
                                                isActive ? "text-slate-900" : isCompleted ? "text-emerald-600 font-bold" : "text-slate-400 group-hover:text-slate-600"
                                            )}>
                                                {step.label.split('. ')[1]}
                                            </span>
                                            <span className="text-[8px] text-slate-400 font-bold block leading-none mt-0.5">{step.desc}</span>
                                        </div>

                                        {/* Active underline decoration */}
                                        {isActive && (
                                            <span className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-slate-950 rounded-full animate-in fade-in duration-300" />
                                        )}
                                    </button>

                                    {/* Connecting Line */}
                                    {idx < STEPS.length - 1 && (
                                        <div className="flex-1 h-0.5 bg-slate-100 rounded-full mx-2 relative min-w-[20px]">
                                            <div className={cn(
                                                "absolute inset-y-0 left-0 transition-all duration-300",
                                                isCompleted ? "w-full bg-emerald-500" : "w-0"
                                            )} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Read-Only Info Banner */}
                {editMenuId && (
                    <div className="mx-6 mt-4 p-3.5 bg-slate-950 text-white rounded-2xl flex items-center justify-between shadow-sm border border-slate-800 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Eye className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest block text-emerald-400">View Details Mode</span>
                                <p className="text-[9px] text-slate-300 font-medium">You are viewing the configuration parameters of "{formData.name}" in read-only specification view.</p>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400">
                            Read-Only Layout
                        </span>
                    </div>
                )}

                {/* ── Inner Content Panels ────────────────── */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Center Workspace Panels */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto p-6">

                        {currentStep === 'BASIC_DETAILS' && (() => {
                            return (
                                <div className="flex gap-8 items-start h-full min-h-0 w-full">
                                    <div className="flex-1 max-w-2xl space-y-6">
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 1: Menu Basic Details</h3>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Provide foundational metadata and default channel targets</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Menu Name *</label>
                                                <input
                                                    value={formData.name}
                                                    onChange={e => {
                                                        updateForm({ name: e.target.value });
                                                        markTouched('name');
                                                    }}
                                                    onBlur={() => markTouched('name')}
                                                    placeholder="e.g. Summer Late Night Drink Specials"
                                                    disabled={isReadOnly}
                                                    className={cn(
                                                        "w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all focus:ring-1 disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed",
                                                        getFieldError('name') ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                                                    )}
                                                />
                                                <FieldError error={getFieldError('name')} />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Description (Optional)</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={e => {
                                                        updateForm({ description: e.target.value });
                                                        markTouched('description');
                                                    }}
                                                    onBlur={() => markTouched('description')}
                                                    placeholder="Specify target user segments, seasonal goals, or operation scopes..."
                                                    rows={3}
                                                    disabled={isReadOnly}
                                                    className={cn(
                                                        "w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-800 outline-none resize-none transition-all disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed",
                                                        getFieldError('description') ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                    )}
                                                />
                                                <FieldError error={getFieldError('description')} />
                                            </div>

                                            {/* Support Contact Info block (Required) */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Support Email *</label>
                                                    <input
                                                        type="email"
                                                        value={formData.supportEmail}
                                                        onChange={e => {
                                                            updateForm({ supportEmail: e.target.value });
                                                            markTouched('supportEmail');
                                                        }}
                                                        onBlur={() => markTouched('supportEmail')}
                                                        placeholder="e.g. menu-help@brand.com"
                                                        disabled={isReadOnly}
                                                        className={cn(
                                                            "w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all focus:ring-1 disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed",
                                                            getFieldError('supportEmail') ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                                                        )}
                                                    />
                                                    <FieldError error={getFieldError('supportEmail')} />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Support Phone Number *</label>
                                                    <div className="flex gap-2">
                                                        {/* USA/Canada country prefix selector */}
                                                        <select
                                                            value={formData.supportPhoneCountry}
                                                            onChange={e => {
                                                                updateForm({ supportPhoneCountry: e.target.value as 'US' | 'CA' });
                                                                markTouched('supportPhoneCountry');
                                                            }}
                                                            disabled={isReadOnly}
                                                            className="px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 disabled:bg-slate-100/60 disabled:cursor-not-allowed shrink-0"
                                                        >
                                                            <option value="CA">🇨🇦 +1 (CA)</option>
                                                            <option value="US">🇺🇸 +1 (US)</option>
                                                        </select>
                                                        <input
                                                            type="tel"
                                                            value={formData.supportPhone}
                                                            onChange={e => {
                                                                updateForm({ supportPhone: e.target.value });
                                                                markTouched('supportPhone');
                                                            }}
                                                            onBlur={() => markTouched('supportPhone')}
                                                            placeholder="555-555-5555"
                                                            disabled={isReadOnly}
                                                            className={cn(
                                                                "flex-1 px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all focus:ring-1 disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed",
                                                                getFieldError('supportPhone') ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                                                            )}
                                                        />
                                                    </div>
                                                    <FieldError error={getFieldError('supportPhone')} />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Runtime Tags</label>
                                                <div className={cn(
                                                    "flex flex-wrap gap-1.5 p-2 bg-slate-50 border rounded-xl min-h-[42px]",
                                                    getFieldError('tags') ? "border-rose-500" : "border-slate-200"
                                                )}>
                                                    {formData.tags.map(tag => (
                                                        <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-wider animate-in zoom-in duration-200">
                                                            {tag}
                                                            {!isReadOnly && (
                                                                <button onClick={() => updateForm({ tags: formData.tags.filter(t => t !== tag) })} className="hover:text-rose-400">
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            )}
                                                        </span>
                                                    ))}
                                                    {!isReadOnly && (
                                                        <input
                                                            value={newTagInput}
                                                            onChange={e => {
                                                                setNewTagInput(e.target.value);
                                                                setTagError(validateTag(e.target.value, formData.tags));
                                                            }}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && newTagInput.trim()) {
                                                                    e.preventDefault();
                                                                    const validationErr = validateTag(newTagInput.trim(), formData.tags);
                                                                    if (validationErr) {
                                                                        setTagError(validationErr);
                                                                        return;
                                                                    }
                                                                    updateForm({ tags: [...formData.tags, newTagInput.trim()] });
                                                                    setNewTagInput('');
                                                                    setTagError(null);
                                                                }
                                                            }}
                                                            placeholder={formData.tags.length === 0 ? "e.g. Summer, NightShift" : ""}
                                                            className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400"
                                                        />
                                                    )}
                                                    {isReadOnly && formData.tags.length === 0 && (
                                                        <span className="text-xs text-slate-400 font-semibold italic p-1">No tags specified</span>
                                                    )}
                                                </div>
                                                <FieldError error={tagError || getFieldError('tags')} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-80 shrink-0 border-l border-slate-100 pl-6 space-y-6 hidden xl:block">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Menu Card Preview</span>
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mt-1 text-left">Live Presentation Layout</h4>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl shadow-xl space-y-4 border border-slate-800">
                                            <div className="flex justify-between items-start">
                                                <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 rounded-md text-[8px] font-black uppercase tracking-wider">
                                                    {formData.primaryChannel}
                                                </span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                                    {formData.publishStatus}
                                                </span>
                                            </div>

                                            <div className="space-y-1 text-left">
                                                <h5 className="text-xs font-black uppercase tracking-wide truncate">
                                                    {formData.name || 'Untitled Menu'}
                                                </h5>
                                                <p className="text-[9px] text-slate-400 line-clamp-3 leading-relaxed font-medium">
                                                    {formData.description || 'Provide a menu description to display seasonal goals or segment targets on checkout screens.'}
                                                </p>
                                            </div>

                                            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                                                <span>Categories: {formData.selectedCategoryIds.length}</span>
                                                <span>{formData.isDefault ? 'Default Channel Layer' : 'Sub-menu Layer'}</span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-[9px] text-slate-500 font-medium leading-relaxed text-left">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Guidelines</span>
                                            Choose a clear name and tags. The primary channel determines initial sync target formatting.
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* STEP 2: Category Composition */}
                        {currentStep === 'CATEGORY_COMPOSITION' && (() => {
                            const isReadOnly = !!editMenuId;
                            return (
                                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between shrink-0">
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 2: Category Composition</h3>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Map category assets from the catalog into presentation sections</p>
                                        </div>
                                        <div className="relative w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={catSearch}
                                                onChange={e => setCatSearch(e.target.value)}
                                                placeholder="Search catalog categories..."
                                                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 w-full outline-none focus:border-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/20 p-4 space-y-3">
                                        {filteredCategories.map(cat => {
                                            const isSelected = formData.selectedCategoryIds.includes(cat.id);
                                            const config = formData.categorySections[cat.id];
                                            const count = items.filter(i => i.categoryId === cat.id).length;

                                            return (
                                                <div key={cat.id} className={cn(
                                                    "p-4 rounded-2xl border transition-all flex items-start gap-4 bg-white",
                                                    isSelected ? "border-slate-900 shadow-md" : "border-slate-200"
                                                )}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={e => setCategorySelected(cat.id, e.target.checked)}
                                                        disabled={isReadOnly}
                                                        className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 disabled:opacity-60"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{cat.name}</span>
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                                <Package className="w-2.5 h-2.5" /> {count} items
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-1">{cat.description || 'No description available'}</p>
                                                        
                                                        {isSelected && config && (
                                                            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Display Name Override</label>
                                                                    <input
                                                                        value={config.displayName}
                                                                        onChange={e => updateSectionConfig(cat.id, { displayName: e.target.value })}
                                                                        disabled={isReadOnly}
                                                                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 mt-1 outline-none disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Section Type</label>
                                                                    <select
                                                                        value={config.sectionType}
                                                                        onChange={e => updateSectionConfig(cat.id, { sectionType: e.target.value as SectionType })}
                                                                        disabled={isReadOnly}
                                                                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 mt-1 outline-none disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed"
                                                                    >
                                                                        <option value="STANDARD">Standard Section</option>
                                                                        <option value="FEATURED">Featured Section</option>
                                                                        <option value="PROMO">Promo Section</option>
                                                                        <option value="DYNAMIC">Dynamic Section</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button onClick={() => setPreviewTarget({ type: 'category', id: cat.id })} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Preview metadata">
                                                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                        {/* STEP 3: Placement Config — Production-grade two-level DnD */}
                        {currentStep === 'PLACEMENT_CONFIG' && (() => {
                            const isReadOnly = !!editMenuId;
                            const searchLower = placementSearch.toLowerCase();

                            return (
                                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                    {/* Header */}
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 3: Placement Config</h3>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                            Arrange sections and items exactly as customers will see them. Drag sections to reorder, expand to sort individual items, toggle visibility and featured status.
                                        </p>
                                    </div>

                                    {formData.selectedCategoryIds.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-8 bg-slate-50/50">
                                            <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">No Categories Selected</span>
                                            <span className="text-[10px] text-slate-400 font-bold mt-1 max-w-sm text-center">
                                                Go back to Step 2 and select at least one category to configure placement.
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* ── Stats Toolbar ── */}
                                            <div className="flex items-center justify-between bg-slate-950 text-white rounded-2xl px-5 py-3 shrink-0">
                                                <div className="flex items-center gap-5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{placementStats.sections} Sections</span>
                                                    </div>
                                                    <div className="w-px h-4 bg-slate-700" />
                                                    <div className="flex items-center gap-1.5">
                                                        <Package className="w-3.5 h-3.5 text-sky-400" />
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{placementStats.totalItems} Items</span>
                                                    </div>
                                                    {placementStats.hiddenItems > 0 && (
                                                        <>
                                                            <div className="w-px h-4 bg-slate-700" />
                                                            <div className="flex items-center gap-1.5">
                                                                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                                                                <span className="text-[10px] font-black uppercase tracking-wider">{placementStats.hiddenItems} Hidden</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {placementStats.featuredItems > 0 && (
                                                        <>
                                                            <div className="w-px h-4 bg-slate-700" />
                                                            <div className="flex items-center gap-1.5">
                                                                <Star className="w-3.5 h-3.5 text-amber-400" />
                                                                <span className="text-[10px] font-black uppercase tracking-wider">{placementStats.featuredItems} Featured</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={expandAll} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[8px] font-black uppercase tracking-wider transition-colors">Expand All</button>
                                                    <button onClick={collapseAll} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[8px] font-black uppercase tracking-wider transition-colors">Collapse All</button>
                                                    <div className="relative ml-2">
                                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                                                        <input
                                                            type="text"
                                                            value={placementSearch}
                                                            onChange={e => setPlacementSearch(e.target.value)}
                                                            placeholder="Filter..."
                                                            className="pl-7 pr-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-semibold text-white w-36 outline-none focus:border-emerald-500 placeholder:text-slate-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── Section Cards with Nested Items ── */}
                                            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                                {formData.selectedCategoryIds.map((catId, sIdx) => {
                                                    const cat = categories.find(c => c.id === catId);
                                                    const sec = formData.categorySections[catId];
                                                    if (!cat || !sec) return null;

                                                    const isExpanded = expandedSections.has(catId);
                                                    const catItems = sec.includedItemIds
                                                        .map(id => items.find(i => i.id === id))
                                                        .filter(Boolean) as typeof items;
                                                    const filteredCatItems = searchLower
                                                        ? catItems.filter(i => i.name.toLowerCase().includes(searchLower) || i.sku.toLowerCase().includes(searchLower))
                                                        : catItems;

                                                    if (searchLower && filteredCatItems.length === 0 && !cat.name.toLowerCase().includes(searchLower)) return null;

                                                    const isSectionDragged = sectionDragIdx === sIdx;
                                                    const isSectionDropTarget = sectionDropIdx === sIdx;

                                                    return (
                                                        <div
                                                            key={catId}
                                                            draggable={!isReadOnly}
                                                            onDragStart={(e) => onSectionDragStart(e, sIdx)}
                                                            onDragOver={(e) => onSectionDragOver(e, sIdx)}
                                                            onDragEnd={onSectionDragEnd}
                                                            onDrop={(e) => onSectionDrop(e, sIdx)}
                                                            className={cn(
                                                                "border rounded-2xl bg-white transition-all duration-200 overflow-hidden",
                                                                isSectionDragged ? "opacity-30 border-dashed border-slate-300 scale-[0.98]" : "border-slate-200 hover:border-slate-300",
                                                                isSectionDropTarget && "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10"
                                                            )}
                                                        >
                                                            {/* ── Section Header ── */}
                                                            <div className={cn(
                                                                "flex items-center gap-3 px-4 py-3 transition-colors",
                                                                !sec.isVisible ? "bg-slate-50/80" : "bg-white",
                                                                !isReadOnly && "cursor-grab active:cursor-grabbing"
                                                            )}>
                                                                {!isReadOnly && (
                                                                    <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-500 shrink-0 transition-colors" />
                                                                )}
                                                                <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                                                                    {String(sIdx + 1).padStart(2, '0')}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider truncate">
                                                                            {sec.displayName || cat.name}
                                                                        </span>
                                                                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold uppercase tracking-widest shrink-0">
                                                                            {catItems.length} items
                                                                        </span>
                                                                        {sec.sectionType !== 'STANDARD' && (
                                                                            <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest shrink-0",
                                                                                sec.sectionType === 'FEATURED' ? "bg-amber-50 text-amber-600" :
                                                                                sec.sectionType === 'PROMO' ? "bg-violet-50 text-violet-600" : "bg-sky-50 text-sky-600"
                                                                            )}>
                                                                                {sec.sectionType}
                                                                            </span>
                                                                        )}
                                                                        {!sec.isVisible && (
                                                                            <span className="px-1.5 py-0.5 bg-rose-50 text-rose-500 rounded text-[8px] font-bold uppercase tracking-widest shrink-0">Hidden</span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Section Controls */}
                                                                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                                                    {/* Section Type */}
                                                                    <select
                                                                        value={sec.sectionType}
                                                                        onChange={e => updateSectionConfig(catId, { sectionType: e.target.value as SectionType })}
                                                                        disabled={isReadOnly}
                                                                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 outline-none cursor-pointer disabled:cursor-not-allowed"
                                                                    >
                                                                        <option value="STANDARD">Standard</option>
                                                                        <option value="FEATURED">Featured</option>
                                                                        <option value="PROMO">Promo</option>
                                                                        <option value="DYNAMIC">Dynamic</option>
                                                                    </select>
                                                                    {/* Visibility Toggle */}
                                                                    <button
                                                                        onClick={() => !isReadOnly && updateSectionConfig(catId, { isVisible: !sec.isVisible })}
                                                                        disabled={isReadOnly}
                                                                        className={cn("p-1.5 rounded-lg border transition-all",
                                                                            sec.isVisible ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-slate-50 text-slate-400"
                                                                        )}
                                                                        title={sec.isVisible ? "Section visible" : "Section hidden"}
                                                                    >
                                                                        {sec.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                                    </button>
                                                                    {/* Expand/Collapse */}
                                                                    <button
                                                                        onClick={() => toggleSection(catId)}
                                                                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all"
                                                                    >
                                                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* ── Expanded Item List ── */}
                                                            {isExpanded && (
                                                                <div className="border-t border-slate-100 bg-slate-50/30">
                                                                    {/* Display Name Override */}
                                                                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3 bg-white/60">
                                                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">Display Name</label>
                                                                        <input
                                                                            type="text"
                                                                            value={sec.displayName}
                                                                            onChange={e => updateSectionConfig(catId, { displayName: e.target.value })}
                                                                            disabled={isReadOnly}
                                                                            placeholder={cat.name}
                                                                            className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 outline-none focus:border-slate-900 disabled:bg-slate-100/60 max-w-xs"
                                                                        />
                                                                    </div>

                                                                    {/* Items */}
                                                                    <div className="divide-y divide-slate-100">
                                                                        {filteredCatItems.length === 0 ? (
                                                                            <div className="px-4 py-6 text-center">
                                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No items found</span>
                                                                            </div>
                                                                        ) : (
                                                                            filteredCatItems.map((item, iIdx) => {
                                                                                const isFeatured = sec.featuredItemIds.includes(item.id);
                                                                                const isHidden = sec.excludedItemIds.includes(item.id);
                                                                                const isItemDragged = itemDrag?.catId === catId && itemDrag?.idx === iIdx;
                                                                                const isItemDropTarget = itemDrag?.catId === catId && itemDropIdx === iIdx;

                                                                                return (
                                                                                    <div
                                                                                        key={item.id}
                                                                                        draggable={!isReadOnly}
                                                                                        onDragStart={(e) => onItemDragStart(e, catId, iIdx)}
                                                                                        onDragOver={(e) => onItemDragOver(e, iIdx)}
                                                                                        onDragEnd={onItemDragEnd}
                                                                                        onDrop={(e) => onItemDrop(e, catId, iIdx)}
                                                                                        className={cn(
                                                                                            "flex items-center gap-3 px-4 py-2.5 transition-all group/item",
                                                                                            isItemDragged ? "opacity-30 bg-slate-100" : "hover:bg-white",
                                                                                            isItemDropTarget && "bg-emerald-50 border-l-2 border-emerald-500",
                                                                                            isHidden && "opacity-50",
                                                                                            !isReadOnly && "cursor-grab active:cursor-grabbing"
                                                                                        )}
                                                                                    >
                                                                                        {!isReadOnly && (
                                                                                            <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-slate-400 shrink-0" />
                                                                                        )}
                                                                                        <Hash className="w-3 h-3 text-slate-300 shrink-0" />
                                                                                        <span className="text-[9px] font-mono text-slate-400 w-5 shrink-0">{String(iIdx + 1).padStart(2, '0')}</span>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <span className={cn("text-[10px] font-black uppercase tracking-wider block truncate", isHidden ? "text-slate-400 line-through" : "text-slate-800")}>
                                                                                                {item.name}
                                                                                            </span>
                                                                                            <span className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">
                                                                                                {item.sku} · ${item.baseProductPrice}
                                                                                            </span>
                                                                                        </div>

                                                                                        {/* Item Controls */}
                                                                                        <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover/item:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                                                            {/* Featured Toggle */}
                                                                                            <button
                                                                                                onClick={() => !isReadOnly && toggleItemFeatured(catId, item.id)}
                                                                                                disabled={isReadOnly}
                                                                                                className={cn("p-1 rounded-md border transition-all",
                                                                                                    isFeatured ? "bg-amber-50 text-amber-500 border-amber-200" : "bg-white text-slate-300 border-slate-200 hover:text-slate-500"
                                                                                                )}
                                                                                                title="Toggle featured"
                                                                                            >
                                                                                                <Star className="w-3 h-3" />
                                                                                            </button>
                                                                                            {/* Visibility Toggle */}
                                                                                            <button
                                                                                                onClick={() => !isReadOnly && toggleItemVisibility(catId, item.id)}
                                                                                                disabled={isReadOnly}
                                                                                                className={cn("p-1 rounded-md border transition-all",
                                                                                                    isHidden ? "bg-rose-50 text-rose-400 border-rose-200" : "bg-white text-emerald-500 border-slate-200 hover:text-emerald-600"
                                                                                                )}
                                                                                                title={isHidden ? "Show item" : "Hide item"}
                                                                                            >
                                                                                                {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })()}

                        {/* STEP 4: Store Deployment Flow */}
                        {currentStep === 'STORE_DEPLOYMENT' && (() => {
                            const isReadOnly = !!editMenuId;
                            return (
                                <div className="space-y-6 max-w-3xl">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 4: Store Deployment Flow</h3>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Determine which stores will have operational access to this menu</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => !isReadOnly && updateForm({ storeScope: 'ALL_STORES', selectedStoreIds: mockStores.map(s => s.id) })}
                                                disabled={isReadOnly}
                                                className={cn(
                                                    "flex-1 p-4 rounded-2xl border text-left transition-all",
                                                    formData.storeScope === 'ALL_STORES' ? "border-slate-900 bg-slate-950 text-white shadow-lg" : "border-slate-200 hover:border-slate-300",
                                                    isReadOnly && "cursor-not-allowed opacity-80"
                                                )}
                                            >
                                                <Building className="w-5 h-5 text-emerald-400 mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-wider block">All Stores Deployment</span>
                                                <span className="text-[8px] text-slate-400 font-bold block mt-1">Make menu active across all brand retail outlets</span>
                                            </button>

                                            <button
                                                onClick={() => !isReadOnly && updateForm({ storeScope: 'SPECIFIC_STORES', selectedStoreIds: [] })}
                                                disabled={isReadOnly}
                                                className={cn(
                                                    "flex-1 p-4 rounded-2xl border text-left transition-all",
                                                    formData.storeScope === 'SPECIFIC_STORES' ? "border-slate-900 bg-slate-950 text-white shadow-lg" : "border-slate-200 hover:border-slate-300",
                                                    isReadOnly && "cursor-not-allowed opacity-80"
                                                )}
                                            >
                                                <Building className="w-5 h-5 text-emerald-400 mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-wider block">Specific Outlets Only</span>
                                                <span className="text-[8px] text-slate-400 font-bold block mt-1">Select distinct stores manually based on region/city</span>
                                            </button>
                                        </div>

                                        {formData.storeScope === 'SPECIFIC_STORES' && (
                                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Select Target Stores</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Region Filter:</span>
                                                        <select
                                                            value={formData.regionFilter}
                                                            onChange={e => updateForm({ regionFilter: e.target.value })}
                                                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700 outline-none"
                                                        >
                                                            <option value="ALL">All Regions</option>
                                                            <option value="NORTH_AMERICA">North America</option>
                                                            <option value="EUROPE">Europe</option>
                                                            <option value="ASIA">Asia</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/30 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                                                    {filteredStores.map(store => {
                                                        const isChecked = formData.selectedStoreIds.includes(store.id);
                                                        return (
                                                            <label key={store.id} className={cn(
                                                                "p-2.5 rounded-xl border flex items-center gap-3 bg-white transition-all",
                                                                isChecked ? "border-slate-800" : "border-slate-200",
                                                                isReadOnly ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                                                            )}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={e => {
                                                                        const selectedStoreIds = e.target.checked
                                                                            ? [...formData.selectedStoreIds, store.id]
                                                                            : formData.selectedStoreIds.filter(id => id !== store.id);
                                                                        updateForm({ selectedStoreIds });
                                                                    }}
                                                                    disabled={isReadOnly}
                                                                    className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 disabled:opacity-60"
                                                                />
                                                                <div>
                                                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">{store.name}</span>
                                                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{store.city} ({store.region})</span>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* STEP 5: Channel Visibility Matrix */}
                        {currentStep === 'CHANNEL_MATRIX' && (() => {
                            const isReadOnly = !!editMenuId;
                            return (
                                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 5: Channel Visibility Matrix</h3>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Toggle channel integrations per store deployment target</p>
                                    </div>

                                    {!isReadOnly && (
                                        <div className="flex items-center gap-2 pb-2 shrink-0">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mr-2">Bulk Enable:</span>
                                            {CHANNELS.map(ch => (
                                                <div key={ch.id} className="flex items-center gap-1 border border-slate-200 px-2 py-1 rounded-lg">
                                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">{ch.label}</span>
                                                    <button onClick={() => bulkApplyChannels(ch.id as MenuChannelType, true)} className="text-[8px] font-black text-emerald-600 uppercase hover:underline ml-1">On</button>
                                                    <button onClick={() => bulkApplyChannels(ch.id as MenuChannelType, false)} className="text-[8px] font-black text-rose-600 uppercase hover:underline ml-1">Off</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex-1 border border-slate-100 rounded-2xl overflow-hidden flex flex-col min-h-0 bg-white shadow-inner">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-950 text-white text-[8px] font-black uppercase tracking-widest divide-x divide-slate-800">
                                                    <th className="p-3 w-48">Store Location</th>
                                                    {CHANNELS.map(ch => (
                                                        <th key={ch.id} className="p-3 text-center">{ch.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 overflow-y-auto text-[10px] font-bold">
                                                {formData.selectedStoreIds.map(storeId => {
                                                    const store = mockStores.find(s => s.id === storeId);
                                                    const storeChannels = formData.storeChannelMatrix[storeId] || {};
                                                    return (
                                                        <tr key={storeId} className="hover:bg-slate-50 divide-x divide-slate-100">
                                                            <td className="p-3">
                                                                <span className="font-black text-slate-800 uppercase tracking-wider block">{store?.name}</span>
                                                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{store?.city}</span>
                                                            </td>
                                                            {CHANNELS.map(ch => {
                                                                const isChecked = storeChannels[ch.id as MenuChannelType] ?? false;
                                                                return (
                                                                    <td key={ch.id} className="p-3 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={e => setStoreChannelMatrix(storeId, ch.id as MenuChannelType, e.target.checked)}
                                                                            disabled={isReadOnly}
                                                                            className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 disabled:opacity-60"
                                                                        />
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* STEP 6: Scheduling Engine */}
                        {currentStep === 'SCHEDULING' && (() => {
                            const currentStoreId = activeScheduleStoreId || formData.selectedStoreIds[0] || '';
                            const currentStoreObj = mockStores.find(s => s.id === currentStoreId);
                            
                            const storeChannelsMap = formData.storeChannelMatrix[currentStoreId] || {};
                            const enabledChannels = CHANNELS.filter(ch => storeChannelsMap[ch.id as MenuChannelType] === true);
                            
                            const activeChannelId = enabledChannels.some(c => c.id === activeScheduleChannelId)
                                ? activeScheduleChannelId
                                : (enabledChannels[0]?.id || 'POS');
                            const activeChannelObj = CHANNELS.find(c => c.id === activeChannelId) || CHANNELS[0];

                            const scheduleKey = `${currentStoreId}:${activeChannelId}`;
                            const storeSched = formData.storeSchedules[scheduleKey] || {
                                isAlwaysActive: false,
                                effectiveFrom: '',
                                effectiveUntil: '',
                                activeDays: [
                                    { day: 'MON', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'TUE', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'WED', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'THU', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'FRI', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'SAT', startTime: '09:00', endTime: '22:00', isActive: true },
                                    { day: 'SUN', startTime: '09:00', endTime: '22:00', isActive: true },
                                ]
                            };

                            const handleUpdateStoreSched = (up: Partial<typeof storeSched>) => {
                                setStoreSchedule(scheduleKey, up);
                            };

                            const handleToggleDay = (dayCode: string) => {
                                const activeDays = storeSched.activeDays.map(d => {
                                    if (d.day === dayCode) return { ...d, isActive: !d.isActive };
                                    return d;
                                });
                                setStoreSchedule(scheduleKey, { activeDays });
                            };

                            const handleUpdateTimes = (startTime: string, endTime: string) => {
                                const activeDays = storeSched.activeDays.map(d => ({ ...d, startTime, endTime }));
                                setStoreSchedule(scheduleKey, { activeDays });
                            };

                            // Get common start/end times from the first active day, or default
                            const firstActiveDay = storeSched.activeDays.find(d => d.isActive) || storeSched.activeDays[0];
                            const commonStartTime = firstActiveDay?.startTime || '09:00';
                            const commonEndTime = firstActiveDay?.endTime || '22:00';

                            return (
                                <div className="space-y-4 flex-1 flex flex-col min-h-0 w-full">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 6: Scheduling Engine</h3>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Configure distinct active days, dates, and times for each store and selected channel separately</p>
                                    </div>

                                    <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                                        {/* Store tabs */}
                                        <div className="w-52 border border-slate-100 rounded-2xl bg-slate-50/50 p-2 space-y-1 overflow-y-auto shrink-0">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-2 mb-2">Store Schedule Contexts</span>
                                            {formData.selectedStoreIds.map(sid => {
                                                const st = mockStores.find(s => s.id === sid);
                                                const isActiveTab = currentStoreId === sid;

                                                return (
                                                    <button
                                                        key={sid}
                                                        onClick={() => {
                                                            setActiveScheduleStoreId(sid);
                                                            setActiveScheduleChannelId(''); // reset channel tab on store change
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between",
                                                            isActiveTab ? "bg-slate-950 text-white shadow-md" : "hover:bg-slate-200/50 text-slate-700"
                                                        )}
                                                    >
                                                        <div className="truncate mr-2">
                                                            <span className="text-[10px] font-black uppercase tracking-wider block truncate">{st?.name}</span>
                                                            <span className="text-[8px] opacity-70 block">{st?.city}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Schedule Config form for selected store */}
                                        {currentStoreId ? (
                                            <div className="flex-1 border border-slate-100 rounded-2xl p-5 bg-white space-y-4 overflow-y-auto flex flex-col">
                                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                                                    <div>
                                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block">{currentStoreObj?.name}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{currentStoreObj?.city} · {currentStoreObj?.region}</span>
                                                    </div>
                                                    {!isReadOnly && (
                                                        <button
                                                            onClick={() => applyStoreScheduleToAll(scheduleKey)}
                                                            className="px-3 py-1.5 border border-slate-200 hover:border-slate-900 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
                                                        >
                                                            Apply this schedule to all stores
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Active Channel Tabs for selected store */}
                                                {enabledChannels.length > 0 ? (
                                                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 shrink-0 overflow-x-auto">
                                                        {enabledChannels.map(ch => {
                                                            const isChActive = activeChannelId === ch.id;
                                                            return (
                                                                <button
                                                                    key={ch.id}
                                                                    onClick={() => setActiveScheduleChannelId(ch.id)}
                                                                    className={cn(
                                                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                                                                        isChActive
                                                                            ? "bg-slate-900 text-white shadow-sm"
                                                                            : "bg-slate-50 text-slate-500 border border-slate-200/60 hover:text-slate-900"
                                                                    )}
                                                                >
                                                                    {ch.icon}
                                                                    {ch.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[10px] font-medium flex items-center gap-2 shrink-0">
                                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                        No channels are enabled for this store. Please enable channels in Step 5.
                                                    </div>
                                                )}

                                                {enabledChannels.length > 0 && (
                                                    <div className="space-y-5 flex-1 pt-1">
                                                        <div className="flex items-center justify-between pb-1 border-b border-slate-50">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                Timings & Dates for {activeChannelObj.label}
                                                            </span>
                                                        </div>

                                                        {/* Week Days Selector (Default selected all) */}
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Weekdays (Default All Selected)</label>
                                                            <div className="flex items-center gap-1.5">
                                                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => {
                                                                    const dayData = storeSched.activeDays.find(d => d.day === day) || { day, isActive: true };
                                                                    const isSelected = dayData.isActive;
                                                                    return (
                                                                        <button
                                                                            key={day}
                                                                            type="button"
                                                                            onClick={() => !isReadOnly && handleToggleDay(day)}
                                                                            disabled={isReadOnly}
                                                                            className={cn(
                                                                                "w-10 h-10 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center border shadow-sm",
                                                                                isSelected
                                                                                    ? "bg-emerald-500 text-white border-emerald-500"
                                                                                    : "bg-white text-slate-400 border-slate-200",
                                                                                !isReadOnly && isSelected && "hover:bg-emerald-600 scale-105",
                                                                                !isReadOnly && !isSelected && "hover:border-slate-300",
                                                                                isReadOnly && "cursor-not-allowed opacity-80"
                                                                            )}
                                                                        >
                                                                            {day.slice(0, 2)}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Date Range Config */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                                                                <input
                                                                    type="date"
                                                                    value={storeSched.effectiveFrom || ''}
                                                                    onChange={e => handleUpdateStoreSched({ effectiveFrom: e.target.value })}
                                                                    disabled={isReadOnly}
                                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition-all disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">End Date</label>
                                                                <input
                                                                    type="date"
                                                                    value={storeSched.effectiveUntil || ''}
                                                                    onChange={e => handleUpdateStoreSched({ effectiveUntil: e.target.value })}
                                                                    disabled={isReadOnly}
                                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition-all disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Time Range Config */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={commonStartTime}
                                                                    onChange={e => handleUpdateTimes(e.target.value, commonEndTime)}
                                                                    disabled={isReadOnly}
                                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition-all disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">End Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={commonEndTime}
                                                                    onChange={e => handleUpdateTimes(commonStartTime, e.target.value)}
                                                                    disabled={isReadOnly}
                                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition-all disabled:bg-slate-100/60 disabled:text-slate-600 disabled:cursor-not-allowed"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl text-[10px] text-slate-400 font-bold uppercase">
                                                Select a store to configure its custom schedule timings
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* STEP 7: Deployment Summary */}
                        {currentStep === 'DEPLOYMENT_SUMMARY' && (
                            <div className="space-y-5 max-w-4xl flex flex-col h-full min-h-0 w-full">
                                <div className="shrink-0">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Step 7: Deployment Summary</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Validate configuration parameters before menu execution activation</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 shrink-0">
                                    <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Structural Metrics</span>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                            <div>Mapped Categories:</div>
                                            <div className="text-right text-slate-900 font-black">{formData.selectedCategoryIds.length}</div>
                                            <div>Total Items Mapped:</div>
                                            <div className="text-right text-slate-900 font-black">
                                                {Object.values(formData.categorySections).reduce((sum, s) => sum + s.includedItemIds.length, 0)}
                                            </div>
                                            <div>Active Stores:</div>
                                            <div className="text-right text-slate-900 font-black">
                                                {formData.storeScope === 'ALL_STORES' ? 'ALL STORES' : formData.selectedStoreIds.length}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Release Strategy</span>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                            <div>Channel Target:</div>
                                            <div className="text-right text-slate-900 font-black">{formData.primaryChannel}</div>
                                            <div>Schedule:</div>
                                            <div className="text-right text-slate-900 font-black">
                                                {formData.globalSchedule.isAlwaysActive ? '24 / 7 ALWAYS' : 'TIMED CAMPAIGN'}
                                            </div>
                                            <div>Status Mode:</div>
                                            <div className="text-right text-slate-900 font-black">
                                                {formData.isDefault ? 'CHANNEL DEFAULT' : 'SUB-MENU LAYER'}
                                            </div>
                                            <div>Deployment Status:</div>
                                            <div className="text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => updateForm({
                                                        publishStatus: formData.publishStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
                                                    })}
                                                    className={cn(
                                                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all",
                                                        formData.publishStatus === 'PUBLISHED'
                                                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                            : "bg-slate-300 text-slate-700 hover:bg-slate-400"
                                                    )}
                                                >
                                                    {formData.publishStatus === 'PUBLISHED' ? 'ACTIVE' : 'INACTIVE (DRAFT)'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mapped Assets Review Details */}
                                <div className="border border-slate-100 rounded-2xl bg-slate-50/50 p-4 space-y-3 shrink-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Detailed Mapped Assets Review</span>
                                        <div className="flex items-center gap-1.5">
                                            {(['categories', 'stores', 'schedules'] as const).map(tab => (
                                                <button
                                                    key={tab}
                                                    type="button"
                                                    onClick={() => setReviewTab(tab)}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-colors",
                                                        reviewTab === tab
                                                            ? "bg-slate-950 text-white"
                                                            : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200"
                                                    )}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-slate-200/60 p-3 max-h-36 overflow-y-auto text-[10px] font-bold text-slate-700">
                                        {reviewTab === 'categories' && (
                                            <div className="space-y-3">
                                                {formData.selectedCategoryIds.map(catId => {
                                                    const cat = categories.find(c => c.id === catId);
                                                    const sec = formData.categorySections[catId];
                                                    if (!cat || !sec) return null;
                                                    
                                                    const categoryItems = items.filter(i => sec.includedItemIds.includes(i.id));

                                                    return (
                                                        <div key={catId} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-slate-900 uppercase font-black">{sec.displayName || cat.name}</span>
                                                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[7px] uppercase font-black">
                                                                    {sec.sectionType} · {categoryItems.length} ITEMS
                                                                </span>
                                                            </div>
                                                            <div className="text-[9px] text-slate-400 font-medium mt-1 truncate">
                                                                {categoryItems.map(i => i.name).join(', ') || 'No items included'}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {reviewTab === 'stores' && (
                                            <div className="space-y-2">
                                                {formData.selectedStoreIds.length === 0 ? (
                                                    <div className="text-slate-400 text-center py-2 uppercase text-[9px]">All stores targeted (Scope: Global)</div>
                                                ) : (
                                                    formData.selectedStoreIds.map(storeId => {
                                                        const store = mockStores.find(s => s.id === storeId);
                                                        const storeChannels = formData.storeChannelMatrix[storeId] || {};
                                                        const activeCh = Object.entries(storeChannels)
                                                            .filter(([_, active]) => active)
                                                            .map(([ch]) => ch);

                                                        return (
                                                            <div key={storeId} className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                                                                <span className="text-slate-900 uppercase">{store?.name} ({store?.city})</span>
                                                                <div className="flex gap-1">
                                                                    {activeCh.map(ch => (
                                                                        <span key={ch} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[7px] font-black uppercase">
                                                                            {ch}
                                                                        </span>
                                                                    ))}
                                                                    {activeCh.length === 0 && (
                                                                        <span className="text-slate-400 text-[8px] uppercase">No Channels Enabled</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}

                                        {reviewTab === 'schedules' && (
                                            <div className="space-y-2">
                                                {formData.selectedStoreIds.map(storeId => {
                                                    const store = mockStores.find(s => s.id === storeId);
                                                    const storeChannels = formData.storeChannelMatrix[storeId] || {};
                                                    const activeChannels = Object.keys(storeChannels).filter(ch => storeChannels[ch as MenuChannelType]);

                                                    return (
                                                        <div key={storeId} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                                            <span className="text-slate-900 uppercase block font-black mb-1">{store?.name}</span>
                                                            <div className="space-y-1 pl-2">
                                                                {activeChannels.map(ch => {
                                                                    const scheduleKey = `${storeId}:${ch}`;
                                                                    const sched = formData.storeSchedules[scheduleKey] || formData.globalSchedule;
                                                                    const activeDays = sched.activeDays.filter(d => d.isActive).map(d => d.day);

                                                                    return (
                                                                        <div key={ch} className="flex items-center justify-between text-[9px]">
                                                                            <span className="text-slate-500 font-bold uppercase">{ch} schedule:</span>
                                                                            <span className="text-slate-700 font-black">
                                                                                {sched.isAlwaysActive 
                                                                                    ? "24/7 Always Active" 
                                                                                    : `${activeDays.join(', ')} [${sched.activeDays[0]?.startTime || '09:00'} - ${sched.activeDays[0]?.endTime || '22:00'}]`}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                                {activeChannels.length === 0 && (
                                                                    <span className="text-slate-400 text-[8px] uppercase">No Channels Configured</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Catalog Quality & Integrity Audit */}
                                <div className="flex-1 border border-slate-100 rounded-2xl overflow-hidden bg-white flex flex-col min-h-0 shadow-sm">
                                    <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Shield className={cn("w-4.5 h-4.5", hasCriticalErrors ? "text-rose-400 animate-pulse" : "text-emerald-400")} />
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest block">Catalog Quality & Integrity Audit</span>
                                                <span className="text-[8px] text-slate-400 font-bold block mt-0.5">Validating metadata, pricing integrity, and active settings</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                                            <button
                                                type="button"
                                                onClick={() => setAuditMode('STANDARD')}
                                                className={cn(
                                                    "px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                                                    auditMode === 'STANDARD' ? "bg-slate-900 text-white shadow text-slate-100" : "text-slate-400 hover:text-white"
                                                )}
                                            >
                                                Standard Audit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAuditMode('STRICT')}
                                                className={cn(
                                                    "px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                                                    auditMode === 'STRICT' ? "bg-slate-900 text-white shadow text-slate-100" : "text-slate-400 hover:text-white"
                                                )}
                                            >
                                                Deep Audit (Strict)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Issue List */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                                        {complianceIssues.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                                                    <Check className="w-6 h-6" />
                                                </div>
                                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest block">All Quality Standards Met</span>
                                                <p className="text-[9px] text-slate-400 font-bold max-w-sm mt-1">
                                                    This menu is 100% compliant with standard catalog quality rules and pricing matrices.
                                                </p>
                                            </div>
                                        ) : (
                                            complianceIssues.map(issue => (
                                                <div
                                                    key={issue.id}
                                                    className={cn(
                                                        "p-3 rounded-xl border flex items-start gap-3 transition-all",
                                                        issue.severity === 'error'
                                                            ? "bg-rose-50/50 border-rose-100 hover:bg-rose-50"
                                                            : "bg-amber-50/40 border-amber-100 hover:bg-amber-50/60"
                                                    )}
                                                >
                                                    <AlertTriangle className={cn(
                                                        "w-4 h-4 mt-0.5 shrink-0",
                                                        issue.severity === 'error' ? "text-rose-500" : "text-amber-500"
                                                    )} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider truncate">
                                                                {issue.title}
                                                            </span>
                                                            <span className={cn(
                                                                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0",
                                                                issue.severity === 'error' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                                            )}>
                                                                {issue.severity}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] text-slate-500 font-medium mt-1 leading-relaxed">
                                                            {issue.message}
                                                        </p>
                                                        <div className="mt-1.5 flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                                            <span>Target Object:</span>
                                                            <span className="text-slate-600 font-black">{issue.targetName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Action Alert Banner */}
                                    {hasCriticalErrors && (
                                        <div className="px-4 py-3 bg-rose-50 border-t border-rose-100 flex items-center justify-between shrink-0">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
                                                <div>
                                                    <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest block">Critical Catalog Errors Detected</span>
                                                    <p className="text-[9px] text-rose-500 font-bold mt-0.5">
                                                        Upstream digital channels will reject sync updates until these are resolved.
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-rose-200 shadow-sm cursor-pointer hover:bg-rose-100/30 transition-all select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={bypassCompliance}
                                                    onChange={e => setBypassCompliance(e.target.checked)}
                                                    className="w-3.5 h-3.5 text-rose-600 border-rose-300 rounded focus:ring-rose-500"
                                                />
                                                <span className="text-[9px] font-black text-rose-800 uppercase tracking-widest">
                                                    Bypass & Draft
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Contextual Preview Drawer (Static/Slide style) */}
                    {previewTarget && (
                        <div className="w-80 border-l border-slate-100 bg-slate-50/50 flex flex-col h-full shrink-0 overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Preview Drawer</span>
                                <button onClick={() => setPreviewTarget(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                    <X className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                            </div>

                            {previewedCategory && (
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Category Asset</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Category Name</span>
                                        <span className="text-xs font-bold text-slate-800 block mt-0.5">{previewedCategory.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Description</span>
                                        <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{previewedCategory.description || 'No description provided'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Linked Products Count</span>
                                        <span className="text-xs font-mono font-bold text-slate-800 mt-1 block">
                                            {items.filter(i => i.categoryId === previewedCategory.id).length} products
                                        </span>
                                    </div>
                                </div>
                            )}

                            {previewedItem && (
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Product Asset</span>
                                    </div>
                                    {previewedItem.imageUrl && (
                                        <img src={previewedItem.imageUrl} alt={previewedItem.name} className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                                    )}
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Product Name</span>
                                        <span className="text-xs font-bold text-slate-800 block mt-0.5">{previewedItem.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">SKU Identity</span>
                                        <span className="text-[10px] font-mono text-slate-600 block mt-0.5">{previewedItem.sku}</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Base Pricing</span>
                                        <span className="text-xs font-bold text-slate-800 mt-0.5 block">${previewedItem.baseProductPrice}</span>
                                    </div>
                                    {previewedItem.tags && previewedItem.tags.length > 0 && (
                                        <div>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Product Tags</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {previewedItem.tags.map(t => (
                                                    <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[8px] font-bold uppercase">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Action Footer ────────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 'BASIC_DETAILS'}
                        className="px-4 py-2 text-[10px] font-black text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest transition-colors flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Prev Step
                    </button>

                    {currentStep === 'DEPLOYMENT_SUMMARY' ? (
                        editMenuId ? (
                            <button
                                onClick={closeWizard}
                                className="px-5 py-2 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2"
                            >
                                <Check className="w-4 h-4 text-emerald-400" /> Close View
                            </button>
                        ) : (
                            <button
                                onClick={submitMenu}
                                disabled={hasCriticalErrors && !bypassCompliance}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg",
                                    (hasCriticalErrors && !bypassCompliance)
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        : "bg-slate-950 text-white hover:bg-slate-900"
                                )}
                            >
                                <Check className="w-4 h-4 text-emerald-400" /> Complete & Submit
                            </button>
                        )
                    ) : (
                        <button
                            onClick={handleNextStep}
                            className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-950 text-white hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg"
                        >
                            Next Step <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </div>
    );
};
