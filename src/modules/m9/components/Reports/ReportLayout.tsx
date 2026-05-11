import React from 'react';
import { useRouter } from 'next/navigation';
;
import { ChevronLeft } from 'lucide-react';

interface ReportLayoutProps {
    title: string;
    subtitle?: string;
    dateRangeDisplay?: string;
    children: React.ReactNode;
}

export const ReportLayout: React.FC<ReportLayoutProps> = ({
    title,
    subtitle,
    dateRangeDisplay,
    children
}) => {
    const router = useRouter();

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20 px-4">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 pt-2">
                <button
                    onClick={() => router.push('/backoffice/reports')}
                    className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors w-fit"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to Reports
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            {subtitle && (
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">
                                    {subtitle}
                                </p>
                            )}
                            {dateRangeDisplay && (
                                <>
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                                        {dateRangeDisplay}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {children}
        </div>
    );
};
