'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorBannerProps {
    message: string;
    details?: string;
    onRetry?: () => void;
    /** Auto-retry countdown in seconds. Set to 0 to disable. Default: 0 */
    autoRetrySeconds?: number;
    /** Allow dismissing the banner */
    dismissible?: boolean;
}

/**
 * Error banner displayed when an API call fails.
 * Shows the error message with an optional retry button,
 * auto-retry countdown, and dismiss capability.
 * NEVER falls back to fake data — this is the only response to errors.
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({
    message,
    details,
    onRetry,
    autoRetrySeconds = 0,
    dismissible = false,
}) => {
    const [dismissed, setDismissed] = useState(false);
    const [countdown, setCountdown] = useState(autoRetrySeconds);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset dismiss state when message changes
    useEffect(() => {
        setDismissed(false);
        setCountdown(autoRetrySeconds);
    }, [message, autoRetrySeconds]);

    // Auto-retry countdown
    useEffect(() => {
        if (autoRetrySeconds <= 0 || !onRetry) return;

        setCountdown(autoRetrySeconds);
        intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    onRetry();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoRetrySeconds, onRetry, message]);

    const cancelAutoRetry = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setCountdown(0);
    }, []);

    if (dismissed) return null;

    return (
        <div
            id="error-banner"
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm animate-in slide-in-from-top-1"
            role="alert"
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800">Something went wrong</p>
                <p className="text-sm text-red-600 mt-0.5 truncate">{message}</p>
                {details && (
                    <p className="text-xs text-red-400 mt-1 font-mono truncate">{details}</p>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {/* Auto-retry countdown */}
                {countdown > 0 && (
                    <button
                        onClick={cancelAutoRetry}
                        className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                    >
                        Retrying in {countdown}s · Cancel
                    </button>
                )}
                {/* Manual retry */}
                {onRetry && countdown === 0 && (
                    <button
                        id="error-retry-btn"
                        onClick={onRetry}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                    </button>
                )}
                {/* Dismiss */}
                {dismissible && (
                    <button
                        onClick={() => setDismissed(true)}
                        className="rounded-lg p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};
