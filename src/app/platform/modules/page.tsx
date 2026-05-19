'use client';

import React, { useState, useEffect } from 'react';
import { LayoutGrid, CheckCircle2, Circle, Settings2, Shield, Info, ExternalLink } from 'lucide-react';
import { api } from '@/shared/api';
import { TenantModule } from '@/shared/types/module';

export default function PlatformModulesPage() {
    const [modules, setModules] = useState<TenantModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        setIsLoading(true);
        try {
            // Reusing backoffice module service for now, in a real app this would be a platform endpoint
            const data = await api.getModules();
            setModules(data);
        } catch (error) {
            console.error('Failed to load modules:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Modules</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage platform-wide module entitlements and definitions</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Registry Sync Active</span>
                </div>
            </div>

            {isLoading ? (
                <div className="p-24 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching Registry...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {modules.map((module) => (
                        <div 
                            key={module.id} 
                            className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all p-8 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                    <LayoutGrid size={28} />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${module.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {module.status}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{module.name}</h3>
                                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                                    {module.description || 'Enterprise-grade operational module for specialized workflows.'}
                                </p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Code</span>
                                    <span className="text-xs font-bold text-slate-900 mt-1">{module.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                        <Settings2 size={18} />
                                    </button>
                                    <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                        <Info size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
