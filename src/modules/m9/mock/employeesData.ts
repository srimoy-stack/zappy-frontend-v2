import { UserType } from '@/shared/types/auth';
import { Employee, Shift } from '../types/employees';

export const MOCK_EMPLOYEES: Employee[] = [
    {
        id: '1',
        name: 'John Admin',
        fullName: 'John Admin',
        email: 'john.admin@zyappy.com',
        userType: UserType.PLATFORM_SUPER_ADMIN,
        role: { id: 'sa', name: 'Super Admin', permissions: ['*'], isSystem: true },
        storeIds: [],
        tenantId: 'tenant-1',
        status: 'Active',
        lastLogin: '2024-03-20T10:00:00Z',
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        name: 'Jane Manager',
        fullName: 'Jane Manager',
        email: 'jane.manager@zyappy.com',
        userType: UserType.BRAND_ADMIN,
        role: { id: 'ba', name: 'Brand Admin', permissions: ['*'], isSystem: true },
        storeIds: ['store-1', 'store-2'],
        tenantId: 'tenant-1',
        status: 'Active',
        lastLogin: '2024-03-20T09:30:00Z',
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '3',
        name: 'Alice Cashier',
        fullName: 'Alice Cashier',
        email: 'alice.cashier@zyappy.com',
        userType: UserType.POS_USER,
        role: { id: 'pos', name: 'POS User', permissions: ['pos.*'], isSystem: false },
        storeIds: ['store-1'],
        tenantId: 'tenant-1',
        status: 'Active',
        lastLogin: '2024-03-20T08:00:00Z',
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '6',
        name: 'Diana Host',
        fullName: 'Diana Host',
        email: 'diana.host@zyappy.com',
        userType: UserType.POS_USER,
        role: { id: 'pos', name: 'POS User', permissions: ['pos.*'], isSystem: false },
        storeIds: ['store-1'],
        tenantId: 'tenant-1',
        status: 'Active',
        lastLogin: '2024-03-20T14:00:00Z',
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '7',
        name: 'Edward Manager',
        fullName: 'Edward Manager',
        email: 'edward@zyappy.com',
        userType: UserType.MANAGER,
        role: { id: 'sm', name: 'Store Manager', permissions: ['store.*'], isSystem: false },
        storeIds: ['store-2'],
        tenantId: 'tenant-1',
        status: 'Inactive',
        lastLogin: '2024-03-19T11:00:00Z',
        createdAt: '2024-01-01T00:00:00Z'
    }
];

export const MOCK_SHIFTS: Shift[] = [
    {
        id: 's1',
        date: '2024-03-20T08:00:00Z',
        userId: '3',
        userName: 'Alice Cashier',
        storeId: 'store-1',
        storeName: 'Main Street Store',
        openingCash: 500.00,
        closingCash: 1250.50,
        cashVariance: 0.50,
        notes: 'Busy morning session but balanced well.'
    },
    {
        id: 's2',
        date: '2024-03-19T08:00:00Z',
        userId: '3',
        userName: 'Alice Cashier',
        storeId: 'store-1',
        storeName: 'Main Street Store',
        openingCash: 500.00,
        closingCash: 1100.00,
        cashVariance: -2.00,
        notes: 'Minor variance due to coin shortage.'
    },
    {
        id: 's3',
        date: '2024-03-20T09:00:00Z',
        userId: '5',
        userName: 'Charlie Driver',
        storeId: 'store-2',
        storeName: 'Downtown Store',
        openingCash: 300.00,
        closingCash: 850.00,
        cashVariance: 0.00,
    },
    {
        id: 's4',
        date: '2024-03-21T08:30:00Z',
        userId: '2',
        userName: 'Jane Manager',
        storeId: 'store-1',
        storeName: 'Main Street Store',
        openingCash: 500.00,
        closingCash: 1500.00,
        cashVariance: 0.00,
    },
    {
        id: 's5',
        date: '2024-03-18T07:00:00Z',
        userId: '3',
        userName: 'Alice Cashier',
        storeId: 'store-1',
        storeName: 'Main Street Store',
        openingCash: 500.00,
        closingCash: 1195.00,
        cashVariance: -5.00,
        notes: 'Customer dispute over change.'
    }
];
