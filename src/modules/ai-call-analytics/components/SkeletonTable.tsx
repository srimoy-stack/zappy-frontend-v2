'use client';

import React from 'react';

interface SkeletonTableProps {
    rows?: number;
    columns?: number;
}

/**
 * Skeleton placeholder for table rows while data is loading.
 * Renders animated shimmer rows matching the expected table layout.
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
    rows = 8,
    columns = 7,
}) => {
    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="py-4 px-4">
                                <div className="h-3.5 w-20 rounded bg-slate-100 animate-pulse" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-slate-50">
                            {Array.from({ length: columns }).map((_, colIdx) => (
                                <td key={colIdx} className="py-4 px-4">
                                    <div
                                        className="h-4 rounded bg-slate-100 animate-pulse"
                                        style={{
                                            width: `${55 + ((colIdx * 17 + rowIdx * 7) % 35)}%`,
                                            animationDelay: `${rowIdx * 50 + colIdx * 30}ms`,
                                        }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
