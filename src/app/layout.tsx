import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../index.css';
import { ClientProviders } from './providers/ClientProviders';
import { AuthProvider } from './providers/AuthProvider';
import { TenantStoreProvider } from './providers/TenantStoreProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Zyappy',
    description: 'Zyappy - Modern Business Management',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={inter.className} suppressHydrationWarning={true}>
                <ClientProviders>
                    <AuthProvider>
                        <TenantStoreProvider>
                            {children}
                        </TenantStoreProvider>
                    </AuthProvider>
                </ClientProviders>
            </body>
        </html>
    );
}
