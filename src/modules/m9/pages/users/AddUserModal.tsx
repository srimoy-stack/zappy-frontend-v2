'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { User, Role, UserType } from '../../types/users';
import { userService, AVAILABLE_PERMISSIONS } from '../../services/userService';
import { useAuth } from '@/shared/contexts/AuthContext';
import { api } from '@/shared/api';
import type { Store } from '@/shared/types/store';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    userToEdit?: User; // If present, edit mode
}

const USER_TYPES: UserType[] = [
    UserType.POS_USER,
    UserType.CALL_CENTER,
    UserType.KITCHEN_USER,
    UserType.MANAGER,
    UserType.ADMIN,
    UserType.DELIVERY
];

const USER_TYPE_LABELS: Record<UserType, string> = {
    [UserType.PLATFORM_SUPER_ADMIN]: 'Platform Super Admin',
    [UserType.PLATFORM_ADMIN]: 'Platform Admin',
    [UserType.PLATFORM_SUPPORT]: 'Platform Support',
    [UserType.PLATFORM_OPERATIONS]: 'Platform Operations',
    [UserType.BRAND_ADMIN]: 'Brand Admin',
    [UserType.ADMIN]: 'Admin User',
    [UserType.MANAGER]: 'Manager User',
    [UserType.POS_USER]: 'POS User',
    [UserType.KITCHEN_USER]: 'Kitchen User',
    [UserType.CALL_CENTER]: 'Call Center User',
    [UserType.DELIVERY]: 'Delivery User',
    [UserType.EMPLOYEE]: 'Employee',
};

export const AddUserModal: React.FC<Props> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const { tenantId } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState<UserType>(UserType.POS_USER);
    const [roleId, setRoleId] = useState('');
    const [assignedStores, setAssignedStores] = useState<string[]>([]);

    const [stores, setStores] = useState<Store[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Load roles
            userService.getRoles().then(setRoles).catch(console.error);

            // Load dynamic stores for this tenant
            if (tenantId) {
                api.getStores(tenantId).then(setStores).catch(console.error);
            }

            if (userToEdit) {
                setFullName(userToEdit.fullName);
                setEmail(userToEdit.email);
                setType(userToEdit.type as UserType);
                setRoleId(userToEdit.roleId);
                setAssignedStores(userToEdit.assignedStores);
            } else {
                // Reset
                setFullName('');
                setEmail('');
                setType(UserType.POS_USER);
                setRoleId('');
                setAssignedStores([]);
            }
            setError(null);
        }
    }, [isOpen, userToEdit, tenantId]);

    const validate = (): string | null => {
        if (!fullName.trim()) return 'Full name is required';
        if (!email.trim() || !email.includes('@')) return 'Valid email is required';
        if (!type) return 'User Type is required';
        if (!roleId) return 'Role is required';
        if (assignedStores.length === 0) return 'At least one store must be assigned';

        // Enforce Role <-> Type Rules
        const selectedRole = roles.find(r => r.id === roleId);
        if (!selectedRole) return 'Invalid role selected';

        if (type === UserType.KITCHEN_USER) {
            const hasKitchenPerms = selectedRole.permissions.some(p =>
                AVAILABLE_PERMISSIONS.find(api => api.category === 'Kitchen (KDS)')?.actions.includes(p)
            );
            if (!hasKitchenPerms) return 'Kitchen User must have a Role with "Kitchen (KDS)" permissions.';
        }

        if (type === UserType.POS_USER) {
            const hasPosPerms = selectedRole.permissions.some(p =>
                AVAILABLE_PERMISSIONS.find(api => api.category === 'POS')?.actions.includes(p)
            );
            if (!hasPosPerms) return 'POS User must have a Role with "POS" permissions.';
        }

        return null; // Valid
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (userToEdit) {
                await userService.updateUser(userToEdit.id, {
                    fullName,
                    email,
                    type,
                    roleId,
                    assignedStores
                });
            } else {
                await userService.createUser({
                    fullName,
                    email,
                    type,
                    roleId,
                    assignedStores,
                    tenantId: tenantId || undefined
                });
            }
            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    const toggleStore = (store: string) => {
        setAssignedStores(prev =>
            prev.includes(store) ? prev.filter(s => s !== store) : [...prev, store]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">{userToEdit ? 'Edit User' : 'Add New User'}</h2>
                        <p className="text-sm text-slate-500 font-medium">Create system access credentials</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
                            <AlertTriangle size={20} />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Full Name *</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">User Type *</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as UserType)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                            >
                                {USER_TYPES.map(t => (
                                    <option key={t} value={t}>{USER_TYPE_LABELS[t] || t}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium bg-slate-50 p-2 rounded-lg">
                                Defines system interface access (POS, Kitchen, Backoffice).
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Role *</label>
                            <select
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                            >
                                <option value="">Select Role</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium bg-slate-50 p-2 rounded-lg">
                                Defines specific actions and permissions.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Assigned Stores *</label>
                            {stores.length === 0 ? (
                                <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-bold flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    No stores configured. Please create a store first in settings!
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {stores.map(store => (
                                        <label key={store.id} className={`
                                            flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                                            ${assignedStores.includes(store.id) ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50'}
                                        `}>
                                            <input
                                                type="checkbox"
                                                checked={assignedStores.includes(store.id)}
                                                onChange={() => toggleStore(store.id)}
                                                className="rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className={`text-xs font-bold ${assignedStores.includes(store.id) ? 'text-emerald-900' : 'text-slate-600'}`}>
                                                {store.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save User
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
