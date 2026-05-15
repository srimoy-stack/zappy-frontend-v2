import React from 'react';
import { Edit3, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { Role } from '../../types/users';

interface Props {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
}

export const RolesTable: React.FC<Props> = ({ roles, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left pl-8">Role Name</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Description</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Permissions</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {roles.map((role) => (
                            <tr key={role.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5 pl-8">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${role.isSystem ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {role.isSystem ? <ShieldCheck size={18} strokeWidth={2.5} /> : <Lock size={18} strokeWidth={2.5} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">{role.name}</div>
                                            {role.isSystem && <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">System Locked</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-medium text-slate-600 truncate max-w-xs">
                                        {role.description || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                                        {role.permissions.length} Enabled
                                    </span>
                                </td>
                                <td className="px-6 py-5 pr-8 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(role)}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                            title="Edit Role"
                                        >
                                            <Edit3 size={16} strokeWidth={2.5} />
                                        </button>
                                        {!role.isSystem && (
                                            <button
                                                onClick={() => onDelete(role)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete Role"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} />
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
    );
};
