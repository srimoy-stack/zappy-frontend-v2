import React from 'react';
import { Settings2 } from 'lucide-react';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsItem } from '../../types/settings';

export const OperationsSettings: React.FC = () => {
    const items: SettingsItem[] = [
        { id: 'notifications', label: 'Notification Preferences', route: '/backoffice/more/operations/notifications' },
        { id: 'online-ordering', label: 'Online Ordering', route: '/backoffice/more/operations/online-ordering' },
        { id: 'reporting', label: 'Reporting', description: 'Customer & Schedule reporting', route: '/backoffice/more/operations/reporting' },
        { id: 'taxes', label: 'Taxes and Fees', route: '/backoffice/more/operations/taxes' },
        { id: 'additional-charges', label: 'Additional charges', route: '/backoffice/more/operations/charges' },
        { id: 'tips', label: 'Tips', route: '/backoffice/more/operations/tips' },
        { id: 'hours', label: 'Business hours', route: '/backoffice/more/operations/hours' },
        { id: 'menu', label: 'Menu settings', route: '/backoffice/more/operations/menu' },
        { id: 'devices', label: 'Devices and printers', route: '/backoffice/more/operations/devices' },
        { id: 'dine-in', label: 'Dine-in / QR ordering', route: '/backoffice/more/operations/qr-ordering' },
        { id: 'tokens', label: 'API tokens', route: '/backoffice/more/operations/tokens' },
    ];

    return (
        <SettingsSectionCard
            title="Business Operations"
            description="Fine-tune your daily operational workflow and service rules."
            items={items}
            icon={Settings2}
            iconColor="text-amber-500"
        />
    );
};
