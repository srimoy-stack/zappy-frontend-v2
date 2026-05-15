import { User, Role, PermissionCategory, AuditLog, CreateUserDTO } from '../types/users';

// ============================================================================
// CONSTANTS & SEED DATA
// ============================================================================

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
    'User Roles', 'Customers', 'Items', 'Inventory', 'Finances', 'Reports',
    'POS', 'Online Ordering', 'Kitchen (KDS)', 'Taxes', 'Settings', 'Kiosk'
];

export const AVAILABLE_PERMISSIONS: { category: PermissionCategory; actions: string[] }[] = [
    { category: 'User Roles', actions: ['View users', 'Add user', 'Edit user', 'Disable user', 'Assign roles', 'View roles', 'Create role', 'Edit role', 'Delete role'] },
    { category: 'Customers', actions: ['View customers', 'Add customer', 'Edit customer', 'Delete customer', 'View order history', 'Add customer notes', 'Block / blacklist customer'] },
    { category: 'Items', actions: ['View items', 'Add product', 'Edit product', 'Delete product', 'Manage variants', 'Manage modifiers', 'Update pricing', 'Assign categories'] },
    { category: 'Inventory', actions: ['View inventory', 'Add inventory item', 'Edit inventory item', 'Delete inventory item', 'Stock adjustment', 'Waste / damage entry', 'Recipe management', 'Low stock alerts'] },
    { category: 'Finances', actions: ['View transactions', 'Issue refund', 'Partial refund', 'Void transaction', 'View payment methods', 'Manage service charges', 'View settlement reports'] },
    { category: 'Reports', actions: ['View sales reports', 'View tax reports', 'View inventory reports', 'View staff performance', 'Export reports (CSV / Excel / PDF)'] },
    { category: 'POS', actions: ['Access POS screen', 'Create order', 'Edit order', 'Apply discount', 'Override price', 'Cancel order', 'Reprint receipt', 'Open cash drawer', 'Split payment', 'Hold / recall order'] },
    { category: 'Online Ordering', actions: ['View online orders', 'Accept / reject orders', 'Edit online order', 'Manage delivery / pickup status', 'Pause online ordering', 'Manage time slots'] },
    { category: 'Kitchen (KDS)', actions: ['Access KDS screen', 'View incoming orders', 'Change item status (Preparing / Ready)', 'Recall order', 'Re-fire item', 'Mark order complete', 'View preparation time', 'Route orders to stations'] },
    { category: 'Taxes', actions: ['View tax rules', 'Add tax', 'Edit tax', 'Delete tax', 'Assign tax to items / locations'] },
    { category: 'Settings', actions: ['View settings', 'Edit store settings', 'Manage payment settings', 'Manage printers / hardware', 'Manage integrations', 'Access audit logs'] },
    { category: 'Kiosk', actions: ['Enable / disable kiosk', 'Configure kiosk menu', 'Set kiosk pricing', 'Restrict payment types', 'View kiosk orders', 'Reset kiosk session'] }
];

// Initial Roles (Seed)
const INITIAL_ROLES: Role[] = [
    {
        id: 'ROLE_PLATFORM_ADMIN',
        name: 'Platform Super Admin',
        description: 'Global system access',
        permissions: AVAILABLE_PERMISSIONS.flatMap(g => g.actions),
        isSystem: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'ROLE_BRAND_ADMIN',
        name: 'Brand Admin',
        description: 'Brand-level administrative access',
        permissions: AVAILABLE_PERMISSIONS.flatMap(g => g.actions),
        isSystem: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'ROLE_ADMIN',
        name: 'Admin',
        description: 'Full system access',
        permissions: AVAILABLE_PERMISSIONS.flatMap(g => g.actions),
        isSystem: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'ROLE_MANAGER',
        name: 'Store Manager',
        description: 'Manage store operations',
        permissions: ['View users', 'Add user', 'Edit user', 'View reports', 'Access POS screen', 'View inventory'],
        createdAt: new Date().toISOString()
    },
    {
        id: 'ROLE_CASHIER',
        name: 'POS Cashier',
        description: 'Front of house staff',
        permissions: ['Access POS screen', 'Create order', 'View customers'],
        createdAt: new Date().toISOString()
    },
    {
        id: 'ROLE_KITCHEN',
        name: 'Kitchen Staff',
        description: 'Back of house cooking staff',
        permissions: ['Access KDS screen', 'View incoming orders', 'Change item status (Preparing / Ready)'],
        createdAt: new Date().toISOString()
    },
    {
        id: 'ROLE_CALL_CENTER',
        name: 'Call Agent',
        description: 'Remote order taking',
        permissions: ['Create order', 'View customers', 'View items'],
        createdAt: new Date().toISOString()
    }
];

