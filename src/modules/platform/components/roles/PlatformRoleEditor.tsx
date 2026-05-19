'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, AlertTriangle, Shield, Check, X, LayoutGrid } from 'lucide-react';
import { Role, AVAILABLE_PERMISSIONS, PermissionCategory } from '@/shared/types/role';

interface Props {
    role?: Role;
    onSave: (role: Partial<Role>) => Promise<void>;
    onCancel: () => void;
}

export const PlatformRoleEditor: React.FC<Props> = ({ role, onSave, onCancel }) => {
    const [name, setName] = useState(role?.name || '');
    const [description, setDescription] = useState(role?.description || '');
    const [permissions, setPermissions] = useState<string[]>(role?.permissions || []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track which categories (modules) are enabled
    const [enabledCategories, setEnabledCategories] = useState<Set<PermissionCategory>>(
        new Set(AVAILABLE_PERMISSIONS
            .filter(cat => cat.actions.some(action => permissions.includes(action)))
            .map(cat => cat.category)
        )
    );

    const togglePermission = (perm: string) => {
        setPermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        );
    };

    const toggleCategory = (category: PermissionCategory, actions: string[]) => {
        const isEnabled = enabledCategories.has(category);
        
        if (isEnabled) {
            // Disable: Remove category and all its permissions
            setEnabledCategories(prev => {
                const next = new Set(prev);
                next.delete(category);
                return next;
            });
            setPermissions(prev => prev.filter(p => !actions.includes(p)));
        } else {
            // Enable: Add category and default to NO permissions (or all? Let's do all for convenience)
            setEnabledCategories(prev => {
                const next = new Set(prev);
                next.add(category);
                return next;
            });
            setPermissions(prev => [...new Set([...prev, ...actions])]);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Role name is required');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await onSave({
                name,
                description,
                permissions
            });
        } catch (err: any) {
            setError(err.message || 'Failed to save role');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-6xl mx-auto">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={onCancel}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {role ? 'Edit Platform Role' : 'New Platform Role'}
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Configure global permissions and module access</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save size={20} />
                                Save Role
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-10 space-y-12">
                {/* Basic Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Role Identity
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Platform Auditor"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold text-slate-900 focus:border-slate-900 focus:bg-white outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Description
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this role does..."
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-medium text-slate-600 focus:border-slate-900 focus:bg-white outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-4 p-6 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-4">
                        <AlertTriangle size={24} />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Modules & Permissions Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Module Permissions</h3>
                            <p className="text-sm text-slate-500 font-medium">Enable modules to grant access to their features</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                            <Shield size={16} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {permissions.length} Permissions Active
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {AVAILABLE_PERMISSIONS.map((cat) => {
                            const isEnabled = enabledCategories.has(cat.category);
                            
                            return (
                                <div 
                                    key={cat.category}
                                    className={`
                                        group relative rounded-[2.5rem] border-2 transition-all duration-300 p-8
                                        ${isEnabled 
                                            ? 'border-slate-900 bg-white shadow-2xl shadow-slate-100' 
                                            : 'border-slate-100 bg-slate-50/50 grayscale hover:grayscale-0 hover:border-slate-200'
                                        }
                                    `}
                                >
                                    {/* Module Header */}
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                                ${isEnabled ? 'bg-slate-900 text-white rotate-12' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'}
                                            `}>
                                                <LayoutGrid size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-900">{cat.category}</h4>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {isEnabled ? 'Module Enabled' : 'Module Disabled'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => toggleCategory(cat.category, cat.actions)}
                                            className={`
                                                w-16 h-8 rounded-full relative transition-all duration-500 p-1
                                                ${isEnabled ? 'bg-emerald-500' : 'bg-slate-200'}
                                            `}
                                        >
                                            <div className={`
                                                w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500
                                                ${isEnabled ? 'translate-x-8' : 'translate-x-0'}
                                            `} />
                                        </button>
                                    </div>

                                    {/* Granular Permissions */}
                                    {isEnabled && (
                                        <div className="grid grid-cols-1 gap-3 animate-in fade-in zoom-in-95 duration-300">
                                            {cat.actions.map(action => {
                                                const isActive = permissions.includes(action);
                                                return (
                                                    <button
                                                        key={action}
                                                        onClick={() => togglePermission(action)}
                                                        className={`
                                                            flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left
                                                            ${isActive 
                                                                ? 'border-slate-900 bg-slate-50 text-slate-900' 
                                                                : 'border-slate-50 bg-white text-slate-500 hover:border-slate-200 hover:text-slate-700'
                                                            }
                                                        `}
                                                    >
                                                        <span className="text-xs font-black uppercase tracking-tight">{action}</span>
                                                        <div className={`
                                                            w-6 h-6 rounded-full flex items-center justify-center transition-all
                                                            ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-transparent'}
                                                        `}>
                                                            <Check size={14} />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {!isEnabled && (
                                        <div className="flex items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-slate-50/50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-8">
                                                Enable module to configure <br/> granular permissions
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
