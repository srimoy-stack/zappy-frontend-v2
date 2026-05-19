'use client';

/**
 * AuthProvider — Compatibility Shim
 *
 * Re-exports from shared AuthContext.
 * New code should import from '@/shared/contexts' directly.
 */

export { AuthProvider, useAuth } from '@/shared/contexts/AuthContext';
