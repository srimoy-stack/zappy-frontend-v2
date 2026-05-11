'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCircle, Mail, Shield, Trash2, Pencil, MoreVertical, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { platformUserService, PlatformUser, PLATFORM_USER_TYPE_LABELS } from '@/modules/platform/services/platformUserService';
import { UserType, PLATFORM_USER_TYPES } from '@/shared/types/auth';
import { Role } from '@/shared/types/role';

export default function PlatformUsersPage() {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRoleId, setNewUserRoleId] = useState('');
    const [newUserType, setNewUserType] = useState<UserType>(UserType.PLATFORM_ADMIN);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([
                platformUserService.getUsers(),
                platformUserService.getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await platformUserService.createUser({
                fullName: newUserName,
                email: newUserEmail,
                roleId: newUserRoleId,
                userType: newUserType,
            });
            await loadData();
            setIsAddModalOpen(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserRoleId('');
            setNewUserType(UserType.PLATFORM_ADMIN);
        } catch (error) {
            alert('Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const activeCount = users.filter(u => u.status === 'Active').length;
    const byType = PLATFORM_USER_TYPES.reduce((acc, t) => {
        acc[t] = users.filter(u => u.userType === t).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Users</h1>
                    <p className="text-slate-500 font-medium mt-1">Internal Zyappy operators — platform-scoped access only</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    <Plus size={20} />
                    Add Platform User
                </button>
            </div>

            {/* Governance Notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-amber-800">Platform Users Only</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Tenant users (Brand Admin, Store Manager, POS User, etc.) are managed from each tenant's detail page → Users tab.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Super Admins</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{byType[UserType.PLATFORM_SUPER_ADMIN] || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Roles</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{roles.length}</div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-24 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Platform Users...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Administrator</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">User Type</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">System Role</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                    <UserCircle size={28} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-black text-slate-900">{user.fullName}</span>
                                                    <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                {PLATFORM_USER_TYPE_LABELS[user.userType] || user.userType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                                                <Shield size={14} className="text-slate-400" />
                                                <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{user.roleName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <CheckCircle2 size={12} />
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-500 tabular-nums">
                                                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                                                    <Pencil size={18} />
                                                </button>
                                                <button className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                                    <Trash2 size={18} />
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

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">New Platform User</h3>
                                <p className="text-sm text-slate-500 font-medium">Create an internal Zyappy operator account</p>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-3 hover:bg-slate-200 rounded-2xl transition-colors"
                            >
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        placeholder="john@zappy.io"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">User Type</label>
                                    <select
                                        required
                                        value={newUserType}
                                        onChange={(e) => setNewUserType(e.target.value as UserType)}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none"
                                    >
                                        {PLATFORM_USER_TYPES.map(t => (
                                            <option key={t} value={t}>{PLATFORM_USER_TYPE_LABELS[t]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Role</label>
                                    <select
                                        required
                                        value={newUserRoleId}
                                        onChange={(e) => setNewUserRoleId(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select a role...</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-lg font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? 'Provisioning...' : 'Provision Platform Access'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
