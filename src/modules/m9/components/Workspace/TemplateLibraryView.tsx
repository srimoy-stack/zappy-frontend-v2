'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X, Trash2, Copy, Eye, Edit3, Save, Boxes, GripVertical, Search } from 'lucide-react';
import { cn } from '@/utils';

// ─── Types ───────────────────────────────────────────────────

export interface TemplateLibraryItem {
    id: string;
    emoji: string;
    name: string;
    description: string;
    groups: { name: string; items: { name: string; detail: string }[] }[];
}

interface TemplateLibraryViewProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    templates: TemplateLibraryItem[];
    onCreateNew: (name: string, emoji: string, description: string) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onEdit?: (id: string, updates: { name: string; emoji: string; description: string; groups: { name: string; items: { name: string; detail: string }[] }[] }) => void;
}

// ─── Inline Item Editor Row ──────────────────────────────────

const ItemRow: React.FC<{
    item: { name: string; detail: string };
    isEditing: boolean;
    onUpdate: (name: string, detail: string) => void;
    onRemove: () => void;
}> = ({ item, isEditing, onUpdate, onRemove }) => {
    if (!isEditing) {
        return (
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-white rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-700">{item.name}</span>
                <span className="text-xs font-mono font-medium text-emerald-600">{item.detail}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 py-1 px-1.5 bg-white rounded-lg border border-blue-200">
            <GripVertical className="w-3 h-3 text-slate-300 flex-shrink-0" />
            <input
                value={item.name}
                onChange={(e) => onUpdate(e.target.value, item.detail)}
                className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-slate-900 transition-all"
                placeholder="Item name"
            />
            <input
                value={item.detail}
                onChange={(e) => onUpdate(item.name, e.target.value)}
                className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-right outline-none focus:border-slate-900 transition-all"
                placeholder="$0.00"
            />
            <button
                onClick={onRemove}
                className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

// ─── Group Editor ────────────────────────────────────────────

const GroupEditor: React.FC<{
    group: { name: string; items: { name: string; detail: string }[] };
    isEditing: boolean;
    onUpdateGroupName: (name: string) => void;
    onUpdateItem: (idx: number, name: string, detail: string) => void;
    onAddItem: () => void;
    onRemoveItem: (idx: number) => void;
    onRemoveGroup: () => void;
}> = ({ group, isEditing, onUpdateGroupName, onUpdateItem, onAddItem, onRemoveItem, onRemoveGroup }) => (
    <div className={cn("rounded-xl p-4 border", isEditing ? "bg-blue-50/30 border-blue-200" : "bg-slate-50 border-slate-100")}>
        <div className="flex items-center justify-between mb-3">
            {isEditing ? (
                <input
                    value={group.name}
                    onChange={(e) => onUpdateGroupName(e.target.value)}
                    className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-900 transition-all"
                    placeholder="Group name"
                />
            ) : (
                <h5 className="text-xs font-semibold text-slate-700">{group.name}</h5>
            )}
            <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 font-medium text-xs">{group.items.length}</span>
                {isEditing && (
                    <button onClick={onRemoveGroup} className="p-1 text-rose-400 hover:text-rose-600 rounded transition-all" title="Remove group">
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
        <div className="space-y-1.5">
            {group.items.map((item, ii) => (
                <ItemRow
                    key={ii}
                    item={item}
                    isEditing={isEditing}
                    onUpdate={(name, detail) => onUpdateItem(ii, name, detail)}
                    onRemove={() => onRemoveItem(ii)}
                />
            ))}
            {group.items.length === 0 && !isEditing && (
                <span className="text-xs text-slate-400 font-medium italic block py-2 text-center">No items yet — edit to add</span>
            )}
            {isEditing && (
                <button
                    onClick={onAddItem}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 hover:border-slate-500 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-600 transition-all mt-1"
                >
                    <Plus className="w-3 h-3" /> Add Item
                </button>
            )}
        </div>
    </div>
);

// ─── Create Form ─────────────────────────────────────────────

const CreateForm: React.FC<{
    onCreateNew: (name: string, emoji: string, description: string) => void;
    onClose: () => void;
}> = ({ onCreateNew, onClose }) => {
    const [emoji, setEmoji] = useState('📦');
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [groups, setGroups] = useState<{ name: string; items: { name: string; detail: string }[] }[]>([
        { name: 'Default Group', items: [{ name: '', detail: '$0.00' }] }
    ]);

    const addGroup = () => setGroups([...groups, { name: 'New Group', items: [{ name: '', detail: '$0.00' }] }]);

    const updateGroupName = (gi: number, gName: string) => {
        const updated = [...groups];
        updated[gi] = { ...updated[gi]!, name: gName };
        setGroups(updated);
    };

    const addItem = (gi: number) => {
        const updated = [...groups];
        updated[gi] = { ...updated[gi]!, items: [...updated[gi]!.items, { name: '', detail: '$0.00' }] };
        setGroups(updated);
    };

    const updateItem = (gi: number, ii: number, itemName: string, detail: string) => {
        const updated = [...groups];
        const items = [...updated[gi]!.items];
        items[ii] = { name: itemName, detail };
        updated[gi] = { ...updated[gi]!, items };
        setGroups(updated);
    };

    const removeItem = (gi: number, ii: number) => {
        const updated = [...groups];
        updated[gi] = { ...updated[gi]!, items: updated[gi]!.items.filter((_, i) => i !== ii) };
        setGroups(updated);
    };

    const removeGroup = (gi: number) => setGroups(groups.filter((_, i) => i !== gi));

    const handleCreate = () => {
        if (!name.trim()) return;
        onCreateNew(name.trim(), emoji, desc.trim());
        onClose();
    };

    return (
        <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-lg animate-in slide-in-from-top-2 duration-200 space-y-5">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">New Template</h4>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">Emoji</label>
                    <input
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-2xl text-center outline-none focus:border-slate-900 transition-all"
                        maxLength={4}
                    />
                </div>
                <div className="col-span-4">
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">Name *</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Burger Sizes, Drink Extras..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                        autoFocus
                    />
                </div>
                <div className="col-span-6">
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">Description</label>
                    <input
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Brief description of this template category"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* Groups & Items */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400">Groups & Items</label>
                    <button
                        onClick={addGroup}
                        className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 hover:border-slate-500 rounded-lg text-xs font-semibold text-slate-500 transition-all"
                    >
                        <Plus className="w-3 h-3" /> Add Group
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((group, gi) => (
                        <GroupEditor
                            key={gi}
                            group={group}
                            isEditing={true}
                            onUpdateGroupName={(n) => updateGroupName(gi, n)}
                            onUpdateItem={(ii, n, d) => updateItem(gi, ii, n, d)}
                            onAddItem={() => addItem(gi)}
                            onRemoveItem={(ii) => removeItem(gi, ii)}
                            onRemoveGroup={() => removeGroup(gi)}
                        />
                    ))}
                </div>
            </div>

            <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <Plus className="w-3.5 h-3.5 text-emerald-400" /> Create Template
            </button>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────

export const TemplateLibraryView: React.FC<TemplateLibraryViewProps> = ({
    title, subtitle, icon, templates, onCreateNew, onDelete, onDuplicate, onEdit
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Local editable state for the expanded/editing template
    const [editData, setEditData] = useState<TemplateLibraryItem | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'single' | 'multi' | 'empty'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 3;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeFilter, templates]);

    const filteredTemplates = useMemo(() => {
        return templates.filter(tpl => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesName = tpl.name.toLowerCase().includes(q);
                const matchesDesc = tpl.description.toLowerCase().includes(q);
                const matchesGroup = tpl.groups.some(g => g.name.toLowerCase().includes(q) || g.items.some(i => i.name.toLowerCase().includes(q)));
                if (!matchesName && !matchesDesc && !matchesGroup) return false;
            }

            if (activeFilter === 'single') {
                return tpl.groups.length === 1;
            } else if (activeFilter === 'multi') {
                return tpl.groups.length > 1;
            } else if (activeFilter === 'empty') {
                const totalItems = tpl.groups.reduce((s, g) => s + g.items.length, 0);
                return totalItems === 0;
            }

            return true;
        });
    }, [templates, searchQuery, activeFilter]);

    const paginatedTemplates = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTemplates.slice(start, start + pageSize);
    }, [filteredTemplates, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredTemplates.length / pageSize);

    const startEditing = (tpl: TemplateLibraryItem) => {
        setEditingId(tpl.id);
        setExpandedId(tpl.id);
        setEditData(JSON.parse(JSON.stringify(tpl)));
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditData(null);
    };

    const saveEditing = () => {
        if (editData && onEdit) {
            onEdit(editData.id, { name: editData.name, emoji: editData.emoji, description: editData.description, groups: editData.groups });
        }
        setEditingId(null);
        setEditData(null);
    };

    const updateEditGroupName = (gi: number, name: string) => {
        if (!editData) return;
        const groups = [...editData.groups];
        groups[gi] = { ...groups[gi]!, name };
        setEditData({ ...editData, groups });
    };

    const updateEditItem = (gi: number, ii: number, name: string, detail: string) => {
        if (!editData) return;
        const groups = [...editData.groups];
        const items = [...groups[gi]!.items];
        items[ii] = { name, detail };
        groups[gi] = { ...groups[gi]!, items };
        setEditData({ ...editData, groups });
    };

    const addEditItem = (gi: number) => {
        if (!editData) return;
        const groups = [...editData.groups];
        groups[gi] = { ...groups[gi]!, items: [...groups[gi]!.items, { name: '', detail: '$0.00' }] };
        setEditData({ ...editData, groups });
    };

    const removeEditItem = (gi: number, ii: number) => {
        if (!editData) return;
        const groups = [...editData.groups];
        groups[gi] = { ...groups[gi]!, items: groups[gi]!.items.filter((_, i) => i !== ii) };
        setEditData({ ...editData, groups });
    };

    const addEditGroup = () => {
        if (!editData) return;
        setEditData({ ...editData, groups: [...editData.groups, { name: 'New Group', items: [{ name: '', detail: '$0.00' }] }] });
    };

    const removeEditGroup = (gi: number) => {
        if (!editData) return;
        setEditData({ ...editData, groups: editData.groups.filter((_, i) => i !== gi) });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-slate-950 rounded-2xl shadow-sm">{icon}</div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle} • {templates.length} templates</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95",
                        showCreateForm
                            ? "bg-white border border-slate-300 text-slate-600"
                            : "bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
                    )}
                >
                    {showCreateForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5 text-emerald-400" /> Create New</>}
                </button>
            </div>

            {/* Toolbar: Search + Quick Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150 shadow-inner">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-slate-900 transition-all outline-none"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {([
                        { id: 'all', label: 'All Templates' },
                        { id: 'single', label: 'Single Group' },
                        { id: 'multi', label: 'Multi Group' },
                        { id: 'empty', label: 'Empty' }
                    ] as const).map(f => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                activeFilter === f.id
                                    ? "bg-slate-950 text-white shadow-sm"
                                    : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Create Form */}
            {showCreateForm && <CreateForm onCreateNew={onCreateNew} onClose={() => setShowCreateForm(false)} />}

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedTemplates.map(tpl => {
                    const isExpanded = expandedId === tpl.id;
                    const isEditing = editingId === tpl.id;
                    const displayData = isEditing && editData ? editData : tpl;
                    const totalItems = displayData.groups.reduce((s, g) => s + g.items.length, 0);

                    return (
                        <div
                            key={tpl.id}
                            className={cn(
                                "bg-white rounded-[2rem] border shadow-sm transition-all group",
                                isExpanded
                                    ? "border-slate-900 shadow-lg col-span-1 md:col-span-2 lg:col-span-3"
                                    : "border-slate-200/60 hover:border-slate-400 hover:shadow-md cursor-pointer"
                            )}
                        >
                            {/* Card Header */}
                            <div
                                className="p-6 flex items-start justify-between"
                                onClick={() => { if (!isEditing) setExpandedId(isExpanded ? null : tpl.id); }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{displayData.emoji}</span>
                                    <div>
                                        {isEditing ? (
                                            <input
                                                value={editData?.name || ''}
                                                onChange={(e) => editData && setEditData({ ...editData, name: e.target.value })}
                                                className="text-sm font-semibold text-slate-900 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 outline-none focus:border-slate-900 transition-all"
                                            />
                                        ) : (
                                            <h4 className="text-sm font-semibold text-slate-900">{displayData.name}</h4>
                                        )}
                                        {isEditing ? (
                                            <input
                                                value={editData?.description || ''}
                                                onChange={(e) => editData && setEditData({ ...editData, description: e.target.value })}
                                                className="text-xs text-slate-500 font-medium mt-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 outline-none focus:border-slate-900 transition-all w-full"
                                            />
                                        ) : (
                                            <p className="text-xs text-slate-400 font-medium mt-0.5 leading-relaxed">{displayData.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono font-medium">
                                        {displayData.groups.length} grp{displayData.groups.length !== 1 ? 's' : ''} • {totalItems} items
                                    </span>
                                    <div className={cn("p-1.5 rounded-lg transition-all", isExpanded ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100")}>
                                        <Eye className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-6 pb-6 border-t border-slate-100 pt-5 animate-in slide-in-from-top-2 duration-200">
                                    {isEditing && (
                                        <div className="flex items-center justify-end mb-4">
                                            <button
                                                onClick={addEditGroup}
                                                className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 hover:border-slate-500 rounded-lg text-xs font-semibold text-slate-500 transition-all"
                                            >
                                                <Plus className="w-3 h-3" /> Add Group
                                            </button>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {displayData.groups.map((group, gi) => (
                                            <GroupEditor
                                                key={gi}
                                                group={group}
                                                isEditing={isEditing}
                                                onUpdateGroupName={(n) => updateEditGroupName(gi, n)}
                                                onUpdateItem={(ii, n, d) => updateEditItem(gi, ii, n, d)}
                                                onAddItem={() => addEditItem(gi)}
                                                onRemoveItem={(ii) => removeEditItem(gi, ii)}
                                                onRemoveGroup={() => removeEditGroup(gi)}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={saveEditing}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
                                                >
                                                    <Save className="w-3 h-3" /> Save Changes
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all hover:bg-slate-50"
                                                >
                                                    <X className="w-3 h-3" /> Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); startEditing(tpl); }}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
                                                >
                                                    <Edit3 className="w-3 h-3" /> Edit Template
                                                </button>
                                                {onDuplicate && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDuplicate(tpl.id); }}
                                                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-400 text-slate-600 rounded-xl text-xs font-semibold transition-all hover:bg-slate-50"
                                                    >
                                                        <Copy className="w-3 h-3" /> Duplicate
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDelete(tpl.id); setExpandedId(null); }}
                                                        className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-500 rounded-xl text-xs font-semibold transition-all ml-auto"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Delete
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
                    <span className="text-xs font-medium text-slate-500">
                        Showing {Math.min(filteredTemplates.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredTemplates.length, currentPage * pageSize)} of {filteredTemplates.length} Templates
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 transition-all active:scale-95"
                        >
                            Previous
                        </button>
                        <span className="text-xs font-semibold text-slate-800 px-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 transition-all active:scale-95"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {filteredTemplates.length === 0 && templates.length > 0 && (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/60">
                    <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-slate-400">No matching templates</h4>
                    <p className="text-xs text-slate-300 font-medium mt-1">Try adjusting your keywords or quick filter selection</p>
                </div>
            )}

            {templates.length === 0 && (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/60">
                    <Boxes className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-slate-400">No templates yet</h4>
                    <p className="text-xs text-slate-300 font-medium mt-1">Click "Create New" to add your first template</p>
                </div>
            )}
        </div>
    );
};
