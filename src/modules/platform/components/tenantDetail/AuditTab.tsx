'use client';

import React, { useState } from 'react';
import { FileText, Search, ChevronDown, ChevronUp, Shield, Users, Store, LayoutGrid, Mail, LogIn, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AuditEvent {
    id: string;
    event: string;
    actor: string;
    timestamp: string;
    details: string;
    payload?: Record<string, any>;
}

const EVENT_ICONS: Record<string, any> = {
    BRAND_CREATED: Shield,
    TENANT_CREATED: Shield,
    MODULE_PURCHASED: LayoutGrid,
    MODULE_ENABLED: LayoutGrid,
    ENTITLEMENT_CHANGED: LayoutGrid,
    STORE_CREATED: Store,
    USER_CREATED: Users,
    USER_SUSPENDED: Users,
    IMPERSONATION_START: LogIn,
    IMPERSONATION_END: LogIn,
    COMMUNICATION_CONFIG: Mail,
    BRAND_SUSPENDED: AlertTriangle,
    DEFAULT: FileText,
};

const EVENT_COLORS: Record<string, string> = {
    BRAND_CREATED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    TENANT_CREATED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    MODULE_ENABLED: 'bg-blue-50 text-blue-600 border-blue-200',
    ENTITLEMENT_CHANGED: 'bg-blue-50 text-blue-600 border-blue-200',
    USER_CREATED: 'bg-violet-50 text-violet-600 border-violet-200',
    IMPERSONATION_START: 'bg-amber-50 text-amber-600 border-amber-200',
    BRAND_SUSPENDED: 'bg-rose-50 text-rose-600 border-rose-200',
};

interface AuditTabProps {
    tenantId: string;
    events: AuditEvent[];
}

export function AuditTab({ tenantId, events }: AuditTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = events.filter(e =>
        e.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.actor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTimestamp = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <FileText size={18} />
                        Audit Timeline
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {events.length} events — Onboarding, users, modules, impersonation, config changes
                    </p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-6 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                />
            </div>

            {/* Timeline */}
            <div className="space-y-3">
                {filtered.map(event => {
                    const Icon = EVENT_ICONS[event.event] || EVENT_ICONS.DEFAULT;
                    const colorClass = EVENT_COLORS[event.event] || 'bg-slate-50 text-slate-600 border-slate-200';
                    const isExpanded = expandedId === event.id;

                    return (
                        <div key={event.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-slate-200' : ''}`}>
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                                className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorClass}`}>
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{event.event.replace(/_/g, ' ')}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium truncate">{event.details}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-[10px] font-bold text-slate-400 block">{formatTimestamp(event.timestamp)}</span>
                                    <span className="text-[9px] font-bold text-slate-400 block mt-0.5">by {event.actor}</span>
                                </div>
                                {event.payload && (
                                    isExpanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />
                                )}
                            </button>

                            {isExpanded && event.payload && (
                                <div className="px-5 pb-5 pt-0">
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Event Payload</span>
                                        <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap">
                                            {JSON.stringify(event.payload, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No audit events found</p>
                </div>
            )}
        </div>
    );
}
