'use client';

import React, { useState, useEffect } from 'react';
import {
    Save,
    AlertTriangle,
    CheckCircle2,
    Power,
    Clock,
    Store,
    Loader2,
    ShieldCheck,
    AlertCircle,
    LayoutGrid,
    ChevronRight
} from 'lucide-react';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import {
    StoreIntegration,
    PlacementRule,
    MenuPublishMode
} from '../../types/integrations';
import { cn } from '@/utils';

import { integrationsService } from '../../services/integrationsService';

/**
 * AggregatorIntegrationsPage
 * M9-T12: Configure Uber Eats / DoorDash integrations per store.
 */
export const AggregatorIntegrationsPage: React.FC = () => {
    const { role } = useRouteAccess();
    const [integrations, setIntegrations] = useState<StoreIntegration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Permissions: ADMIN/STORE_MANAGER can edit, others read-only
    const canEdit = role === 'ADMIN' || role === 'STORE_MANAGER' || role === 'BRAND_ADMIN' || role === 'PLATFORM_SUPER_ADMIN';
    const isReadOnly = role === 'EMPLOYEE';

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        setIsLoading(true);
        try {
            const data = await integrationsService.getIntegrations();
            setIntegrations(data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load integrations.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = (id: string) => {
        if (!canEdit || isReadOnly) return;

        setIntegrations(prev => prev.map(item => {
            if (item.id !== id) return item;

            // Validation: Cannot enable if provider_store_id missing
            if (item.status === 'DISABLED' && !item.providerStoreId) {
                setMessage({ type: 'error', text: 'Cannot enable integration: Missing Provider Store ID.' });
                setTimeout(() => setMessage(null), 3000);
                return item;
            }

            return {
                ...item,
                status: item.status === 'ENABLED' ? 'DISABLED' : 'ENABLED'
            };
        }));
    };

    const handleChange = (id: string, field: keyof StoreIntegration, value: any) => {
        if (!canEdit || isReadOnly) return;
        setIntegrations(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSave = async () => {
        if (!canEdit || isReadOnly) return;
        setIsSaving(true);
        setMessage(null);

        try {
            const updated = await integrationsService.saveIntegrations(integrations);
            setIntegrations(updated);
            setMessage({ type: 'success', text: 'Integration settings saved successfully.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Integrations...</p>
            </div>
        );
    }

    // Group integrations by store
    const stores = Array.from(new Set(integrations.map(i => i.storeId)));

    return (
        <div className="max-w-[1200px] mx-auto pb-24 space-y-8 animate-in fade-in duration-500 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 sticky top-4 z-30 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-slate-900 rounded-2xl shadow-lg">
                        <LayoutGrid className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight text-[24px]">Aggregator Integrations</h1>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                                <ShieldCheck className="w-3 h-3 text-slate-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    {isReadOnly ? 'Read Only' : 'Managed Access'}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">Manage Uber Eats and DoorDash connectivity per location.</p>
                    </div>
                </div>

                {canEdit && !isReadOnly && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[13px] font-black hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Configuration
                    </button>
                )}
            </div>

            {message && (
                <div className={cn(
                    "fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-8 duration-300",
                    message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
                )}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            {/* Content List */}
            <div className="space-y-10">
                {stores.map(storeId => {
                    const storeIntegrations = integrations.filter(i => i.storeId === storeId);
                    const storeName = storeIntegrations[0]?.storeName;

                    return (
                        <div key={storeId} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <Store className="w-4 h-4 text-slate-400" />
                                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{storeName}</h2>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {storeIntegrations.map(item => (
                                    <IntegrationCard
                                        key={item.id}
                                        item={item}
                                        canEdit={canEdit && !isReadOnly}
                                        onToggleStatus={() => handleToggleStatus(item.id)}
                                        onChange={(field, val) => handleChange(item.id, field, val)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Legend */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Connected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <span>Disabled</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-500">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Mapping Required</span>
                    </div>
                </div>
                <span>Zyappy Aggregator Engine v2.4</span>
            </div>
        </div>
    );
};

const IntegrationCard = ({
    item,
    canEdit,
    onToggleStatus,
    onChange
}: {
    item: StoreIntegration,
    canEdit: boolean,
    onToggleStatus: () => void,
    onChange: (field: keyof StoreIntegration, val: any) => void
}) => {
    const isEnabled = item.status === 'ENABLED';
    const isUber = item.provider === 'UBER_EATS';

    return (
        <div className={cn(
            "bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden flex flex-col",
            isEnabled ? "border-slate-200 shadow-lg" : "border-slate-100 opacity-80"
        )}>
            {/* Card Header */}
            <div className={cn(
                "px-6 py-4 flex items-center justify-between border-b border-slate-50",
                isEnabled ? "bg-slate-50/50" : "bg-slate-50/20"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-[10px]",
                        isUber ? "bg-black" : "bg-red-600"
                    )}>
                        {isUber ? 'UBER' : 'DOOR'}
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            {isUber ? 'Uber Eats' : 'DoorDash'}
                        </h3>
                        <div className="flex flex-col gap-1 mt-0.5">
                            {!item.isCatalogMappingComplete && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-tighter">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        Mapping Incomplete
                                    </div>
                                    <button
                                        onClick={() => window.location.href = '/backoffice/settings/integrations/catalog-mapping'}
                                        className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                    >
                                        Map Catalog <ChevronRight className="w-2 h-2" />
                                    </button>
                                </div>
                            )}
                            {(item.republishRequired || (item.lastPublishedAt && item.lastCatalogUpdateAt && new Date(item.lastPublishedAt) < new Date(item.lastCatalogUpdateAt))) && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-md w-fit">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Republish Required</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onToggleStatus}
                    disabled={!canEdit}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                        isEnabled
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-100"
                            : "bg-slate-200 text-slate-500"
                    )}
                >
                    <Power className="w-3 h-3 text-[10px]" />
                    {item.status}
                </button>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6 flex-1">
                {/* ID Section */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider Store ID</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={item.providerStoreId || ''}
                            onChange={(e) => onChange('providerStoreId', e.target.value)}
                            disabled={!canEdit || isEnabled}
                            placeholder="Enter external store id..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none transition-all disabled:opacity-60"
                        />
                        {isEnabled && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Locked
                            </div>
                        )}
                    </div>
                    {!item.providerStoreId && (
                        <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Required to enable integration
                        </p>
                    )}
                </div>

                {/* Toggles Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accept Orders</span>
                            <button
                                onClick={() => onChange('acceptOrders', !item.acceptOrders)}
                                disabled={!canEdit}
                                className={cn(
                                    "w-8 h-4 rounded-full relative transition-all",
                                    item.acceptOrders ? "bg-emerald-500" : "bg-slate-300"
                                )}
                            >
                                <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", item.acceptOrders ? "left-4.5 translate-x-1" : "left-0.5")} />
                            </button>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-tight">If off, store shows as 'Unavailable' on aggregator.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto Accept</span>
                            <button
                                onClick={() => onChange('autoAccept', !item.autoAccept)}
                                disabled={!canEdit}
                                className={cn(
                                    "w-8 h-4 rounded-full relative transition-all",
                                    item.autoAccept ? "bg-emerald-500" : "bg-slate-300"
                                )}
                            >
                                <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", item.autoAccept ? "left-4.5 translate-x-1" : "left-0.5")} />
                            </button>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-tight">Orders bypass KDS approval stage.</p>
                    </div>
                </div>

                {/* Selectors Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Placement Default</label>
                        <select
                            value={item.defaultPlacement}
                            onChange={(e) => onChange('defaultPlacement', e.target.value as PlacementRule)}
                            disabled={!canEdit}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:border-emerald-500"
                        >
                            <option value="FULL">FULL (Center)</option>
                            <option value="LEFT">LEFT (Half)</option>
                            <option value="RIGHT">RIGHT (Half)</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu Mode</label>
                        <select
                            value={item.menuPublishMode}
                            onChange={(e) => onChange('menuPublishMode', e.target.value as MenuPublishMode)}
                            disabled={!canEdit}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:border-emerald-500"
                        >
                            <option value="FULL">FULL SYNC</option>
                            <option value="PARTIAL">PARTIAL SYNC</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <Clock className="w-3 h-3" />
                    Last Sync: {new Date(item.lastUpdatedAt).toLocaleString()}
                </div>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                    View Logs
                </button>
            </div>
        </div>
    );
};
