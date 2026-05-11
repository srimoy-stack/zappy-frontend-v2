import { cn } from '@/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
    label: string;
    value: string;
    secondaryInfo?: string;
    icon: LucideIcon;
    iconColor: string;
    isLoading?: boolean;
}

/**
 * KPI Card Component
 * Refined for Home Dashboard (M9-T0.2)
 * Features: White background, subtle border, compact height (~90-100px)
 */
export const KpiCard: React.FC<KpiCardProps> = ({
    label,
    value,
    secondaryInfo,
    icon: Icon,
    iconColor,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white border-r border-b border-slate-100 p-5 h-24 animate-pulse">
                <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded w-16"></div>
                    <div className="h-6 bg-slate-100 rounded w-24"></div>
                </div>
            </div>
        );
    }

    // Determine if value is negative (contains '-')
    const isNegative = value.includes('-');

    return (
        <div className="bg-white p-5 border-r border-b border-slate-100 flex flex-col justify-between group hover:bg-slate-50/50 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                        {label}
                    </p>
                    <div className={cn(
                        'text-2xl font-black tracking-tight',
                        isNegative ? 'text-red-600' : 'text-slate-900'
                    )}>
                        {value}
                    </div>
                </div>
                <div className={cn("p-2 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm", iconColor)}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>

            {(secondaryInfo || true) && (
                <div className="flex items-center gap-1.5 mt-2">
                    <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        isNegative ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                        {isNegative ? "↓ 2.4%" : "↑ 5.2%"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">vs yesterday</span>
                </div>
            )}
        </div>
    );
};
