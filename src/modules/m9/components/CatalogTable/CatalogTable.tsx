'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Search, Store, Globe, Calendar, Clock, ChevronDown,
    CheckCircle2, X, AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, FolderPlus, Layers, Plus, Package, SlidersHorizontal
} from 'lucide-react';
import { useCatalogStore } from '../../state/catalogStore';
import { CatalogTableRow } from './CatalogTableRow';
import { ProductDetailPanel } from './ProductDetailPanel';
import { useBulkOperationsStore } from '../../state/bulkOperationsStore';
import { Item, Category, CategoryChannelSchedule } from '../../types/items';
import { cn } from '@/utils';

// ─── Mock Store & Channel Data ─────────────────────────────────
const STORES = [
    { id: 'store-chicago', name: 'Chicago Loop Outlet' },
    { id: 'store-newyork', name: 'Manhattan Broad Ave' },
    { id: 'store-miami', name: 'Miami Beach Plaza' },
];

const CHANNELS = [
    { id: 'POS', name: 'POS Terminal' },
    { id: 'ONLINE', name: 'Online Ordering' },
    { id: 'UBER_EATS', name: 'Uber Eats' },
    { id: 'DOORDASH', name: 'DoorDash' },
];

// ─── Assign Category Dropdown Component ────────────────────────
interface AssignCategoryDropdownProps {
    onClose: () => void;
    selectedProductIds: Set<string>;
}

