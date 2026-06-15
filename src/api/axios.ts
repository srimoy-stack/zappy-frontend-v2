import axios from 'axios';
import { getSession } from 'next-auth/react';

type SessionUserWithToken = {
    accessToken?: string;
};

const isServer = typeof window === 'undefined';
const isProxyMode = process.env.NEXT_PUBLIC_API_PROXY_MODE === 'true';

// Target URL for direct backend access (used on server, or client when proxy is disabled)
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Base URL: relative proxy URL for client under proxy mode, absolute url for server or normal mode
const baseURL = (isProxyMode && !isServer)
    ? '/api/proxy'
    : backendUrl;

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor: Attach JWT Authorization Header ────────────
// Fetches the current NextAuth session and, if a JWT access_token exists,
// injects it as a Bearer token on every outgoing request.
axiosInstance.interceptors.request.use(
    async (config) => {
        // Only attempt to attach token in browser (not during SSR)
        if (typeof window !== 'undefined') {
            try {
                const session = await getSession();
                const token = (session?.user as SessionUserWithToken | undefined)?.accessToken;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch {
                // Session fetch failed — proceed without token
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ─── Response Interceptor: Handle 401 Unauthorized ───────────────────
// If the API returns 401 (expired/invalid token), redirect to login.
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            // Token expired or invalid — redirect to login
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login')) {
                console.warn('[axios] 401 Unauthorized — redirecting to login');
                window.location.href = currentPath.startsWith('/pos') ? '/pos/login' : '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
