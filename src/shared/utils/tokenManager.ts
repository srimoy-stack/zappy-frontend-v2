/**
 * Token Manager — In-memory access token storage.
 *
 * Access token lives ONLY in memory (never localStorage/sessionStorage).
 * Refresh token is managed by backend via httpOnly cookie.
 */

let _accessToken: string | null = null;
let _tokenExpiry: number | null = null;
let _refreshPromise: Promise<string | null> | null = null;

const TOKEN_EXPIRY_BUFFER_MS = 60_000; // 1 min before actual expiry

// ─── Getters / Setters ──────────────────────────────────────────────────────

export function getAccessToken(): string | null {
    return _accessToken;
}

export function setAccessToken(token: string, expiresInMs?: number): void {
    _accessToken = token;
    if (expiresInMs) {
        _tokenExpiry = Date.now() + expiresInMs;
    } else {
        // Default: decode exp from JWT
        _tokenExpiry = decodeExpiry(token);
    }
}

export function clearAccessToken(): void {
    _accessToken = null;
    _tokenExpiry = null;
}

export function isTokenExpired(): boolean {
    if (!_tokenExpiry) return true;
    return Date.now() >= _tokenExpiry - TOKEN_EXPIRY_BUFFER_MS;
}

export function getTokenExpiry(): number | null {
    return _tokenExpiry;
}

// ─── Refresh Lock ───────────────────────────────────────────────────────────
// Prevents multiple parallel refresh calls.

export function getRefreshPromise(): Promise<string | null> | null {
    return _refreshPromise;
}

export function setRefreshPromise(promise: Promise<string | null> | null): void {
    _refreshPromise = promise;
}

// ─── JWT Expiry Decode ──────────────────────────────────────────────────────

function decodeExpiry(token: string): number | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1]!;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const decoded = atob(padded);
        const parsed = JSON.parse(decoded);
        if (parsed.exp) {
            return parsed.exp * 1000; // Convert seconds to ms
        }
        return null;
    } catch {
        return null;
    }
}
