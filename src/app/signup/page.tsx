'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { resolveUserType, getDefaultPage } from '@/shared/types/auth';
import { Lock, Mail, User, Loader2, AlertCircle, ArrowRight, LogIn, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Client-side validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            setIsLoading(false);
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                setError('Server returned an invalid response. Please try again.');
                setIsLoading(false);
                return;
            }

            if (!res.ok) {
                // Extract validation errors
                if (data.details) {
                    const messages = Object.values(data.details).flat();
                    setError((messages as string[]).join(' '));
                } else {
                    setError(data.error || 'Registration failed. Please try again.');
                }
                setIsLoading(false);
                return;
            }

            // Auto sign-in after registration
            const loginResult = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (loginResult?.error) {
                // Registration succeeded but auto-login failed — redirect to login
                router.push('/login');
            } else {
                // Fetch the session to get the user's role/type
                const session = await getSession();
                const userType = resolveUserType(session?.user?.role);
                const targetPage = userType ? getDefaultPage(userType) : '/backoffice/home';

                console.log(`[Signup] Role: ${session?.user?.role} -> UserType: ${userType} -> Target: ${targetPage}`);

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
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-6 -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <User className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">ZYAPPY</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Create Your Account</p>
                </div>

                {/* Signup Card */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-[2rem] p-8 shadow-2xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-white tracking-tight">Sign Up</h2>
                        <p className="text-slate-500 text-sm mt-1">Create an admin account to get started</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    id="signup-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    id="signup-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    id="signup-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    required
                                    autoComplete="new-password"
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative group">
                                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    id="signup-confirm-password"
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full h-12 bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 text-white font-medium placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-in fade-in duration-300">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p className="text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        {/* Role Badge */}
                        <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <Lock size={14} className="text-emerald-500 shrink-0" />
                            <p className="text-[11px] text-emerald-400/80 font-medium">
                                Account will be created with <span className="font-black text-emerald-400">Admin</span> role
                            </p>
                        </div>

                        <button
                            id="signup-submit"
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-13 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin text-white" size={20} />
                            ) : (
                                <>
                                    Create Account
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

                    {/* Sign In Link */}
                    <Link
                        href="/login"
                        className="w-full h-13 border border-slate-700 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <LogIn size={16} />
                        Already have an account? Sign In
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
