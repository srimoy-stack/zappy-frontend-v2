'use client';

import React, { useState, useMemo } from 'react';
import {
    ShieldAlert,
    ShieldCheck,
    Search,
    X,
    AlertCircle,
    Filter,
    RotateCcw,
    Calendar,
    ChevronDown,
    Ban,
    UserCheck,
    UserX,
    MailWarning,
    ShieldOff,
    AlertTriangle,
    Mail,
    Clock,
    ThumbsDown,
} from 'lucide-react';
import { useSuppression } from '../hooks/useSuppression';
import { suppressionService } from '../services/suppressionService';
import {
    SuppressionReason,
    ComplianceConsentStatus,
    SuppressionEntry,
    ConsentEntry,
} from '../types/suppression.types';
import { ToastContainer, useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

// ============================================================================
// REASON BADGE CONFIG
// ============================================================================

const REASON_CONFIG: Record<
    SuppressionReason,
    { label: string; className: string; icon: React.ReactNode }
> = {
    unsubscribed: {
        label: 'Unsubscribed',
        className: 'bg-amber-50 text-amber-700 ring-amber-200/60',
        icon: <UserX className="w-3 h-3" />,
    },
    bounced: {
        label: 'Bounced',
        className: 'bg-rose-50 text-rose-700 ring-rose-200/60',
        icon: <Ban className="w-3 h-3" />,
    },
    complained: {
        label: 'Complained',
        className: 'bg-red-50 text-red-700 ring-red-200/60',
        icon: <ThumbsDown className="w-3 h-3" />,
    },
};

// ============================================================================
// CONSENT BADGE CONFIG
// ============================================================================

const CONSENT_CONFIG: Record<
    ComplianceConsentStatus,
    { label: string; className: string; icon: React.ReactNode }
> = {
    eligible: {
        label: 'Eligible',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
        icon: <UserCheck className="w-3 h-3" />,
    },
    unsubscribed: {
        label: 'Unsubscribed',
        className: 'bg-amber-50 text-amber-700 ring-amber-200/60',
        icon: <UserX className="w-3 h-3" />,
    },
    no_consent: {
        label: 'No Consent',
        className: 'bg-red-50 text-red-700 ring-red-200/60',
        icon: <MailWarning className="w-3 h-3" />,
    },
};

// ============================================================================
// TABLE COLUMNS
// ============================================================================

const SUPPRESSION_COLUMNS = [
    { key: 'email', label: 'Email', width: 'min-w-[240px]' },
    { key: 'reason', label: 'Reason', width: 'min-w-[140px]' },
    { key: 'source', label: 'Source', width: 'min-w-[220px]' },
    { key: 'date_added', label: 'Date Added', width: 'min-w-[150px]' },
    { key: 'actions', label: '', width: 'min-w-[100px]' },
] as const;

const CONSENT_COLUMNS = [
    { key: 'email', label: 'Email', width: 'min-w-[260px]' },
    { key: 'name', label: 'Name', width: 'min-w-[180px]' },
    { key: 'consent_status', label: 'Consent Status', width: 'min-w-[160px]' },
    { key: 'updated_at', label: 'Last Updated', width: 'min-w-[150px]' },
    { key: 'actions', label: '', width: 'min-w-[120px]' },
] as const;

// ============================================================================
// HELPER: Format date
// ============================================================================

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(dateStr));
    } catch {
        return '—';
    }
}

// ============================================================================
// TAB TYPE
// ============================================================================

type TabKey = 'suppression' | 'consent';

// ============================================================================
// UNSUBSCRIBE MODAL
// ============================================================================

interface UnsubscribeModalProps {
    open: boolean;
    loading: boolean;
    onConfirm: (email: string) => void;
    onClose: () => void;
}

