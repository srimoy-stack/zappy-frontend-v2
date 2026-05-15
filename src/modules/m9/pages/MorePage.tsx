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
import { MoreHorizontal, ShieldCheck } from 'lucide-react';

/**
 * More Page (M9-T8 Integration)
 * Acts as the Central Configuration Hub.
 */
export const MorePage: React.FC = () => {
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
                        <MoreHorizontal className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">More & Settings</h1>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                                <ShieldCheck className="w-3 h-3 text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {isAdmin ? 'Full Access' : 'Store Managed'}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">Unified configuration for operations and accounts.</p>
                    </div>
                </div>
            </div>

            {/* Config Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <ProfileSettings profile={mockProfile} />
                <EmployeeSettings />
                <BusinessSettings />
                <BillingSettings />
                <OperationsSettings />
                <TransactionsSettings />
                <EcommerceSettings />
            </div>

            <div className="pt-12 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure Portal • System Configuration
            </div>
        </div>
    );
};
