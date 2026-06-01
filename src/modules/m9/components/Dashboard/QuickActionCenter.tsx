import React from 'react';
import { 
    Plus, 
    Building2, 
    Globe, 
    Settings, 
    UserPlus, 
    Percent, 
    Sliders, 
    RefreshCcw 
} from 'lucide-react';
import { cn } from '@/utils';

interface QuickActionCenterProps {
    onCreateProduct: () => void;
    onAddStore: () => void;
    onPublishMenu: () => void;
    onConfigureIntegrations: () => void;
    onAddStaff: () => void;
    onCreateOffer: () => void;
    onManageSettings: () => void;
    onRetrySync: () => void;
}

export const QuickActionCenter: React.FC<QuickActionCenterProps> = ({
    onCreateProduct,
    onAddStore,
    onPublishMenu,
    onConfigureIntegrations,
    onAddStaff,
    onCreateOffer,
    onManageSettings,
    onRetrySync
}) => {
    const actions = [
        { label: 'Create Product', desc: 'Add item to catalog', icon: Plus, color: 'bg-blue-50 text-blue-600 border-blue-100', handler: onCreateProduct },
        { label: 'Add Store', desc: 'Onboard new physical outlet', icon: Building2, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', handler: onAddStore },
        { label: 'Publish Menu', desc: 'Sync catalogs to food aggregators', icon: Globe, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', handler: onPublishMenu },
        { label: 'Integrations', desc: 'Manage POS & delivery channels', icon: Settings, color: 'bg-purple-50 text-purple-600 border-purple-100', handler: onConfigureIntegrations },
        { label: 'Add Staff', desc: 'Register employee & assign roles', icon: UserPlus, color: 'bg-teal-50 text-teal-600 border-teal-100', handler: onAddStaff },
        { label: 'Create Offer', desc: 'Campaign coupons & promos', icon: Percent, color: 'bg-rose-50 text-rose-600 border-rose-100', handler: onCreateOffer },
        { label: 'Global Settings', desc: 'Brand-level config scopes', icon: Sliders, color: 'bg-slate-50 text-slate-600 border-slate-100', handler: onManageSettings },
        { label: 'Sync Payload', desc: 'Force active POS flush', icon: RefreshCcw, color: 'bg-amber-50 text-amber-600 border-amber-100', handler: onRetrySync },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">
                Administrative Control Panel
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={action.handler}
                            className="p-5 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex items-start gap-4 active:scale-[0.98] group duration-300"
                        >
                            <div className={cn(
                                "p-2.5 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-105",
                                action.color
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <span className="text-xs font-black text-slate-800 tracking-tight block truncate">{action.label}</span>
                                <span className="text-[10px] text-slate-400 font-bold block leading-relaxed">{action.desc}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