// Initial Users (Seed)
const INITIAL_USERS: User[] = [
    {
        id: 'USER_001',
        fullName: 'System Admin',
        email: 'admin@zyappy.com',
        type: 'Admin User',
        roleId: 'ROLE_ADMIN',
        roleName: 'Admin',
        assignedStores: ['All'],
        status: 'Active',
        createdAt: new Date().toISOString()
    },
    {
        id: 'USER_002',
        fullName: 'Sarah Manager',
        email: 'sarah@store1.com',
        type: 'Manager User',
        roleId: 'ROLE_MANAGER',
        roleName: 'Store Manager',
        assignedStores: ['STORE_001'],
        status: 'Active',
        createdAt: new Date().toISOString()
    },
    {
        id: 'USER_003',
        fullName: 'David Cashier',
        email: 'david@store1.com',
        type: 'POS User',
        roleId: 'ROLE_CASHIER',
        roleName: 'POS Cashier',
        assignedStores: ['STORE_001'],
        status: 'Active',
        createdAt: new Date().toISOString()
    },
    {
        id: 'USER_004',
        fullName: 'Mike Chef',
        email: 'mike@kitchen.com',
        type: 'Kitchen User',
        roleId: 'ROLE_KITCHEN',
        roleName: 'Kitchen Staff',
        assignedStores: ['STORE_001'],
        status: 'Active',
        createdAt: new Date().toISOString()
    }
];

// ============================================================================
// MOCK STATE (In-Memory)
// ============================================================================

let roles_store = [...INITIAL_ROLES];
let users_store = [...INITIAL_USERS];
let auditLogs_store: AuditLog[] = [];

// ============================================================================
// SERVICE
// ============================================================================

export const userService = {
    // USERS
    getUsers: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...users_store];
    },

    createUser: async (data: CreateUserDTO) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (users_store.some(u => u.email === data.email)) {
            throw new Error('Email already exists');
        }

        const role = roles_store.find(r => r.id === data.roleId);
        if (!role) throw new Error('Invalid Role ID');

        const newUser: User = {
            id: `USER_${Date.now()}`,
            ...data,
            roleName: role.name,
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        users_store = [newUser, ...users_store];

        auditLogs_store.unshift({
            id: `LOG_${Date.now()}`,
            action: 'User User',
            details: `Created user ${newUser.fullName} (${newUser.type})`,
            performedBy: 'Current User',
            timestamp: new Date().toISOString()
        });

        return newUser;
    },

    updateUser: async (id: string, data: Partial<User>) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const idx = users_store.findIndex(u => u.id === id);
        if (idx === -1) throw new Error('User not found');

        const currentUser = users_store[idx];

        if (!currentUser) throw new Error('User not found');
        let roleName = currentUser.roleName;
        if (data.roleId) {
            const role = roles_store.find(r => r.id === data.roleId);
            if (role) roleName = role.name;
        }

        const updatedUser = { ...currentUser, ...data, roleName } as User;
        users_store[idx] = updatedUser;

        auditLogs_store.unshift({
            id: `LOG_${Date.now()}`,
            action: 'User User',
            details: `Updated user ${updatedUser.fullName}`,
            performedBy: 'Current User',
            timestamp: new Date().toISOString()
        });

        return updatedUser;
    },

    toggleUserStatus: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const idx = users_store.findIndex(u => u.id === id);
        if (idx === -1) throw new Error('User not found');

        const user = users_store[idx];
        if (!user) throw new Error('User not found');
        const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
        user.status = newStatus;

        auditLogs_store.unshift({
            id: `LOG_${Date.now()}`,
            action: 'User User',
            details: `${newStatus === 'Active' ? 'Enabled' : 'Disabled'} user ${user.fullName}`,
            performedBy: 'Current User',
            timestamp: new Date().toISOString()
        });

        return user;
    },

    // ROLES
    getRoles: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...roles_store];
    },

    createRole: async (data: Omit<Role, 'id' | 'createdAt' | 'isSystem'>) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newRole: Role = {
            id: `ROLE_${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString()
        };
        roles_store = [newRole, ...roles_store];

        auditLogs_store.unshift({
            id: `LOG_${Date.now()}`,
            action: 'User Role',
            details: `Created role ${newRole.name}`,
            performedBy: 'Current User',
            timestamp: new Date().toISOString()
        });

        return newRole;
    },

    updateRole: async (id: string, data: Partial<Role>) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const idx = roles_store.findIndex(r => r.id === id);
        if (idx === -1) throw new Error('Role not found');

        const currentRole = roles_store[idx];
        if (!currentRole) throw new Error('Role not found');
        if (currentRole.isSystem) throw new Error('Cannot edit system roles');

        const updatedRole = { ...currentRole, ...data } as Role;
        roles_store[idx] = updatedRole;

        auditLogs_store.unshift({
            id: `LOG_${Date.now()}`,
            action: 'User Role',
            details: `Updated role ${updatedRole.name}`,
            performedBy: 'Current User',
            timestamp: new Date().toISOString()
        });

        return updatedRole;
    },

    deleteRole: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const role = roles_store.find(r => r.id === id);
        if (!role) throw new Error('Role not found');
        if (role.isSystem) throw new Error('Cannot delete system roles');

        const assigned = users_store.some(u => u.roleId === id);
        if (assigned) throw new Error('Cannot delete role assigned to users');

        roles_store = roles_store.filter(r => r.id !== id);
        return true;
    },

    // AUDIT
    getAuditLogs: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [...auditLogs_store];
    }
};
