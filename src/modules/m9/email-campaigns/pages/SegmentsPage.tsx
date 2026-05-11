'use client';

import React, { useState, useCallback } from 'react';
import {
    Users,
    Plus,
    Pencil,
    Copy,
    Trash2,
    AlertCircle,
    CheckCircle2,
    MinusCircle,
    MoreHorizontal,
    ToggleLeft,
    ToggleRight,
    ShieldAlert,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSegments } from '../hooks/useSegments';
import { useSegmentPermissions } from '../hooks/useSegmentPermissions';
import { segmentService } from '../services/segmentService';
import { SegmentStatus } from '../types/campaign.types';
import { ConfirmModal } from '../components/ConfirmModal';
import { ToastContainer, useToast } from '../components/Toast';
import { Tooltip } from '../components/Tooltip';

// ============================================================================
// STATUS BADGE CONFIG
// ============================================================================

const STATUS_CONFIG: Record<SegmentStatus, { label: string; className: string; icon: React.ReactNode }> = {
    active: {
        label: 'Active',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    inactive: {
        label: 'Inactive',
        className: 'bg-slate-100 text-slate-600 ring-slate-200',
        icon: <MinusCircle className="w-3 h-3" />,
    },
};

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
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(dateStr));
    } catch {
        return '—';
    }
}

// ============================================================================
// HELPER: Format estimated count
// ============================================================================

