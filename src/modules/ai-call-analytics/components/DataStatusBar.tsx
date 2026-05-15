'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Database, Clock } from 'lucide-react';

interface DataStatusBarProps {
    lastUpdated: Date | null;
    isRefreshing: boolean;
    error: string | null;
    totalRecords: number;
    analyzedRecords?: number;
    analysisCoverage?: number;
    onRefresh: () => void;
}

/**
 * Data Status Bar — Shows API connectivity, last refresh time, and record count.
 * Core component of the Data Trust Layer. Always visible at top of every page.
 */
export const DataStatusBar: React.FC<DataStatusBarProps> = ({
    lastUpdated,
    isRefreshing,
    error,
    totalRecords,
    analyzedRecords,
    analysisCoverage,
    onRefresh,
}) => {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        if (!lastUpdated) return;
        const update = () => {
            const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
            if (seconds < 5) setTimeAgo('just now');
            else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
            else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    const isConnected = !error && lastUpdated !== null;

    return (
        <div
            id="data-status-bar"
            className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors ${
                error
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
        >
            {/* Left: Connection status */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    {isConnected ? (
                        <>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-emerald-700 font-semibold">Live</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-red-700 font-semibold">Disconnected</span>
                        </>
                    )}
                </div>

                {/* Records count */}
                <div className="flex items-center gap-1 text-slate-500">
                    <Database className="h-3 w-3" />
                    <span>{totalRecords.toLocaleString()} records</span>
                </div>

                {/* Analysis coverage */}
                {analyzedRecords !== undefined && analysisCoverage !== undefined && (
                    <div className="flex items-center gap-1 text-slate-500">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${analysisCoverage >= 80 ? 'bg-emerald-500' : analysisCoverage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span>{analysisCoverage}% analyzed ({analyzedRecords})</span>
                    </div>
                )}

                {/* Last updated */}
                {lastUpdated && (
                    <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>Updated {timeAgo}</span>
                    </div>
                )}
            </div>

            {/* Right: Refresh button + indicator */}
            <div className="flex items-center gap-2">
                {isRefreshing && (
                    <span className="text-blue-600 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Updating...
                    </span>
                )}
                <button
                    id="data-refresh-btn"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>
        </div>
    );
};
