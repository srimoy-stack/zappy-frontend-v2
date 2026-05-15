'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { PermissionCategory as CategoryType } from '../../types/users';

interface Props {
    category: CategoryType;
    actions: string[];
    selectedPermissions: string[];
    onToggle: (permission: string) => void;
    onToggleAll: (checked: boolean) => void;
}

export const PermissionCategory: React.FC<Props> = ({
    category,
    actions,
    selectedPermissions,
    onToggle,
    onToggleAll
}) => {
    const [expanded, setExpanded] = useState(false); // Collapsed by default per spec

    // Helpers
    const categorySelectedCount = actions.filter(a => selectedPermissions.includes(a)).length;
    const isAllSelected = categorySelectedCount === actions.length;
    const isIndeterminate = categorySelectedCount > 0 && !isAllSelected;

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-3">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}

                    <span className="font-bold text-slate-800 text-sm">{category}</span>

                    {categorySelectedCount > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {categorySelectedCount} / {actions.length}
                        </span>
                    )}
                </div>

                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-800">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={input => {
                                if (input) input.indeterminate = isIndeterminate;
                            }}
                            onChange={(e) => onToggleAll(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Select All
                    </label>
                </div>
            </div>

            {/* List */}
            {expanded && (
                <div className="p-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {actions.map(action => {
                        const isChecked = selectedPermissions.includes(action);
                        return (
                            <label
                                key={action}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                    ${isChecked ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50'}
                                `}
                            >
                                <div className={`
                                    w-5 h-5 rounded flex items-center justify-center border transition-all flex-shrink-0
                                    ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}
                                `}>
                                    {isChecked && <Check size={12} strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isChecked}
                                    onChange={() => onToggle(action)}
                                />
                                <span className={`text-xs font-bold leading-tight ${isChecked ? 'text-emerald-900' : 'text-slate-600'}`}>
                                    {action}
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
