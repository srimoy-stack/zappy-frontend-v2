'use client';

import React from 'react';
import { cn } from '@/utils';

interface StepHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    badge?: React.ReactNode;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ icon, title, subtitle, badge }) => (
    <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-950 rounded-xl shadow-sm">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-900 leading-none">
                    {title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                    {subtitle}
                </p>
            </div>
        </div>
        {badge && <div>{badge}</div>}
    </div>
);

// ─── Step Content Wrapper ────────────────────────────────────

export const StepCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn(
        "bg-white p-7 rounded-[2rem] border border-slate-200/60 shadow-sm",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        className
    )}>
        {children}
    </div>
);
