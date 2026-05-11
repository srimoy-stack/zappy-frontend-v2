'use client';

import React from 'react';

export default function PlatformLoading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-900">Z</span>
                </div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Hydrating</span>
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}
