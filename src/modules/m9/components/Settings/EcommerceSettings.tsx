import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsItem } from '../../types/settings';

export const EcommerceSettings: React.FC = () => {
    const items: SettingsItem[] = [
        { id: 'ecommerce-payments', label: 'Ecommerce payments', route: '/backoffice/more/ecommerce/payments' },
        { id: 'ecommerce-tokens', label: 'Ecommerce API tokens', route: '/backoffice/more/ecommerce/tokens' },
        { id: 'hosted-checkout', label: 'Hosted checkout', route: '/backoffice/more/ecommerce/checkout' },
        { id: 'custom-fields', label: 'Custom fields', route: '/backoffice/more/ecommerce/fields' },
        { id: 'payment-links', label: 'Payment links', route: '/backoffice/more/ecommerce/links' },
        { id: 'fraud-tools', label: 'Fraud tools', route: '/backoffice/more/ecommerce/fraud' },
    ];

    return (
        <SettingsSectionCard
            title="Ecommerce"
            description="Control your online storefront and digital payment experience."
            items={items}
            icon={ShoppingCart}
            iconColor="text-indigo-500"
        />
    );
};
