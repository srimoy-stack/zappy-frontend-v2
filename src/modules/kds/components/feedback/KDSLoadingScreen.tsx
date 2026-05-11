'use client';

/**
 * Premium Loading Screen for KDS Bootstrap process.
 * Displays during authentication and data hydration phases.
 */
export function KDSLoadingScreen({
    message = 'Initializing KDS',
    detail = 'Loading stations, routing & open orders'
}: {
    message?: string;
    detail?: string;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-8 animate-in fade-in duration-500">
            {/* Animated Icon Container */}
            <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />

                <div className="relative w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl overflow-hidden">
                    {/* Spinning ring */}
                    <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500/40 rounded-full animate-spin" style={{ animationDuration: '2s' }} />

                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                </div>
            </div>

            {/* Status Information */}
            <div className="text-center space-y-3 z-10">
                <div className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-[14px] font-black text-white uppercase tracking-[0.3em] font-sans">
                        {message}
                    </p>
                </div>

                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] max-w-[280px] mx-auto leading-relaxed">
                    {detail}
                </p>
            </div>

            {/* Sequence indicators */}
            <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-800 overflow-hidden relative"
                    >
                        <div
                            className="absolute inset-0 bg-emerald-500 animate-pulse"
                            style={{ animationDelay: `${i * 200}ms` }}
                        />
                    </div>
                ))}
            </div>

            {/* Subtle branding */}
            <div className="absolute bottom-12 left-0 right-0 text-center opacity-20 select-none">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
                    ZYAPPY KDS HYDRATION
                </span>
            </div>
        </div>
    );
}
