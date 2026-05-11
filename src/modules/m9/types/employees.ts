/**
 * m9/types/employees.ts — Compatibility Shim
 *
 * Re-exports shared canonical types. DO NOT define new types here.
 * Shift is kept as a legacy-only type until migrated.
 */

export { UserRole } from '@/shared/types/user';
export type { UserStatus, UserType } from '@/shared/types/user';

// Employee is an alias for User in the new architecture
export type { User as Employee } from '@/shared/types/user';

// ─── Legacy-only types ──────────────────────────────────────────────────────
export interface Shift {
    id: string;
    date: string;
    userId: string;
    userName: string;
    storeId: string;
    storeName: string;
    openingCash: number;
    closingCash: number;
    cashVariance: number;
    notes?: string;
}
