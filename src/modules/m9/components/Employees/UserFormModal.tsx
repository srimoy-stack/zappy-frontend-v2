'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UserType } from '@/shared/types/auth';
import { Employee } from '../../types/employees';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Employee>) => void;
    initialData?: Employee | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const [formData, setFormData] = useState<Partial<Employee>>({
        name: '',
        email: '',
        userType: UserType.POS_USER,
        role: { id: 'default', name: 'User', permissions: [], isSystem: false },
        status: 'Active',
        storeIds: [],
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                email: '',
                userType: UserType.POS_USER,
                role: { id: 'default', name: 'User', permissions: [], isSystem: false },
                status: 'Active',
                storeIds: [],
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">
                        {initialData ? 'Edit User' : 'Add New User'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="e.g. Robin Singh"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Access</label>
                            <select
                                value={formData.userType}
                                onChange={(e) => setFormData({ ...formData, userType: e.target.value as UserType })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all appearance-none"
                            >
                                <option value={UserType.ADMIN}>Admin (Sub-Brand)</option>
                                <option value={UserType.MANAGER}>Store Manager</option>
                                <option value={UserType.POS_USER}>POS Operator</option>
                                <option value={UserType.KITCHEN_USER}>Kitchen Display</option>
                                <option value={UserType.CALL_CENTER}>Call Center</option>
                                <option value={UserType.DELIVERY}>Delivery Driver</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Permission Role</label>
                            <select
                                value={formData.role?.id}
                                onChange={(e) => {
                                    const selectedOption = e.target.selectedOptions[0];
                                    setFormData({ 
                                        ...formData, 
                                        role: { 
                                            id: e.target.value, 
                                            name: selectedOption?.text || 'User', 
                                            permissions: [], 
                                            isSystem: false 
                                        } 
                                    });
                                }}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all appearance-none"
                            >
                                <option value="default">Default User</option>
                                <option value="elevated">Elevated Access</option>
                                <option value="restricted">Restricted Access</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Stores (Comma separated)</label>
                        <input
                            type="text"
                            value={formData.storeIds?.join(', ')}
                            onChange={(e) => setFormData({ ...formData, storeIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="Main Street Store, Downtown"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-black/10"
                        >
                            {initialData ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
