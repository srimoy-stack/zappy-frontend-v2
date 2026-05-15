'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Role } from '../../types/users';
import { userService } from '../../services/userService';
import { RolesTable } from './RolesTable';
import { RoleEditor } from './RoleEditor';

export const RolesPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await userService.getRoles();
            setRoles(data);
        } catch (error) {
            console.error('Failed to load roles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const handleCreate = () => {
        setEditingRole(undefined);
        setView('edit');
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setView('edit');
    };

    const handleDelete = async (role: Role) => {
        if (!window.confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

        try {
            await userService.deleteRole(role.id);
            await loadRoles();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSave = async (roleData: Partial<Role>) => {
        if (editingRole) {
            await userService.updateRole(editingRole.id, roleData);
        } else {
            // @ts-ignore - id/createdAt handled by service
            await userService.createRole(roleData);
        }
        await loadRoles();
        setView('list');
    };

    if (view === 'edit') {
        return (
            <div className="max-w-[1600px] mx-auto pb-24 space-y-6">
                <RoleEditor
                    role={editingRole}
                    onSave={handleSave}
                    onCancel={() => setView('list')}
                />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Employee Roles</h1>
                    <p className="text-slate-500 font-medium mt-1">Define permissions and access levels for staff</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus size={18} strokeWidth={3} />
                    Add New Role
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
            ) : (
                <RolesTable
                    roles={roles}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};
