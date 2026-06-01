'use client';

import React, { useState } from 'react';
import {
    Settings2, Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
    Search, Star, Layers, ToggleLeft, ToggleRight, Copy, AlertCircle
} from 'lucide-react';
import { useModifierPoolStore } from '../../state/modifierPoolStore';
import { ModifierPool, ModifierOption } from '../../types/items';
import { cn } from '@/utils';

export const ModifierPoolsPanel: React.FC = () => {
    const { pools, createPool, updatePool, deletePool, addOptionToPool, updateOptionInPool, removeOptionFromPool } = useModifierPoolStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPoolId, setExpandedPoolId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Create form state
    const [newPoolName, setNewPoolName] = useState('');
    const [newPoolIsTopping, setNewPoolIsTopping] = useState(false);
    const [newPoolHalfHalf, setNewPoolHalfHalf] = useState(false);
    const [newPoolPremium, setNewPoolPremium] = useState(false);

    const filteredPools = pools.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalOptions = pools.reduce((sum, p) => sum + p.options.length, 0);

    const handleCreatePool = () => {
        if (!newPoolName.trim()) return;
        const created = createPool({
            name: newPoolName.trim(),
            isToppingGroup: newPoolIsTopping,
            isHalfAndHalfEnabled: newPoolHalfHalf,
            isPremiumRuleEnabled: newPoolPremium,
            options: [],
        });
        setNewPoolName('');
        setNewPoolIsTopping(false);
        setNewPoolHalfHalf(false);
        setNewPoolPremium(false);
        setShowCreateForm(false);
        setExpandedPoolId(created.id);
    };

    const handleDeletePool = (poolId: string, poolName: string) => {
        if (confirm(`Delete "${poolName}"? This will remove it from all attached products.`)) {
            deletePool(poolId);
            if (expandedPoolId === poolId) setExpandedPoolId(null);
        }
    };

    const handleDuplicatePool = (pool: ModifierPool) => {
        const dup = createPool({
            name: `${pool.name} (Copy)`,
            isToppingGroup: pool.isToppingGroup,
            isHalfAndHalfEnabled: pool.isHalfAndHalfEnabled,
            isPremiumRuleEnabled: pool.isPremiumRuleEnabled,
            options: pool.options.map(o => ({ ...o, id: `${o.id}-dup-${Date.now()}` })),
        });
        setExpandedPoolId(dup.id);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-slate-950 rounded-2xl shadow-sm">
                        <Settings2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Modifier Pool Registry</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                            {pools.length} pools • {totalOptions} total options
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search pools..."
                            className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold w-48 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300 uppercase"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                            showCreateForm
                                ? "bg-white border border-slate-300 text-slate-600"
                                : "bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
                        )}
                    >
                        {showCreateForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-emerald-400" />}
                        {showCreateForm ? 'Cancel' : 'Create Pool'}
                    </button>
                </div>
            </div>

            {/* Create New Pool Form */}
            {showCreateForm && (
                <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">New Modifier Pool</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Pool Name *</label>
                            <input
                                value={newPoolName}
                                onChange={(e) => setNewPoolName(e.target.value)}
                                placeholder="e.g. Pizza Toppings, Wing Sauces..."
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreatePool()}
                                autoFocus
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <ToggleButton label="Topping Group" active={newPoolIsTopping} onToggle={() => setNewPoolIsTopping(!newPoolIsTopping)} />
                            <ToggleButton label="Half & Half" active={newPoolHalfHalf} onToggle={() => setNewPoolHalfHalf(!newPoolHalfHalf)} />
                            <ToggleButton label="Premium Rules" active={newPoolPremium} onToggle={() => setNewPoolPremium(!newPoolPremium)} />
                        </div>
                    </div>
                    <button
                        onClick={handleCreatePool}
                        disabled={!newPoolName.trim()}
                        className="mt-4 flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" /> Create Pool
                    </button>
                </div>
            )}

            {/* Pool Cards */}
            {filteredPools.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/60">
                    <Settings2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        {searchQuery ? 'No pools match your search' : 'No modifier pools yet'}
                    </h4>
                    <p className="text-[10px] text-slate-300 font-medium mt-1">Create your first pool to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPools.map(pool => (
                        <PoolCard
                            key={pool.id}
                            pool={pool}
                            isExpanded={expandedPoolId === pool.id}
                            onToggle={() => setExpandedPoolId(expandedPoolId === pool.id ? null : pool.id)}
                            onUpdate={(updates) => updatePool(pool.id, updates)}
                            onDelete={() => handleDeletePool(pool.id, pool.name)}
                            onDuplicate={() => handleDuplicatePool(pool)}
                            onAddOption={(opt) => addOptionToPool(pool.id, opt)}
                            onUpdateOption={(optId, updates) => updateOptionInPool(pool.id, optId, updates)}
                            onRemoveOption={(optId) => removeOptionFromPool(pool.id, optId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Pool Card ───────────────────────────────────────────────

interface PoolCardProps {
    pool: ModifierPool;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<ModifierPool>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onAddOption: (opt: ModifierOption) => void;
    onUpdateOption: (optionId: string, updates: Partial<ModifierOption>) => void;
    onRemoveOption: (optionId: string) => void;
}

const PoolCard: React.FC<PoolCardProps> = ({
    pool, isExpanded, onToggle, onUpdate, onDelete, onDuplicate,
    onAddOption, onUpdateOption, onRemoveOption
}) => {
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(pool.name);

    const saveName = () => {
        if (nameValue.trim()) onUpdate({ name: nameValue.trim() });
        setEditingName(false);
    };

    return (
        <div className={cn(
            "bg-white rounded-2xl border shadow-sm transition-all",
            isExpanded ? "border-slate-300 shadow-md" : "border-slate-200/60 hover:border-slate-300"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        pool.isToppingGroup ? "bg-amber-50" : "bg-slate-100"
                    )}>
                        <Settings2 className={cn("w-4.5 h-4.5", pool.isToppingGroup ? "text-amber-500" : "text-slate-400")} />
                    </div>
                    <div className="min-w-0">
                        {editingName ? (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                    value={nameValue}
                                    onChange={(e) => setNameValue(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                                    className="text-xs font-black text-slate-900 uppercase tracking-wider bg-white border border-slate-300 px-2 py-1 rounded-lg outline-none focus:border-slate-900"
                                    autoFocus
                                />
                                <button onClick={saveName} className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"><Save className="w-3 h-3" /></button>
                                <button onClick={() => setEditingName(false)} className="p-1 bg-slate-50 text-slate-400 rounded hover:bg-slate-100"><X className="w-3 h-3" /></button>
                            </div>
                        ) : (
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider truncate">{pool.name}</h4>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-slate-400 font-mono font-bold">{pool.options.length} options</span>
                            {pool.isToppingGroup && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[8px] font-black">Topping</span>}
                            {pool.isHalfAndHalfEnabled && <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded text-[8px] font-black">Half/Half</span>}
                            {pool.isPremiumRuleEnabled && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[8px] font-black">Premium</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditingName(true); setNameValue(pool.name); }} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-all" title="Rename">
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onDuplicate} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-all" title="Duplicate">
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onDelete} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-5 bg-slate-100 mx-1" />
                    <div className="p-1" onClick={onToggle}>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-5 animate-in slide-in-from-top-1 duration-150">
                    {/* Pool Flags */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mr-2">Flags:</span>
                        <ToggleButton label="Topping Group" active={pool.isToppingGroup} onToggle={() => onUpdate({ isToppingGroup: !pool.isToppingGroup })} />
                        <ToggleButton label="Half & Half" active={pool.isHalfAndHalfEnabled} onToggle={() => onUpdate({ isHalfAndHalfEnabled: !pool.isHalfAndHalfEnabled })} />
                        <ToggleButton label="Premium Rules" active={pool.isPremiumRuleEnabled} onToggle={() => onUpdate({ isPremiumRuleEnabled: !pool.isPremiumRuleEnabled })} />
                    </div>

                    {/* Options Table */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Options ({pool.options.length})</span>
                        </div>

                        {pool.options.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">No options yet — add one below</span>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {/* Header */}
                                <div className="grid grid-cols-12 gap-2 px-3 py-1.5">
                                    <span className="col-span-5 text-[8px] font-black text-slate-400 uppercase tracking-wider">Name</span>
                                    <span className="col-span-2 text-[8px] font-black text-slate-400 uppercase tracking-wider text-center">Price</span>
                                    <span className="col-span-2 text-[8px] font-black text-slate-400 uppercase tracking-wider text-center">Premium</span>
                                    <span className="col-span-2 text-[8px] font-black text-slate-400 uppercase tracking-wider text-center">Topping</span>
                                    <span className="col-span-1" />
                                </div>
                                {pool.options.map((opt) => (
                                    <OptionRow
                                        key={opt.id}
                                        option={opt}
                                        onUpdate={(updates) => onUpdateOption(opt.id, updates)}
                                        onRemove={() => onRemoveOption(opt.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Add Option Inline */}
                        <AddOptionInline onAdd={onAddOption} />
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Option Row ──────────────────────────────────────────────

const OptionRow: React.FC<{
    option: ModifierOption;
    onUpdate: (updates: Partial<ModifierOption>) => void;
    onRemove: () => void;
}> = ({ option, onUpdate, onRemove }) => (
    <div className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl group hover:bg-slate-50 transition-all">
        <div className="col-span-5">
            <input
                value={option.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full text-[10px] font-bold text-slate-800 bg-transparent border-none outline-none focus:bg-white px-1 py-0.5 rounded uppercase tracking-tight"
            />
        </div>
        <div className="col-span-2">
            <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">$</span>
                <input
                    type="number"
                    step="0.01"
                    value={option.price}
                    onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-5 pr-1 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-center outline-none focus:border-slate-900"
                />
            </div>
        </div>
        <div className="col-span-2 flex justify-center">
            <button
                onClick={() => onUpdate({ isPremium: !option.isPremium })}
                className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all",
                    option.isPremium ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-white text-slate-400 border-slate-200")}
            >
                {option.isPremium ? '★ Yes' : 'No'}
            </button>
        </div>
        <div className="col-span-2 flex justify-center">
            <button
                onClick={() => onUpdate({ isTopping: !option.isTopping })}
                className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all",
                    option.isTopping ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200")}
            >
                {option.isTopping ? 'Yes' : 'No'}
            </button>
        </div>
        <div className="col-span-1 flex justify-end">
            <button
                onClick={onRemove}
                className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded transition-all opacity-0 group-hover:opacity-100"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    </div>
);

// ─── Add Option Inline ───────────────────────────────────────

const AddOptionInline: React.FC<{ onAdd: (opt: ModifierOption) => void }> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleAdd = () => {
        if (!name.trim()) return;
        onAdd({
            id: 'opt-' + Date.now(),
            name: name.trim(),
            price: parseFloat(price) || 0,
            isPremium: false,
            isTopping: false,
        });
        setName('');
        setPrice('');
    };

    return (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Option name..."
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 px-3 py-2.5 bg-white border border-dashed border-slate-200 rounded-xl text-[10px] font-bold placeholder:text-slate-300 outline-none focus:border-slate-400 transition-all uppercase tracking-tight"
            />
            <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">$</span>
                <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="w-full pl-6 pr-2 py-2.5 bg-white border border-dashed border-slate-200 rounded-xl text-[10px] font-mono font-bold text-right outline-none focus:border-slate-400"
                />
            </div>
            <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl transition-all disabled:opacity-30 text-[9px] font-black uppercase tracking-wider"
            >
                <Plus className="w-3 h-3" /> Add
            </button>
        </div>
    );
};

// ─── Toggle Button ───────────────────────────────────────────

const ToggleButton: React.FC<{ label: string; active: boolean; onToggle: () => void }> = ({ label, active, onToggle }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all",
            active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
        )}
    >
        {active ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
        {label}
    </button>
);
