import React from 'react';
import { useRouter } from 'next/navigation';
;
import { ChevronRight, LucideIcon } from 'lucide-react';
import { SettingsItem } from '../../types/settings';

interface SettingsSectionCardProps {
    title: string;
    description: string;
    items: SettingsItem[];
    icon: LucideIcon;
    iconColor?: string;
}

export const SettingsSectionCard: React.FC<SettingsSectionCardProps> = ({
    title,
    description,
    items,
    icon: Icon,
    iconColor = 'text-slate-400'
}) => {
    const router = useRouter();

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 bg-white rounded-lg shadow-sm border border-slate-100 ${iconColor}`}>
                        <Icon size={18} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
            </div>

            {/* List */}
            <div className="flex-1 divide-y divide-slate-50">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => router.push(item.route)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left"
                    >
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                                {item.label}
                            </span>
                            {item.description && (
                                <span className="text-[10px] text-slate-400 font-medium">{item.description}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {item.badge && (
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-tighter border border-emerald-100">
                                    {item.badge}
                                </span>
                            )}
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
