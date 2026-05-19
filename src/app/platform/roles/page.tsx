'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Shield, Trash2, Pencil, ExternalLink, ShieldCheck } from 'lucide-react';
import { Role } from '@/shared/types/role';
import { platformUserService } from '@/modules/platform/services/platformUserService';
import { PlatformRoleEditor } from '@/modules/platform/components/roles/PlatformRoleEditor';

export default function PlatformRolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const data = await platformUserService.getRoles();
            setRoles(data);
        } catch (error) {
            console.error('Failed to load roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRole(undefined);
        setView('EDITOR');
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setView('EDITOR');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this platform role?')) {
            try {
                await platformUserService.deleteRole(id);
                loadRoles();
            } catch (error) {
                alert('Failed to delete role');
            }
        }
    };

    const handleSave = async (roleData: Partial<Role>) => {
        try {
            if (editingRole) {
                await platformUserService.updateRole(editingRole.id, roleData);
            } else {
                await platformUserService.createRole(roleData as any);
            }
            loadRoles();
            setView('LIST');
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        }
    };

    const filteredRoles = roles.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (view === 'EDITOR') {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4">
                <PlatformRoleEditor 
                    role={editingRole}
                    onSave={handleSave}
                    onCancel={() => setView('LIST')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-900 rounded-xl">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Roles</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Manage system-wide permissions and custom administrative roles</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    <Plus size={20} />
                    Create Custom Role
                </button>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search platform roles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total:</span>
                        <span className="text-sm font-black text-slate-900">{filteredRoles.length}</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-24 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hydrating Roles...</span>
                    </div>
                ) : filteredRoles.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Roles Found</h3>
                        <p className="text-slate-500 mt-2">Adjust your search or create a new custom role</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Role Details</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Modules Covered</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Permission Count</th>
                                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRoles.map(role => (
                                    <tr key={role.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{role.name}</span>
                                                <span className="text-sm text-slate-500 font-medium">{role.description || 'No description provided'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {role.permissions.length > 0 ? (
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                                                        Active Config
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase rounded-lg">
                                                        Restricted
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-slate-900 tabular-nums">
                                                {role.permissions.length} actions
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${role.isSystem ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {role.isSystem && <Shield size={12} />}
                                                {role.isSystem ? 'System' : 'Custom'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(role)}
                                                    className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                {!role.isSystem && (
                                                    <button 
                                                        onClick={() => handleDelete(role.id)}
                                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
