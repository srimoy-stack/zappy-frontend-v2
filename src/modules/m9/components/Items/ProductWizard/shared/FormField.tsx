'use client';

import React from 'react';
import { cn } from '@/utils';

interface FormFieldProps {
    label: string;
    hint?: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label, hint, required, error, children, className
}) => {
    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                    {label}
                    {required && <span className="text-rose-500 ml-0.5">*</span>}
                </label>
                {hint && (
                    <span className="text-[8px] font-bold text-slate-350 uppercase tracking-tight">
                        ({hint})
                    </span>
                )}
            </div>
            {children}
            {error && (
                <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight animate-in slide-in-from-top-1 duration-200">
                    ⚠ {error}
                </p>
            )}
        </div>
    );
};

// ─── Styled Input Primitives ────────────────────────────────

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ hasError, className, ...props }) => (
    <input
        {...props}
        className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold",
            "focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all",
            "placeholder:text-slate-300 placeholder:font-medium",
            hasError ? "border-rose-300 bg-rose-50/30" : "border-slate-200",
            className
        )}
    />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }> = ({
    hasError, className, ...props
}) => (
    <textarea
        {...props}
        className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold resize-none",
            "focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all",
            "placeholder:text-slate-300 placeholder:font-medium",
            hasError ? "border-rose-300 bg-rose-50/30" : "border-slate-200",
            className
        )}
    />
);

export const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }> = ({
    hasError, className, children, ...props
}) => (
    <select
        {...props}
        className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold",
            "focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all appearance-none",
            hasError ? "border-rose-300 bg-rose-50/30" : "border-slate-200",
            className
        )}
    >
        {children}
    </select>
);

export const CurrencyInput: React.FC<TextInputProps> = ({ className, ...props }) => (
    <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
        <input
            type="number"
            step="0.01"
            min="0"
            {...props}
            className={cn(
                "w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold",
                "focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all",
                "placeholder:text-slate-300 placeholder:font-medium",
                className
            )}
        />
    </div>
);
