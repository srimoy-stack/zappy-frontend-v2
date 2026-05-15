import React from 'react';
import { CreditCard } from 'lucide-react';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsItem } from '../../types/settings';

export const BillingSettings: React.FC = () => {
    const items: SettingsItem[] = [
        { id: 'statements', label: 'Monthly Statements', description: 'View and download history', route: '/backoffice/more/billing/statements' },
        { id: 'plan', label: 'Service Plan Details', description: 'Manage your subscription', route: '/backoffice/more/billing/plan', badge: 'Active' },
    ];

    return (
        <SettingsSectionCard
            title="Billing and Statements"
            description="Manage your subscription and view financial statements."
            items={items}
            icon={CreditCard}
            iconColor="text-rose-500"
        />
    );
};
