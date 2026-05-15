import React, { useEffect } from 'react';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { useRouter } from 'next/navigation';
;
import {
    ProfileSettings,
    EmployeeSettings,
    BusinessSettings,
    BillingSettings,
    OperationsSettings,
    TransactionsSettings,
    EcommerceSettings
} from '../components/Settings';
import { UserProfile } from '../types/settings';
import { Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

/**
 * M9-T8: Settings – Central Configuration Hub
 * Sectioned dashboard for brand and store management.
 */
export const SettingsPage: React.FC = () => {
    const { role, user } = useRouteAccess();
    const router = useRouter();

    // Access Control: Brand Admin Full, Store Manager Store-level, POS/KDS No access
    if (role === 'POS_USER' || role === 'KDS_USER' || role === 'EMPLOYEE') {
        useEffect(() => { router.replace('/backoffice/home'); }, [router]); return null;
    }

    const isAdmin = role === 'ADMIN';

    const mockProfile: UserProfile = {
        name: user?.name || 'John Doe',
        email: 'admin@zyappy.com',
        phone: '+1 (555) 123-4567',
        role: role || 'ADMIN',
        twoFactorEnabled: true
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                        <SettingsIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                                <ShieldCheck className="w-3 h-3 text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {isAdmin ? 'Full Access' : 'Store Managed'}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">Central configuration hub for brand and operations.</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* 1. Profile (Always accessible) */}
                <ProfileSettings profile={mockProfile} />

                {/* 2. Employees (Admin usually has full, Manager store-scoped) */}
                <EmployeeSettings />

                {/* 3. About Business */}
                <BusinessSettings />

                {/* 4. Billing */}
                <BillingSettings />

                {/* 5. Operations */}
                <OperationsSettings />

                {/* 6. Transactions */}
                <TransactionsSettings />

                {/* 7. Ecommerce */}
                <EcommerceSettings />
            </div>

            {/* Footer Disclaimer */}
            <div className="pt-12 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure Configuration Portal • Audit Logs Enabled
            </div>
        </div>
    );
};
