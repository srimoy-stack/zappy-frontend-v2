'use client';

import React, { useState } from 'react';
import { ChevronDown, Store as StoreIcon } from 'lucide-react';
import { useTenantStore } from '@/app/providers/TenantStoreProvider';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { cn } from '@/utils';

/**
 * StoreSelector Component (Production Version)
 * Restricts switching based on user.storeIds and role.
 */
export const StoreSelector: React.FC = () => {
    const { tenant, store, allStores, setStore } = useTenantStore();
    const { canManageStores, getManagedStoreIds } = useRouteAccess();
    const [isOpen, setIsOpen] = useState(false);

    const managedStoreIds = getManagedStoreIds();
    const canSwitch = canManageStores();

    // Filter stores based on what the user is allowed to manage
    const allowedStores = managedStoreIds === 'all'
        ? allStores
        : allStores.filter(s => managedStoreIds.includes(s.id));

    // If only one store allowed, don't show selector as interactive
    if (allowedStores.length <= 1) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 min-w-[160px] border border-slate-100 rounded-full bg-slate-50 text-slate-500">
                <StoreIcon className="w-3.5 h-3.5 opacity-50" />
                <div className="flex flex-col items-start min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5">{tenant?.name}</span>
                    <span className="font-bold text-slate-700 truncate w-full text-xs">{store?.name}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => canSwitch && setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 min-w-[200px] border border-slate-300 rounded-full bg-white transition-all shadow-sm",
                    canSwitch ? "hover:bg-slate-50 hover:border-slate-400 cursor-pointer" : "cursor-default"
                )}
            >
                <StoreIcon className="w-3.5 h-3.5 text-emerald-600" />
                <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none mb-0.5">{tenant?.name}</span>
                    <span className="font-bold text-slate-900 truncate w-full text-left text-xs">{store?.name}</span>
                </div>
                {canSwitch && <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />}
            </button>

            {/* Dropdown (Restricted by Role) */}
            {isOpen && canSwitch && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                    <div className="p-1">
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">
                                Switch Location
                            </span>
                        </div>
                        {allowedStores.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setStore(s);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-lg group',
                                    s.id === store?.id
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )}
                            >
                                <div className="flex flex-col items-start flex-1">
                                    <span className="font-bold">{s.name}</span>
                                    <span className="text-[10px] opacity-60 font-medium group-hover:opacity-100">{s.code}</span>
                                </div>
                                {s.id === store?.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