const AssignCategoryDropdown: React.FC<AssignCategoryDropdownProps> = ({ onClose, selectedProductIds }) => {
    const { items, categories, addCategory, updateCategory, updateItem } = useCatalogStore();
    const { clearSelection } = useBulkOperationsStore();
    const ref = useRef<HTMLDivElement>(null);

    // Form mode: select existing or create new
    const [mode, setMode] = useState<'select' | 'create'>('select');
    const [selectedCatId, setSelectedCatId] = useState<string>('');
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
    const selectedProducts = items.filter(item => selectedProductIds.has(item.id));

    // Channel visibility and scheduling
    const [defaultAllChannels, setDefaultAllChannels] = useState(true);
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    
    // Day schedules per channel
    const [channelSchedulesMap, setChannelSchedulesMap] = useState<Record<string, {
        allDays: boolean;
        allDaysStartTime: string;
        allDaysEndTime: string;
        customDays: Record<string, { startTime: string; endTime: string }>;
    }>>({});

    const DAYS_OF_WEEK = [
        { key: 'MON', label: 'M' },
        { key: 'TUE', label: 'T' },
        { key: 'WED', label: 'W' },
        { key: 'THU', label: 'T' },
        { key: 'FRI', label: 'F' },
        { key: 'SAT', label: 'S' },
        { key: 'SUN', label: 'S' },
    ] as const;

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    // Handle channel check/uncheck
    const toggleChannel = (chId: string) => {
        setSelectedChannels(prev => {
            const next = prev.includes(chId) ? prev.filter(id => id !== chId) : [...prev, chId];
            if (!prev.includes(chId) && !channelSchedulesMap[chId]) {
                setChannelSchedulesMap(s => ({
                    ...s,
                    [chId]: {
                        allDays: true,
                        allDaysStartTime: '09:00',
                        allDaysEndTime: '22:00',
                        customDays: {
                            MON: { startTime: '09:00', endTime: '22:00' },
                            TUE: { startTime: '09:00', endTime: '22:00' },
                            WED: { startTime: '09:00', endTime: '22:00' },
                            THU: { startTime: '09:00', endTime: '22:00' },
                            FRI: { startTime: '09:00', endTime: '22:00' },
                            SAT: { startTime: '09:00', endTime: '22:00' },
                            SUN: { startTime: '09:00', endTime: '22:00' },
                        }
                    }
                }));
            }
            return next;
        });
    };

    const toggleAllDaysForChannel = (chId: string) => {
        setChannelSchedulesMap(prev => {
            const current = prev[chId] || {
                allDays: true,
                allDaysStartTime: '09:00',
                allDaysEndTime: '22:00',
                customDays: {}
            };
            return {
                ...prev,
                [chId]: {
                    ...current,
                    allDays: !current.allDays
                }
            };
        });
    };

    const toggleCustomDayOfWeek = (chId: string, day: string) => {
        setChannelSchedulesMap(prev => {
            const current = prev[chId] || {
                allDays: false,
                allDaysStartTime: '09:00',
                allDaysEndTime: '22:00',
                customDays: {}
            };
            const nextDays = { ...current.customDays };
            if (nextDays[day]) {
                delete nextDays[day];
            } else {
                nextDays[day] = { startTime: '09:00', endTime: '22:00' };
            }
            return {
                ...prev,
                [chId]: {
                    ...current,
                    customDays: nextDays
                }
            };
        });
    };

    const handleCustomTimeChange = (chId: string, day: string, field: 'startTime' | 'endTime', val: string) => {
        setChannelSchedulesMap(prev => {
            const current = prev[chId];
            if (!current) return prev;
            return {
                ...prev,
                [chId]: {
                    ...current,
                    customDays: {
                        ...current.customDays,
                        [day]: {
                            ...current.customDays[day],
                            [field]: val
                        }
                    }
                }
            };
        });
    };

    const handleAssign = () => {
        let targetCategoryId = selectedCatId;

        const mappedSchedules = selectedChannels.map(chId => {
            const cs = channelSchedulesMap[chId];
            return {
                channelId: chId,
                allDays: cs?.allDays ?? true,
                allDaysStartTime: cs?.allDaysStartTime || undefined,
                allDaysEndTime: cs?.allDaysEndTime || undefined,
                customDays: cs?.allDays ? undefined : Object.keys(cs?.customDays || {}).map(day => ({
                    dayOfWeek: day as any,
                    startTime: cs.customDays[day].startTime,
                    endTime: cs.customDays[day].endTime,
                }))
            };
        });

        // If create mode, instantiate the new category
        if (mode === 'create') {
            if (!newCatName.trim()) {
                alert('Please enter a category name.');
                return;
            }
            const newId = 'cat-' + Date.now();
            const newCat: Category = {
                id: newId,
                name: newCatName.trim(),
                description: newCatDesc.trim(),
                visibilityMode: defaultAllChannels ? 'ALL' : 'CUSTOM',
                customChannels: defaultAllChannels ? [] : selectedChannels,
                channelSchedules: defaultAllChannels ? [] : mappedSchedules
            };
            addCategory(newCat);
            targetCategoryId = newId;
        } else {
            // Select mode
            if (!targetCategoryId) {
                alert('Please select an existing category.');
                return;
            }
            // Update selected category's visibility if custom channels were edited
            updateCategory(targetCategoryId, {
                visibilityMode: defaultAllChannels ? 'ALL' : 'CUSTOM',
                customChannels: defaultAllChannels ? [] : selectedChannels,
                channelSchedules: defaultAllChannels ? [] : mappedSchedules
            });
        }

        // Assign the category to the selected items
        selectedProductIds.forEach(itemId => {
            updateItem(itemId, { categoryId: targetCategoryId });
        });

        const catName = mode === 'create' ? newCatName : categories.find(c => c.id === targetCategoryId)?.name;
        alert(`Assigned category "${catName}" to ${selectedProductIds.size} products!`);
        clearSelection();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                ref={ref}
                className="w-[580px] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
                    <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-indigo-500" /> Category Assignment
                    </span>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-slate-450" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Selected Products Context */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                Selected Products ({selectedProducts.length})
                            </span>
                            <span className="text-[8px] text-slate-455 uppercase font-black tracking-wider">Click to view details</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {selectedProducts.map(p => {
                                const isExpanded = expandedProductId === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border",
                                            isExpanded 
                                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                                                : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-slate-50/50"
                                        )}
                                    >
                                        <Package className="w-3.5 h-3.5 text-slate-400" />
                                        {p.name}
                                    </button>
                                );
                            })}
                        </div>

                        {expandedProductId && (() => {
                            const p = selectedProducts.find(item => item.id === expandedProductId);
                            if (!p) return null;
                            return (
                                <div className="mt-2.5 p-3.5 bg-white border border-slate-150 rounded-xl space-y-2 animate-in slide-in-from-top-1 duration-200 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">{p.name}</h4>
                                            <span className="text-[8px] font-bold text-slate-450 uppercase">{p.sku || 'No SKU'} • {p.type || 'SINGLE'}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                            ${p.price?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                    {p.description ? (
                                        <p className="text-[10px] text-slate-600 font-medium leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                                            {p.description}
                                        </p>
                                    ) : (
                                        <p className="text-[9px] text-slate-400 italic">No description provided for this product.</p>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Switch Mode */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setMode('select')}
                            className={cn(
                                "py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                                mode === 'select' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Existing List
                        </button>
                        <button
                            onClick={() => setMode('create')}
                            className={cn(
                                "py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                                mode === 'create' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Create New
                        </button>
                    </div>

                    {/* Mode Select Existing */}
                    {mode === 'select' ? (
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Select Category</label>
                            <select
                                value={selectedCatId}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    setSelectedCatId(id);
                                    const cat = categories.find(c => c.id === id);
                                    if (cat) {
                                        setDefaultAllChannels(cat.visibilityMode !== 'CUSTOM');
                                        setSelectedChannels(cat.customChannels || []);
                                        
                                        const scheds: Record<string, any> = {};
                                        cat.channelSchedules?.forEach(s => {
                                            const customDaysMap: Record<string, any> = {};
                                            s.customDays?.forEach(cd => {
                                                customDaysMap[cd.dayOfWeek] = {
                                                    startTime: cd.startTime,
                                                    endTime: cd.endTime
                                                };
                                            });
                                            scheds[s.channelId] = {
                                                allDays: s.allDays,
                                                allDaysStartTime: s.allDaysStartTime || '09:00',
                                                allDaysEndTime: s.allDaysEndTime || '22:00',
                                                customDays: customDaysMap
                                            };
                                        });
                                        setChannelSchedulesMap(scheds);
                                    }
                                }}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                            >
                                <option value="">-- Choose Category --</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        /* Mode Create New */
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Category Name</label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="e.g. Traditional Pizzas, Pastas..."
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={newCatDesc}
                                    onChange={(e) => setNewCatDesc(e.target.value)}
                                    placeholder="Short details..."
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    )}

                    {/* ─── Visibility Configuration ─── */}
                    <div className="border-t border-slate-100 pt-4 space-y-4">
                        {/* Default All Channels Checkbox */}
                        <button
                            onClick={() => setDefaultAllChannels(!defaultAllChannels)}
                            className="w-full flex items-center gap-3 text-left py-2.5 hover:bg-slate-50 rounded-xl px-2.5 transition-colors border border-slate-100 bg-slate-50/20"
                        >
                            <div className={cn(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                defaultAllChannels ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                            )}>
                                {defaultAllChannels && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">Default All Channels</span>
                                <span className="text-[8px] text-slate-400 font-bold uppercase block">Category is visible everywhere</span>
                            </div>
                        </button>

                        {/* Custom Channel Visibility Selection & Scheduling */}
                        {!defaultAllChannels && (
                            <div className="space-y-4 pl-1.5 pt-1.5 border-l-2 border-indigo-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Custom Channels & Schedule</span>

                                {CHANNELS.map(ch => {
                                    const isChecked = selectedChannels.includes(ch.id);
                                    const cs = channelSchedulesMap[ch.id] || {
                                        allDays: true,
                                        allDaysStartTime: '09:00',
                                        allDaysEndTime: '22:00',
                                        customDays: {}
                                    };

                                    return (
                                        <div key={ch.id} className="space-y-3.5 border border-slate-100 rounded-2xl p-3.5 bg-slate-50/50 shadow-sm">
                                            <button
                                                onClick={() => toggleChannel(ch.id)}
                                                className="w-full flex items-center gap-2.5 text-left"
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                                    isChecked ? "bg-indigo-500 border-indigo-500" : "border-slate-300"
                                                )}>
                                                    {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{ch.name}</span>
                                            </button>

                                            {/* Date/Time pickers */}
                                            {isChecked && (
                                                <div className="space-y-3.5 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                                                    {/* Day type toggle */}
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => toggleAllDaysForChannel(ch.id)}
                                                            className="flex items-center gap-2 text-left"
                                                        >
                                                            <div className={cn(
                                                                "w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0",
                                                                cs.allDays ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                                                            )}>
                                                                {cs.allDays && <div className="w-2.5 h-2.5 bg-white rounded-full animate-in zoom-in-50" />}
                                                            </div>
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">All Days</span>
                                                        </button>
                                                        <button
                                                            onClick={() => toggleAllDaysForChannel(ch.id)}
                                                            className="flex items-center gap-2 text-left"
                                                        >
                                                            <div className={cn(
                                                                "w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0",
                                                                !cs.allDays ? "border-indigo-500 bg-indigo-500" : "border-slate-300"
                                                            )}>
                                                                {!cs.allDays && <div className="w-2.5 h-2.5 bg-white rounded-full animate-in zoom-in-50" />}
                                                            </div>
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Custom Days</span>
                                                        </button>
                                                    </div>

                                                    {/* If All Days */}
                                                    {cs.allDays ? (
                                                        <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-sm">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase w-16 flex-shrink-0">Every Day</span>
                                                            <input
                                                                type="time"
                                                                value={cs.allDaysStartTime}
                                                                onChange={(e) => setChannelSchedulesMap(prev => ({
                                                                    ...prev,
                                                                    [ch.id]: { ...prev[ch.id], allDaysStartTime: e.target.value }
                                                                }))}
                                                                className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-slate-900"
                                                            />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase">to</span>
                                                            <input
                                                                type="time"
                                                                value={cs.allDaysEndTime}
                                                                onChange={(e) => setChannelSchedulesMap(prev => ({
                                                                    ...prev,
                                                                    [ch.id]: { ...prev[ch.id], allDaysEndTime: e.target.value }
                                                                }))}
                                                                className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-slate-900"
                                                            />
                                                        </div>
                                                    ) : (
                                                        /* If Custom Days */
                                                        <div className="space-y-3">
                                                            {/* Circular Day Badges M T W T F S S */}
                                                            <div className="flex justify-between gap-1.5">
                                                                {DAYS_OF_WEEK.map(d => {
                                                                    const dayActive = !!cs.customDays[d.key];
                                                                    return (
                                                                        <button
                                                                            key={d.key}
                                                                            onClick={() => toggleCustomDayOfWeek(ch.id, d.key)}
                                                                            className={cn(
                                                                                "w-8 h-8 rounded-full border text-[10px] font-black uppercase transition-all flex items-center justify-center",
                                                                                dayActive
                                                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                                                                    : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:border-slate-350"
                                                                            )}
                                                                            title={d.key}
                                                                        >
                                                                            {d.label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Selected Custom Days Time Config List in a roomy 2-column Grid */}
                                                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pt-1 pr-1">
                                                                {Object.keys(cs.customDays).map(day => (
                                                                    <div key={day} className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-top-1 duration-150">
                                                                        <span className="text-[9px] font-black text-indigo-600 uppercase w-10 flex-shrink-0">{day}</span>
                                                                        <input
                                                                            type="time"
                                                                            value={cs.customDays[day].startTime}
                                                                            onChange={(e) => handleCustomTimeChange(ch.id, day, 'startTime', e.target.value)}
                                                                            className="flex-1 px-1.5 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-slate-900"
                                                                        />
                                                                        <span className="text-[8px] font-bold text-slate-450 uppercase">to</span>
                                                                        <input
                                                                            type="time"
                                                                            value={cs.customDays[day].endTime}
                                                                            onChange={(e) => handleCustomTimeChange(ch.id, day, 'endTime', e.target.value)}
                                                                            className="flex-1 px-1.5 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-slate-900"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Apply Button */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <button
                        onClick={handleAssign}
                        disabled={mode === 'select' ? !selectedCatId : !newCatName.trim()}
                        className={cn(
                            "w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            (mode === 'select' ? selectedCatId : newCatName.trim())
                                ? "bg-slate-950 text-white hover:bg-slate-900 shadow-md"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        Apply Category Assignment
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Assign Store/Channel Dropdown Component ───────────────────
interface AssignDropdownProps {
    type: 'store' | 'channel';
    onClose: () => void;
    selectedProductIds: Set<string>;
}

const AssignDropdown: React.FC<AssignDropdownProps> = ({ type, onClose, selectedProductIds }) => {
    const { items, updateItem } = useCatalogStore();
    const { clearSelection } = useBulkOperationsStore();
    const ref = useRef<HTMLDivElement>(null);

    const list = type === 'store' ? STORES : CHANNELS;
    const [checked, setChecked] = useState<string[]>([]);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const toggle = (id: string) => {
        setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAll = () => {
        setChecked(prev => prev.length === list.length ? [] : list.map(l => l.id));
    };

    const handleAssign = () => {
        if (checked.length === 0) return;

        selectedProductIds.forEach(itemId => {
            const product = items.find(i => i.id === itemId);
            if (!product) return;

            if (type === 'store') {
                const existing = product.scopeConfig?.targetedStoreIds || [];
                const merged = Array.from(new Set([...existing, ...checked]));
                updateItem(itemId, {
                    scopeConfig: { scope: merged.length > 0 ? 'STORE_SPECIFIC' as const : 'GLOBAL' as const, targetedStoreIds: merged }
                });
            } else {
                const existing = product.channelVisibility || [];
                const merged = Array.from(new Set([...existing, ...checked]));
                updateItem(itemId, { channelVisibility: merged });
            }
        });

        const label = type === 'store' ? 'store(s)' : 'channel(s)';
        const scheduled = scheduleDate && scheduleTime
            ? `\nScheduled for: ${scheduleDate} at ${scheduleTime}`
            : '';
        alert(`Assigned ${checked.length} ${label} to ${selectedProductIds.size} product(s).${scheduled}`);
        clearSelection();
        onClose();
    };

    const allChecked = checked.length === list.length;

    return (
        <div
            ref={ref}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    {type === 'store' ? '🏪 Assign to Stores' : '📡 Assign Channels'}
                </span>
                <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
            </div>

            {/* Select All */}
            <button
                onClick={selectAll}
                className={cn(
                    "w-full px-4 py-2.5 flex items-center gap-3 border-b border-slate-100 transition-colors text-left",
                    allChecked ? "bg-emerald-50" : "hover:bg-slate-50"
                )}
            >
                <div className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    allChecked ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                )}>
                    {allChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
                    Assign to All {type === 'store' ? 'Stores' : 'Channels'}
                </span>
            </button>

            {/* List */}
            <div className="max-h-48 overflow-y-auto">
                {list.map(item => {
                    const isChecked = checked.includes(item.id);
                    return (
                        <button
                            key={item.id}
                            onClick={() => toggle(item.id)}
                            className={cn(
                                "w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left border-b border-slate-50 last:border-b-0",
                                isChecked ? "bg-emerald-50/50" : "hover:bg-slate-50"
                            )}
                        >
                            <div className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                isChecked ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                            )}>
                                {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{item.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Schedule Section */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/30 space-y-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Schedule Assignment (Optional)
                </span>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="flex-1 px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                    />
                    <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-28 px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                    />
                </div>
            </div>

            {/* Apply Button */}
            <div className="px-4 py-3 border-t border-slate-100">
                <button
                    onClick={handleAssign}
                    disabled={checked.length === 0}
                    className={cn(
                        "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        checked.length > 0
                            ? "bg-slate-950 text-white hover:bg-slate-900 shadow-md"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                >
                    Assign {checked.length > 0 ? `(${checked.length} selected)` : ''}
                </button>
            </div>
        </div>
    );
};

// ─── Main CatalogTable Component ───────────────────────────────
interface CatalogTableProps {
    onEdit: (item: Item) => void;
    onView: (item: Item) => void;
}

export const CatalogTable: React.FC<CatalogTableProps> = ({ onEdit, onView }) => {
    const { items, categories, isLoading, selectItem } = useCatalogStore();
    const {
        selectedIds, toggleItemSelection, selectAll, clearSelection, selectRange,
    } = useBulkOperationsStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
    const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

    // Advanced Filter Console State
    const [showFilterConsole, setShowFilterConsole] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [filterStore, setFilterStore] = useState<string>('ALL');
    const [filterProductType, setFilterProductType] = useState<string>('ALL');
    const [filterScope, setFilterScope] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterSyncStatus, setFilterSyncStatus] = useState<string>('ALL');
    const [filterMinPrice, setFilterMinPrice] = useState<string>('');
    const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Active filters count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterCategory !== 'ALL') count++;
        if (filterStore !== 'ALL') count++;
        if (filterProductType !== 'ALL') count++;
        if (filterScope !== 'ALL') count++;
        if (filterStatus !== 'ALL') count++;
        if (filterSyncStatus !== 'ALL') count++;
        if (filterMinPrice !== '') count++;
        if (filterMaxPrice !== '') count++;
        return count;
    }, [filterCategory, filterStore, filterProductType, filterScope, filterStatus, filterSyncStatus, filterMinPrice, filterMaxPrice]);

    const handleResetFilters = () => {
        setFilterCategory('ALL');
        setFilterStore('ALL');
        setFilterProductType('ALL');
        setFilterScope('ALL');
        setFilterStatus('ALL');
        setFilterSyncStatus('ALL');
        setFilterMinPrice('');
        setFilterMaxPrice('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    // Filter & sort
    const processedItems = useMemo(() => {
        let results = [...items];
        
        // Search query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            results = results.filter(item =>
                item.name.toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q) ||
                item.sku?.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (filterCategory !== 'ALL') {
            results = results.filter(item => item.categoryId === filterCategory);
        }

        // Store target filter
        if (filterStore !== 'ALL') {
            results = results.filter(item => {
                const scope = item.scopeConfig?.scope || 'GLOBAL';
                if (scope === 'GLOBAL') return true;
                return item.scopeConfig?.targetedStoreIds?.includes(filterStore) ?? false;
            });
        }

        // Product type filter
        if (filterProductType !== 'ALL') {
            results = results.filter(item => item.productType === filterProductType);
        }

        // Scope filter
        if (filterScope !== 'ALL') {
            results = results.filter(item => (item.scopeConfig?.scope || 'GLOBAL') === filterScope);
        }

        // Availability status filter
        if (filterStatus !== 'ALL') {
            const isAvail = filterStatus === 'OPERATIONAL';
            results = results.filter(item => item.isAvailable === isAvail);
        }

        // Sync status filter
        if (filterSyncStatus !== 'ALL') {
            results = results.filter(item => {
                const activeSync = item.channelSyncs?.find(c => c.channelId === 'POS')?.status || 'SYNCED';
                return activeSync === filterSyncStatus;
            });
        }

        // Price range filter
        if (filterMinPrice !== '') {
            const min = parseFloat(filterMinPrice);
            if (!isNaN(min)) {
                results = results.filter(item => {
                    const allVariants = item.variantGroups?.flatMap(vg => vg.variants) || [];
                    const minPrice = allVariants.length > 0 ? Math.min(...allVariants.map(v => v.basePrice)) : item.baseProductPrice || 0;
                    return minPrice >= min;
                });
            }
        }
        if (filterMaxPrice !== '') {
            const max = parseFloat(filterMaxPrice);
            if (!isNaN(max)) {
                results = results.filter(item => {
                    const allVariants = item.variantGroups?.flatMap(vg => vg.variants) || [];
                    const maxPrice = allVariants.length > 0 ? Math.max(...allVariants.map(v => v.basePrice)) : item.baseProductPrice || 0;
                    return maxPrice <= max;
                });
            }
        }

        return results;
    }, [items, searchQuery, filterCategory, filterStore, filterProductType, filterScope, filterStatus, filterSyncStatus, filterMinPrice, filterMaxPrice]);

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return processedItems.slice(start, start + pageSize);
    }, [processedItems, currentPage]);

    const totalPages = Math.ceil(processedItems.length / pageSize);
    const allRowIds = paginatedItems.map(i => i.id);
    const isAllSelected = allRowIds.length > 0 && allRowIds.every(id => selectedIds.has(id));
    const hasSelection = selectedIds.size > 0;

    const handleSelectRow = (e: React.MouseEvent, id: string) => {
        if (e.shiftKey) {
            selectRange(paginatedItems.map(i => i.id), id);
        } else {
            toggleItemSelection(id);
        }
    };

    return (
        <div className="space-y-5">
            {/* ─── Top Bar: Search + Assignment Actions + Create Product ───────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-lg flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search products by name, SKU, or ID..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-slate-900 transition-all outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilterConsole(!showFilterConsole)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex-shrink-0",
                                showFilterConsole || activeFilterCount > 0
                                    ? "bg-slate-950 text-white border-slate-950 shadow-md"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                            )}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Action Buttons — only visible when products are selected */}
                    {hasSelection && (
                        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">
                                {selectedIds.size} Selected
                            </span>

                            {/* Assign Store */}
                            <div className="relative">
                                <button
                                    onClick={() => { setStoreDropdownOpen(!storeDropdownOpen); setChannelDropdownOpen(false); setCategoryDropdownOpen(false); }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all",
                                        storeDropdownOpen
                                            ? "bg-slate-950 text-white border-slate-900"
                                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                                    )}
                                >
                                    <Store className="w-3.5 h-3.5 text-emerald-500" />
                                    Assign Store
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>
                                {storeDropdownOpen && (
                                    <AssignDropdown
                                        type="store"
                                        selectedProductIds={selectedIds}
                                        onClose={() => setStoreDropdownOpen(false)}
                                    />
                                )}
                            </div>

                            {/* Assign Channel */}
                            <div className="relative">
                                <button
                                    onClick={() => { setChannelDropdownOpen(!channelDropdownOpen); setStoreDropdownOpen(false); setCategoryDropdownOpen(false); }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all",
                                        channelDropdownOpen
                                            ? "bg-slate-950 text-white border-slate-900"
                                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                                    )}
                                >
                                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                                    Assign Channel
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>
                                {channelDropdownOpen && (
                                    <AssignDropdown
                                        type="channel"
                                        selectedProductIds={selectedIds}
                                        onClose={() => setChannelDropdownOpen(false)}
                                    />
                                )}
                            </div>

                            {/* Create / Assign Category */}
                            <div className="relative">
                                <button
                                    onClick={() => { setCategoryDropdownOpen(!categoryDropdownOpen); setStoreDropdownOpen(false); setChannelDropdownOpen(false); }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all",
                                        categoryDropdownOpen
                                            ? "bg-slate-950 text-white border-slate-900"
                                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                                    )}
                                >
                                    <FolderPlus className="w-3.5 h-3.5 text-violet-500" />
                                    Assign Category
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>
                                {categoryDropdownOpen && (
                                    <AssignCategoryDropdown
                                        selectedProductIds={selectedIds}
                                        onClose={() => setCategoryDropdownOpen(false)}
                                    />
                                )}
                            </div>

                            {/* Clear Selection */}
                            <button
                                onClick={clearSelection}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
                                title="Clear Selection"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Product Button */}
                <button
                    onClick={() => selectItem('CREATE')}
                    className="flex items-center gap-2.5 px-6 py-3 bg-slate-950 text-white rounded-2xl text-xs font-semibold hover:bg-slate-900 transition-all active:scale-95 group flex-shrink-0 shadow-lg shadow-slate-100"
                >
                    <Plus size={14} strokeWidth={3} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
                    Create Product
                </button>
            </div>
            
            {/* ─── Filter Console ─────────────────────────────────── */}
            {showFilterConsole && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-3 duration-250">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                            <h4 className="text-sm font-semibold text-slate-800">Advanced Product Filters</h4>
                            {activeFilterCount > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                                    {activeFilterCount} active
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleResetFilters}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Reset All Filters
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                            >
                                <option value="ALL">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Store Target Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Store Target</label>
                            <select
                                value={filterStore}
                                onChange={(e) => { setFilterStore(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                            >
                                <option value="ALL">All Stores</option>
                                {STORES.map(store => (
                                    <option key={store.id} value={store.id}>{store.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Product Type Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Product Type</label>
                            <select
                                value={filterProductType}
                                onChange={(e) => { setFilterProductType(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                            >
                                <option value="ALL">All Types</option>
                                <option value="SINGLE">Single Item</option>
                                <option value="COMBO">Combo Deal</option>
                                <option value="CONFIGURABLE_DEAL">Configurable Deal</option>
                                <option value="FIXED_COMBO">Fixed Combo</option>
                            </select>
                        </div>

                        {/* Deployment Scope */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Deployment Scope</label>
                            <select
                                value={filterScope}
                                onChange={(e) => { setFilterScope(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                            >
                                <option value="ALL">All Scopes</option>
                                <option value="GLOBAL">Global</option>
                                <option value="STORE_SPECIFIC">Store Specific</option>
                            </select>
                        </div>

                        {/* Operational Status */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Availability Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="OPERATIONAL">Operational</option>
                                <option value="DISABLED">Disabled</option>
                            </select>
                        </div>

                        {/* Sync Status */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Sync Status (POS)</label>
                            <select
                                value={filterSyncStatus}
                                onChange={(e) => { setFilterSyncStatus(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                            >
                                <option value="ALL">All Sync States</option>
                                <option value="DRAFT">Draft</option>
                                <option value="QUEUED">Queued</option>
                                <option value="SYNCED">Synced</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>

                        {/* Pricing Filter */}
                        <div className="col-span-1 sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Price Range ($)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min Price"
                                    value={filterMinPrice}
                                    onChange={(e) => { setFilterMinPrice(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors placeholder:text-slate-350"
                                />
                                <span className="text-slate-400 text-xs font-bold">—</span>
                                <input
                                    type="number"
                                    placeholder="Max Price"
                                    value={filterMaxPrice}
                                    onChange={(e) => { setFilterMaxPrice(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors placeholder:text-slate-350"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Table ─────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-40">
                        <div className="w-8 h-8 border-4 border-slate-900 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="pl-6 pr-2 py-5 w-12">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={() => selectAll(allRowIds)}
                                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Image
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Product Name
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Product Type
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    SKU
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Item ID
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Item Type
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide text-center">
                                    Dietary
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide text-center">
                                    Bestseller
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Category
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide text-center">
                                    Added to Menu
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Added to Store
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Channel
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Publish
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide text-center">
                                    Detail
                                </th>
                                <th className="px-4 py-5 text-xs font-bold text-slate-700 uppercase tracking-wide text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={16} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertTriangle className="w-8 h-8 text-slate-300" />
                                            <span className="text-sm font-semibold text-slate-700">No products found</span>
                                            <span className="text-xs text-slate-400 font-medium">Try a different search term</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item, idx) => (
                                    <CatalogTableRow
                                        key={item.id}
                                        item={item}
                                        index={idx}
                                        isSelected={selectedIds.has(item.id)}
                                        onEdit={onEdit}
                                        onView={onView}
                                        onSelectToggle={handleSelectRow}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                            Page {currentPage} of {totalPages} · {processedItems.length} products
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:border-slate-350 transition-all disabled:opacity-40"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:border-slate-350 transition-all disabled:opacity-40"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right-side detail panel (click a row to open) */}
            <ProductDetailPanel onEdit={onEdit} />
        </div>
    );
};
