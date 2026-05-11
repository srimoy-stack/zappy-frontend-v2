import React from 'react';
import { Shift } from '../../types/employees';
import { format } from 'date-fns';
import { Edit2, Eye } from 'lucide-react';

interface ShiftsTableProps {
    shifts: Shift[];
    onRowClick: (shift: Shift) => void;
    onEdit?: (shift: Shift) => void;
    showStore?: boolean;
    canEdit?: boolean;
}

export const ShiftsTable: React.FC<ShiftsTableProps> = ({
    shifts,
    onRowClick,
    onEdit,
    showStore = true,
    canEdit = false
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-white">
                        <th className="py-4 px-6 text-[13px] font-bold text-slate-800 tracking-wide">Date</th>
                        <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide">User</th>
                        {showStore && <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide">Store</th>}
                        <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide text-right">Opening</th>
                        <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide text-right">Closing</th>
                        <th className="py-4 px-4 text-[13px] font-bold text-slate-800 tracking-wide text-right">Variance</th>
                        <th className="py-4 px-6 text-[13px] font-bold text-slate-800 tracking-wide text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {shifts.map((shift) => (
                        <tr
                            key={shift.id}
                            onClick={() => onRowClick(shift)}
                            className="group hover:bg-slate-50/50 cursor-pointer transition-colors"
                        >
                            <td className="py-4 px-6">
                                <span className="text-[13px] text-slate-800 font-bold">
                                    {format(new Date(shift.date), 'MMM d, yyyy')}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex flex-col">
                                    <span className="text-[13px] text-slate-800 font-medium">{shift.userName}</span>
                                    <span className="text-[11px] text-slate-400">ID: {shift.userId}</span>
                                </div>
                            </td>
                            {showStore && (
                                <td className="py-4 px-4">
                                    <span className="text-[13px] text-slate-500">{shift.storeName}</span>
                                </td>
                            )}
                            <td className="py-4 px-4 text-right">
                                <span className="text-[13px] text-slate-600 tabular-nums">
                                    ${shift.openingCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <span className="text-[13px] text-slate-600 tabular-nums">
                                    ${shift.closingCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <span className={`text-[13px] font-bold tabular-nums ${shift.cashVariance > 0
                                    ? 'text-emerald-600'
                                    : shift.cashVariance < 0
                                        ? 'text-rose-600'
                                        : 'text-slate-400'
                                    }`}>
                                    {shift.cashVariance > 0 ? '+' : ''}
                                    ${shift.cashVariance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onEdit?.(shift)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                    title={canEdit ? 'Edit Shift' : 'View Details'}
                                >
                                    {canEdit ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
