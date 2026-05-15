import axios from 'axios';
import { getSession } from 'next-auth/react';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
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
                const token = (session?.user as any)?.accessToken;
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
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
