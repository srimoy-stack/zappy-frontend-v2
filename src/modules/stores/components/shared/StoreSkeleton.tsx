'use client';

import React from 'react';

/**
 * Loading skeleton for the store detail page.
 * Mimics the layout of the actual content for smooth perceived performance.
 */
export function StoreSkeleton() {
    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-32 px-2 pt-2 animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-3 w-3 bg-slate-100 rounded" />
                <div className="h-3 w-12 bg-slate-200 rounded" />
                <div className="h-3 w-3 bg-slate-100 rounded" />
                <div className="h-3 w-24 bg-slate-200 rounded" />
            </div>

            {/* Header skeleton */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                    <div className="space-y-2">
                        <div className="h-7 w-48 bg-slate-200 rounded" />
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-16 bg-slate-100 rounded-full" />
                            <div className="h-4 w-24 bg-slate-100 rounded" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                    <div className="h-10 w-32 bg-slate-200 rounded-xl" />
                </div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex items-center gap-1 border-b border-slate-100 pb-1">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-10 w-24 bg-slate-100 rounded" />
                ))}
            </div>

            {/* Stats row skeleton */}
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
                ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-2 gap-6">
                <div className="h-64 bg-slate-50 rounded-3xl border border-slate-100" />
                <div className="h-64 bg-slate-50 rounded-3xl border border-slate-100" />
            </div>
        </div>
    );
}

/**
 * Inline loading skeleton for tab content switching.
 */
export function TabContentSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-slate-100 rounded" />
                        <div className="h-4 w-32 bg-slate-100 rounded" />
                    </div>
                    <div className="h-4 w-24 bg-slate-50 rounded" />
                </div>
            ))}
        </div>
    );
}
