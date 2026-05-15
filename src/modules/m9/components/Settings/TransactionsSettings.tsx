import React from 'react';
import { Receipt } from 'lucide-react';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsItem } from '../../types/settings';

export const TransactionsSettings: React.FC = () => {
    const items: SettingsItem[] = [
        { id: 'orders', label: 'Orders', route: '/backoffice/more/transactions/orders' },
        { id: 'order-receipts', label: 'Order receipts', route: '/backoffice/more/transactions/order-receipts' },
        { id: 'order-types', label: 'Order types', route: '/backoffice/more/transactions/order-types' },
        { id: 'payments', label: 'Payments', route: '/backoffice/more/transactions/payments' },
        { id: 'payment-receipts', label: 'Payment receipts', route: '/backoffice/more/transactions/payment-receipts' },
        { id: 'virtual-terminal', label: 'Virtual terminal', route: '/backoffice/more/transactions/virtual-terminal' },
    ];

    return (
        <SettingsSectionCard
            title="Transactions"
            description="Configure how orders and payments are handled and recorded."
            items={items}
            icon={Receipt}
            iconColor="text-cyan-500"
        />
    );
};
