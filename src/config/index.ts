/**
 * Environment configuration
 * In Next.js, use process.env instead of import.meta.env
 */

export const config = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    environment: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
} as const;
