'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { resolveUserType, getDefaultPage } from '@/shared/types/auth';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                const session = await getSession();
                const userType = resolveUserType(session?.user?.role);
                const targetPage = userType ? getDefaultPage(userType) : '/backoffice/home';

                console.log("[Login Success] Redirecting...");
                router.push(targetPage);
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-6 font-sans relative">
            {/* Minimal background treatment to keep text primary */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white z-0" />

            <div className="w-full max-w-[440px] relative z-10 animate-in fade-in duration-500">
                {/* Brand Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-[#4dbe7e] rounded-2xl flex items-center justify-center shadow-lg mb-6">
                        <ShieldCheck className="text-white" size={36} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">ZYAPPY</h1>
                    <p className="text-emerald-700 font-black uppercase text-[10px] tracking-[0.3em]">Enterprise Core Platform</p>
                </div>

                {/* Login Card - SOLID Background for Visibility */}
                <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-10 shadow-2xl">
                    <div className="mb-10 text-center">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Authenticate to access the workspace</h2>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Work Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Mail className="text-slate-500 group-focus-within:text-[#4dbe7e] transition-colors" size={18} />
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@zyappy.com"
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-200 rounded-xl pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#4dbe7e] transition-all"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Lock className="text-slate-500 group-focus-within:text-[#4dbe7e] transition-colors" size={18} />
                                </div>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-200 rounded-xl pl-12 pr-12 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#4dbe7e] transition-all"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#4dbe7e] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-100 border-2 border-red-200 rounded-xl text-red-700 animate-in fade-in duration-300">
                                <AlertCircle size={18} className="shrink-0" />
                                <p className="text-xs font-black leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-[#4dbe7e] hover:bg-[#3a9b65] disabled:bg-slate-300 text-white rounded-xl font-black text-sm tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin text-white" size={24} />
                            ) : (
                                <>
                                    AUTHENTICATE
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Credits */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">
                        v2.4.0 • Enterprise Security Gateway
                    </p>
                </div>
            </div>
        </div>
    );
}
