'use client';

import React, { useState, useEffect } from 'react';
import { Plus, History, Shield, Users as UsersIcon } from 'lucide-react';
import { User } from '../../types/users';
import { userService } from '../../services/userService';
import { UsersTable } from './UsersTable';
import { AddUserModal } from './AddUserModal';
import { AuditLogPanel } from './AuditLogPanel';
import { useRouter } from 'next/navigation';
;

export const UsersPage: React.FC = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined);
    const [showAudit, setShowAudit] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreate = () => {
        setUserToEdit(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (user: User) => {
        if (!window.confirm(`Are you sure you want to ${user.status === 'Active' ? 'disable' : 'enable'} this user?`)) return;

        try {
            await userService.toggleUserStatus(user.id);
            await loadUsers();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
                        <UsersIcon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage system access and employees</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAudit(!showAudit)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${showAudit ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <History size={18} />
                        {showAudit ? 'Hide Audit Log' : 'View Audit Log'}
                    </button>
                    <button
                        onClick={() => router.push('/backoffice/roles')}
                        className="flex items-center gap-2 px-5 py-3 text-slate-600 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        <Shield size={18} />
                        Manage Roles
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add New User
                    </button>
                </div>
            </div>

            <div className="flex gap-6 items-start">
                <div className={`flex-1 transition-all duration-500 ${showAudit ? 'w-2/3' : 'w-full'}`}>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                        </div>
                    ) : (
                        <UsersTable
                            users={users}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                        />
                    )}
                </div>

                {showAudit && (
                    <div className="w-1/3 sticky top-6 animate-in slide-in-from-right duration-300">
                        <AuditLogPanel />
                    </div>
                )}
            </div>

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={loadUsers}
                userToEdit={userToEdit}
            />
        </div>
    );
};
