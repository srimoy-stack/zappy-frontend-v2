/**
 * Module Registry — Central Merge
 *
 * Imports all per-module registries and produces a single flat array.
 * This is the ONLY place where the full registry is assembled.
 */

import type { RegistryNode } from '../types';

import { HOME_REGISTRY } from './home.registry';
import { POS_REGISTRY } from './pos.registry';
import { SALES_ACTIVITY_REGISTRY } from './salesActivity.registry';
import { REPORTS_REGISTRY } from './reports.registry';
import { ITEMS_REGISTRY } from './items.registry';
import { INVENTORY_REGISTRY } from './inventory.registry';
import { USERS_REGISTRY } from './users.registry';
import { CUSTOMERS_REGISTRY } from './customers.registry';
import { ONLINE_ORDERING_REGISTRY } from './onlineOrdering.registry';
import { KDS_REGISTRY } from './kds.registry';
import { CAMPAIGNS_REGISTRY } from './campaigns.registry';
import { AI_ANALYTICS_REGISTRY } from './aiAnalytics.registry';
import { FINANCES_REGISTRY } from './finances.registry';
import { SETTINGS_REGISTRY } from './settings.registry';
import { INTEGRATIONS_REGISTRY } from './integrations.registry';

/**
 * Complete module registry — all nodes, flat array.
 * Consumed by lookups.ts for precomputed maps.
 */
export const MODULE_REGISTRY: RegistryNode[] = [
    ...HOME_REGISTRY,
    ...POS_REGISTRY,
    ...SALES_ACTIVITY_REGISTRY,
    ...REPORTS_REGISTRY,
    ...ITEMS_REGISTRY,
    ...INVENTORY_REGISTRY,
    ...USERS_REGISTRY,
    ...CUSTOMERS_REGISTRY,
    ...ONLINE_ORDERING_REGISTRY,
    ...KDS_REGISTRY,
    ...CAMPAIGNS_REGISTRY,
    ...AI_ANALYTICS_REGISTRY,
    ...FINANCES_REGISTRY,
    ...SETTINGS_REGISTRY,
    ...INTEGRATIONS_REGISTRY,
];

// Re-export individual registries for direct access
export {
    HOME_REGISTRY,
    POS_REGISTRY,
    SALES_ACTIVITY_REGISTRY,
    REPORTS_REGISTRY,
    ITEMS_REGISTRY,
    INVENTORY_REGISTRY,
    USERS_REGISTRY,
    CUSTOMERS_REGISTRY,
    ONLINE_ORDERING_REGISTRY,
    KDS_REGISTRY,
    CAMPAIGNS_REGISTRY,
    AI_ANALYTICS_REGISTRY,
    FINANCES_REGISTRY,
    SETTINGS_REGISTRY,
    INTEGRATIONS_REGISTRY,
};
