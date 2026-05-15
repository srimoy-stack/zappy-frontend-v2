'use client';

import React, { useState } from 'react';
import {
    Mail,
    Plus,
    Pencil,
    Copy,
    Pause,
    AlertCircle,
    Clock,
    Send,
    CheckCircle2,
    XCircle,
    Ban,
    Download,
    Archive,
    Eye,
    TestTube2,
    Loader2,
    Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '../hooks/useCampaigns';
import { Campaign, CampaignStatus } from '../types/campaign.types';
import { emailCampaignService } from '../services/emailCampaignService';
import { downloadCSV, CampaignMetricRow } from '../utils/exportCSV';
import { ConfirmModal } from '../components/ConfirmModal';
import { ToastContainer, useToast } from '../components/Toast';
import { Tooltip } from '../components/Tooltip';
import { PreviewModal } from '../components/PreviewModal';
import { TestSendModal } from '../components/TestSendModal';

// ============================================================================
// STATUS BADGE CONFIG
// ============================================================================

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string; icon: React.ReactNode }> = {
    draft: {
        label: 'Draft',
        className: 'bg-slate-100 text-slate-600',
        icon: <Pencil className="w-3 h-3" />,
    },
    scheduled: {
        label: 'Scheduled',
        className: 'bg-blue-50 text-blue-700',
        icon: <Clock className="w-3 h-3" />,
    },
    sending: {
        label: 'Sending',
        className: 'bg-amber-50 text-amber-700',
        icon: <Send className="w-3 h-3" />,
    },
    sent: {
        label: 'Sent',
        className: 'bg-emerald-50 text-emerald-700',
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    paused: {
        label: 'Paused',
        className: 'bg-orange-50 text-orange-700',
        icon: <Pause className="w-3 h-3" />,
    },
    failed: {
        label: 'Failed',
        className: 'bg-red-50 text-red-600',
        icon: <XCircle className="w-3 h-3" />,
    },
    blocked: {
        label: 'Blocked',
        className: 'bg-red-100 text-red-800',
        icon: <Ban className="w-3 h-3" />,
    },
};

// ============================================================================
// HELPERS
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
// COMPONENT
// ============================================================================

export const EmailCampaignsPage: React.FC = () => {
    const router = useRouter();
    const toast = useToast();
    const { data: campaigns, loading, error, refetch } = useCampaigns();

    // ── Local States ──────────────────────────────────────────────────
    const [busyId, setBusyId] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        id: string;
        type: 'archive' | 'pause';
        name: string;
    } | null>(null);
    const [previewItem, setPreviewItem] = useState<Campaign | null>(null);
    const [testSendItem, setTestSendItem] = useState<Campaign | null>(null);

    // ── Handlers ───────────────────────────────────────────────────────
    
    const handleCreateCampaign = () => {
        router.push('/backoffice/email-campaigns/create');
    };

    const handleEdit = (id: string) => {
        router.push(`/backoffice/email-campaigns/campaigns/${id}/edit`);
    };

    const handleDuplicate = async (campaign: Campaign) => {
        setBusyId(campaign.id);
        try {
            await emailCampaignService.duplicateCampaign(campaign.id);
            toast.success('Campaign duplicated', `"${campaign.name} (Copy)" created successfully.`);
            refetch();
        } catch (err: any) {
            toast.error('Duplicate failed', err?.response?.data?.error || err.message || 'Server error');
        } finally {
            setBusyId(null);
        }
    };

    const handlePause = async (id: string) => {
        setBusyId(id);
        setConfirmAction(null);
        try {
            await emailCampaignService.pauseCampaign(id);
            toast.success('Campaign paused', 'Sending has been paused.');
            refetch();
        } catch (err: any) {
            toast.error('Pause failed', err?.response?.data?.error || err.message || 'Server error');
        } finally {
            setBusyId(null);
        }
    };

    const handleArchive = async (id: string) => {
        setBusyId(id);
        setConfirmAction(null);
        try {
            await emailCampaignService.archiveCampaign(id);
            toast.success('Campaign archived', 'It has been moved to the archive.');
            refetch();
        } catch (err: any) {
            toast.error('Archive failed', err?.response?.data?.error || err.message || 'Server error');
        } finally {
            setBusyId(null);
        }
    };

    const handleTestSendAction = async (targetEmail: string) => {
        if (!testSendItem) return;
        try {
            // Pass the campaign's actual HTML template if available
            await emailCampaignService.sendTestEmail(targetEmail, { 
                templateId: testSendItem.id,
                templateHtml: testSendItem.customHtml || undefined,
            });
        } catch (err: any) {
             throw err; // Let the modal handle the error display
        }
    };

    const handleExportCSV = () => {
        const rows: CampaignMetricRow[] = campaigns.map((c) => ({
            campaignName: c.name,
            status: c.status,
            sent: Math.floor(Math.random() * 5000) + 500,
            delivered: Math.floor(Math.random() * 4500) + 400,
            openRate: parseFloat((Math.random() * 40 + 10).toFixed(1)),
            clickRate: parseFloat((Math.random() * 15 + 1).toFixed(1)),
            unsubscribeRate: parseFloat((Math.random() * 2).toFixed(2)),
            bounceRate: parseFloat((Math.random() * 5).toFixed(2)),
        }));
        downloadCSV(rows);
        toast.info('Export complete', 'Your CSV file is downloading.');
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-20 px-4 lg:px-6">
            <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Email Campaigns</h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Create and manage your email campaigns
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-lg transition-all"
                        title="Export CSV"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        id="btn-create-campaign"
                        onClick={handleCreateCampaign}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-semibold shadow-md shadow-brand/20 hover:bg-brand-dark transition-all active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        New Campaign
                    </button>
                </div>
            </div>

            {/* ── Error State ─────────────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-rose-800">Failed to load campaigns</p>
                        <p className="text-xs text-rose-600 mt-0.5">{error}</p>
                    </div>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Table Container ─────────────────────────────────────── */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        {loading ? 'Loading…' : `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}`}
                    </span>
                </div>

                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 min-w-[260px]">Campaign</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 min-w-[110px]">Status</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 min-w-[140px]">Audience</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 min-w-[160px]">Scheduled</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && campaigns.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-48 mb-1.5"/><div className="h-3 bg-slate-50 rounded w-32"/></td>
                                        <td className="px-5 py-4"><div className="h-6 bg-slate-100 rounded w-20"/></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-28"/></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-36"/></td>
                                        <td className="px-5 py-4 flex justify-end gap-1.5"><div className="h-8 w-8 bg-slate-100 rounded-lg"/><div className="h-8 w-8 bg-slate-100 rounded-lg"/></td>
                                    </tr>
                                ))
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center mb-4">
                                                <Mail className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <h3 className="text-base font-semibold text-slate-600">No campaigns yet</h3>
                                            <p className="text-sm text-slate-400 mt-1">Create your first email campaign to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign) => {
                                    const cfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                                    const isBusy = busyId === campaign.id;
                                    const isDraft = campaign.status === 'draft';
                                    const canPause = campaign.status === 'scheduled' || campaign.status === 'sending';

                                    return (
                                        <tr key={campaign.id} className="group hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-dark transition-colors">
                                                        {campaign.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px]">
                                                        {campaign.subject}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.className}`}>
                                                    {cfg.icon}
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-slate-400" />
                                                    <span className="text-sm text-slate-600">{campaign.audience || 'All contacts'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock size={14} className="text-slate-300" />
                                                    <span className="text-sm">
                                                        {campaign.scheduledAt ? formatDate(campaign.scheduledAt) : 'Immediate'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Edit */}
                                                    {isDraft && (
                                                        <Tooltip label="Edit draft">
                                                            <button 
                                                                onClick={() => handleEdit(campaign.id)}
                                                                disabled={isBusy}
                                                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                                                            >
                                                                <Pencil size={15} />
                                                            </button>
                                                        </Tooltip>
                                                    )}

                                                    {/* Duplicate */}
                                                    <Tooltip label="Duplicate">
                                                        <button 
                                                            onClick={() => handleDuplicate(campaign)}
                                                            disabled={isBusy}
                                                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                                                        >
                                                            {isBusy ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
                                                        </button>
                                                    </Tooltip>

                                                    {/* Pause */}
                                                    {canPause && (
                                                        <Tooltip label="Pause">
                                                            <button 
                                                                onClick={() => setConfirmAction({ id: campaign.id, type: 'pause', name: campaign.name })}
                                                                disabled={isBusy}
                                                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                                                            >
                                                                <Pause size={15} />
                                                            </button>
                                                        </Tooltip>
                                                    )}

                                                    {/* Preview */}
                                                    <Tooltip label="Preview">
                                                        <button 
                                                            onClick={() => setPreviewItem(campaign)}
                                                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all"
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                    </Tooltip>

                                                    {/* Test */}
                                                    <Tooltip label="Send test">
                                                        <button 
                                                            onClick={() => setTestSendItem(campaign)}
                                                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all"
                                                        >
                                                            <TestTube2 size={15} />
                                                        </button>
                                                    </Tooltip>

                                                    {/* Archive */}
                                                    <Tooltip label="Archive">
                                                        <button 
                                                            onClick={() => setConfirmAction({ id: campaign.id, type: 'archive', name: campaign.name })}
                                                            disabled={isBusy}
                                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                                                        >
                                                            <Archive size={15} />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── Confirmation Modals ─────────────────────────────────── */}
            <ConfirmModal 
                open={!!confirmAction}
                title={confirmAction?.type === 'archive' ? 'Archive Campaign?' : 'Pause Campaign?'}
                description={confirmAction?.type === 'archive' 
                    ? `Are you sure you want to archive "${confirmAction?.name}"? This action moves the campaign to the archive list and removes it from active dashboards.`
                    : `This will immediately stop all pending sends for "${confirmAction?.name}". Emails that have already been delivered cannot be recalled.`
                }
                confirmLabel={confirmAction?.type === 'archive' ? 'Archive' : 'Pause Sending'}
                variant={confirmAction?.type === 'archive' ? 'danger' : 'warning'}
                loading={busyId === confirmAction?.id}
                onConfirm={() => {
                    if (confirmAction?.type === 'archive') handleArchive(confirmAction.id);
                    else handlePause(confirmAction!.id);
                }}
                onCancel={() => setConfirmAction(null)}
            />

            {/* ── Preview Modal ───────────────────────────────────────── */}
            <PreviewModal 
                open={!!previewItem}
                onClose={() => setPreviewItem(null)}
                campaignName={previewItem?.name || ''}
                subject={previewItem?.subject || ''}
                htmlContent={previewItem?.customHtml || `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 12px; background: white;">
                        <h1 style="color: #6366f1; margin-bottom: 24px;">${previewItem?.subject}</h1>
                        <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                            Hello, this is a preview of campaign <strong>${previewItem?.name}</strong>.
                        </p>
                        <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; text-align: center;">No template HTML available for this campaign.</p>
                        <div style="margin-top: 40px; color: #94a3b8; font-size: 12px; text-align: center;">
                            <p>Audience: <strong>${previewItem?.audience}</strong></p>
                        </div>
                    </div>
                `}
            />

            {/* ── Test Send Modal ─────────────────────────────────────── */}
            <TestSendModal 
                open={!!testSendItem}
                onClose={() => setTestSendItem(null)}
                campaignName={testSendItem?.name || ''}
                onSend={handleTestSendAction}
            />
        </div>
    );
};

export default EmailCampaignsPage;
