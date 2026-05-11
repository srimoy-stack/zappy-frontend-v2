import React from 'react';
import { Building2 } from 'lucide-react';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsItem } from '../../types/settings';

export const BusinessSettings: React.FC = () => {
    const items: SettingsItem[] = [
        { id: 'business-ops', label: 'Business Operations', description: 'Business info, localization, taxes, and modules', route: '/backoffice/settings/business-operations' },
        { id: 'merchants', label: 'Merchants', description: 'Manage brand locations and settings', route: '/backoffice/more/merchants' },
    ];

    return (
        <SettingsSectionCard
            title="About Your Business"
            description="Manage your business identity and financial accounts."
            items={items}
            icon={Building2}
            iconColor="text-emerald-500"
        />
    );
};
