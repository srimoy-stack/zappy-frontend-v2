'use client';

import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, RotateCcw, Check } from 'lucide-react';
import type {
    CallFilters, CallStatus, Sentiment, CustomerIntent, SuccessStatus,
} from '../types/callAnalytics.types';

// ─── Option Sets ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: CallStatus; label: string }[] = [
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'missed', label: 'Missed' },
    { value: 'no_answer', label: 'No Answer' },
    { value: 'busy', label: 'Busy' },
    { value: 'dropped', label: 'Dropped' },
];

const SENTIMENT_OPTIONS: { value: Sentiment; label: string }[] = [
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' },
];

const INTENT_OPTIONS: { value: CustomerIntent; label: string }[] = [
    { value: 'store_hours', label: 'Store Hours' },
    { value: 'menu_question', label: 'Menu Question' },
    { value: 'deal_inquiry', label: 'Deal Inquiry' },
    { value: 'order_status', label: 'Order Status' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'franchise_inquiry', label: 'Franchise Inquiry' },
    { value: 'human_request', label: 'Human Request' },
    { value: 'catering', label: 'Catering' },
    { value: 'job_inquiry', label: 'Job Inquiry' },
    { value: 'other', label: 'Other' },
];

const SUCCESS_OPTIONS: { value: SuccessStatus; label: string }[] = [
    { value: 'successful', label: 'Successful' },
    { value: 'partial', label: 'Partial' },
    { value: 'failed', label: 'Failed' },
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface AdvancedFilterBarProps {
    filters: CallFilters;
    onChange: (filters: CallFilters) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({ filters, onChange }) => {
    const [draft, setDraft] = useState<CallFilters>(filters);
    const [isOpen, setIsOpen] = useState(false);

    // Sync draft when external filters change (e.g. reset)
    useEffect(() => { setDraft(filters); }, [JSON.stringify(filters)]);

    const updateDraft = (key: keyof CallFilters, value: unknown) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const apply = () => {
        onChange({ ...draft, page: 1 });
    };

    const reset = () => {
        const empty: CallFilters = { page: 1, limit: 20 };
        setDraft(empty);
        onChange(empty);
    };

    // Count active filters
    const activeCount = Object.entries(filters).filter(
        ([k, v]) => k !== 'page' && k !== 'limit' && v !== '' && v !== undefined && v !== null
    ).length;

    return (
        <div className="sticky top-0 z-10">
            {/* Toggle Bar */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <button
                    id="advanced-filter-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeCount > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                            {activeCount}
                        </span>
                    )}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Active filter chips */}
                {activeCount > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 flex-wrap">
                            {filters.date_from && <Chip label={`From: ${filters.date_from}`} onRemove={() => onChange({ ...filters, date_from: '', page: 1 })} />}
                            {filters.date_to && <Chip label={`To: ${filters.date_to}`} onRemove={() => onChange({ ...filters, date_to: '', page: 1 })} />}
                            {filters.call_status && <Chip label={`Status: ${filters.call_status}`} onRemove={() => onChange({ ...filters, call_status: '', page: 1 })} />}
                            {filters.sentiment && <Chip label={`Sentiment: ${filters.sentiment}`} onRemove={() => onChange({ ...filters, sentiment: '', page: 1 })} />}
                            {filters.customer_intent && <Chip label={`Intent: ${filters.customer_intent}`} onRemove={() => onChange({ ...filters, customer_intent: '', page: 1 })} />}
                            {filters.location_id && <Chip label={`Location: ${filters.location_id}`} onRemove={() => onChange({ ...filters, location_id: '', page: 1 })} />}
                        </div>
                        <button onClick={reset} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-0.5">
                            <RotateCcw className="h-3 w-3" /> Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded Filter Panel */}
            {isOpen && (
                <div className="mt-1 rounded-xl border border-slate-200 bg-white p-5 shadow-lg animate-in slide-in-from-top-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Date Range */}
                        <div>
                            <Label>Date From</Label>
                            <input type="date" value={draft.date_from || ''} onChange={(e) => updateDraft('date_from', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <Label>Date To</Label>
                            <input type="date" value={draft.date_to || ''} onChange={(e) => updateDraft('date_to', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        {/* Call Status */}
                        <div>
                            <Label>Call Status</Label>
                            <select value={(draft.call_status as string) || ''} onChange={(e) => updateDraft('call_status', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">All Statuses</option>
                                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {/* Sentiment */}
                        <div>
                            <Label>Sentiment</Label>
                            <select value={(draft.sentiment as string) || ''} onChange={(e) => updateDraft('sentiment', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">All Sentiments</option>
                                {SENTIMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {/* Intent */}
                        <div>
                            <Label>Customer Intent</Label>
                            <select value={(draft.customer_intent as string) || ''} onChange={(e) => updateDraft('customer_intent', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">All Intents</option>
                                {INTENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {/* Success Status */}
                        <div>
                            <Label>Success Status</Label>
                            <select value={(draft.success_status as string) || ''} onChange={(e) => updateDraft('success_status', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">All</option>
                                {SUCCESS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <Label>Location ID</Label>
                            <input type="text" placeholder="e.g. loc_123" value={draft.location_id || ''}
                                onChange={(e) => updateDraft('location_id', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        {/* Follow-up Toggle */}
                        <div>
                            <Label>Follow-up Required</Label>
                            <select
                                value={draft.follow_up_required === true ? 'true' : draft.follow_up_required === false ? 'false' : ''}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    updateDraft('follow_up_required', v === 'true' ? true : v === 'false' ? false : '');
                                }}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">All</option>
                                <option value="true">Required</option>
                                <option value="false">Not Required</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
                        <button onClick={reset}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                        <button onClick={apply}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm">
                            <Check className="h-3.5 w-3.5" /> Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-xs font-medium text-slate-500 mb-1 block">{children}</label>;
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
            {label}
            <button onClick={onRemove} className="hover:text-red-600"><X className="h-3 w-3" /></button>
        </span>
    );
}
