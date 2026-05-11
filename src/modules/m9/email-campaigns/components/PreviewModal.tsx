'use client';

import React, { useState } from 'react';
import { X, Monitor, Smartphone, Mail, Info } from 'lucide-react';

interface PreviewModalProps {
    open: boolean;
    onClose: () => void;
    campaignName: string;
    subject: string;
    htmlContent?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
    open,
    onClose,
    campaignName,
    subject,
    htmlContent = '<div style="padding: 40px; text-align: center; color: #64748b;">No content available for preview.</div>',
}) => {
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-10">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Content Container */}
            <div className="relative bg-slate-50 w-full max-w-6xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 border border-white/10">
                
                {/* ── Header ────────────────────────────────────────── */}
                <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{campaignName}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Campaign Preview</p>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setViewMode('desktop')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                                ${viewMode === 'desktop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Monitor size={14} /> Desktop
                        </button>
                        <button 
                            onClick={() => setViewMode('mobile')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                                ${viewMode === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Smartphone size={14} /> Mobile
                        </button>
                    </div>

                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </header>

                {/* ── Email Envelope Meta ───────────────────────────── */}
                <section className="px-8 py-4 bg-white border-b border-slate-100 flex items-center gap-6 shrink-0">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Subject</span>
                            <span className="text-sm font-bold text-slate-900">{subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">From</span>
                            <span className="text-sm font-semibold text-slate-600 italic">Zyappy Demo Store &lt;hello@zyappydemo.com&gt;</span>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                        <Info size={14} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Placeholders are sanitized for preview</span>
                    </div>
                </section>

                {/* ── Main Preview Area ─────────────────────────────── */}
                <main className="flex-1 overflow-hidden flex flex-col items-center p-4 sm:p-8 lg:p-12 custom-scrollbar">
                    <div 
                        className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden flex flex-col
                            ${viewMode === 'desktop' ? 'w-full max-w-4xl h-full rounded-2xl border border-slate-200' : 'w-[375px] h-[667px] rounded-[3rem] border-[12px] border-slate-900 shadow-[0_0_0_2px_rgba(255,255,255,0.1)] relative'}`}
                    >
                        {viewMode === 'mobile' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10 flex cursor-default pointer-events-none" />
                        )}
                        
                        <iframe 
                            srcDoc={htmlContent}
                            title="Email Preview"
                            className="w-full h-full border-none bg-white"
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PreviewModal;
