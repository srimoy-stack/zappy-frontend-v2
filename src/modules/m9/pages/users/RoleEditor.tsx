'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { Role } from '../../types/users';
import { PermissionCategory } from './PermissionCategory';
import { AVAILABLE_PERMISSIONS } from '../../services/userService';

interface Props {
    role?: Role; // If undefined, creating new
    onSave: (role: Partial<Role>) => Promise<void>;
    onCancel: () => void;
}

export const RoleEditor: React.FC<Props> = ({ role, onSave, onCancel }) => {
    const [name, setName] = useState(role?.name || '');
    const [description, setDescription] = useState(role?.description || '');
    const [permissions, setPermissions] = useState<string[]>(role?.permissions || []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleToggle = (perm: string) => {
        setPermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        );
    };

    const handleToggleCategory = (actions: string[], checked: boolean) => {
        setPermissions(prev => {
            if (checked) {
                // Add all actions if not present
                const toAdd = actions.filter(a => !prev.includes(a));
                return [...prev, ...toAdd];
            } else {
                // Remove all actions
                return prev.filter(p => !actions.includes(p));
            }
        });
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Role Name is required');
            return;
        }

        setError(null);
        setSaving(true);
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {role ? 'Edit Role' : 'Create New Role'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">Define permissions for this employee role</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Role
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-8 max-w-5xl mx-auto space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Role Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Senior Cashier"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Description
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of responsibilities"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
                        <AlertTriangle size={20} />
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                {/* Permissions Grid */}
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Permissions</h3>
                    <div className="space-y-4">
                        {AVAILABLE_PERMISSIONS.map(cat => (
                            <PermissionCategory
                                key={cat.category}
                                category={cat.category}
                                actions={cat.actions}
                                selectedPermissions={permissions}
                                onToggle={handleToggle}
                                onToggleAll={(checked) => handleToggleCategory(cat.actions, checked)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
