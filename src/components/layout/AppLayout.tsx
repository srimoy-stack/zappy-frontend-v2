import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex flex-col min-h-screen ml-64 transition-all duration-300">
                <Header />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
