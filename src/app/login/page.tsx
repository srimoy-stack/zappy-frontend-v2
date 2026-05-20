'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, Eye, EyeOff, Shield, Zap, BarChart3 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn('login', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid credentials. Please check your email and password.');
            } else {
                // Read the session to get the user's role for correct redirect
                const { getSession } = await import('next-auth/react');
                const session = await getSession();
                const rawRole = (session?.user as any)?.role || '';
                const tenantSlug = (session?.user as any)?.tenantSlug;

                // Resolve correct landing page based on role
                const roleKey = rawRole.toLowerCase();

                if (['platform_super_admin', 'super_admin', 'admin'].includes(roleKey)) {
                    router.push('/platform/tenants');
                } else if (tenantSlug) {
                    // Brand users → slug-based dashboard
                    router.push(`/${tenantSlug}/home`);
                } else {
                    router.push('/backoffice/home');
                }

                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: '#f8fafb' }}>
            {/* Left Panel — Brand Info */}
            <div
                className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
                style={{
                    background: 'linear-gradient(145deg, #1a3a2a 0%, #2d6b47 50%, #3a9b65 100%)',
                }}
            >
                {/* Decorative shapes */}
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.08]" style={{ background: '#fff' }} />
                <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full opacity-[0.06]" style={{ background: '#fff' }} />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Zap className="text-white" size={20} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-extrabold text-white tracking-tight">ZYAPPY</h1>
                    </div>
                </div>

                {/* Hero messaging */}
                <div className="relative z-10 flex flex-col gap-8">
                    <div>
                        <h2 className="text-4xl xl:text-[2.75rem] font-extrabold text-white leading-[1.15] tracking-tight mb-4">
                            Everything you need,<br />
                            one platform.
                        </h2>
                        <p className="text-white/95 text-[15px] leading-relaxed max-w-[380px]">
                            Manage your entire business from a single workspace.
                            Built for teams that move fast and need tools that keep up.
                        </p>
                    </div>

                    {/* Feature list */}
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 space-y-0 divide-y divide-white/15">
                        <div className="flex items-center gap-3.5 pb-4">
                            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                <BarChart3 size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-[13px] leading-tight">Live Insights</p>
                                <p className="text-white/80 text-[11px] leading-snug mt-0.5">Real-time metrics & performance monitoring</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5 py-4">
                            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                <Shield size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-[13px] leading-tight">Enterprise Security</p>
                                <p className="text-white/80 text-[11px] leading-snug mt-0.5">Role-based access & end-to-end encryption</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5 pt-4">
                            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                <Zap size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-[13px] leading-tight">Seamless Workflows</p>
                                <p className="text-white/80 text-[11px] leading-snug mt-0.5">Automate tasks with an intuitive builder</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <div className="h-px bg-white/20 mb-5" />
                    <p className="text-white/55 text-[11px] font-medium">
                        © {new Date().getFullYear()} Zyappy Technologies · All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
                {/* Subtle brand gradient accent at top-right */}
                <div
                    className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.04] pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at top right, #4dbe7e, transparent 70%)',
                    }}
                />

                <div className="w-full max-w-[400px] relative z-10">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #4dbe7e 0%, #3a9b65 100%)',
                                boxShadow: '0 8px 24px rgba(77,190,126,0.25)',
                            }}
                        >
                            <Zap className="text-white" size={26} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#1a1a2e' }}>ZYAPPY</h1>
                    </div>

                    {/* Heading + Info Paragraph */}
                    <div className="mb-7">
                        <h2 className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: '#1a1a2e' }}>
                            Welcome back
                        </h2>
                        <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                            Sign in to access your workspace, manage your operations,
                            and stay on top of everything — all in one place.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="login-email"
                                className="block text-xs font-bold uppercase tracking-wider mb-2"
                                style={{ color: '#374151' }}
                            >
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail
                                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                                    size={18}
                                    style={{ color: '#9ca3af' }}
                                />
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@zyappy.com"
                                    className="w-full h-[52px] rounded-xl pl-12 pr-4 text-sm font-medium outline-none transition-all"
                                    style={{
                                        background: '#ffffff',
                                        border: '1.5px solid #e5e7eb',
                                        color: '#1a1a2e',
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#4dbe7e';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(77,190,126,0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    required
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="login-password"
                                className="block text-xs font-bold uppercase tracking-wider mb-2"
                                style={{ color: '#374151' }}
                            >
                                Password
                            </label>
                            <div className="relative group">
                                <Lock
                                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                                    size={18}
                                    style={{ color: '#9ca3af' }}
                                />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-[52px] rounded-xl pl-12 pr-12 text-sm font-medium outline-none transition-all"
                                    style={{
                                        background: '#ffffff',
                                        border: '1.5px solid #e5e7eb',
                                        color: '#1a1a2e',
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#4dbe7e';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(77,190,126,0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    required
                                    autoComplete="current-password"
                                />
                                {/* Eye toggle */}
                                <button
                                    type="button"
                                    id="login-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors"
                                    style={{ color: '#9ca3af' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#4dbe7e')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                className="flex items-start gap-3 p-4 rounded-xl animate-in fade-in duration-300"
                                style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                }}
                            >
                                <AlertCircle size={18} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                                <p className="text-xs font-semibold leading-relaxed" style={{ color: '#dc2626' }}>
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[52px] rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                            style={{
                                background: isLoading
                                    ? '#94a3b8'
                                    : 'linear-gradient(135deg, #4dbe7e 0%, #3a9b65 100%)',
                                boxShadow: isLoading
                                    ? 'none'
                                    : '0 4px 14px rgba(77,190,126,0.3)',
                             }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #5ccf8e 0%, #4dbe7e 100%)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(77,190,126,0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #4dbe7e 0%, #3a9b65 100%)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(77,190,126,0.3)';
                                }
                            }}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer info */}
                    <div className="mt-8 text-center">
                        <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
                            By signing in you agree to our <span className="font-semibold" style={{ color: '#6b7280' }}>Terms of Service</span> and <span className="font-semibold" style={{ color: '#6b7280' }}>Privacy Policy</span>.
                        </p>
                        <p className="text-[11px] mt-3" style={{ color: '#c4c9d2' }}>
                            © {new Date().getFullYear()} Zyappy Technologies · Need help? Contact <span className="font-semibold" style={{ color: '#4dbe7e' }}>support@zyappy.com</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
