'use client';

import React from 'react';

/**
 * Skeleton placeholder for stat cards on the Dashboard page.
 * Renders an animated shimmer while data is loading.
 */
export const SkeletonCard: React.FC = () => {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
            {/* Icon placeholder */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
            </div>
            {/* Value placeholder */}
            <div className="h-8 w-20 rounded bg-slate-100 mb-2" />
            {/* Label placeholder */}
            <div className="h-4 w-28 rounded bg-slate-100" />
        </div>
    );
};
