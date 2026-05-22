import React from 'react';
import { Activity, Clock, User, Eye, Search, Filter } from 'lucide-react';
import { useCatalogStore } from '../../state/catalogStore';

interface AuditEntry {
    timestamp: string;
    user: string;
    action: string;
    item: string;
    details: string;
}

export const AuditTimelinePanel: React.FC = () => {
    const { items } = useCatalogStore();

    // Mock global catalog audits database
    const audits: AuditEntry[] = [
        { 
            timestamp: new Date().toISOString(), 
            user: 'Brand Admin (Sarah)', 
            action: 'MUTATION_PRICE', 
            item: 'Veggie Supreme Pizza', 
            details: 'Adjusted base variant Large price: $15.99 -> $16.50' 
        },
        { 
            timestamp: new Date(Date.now() - 3600000).toISOString(), 
            user: 'Store Manager (Alex)', 
            action: 'OVERRIDE_APPLY', 
            item: 'Pepperoni Classic Pizza', 
            details: 'Overrode Chicago price: $12.99 -> $14.25' 
        },
        { 
            timestamp: new Date(Date.now() - 7200000).toISOString(), 
            user: 'Brand Admin (Sarah)', 
            action: 'MODIFIER_ATTACH', 
            item: 'Cheesy Garlic Bread', 
            details: 'Attached global Modifier Pool "Beverages"' 
        },
        { 
            timestamp: new Date(Date.now() - 86400000).toISOString(), 
            user: 'System Seed', 
            action: 'CATALOG_PROVISION', 
            item: 'Double Pizza Combo Deal', 
            details: 'Provisioned Master Combo parameters' 
        }
    ];

    const getActionColor = (action: string) => {
        switch (action) {
            case 'MUTATION_PRICE': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'OVERRIDE_APPLY': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'MODIFIER_ATTACH': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'CATALOG_PROVISION': default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3.5 mb-1.5">
                        <div className="p-2.5 bg-slate-900 rounded-2xl shadow-md">
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Global Audit Timeline</h2>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Chronological audit ledger logging operator catalog updates and override revisions.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter timeline logs..." 
                            className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10.5px] font-bold w-56 outline-none focus:border-slate-950 transition-all uppercase"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                        <Filter size={14} />
                    </button>
                </div>
            </div>

            {/* 2. Timeline display grid */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-7">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
                    Auditable Mutation Actions Timeline
                </h3>

                <div className="relative border-l-2 border-slate-100 pl-6 space-y-7 ml-3.5">
                    {audits.map((audit, idx) => (
                        <div key={idx} className="relative group">
                            {/* Bullet node */}
                            <div className="absolute -left-[31px] top-0.5 w-4 h-4 bg-white border-2 border-slate-300 rounded-full group-hover:border-emerald-500 transition-colors flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-slate-350 group-hover:bg-emerald-500 rounded-full" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        {audit.timestamp}
                                    </div>
                                    <div className="h-2.5 w-[1px] bg-slate-200" />
                                    <div className="flex items-center gap-1 text-[9.5px] font-black text-slate-800 uppercase tracking-wider">
                                        <User className="w-3 h-3 text-slate-400" />
                                        {audit.user}
                                    </div>
                                    <div className="h-2.5 w-[1px] bg-slate-200" />
                                    <span className={`px-2.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${getActionColor(audit.action)}`}>
                                        {audit.action}
                                    </span>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-tight mb-1">{audit.item}</h4>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{audit.details}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
