'use client';

import React from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils';

// ─── Search Bar ──────────────────────────────────────────────

interface WizardSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const WizardSearch: React.FC<WizardSearchProps> = ({
    value, onChange, placeholder = 'Search...', className,
}) => (
    <div className={cn("relative flex-1", className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 transition-all"
        />
    </div>
);

// ─── Filter Chips ────────────────────────────────────────────

interface FilterOption {
    id: string;
    label: string;
}

interface WizardFilterChipsProps {
    options: FilterOption[];
    activeId: string;
    onChange: (id: string) => void;
    className?: string;
}

export const WizardFilterChips: React.FC<WizardFilterChipsProps> = ({
    options, activeId, onChange, className,
}) => (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
        {options.map(opt => (
            <button
                key={opt.id}
                onClick={() => onChange(opt.id)}
                className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    activeId === opt.id
                        ? "bg-slate-950 text-white border-slate-950"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800"
                )}
            >
                {opt.label}
            </button>
        ))}
    </div>
);

// ─── Pagination ──────────────────────────────────────────────

interface WizardPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export const WizardPagination: React.FC<WizardPaginationProps> = ({
    currentPage, totalPages, totalItems, pageSize, onPageChange, className,
}) => {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={cn("flex items-center justify-between pt-4 border-t border-slate-100", className)}>
            <span className="text-xs text-slate-500 font-semibold">
                Showing {startItem}–{endItem} of {totalItems}
            </span>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                            page === currentPage
                                ? "bg-slate-950 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

// ─── Helper: paginate an array ───────────────────────────────

export function paginateArray<T>(items: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
}
