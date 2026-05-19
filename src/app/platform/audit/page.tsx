'use client';

import { useState } from 'react';
import { FileText, Search, Filter, Clock, User, Shield, Building2, Zap, ArrowDownToLine } from 'lucide-react';

interface AuditLog {
    id: string;
    timestamp: string;
    actor: string;
    actorRole: string;
    action: string;
    target: string;
    details: string;
    status: 'Success' | 'Failed' | 'Warning';
}

const MOCK_LOGS: AuditLog[] = [
    { id: '1', timestamp: '2026-05-07T14:30:00Z', actor: 'Super Admin', actorRole: 'Platform Owner', action: 'TENANT_CREATED', target: 'Acme Pizza Co.', details: 'New tenant registered via onboarding flow', status: 'Success' },
    { id: '2', timestamp: '2026-05-07T13:45:00Z', actor: 'System', actorRole: 'Automated', action: 'MODULE_ACTIVATED', target: 'KDS', details: 'Kitchen Display System enabled for QuickBite Foods', status: 'Success' },
    { id: '3', timestamp: '2026-05-07T12:20:00Z', actor: 'John Admin', actorRole: 'Platform Admin', action: 'ROLE_MODIFIED', target: 'Store Manager', details: 'Added KDS_ORDER_VIEW permission to standard manager role', status: 'Success' },
    { id: '4', timestamp: '2026-05-07T11:10:00Z', actor: 'Super Admin', actorRole: 'Platform Owner', action: 'USER_LOGIN_FAILED', target: 'Unknown', details: 'Repeated failed login attempts from IP 192.168.1.1', status: 'Warning' },
    { id: '5', timestamp: '2026-05-07T10:05:00Z', actor: 'Super Admin', actorRole: 'Platform Owner', action: 'BRAND_SUSPENDED', target: 'Burger Nation Inc.', details: 'Brand suspended due to billing delinquency', status: 'Success' },
];

export default function PlatformAuditPage() {
    const [logs] = useState<AuditLog[]>(MOCK_LOGS);
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Success': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Warning': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getActionIcon = (action: string) => {
        if (action.includes('TENANT')) return <Building2 size={16} />;
        if (action.includes('ROLE')) return <Shield size={16} />;
        if (action.includes('MODULE')) return <Zap size={16} />;
        return <FileText size={16} />;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Audit Logs</h1>
                    <p className="text-slate-500 font-medium mt-1">Immutable record of all critical platform and administrative actions</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                    <ArrowDownToLine size={20} />
                    Export CSV
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search logs by action, actor, or target..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                        <Clock size={18} />
                        Last 24 Hours
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Actor</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map(log => (
                                <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                <User size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900">{log.actor}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.actorRole}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                                            <span className="text-slate-400">{getActionIcon(log.action)}</span>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-bold text-slate-700">{log.target}</span>
                                    </td>
                                    <td className="px-8 py-6 max-w-xs">
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed truncate group-hover:whitespace-normal">
                                            {log.details}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(log.status)}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
