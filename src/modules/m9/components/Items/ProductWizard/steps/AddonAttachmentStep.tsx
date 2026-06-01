'use client';

import React, { useState, useMemo } from 'react';
import { Puzzle, Check, Package, Plus, X, Edit3, Save, Trash2, Search } from 'lucide-react';
import { useWizardStore } from '../../../../state/wizardStore';
import { useTemplateStore } from '../../../../state/templateStore';
import { StepHeader, StepCard } from '../shared/StepHeader';
import { WizardSearch, WizardPagination, paginateArray } from '../shared/WizardListControls';
import { cn } from '@/utils';

// ─── Inline Create / Edit Form ───────────────────────────────

interface AddonItem {
    name: string;
    price: number;
}

const AddonForm: React.FC<{
    mode: 'create' | 'edit';
    initialName?: string;
    initialEmoji?: string;
    initialDescription?: string;
    initialItems?: AddonItem[];
    onSave: (data: { name: string; emoji: string; description: string; items: AddonItem[] }) => void;
    onCancel: () => void;
}> = ({ mode, initialName = '', initialEmoji = '📦', initialDescription = '', initialItems, onSave, onCancel }) => {
    const [name, setName] = useState(initialName);
    const [emoji, setEmoji] = useState(initialEmoji);
    const [description, setDescription] = useState(initialDescription);
    const [items, setItems] = useState<AddonItem[]>(initialItems || [{ name: '', price: 0 }]);

    const addItem = () => setItems([...items, { name: '', price: 0 }]);
    const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
    const updateItem = (idx: number, field: keyof AddonItem, value: string | number) => {
        setItems(items.map((it, i) => i === idx ? { ...it, [field]: value } : it));
    };

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ name: name.trim(), emoji, description: description.trim(), items: items.filter(i => i.name.trim()) });
    };

    return (
        <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-lg animate-in slide-in-from-top-2 duration-200 space-y-5">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {mode === 'create' ? 'Create New Add-On Group' : 'Edit Add-On Group'}
                </h4>
                <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Emoji</label>
                    <input
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-2xl text-center outline-none focus:border-slate-900 transition-all"
                        maxLength={4}
                    />
                </div>
                <div className="col-span-4">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Group Name *</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Side Items, Desserts..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                        autoFocus
                    />
                </div>
                <div className="col-span-6">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of this add-on group"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Add-On Items</label>
                    <button
                        onClick={addItem}
                        className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 hover:border-slate-500 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-wider transition-all"
                    >
                        <Plus className="w-3 h-3" /> Add Item
                    </button>
                </div>
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <input
                                value={item.name}
                                onChange={(e) => updateItem(i, 'name', e.target.value)}
                                placeholder="Item name (e.g. Garlic Bread)"
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                            />
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono font-bold text-slate-400">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.price}
                                    onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-20 px-2 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-right outline-none focus:border-slate-900 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => removeItem(i)}
                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                No items — click "Add Item" above
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                {mode === 'create'
                    ? <><Plus className="w-3.5 h-3.5 text-emerald-400" /> Create Add-On Group</>
                    : <><Save className="w-3.5 h-3.5 text-emerald-400" /> Save Changes</>
                }
            </button>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────

