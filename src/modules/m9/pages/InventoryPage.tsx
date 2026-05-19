'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Package,
    FileText,
    List,
    ChefHat,
    RotateCcw,
    Users,
    Plus,
    TrendingUp,
    AlertTriangle,
    Scale,
    Activity,
    Zap,
    ArrowUpRight,
    Search,
    ShieldCheck
} from 'lucide-react';
import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';
import { mockInventoryItems, mockInventoryEntries } from '../mock/inventory';
import { cn, formatCurrency } from '@/utils';

export const InventoryPage: React.FC = () => {
    const router = useRouter();
    const { userType, isSuperAdmin } = useRouteAccess();

    // Calculate quick stats
    const lowStockItems = mockInventoryItems.filter(item => item.currentStock <= item.lowStockThreshold);
    const totalInventoryValue = mockInventoryItems.reduce((sum, item) => sum + (item.currentStock * item.averageCost), 0);
    const pendingEntries = mockInventoryEntries.filter(entry => entry.inventoryStatus === 'Draft' || entry.inventoryStatus === 'Ordered');

    // Permission checks
    const canAddInventory = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN || userType === UserType.MANAGER;

    return (
        <div className="max-w-[1700px] mx-auto space-y-8 pb-32 px-4 pt-4">
            {/* 1. Header: Operational Pulse */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-slate-900 rounded-lg">
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Overwatch</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium font-mono uppercase tracking-tight opacity-70">
                        Live Supply Chain Velocity & Resource Monitoring
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-4 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Stock Confidence</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="w-[88%] h-full bg-emerald-500 rounded-full" />
                                </div>
                                <span className="text-xs font-black text-slate-900">88%</span>
                            </div>
                        </div>
                        <div className="w-[1px] h-6 bg-slate-100 mx-2" />
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Network Burn</span>
                            <div className="text-xs font-black text-rose-500 flex items-center gap-1 justify-end">
                                <TrendingUp size={12} strokeWidth={3} />
                                High
                            </div>
                        </div>
                    </div>

                    {canAddInventory && (
                        <button
                            onClick={() => router.push('/backoffice/inventory/add')}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.1em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 group"
                        >
                            <Plus size={16} strokeWidth={3} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
                            Dispatch Stock Inward
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Vital Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <VitalStatCard
                    icon={Package}
                    label="Asset Value"
                    value={formatCurrency(totalInventoryValue)}
                    sub={`${mockInventoryItems.length} Node SKUs`}
                    color="emerald"
                    trend="+1.2%"
                />
                <VitalStatCard
                    icon={AlertTriangle}
                    label="Critical Thresholds"
                    value={lowStockItems.length.toString()}
                    sub="Items Below Min"
                    color="amber"
                    trend="Check KDS"
                />
                <VitalStatCard
                    icon={TrendingUp}
                    label="In-Transit Flux"
                    value={pendingEntries.length.toString()}
                    sub="Open Purchase Orders"
                    color="blue"
                    trend="On Track"
                />
                <VitalStatCard
                    icon={ShieldCheck}
                    label="Audit Integrity"
                    value="100%"
                    sub="All Counts Verified"
                    color="violet"
                    trend="Secure"
                />
            </div>

            {/* 3. Operational Navigation & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navigation Hub */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Dispatch</h3>
                        <div className="flex items-center gap-2">
                            <Search size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-300 uppercase">Quick Command</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <NavHubCard
                            icon={List}
                            title="List Inventory"
                            sub="Canonical Ledger"
                            desc="Real-time ingredient tracking and SKU management."
                            color="violet"
                            onClick={() => router.push('/backoffice/inventory/list')}
                        />
                        <NavHubCard
                            icon={ChefHat}
                            title="Recipe Engine"
                            sub="BOM & Costing"
                            desc="Configure bill of materials and track food cost drift."
                            color="orange"
                            onClick={() => router.push('/backoffice/inventory/recipes')}
                        />
                        <NavHubCard
                            icon={Scale}
                            title="Count Drift"
                            sub="Self Adjust"
                            desc="Manual correction and cycle counting protocols."
                            color="amber"
                            onClick={() => router.push('/backoffice/inventory/list')}
                        />
                        <NavHubCard
                            icon={RotateCcw}
                            title="Waste Log"
                            sub="List Returns"
                            desc="Monitor leakage, spoilage, and return velocity."
                            color="rose"
                            onClick={() => router.push('/backoffice/inventory/returns')}
                        />
                        <NavHubCard
                            icon={Users}
                            title="Supply Chain"
                            sub="Vendors"
                            desc="Manage supplier identities and procurement flows."
                            color="slate"
                            onClick={() => router.push('/backoffice/inventory/vendors')}
                        />
                        <NavHubCard
                            icon={FileText}
                            title="Entry Ledger"
                            sub="Stock Inward"
                            desc="Full history of stock inward and PO fulfillment."
                            color="blue"
                            onClick={() => router.push('/backoffice/inventory/entries')}
                        />
                    </div>
                </div>

                {/* Sidebar Alerts & Intelligence */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <Zap className="absolute -top-8 -right-8 w-40 h-40 text-emerald-500/10 rotate-12" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-emerald-500 rounded-lg">
                                    <Zap size={14} className="text-slate-900" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Inventory Alert</span>
                            </div>
                            <h4 className="text-2xl font-black tracking-tight mb-2 italic text-emerald-400">Low Stock Detected</h4>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                                <span className="text-white font-bold">{lowStockItems.length} SKUs</span> are operating below critical safety levels. Supply chain friction detected in Regional Zone 4.
                            </p>
                            <div className="space-y-3 mb-8">
                                {lowStockItems.slice(0, 3).map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                                        <div className="text-xs font-bold uppercase tracking-tight">{item.name}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-rose-400">{item.currentStock} {item.baseUnit}</span>
                                            <ArrowUpRight size={12} className="text-slate-600 group-hover:text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-4 bg-emerald-500 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                                Rectify Shortages Now
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">Supply Integrity</span>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Validated</h5>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">All stock movement since 04:00 AM matches theoretical burn rate.</p>
                                </div>
                            </div>
                            <div className="h-[1px] bg-slate-50" />
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                    <RotateCcw size={20} />
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">Auto-Reconcile Ready</h5>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">End of month audit is 92% complete based on digital entries.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function VitalStatCard({ icon: Icon, label, value, sub, color, trend }: any) {
    const colors: any = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100"
    };

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl border shadow-sm", colors[color])}>
                    <Icon size={18} />
                </div>
                <div className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded-full border",
                    trend.includes('-') ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                    {trend}
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:scale-105 transition-transform origin-left">{value}</div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight mt-1.5">{sub}</p>
        </div>
    );
}

function NavHubCard({ icon: Icon, title, sub, desc, color, onClick }: any) {
    const colors: any = {
        violet: "text-violet-600 bg-violet-50 border-violet-100 group-hover:bg-violet-600 group-hover:text-white",
        orange: "text-orange-600 bg-orange-50 border-orange-100 group-hover:bg-orange-600 group-hover:text-white",
        amber: "text-amber-600 bg-amber-50 border-amber-100 group-hover:bg-amber-600 group-hover:text-white",
        rose: "text-rose-600 bg-rose-50 border-rose-100 group-hover:bg-rose-600 group-hover:text-white",
        slate: "text-slate-600 bg-slate-50 border-slate-100 group-hover:bg-slate-900 group-hover:text-white",
        blue: "text-blue-600 bg-blue-50 border-blue-100 group-hover:bg-blue-600 group-hover:text-white"
    };

    return (
        <button
            onClick={onClick}
            className="p-8 bg-white border border-slate-200 rounded-[2.5rem] text-left hover:border-slate-900 group transition-all hover:shadow-xl hover:shadow-slate-200/50"
        >
            <div className="flex items-start justify-between mb-8">
                <div className={cn("p-4 rounded-[1.25rem] border shadow-sm transition-all duration-500", colors[color])}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <ArrowUpRight size={16} />
                </div>
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2">{sub}</span>
            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">{title}</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed opacity-70">
                {desc}
            </p>
        </button>
    );
}
