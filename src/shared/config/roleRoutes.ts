/**
 * Role Routes — Re-exports from canonical auth.ts
 *
 * This file now re-exports from the canonical source.
 * Existing imports from '@/shared/config/roleRoutes' continue to work.
 *
 * @deprecated Import directly from '@/shared/types/auth' for new code.
 */

export {
    UserRole,
    ROLE_BASE_ROUTE,
    ROLE_DEFAULT_PAGE,
    getBaseRoute,
    getDefaultPage,
} from '@/shared/types/auth';
