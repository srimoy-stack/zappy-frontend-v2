import React from 'react';
import { useRouter } from 'next/navigation';
;
import { ChevronLeft, Save, ShieldCheck } from 'lucide-react';

interface SettingsLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
    onSave?: () => void;
    isLoading?: boolean;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
    title,
    description,
    children,
    onSave,
    isLoading = false
}) => {
    const router = useRouter();

    return (
        <div className="max-w-[1000px] mx-auto pb-24 px-4 space-y-6">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 pt-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/backoffice/more')}
                        className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-white rounded-xl border border-slate-100 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">{title}</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{description}</p>
                    </div>
                </div>

                {onSave && (
                    <button
                        onClick={onSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Save className="w-4 h-4 text-emerald-400" />
                        Save Changes
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8">
                    {children}
                </div>
            </div>

            {/* Security Disclaimer */}
            <div className="pt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure Configuration Portal
            </div>
        </div>
    );
};