const UnsubscribeModal: React.FC<UnsubscribeModalProps> = ({
    open,
    loading,
    onConfirm,
    onClose,
}) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) {
            setError('Email is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setError('Invalid email format');
            return;
        }
        setError('');
        onConfirm(trimmed);
    };

    const handleClose = () => {
        if (loading) return;
        setEmail('');
        setError('');
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={handleClose}
                style={{ animation: 'fadeIn 200ms ease-out' }}
            />
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 mx-4"
                style={{ animation: 'scaleIn 200ms ease-out' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-600 rounded-xl">
                            <UserX className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Manual Unsubscribe</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Compliance action
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            This will add the email to the suppression list and update consent status
                            to <strong>unsubscribed</strong>. This action is logged for compliance.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="input-unsub-email"
                            type="text"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="e.g. user@example.com"
                            className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
                                error
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                    : 'border-slate-200'
                            }`}
                        />
                        {error && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            id="btn-confirm-unsub"
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <UserX className="w-4 h-4" />
                            )}
                            Unsubscribe
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SuppressionPage (M9 – Marketing / Customer Engagement)
 *
 * Production-grade Suppression & Consent interface with:
 * - Tab-based navigation (Suppression / Consent)
 * - Filterable & searchable tables
 * - Manual unsubscribe action
 * - Skeleton loading, empty state, error + retry
 * - Dense, compliance-aware M9 table design
 */
export const SuppressionPage: React.FC = () => {
    const {
        // Suppression
        suppressions,
        suppressionLoading,
        suppressionError,
        suppressionFilters,
        suppressionStats,
        updateSuppressionFilter,
        resetSuppressionFilters,
        refetchSuppressions,
        // Consent
        consentList,
        consentLoading,
        consentError,
        consentFilters,
        consentStats,
        updateConsentFilter,
        resetConsentFilters,
        refetchConsent,
    } = useSuppression();
    const toast = useToast();

    // ── Active tab ─────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<TabKey>('suppression');

    // ── Unsubscribe modal ──────────────────────────────────────────────
    const [unsubModalOpen, setUnsubModalOpen] = useState(false);
    const [unsubLoading, setUnsubLoading] = useState(false);

    // ── Remove confirm ─────────────────────────────────────────────────
    const [removeConfirm, setRemoveConfirm] = useState<SuppressionEntry | null>(null);
    const [removeLoading, setRemoveLoading] = useState(false);

    // ── Inline unsubscribe confirm (from consent tab) ──────────────────
    const [inlineUnsubConfirm, setInlineUnsubConfirm] = useState<ConsentEntry | null>(null);
    const [inlineUnsubLoading, setInlineUnsubLoading] = useState(false);


    // ── Active filter checks ──────────────────────────────────────────
    const hasSuppressionFilters = useMemo(
        () =>
            suppressionFilters.reason !== 'all' ||
            suppressionFilters.date_from !== '' ||
            suppressionFilters.date_to !== '' ||
            suppressionFilters.search !== '',
        [suppressionFilters]
    );

    const hasConsentFilters = useMemo(
        () =>
            consentFilters.consent_status !== 'all' ||
            consentFilters.search !== '',
        [consentFilters]
    );

    // ── Manual unsubscribe handler ────────────────────────────────────
    const handleManualUnsubscribe = async (email: string) => {
        setUnsubLoading(true);
        try {
            await suppressionService.manualUnsubscribe({ email });
            setUnsubModalOpen(false);
            await Promise.all([refetchSuppressions(), refetchConsent()]);
            toast.success('Unsubscribed', `${email} has been added to the suppression list.`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to unsubscribe';
            toast.error('Unsubscribe failed', message);
        } finally {
            setUnsubLoading(false);
        }
    };

    // ── Remove from suppression handler ───────────────────────────────
    const handleRemove = async () => {
        if (!removeConfirm) return;
        setRemoveLoading(true);
        try {
            await suppressionService.removeFromSuppression(removeConfirm.id);
            setRemoveConfirm(null);
            await refetchSuppressions();
            toast.success('Removed', `${removeConfirm.email} removed from suppression list.`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to remove entry';
            toast.error('Remove failed', message);
        } finally {
            setRemoveLoading(false);
        }
    };

    // ── Inline unsubscribe from consent tab ───────────────────────────
    const handleInlineUnsub = async () => {
        if (!inlineUnsubConfirm) return;
        setInlineUnsubLoading(true);
        try {
            await suppressionService.manualUnsubscribe({ email: inlineUnsubConfirm.email });
            setInlineUnsubConfirm(null);
            await Promise.all([refetchConsent(), refetchSuppressions()]);
            toast.success(
                'Unsubscribed',
                `${inlineUnsubConfirm.email} has been unsubscribed.`
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to unsubscribe';
            toast.error('Action failed', message);
        } finally {
            setInlineUnsubLoading(false);
        }
    };

    // ── Derived for current tab ───────────────────────────────────────
    const isSuppressionTab = activeTab === 'suppression';

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div className="max-w-[1600px] mx-auto space-y-4 pb-10 px-2 lg:px-4">
            {/* ── Toast Notifications ─────────────────────────────────── */}
            <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

            {/* ── Unsubscribe Modal ───────────────────────────────────── */}
            <UnsubscribeModal
                open={unsubModalOpen}
                loading={unsubLoading}
                onConfirm={handleManualUnsubscribe}
                onClose={() => setUnsubModalOpen(false)}
            />

            {/* ── Remove Confirm Modal ─────────────────────────────────── */}
            <ConfirmModal
                open={!!removeConfirm}
                title="Remove from Suppression"
                description={`Are you sure you want to remove ${removeConfirm?.email} from the suppression list? This email will become eligible to receive emails again.`}
                confirmLabel="Remove"
                variant="danger"
                loading={removeLoading}
                onConfirm={handleRemove}
                onCancel={() => setRemoveConfirm(null)}
            />

            {/* ── Inline Unsub Confirm Modal ────────────────────────────── */}
            <ConfirmModal
                open={!!inlineUnsubConfirm}
                title="Unsubscribe Contact"
                description={`Are you sure you want to unsubscribe ${inlineUnsubConfirm?.email}? This will mark them as unsubscribed and add them to the suppression list.`}
                confirmLabel="Unsubscribe"
                variant="danger"
                loading={inlineUnsubLoading}
                onConfirm={handleInlineUnsub}
                onCancel={() => setInlineUnsubConfirm(null)}
            />

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 pt-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl shadow-lg shadow-rose-100">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Suppression & Consent
                        </h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                            Compliance-aware contact management
                        </p>
                    </div>
                </div>

                <button
                    id="btn-manual-unsubscribe"
                    onClick={() => setUnsubModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-rose-700 active:scale-95 transition-all"
                >
                    <UserX className="w-4 h-4" />
                    Manual Unsubscribe
                </button>
            </div>

            {/* ── Module Tabs ──────────────────────────────────────────── */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl w-fit">
                {([
                    {
                        key: 'suppression' as TabKey,
                        label: 'Suppression List',
                        icon: ShieldOff,
                        count: suppressionStats.total,
                    },
                    {
                        key: 'consent' as TabKey,
                        label: 'Consent View',
                        icon: ShieldCheck,
                        count: consentStats.total,
                    },
                ] as const).map((tab) => {
                    const isActive = activeTab === tab.key;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            id={`tab-${tab.key}`}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                                ${
                                    isActive
                                        ? 'bg-white text-slate-800 shadow-sm shadow-slate-200/50 ring-1 ring-slate-200/60'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                }
                            `}
                        >
                            <Icon
                                size={16}
                                className={isActive ? 'text-rose-600' : 'text-slate-400'}
                            />
                            {tab.label}
                            <span
                                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                                    isActive
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-slate-200/60 text-slate-500'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Stats Tiles ──────────────────────────────────────────── */}
            {isSuppressionTab ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        {
                            label: 'Total Suppressed',
                            value: suppressionStats.total,
                            icon: ShieldAlert,
                            color: 'bg-slate-50 text-slate-700 ring-slate-200',
                            iconBg: 'bg-slate-200 text-slate-600',
                        },
                        {
                            label: 'Unsubscribed',
                            value: suppressionStats.unsubscribed,
                            icon: UserX,
                            color: 'bg-amber-50 text-amber-700 ring-amber-200',
                            iconBg: 'bg-amber-200 text-amber-700',
                        },
                        {
                            label: 'Bounced',
                            value: suppressionStats.bounced,
                            icon: Ban,
                            color: 'bg-rose-50 text-rose-700 ring-rose-200',
                            iconBg: 'bg-rose-200 text-rose-700',
                        },
                        {
                            label: 'Complained',
                            value: suppressionStats.complained,
                            icon: ThumbsDown,
                            color: 'bg-red-50 text-red-700 ring-red-200',
                            iconBg: 'bg-red-200 text-red-700',
                        },
                    ].map((tile) => {
                        const Icon = tile.icon;
                        return (
                            <div
                                key={tile.label}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl ring-1 ${tile.color}`}
                            >
                                <div className={`p-2 rounded-lg ${tile.iconBg}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                        {tile.label}
                                    </p>
                                    <p className="text-lg font-black tabular-nums">
                                        {suppressionLoading ? '…' : tile.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        {
                            label: 'Total Contacts',
                            value: consentStats.total,
                            icon: Mail,
                            color: 'bg-slate-50 text-slate-700 ring-slate-200',
                            iconBg: 'bg-slate-200 text-slate-600',
                        },
                        {
                            label: 'Eligible',
                            value: consentStats.eligible,
                            icon: UserCheck,
                            color: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                            iconBg: 'bg-emerald-200 text-emerald-700',
                        },
                        {
                            label: 'Unsubscribed',
                            value: consentStats.unsubscribed,
                            icon: UserX,
                            color: 'bg-amber-50 text-amber-700 ring-amber-200',
                            iconBg: 'bg-amber-200 text-amber-700',
                        },
                        {
                            label: 'No Consent',
                            value: consentStats.noConsent,
                            icon: MailWarning,
                            color: 'bg-red-50 text-red-700 ring-red-200',
                            iconBg: 'bg-red-200 text-red-700',
                        },
                    ].map((tile) => {
                        const Icon = tile.icon;
                        return (
                            <div
                                key={tile.label}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl ring-1 ${tile.color}`}
                            >
                                <div className={`p-2 rounded-lg ${tile.iconBg}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                        {tile.label}
                                    </p>
                                    <p className="text-lg font-black tabular-nums">
                                        {consentLoading ? '…' : tile.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Error State ──────────────────────────────────────────── */}
            {isSuppressionTab && suppressionError && (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">
                            Failed to load suppression list
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">{suppressionError}</p>
                    </div>
                    <button
                        onClick={refetchSuppressions}
                        className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}
            {!isSuppressionTab && consentError && (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">
                            Failed to load consent data
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">{consentError}</p>
                    </div>
                    <button
                        onClick={refetchConsent}
                        className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Table Card ───────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* ── Filters Bar ────────────────────────────────────────── */}
                {isSuppressionTab ? (
                    <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
                        {/* Filter icon */}
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Filter className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                Filters
                            </span>
                        </div>

                        {/* Reason dropdown */}
                        <div className="relative">
                            <select
                                id="filter-reason"
                                value={suppressionFilters.reason || 'all'}
                                onChange={(e) =>
                                    updateSuppressionFilter(
                                        'reason',
                                        e.target.value as SuppressionReason | 'all'
                                    )
                                }
                                className="appearance-none px-3 py-1.5 pr-8 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all min-w-[160px]"
                            >
                                <option value="all">All Reasons</option>
                                <option value="unsubscribed">Unsubscribed</option>
                                <option value="bounced">Bounced</option>
                                <option value="complained">Complained</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Date from */}
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <input
                                id="filter-sup-date-from"
                                type="date"
                                value={suppressionFilters.date_from ?? ''}
                                onChange={(e) =>
                                    updateSuppressionFilter('date_from', e.target.value)
                                }
                                className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                            />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">to</span>
                        <div className="flex items-center gap-1.5">
                            <input
                                id="filter-sup-date-to"
                                type="date"
                                value={suppressionFilters.date_to ?? ''}
                                onChange={(e) =>
                                    updateSuppressionFilter('date_to', e.target.value)
                                }
                                className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                            />
                        </div>

                        {/* Search */}
                        <div className="relative ml-auto">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                id="search-suppression"
                                type="text"
                                placeholder="Search email or source…"
                                value={suppressionFilters.search ?? ''}
                                onChange={(e) => updateSuppressionFilter('search', e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all min-w-[220px]"
                            />
                        </div>

                        {/* Reset */}
                        {hasSuppressionFilters && (
                            <button
                                onClick={resetSuppressionFilters}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors uppercase tracking-wider"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
                        {/* Filter icon */}
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Filter className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                Filters
                            </span>
                        </div>

                        {/* Consent status dropdown */}
                        <div className="relative">
                            <select
                                id="filter-consent-status"
                                value={consentFilters.consent_status || 'all'}
                                onChange={(e) =>
                                    updateConsentFilter(
                                        'consent_status',
                                        e.target.value as ComplianceConsentStatus | 'all'
                                    )
                                }
                                className="appearance-none px-3 py-1.5 pr-8 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all min-w-[180px]"
                            >
                                <option value="all">All Consent Statuses</option>
                                <option value="eligible">Eligible</option>
                                <option value="unsubscribed">Unsubscribed</option>
                                <option value="no_consent">No Consent</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Search */}
                        <div className="relative ml-auto">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                id="search-consent"
                                type="text"
                                placeholder="Search email or name…"
                                value={consentFilters.search ?? ''}
                                onChange={(e) => updateConsentFilter('search', e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all min-w-[220px]"
                            />
                        </div>

                        {/* Reset */}
                        {hasConsentFilters && (
                            <button
                                onClick={resetConsentFilters}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors uppercase tracking-wider"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset
                            </button>
                        )}
                    </div>
                )}

                {/* ── Summary Bar ───────────────────────────────────────── */}
                <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Showing:{' '}
                        <span className="text-slate-900">
                            {isSuppressionTab
                                ? suppressionLoading
                                    ? '…'
                                    : suppressions.length
                                : consentLoading
                                ? '…'
                                : consentList.length}
                        </span>{' '}
                        {isSuppressionTab ? 'entries' : 'contacts'}
                    </span>
                    {isSuppressionTab &&
                        (suppressionFilters.date_from || suppressionFilters.date_to) && (
                            <span className="text-[10px] font-bold text-slate-400">
                                {suppressionFilters.date_from || '—'} →{' '}
                                {suppressionFilters.date_to || '—'}
                            </span>
                        )}
                </div>

                {/* ── SUPPRESSION TAB CONTENT ───────────────────────────── */}
                {isSuppressionTab && (
                    <>
                        {/* Loading skeleton */}
                        {suppressionLoading && (
                            <div>
                                <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-100">
                                    {SUPPRESSION_COLUMNS.map((col) => (
                                        <div
                                            key={col.key}
                                            className="h-3 bg-slate-200 rounded-full w-3/4 animate-pulse"
                                        />
                                    ))}
                                </div>
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-slate-50"
                                    >
                                        <div className="h-3.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
                                        <div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse" />
                                        <div className="h-3.5 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                                        <div className="h-3.5 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                                        <div className="h-7 bg-slate-100 rounded-full w-16 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!suppressionLoading && !suppressionError && suppressions.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 px-6">
                                <div className="p-5 bg-rose-50 rounded-2xl mb-5">
                                    <ShieldOff className="w-10 h-10 text-rose-400" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    No suppressed contacts
                                </h2>
                                <p className="text-sm text-slate-400 mt-1.5 max-w-sm text-center">
                                    {hasSuppressionFilters
                                        ? 'No entries match your current filters. Try broadening the search or adjusting the date range.'
                                        : 'When contacts unsubscribe, bounce, or complain, they\'ll appear here.'}
                                </p>
                                {hasSuppressionFilters && (
                                    <button
                                        onClick={resetSuppressionFilters}
                                        className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Table */}
                        {!suppressionLoading && suppressions.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            {SUPPRESSION_COLUMNS.map((col) => (
                                                <th
                                                    key={col.key}
                                                    className={`px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ${col.width}`}
                                                >
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {suppressions.map((entry) => {
                                            const reasonCfg =
                                                REASON_CONFIG[entry.reason] ??
                                                REASON_CONFIG.unsubscribed;

                                            return (
                                                <tr
                                                    key={entry.id}
                                                    className="group hover:bg-slate-50/70 transition-colors duration-150"
                                                >
                                                    {/* Email */}
                                                    <td className="px-4 py-2.5">
                                                        <span className="text-sm font-semibold text-slate-900 font-mono group-hover:text-indigo-700 transition-colors">
                                                            {entry.email}
                                                        </span>
                                                    </td>

                                                    {/* Reason */}
                                                    <td className="px-4 py-2.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${reasonCfg.className}`}
                                                        >
                                                            {reasonCfg.icon}
                                                            {reasonCfg.label}
                                                        </span>
                                                    </td>

                                                    {/* Source */}
                                                    <td className="px-4 py-2.5">
                                                        <span className="text-xs text-slate-600 font-medium">
                                                            {entry.source}
                                                        </span>
                                                    </td>

                                                    {/* Date Added */}
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3 text-slate-400" />
                                                            <span className="text-xs text-slate-600 tabular-nums">
                                                                {formatDate(entry.date_added)}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-2.5">
                                                        <button
                                                            onClick={() =>
                                                                setRemoveConfirm(entry)
                                                            }
                                                            className="px-2.5 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ── CONSENT TAB CONTENT ───────────────────────────────── */}
                {!isSuppressionTab && (
                    <>
                        {/* Loading skeleton */}
                        {consentLoading && (
                            <div>
                                <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-100">
                                    {CONSENT_COLUMNS.map((col) => (
                                        <div
                                            key={col.key}
                                            className="h-3 bg-slate-200 rounded-full w-3/4 animate-pulse"
                                        />
                                    ))}
                                </div>
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-slate-50"
                                    >
                                        <div className="h-3.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
                                        <div className="h-3.5 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                                        <div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse" />
                                        <div className="h-3.5 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                                        <div className="h-7 bg-slate-100 rounded-full w-20 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!consentLoading && !consentError && consentList.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 px-6">
                                <div className="p-5 bg-emerald-50 rounded-2xl mb-5">
                                    <ShieldCheck className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    No consent records found
                                </h2>
                                <p className="text-sm text-slate-400 mt-1.5 max-w-sm text-center">
                                    {hasConsentFilters
                                        ? 'No contacts match your current filters. Try adjusting the consent status or search term.'
                                        : 'Consent records will appear here once contacts are added with explicit consent status.'}
                                </p>
                                {hasConsentFilters && (
                                    <button
                                        onClick={resetConsentFilters}
                                        className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Table */}
                        {!consentLoading && consentList.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            {CONSENT_COLUMNS.map((col) => (
                                                <th
                                                    key={col.key}
                                                    className={`px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ${col.width}`}
                                                >
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {consentList.map((entry) => {
                                            const consentCfg =
                                                CONSENT_CONFIG[entry.consent_status] ??
                                                CONSENT_CONFIG.no_consent;

                                            return (
                                                <tr
                                                    key={entry.id}
                                                    className="group hover:bg-slate-50/70 transition-colors duration-150"
                                                >
                                                    {/* Email */}
                                                    <td className="px-4 py-2.5">
                                                        <span className="text-sm font-semibold text-slate-900 font-mono group-hover:text-indigo-700 transition-colors">
                                                            {entry.email}
                                                        </span>
                                                    </td>

                                                    {/* Name */}
                                                    <td className="px-4 py-2.5">
                                                        <span className="text-sm text-slate-700 font-medium">
                                                            {entry.name}
                                                        </span>
                                                    </td>

                                                    {/* Consent Status */}
                                                    <td className="px-4 py-2.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${consentCfg.className}`}
                                                        >
                                                            {consentCfg.icon}
                                                            {consentCfg.label}
                                                        </span>
                                                    </td>

                                                    {/* Last Updated */}
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3 text-slate-400" />
                                                            <span className="text-xs text-slate-600 tabular-nums">
                                                                {formatDate(entry.updated_at)}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-2.5">
                                                        {entry.consent_status === 'eligible' && (
                                                            <button
                                                                onClick={() =>
                                                                    setInlineUnsubConfirm(entry)
                                                                }
                                                                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 hover:border-amber-200 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <UserX className="w-3 h-3" />
                                                                Unsubscribe
                                                            </button>
                                                        )}
                                                        {entry.consent_status ===
                                                            'unsubscribed' && (
                                                            <span className="text-[10px] font-bold text-slate-400 px-2">
                                                                Opted out
                                                            </span>
                                                        )}
                                                        {entry.consent_status ===
                                                            'no_consent' && (
                                                            <span className="text-[10px] font-bold text-slate-400 px-2">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ── Compliance Notice ─────────────────────────────────────── */}
            <div className="flex items-start gap-3 px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-bold text-slate-700">Compliance Notice</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        All suppression and consent statuses are explicitly tracked and never assumed.
                        Changes to suppression status are logged for GDPR/CAN-SPAM compliance.
                        Suppressed contacts will not receive marketing emails regardless of campaign targeting.
                    </p>
                </div>
            </div>

            {/* ── Animation Keyframes ───────────────────────────────────── */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(16px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(16px); }
                }
                @keyframes shrinkWidth {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `,
                }}
            />
        </div>
    );
};

export default SuppressionPage;