export const AddonAttachmentStep: React.FC = () => {
    const { formData, updateFormData } = useWizardStore();
    const { addonTemplates, addAddonTemplate, updateAddonTemplate, deleteAddonTemplate } = useTemplateStore();

    const selectedIds: string[] = (formData as any).addonAttachments || [];
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Search + pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 6;

    const toggleAddon = (id: string) => {
        const next = selectedIds.includes(id)
            ? selectedIds.filter(a => a !== id)
            : [...selectedIds, id];
        updateFormData('addonAttachments' as any, next);
    };

    const handleCreate = (data: { name: string; emoji: string; description: string; items: AddonItem[] }) => {
        const newId = 'at-' + Date.now();
        addAddonTemplate({
            id: newId,
            name: data.name,
            emoji: data.emoji,
            description: data.description,
            items: data.items.map(i => ({ name: i.name, price: i.price, included: false })),
        });
        // Auto-select the newly created add-on
        updateFormData('addonAttachments' as any, [...selectedIds, newId]);
        setShowCreateForm(false);
    };

    const handleEdit = (data: { name: string; emoji: string; description: string; items: AddonItem[] }) => {
        if (!editingId) return;
        updateAddonTemplate(editingId, {
            name: data.name,
            emoji: data.emoji,
            description: data.description,
            items: data.items.map(i => ({ name: i.name, price: i.price, included: false })),
        });
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (!confirm('Delete this add-on group?')) return;
        deleteAddonTemplate(id);
        // Remove from selections
        updateFormData('addonAttachments' as any, selectedIds.filter(a => a !== id));
    };

    // Filtered + paginated templates
    const filteredTemplates = useMemo(() => {
        if (!searchQuery.trim()) return addonTemplates;
        const q = searchQuery.toLowerCase();
        return addonTemplates.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }, [addonTemplates, searchQuery]);

    const totalPages = Math.ceil(filteredTemplates.length / PAGE_SIZE);
    const paginatedTemplates = paginateArray(filteredTemplates, currentPage, PAGE_SIZE);

    const handleSearchChange = (v: string) => { setSearchQuery(v); setCurrentPage(1); };

    return (
        <div className="space-y-6">
            <StepCard>
                <StepHeader
                    icon={<Puzzle className="w-4.5 h-4.5 text-emerald-400" />}
                    title="Add-On Groups"
                    subtitle="Attach side items, beverages, and desserts that can be upsold with this product"
                    badge={
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                                selectedIds.length > 0
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                            )}>
                                {selectedIds.length} Selected
                            </span>
                            <button
                                onClick={() => { setShowCreateForm(!showCreateForm); setEditingId(null); }}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95",
                                    showCreateForm
                                        ? "bg-white border border-slate-300 text-slate-600"
                                        : "bg-slate-950 text-white hover:bg-slate-800"
                                )}
                            >
                                {showCreateForm ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3 text-emerald-400" /> New Add-On</>}
                            </button>
                        </div>
                    }
                />

                {/* Create Form */}
                {showCreateForm && (
                    <div className="mb-6">
                        <AddonForm mode="create" onSave={handleCreate} onCancel={() => setShowCreateForm(false)} />
                    </div>
                )}

                {/* Edit Form */}
                {editingId && (() => {
                    const tpl = addonTemplates.find(t => t.id === editingId);
                    if (!tpl) return null;
                    return (
                        <div className="mb-6">
                            <AddonForm
                                mode="edit"
                                initialName={tpl.name}
                                initialEmoji={tpl.emoji}
                                initialDescription={tpl.description}
                                initialItems={tpl.items.map(i => ({ name: i.name, price: i.price }))}
                                onSave={handleEdit}
                                onCancel={() => setEditingId(null)}
                            />
                        </div>
                    );
                })()}

                {/* Search bar */}
                {addonTemplates.length > 0 && (
                    <div className="mb-4">
                        <WizardSearch
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search add-on groups..."
                        />
                    </div>
                )}

                {/* Template Cards */}
                {filteredTemplates.length === 0 && !showCreateForm ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-semibold">
                            {addonTemplates.length === 0 ? 'No add-on groups available — click "New Add-On" to create one' : 'No add-ons match your search'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedTemplates.map(tpl => {
                            const isSelected = selectedIds.includes(tpl.id);
                            const isBeingEdited = editingId === tpl.id;
                            return (
                                <div
                                    key={tpl.id}
                                    className={cn(
                                        "relative text-left rounded-2xl border-2 transition-all overflow-hidden",
                                        isBeingEdited
                                            ? "border-blue-400 bg-blue-50/30 opacity-50 pointer-events-none"
                                            : isSelected
                                                ? "border-emerald-400 bg-emerald-50/50 shadow-sm"
                                                : "border-slate-150 hover:border-slate-300 bg-white"
                                    )}
                                >
                                    {/* Main clickable area */}
                                    <button
                                        onClick={() => toggleAddon(tpl.id)}
                                        className="w-full text-left p-5"
                                    >
                                        {/* Selection badge */}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                            </div>
                                        )}

                                        {/* Template info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{tpl.emoji}</span>
                                            <div>
                                                <h4 className={cn(
                                                    "text-[10px] font-black uppercase tracking-wider",
                                                    isSelected ? "text-emerald-700" : "text-slate-700"
                                                )}>
                                                    {tpl.name}
                                                </h4>
                                                <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                                                    {tpl.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Items preview */}
                                        <div className="space-y-1">
                                            {tpl.items.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between py-1.5 px-2.5 bg-white rounded-lg border border-slate-100"
                                                >
                                                    <span className="text-[9px] font-bold text-slate-600">{item.name}</span>
                                                    <span className="text-[9px] font-mono font-bold text-emerald-600">${item.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </button>

                                    {/* Action bar */}
                                    <div className="flex items-center gap-1.5 px-4 pb-4 pt-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingId(tpl.id); setShowCreateForm(false); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all"
                                        >
                                            <Edit3 className="w-2.5 h-2.5" /> Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(tpl.id); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all"
                                        >
                                            <Trash2 className="w-2.5 h-2.5" /> Delete
                                        </button>
                                        <span className="ml-auto text-[8px] font-black text-slate-300 uppercase tracking-wider">
                                            {tpl.items.length} item{tpl.items.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </StepCard>
        </div>
    );
};
