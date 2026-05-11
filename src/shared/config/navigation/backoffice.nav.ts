import {
    Home, TrendingUp, FileText, DollarSign, Package, Users,
    UserCircle, MoreHorizontal, Warehouse, Settings, LayoutGrid,
    Mail, Phone
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
    requiredModule?: string;
    requiredPermission?: string;
    /** Dot-notated path for granular entitlement (e.g. 'email-campaigns.analytics') */
    entitlementId?: string;
    /** Sub-items for grouped navigation */
    children?: NavItem[];
}

export const backofficeNavigation: NavItem[] = [
    { id: 'home', label: 'Home', href: '/backoffice/home', icon: Home },
    { id: 'sales-activity', label: 'Sales Activity', href: '/backoffice/sales-activity', icon: TrendingUp },
    { id: 'orders', label: 'Orders', href: '/backoffice/orders', icon: FileText },
    { id: 'finances', label: 'Finances', href: '/backoffice/finances', icon: DollarSign },
    { id: 'items', label: 'Items', href: '/backoffice/items', icon: Package },
    { id: 'users', label: 'Users', href: '/backoffice/users', icon: Users },
    { id: 'customers', label: 'Customers', href: '/backoffice/customers', icon: UserCircle },
    { id: 'inventory', label: 'Inventory', href: '/backoffice/inventory', icon: Warehouse },
    { id: 'integrations', label: 'Integrations', href: '/backoffice/integrations', icon: LayoutGrid },
    { id: 'email-campaigns', label: 'Email Campaigns', href: '/backoffice/email-campaigns', icon: Mail, requiredModule: 'email-campaigns', requiredPermission: 'Manage campaigns' },
    { id: 'call-analytics', label: 'Call Analytics', href: '/backoffice/call-analytics', icon: Phone, requiredModule: 'ai-call-analytics', requiredPermission: 'View call analytics' },
    { id: 'settings', label: 'Settings', href: '/backoffice/settings', icon: MoreHorizontal },
];
