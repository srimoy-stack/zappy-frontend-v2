'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    RotateCcw,
    Archive,
    Link,
    Search,
    Filter,
    Loader2,
    Eye,
    X,
    ChevronDown,
    ShieldAlert,
    RefreshCw,
    Inbox
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';
import { ExternalOrder, ExternalOrderStatus, ExternalOrderProvider } from '../../../types/external-orders';
import { externalOrdersService } from '../../../services/externalOrdersService';
import { cn } from '@/utils';

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

const STATUS_CONFIG: Record<ExternalOrderStatus, { label: string; icon: React.ReactNode; className: string }> = {
    RECEIVED: {
        label: 'Received',
        icon: <Clock size={11} />,
        className: 'bg-blue-50 text-blue-700 border border-blue-100'
    },
    NORMALIZED: {
        label: 'Normalized',
        icon: <CheckCircle2 size={11} />,
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    },
    REJECTED: {
        label: 'Rejected',
        icon: <XCircle size={11} />,
        className: 'bg-rose-50 text-rose-700 border border-rose-100'
    },
    CANCELLED: {
        label: 'Cancelled',
        icon: <ShieldAlert size={11} />,
        className: 'bg-slate-100 text-slate-500 border border-slate-200'
    }
};

const PROVIDER_CONFIG: Record<ExternalOrderProvider, { label: string; className: string }> = {
    UBER_EATS: { label: 'Uber Eats', className: 'bg-black text-white' },
    DOORDASH: { label: 'DoorDash', className: 'bg-red-600 text-white' }
};

function formatRelativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─────────────────────────────────────────────
//  Detail Modal
// ─────────────────────────────────────────────

interface DetailModalProps {
    order: ExternalOrder;
    onClose: () => void;
    onRetry: () => void;
    onArchive: () => void;
    isRetrying: boolean;
    canEdit: boolean;
}

