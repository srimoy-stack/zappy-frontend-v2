import React from 'react';
;
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Header } from '../components/Header/Header';

/**
 * Backoffice Layout
 * Managed / Backoffice application area layout.
 * 3-part fixed layout: Sidebar (fixed) + Header (fixed) + Content (scrollable)
 */
export const BackofficeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // In a production app, this state might be shared or passed through context
    // For now, we manually sync or simplify the margin
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />

            {/* 
              Main content area. 
              Note: Sidebar is fixed w-64 (256px) or w-20 (80px).
              Using pl-64 ensures content doesn't overlap.
            */}
            <div className="flex-1 flex flex-col min-h-screen ml-64 transition-all duration-300">
                <Header />

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
