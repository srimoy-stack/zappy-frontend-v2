/**
 * Module Entitlement Types — Single Source of Truth
 *
 * Module IDs are dynamic strings fetched from the API.
 * The union type below is for known modules only and is extensible.
 */

export type KnownModuleId =
    | 'pos'
    | 'inventory'
    | 'kiosk'
    | 'loyalty'
    | 'analytics'
    | 'web-shop'
    | 'kds'
    | 'email-campaigns'
    | 'messaging'
    | 'ai-call-analytics';

/** Granular page/feature entitlement */
export interface ModulePage {
    id: string;
    name: string;
    enabled: boolean;
}

/** Submodule entitlement (e.g. Analytics under Email Campaigns) */
export interface SubModule {
    id: string;
    name: string;
    enabled: boolean;
    pages?: ModulePage[];
}

/** Module entitlement record from GET /tenant-modules or GET /me */
export interface TenantModule {
    id: string;
    moduleId: string;
    name: string;
    purchased: boolean;
    enabled: boolean;
    startDate: string | null;
    notes?: string;
    isCore?: boolean;
    subModules?: SubModule[];
}
