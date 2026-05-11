'use client';

import React from 'react';

interface SkeletonChartProps {
    /** Height in pixels */
    height?: number;
    /** Title to show above the skeleton */
    title?: string;
}

/**
 * Skeleton placeholder for chart containers while data is loading.
 * Renders animated shimmer bars mimicking a chart layout.
 */
export const SkeletonChart: React.FC<SkeletonChartProps> = ({
    height = 250,
    title,
}) => {
    const barHeights = [60, 85, 45, 70, 90, 55, 75, 40, 65, 80, 50, 72];

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            {/* Title placeholder */}
            {title ? (
                <div className="text-sm font-semibold text-slate-300 mb-4">{title}</div>
            ) : (
                <div className="h-4 w-32 rounded bg-slate-100 animate-pulse mb-4" />
            )}

            {/* Chart area */}
            <div
                className="flex items-end gap-2 px-2"
                style={{ height: `${height}px` }}
            >
                {barHeights.map((h, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-t-md bg-slate-100 animate-pulse"
                        style={{
                            height: `${h}%`,
                            animationDelay: `${i * 80}ms`,
                            animationDuration: '1.5s',
                        }}
                    />
                ))}
            </div>

            {/* X-axis placeholder */}
            <div className="flex justify-between mt-3 px-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-2.5 w-8 rounded bg-slate-100 animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                    />
                ))}
            </div>
        </div>
    );
};
