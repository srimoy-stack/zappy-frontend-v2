import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id?: string;
            role?: string | null;
            accessToken?: string;
            tokenType?: string;
            tenantId?: string | null;
            storeIds?: string[];
        } & DefaultSession['user'];
    }

    interface User {
        role?: string | null;
        accessToken?: string;
        refreshToken?: string;
        tokenType?: string;
        tokenExpiry?: number;
        tenantId?: string | null;
        storeIds?: string[];
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id?: string;
        role?: string | null;
        accessToken?: string;
        refreshToken?: string;
        tokenType?: string;
        tokenExpiry?: number;
        tenantId?: string | null;
        storeIds?: string[];
    }
}

export {};
