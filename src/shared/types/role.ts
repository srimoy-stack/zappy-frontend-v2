/**
 * Role & Permission Types — Single Source of Truth
 */

export type PermissionCategory =
    | 'User Roles'
    | 'Customers'
    | 'Items'
    | 'Inventory'
    | 'Finances'
    | 'Reports'
    | 'POS'
    | 'Online Ordering'
    | 'Kitchen (KDS)'
    | 'Taxes'
    | 'Settings'
    | 'Kiosk'
    | 'Marketing'
    | 'KDS';

export interface Permission {
    id: string;
    name: string;
    category: PermissionCategory;
    description?: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[]; // permission IDs or dotted strings e.g. "users.create"
    isSystem?: boolean;
    createdAt: string;
}

/** DTO for POST /roles */
export interface CreateRoleDTO {
    name: string;
    description?: string;
    permissions: string[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
    'User Roles', 'Customers', 'Items', 'Inventory', 'Finances', 'Reports',
    'POS', 'Online Ordering', 'Kitchen (KDS)', 'Taxes', 'Settings', 'Kiosk', 'Marketing', 'KDS'
];

export const AVAILABLE_PERMISSIONS: { category: PermissionCategory; actions: string[] }[] = [
    { category: 'User Roles', actions: ['View users', 'Add user', 'Edit user', 'Disable user', 'Assign roles', 'View roles', 'Create role', 'Edit role', 'Delete role'] },
    { category: 'Customers', actions: ['View customers', 'Add customer', 'Edit customer', 'Delete customer', 'View order history', 'Add customer notes', 'Block / blacklist customer'] },
    { category: 'Items', actions: ['View items', 'Add product', 'Edit product', 'Delete product', 'Manage variants', 'Manage modifiers', 'Update pricing', 'Assign categories'] },
    { category: 'Inventory', actions: ['View inventory', 'Add inventory item', 'Edit inventory item', 'Delete inventory item', 'Stock adjustment', 'Waste / damage entry', 'Recipe management', 'Low stock alerts'] },
    { category: 'Finances', actions: ['View transactions', 'Issue refund', 'Partial refund', 'Void transaction', 'View payment methods', 'Manage service charges', 'View settlement reports', 'Process payouts', 'View cash flow', 'Manage bank accounts'] },
    { category: 'Reports', actions: ['View sales reports', 'View tax reports', 'View inventory reports', 'View staff performance', 'Export reports (CSV / Excel / PDF)', 'View labor reports', 'View discount reports', 'View audit trail reports', 'View customer analytics', 'Schedule automated reports'] },
    { category: 'POS', actions: ['Access POS screen', 'Create order', 'Edit order', 'Apply discount', 'Override price', 'Cancel order', 'Reprint receipt', 'Open cash drawer', 'Split payment', 'Hold / recall order'] },
    { category: 'Online Ordering', actions: ['View online orders', 'Accept / reject orders', 'Edit online order', 'Manage delivery / pickup status', 'Pause online ordering', 'Manage time slots'] },
    { category: 'Kitchen (KDS)', actions: ['Access KDS screen', 'View incoming orders', 'Change item status (Preparing / Ready)', 'Recall order', 'Re-fire item', 'Mark order complete', 'View preparation time', 'Route orders to stations'] },
    { category: 'Taxes', actions: ['View tax rules', 'Add tax', 'Edit tax', 'Delete tax', 'Assign tax to items / locations'] },
    { category: 'Settings', actions: ['View settings', 'Edit store settings', 'Manage payment settings', 'Manage printers / hardware', 'Manage integrations', 'Access audit logs'] },
    { category: 'Kiosk', actions: ['Enable / disable kiosk', 'Configure kiosk menu', 'Set kiosk pricing', 'Restrict payment types', 'View kiosk orders', 'Reset kiosk session'] },
    { category: 'Marketing', actions: ['View call analytics', 'Manage campaigns', 'Manage segments', 'View performance metrics'] },
    { category: 'KDS', actions: ['KDS_ORDER_VIEW', 'KDS_BUMP_ITEM', 'KDS_REFIRE', 'KDS_RECALL', 'KDS_MARK_READY', 'KDS_STATION_MANAGEMENT', 'KDS_MASTER_VIEW', 'KDS_ANALYTICS', 'KDS_SETTING_EDIT', 'KDS_ORDER_HISTORY', 'KDS_SHIFT_MANAGEMENT'] }
];
