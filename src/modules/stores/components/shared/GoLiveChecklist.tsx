'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Shield, Zap } from 'lucide-react';
import { cn } from '@/utils';
import type { GoLiveCheckItem, GoLiveStatus } from '@/shared/types/store';

interface GoLiveChecklistProps {
    checks: GoLiveCheckItem[];
    status: GoLiveStatus;
    score: number;
    onPublish?: () => void;
    isPublishing?: boolean;
    compact?: boolean;
}

const STATUS_META: Record<GoLiveStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    ready: { label: 'Ready to Go Live', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: CheckCircle2 },
    partial: { label: 'Partially Ready', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: AlertTriangle },
    not_ready: { label: 'Not Ready', color: 'text-rose-700', bgColor: 'bg-rose-50', icon: XCircle },
};

/**
 * Go-Live readiness checklist with visual progress and publish action.
 * Used on the store overview tab and in the store card quickview.
 */
export function GoLiveChecklist({ checks, status, score, onPublish, isPublishing, compact }: GoLiveChecklistProps) {
    const meta = STATUS_META[status];
    const Icon = meta.icon;
    const requiredChecks = checks.filter(c => c.severity === 'required');
    const recommendedChecks = checks.filter(c => c.severity === 'recommended');

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-700',
                        score >= 100 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-400'
                    )} style={{ width: `${score}%` }} />
                </div>
                <span className={cn('text-[10px] font-black', meta.color)}>{score}%</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Status Header */}
            <div className={cn('flex items-center justify-between p-4 rounded-2xl border', meta.bgColor, meta.color === 'text-emerald-700' ? 'border-emerald-200' : meta.color === 'text-amber-700' ? 'border-amber-200' : 'border-rose-200')}>
                <div className="flex items-center gap-3">
                    <Icon size={18} className={meta.color} />
                    <div>
                        <span className={cn('text-sm font-black', meta.color)}>{meta.label}</span>
                        <span className="text-[10px] font-bold text-slate-500 ml-2">{score}% complete</span>
                    </div>
                </div>
                {status === 'ready' && onPublish && (
                    <button
                        onClick={onPublish}
                        disabled={isPublishing}
                        className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                        <Zap size={13} />
                        {isPublishing ? 'Publishing...' : 'Go Live'}
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-700',
                    score >= 100 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-400'
                )} style={{ width: `${score}%` }} />
            </div>

            {/* Required Checks */}
            <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield size={10} /> Required
                </p>
                {requiredChecks.map(check => (
                    <div key={check.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                        {check.passed ? (
                            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        ) : (
                            <XCircle size={15} className="text-rose-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                            <span className={cn('text-xs font-bold', check.passed ? 'text-slate-700' : 'text-slate-900')}>
                                {check.label}
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium truncate">{check.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recommended Checks */}
            {recommendedChecks.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recommended</p>
                    {recommendedChecks.map(check => (
                        <div key={check.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                            {check.passed ? (
                                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                            ) : (
                                <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                                <span className={cn('text-xs font-bold', check.passed ? 'text-slate-700' : 'text-slate-500')}>
                                    {check.label}
                                </span>
                                <p className="text-[10px] text-slate-400 font-medium truncate">{check.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
