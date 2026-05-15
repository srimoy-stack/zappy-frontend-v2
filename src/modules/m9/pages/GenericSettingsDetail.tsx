import React from 'react';
import { useParams } from 'next/navigation';
;
import { SettingsLayout } from '../components/Settings/SettingsLayout';
import { Clock, Bell, Globe, Percent, Printer, ShieldAlert, Key } from 'lucide-react';

const CONFIG_SCHEMA: Record<string, { title: string, description: string, icon: any }> = {
    'notifications': { title: 'Notification Preferences', description: 'Configure system alerts and push notifications.', icon: Bell },
    'online-ordering': { title: 'Online Ordering', description: 'Enable or disable digital sales channels.', icon: Globe },
    'taxes': { title: 'Taxes and Fees', description: 'Manage regional tax rates and service charges.', icon: Percent },
    'hours': { title: 'Business Hours', description: 'Define operational availability for each store.', icon: Clock },
    'devices': { title: 'Devices and Printers', description: 'Manage hardware connections and receipt routing.', icon: Printer },
    'tokens': { title: 'API Tokens', description: 'Integrate 3rd party services via secure tokens.', icon: Key },
    'fraud': { title: 'Fraud & Security', description: 'Configure payment protection and risk rules.', icon: ShieldAlert },
};

export const GenericSettingsDetail: React.FC = () => {
    const { subItem } = useParams<{ subItem: string }>();
    // const router = useRouter();
    const config = CONFIG_SCHEMA[subItem || ''] || {
        title: 'Settings Configuration',
        description: 'Manage advanced system parameters.',
        icon: ShieldAlert
    };

    const handleSave = () => {
        alert(`${config.title} updated successfully (Mock)`);
    };

    return (
        <SettingsLayout
            title={config.title}
            description={config.description}
            onSave={handleSave}
        >
            <div className="space-y-8 py-10">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-slate-400">
                        <config.icon size={48} strokeWidth={1.5} />
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Configuration Module</h2>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2 uppercase tracking-wide">
                            The {config.title} management interface is fully compliant with the Backoffice architectural core.
                            All parameters are rule-driven and validated on the server.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-8">
                    {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 flex items-center justify-between group hover:bg-white hover:border-slate-900 transition-all cursor-pointer">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parameter 0{idx}</span>
                                <span className="text-sm font-bold text-slate-700 uppercase">System Default</span>
                            </div>
                            <div className="w-8 h-4 bg-slate-200 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3"></div>
                        </div>
                    ))}
                </div>
            </div>
        </SettingsLayout>
    );
};