const DetailModal: React.FC<DetailModalProps> = ({ order, onClose, onRetry, onArchive, isRetrying, canEdit }) => {
    const [activePanel, setActivePanel] = useState<'attempt' | 'payload'>('attempt');
    const status = STATUS_CONFIG[order.status];
    const provider = PROVIDER_CONFIG[order.provider];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-start justify-between p-8 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
                    <div className="flex items-start gap-4">
                        <div className={cn('px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest', provider.className)}>
                            {provider.label}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                                    #{order.externalOrderId}
                                </h2>
                                <span className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', status.className)}>
                                    {status.icon}
                                    {status.label}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-1">
                                {order.storeName} · {order.customerName || 'Unknown Customer'} · Received {formatRelativeTime(order.receivedAt)}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all flex-shrink-0 mt-1">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                {/* If REJECTED: reject reason banner */}
                {order.status === 'REJECTED' && order.rejectMessage && (
                    <div className="mx-8 mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 flex-shrink-0">
                        <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-0.5">
                                {order.rejectCode?.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-rose-700 font-medium leading-relaxed">{order.rejectMessage}</p>
                        </div>
                    </div>
                )}

                {/* Panel Switcher */}
                <div className="px-8 pt-6 flex-shrink-0">
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200">
                        {(['attempt', 'payload'] as const).map(panel => (
                            <button
                                key={panel}
                                onClick={() => setActivePanel(panel)}
                                className={cn(
                                    'px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all',
                                    activePanel === panel
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                )}
                            >
                                {panel === 'attempt' ? 'Normalization Attempt' : 'Raw Payload'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-5">
                    {activePanel === 'attempt' && (
                        <div className="space-y-4">
                            {order.normalizationAttempt ? (
                                <>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attempt Date</p>
                                            <p className="text-xs font-bold text-slate-700">
                                                {new Date(order.normalizationAttempt.attemptedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolved Items</p>
                                            <p className="text-2xl font-black text-slate-900">{order.normalizationAttempt.resolvedItems}</p>
                                        </div>
                                        <div className={cn('p-4 rounded-2xl border', order.normalizationAttempt.success ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100')}>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outcome</p>
                                            <p className={cn('text-xs font-black uppercase tracking-widest', order.normalizationAttempt.success ? 'text-emerald-700' : 'text-rose-700')}>
                                                {order.normalizationAttempt.success ? '✓ Success' : '✗ Failed'}
                                            </p>
                                        </div>
                                    </div>

                                    {order.normalizationAttempt.unresolvedItems.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unresolved Items</p>
                                            <div className="flex flex-wrap gap-2">
                                                {order.normalizationAttempt.unresolvedItems.map(name => (
                                                    <span key={name} className="px-3 py-1 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-[11px] font-bold">
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {order.normalizationAttempt.error && (
                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Engine Error</p>
                                            <p className="text-xs text-amber-800 font-medium font-mono">{order.normalizationAttempt.error}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                    <div className="p-4 bg-slate-100 rounded-2xl">
                                        <Inbox size={28} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">No normalization attempt yet</p>
                                    <p className="text-xs text-slate-400 font-medium">This order is still queued for processing.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activePanel === 'payload' && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                                <p className="text-[10px] font-bold text-amber-700">
                                    Raw payload is read-only. Direct edits are not permitted.
                                </p>
                            </div>
                            <pre className="bg-slate-950 text-emerald-400 rounded-2xl p-6 text-[11px] font-mono leading-relaxed overflow-auto max-h-80 border border-slate-800 select-none">
                                {JSON.stringify(order.rawPayload, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                {order.status === 'REJECTED' && canEdit && (
                    <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 flex-shrink-0">
                        <button
                            onClick={onArchive}
                            className="flex items-center gap-2 px-5 py-2.5 text-slate-500 border border-slate-200 bg-white text-[12px] font-black rounded-xl hover:border-slate-300 hover:text-slate-700 transition-all"
                        >
                            <Archive size={14} />
                            Archive
                        </button>
                        <div className="flex items-center gap-2">
                            <a
                                href="/backoffice/settings/integrations/catalog-mapping"
                                className="flex items-center gap-2 px-5 py-2.5 text-blue-600 border border-blue-100 bg-blue-50 text-[12px] font-black rounded-xl hover:bg-blue-100 transition-all"
                            >
                                <Link size={14} />
                                Map Missing Item
                            </a>
                            <button
                                onClick={onRetry}
                                disabled={isRetrying}
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-[12px] font-black rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-60"
                            >
                                {isRetrying ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                Retry Normalization
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────



export const ExternalOrdersAuditPage: React.FC = () => {
    const router = useRouter();
    const { userType, isSuperAdmin } = useRouteAccess();
    const canEdit = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN || userType === UserType.MANAGER;

    const [orders, setOrders] = useState<ExternalOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<ExternalOrder | null>(null);
    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [archivingId, setArchivingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ExternalOrderStatus | 'ALL'>('ALL');
    const [providerFilter, setProviderFilter] = useState<ExternalOrderProvider | 'ALL'>('ALL');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await externalOrdersService.getOrders();
            setOrders(data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = async (order: ExternalOrder) => {
        setRetryingId(order.id);
        try {
            const updated = await externalOrdersService.retryNormalization(order.id);
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            if (selectedOrder?.id === order.id) setSelectedOrder(updated);
        } finally {
            setRetryingId(null);
        }
    };

    const handleArchive = async (order: ExternalOrder) => {
        setArchivingId(order.id);
        try {
            await externalOrdersService.archiveOrder(order.id);
            setOrders(prev => prev.filter(o => o.id !== order.id));
            if (selectedOrder?.id === order.id) setSelectedOrder(null);
        } finally {
            setArchivingId(null);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const q = searchQuery.toLowerCase();
            const matchesQuery =
                order.externalOrderId.toLowerCase().includes(q) ||
                (order.customerName?.toLowerCase().includes(q) ?? false) ||
                order.storeName.toLowerCase().includes(q) ||
                (order.rejectCode?.toLowerCase().includes(q) ?? false);

            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
            const matchesProvider = providerFilter === 'ALL' || order.provider === providerFilter;

            return matchesQuery && matchesStatus && matchesProvider;
        });
    }, [orders, searchQuery, statusFilter, providerFilter]);

    const stats = useMemo(() => ({
        total: orders.length,
        normalized: orders.filter(o => o.status === 'NORMALIZED').length,
        rejected: orders.filter(o => o.status === 'REJECTED').length,
        received: orders.filter(o => o.status === 'RECEIVED').length,
    }), [orders]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Orders Audit Log...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto pb-24 space-y-8 animate-in fade-in duration-500 p-6">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200 -mx-6 px-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 hover:bg-white rounded-xl transition-all border border-slate-200 shadow-sm group">
                        <ArrowLeft size={18} className="text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">External Orders Audit</h1>
                            {stats.rejected > 0 && (
                                <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-100">
                                    <AlertTriangle size={11} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{stats.rejected} Rejected</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Monitor, debug, and replay inbound orders from Uber Eats & DoorDash.</p>
                    </div>
                </div>
                <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-2xl text-[12px] font-black hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Received', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
                    { label: 'Normalized', value: stats.normalized, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Rejected', value: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Pending', value: stats.received, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} className={cn('p-5 rounded-3xl border border-slate-200 shadow-sm', bg)}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                        <p className={cn('text-3xl font-black tracking-tight', color)}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search order ID, customer, store..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" />
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ExternalOrderStatus | 'ALL')}
                            className="appearance-none pl-3 pr-7 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 uppercase tracking-widest outline-none focus:border-emerald-500 transition-all cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="RECEIVED">Received</option>
                            <option value="NORMALIZED">Normalized</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={providerFilter}
                            onChange={(e) => setProviderFilter(e.target.value as ExternalOrderProvider | 'ALL')}
                            className="appearance-none pl-3 pr-7 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 uppercase tracking-widest outline-none focus:border-emerald-500 transition-all cursor-pointer"
                        >
                            <option value="ALL">All Providers</option>
                            <option value="UBER_EATS">Uber Eats</option>
                            <option value="DOORDASH">DoorDash</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">External Order ID</th>
                            <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</th>
                            <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reject Code</th>
                            <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[260px]">Reject Message</th>
                            <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Received At</th>
                            <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-7 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-5 bg-slate-50 rounded-2xl">
                                            <Inbox size={28} className="text-slate-300" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400">No orders match your filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredOrders.map(order => {
                            const status = STATUS_CONFIG[order.status];
                            const provider = PROVIDER_CONFIG[order.provider];
                            const isRejected = order.status === 'REJECTED';
                            const isRetrying = retryingId === order.id;
                            const isArchiving = archivingId === order.id;

                            return (
                                <tr
                                    key={order.id}
                                    className={cn(
                                        'transition-colors group',
                                        isRejected ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50/50'
                                    )}
                                >
                                    {/* Order ID */}
                                    <td className="px-7 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900 tracking-tight font-mono">
                                                {order.externalOrderId}
                                            </span>
                                            {order.customerName && (
                                                <span className="text-[10px] font-bold text-slate-400 mt-0.5">{order.customerName}</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Provider */}
                                    <td className="px-7 py-4">
                                        <span className={cn('px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', provider.className)}>
                                            {provider.label}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-7 py-4">
                                        <span className={cn('flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', status.className)}>
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </td>

                                    {/* Reject Code */}
                                    <td className="px-7 py-4">
                                        {order.rejectCode ? (
                                            <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-black font-mono uppercase tracking-wide">
                                                {order.rejectCode}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 text-xs font-bold">—</span>
                                        )}
                                    </td>

                                    {/* Reject Message */}
                                    <td className="px-7 py-4 max-w-[260px]">
                                        {order.rejectMessage ? (
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                                                {order.rejectMessage}
                                            </p>
                                        ) : (
                                            <span className="text-slate-300 text-xs font-bold">—</span>
                                        )}
                                    </td>

                                    {/* Received At */}
                                    <td className="px-7 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">
                                                {new Date(order.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400">{formatRelativeTime(order.receivedAt)}</span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-7 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* View Detail - always */}
                                            <button
                                                id={`view-order-${order.id}`}
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={15} />
                                            </button>

                                            {/* REJECTED actions */}
                                            {isRejected && canEdit && (
                                                <>
                                                    <button
                                                        id={`retry-order-${order.id}`}
                                                        onClick={() => handleRetry(order)}
                                                        disabled={isRetrying}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-60"
                                                        title="Retry Normalization"
                                                    >
                                                        {isRetrying ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                                                        Retry
                                                    </button>
                                                    <button
                                                        id={`archive-order-${order.id}`}
                                                        onClick={() => handleArchive(order)}
                                                        disabled={isArchiving}
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                        title="Archive"
                                                    >
                                                        {isArchiving ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <DetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onRetry={() => handleRetry(selectedOrder)}
                    onArchive={() => handleArchive(selectedOrder)}
                    isRetrying={retryingId === selectedOrder.id}
                    canEdit={canEdit}
                />
            )}
        </div>
    );
};