function formatCount(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(count % 1_000 === 0 ? 0 : 1)}K`;
    return count.toLocaleString();
}

// ============================================================================
// TABLE HEADER COLUMNS
// ============================================================================

const COLUMNS = [
    { key: 'name', label: 'Segment Name', width: 'min-w-[240px]' },
    { key: 'estimated_count', label: 'Estimated Count', width: 'min-w-[150px]' },
    { key: 'status', label: 'Status', width: 'min-w-[160px]' },
    { key: 'updated_at', label: 'Last Updated', width: 'min-w-[170px]' },
    { key: 'actions', label: 'Actions', width: 'min-w-[140px]' },
] as const;

// ============================================================================
// ROW ACTION TYPES
// ============================================================================

type RowAction = 'duplicate' | 'delete' | 'status';

interface RowLoadingState {
    segmentId: string;
    action: RowAction;
}

// ============================================================================
// DELETE MODAL STATE
// ============================================================================

interface DeleteModalState {
    open: boolean;
    segmentId: string | null;
    segmentName: string;
}

const INITIAL_DELETE_MODAL: DeleteModalState = {
    open: false,
    segmentId: null,
    segmentName: '',
};

// ============================================================================
// INLINE ERROR STATE
// ============================================================================

interface InlineError {
    segmentId: string;
    message: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SegmentsPage Component (M9 – Marketing / Customer Engagement)
 *
 * Production-grade segments list page.
 * - Strict PRD data model (rules_json, estimated_count, status, created_at)
 * - No mock/static data — all data from useSegments API hook
 * - RBAC-gated actions (edit, duplicate, toggle, delete)
 * - Custom confirmation modal for deletes
 * - Inline toast notifications for feedback
 * - Per-row loading states & disabled buttons during actions
 * - Tooltips on all action icons
 * - API-driven: always refreshes from API after mutations
 */
export const SegmentsPage: React.FC = () => {
    const router = useRouter();
    const { data: segments, loading, error, refetch } = useSegments();
    const permissions = useSegmentPermissions();
    const toast = useToast();

    // ── Per-row loading state (supports independent row actions) ────────
    const [rowLoading, setRowLoading] = useState<RowLoadingState | null>(null);

    // ── Delete confirmation modal ──────────────────────────────────────
    const [deleteModal, setDeleteModal] = useState<DeleteModalState>(INITIAL_DELETE_MODAL);
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    // ── Per-row inline errors ──────────────────────────────────────────
    const [inlineErrors, setInlineErrors] = useState<InlineError[]>([]);

    const clearInlineError = useCallback((segmentId: string) => {
        setInlineErrors((prev) => prev.filter((e) => e.segmentId !== segmentId));
    }, []);

    const setInlineError = useCallback((segmentId: string, message: string) => {
        setInlineErrors((prev) => {
            const filtered = prev.filter((e) => e.segmentId !== segmentId);
            return [...filtered, { segmentId, message }];
        });
    }, []);

    // ── Helpers ────────────────────────────────────────────────────────
    const isAnyBusy = rowLoading !== null || deleteInProgress;

    // ── Action: Navigate to Create ─────────────────────────────────────
    const handleCreateSegment = () => {
        router.push('/backoffice/email-campaigns/segments/create');
    };

    // ── Action: Navigate to Edit ───────────────────────────────────────
    const handleEdit = (id: string) => {
        if (!permissions.canEdit) return;
        router.push(`/backoffice/email-campaigns/segments/${id}/edit`);
    };

    // ── Action: Duplicate ──────────────────────────────────────────────
    const handleDuplicate = async (id: string, originalName: string) => {
        if (!permissions.canDuplicate) return;
        if (isAnyBusy) return;

        clearInlineError(id);
        setRowLoading({ segmentId: id, action: 'duplicate' });

        try {
            const copyName = `${originalName} (Copy)`;
            await segmentService.duplicateSegment(id, copyName);
            await refetch(); // Always refresh from API after mutation
            toast.success('Segment duplicated', `"${copyName}" created successfully.`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to duplicate segment';
            setInlineError(id, message);
            toast.error('Duplicate failed', message);
        } finally {
            setRowLoading(null);
        }
    };

    // ── Action: Toggle Status ──────────────────────────────────────────
    const handleToggleStatus = async (id: string, currentStatus: SegmentStatus) => {
        if (!permissions.canToggleStatus) return;
        if (isAnyBusy) return;

        const newStatus: SegmentStatus = currentStatus === 'active' ? 'inactive' : 'active';

        clearInlineError(id);
        setRowLoading({ segmentId: id, action: 'status' });

        try {
            await segmentService.updateSegmentStatus(id, newStatus);
            await refetch(); // Always refresh from API after mutation
            toast.success(
                'Status updated',
                `Segment is now ${newStatus}.`,
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Status update failed';
            setInlineError(id, message);
            toast.error('Status update failed', message);
        } finally {
            setRowLoading(null);
        }
    };

    // ── Action: Delete (open modal) ────────────────────────────────────
    const handleDeleteRequest = (id: string, name: string) => {
        if (!permissions.canDelete) return;
        if (isAnyBusy) return;
        setDeleteModal({ open: true, segmentId: id, segmentName: name });
    };

    // ── Action: Delete (confirm) ───────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteModal.segmentId) return;

        const { segmentId, segmentName } = deleteModal;
        clearInlineError(segmentId);
        setDeleteInProgress(true);

        try {
            await segmentService.deleteSegment(segmentId);
            setDeleteModal(INITIAL_DELETE_MODAL);
            await refetch(); // Always refresh from API after mutation
            toast.success('Segment deleted', `"${segmentName}" has been permanently removed.`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete segment';
            setDeleteModal(INITIAL_DELETE_MODAL);
            setInlineError(segmentId, message);
            toast.error('Delete failed', message);
        } finally {
            setDeleteInProgress(false);
        }
    };

    const handleDeleteCancel = () => {
        if (deleteInProgress) return;
        setDeleteModal(INITIAL_DELETE_MODAL);
    };

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div className="max-w-[1600px] mx-auto space-y-4 pb-10 px-2 lg:px-4">
            {/* ── Toast Notifications ─────────────────────────────────── */}
            <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

            {/* ── Delete Confirmation Modal ───────────────────────────── */}
            <ConfirmModal
                open={deleteModal.open}
                title="Delete Segment"
                description={`Are you sure you want to delete "${deleteModal.segmentName}"? This will permanently remove the audience definition and cannot be undone.`}
                confirmLabel="Delete Segment"
                cancelLabel="Keep Segment"
                variant="danger"
                loading={deleteInProgress}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 pt-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Segments</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                            Manage audience segments
                        </p>
                    </div>
                </div>

                {permissions.canCreate ? (
                    <button
                        id="btn-create-segment"
                        onClick={handleCreateSegment}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        Create Segment
                    </button>
                ) : (
                    <Tooltip label="You don't have permission to create segments">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed">
                            <ShieldAlert className="w-4 h-4" />
                            Create Segment
                        </div>
                    </Tooltip>
                )}
            </div>

            {/* ── Error State ─────────────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">Failed to load segments</p>
                        <p className="text-xs text-red-600 mt-0.5">{error}</p>
                    </div>
                    <button
                        onClick={refetch}
                        className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Main Content Card ───────────────────────────────────── */}
            <section className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                {/* Summary bar */}
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Total Segments:{' '}
                        <span className="text-slate-900">{loading ? '...' : segments.length}</span>
                    </span>
                </div>

                {/* ── Loading State (Skeleton Rows) ───────────────────── */}
                {loading && (
                    <div>
                        {/* Skeleton table header */}
                        <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-100">
                            {COLUMNS.map((col) => (
                                <div key={col.key} className="h-3 bg-slate-200 rounded-full w-3/4 animate-pulse" />
                            ))}
                        </div>
                        {/* Skeleton rows */}
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-5 gap-4 px-4 py-2.5 border-b border-slate-50"
                            >
                                <div className="space-y-1.5">
                                    <div className="h-3.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
                                    <div className="h-2.5 bg-slate-50 rounded-full w-3/5 animate-pulse" />
                                </div>
                                <div className="h-3.5 bg-slate-100 rounded-full w-16 animate-pulse" />
                                <div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
                                <div className="flex gap-2">
                                    <div className="h-7 w-7 bg-slate-100 rounded-lg animate-pulse" />
                                    <div className="h-7 w-7 bg-slate-100 rounded-lg animate-pulse" />
                                    <div className="h-7 w-7 bg-slate-100 rounded-lg animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────────────── */}
                {!loading && !error && segments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 px-6">
                        <div className="p-5 bg-indigo-50 rounded-2xl mb-5">
                            <Users className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">No segments created yet</h2>
                        <p className="text-sm text-slate-400 mt-1.5 max-w-sm text-center">
                            Create your first audience segment to target specific customer groups in your campaigns.
                        </p>
                        {permissions.canCreate && (
                            <button
                                onClick={handleCreateSegment}
                                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                            >
                                <Plus className="w-4 h-4" strokeWidth={3} />
                                Create Segment
                            </button>
                        )}
                    </div>
                )}

                {/* ── Table ────────────────────────────────────────────── */}
                {!loading && segments.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {COLUMNS.map((col) => (
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
                                {segments.map((segment) => {
                                    const statusCfg = STATUS_CONFIG[segment.status] ?? STATUS_CONFIG.inactive;
                                    const isDuplicating = rowLoading?.segmentId === segment.id && rowLoading?.action === 'duplicate';
                                    const isDeleting = deleteInProgress && deleteModal.segmentId === segment.id;
                                    const isUpdatingStatus = rowLoading?.segmentId === segment.id && rowLoading?.action === 'status';
                                    const isDisabled = isAnyBusy;
                                    const hasRules = !!segment.rules_json?.rules?.length;
                                    const rowError = inlineErrors.find((e) => e.segmentId === segment.id);

                                    return (
                                        <React.Fragment key={segment.id}>
                                            <tr
                                                className={`group hover:bg-slate-50/70 transition-colors duration-150 ${
                                                    isDeleting || isDuplicating ? 'opacity-50' : ''
                                                } ${rowError ? 'bg-red-50/30' : ''}`}
                                            >
                                                {/* Segment Name */}
                                                <td className="px-4 py-2.5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                                            {segment.name}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 mt-0.5">
                                                            {hasRules
                                                                ? `${segment.rules_json?.rules?.length || 0} rule${segment.rules_json?.rules?.length !== 1 ? 's' : ''} · ${segment.rules_json?.logic || 'AND'}`
                                                                : 'No rules configured'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Estimated Count */}
                                                <td className="px-4 py-2.5">
                                                    <span className="text-sm font-semibold text-slate-800 tabular-nums">
                                                        {formatCount(segment.estimated_count)}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 ml-1">contacts</span>
                                                </td>

                                                {/* Status Toggle */}
                                                <td className="px-4 py-2.5">
                                                    {permissions.canToggleStatus ? (
                                                        <Tooltip label={`Click to ${segment.status === 'active' ? 'deactivate' : 'activate'}`}>
                                                            <button
                                                                id={`btn-toggle-status-${segment.id}`}
                                                                onClick={() => handleToggleStatus(segment.id, segment.status)}
                                                                disabled={isDisabled}
                                                                className={`
                                                                    inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all
                                                                    ${isUpdatingStatus ? 'animate-pulse opacity-70' : ''}
                                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                                    hover:shadow-sm active:scale-95
                                                                    ${segment.status === 'active'
                                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                                    }
                                                                `}
                                                            >
                                                                {isUpdatingStatus ? (
                                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                ) : segment.status === 'active' ? (
                                                                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                                                                ) : (
                                                                    <ToggleLeft className="w-4 h-4 text-slate-400" />
                                                                )}
                                                                {statusCfg.label}
                                                            </button>
                                                        </Tooltip>
                                                    ) : (
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${statusCfg.className}`}
                                                        >
                                                            {statusCfg.icon}
                                                            {statusCfg.label}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Last Updated */}
                                                <td className="px-4 py-2.5">
                                                    <span className="text-sm text-slate-600">
                                                        {formatDate(segment.updated_at || segment.created_at)}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-1">
                                                        {/* Edit */}
                                                        {permissions.canEdit ? (
                                                            <Tooltip label="Edit segment">
                                                                <button
                                                                    id={`btn-edit-segment-${segment.id}`}
                                                                    onClick={() => handleEdit(segment.id)}
                                                                    disabled={isDisabled}
                                                                    aria-label={`Edit ${segment.name}`}
                                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip label="No permission to edit">
                                                                <span className="p-1.5 text-slate-200 cursor-not-allowed">
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </span>
                                                            </Tooltip>
                                                        )}

                                                        {/* Duplicate */}
                                                        {permissions.canDuplicate ? (
                                                            <Tooltip label="Duplicate segment">
                                                                <button
                                                                    id={`btn-duplicate-segment-${segment.id}`}
                                                                    onClick={() => handleDuplicate(segment.id, segment.name)}
                                                                    disabled={isDisabled}
                                                                    aria-label={`Duplicate ${segment.name}`}
                                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                                >
                                                                    {isDuplicating ? (
                                                                        <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                                    ) : (
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip label="No permission to duplicate">
                                                                <span className="p-1.5 text-slate-200 cursor-not-allowed">
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                </span>
                                                            </Tooltip>
                                                        )}

                                                        {/* Delete */}
                                                        {permissions.canDelete ? (
                                                            <Tooltip label="Delete segment">
                                                                <button
                                                                    id={`btn-delete-segment-${segment.id}`}
                                                                    onClick={() => handleDeleteRequest(segment.id, segment.name)}
                                                                    disabled={isDisabled}
                                                                    aria-label={`Delete ${segment.name}`}
                                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                                >
                                                                    {isDeleting ? (
                                                                        <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip label="No permission to delete">
                                                                <span className="p-1.5 text-slate-200 cursor-not-allowed">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </span>
                                                            </Tooltip>
                                                        )}

                                                        {/* Overflow */}
                                                        <Tooltip label="More actions">
                                                            <button
                                                                disabled={isDisabled}
                                                                aria-label={`More actions for ${segment.name}`}
                                                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
                                                            >
                                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* ── Inline error row ─────────────────────────── */}
                                            {rowError && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-0">
                                                        <div className="flex items-center gap-2 px-3 py-2 mb-1 bg-red-50 border border-red-100 rounded-lg animate-[slideIn_200ms_ease-out]">
                                                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                            <span className="text-xs text-red-700 font-medium flex-1">
                                                                {rowError.message}
                                                            </span>
                                                            <button
                                                                onClick={() => clearInlineError(segment.id)}
                                                                className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider px-2 py-0.5 rounded hover:bg-red-100 transition-colors"
                                                            >
                                                                Dismiss
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ── Animation Keyframes (injected inline) ────────────────── */}
            <style dangerouslySetInnerHTML={{ __html: `
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
            ` }} />
        </div>
    );
};

export default SegmentsPage;
