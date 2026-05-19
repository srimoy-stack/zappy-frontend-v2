import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../index.css';
import { ClientProviders } from './providers/ClientProviders';
import { TenantProvider, StoreProvider, ModuleProvider, ApiContextBridge } from '@/shared/contexts';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { EntitlementProvider } from '@/shared/entitlements';
import { PermissionDeniedToast } from '@/shared/components/PermissionDeniedToast';
import { ContextErrorBoundary } from '@/shared/components/ContextErrorBoundary';
import { ApiErrorToast } from '@/shared/components/ApiErrorToast';
import { TokenRefreshProvider } from '@/shared/providers/TokenRefreshProvider';
import { TenantStoreProvider } from '@/app/providers/TenantStoreProvider';

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
                    <TenantProvider>
                        <StoreProvider>
                            <TenantStoreProvider>
                                <ModuleProvider>
                                    <AuthProvider>
                                        <EntitlementProvider>
                                            <TokenRefreshProvider>
                                                <ApiContextBridge />
                                                <ContextErrorBoundary>
                                                    {children}
                                                </ContextErrorBoundary>
                                                <PermissionDeniedToast />
                                                <ApiErrorToast />
                                            </TokenRefreshProvider>
                                        </EntitlementProvider>
                                    </AuthProvider>
                                </ModuleProvider>
                            </TenantStoreProvider>
                        </StoreProvider>
                    </TenantProvider>
                </ClientProviders>
            </body>
        </html>
    );
}
