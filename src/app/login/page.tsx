'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { resolveUserType, getDefaultPage } from '@/shared/types/auth';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                // Fetch the session to get the user's role/type
                const session = await getSession();
                const userType = resolveUserType(session?.user?.role);
                const targetPage = userType ? getDefaultPage(userType) : '/backoffice/home';

                
                console.log("[Login Success] Full User Session details retrieved from auth/me:");
                console.log(session?.user);
                console.log(`[Redirect Routing] Role: ${session?.user?.role} -> UserType: ${userType} -> Target: ${targetPage}`);


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
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Lock className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">ZYAPPY</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Email Campaign Platform</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-[2rem] p-8 shadow-2xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-white tracking-tight">Sign In</h2>
                        <p className="text-slate-500 text-sm mt-1">Access your campaign dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@zyappy.com"
                                    className="w-full h-13 bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    id="login-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-13 bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-in fade-in duration-300">
                                <AlertCircle size={18} className="shrink-0" />
                                <p className="text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-13 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin text-white" size={20} />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-800" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-slate-800" />
                    </div>

                    {/* Sign Up Link */}
                    <Link
                        href="/signup"
                        className="w-full h-13 border border-slate-700 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <UserPlus size={16} />
                        Create Admin Account
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Secure JWT Authentication
                    </p>
                </div>
            </div>
        </div>
    );
}
