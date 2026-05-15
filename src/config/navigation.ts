import {
    Home,
    TrendingUp,
    FileText,
    DollarSign,
    Package,
    Users,
    UserCircle,
    MoreHorizontal,
    Warehouse,
    Settings,
    LayoutGrid,
    Building2,
    Monitor,
    Tv,
    Mail,
    Phone
} from 'lucide-react';
import { UserRole, ModuleId } from '@/types';

export type AccessMode = 'full' | 'read-only' | 'hidden';

export interface MenuConfig {
    id: string;
    label: string;
    route: string;
    icon: string;
    allowedRoles: UserRole[];
    // Map role to its specific access mode on this page
    accessMode: Partial<Record<UserRole, AccessMode>>;
    requiresStoreScope: boolean;
    requiredModule?: ModuleId;
}

/**
 * Production-grade Navigation Configuration
 */
export const navigationConfig: MenuConfig[] = [
    {
        id: 'home',
        label: 'Home',
        route: '/backoffice/home',
        icon: 'Home',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full'
        },
        requiresStoreScope: false
    },
    {
        id: 'sales-activity',
        label: 'Sales Activity',
        route: '/backoffice/sales-activity',
        icon: 'TrendingUp',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER', 'EMPLOYEE'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full',
            EMPLOYEE: 'read-only'
        },
        requiresStoreScope: true
    },
    {
        id: 'reports',
        label: 'Reports',
        route: '/backoffice/reports',
        icon: 'FileText',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'read-only'
        },
        requiresStoreScope: true
    },
    {
        id: 'finances',
        label: 'Finances',
        route: '/backoffice/finances',
        icon: 'DollarSign',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full'
        },
        requiresStoreScope: true
    },
    {
        id: 'items',
        label: 'Items',
        route: '/backoffice/items',
        icon: 'Package',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER', 'EMPLOYEE'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full',
            EMPLOYEE: 'read-only'
        },
        requiresStoreScope: true
    },
    {
        id: 'employees',
        label: 'Users',
        route: '/backoffice/users',
        icon: 'Users',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER', 'EMPLOYEE'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full',
            EMPLOYEE: 'read-only'
        },
        requiresStoreScope: true
    },
    {
        id: 'customers',
        label: 'Customers',
        route: '/backoffice/customers',
        icon: 'UserCircle',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER', 'EMPLOYEE'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full',
            EMPLOYEE: 'read-only'
        },
        requiresStoreScope: true
    },
    // ── Marketing / Customer Engagement ──────────────────────────────────
    {
        id: 'email-campaigns',
        label: 'Email Campaigns',
        route: '/backoffice/email-campaigns',
        icon: 'Mail',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full'
        },
        requiresStoreScope: false,
        requiredModule: 'email-campaigns'
    },
    // ── AI Call Analytics ────────────────────────────────────────────────
    {
        id: 'call-analytics',
        label: 'Call Analytics',
        route: '/backoffice/call-analytics',
        icon: 'Phone',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full'
        },
        requiresStoreScope: false,
        requiredModule: 'analytics'
    },
    {
        id: 'inventory',
        label: 'Inventory',
        route: '/backoffice/inventory',
        icon: 'Warehouse',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full'
        },
        requiresStoreScope: true,
        requiredModule: 'inventory'
    },
    {
        id: 'web-shop',
        label: 'Web Shop',
        route: '/backoffice/shop',
        icon: 'LayoutGrid',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full'
        },
        requiresStoreScope: false,
        requiredModule: 'web-shop'
    },
    {
        id: 'integrations',
        label: 'Integrations',
        route: '/backoffice/settings/integrations',
        icon: 'LayoutGrid',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full'
        },
        requiresStoreScope: false
    },
    {
        id: 'business-operations',
        label: 'Business Settings',
        route: '/backoffice/settings/business-operations',
        icon: 'Settings',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full'
        },
        requiresStoreScope: false
    },
    {
        id: 'more',
        label: 'More',
        route: '/backoffice/more',
        icon: 'MoreHorizontal',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full'
        },
        requiresStoreScope: false
    },

    // ── Platform Section (PLATFORM_SUPER_ADMIN only) ────────────────────
    {
        id: 'platform-brands',
        label: 'Brands',
        route: '/platform/brands',
        icon: 'Building2',
        allowedRoles: ['PLATFORM_SUPER_ADMIN'],
        accessMode: {
            PLATFORM_SUPER_ADMIN: 'full'
        },
        requiresStoreScope: false
    },
    // ── KDS Section ─────────────────────────────────────────────────────
    {
        id: 'kds-master',
        label: 'KDS Master',
        route: '/kds/master',
        icon: 'Monitor',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER', 'KDS_USER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full',
            KDS_USER: 'full'
        },
        requiresStoreScope: true,
        requiredModule: 'kds'
    },
    {
        id: 'kds-expo',
        label: 'KDS Expo',
        route: '/kds/expo',
        icon: 'Tv',
        allowedRoles: ['BRAND_ADMIN', 'ADMIN', 'STORE_MANAGER', 'KDS_USER'],
        accessMode: {
            BRAND_ADMIN: 'full',
            ADMIN: 'full',
            STORE_MANAGER: 'full',
            KDS_USER: 'full'
        },
        requiresStoreScope: true,
        requiredModule: 'kds'
    }
];

// Icon mapping for dynamic rendering
export const iconMap = {
    Home,
    TrendingUp,
    FileText,
    DollarSign,
    Package,
    Users,
    UserCircle,
    MoreHorizontal,
    Warehouse,
    Settings,
    LayoutGrid,
    Building2,
    Monitor,
    Tv,
    Mail,
    Phone
};
