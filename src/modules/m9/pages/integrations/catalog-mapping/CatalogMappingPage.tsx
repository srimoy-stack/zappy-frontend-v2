'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft,
    Save,
    Download,
    Link,
    Unlink,
    AlertTriangle,
    CheckCircle2,
    RotateCcw,
    Search,
    ChevronRight,
    Loader2,
    Info,
    Sparkles,
    Filter,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import {
    CatalogItemMapping,
    CatalogVariantMapping,
    CatalogModifierGroupMapping,
    CatalogModifierOptionMapping,
} from '../../../types/catalog-mapping';
import { getAutoSuggestion } from '../../../utils/mappingUtils';
import { cn } from '@/utils';

/**
 * CatalogMappingPage
 * M9-T13: Map Zyappy items, variants and modifiers to external provider (Uber/DoorDash) fields.
 */
export const CatalogMappingPage: React.FC = () => {
    const router = useRouter();
    const { role } = useRouteAccess();
    const canEdit = role === 'ADMIN' || role === 'STORE_MANAGER' || role === 'BRAND_ADMIN' || role === 'PLATFORM_SUPER_ADMIN';

    const [activeTab, setActiveTab] = useState<'items' | 'variants' | 'groups' | 'options'>('items');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // State for all mapping types
    const [items, setItems] = useState<CatalogItemMapping[]>([]);
    const [variants, setVariants] = useState<CatalogVariantMapping[]>([]);
    const [groups, setGroups] = useState<CatalogModifierGroupMapping[]>([]);
    const [options, setOptions] = useState<CatalogModifierOptionMapping[]>([]);

    // External available entities (Mocked)
    const [externalItems] = useState([
        { id: 'ext-i1', name: 'Original Burger' },
        { id: 'ext-i2', name: 'Classic Cheezy Pizza' },
        { id: 'ext-i3', name: 'Veggie Supreme' },
        { id: 'ext-i4', name: 'Farmhouse Special' }
    ]);


    useEffect(() => {
        loadMockData();
    }, []);

    const loadMockData = async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1000));

        const mockItems: CatalogItemMapping[] = [
            { id: 'm1', zyappyItemId: 'z1', zyappyItemName: 'Farmhouse Pizza', externalItemId: 'ext-i4', externalItemName: 'Farmhouse Special', status: 'PUBLISHED', lastPublishedAt: '2026-02-20T12:00:00Z', mappingStatus: 'MAPPED' },
            { id: 'm2', zyappyItemId: 'z2', zyappyItemName: 'Margherita Pizza', externalItemId: '', externalItemName: '', status: 'PENDING', lastPublishedAt: null, mappingStatus: 'UNMAPPED' },
            { id: 'm3', zyappyItemId: 'z3', zyappyItemName: 'Veggie Delight', externalItemId: '', externalItemName: '', status: 'PENDING', lastPublishedAt: null, mappingStatus: 'UNMAPPED' }
        ];

        const mockVariants: CatalogVariantMapping[] = [
            { id: 'v1', zyappyVariantId: 'zv1', zyappyVariantName: 'Small', externalVariantId: 'ext-v1', externalVariantName: 'Small', mappingStatus: 'MAPPED', parentItemId: 'z1' },
            { id: 'v2', zyappyVariantId: 'zv2', zyappyVariantName: 'Regular', externalVariantId: '', externalVariantName: '', mappingStatus: 'UNMAPPED', parentItemId: 'z1' }
        ];

        const mockGroups: CatalogModifierGroupMapping[] = [
            { id: 'g1', zyappyGroupId: 'zg1', zyappyGroupName: 'Toppings', externalGroupId: 'eg1', externalGroupName: 'Pizza Toppings', groupType: 'PLACEMENT_TOPPING', mappingStatus: 'MAPPED' },
            { id: 'g2', zyappyGroupId: 'zg2', zyappyGroupName: 'Crust', externalGroupId: '', externalGroupName: '', groupType: 'CHOICE_ONE', mappingStatus: 'UNMAPPED' }
        ];

        const mockOptions: CatalogModifierOptionMapping[] = [
            { id: 'o1', zyappyOptionId: 'zo1', zyappyOptionName: 'Extra Cheese', externalOptionId: 'eo1', externalOptionName: 'Double Cheese', mappingStatus: 'MAPPED', parentGroupId: 'zg1' },
            { id: 'o2', zyappyOptionId: 'zo2', zyappyOptionName: 'Onion', externalOptionId: '', externalOptionName: '', mappingStatus: 'UNMAPPED', parentGroupId: 'zg1' }
        ];

        // Apply auto-suggestions to unmapped items
        const itemsWithSuggestions = mockItems.map(item => {
            if (item.mappingStatus === 'UNMAPPED') {
                const suggestion = getAutoSuggestion(item.zyappyItemName, externalItems);
                if (suggestion) {
                    return { ...item, suggestedMapping: suggestion.suggestion.id, confidenceScore: suggestion.score };
                }
            }
            return item;
        });

        setItems(itemsWithSuggestions);
        setVariants(mockVariants);
        setGroups(mockGroups);
        setOptions(mockOptions);
        setIsLoading(false);
    };

    // Calculation for completion %
    const completionStats = useMemo(() => {
        const total = items.length + variants.length + groups.length + options.length;
        const mapped = items.filter(i => i.mappingStatus === 'MAPPED').length +
            variants.filter(v => v.mappingStatus === 'MAPPED').length +
            groups.filter(g => g.mappingStatus === 'MAPPED').length +
            options.filter(o => o.mappingStatus === 'MAPPED').length;

        return {
            total,
            mapped,
            percentage: total > 0 ? Math.round((mapped / total) * 100) : 0
        };
    }, [items, variants, groups, options]);

    const handleApplySuggestion = (itemId: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId && item.suggestedMapping) {
                const ext = externalItems.find(ex => ex.id === item.suggestedMapping);
                return {
                    ...item,
                    externalItemId: item.suggestedMapping,
                    externalItemName: ext?.name || '',
                    mappingStatus: 'MAPPED',
                    suggestedMapping: undefined
                };
            }
            return item;
        }));
    };

    const handleMapManual = (id: string, type: string, extId: string, extName: string) => {
        if (type === 'items') {
            setItems(prev => prev.map(i => i.id === id ? { ...i, externalItemId: extId, externalItemName: extName, mappingStatus: extId ? 'MAPPED' : 'UNMAPPED' } : i));
        } else if (type === 'variants') {
            setVariants(prev => prev.map(i => i.id === id ? { ...i, externalVariantId: extId, externalVariantName: extName, mappingStatus: extId ? 'MAPPED' : 'UNMAPPED' } : i));
        } else if (type === 'groups') {
            setGroups(prev => prev.map(i => i.id === id ? { ...i, externalGroupId: extId, externalGroupName: extName, mappingStatus: extId ? 'MAPPED' : 'UNMAPPED' } : i));
        } else if (type === 'options') {
            setOptions(prev => prev.map(i => i.id === id ? { ...i, externalOptionId: extId, externalOptionName: extName, mappingStatus: extId ? 'MAPPED' : 'UNMAPPED' } : i));
        }
    };

    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishResults, setPublishResults] = useState<{
        unmappedItems: string[];
        unmappedVariants: string[];
        unmappedGroups: string[];
        unmappedOptions: string[];
        totalValid: number;
    } | null>(null);

    const canPublish = role === 'ADMIN' || role === 'STORE_MANAGER' || role === 'BRAND_ADMIN' || role === 'PLATFORM_SUPER_ADMIN';

    const handlePublish = () => {
        if (!canPublish) return;

        // 1. Validate
        const unmappedI = items.filter(i => i.mappingStatus === 'UNMAPPED').map(i => i.zyappyItemName);
        const unmappedV = variants.filter(v => v.mappingStatus === 'UNMAPPED').map(v => v.zyappyVariantName);
        const unmappedG = groups.filter(g => g.mappingStatus === 'UNMAPPED').map(g => g.zyappyGroupName);
        const unmappedO = options.filter(o => o.mappingStatus === 'UNMAPPED').map(o => o.zyappyOptionName);

        const totalValid = (items.length - unmappedI.length) +
            (variants.length - unmappedV.length) +
            (groups.length - unmappedG.length) +
            (options.length - unmappedO.length);

        setPublishResults({
            unmappedItems: unmappedI,
            unmappedVariants: unmappedV,
            unmappedGroups: unmappedG,
            unmappedOptions: unmappedO,
            totalValid
        });
        setShowPublishModal(true);
    };

    const confirmPublish = async () => {
        setIsSaving(true);
        setShowPublishModal(false);

        // Mock API call
        await new Promise(r => setTimeout(r, 2000));

        // 3. Update last_published_at and clear flag (Mock)
        const now = new Date().toISOString();
        setItems(prev => prev.map(i => i.mappingStatus === 'MAPPED' ? { ...i, lastPublishedAt: now, status: 'PUBLISHED' } : i));

        setIsSaving(false);
        alert('Partial publish successful! Mapped items are now live. Flags cleared.');
    };

    const exportToCSV = () => {
        alert('Exporting mapping configuration to CSV...');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Catalog Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto pb-24 space-y-8 animate-in fade-in duration-500 p-6">
            {/* Nav Header */}
            <div className="flex items-center justify-between sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200 -mx-6 px-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 hover:bg-white rounded-xl transition-all border border-slate-200 shadow-sm group">
                        <ArrowLeft size={18} className="text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">External Catalog Mapping</h1>
                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100 shadow-sm shadow-amber-50">
                                <Sparkles size={12} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Auto-Suggest Active</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Map Zyappy products & modifiers to Uber Eats / DoorDash merchant IDs.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl text-[13px] font-black hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm">
                        <Download size={16} />
                        Export CSV
                    </button>
                    <button onClick={() => { setIsSaving(true); setTimeout(() => { setIsSaving(false); alert('Mapping saved successfully!'); }, 1500); }} disabled={!canEdit} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl text-[13px] font-black hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Mapping
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={!canPublish || isSaving}
                        className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-[13px] font-black hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-xl shadow-emerald-100 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                        Publish Menu
                    </button>
                </div>
            </div>

            {/* Publish Validation Modal */}
            {showPublishModal && publishResults && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Review Publish Summary</h2>
                                    <p className="text-sm text-slate-500 font-medium">Validation completed. See below for blocked items.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPublishModal(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                                <RotateCcw size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
                            {(publishResults.unmappedItems.length > 0 || publishResults.unmappedVariants.length > 0 || publishResults.unmappedGroups.length > 0) ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                                        <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">Blocked Components (Unmapped)</h3>
                                        <p className="text-[11px] text-rose-500 font-medium leading-relaxed">
                                            The following entities will NOT be published as they lack external mapping IDs.
                                        </p>
                                    </div>

                                    {publishResults.unmappedItems.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Items ({publishResults.unmappedItems.length})</span>
                                            <div className="flex flex-wrap gap-2">
                                                {publishResults.unmappedItems.map(name => (
                                                    <span key={name} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">{name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {publishResults.unmappedVariants.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Variants ({publishResults.unmappedVariants.length})</span>
                                            <div className="flex flex-wrap gap-2">
                                                {publishResults.unmappedVariants.map(name => (
                                                    <span key={name} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">{name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {publishResults.unmappedGroups.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mod Groups ({publishResults.unmappedGroups.length})</span>
                                            <div className="flex flex-wrap gap-2">
                                                {publishResults.unmappedGroups.map(name => (
                                                    <span key={name} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">{name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex flex-col items-center text-center space-y-3">
                                    <CheckCircle2 size={32} className="text-emerald-500" />
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Full Sync Ready</h3>
                                        <p className="text-xs text-emerald-600 font-medium">All components are fully mapped and ready for export.</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-600">Total Valid Components:</span>
                                    <span className="font-black text-slate-900">{publishResults.totalValid} Entity IDs</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowPublishModal(false)}
                                className="px-6 py-3 text-slate-600 text-[13px] font-black hover:text-slate-900 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPublish}
                                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[13px] font-black hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
                            >
                                Proceed with Partial Publish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats & Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">MAPPING COMPLETION</span>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-black text-slate-900">{completionStats.percentage}%</span>
                            <span className="text-xs font-bold text-slate-400 mb-2">({completionStats.mapped}/{completionStats.total})</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            style={{ width: `${completionStats.percentage}%` }}
                        />
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Filter Zyappy items, categories or external IDs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all active:scale-95">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] w-fit border border-slate-200">
                {(['items', 'variants', 'groups', 'options'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === tab
                                ? "bg-white text-slate-900 shadow-lg shadow-slate-200/50"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zyappy Entity</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mapping Configuration</th>
                            {activeTab === 'items' && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>}
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {activeTab === 'items' && items.map(item => (
                            <MappingRow
                                key={item.id}
                                type="items"
                                item={item}
                                isRedHighlight={item.mappingStatus === 'UNMAPPED'}
                                onMap={(extId: string, extName: string) => handleMapManual(item.id, 'items', extId, extName)}
                                onApplySuggestion={() => handleApplySuggestion(item.id)}
                            />
                        ))}
                        {activeTab === 'variants' && variants.map(v => (
                            <MappingRow
                                key={v.id}
                                type="variants"
                                item={v}
                                isRedHighlight={v.mappingStatus === 'UNMAPPED'}
                                onMap={(extId: string, extName: string) => handleMapManual(v.id, 'variants', extId, extName)}
                            />
                        ))}
                        {activeTab === 'groups' && groups.map(g => (
                            <MappingRow
                                key={g.id}
                                type="groups"
                                item={g}
                                isRedHighlight={g.mappingStatus === 'UNMAPPED'}
                                onMap={(extId: string, extName: string) => handleMapManual(g.id, 'groups', extId, extName)}
                            />
                        ))}
                        {activeTab === 'options' && options.map(o => (
                            <MappingRow
                                key={o.id}
                                type="options"
                                item={o}
                                isRedHighlight={o.mappingStatus === 'UNMAPPED'}
                                onMap={(extId: string, extName: string) => handleMapManual(o.id, 'options', extId, extName)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface MappingRowProps {
    type: 'items' | 'variants' | 'groups' | 'options';
    item: any;
    isRedHighlight: boolean;
    onMap: (extId: string, extName: string) => void;
    onApplySuggestion?: () => void;
}

const MappingRow = ({ type, item, isRedHighlight, onMap, onApplySuggestion }: MappingRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localId, setLocalId] = useState('');
    const [localName, setLocalName] = useState('');

    const getName = () => {
        if (type === 'items') return item.zyappyItemName;
        if (type === 'variants') return item.zyappyVariantName;
        if (type === 'groups') return item.zyappyGroupName;
        if (type === 'options') return item.zyappyOptionName;
        return '';
    };

    const getExtId = () => {
        if (type === 'items') return item.externalItemId;
        if (type === 'variants') return item.externalVariantId;
        if (type === 'groups') return item.externalGroupId;
        if (type === 'options') return item.externalOptionId;
        return '';
    };

    const getExtName = () => {
        if (type === 'items') return item.externalItemName;
        if (type === 'variants') return item.externalVariantName;
        if (type === 'groups') return item.externalGroupName;
        if (type === 'options') return item.externalOptionName;
        return '';
    };

    const getGroupTypeLabel = () => {
        if (type === 'groups') {
            return (
                <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded ml-2 uppercase tracking-tighter">
                    {item.groupType}
                </span>
            );
        }
        return null;
    };

    return (
        <tr className={cn(
            "transition-colors group",
            isRedHighlight ? "bg-rose-50/30" : "hover:bg-slate-50/50"
        )}>
            <td className="px-8 py-5">
                <div className="flex flex-col">
                    <div className="flex items-center">
                        <span className="text-sm font-black text-slate-900 tracking-tight">{getName()}</span>
                        {getGroupTypeLabel()}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {item.zyappyItemId || item.zyappyVariantId || item.zyappyGroupId || item.zyappyOptionId}</span>
                </div>
            </td>

            <td className="px-8 py-5">
                {isEditing ? (
                    <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                        <input
                            type="text"
                            placeholder="Ext. ID"
                            value={localId}
                            onChange={(e) => setLocalId(e.target.value)}
                            className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none shadow-sm"
                        />
                        <input
                            type="text"
                            placeholder="Ext. Name"
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value)}
                            className="w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none shadow-sm"
                        />
                        <button
                            onClick={() => { onMap(localId, localName); setIsEditing(false); }}
                            className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-90"
                        >
                            <CheckCircle2 size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {getExtId() ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-700">{getExtName()}</span>
                                    <Link size={12} className="text-emerald-500" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">EXTERNAL ID: {getExtId()}</span>
                            </>
                        ) : item.suggestedMapping ? (
                            <div className="flex flex-col gap-2 p-3 bg-white border border-emerald-100 rounded-2xl shadow-sm border-dashed">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Auto-Suggested Match</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600 italic">Match Score: {Math.round(item.confidenceScore * 100)}%</span>
                                    <button
                                        onClick={onApplySuggestion}
                                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-rose-400">
                                <AlertTriangle size={14} />
                                <span className="text-xs font-bold italic">Awaiting mapping...</span>
                            </div>
                        )}
                    </div>
                )}
            </td>

            {type === 'items' && (
                <td className="px-8 py-5">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                {item.lastPublishedAt ? new Date(item.lastPublishedAt).toLocaleDateString() : 'NEVER'}
                            </span>
                        </div>
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest mt-1 w-fit px-1.5 py-0.5 rounded",
                            item.status === 'PUBLISHED' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                            {item.status}
                        </span>
                    </div>
                </td>
            )}

            <td className="px-8 py-5 text-center">
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    item.mappingStatus === 'MAPPED' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                )}>
                    {item.mappingStatus === 'MAPPED' ? <CheckCircle2 size={12} /> : <Unlink size={12} />}
                    {item.mappingStatus}
                </div>
            </td>

            <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => {
                            if (!isEditing) {
                                setLocalId(getExtId());
                                setLocalName(getExtName());
                                setIsEditing(true);
                            } else {
                                setIsEditing(false);
                            }
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        {isEditing ? <RotateCcw size={16} /> : <ChevronRight size={18} />}
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Info size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};
