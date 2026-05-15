import React from 'react';
import { Employee } from '../../types/employees';
import { Edit2, Trash2, Lock, Power } from 'lucide-react';
import { format } from 'date-fns';

interface EmployeesTableProps {
    employees: Employee[];
    onEdit: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
    onRowClick: (employee: Employee) => void;
    onStatusToggle?: (employee: Employee) => void;
    selectedIds: string[];
    onSelectRow: (id: string) => void;
    onSelectAll: (ids: string[]) => void;
    isAdmin: boolean;
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
    employees,
    onEdit,
    onDelete,
    onRowClick,
    onStatusToggle,
    selectedIds,
    onSelectRow,
    onSelectAll,
    isAdmin
}) => {
    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onSelectAll(employees.map(emp => emp.id));
        } else {
            onSelectAll([]);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-white">
                        <th className="py-4 px-6 w-10">
                            <input
                                type="checkbox"
                                checked={employees.length > 0 && selectedIds.length === employees.length}
                                onChange={handleToggleAll}
                                className="w-4 h-4 rounded border-slate-300 accent-black cursor-pointer"
                            />
                        </th>
                        <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide">Name</th>
                        <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide">Role</th>
                        <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide">Stores</th>
                        <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide">Status</th>
                        <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide">Last Login</th>
                        <th className="py-4 px-6 text-[13px] font-bold text-slate-800 tracking-wide text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {employees.map((employee) => (
                        <tr
                            key={employee.id}
                            onClick={() => onRowClick(employee)}
                            className={`group cursor-pointer transition-colors ${selectedIds.includes(employee.id) ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                                }`}
                        >
                            <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(employee.id)}
                                    onChange={() => onSelectRow(employee.id)}
                                    className="w-4 h-4 rounded border-slate-300 accent-black cursor-pointer"
                                />
                            </td>
                            <td className="py-4 px-4">
                                <span className="text-[13px] font-bold text-slate-900">{employee.name}</span>
                            </td>
                            <td className="py-4 px-4">
                                <span className="text-[13px] text-slate-500 font-medium uppercase tracking-wider">
                                    {employee.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <span className="text-[13px] text-slate-500">
                                    {employee.stores.length > 1
                                        ? `${employee.stores.length} Stores`
                                        : employee.stores[0]}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <span className={`inline-flex items-center gap-1.5 text-[12px] font-bold ${employee.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${employee.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`} />
                                    {employee.status}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <span className="text-[13px] text-slate-400 font-medium tabular-nums">
                                    {format(new Date(employee.lastLogin), 'MMM d, HH:mm')}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1">
                                    {isAdmin && (
                                        <button
                                            onClick={() => onStatusToggle?.(employee)}
                                            className={`p-1.5 rounded-md transition-all ${employee.status === 'ACTIVE'
                                                    ? 'text-emerald-500 hover:bg-emerald-50'
                                                    : 'text-slate-400 hover:bg-slate-100'
                                                }`}
                                            title={employee.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power className="w-4 h-4" />
                                        </button>
                                    )}

                                    {isAdmin ? (
                                        <>
                                            <button
                                                onClick={() => onEdit(employee)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(employee)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <Lock className="w-4 h-4 text-slate-300 mr-2" />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
