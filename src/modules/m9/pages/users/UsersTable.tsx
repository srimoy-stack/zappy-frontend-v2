import React from 'react';
import { Edit3, UserX, UserCheck, Shield, Store } from 'lucide-react';
import { User } from '../../types/users';

interface Props {
    users: User[];
    onEdit: (user: User) => void;
    onToggleStatus: (user: User) => void;
}

export const UsersTable: React.FC<Props> = ({ users, onEdit, onToggleStatus }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left pl-8">Name</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Type</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Role</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Stores</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5 pl-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black uppercase">
                                            {user.fullName.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">{user.fullName}</div>
                                            <div className="text-xs font-medium text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold whitespace-nowrap">
                                        {user.type}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-emerald-500" />
                                        <span className="text-sm font-bold text-slate-700">{user.roleName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-wrap gap-1">
                                        {user.assignedStores.map(store => (
                                            <span key={store} className="inline-flex items-center gap-1 px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                                <Store size={10} />
                                                {store}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`
                                        px-3 py-1 rounded-full text-xs font-bold border
                                        ${user.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-rose-50 text-rose-700 border-rose-100'
                                        }
                                    `}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 pr-8 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                            title="Edit User"
                                        >
                                            <Edit3 size={16} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => onToggleStatus(user)}
                                            className={`p-2 rounded-lg transition-all ${user.status === 'Active'
                                                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                                    : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                                }`}
                                            title={user.status === 'Active' ? 'Disable User' : 'Activate User'}
                                        >
                                            {user.status === 'Active'
                                                ? <UserX size={16} strokeWidth={2.5} />
                                                : <UserCheck size={16} strokeWidth={2.5} />
                                            }
                                        </button>
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
