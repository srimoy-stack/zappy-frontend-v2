'use client';

import React from 'react';
import { Plug, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/utils';
import type { StoreIntegration } from '@/shared/types/store';

interface StoreIntegrationsTabProps {
    integrations: StoreIntegration[];
    onRefresh?: (integrationId: string) => void;
}

const TYPE_COLORS: Record<StoreIntegration['type'], { bg: string; text: string; label: string }> = {
    aggregator: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Aggregator' },
    payment: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Payment' },
    loyalty: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Loyalty' },
    analytics: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Analytics' },
};

const STATUS_ICONS: Record<StoreIntegration['status'], { icon: any; color: string }> = {
    active: { icon: CheckCircle2, color: 'text-emerald-500' },
    inactive: { icon: XCircle, color: 'text-slate-400' },
    error: { icon: AlertTriangle, color: 'text-rose-500' },
};

export function StoreIntegrationsTab({ integrations, onRefresh }: StoreIntegrationsTabProps) {
    if (integrations.length === 0) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
                    <Plug className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 mb-2">No Integrations</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
                        This store has no third-party integrations configured yet. Integrations like payment gateways,
                        delivery aggregators, and loyalty programs can be set up from the platform level.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map(integration => {
                    const typeConfig = TYPE_COLORS[integration.type];
                    const statusConfig = STATUS_ICONS[integration.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                        <div key={integration.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all text-slate-400">
                                        <Plug size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">{integration.provider}</h4>
                                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider', typeConfig.bg, typeConfig.text)}>
                                            {typeConfig.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusIcon size={16} className={statusConfig.color} />
                                    <span className={cn('text-[10px] font-black uppercase tracking-wider', statusConfig.color)}>
                                        {integration.status}
                                    </span>
                                </div>
                            </div>

                            {integration.lastSyncAt && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mb-3">
                                    <Clock size={10} />
                                    Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                                </div>
                            )}

                            {integration.status === 'error' && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl mb-3">
                                    <p className="text-[11px] text-rose-600 font-bold">Connection error — check credentials or contact support</p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                {onRefresh && (
                                    <button onClick={() => onRefresh(integration.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all uppercase tracking-widest">
                                        <RefreshCw size={11} /> Refresh
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
