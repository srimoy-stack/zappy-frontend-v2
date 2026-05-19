'use client';

import React, { useState } from 'react';
import {
    Users, Plus, Search, UserCircle, Mail, Shield, Store,
    Ban, RefreshCw, Send, X, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { TENANT_USER_TYPES, UserType } from '@/shared/types/auth';

interface TenantUser {
    id: string;
    name: string;
    email: string;
    userType: UserType;
    role: string;
    status: 'Active' | 'Inactive';
    storeAccess: string;
    storeIds: string[];
    lastLogin?: string;
    createdAt: string;
}

const TENANT_USER_LABELS: Record<string, string> = {
    [UserType.BRAND_ADMIN]: 'Brand Admin',
    [UserType.ADMIN]: 'Admin',
    [UserType.MANAGER]: 'Store Manager',
    [UserType.POS_USER]: 'POS User',
    [UserType.KITCHEN_USER]: 'KDS User',
    [UserType.EMPLOYEE]: 'Employee',
    [UserType.CALL_CENTER]: 'Call Center',
    [UserType.DELIVERY]: 'Delivery',
};

const ALLOWED_TENANT_TYPES: UserType[] = [
    UserType.BRAND_ADMIN,
    UserType.MANAGER,
    UserType.POS_USER,
    UserType.KITCHEN_USER,
    UserType.EMPLOYEE,
];

interface UsersTabProps {
    tenantId: string;
    users: TenantUser[];
    stores: { id: string; name: string }[];
}

export function UsersTab({ tenantId, users: initialUsers, stores }: UsersTabProps) {
    const [users, setUsers] = useState(initialUsers);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Create form
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newType, setNewType] = useState<UserType>(UserType.MANAGER);
    const [newStoreIds, setNewStoreIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // TODO: API call — POST /tenants/{tenantId}/users
            const newUser: TenantUser = {
                id: `u-${Date.now()}`,
                name: newName,
                email: newEmail,
                userType: newType,
                role: TENANT_USER_LABELS[newType] || newType,
                status: 'Active',
                storeAccess: newStoreIds.length ? stores.filter(s => newStoreIds.includes(s.id)).map(s => s.name).join(', ') : 'All Locations',
                storeIds: newStoreIds,
                createdAt: new Date().toISOString(),
            };
            setUsers(prev => [...prev, newUser]);
            setIsAddModalOpen(false);
            setNewName('');
            setNewEmail('');
            setNewType(UserType.MANAGER);
            setNewStoreIds([]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Users size={18} />
                        Tenant Users
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {users.length} users — All users belong to tenant <code className="bg-slate-100 px-1 rounded text-[10px]">{tenantId}</code>
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all"
                >
                    <Plus size={14} /> Add User
                </button>
            </div>

            {/* Governance Notice */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-blue-800">
                    Every user created here requires <code className="bg-blue-100 px-1 rounded">tenant_id</code> + <code className="bg-blue-100 px-1 rounded">role_id</code> + <code className="bg-blue-100 px-1 rounded">user_type</code>. No orphan users.
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-6 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Access</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map(user => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                <UserCircle size={20} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-slate-900 block">{user.name}</span>
                                                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                    <Mail size={10} /> {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-wider">
                                            {TENANT_USER_LABELS[user.userType] || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                                            <Store size={11} className="text-slate-400" />
                                            {user.storeAccess}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            <CheckCircle2 size={10} /> {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button title="Resend Invite" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <Send size={14} />
                                            </button>
                                            {user.status === 'Active' ? (
                                                <button title="Suspend" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                                    <Ban size={14} />
                                                </button>
                                            ) : (
                                                <button title="Reactivate" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                                    <RefreshCw size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Add Tenant User</h3>
                                <p className="text-xs text-slate-500 font-medium">Scoped to tenant <code className="bg-slate-100 px-1 rounded">{tenantId}</code></p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Smith"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@brand.com"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Type</label>
                                <select required value={newType} onChange={e => setNewType(e.target.value as UserType)}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none">
                                    {ALLOWED_TENANT_TYPES.map(t => (
                                        <option key={t} value={t}>{TENANT_USER_LABELS[t]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Assignment</label>
                                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    {stores.map(s => (
                                        <label key={s.id} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newStoreIds.includes(s.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setNewStoreIds(prev => [...prev, s.id]);
                                                    else setNewStoreIds(prev => prev.filter(x => x !== s.id));
                                                }}
                                                className="rounded"
                                            />
                                            {s.name}
                                        </label>
                                    ))}
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium">Leave empty for all-store access</p>
                            </div>
                            <button type="submit" disabled={isSubmitting}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50">
                                {isSubmitting ? 'Creating...' : 'Create Tenant User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
