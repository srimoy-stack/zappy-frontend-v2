'use client';

import React from 'react';
import {
    X, Store, Globe, ArrowRight, Play, Copy, Archive, Tag, DollarSign, Trash2, MoreVertical
} from 'lucide-react';
import { useBulkOperationsStore } from '../../state/bulkOperationsStore';
import { cn } from '@/utils';

export const BulkActionBar: React.FC = () => {
    const {
        selectedIds,
        clearSelection,
        openBulkAction
    } = useBulkOperationsStore();

    const count = selectedIds.size;
    if (count === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white rounded-2xl px-6 py-4 shadow-2xl border border-slate-800 flex items-center gap-6 z-[100] animate-in slide-in-from-bottom-5 duration-300">
            {/* Selected Count Indicator */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                    {count}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                    Selected Product{count > 1 ? 's' : ''}
                </span>
                <button
                    onClick={clearSelection}
                    className="p-1 hover:bg-slate-900 rounded transition-colors text-slate-400 hover:text-white"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Quick Bulk Operations Row */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-[50vw]">
                {/* Store Scope Assign */}
                <button
                    onClick={() => openBulkAction('ASSIGN_STORES')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border border-slate-800"
                >
                    <Store className="w-3 h-3 text-emerald-400" /> Assign Stores
                </button>

                {/* Channel Visibility Assign */}
                <button
                    onClick={() => openBulkAction('ASSIGN_CHANNELS')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border border-slate-800"
                >
                    <Globe className="w-3 h-3 text-indigo-400" /> Channels
                </button>

                {/* Publish Draft changes */}
                <button
                    onClick={() => openBulkAction('PUBLISH')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors"
                >
                    <Play className="w-3 h-3 fill-current" /> Publish
                </button>

                {/* Unpublish from channels */}
                <button
                    onClick={() => openBulkAction('UNPUBLISH')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border border-slate-800"
                >
                    <X className="w-3 h-3 text-slate-400" /> Unpublish
                </button>

                {/* Duplicate */}
                <button
                    onClick={() => openBulkAction('DUPLICATE')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border border-slate-800"
                >
                    <Copy className="w-3 h-3 text-amber-400" /> Duplicate
                </button>

                {/* Archive */}
                <button
                    onClick={() => openBulkAction('ARCHIVE')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border border-slate-800"
                >
                    <Archive className="w-3 h-3 text-yellow-400" /> Archive
                </button>

                {/* Bulk pricing adjustments */}
                <button
                    onClick={() => openBulkAction('PRICING')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border border-slate-800"
                >
                    <DollarSign className="w-3 h-3 text-emerald-400" /> Adjust Pricing
                </button>

                {/* Add labels / tagging */}
                <button
                    onClick={() => openBulkAction('ADD_TAGS')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border border-slate-800"
                >
                    <Tag className="w-3 h-3 text-blue-400" /> Add Tags
                </button>

                {/* Delete */}
                <button
                    onClick={() => openBulkAction('DELETE')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/80 hover:bg-rose-900/90 text-rose-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border border-rose-900/35"
                >
                    <Trash2 className="w-3 h-3" /> Delete
                </button>
            </div>
        </div>
    );
};
