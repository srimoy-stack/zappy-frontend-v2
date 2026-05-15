import { UserRole } from '@/types';

export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type UserType = 'BACKEND_USER' | 'POS_USER' | 'KDS_USER';

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    stores: string[]; // Store names or IDs
    status: UserStatus;
    lastLogin: string; // ISO string
    type: UserType;
}

export interface Shift {
    id: string;
    date: string; // ISO string
    userId: string;
    userName: string;
    storeId: string;
    storeName: string;
    openingCash: number;
    closingCash: number;
    cashVariance: number;
    notes?: string;
}
