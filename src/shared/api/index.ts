/**
 * Shared API — Barrel Export
 */

export { apiClient, setApiTenantId, setApiStoreId } from './apiClient';
export { api } from './adapters';
export type { ApiAdapter } from './adapters';

// Service layer
export {
    tenantService,
    userService,
    roleService,
    storeService,
    moduleService,
} from './services';
