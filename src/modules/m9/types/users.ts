export type UserType =
    | 'POS User'
    | 'Call Center User'
    | 'Kitchen User'
    | 'Manager User'
    | 'Admin User'
    | 'Delivery User';

export type UserStatus = 'Active' | 'Disabled';

export interface User {
    id: string;
    fullName: string;
    email: string;
    type: UserType;
    roleId: string;
    roleName: string; // Denormalized for display
    assignedStores: string[]; // Store IDs
    status: UserStatus;
    createdAt: string;
    lastLogin?: string;
}

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
    | 'Kiosk';

export interface Permission {
    id: string;
    name: string; // e.g. "View users"
    category: PermissionCategory;
    description?: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[]; // List of permission IDs/Names enabled
    isSystem?: boolean; // If true, cannot be deleted (optional but good practice)
    createdAt: string;
}

export interface AuditLog {
    id: string;
    action: 'User User' | 'User Role'; // "User created", etc. Simplified for type
    details: string;
    performedBy: string;
    timestamp: string;
}

export interface CreateUserDTO {
    fullName: string;
    email: string;
    type: UserType;
    roleId: string;
    assignedStores: string[];
}
