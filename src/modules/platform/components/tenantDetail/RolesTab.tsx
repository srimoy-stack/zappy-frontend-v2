'use client';

import React, { useState } from 'react';
import { Shield, Plus, Lock, Key, Eye, Pencil, X, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '@/shared/api/apiClient';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TenantRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    usersCount: number;
    isSystem: boolean;
}

/** Centralized permission definitions — future: fetched from API */
const PERMISSION_CATEGORIES = [
    {
        category: 'Point of Sale',
        permissions: [
            { key: 'pos.terminal.*', label: 'Terminal Access' },
            { key: 'pos.orders.create', label: 'Create Orders' },
            { key: 'pos.orders.read', label: 'View Orders' },
            { key: 'pos.orders.refund', label: 'Process Refunds' },
            { key: 'pos.void', label: 'Void Transactions' },
        ],
    },
    {
        category: 'Inventory',
        permissions: [
            { key: 'inventory.read', label: 'View Inventory' },
            { key: 'inventory.write', label: 'Update Stock' },
            { key: 'inventory.adjustments', label: 'Stock Adjustments' },
        ],
    },
    {
        category: 'Reports',
        permissions: [
            { key: 'reports.*', label: 'Full Reports Access' },
            { key: 'reports.sales', label: 'Sales Reports' },
            { key: 'reports.inventory', label: 'Inventory Reports' },
        ],
    },
    {
        category: 'Users & Roles',
        permissions: [
            { key: 'users.read', label: 'View Users' },
            { key: 'users.write', label: 'Manage Users' },
            { key: 'roles.read', label: 'View Roles' },
            { key: 'roles.write', label: 'Manage Roles' },
        ],
    },
    {
        category: 'Items',
        permissions: [
            { key: 'items.read', label: 'View Menu Items' },
            { key: 'items.write', label: 'Edit Menu Items' },
            { key: 'items.pricing', label: 'Manage Pricing' },
        ],
    },
    {
        category: 'Settings',
        permissions: [
            { key: 'settings.store', label: 'Store Settings' },
            { key: 'settings.brand', label: 'Brand Settings' },
        ],
    },
];

const MOCK_ROLES: TenantRole[] = [
    { id: 'role-admin', name: 'Brand Administrator', description: 'Full access to all tenant features and settings', permissions: ['*'], usersCount: 1, isSystem: true },
    { id: 'role-manager', name: 'Store Manager', description: 'Manage store operations, staff, and reporting', permissions: ['pos.*', 'reports.*', 'items.read', 'inventory.*'], usersCount: 3, isSystem: true },
    { id: 'role-pos', name: 'POS Operator', description: 'Process orders and manage terminal', permissions: ['pos.terminal.*', 'pos.orders.read'], usersCount: 8, isSystem: true },
    { id: 'role-kds', name: 'Kitchen Display', description: 'View and manage kitchen orders', permissions: ['kds.*'], usersCount: 4, isSystem: true },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface RolesTabProps {
    tenantId: string;
}

export function RolesTab({ tenantId }: RolesTabProps) {
    const [roles, setRoles] = useState(MOCK_ROLES);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [expandedRole, setExpandedRole] = useState<string | null>(null);

    // Create form
    const [roleName, setRoleName] = useState('');
    const [roleDesc, setRoleDesc] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const togglePerm = (key: string) => {
        setSelectedPerms(prev =>
            prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
        );
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim() || selectedPerms.length === 0) return;
        setIsSubmitting(true);
        try {
            // API-ready: POST /tenants/{tenantId}/roles
            // await apiClient.post(`/tenants/${tenantId}/roles`, { name: roleName, description: roleDesc, permissions: selectedPerms });
            const newRole: TenantRole = {
                id: `role-${Date.now()}`,
                name: roleName.trim(),
                description: roleDesc.trim(),
                permissions: selectedPerms,
                usersCount: 0,
                isSystem: false,
            };
            setRoles(prev => [...prev, newRole]);
            setIsCreateOpen(false);
            setRoleName(''); setRoleDesc(''); setSelectedPerms([]);
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Shield size={18} /> Roles & Permissions
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {roles.length} roles — {roles.filter(r => r.isSystem).length} system, {roles.filter(r => !r.isSystem).length} custom
                    </p>
                </div>
                <button onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
                    <Plus size={14} /> Custom Role
                </button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map(role => (
                    <div key={role.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                    <Key size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                        {role.name}
                                        {role.isSystem && (
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                                <Lock size={7} /> System
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{role.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                            <span>{role.usersCount} users</span>
                            <span>•</span>
                            <span>{role.permissions.length} permissions</span>
                        </div>

                        {/* Permission Pills */}
                        <div className="flex flex-wrap gap-1 mb-4">
                            {role.permissions.slice(0, expandedRole === role.id ? 20 : 4).map(p => (
                                <span key={p} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-mono font-bold text-slate-600">
                                    {p}
                                </span>
                            ))}
                            {role.permissions.length > 4 && expandedRole !== role.id && (
                                <button onClick={() => setExpandedRole(role.id)}
                                    className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-blue-500 hover:text-blue-700">
                                    +{role.permissions.length - 4} more
                                </button>
                            )}
                            {expandedRole === role.id && (
                                <button onClick={() => setExpandedRole(null)}
                                    className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400 hover:text-slate-600">
                                    collapse
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all" aria-label="View permissions">
                                <Eye size={14} />
                            </button>
                            {!role.isSystem && (
                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all" aria-label="Edit role">
                                    <Pencil size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Create Role Modal ──────────────────────────────────────────── */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Create Custom Role</h3>
                                <p className="text-xs text-slate-500 font-medium">Tenant <code className="bg-slate-100 px-1 rounded">{tenantId}</code></p>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Name *</label>
                                    <input required value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="Shift Lead"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                    <input value={roleDesc} onChange={e => setRoleDesc(e.target.value)} placeholder="Manages shift operations"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                </div>
                            </div>

                            {/* Permission Matrix */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Permissions ({selectedPerms.length} selected)
                                </label>
                                <div className="space-y-4 max-h-72 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    {PERMISSION_CATEGORIES.map(cat => (
                                        <div key={cat.category}>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">{cat.category}</span>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {cat.permissions.map(p => (
                                                    <label key={p.key} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
                                                        <input type="checkbox" checked={selectedPerms.includes(p.key)}
                                                            onChange={() => togglePerm(p.key)} className="rounded border-slate-300" />
                                                        <span className="text-xs font-bold text-slate-700">{p.label}</span>
                                                        <span className="text-[8px] font-mono text-slate-400 ml-auto">{p.key}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting || selectedPerms.length === 0}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50">
                                {isSubmitting ? 'Creating...' : 'Create Role'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
