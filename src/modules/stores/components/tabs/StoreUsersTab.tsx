'use client';

import { useState } from 'react';
import {
    Users, Shield, Crown, Clock, Mail, Loader2, Plus, Pencil,
    X, UserPlus, ChevronDown, Check,
} from 'lucide-react';
import { cn } from '@/utils';
import type { StoreUser } from '@/shared/types/store';

interface StoreUsersTabProps {
    users: StoreUser[];
    onAssignManager: (userId: string) => Promise<void>;
    onCreateUser?: (user: Omit<StoreUser, 'id' | 'lastLogin' | 'createdAt'>) => Promise<void>;
    onUpdateUser?: (userId: string, updates: Partial<StoreUser>) => Promise<void>;
}

const STATUS_STYLE: Record<StoreUser['status'], { color: string; bg: string; border: string }> = {
    Active: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    Inactive: { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
    Pending: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
};

const ROLES = ['Store Manager', 'Cashier', 'Kitchen Staff', 'Delivery Driver', 'Shift Lead', 'Inventory Clerk'];
const I = 'w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all';
const L = 'text-[10px] font-black text-slate-600 uppercase tracking-widest';

// ─── User Form Panel ────────────────────────────────────────────────────────

interface UserFormProps {
    title: string;
    initial?: Partial<StoreUser>;
    onSave: (data: { name: string; email: string; role: string; status: StoreUser['status']; isManager: boolean }) => Promise<void>;
    onCancel: () => void;
}

function UserFormPanel({ title, initial, onSave, onCancel }: UserFormProps) {
    const [name, setName] = useState(initial?.name || '');
    const [email, setEmail] = useState(initial?.email || '');
    const [role, setRole] = useState(initial?.role || 'Cashier');
    const [status, setStatus] = useState<StoreUser['status']>(initial?.status || 'Active');
    const [isManager, setIsManager] = useState(initial?.isManager || false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email required';
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSaving(true);
        try { await onSave({ name, email, role, status, isManager }); }
        finally { setSaving(false); }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UserPlus size={16} /> {title}
                </h4>
                <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                    <X size={16} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className={L}>Full Name <span className="text-rose-500">*</span></label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" className={cn(I, errors.name && 'border-rose-300')} />
                    {errors.name && <p className="text-[10px] text-rose-500 font-bold">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                    <label className={L}>Email <span className="text-rose-500">*</span></label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@store.com" className={cn(I, errors.email && 'border-rose-300')} />
                    {errors.email && <p className="text-[10px] text-rose-500 font-bold">{errors.email}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <label className={L}>Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className={cn(I, 'appearance-none')}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className={L}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as StoreUser['status'])} className={cn(I, 'appearance-none')}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className={L}>Manager</label>
                    <button type="button" onClick={() => setIsManager(!isManager)}
                        className={cn('w-full px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all text-left flex items-center gap-2',
                            isManager ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                        )}>
                        <Crown size={14} className={isManager ? 'text-amber-500' : 'text-slate-300'} />
                        {isManager ? 'Yes — Manager' : 'No'}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button onClick={onCancel} className="px-5 py-2.5 text-xs font-black text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                    Cancel
                </button>
                <button onClick={handleSubmit} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200">
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {saving ? 'Saving...' : initial?.name ? 'Update User' : 'Add User'}
                </button>
            </div>
        </div>
    );
}

// ─── Main Tab ───────────────────────────────────────────────────────────────

export function StoreUsersTab({ users: initialUsers, onAssignManager, onCreateUser, onUpdateUser }: StoreUsersTabProps) {
    const [users, setUsers] = useState(initialUsers);
    const [promoting, setPromoting] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<'create' | 'edit' | null>(null);
    const [editingUser, setEditingUser] = useState<StoreUser | null>(null);

    const handlePromote = async (userId: string) => {
        setPromoting(userId);
        try { await onAssignManager(userId); }
        finally { setPromoting(null); }
    };

    const handleCreate = async (data: { name: string; email: string; role: string; status: StoreUser['status']; isManager: boolean }) => {
        if (onCreateUser) await onCreateUser(data);
        const newUser: StoreUser = { id: `user-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
        setUsers(prev => [...prev, newUser]);
        setShowForm(null);
    };

    const handleUpdate = async (data: { name: string; email: string; role: string; status: StoreUser['status']; isManager: boolean }) => {
        if (editingUser) {
            if (onUpdateUser) await onUpdateUser(editingUser.id, data);
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
        }
        setShowForm(null);
        setEditingUser(null);
    };

    const startEdit = (user: StoreUser) => {
        setEditingUser(user);
        setShowForm('edit');
    };

    const manager = users.find(u => u.isManager);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create / Edit Form */}
            {showForm === 'create' && (
                <UserFormPanel title="Add New User" onSave={handleCreate} onCancel={() => setShowForm(null)} />
            )}
            {showForm === 'edit' && editingUser && (
                <UserFormPanel title="Edit User" initial={editingUser} onSave={handleUpdate} onCancel={() => { setShowForm(null); setEditingUser(null); }} />
            )}

            {/* Manager Card */}
            {manager && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Crown size={16} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Store Manager</span>
                        </div>
                        <button onClick={() => startEdit(manager)}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Edit manager">
                            <Pencil size={13} />
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-lg font-black">
                            {manager.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-base font-black">{manager.name}</h4>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                <Mail size={11} /> {manager.email}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff Table */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] flex items-center gap-2.5">
                        <span className="w-1 h-5 rounded-full bg-violet-500" />
                        <Users size={14} /> Store Staff ({users.length})
                    </h3>
                    <button onClick={() => setShowForm('create')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        <Plus size={12} /> Add User
                    </button>
                </div>

                {users.length === 0 ? (
                    <div className="p-16 text-center">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-900 mb-2">No Users</h3>
                        <p className="text-sm text-slate-500 font-medium max-w-md mx-auto mb-6">
                            No users assigned to this store yet. Add your first team member.
                        </p>
                        <button onClick={() => setShowForm('create')}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
                            <Plus size={14} className="inline mr-2" /> Add First User
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left px-6 py-3">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">User</span>
                                </th>
                                <th className="text-left px-4 py-3">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</span>
                                </th>
                                <th className="text-center px-4 py-3">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                                </th>
                                <th className="text-center px-4 py-3 hidden md:table-cell">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Login</span>
                                </th>
                                <th className="text-right px-6 py-3">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(user => {
                                const st = STATUS_STYLE[user.status];
                                return (
                                    <tr key={user.id} className="group hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0',
                                                    user.isManager ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                                )}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-slate-900 truncate">{user.name}</span>
                                                        {user.isManager && (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[8px] font-black uppercase">
                                                                <Crown size={8} /> MGR
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs font-bold text-slate-700">{user.role}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border', st.bg, st.color, st.border)}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center hidden md:table-cell">
                                            {user.lastLogin ? (
                                                <span className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                                                    <Clock size={10} /> {new Date(user.lastLogin).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-medium">Never</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => startEdit(user)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit user">
                                                    <Pencil size={13} />
                                                </button>
                                                {!user.isManager && (
                                                    <button onClick={() => handlePromote(user.id)} disabled={promoting === user.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-black text-slate-500 bg-slate-50 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-all uppercase tracking-widest disabled:opacity-50"
                                                        title="Promote to manager">
                                                        {promoting === user.id ? <Loader2 size={10} className="animate-spin" /> : <Shield size={10} />}
                                                        Promote
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* Table Footer */}
                {users.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                        <span className="text-[10px] font-bold text-slate-500">
                            {users.length} user{users.length !== 1 ? 's' : ''} assigned
                        </span>
                    </div>
                )}
            </section>
        </div>
    );
}
