/**
 * Demo Mode Utility
 *
 * When NEXT_PUBLIC_DEMO_MODE=true is set (e.g. on Vercel),
 * or the app is running in development, all API calls will
 * gracefully fall back to seed data instead of showing errors.
 *
 * This lets us demonstrate the full UI flow to stakeholders
 * without a running backend.
 */

export function isDemoMode(): boolean {
    // Explicit demo flag — works in production deploys (Vercel, etc.)
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true;

    // Automatic in development
    if (process.env.NODE_ENV === 'development') return true;

    return false;
}
