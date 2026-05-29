/**
 * Environment Configuration
 *
 * Centralizes all env variable access. No direct process.env usage elsewhere.
 */

export const env = {
    /** API base URL for FastAPI backend */
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002',

    /** API mode: 'mock' uses local fixtures, 'live' calls real backend */
    apiMode: (process.env.NEXT_PUBLIC_API_MODE || 'mock') as 'mock' | 'live',

    /** NextAuth secret */
    nextAuthSecret: process.env.NEXTAUTH_SECRET || '',

    /** App URL */
    appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',

    /** Is development? */
    isDev: process.env.NODE_ENV === 'development',

    /** Is production? */
    isProd: process.env.NODE_ENV === 'production',
} as const;
