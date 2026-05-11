'use client';

import React from 'react';
import { Shield, Plus, Lock, Key, Eye, Pencil } from 'lucide-react';

interface TenantRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    usersCount: number;
    isSystem: boolean;
}

const MOCK_ROLES: TenantRole[] = [
    { id: 'role-admin', name: 'Brand Administrator', description: 'Full access to all tenant features and settings', permissions: ['*'], usersCount: 1, isSystem: true },
    { id: 'role-manager', name: 'Store Manager', description: 'Manage store operations, staff, and reporting', permissions: ['pos.*', 'reports.*', 'items.read', 'inventory.*'], usersCount: 3, isSystem: true },
    { id: 'role-pos', name: 'POS Operator', description: 'Process orders and manage terminal', permissions: ['pos.terminal.*', 'pos.orders.read'], usersCount: 8, isSystem: true },
    { id: 'role-kds', name: 'Kitchen Display', description: 'View and manage kitchen orders', permissions: ['kds.*'], usersCount: 4, isSystem: true },
];

interface RolesTabProps {
    tenantId: string;
}

export function RolesTab({ tenantId }: RolesTabProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Shield size={18} />
                        Roles & Permissions
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Tenant-level role management and permission matrix
                    </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
                    <Plus size={14} /> Custom Role
                </button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_ROLES.map(role => (
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
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-wider">System</span>
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

                        <div className="flex flex-wrap gap-1 mb-4">
                            {role.permissions.slice(0, 4).map(p => (
                                <span key={p} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-mono font-bold text-slate-600">
                                    {p}
                                </span>
                            ))}
                            {role.permissions.length > 4 && (
                                <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400">
                                    +{role.permissions.length - 4} more
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                                <Eye size={14} />
                            </button>
                            {!role.isSystem && (
                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                                    <Pencil size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
