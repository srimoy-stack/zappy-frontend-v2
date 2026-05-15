'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type UnsubState = 'loading' | 'success' | 'already' | 'invalid' | 'error';

interface UnsubResult {
    state: UnsubState;
    message?: string;
    brandName?: string;
    contactEmail?: string;
    email?: string;
}

const STATE_CONFIG: Record<UnsubState, { icon: string; title: string; bg: string; accent: string }> = {
    loading: { icon: '⏳', title: 'Processing...', bg: '#f8fafc', accent: '#6366f1' },
    success: { icon: '✅', title: 'Unsubscribed Successfully', bg: '#f0fdf4', accent: '#16a34a' },
    already: { icon: 'ℹ️', title: 'Already Unsubscribed', bg: '#eff6ff', accent: '#2563eb' },
    invalid: { icon: '⚠️', title: 'Invalid Link', bg: '#fef3c7', accent: '#d97706' },
    error: { icon: '❌', title: 'Something Went Wrong', bg: '#fef2f2', accent: '#dc2626' },
};

const STATE_MESSAGES: Record<UnsubState, string> = {
    loading: 'Please wait while we process your request...',
    success: 'You have been successfully unsubscribed from all marketing communications. You will no longer receive promotional emails.',
    already: 'This email address is already unsubscribed. No further action is needed.',
    invalid: 'This unsubscribe link is invalid or has expired. If you continue to receive unwanted emails, please contact us directly.',
    error: 'We encountered an error processing your request. Please try again later or contact support.',
};

export default function UnsubscribePage() {
    const params = useParams();
    const token = params?.token as string;
    const [result, setResult] = useState<UnsubResult>({ state: 'loading' });

    useEffect(() => {
        if (!token) {
            setResult({ state: 'invalid' });
            return;
        }

        const processUnsubscribe = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const res = await fetch(`${apiBase}/unsubscribe/t/${encodeURIComponent(token)}`, {
                    headers: { 'Accept': 'application/json' },
                });

                // The backend returns HTML, but we handle it as a redirect/proxy.
                // If the backend returns JSON (when Accept: application/json), use that.
                const contentType = res.headers.get('content-type') || '';
                
                if (contentType.includes('application/json')) {
                    const data = await res.json();
                    if (data.state) {
                        setResult({
                            state: data.state,
                            message: data.message,
                            brandName: data.brand_name,
                            contactEmail: data.contact_email,
                            email: data.email,
                        });
                    } else {
                        // Legacy JSON response
                        setResult({
                            state: 'success',
                            message: data.message,
                        });
                    }
                } else {
                    // Backend returned HTML directly — parse the state from the response
                    const html = await res.text();
                    if (html.includes('Unsubscribed Successfully')) {
                        setResult({ state: 'success' });
                    } else if (html.includes('Already Unsubscribed')) {
                        setResult({ state: 'already' });
                    } else if (html.includes('Invalid Link')) {
                        setResult({ state: 'invalid' });
                    } else {
                        setResult({ state: 'success' });
                    }
                }
            } catch {
                setResult({ state: 'error' });
            }
        };

        processUnsubscribe();
    }, [token]);

    const config = STATE_CONFIG[result.state];
    const message = result.message || STATE_MESSAGES[result.state];
    const brandName = result.brandName || '';

    return (
        <div
            style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                background: config.bg,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    maxWidth: '480px',
                    width: '100%',
                    padding: '48px 40px',
                    textAlign: 'center',
                }}
            >
                {result.state === 'loading' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                border: '4px solid #e2e8f0',
                                borderTopColor: '#6366f1',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }}
                        />
                        <p style={{ fontSize: '15px', color: '#64748b' }}>{message}</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>{config.icon}</div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                            {config.title}
                        </h1>
                        <p
                            style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, marginBottom: '32px' }}
                            dangerouslySetInnerHTML={{ __html: message }}
                        />
                        <div style={{ height: '1px', background: '#e2e8f0', margin: '24px 0' }} />
                        {brandName && (
                            <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
                                {brandName}
                            </p>
                        )}
                        {result.contactEmail && (
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                Questions?{' '}
                                <a href={`mailto:${result.contactEmail}`} style={{ color: config.accent, textDecoration: 'none' }}>
                                    {result.contactEmail}
                                </a>
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
