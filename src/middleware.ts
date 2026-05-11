/**
 * Next.js Middleware — Edge Auth + Role-Based Route Gate
 *
 * Runs BEFORE page render on the server/edge.
 * - Redirects unauthenticated users to /login
 * - Enforces role → route prefix mapping using canonical roles
 * - Allows super admins cross-access (impersonation)
 * - Backend must still revalidate on every API call
 *
 * IMPORTANT: Uses the canonical role system from shared/types/auth.ts.
 * All backend role strings are normalized via BACKEND_ROLE_MAP before
 * any routing decision is made.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ─── Canonical UserType System (inlined for edge compatibility) ─────────────
// These MUST stay in sync with src/shared/types/auth.ts.
// We inline here because edge middleware needs minimal dependencies.

const enum CanonicalUserType {
    PLATFORM_SUPER_ADMIN = 'PLATFORM_SUPER_ADMIN',
    BRAND_ADMIN = 'BRAND_ADMIN',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    POS_USER = 'POS_USER',
    KITCHEN_USER = 'KITCHEN_USER',
    CALL_CENTER = 'CALL_CENTER',
    DELIVERY = 'DELIVERY',
}

/**
 * Normalizes ANY backend role string → canonical UserType.
 * Must handle both space-format ("Super Admin") from FastAPI
 * and underscore-format ("super_admin") from legacy.
 */
function resolveUserType(raw: string | null | undefined): CanonicalUserType | null {
    if (!raw) return null;
    const key = raw.toLowerCase().trim();
    const map: Record<string, CanonicalUserType> = {
        // Underscore format (legacy)
        'platform_super_admin': CanonicalUserType.PLATFORM_SUPER_ADMIN,
        'super_admin': CanonicalUserType.PLATFORM_SUPER_ADMIN,
        'brand_admin': CanonicalUserType.BRAND_ADMIN,
        'admin': CanonicalUserType.ADMIN,
        'manager': CanonicalUserType.MANAGER,
        'store_manager': CanonicalUserType.MANAGER,
        'pos_user': CanonicalUserType.POS_USER,
        'pos_cashier': CanonicalUserType.POS_USER,
        'employee': CanonicalUserType.POS_USER,
        'kds_user': CanonicalUserType.KITCHEN_USER,
        'kitchen_user': CanonicalUserType.KITCHEN_USER,
        'kitchen_staff': CanonicalUserType.KITCHEN_USER,
        'call_center_user': CanonicalUserType.CALL_CENTER,
        'call_center': CanonicalUserType.CALL_CENTER,
        'call_agent': CanonicalUserType.CALL_CENTER,
        'delivery': CanonicalUserType.DELIVERY,
        'delivery_staff': CanonicalUserType.DELIVERY,
        // Space format (FastAPI seeded roles)
        'super admin': CanonicalUserType.PLATFORM_SUPER_ADMIN,
        'store manager': CanonicalUserType.MANAGER,
        'pos cashier': CanonicalUserType.POS_USER,
        'kitchen staff': CanonicalUserType.KITCHEN_USER,
        'call agent': CanonicalUserType.CALL_CENTER,
        'delivery staff': CanonicalUserType.DELIVERY,
    };
    return map[key] ?? null;
}

// ─── Public Routes ──────────────────────────────────────────────────────────

const PUBLIC_ROUTES = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/kiosk',
    '/track',
    '/unsubscribe',
];

// ─── UserType → Default Landing Page ─────────────────────────────────────────

const DEFAULT_PAGE: Record<CanonicalUserType, string> = {
    [CanonicalUserType.PLATFORM_SUPER_ADMIN]: '/platform/brands',
    [CanonicalUserType.BRAND_ADMIN]: '/backoffice/home',
    [CanonicalUserType.ADMIN]: '/backoffice/home',
    [CanonicalUserType.MANAGER]: '/backoffice/home',
    [CanonicalUserType.POS_USER]: '/pos',
    [CanonicalUserType.KITCHEN_USER]: '/kds/master',
    [CanonicalUserType.CALL_CENTER]: '/callcenter/dashboard',
    [CanonicalUserType.DELIVERY]: '/backoffice/home',
};

// ─── UserType → Allowed Route Prefixes ───────────────────────────────────────

const ALLOWED_PREFIXES: Record<CanonicalUserType, string[]> = {
    [CanonicalUserType.PLATFORM_SUPER_ADMIN]: ['/platform', '/backoffice', '/pos', '/kds', '/callcenter'],
    [CanonicalUserType.BRAND_ADMIN]: ['/backoffice', '/pos', '/kds', '/callcenter'],
    [CanonicalUserType.ADMIN]: ['/backoffice', '/pos', '/kds', '/callcenter'],
    [CanonicalUserType.MANAGER]: ['/backoffice', '/pos', '/kds', '/callcenter'],
    [CanonicalUserType.POS_USER]: ['/pos'],
    [CanonicalUserType.KITCHEN_USER]: ['/kds'],
    [CanonicalUserType.CALL_CENTER]: ['/callcenter'],
    [CanonicalUserType.DELIVERY]: ['/backoffice'],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function getAuthSecret(): string {
    return process.env.NEXTAUTH_SECRET || 'zyappy-local-dev-nextauth-secret-change-me';
}

// ─── Middleware ──────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Public routes — always allow
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // 2. Static assets and Next.js internals — skip
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // 3. Verify JWT via next-auth (proper server-side verification)
    const token = await getToken({
        req: request,
        secret: getAuthSecret(),
    });

    if (!token) {
        // Not authenticated — redirect to login with callback
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Extract and normalize UserType using canonical system
    const rawRole = (token as any).role || (token as any).user_role || null;
    const userType = resolveUserType(rawRole as string);

    // 5. Root path → redirect to UserType's default page
    if (pathname === '/') {
        const defaultPage = userType ? DEFAULT_PAGE[userType] : '/backoffice/home';
        return NextResponse.redirect(new URL(defaultPage, request.url));
    }

    // 6. UserType-based route enforcement
    if (userType) {
        const allowed = ALLOWED_PREFIXES[userType] || [];
        const isAllowed = allowed.some((prefix) => pathname.startsWith(prefix));

        if (!isAllowed) {
            const defaultPage = DEFAULT_PAGE[userType] || '/backoffice/home';
            console.warn(
                `[Middleware] UserType "${userType}" (raw: "${rawRole}") blocked from ${pathname}. → ${defaultPage}`
            );
            return NextResponse.redirect(new URL(defaultPage, request.url));
        }
    }

    // 7. Authenticated + authorized — proceed
    return NextResponse.next();
}

// ─── Matcher ────────────────────────────────────────────────────────────────

export const config = {
    matcher: [
        '/',
        '/platform/:path*',
        '/backoffice/:path*',
        '/pos/:path*',
        '/kds/:path*',
        '/callcenter/:path*',
    ],
};
