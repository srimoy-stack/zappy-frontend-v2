import { useTenantStore } from '../../app/providers/TenantStoreProvider';
import { Building2, ChevronDown, MapPin } from 'lucide-react';

export const Header = () => {
    const { store, tenant } = useTenantStore();

    return (
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-800">{tenant?.name}</span>
                    </div>
                    <span className="text-slate-300">/</span>
                    <div className="flex items-center gap-1.5 group cursor-pointer hover:text-slate-900 transition-colors">
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        <span className="font-medium">{store?.name}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    {store?.code && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-500 border border-slate-200 ml-1">
                            {store.code}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Future: Notifications, Help, etc. */}
            </div>
        </header>
    );
};
