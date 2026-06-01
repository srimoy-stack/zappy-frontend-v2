'use client';

import React, { ReactNode } from 'react';

export function FormSectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-3 border-l-4 border-slate-900 pl-4 mb-6">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <Icon className="w-4 h-4 text-slate-900" />
            </div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h4>
        </div>
    );
}

export function InputWrapper({ label, required, optional, children }: { label: string; required?: boolean; optional?: boolean; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
                {optional && <span className="text-slate-300 font-medium normal-case tracking-normal">(optional)</span>}
            </label>
            {children}
        </div>
    );
}

export function ReviewField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-bold text-slate-900 leading-relaxed">
                {value || <span className="text-slate-300 italic">— Not provided</span>}
            </p>
        </div>
    );
}

export const INPUT_CLASS = "w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-bold placeholder:text-slate-300";

export const SELECT_CLASS = "w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem_1.25rem]";
