'use client';

/**
 * useApi — Generic wrapper for API calls with loading/error/data state.
 *
 * Usage:
 *   const { execute, data, loading, error } = useApi(merchantService.getAll);
 *   await execute({ page: 1 });
 *
 *   const { execute: create, loading } = useApi(merchantService.create);
 *   await create(payload);
 */

import { useState, useCallback, useRef } from 'react';
import type { ApiError } from '@/shared/types/api';
import { isApiError } from '@/shared/utils/normalizeError';

interface UseApiOptions {
    /** Don't show global toast on error (handle locally) */
    silent?: boolean;
    /** Reset data on new execute call */
    resetOnExecute?: boolean;
}

interface UseApiReturn<TData, TArgs extends any[]> {
    /** Execute the API call */
    execute: (...args: TArgs) => Promise<TData | null>;
    /** Response data (null if not yet called or errored) */
    data: TData | null;
    /** Loading state */
    loading: boolean;
    /** Normalized error (null if no error) */
    error: ApiError | null;
    /** Reset all state */
    reset: () => void;
}

export function useApi<TData = any, TArgs extends any[] = any[]>(
    apiFn: (...args: TArgs) => Promise<TData>,
    options: UseApiOptions = {}
): UseApiReturn<TData, TArgs> {
    const { resetOnExecute = true } = options;

    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const callId = useRef(0);

    const execute = useCallback(
        async (...args: TArgs): Promise<TData | null> => {
            const id = ++callId.current;

            if (resetOnExecute) {
                setData(null);
            }
            setError(null);
            setLoading(true);

            try {
                const result = await apiFn(...args);

                // Only update state if this is still the latest call
                if (id === callId.current) {
                    setData(result);
                    setLoading(false);
                }

                return result;
            } catch (err: unknown) {
                if (id === callId.current) {
                    const apiError: ApiError = isApiError(err)
                        ? err
                        : {
                              success: false,
                              status: 0,
                              code: 'UNKNOWN_ERROR',
                              message: err instanceof Error ? err.message : 'Unknown error',
                          };

                    setError(apiError);
                    setLoading(false);
                }
                return null;
            }
        },
        [apiFn, resetOnExecute]
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
        callId.current++;
    }, []);

    return { execute, data, loading, error, reset };
}

/**
 * useApiMutation — Alias tuned for write operations (POST/PUT/DELETE).
 *
 * Usage:
 *   const { execute: createUser, loading } = useApiMutation(userService.create);
 *   const result = await createUser({ name: 'John' });
 */
export function useApiMutation<TData = any, TArgs extends any[] = any[]>(
    apiFn: (...args: TArgs) => Promise<TData>,
    options: UseApiOptions = {}
): UseApiReturn<TData, TArgs> {
    return useApi(apiFn, { resetOnExecute: false, ...options });
}
