/**
 * Module Registry — Type Definitions
 *
 * Single source of truth for the entitlement hierarchy schema.
 * Every module, submodule, page, and future feature implements RegistryNode.
 */

import { UserType } from '@/shared/types/auth';

// ─── Node Classification ─────────────────────────────────────────────────────

export type NodeLevel = 'module' | 'submodule' | 'page' | 'feature';
export type NodeStatus = 'active' | 'deprecated' | 'coming-soon';
export type SidebarGroup = 'operations' | 'management' | 'channels' | 'marketing' | 'system';

// ─── Registry Node ────────────────────────────────────────────────────────────

export interface RegistryNode {
    // ── Identity ─────────────────────────────────────────
    id: string;                        // Dot-notated: 'pos.terminal.new-sale'
    label: string;                     // Display: 'New Sale'
    description?: string;              // Tooltip / help text
    icon?: string;                     // Lucide icon name: 'ShoppingCart'

    // ── Hierarchy ────────────────────────────────────────
    parentId: string | null;           // null = root module
    moduleKey: string;                 // Root module key: 'pos'
    level: NodeLevel;
    sortOrder: number;

    // ── Routing ──────────────────────────────────────────
    route?: string;                    // URL: '/backoffice/items'
    routePrefix?: string;              // '/backoffice' | '/kds' | '/pos'

    // ── Authorization ────────────────────────────────────
    entitlementKey: string;            // Same as id
    allowedUserTypes?: UserType[];     // Restrict to specific user types
    requiredPermissions?: string[];    // RBAC permissions

    // ── Dependencies ─────────────────────────────────────
    dependsOn?: string[];              // Other module IDs

    // ── Flags ────────────────────────────────────────────
    isCore: boolean;                   // Cannot be disabled (POS)
    isSystem: boolean;                 // Hidden from onboarding UI (Settings)
    isBeta: boolean;                   // Feature-flagged
    isProtected?: boolean;             // Never disabled: login/billing/audit
    status: NodeStatus;

    // ── Sidebar ──────────────────────────────────────────
    showInSidebar: boolean;
    sidebarGroup?: SidebarGroup;

    // ── Future-Ready ─────────────────────────────────────
    storeScoped?: boolean;             // Future store-level gating
    billingTier?: string;              // Future subscription tier
}

// ─── Resolved Navigation Item ─────────────────────────────────────────────────

export interface ResolvedNavItem {
    id: string;
    label: string;
    href: string;
    icon: string;
    entitlementKey: string;
    accessLevel: 'full' | 'read-only';
    children?: ResolvedNavItem[];
}

// ─── Convenience Types ────────────────────────────────────────────────────────

export type ModuleRegistryMap = Map<string, RegistryNode>;

/** Represents a tenant's active entitlement configuration */
export interface TenantEntitlementConfig {
    tenantId: string;
    storeId?: string;                  // null = tenant-wide
    entitlementPaths: string[];
    enabledModules: string[];          // Derived: root module IDs
    updatedAt: string;
    updatedBy: string;
}
