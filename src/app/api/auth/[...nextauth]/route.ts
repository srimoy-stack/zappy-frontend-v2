import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

                    // Step 1: Login → get tokens
                    const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials?.email,
                            password: credentials?.password,
                        }),
                    });

                    if (!loginRes.ok) {
                        const errorData = await loginRes.json().catch(() => ({}));
                        console.error('[NextAuth] Login failed:', errorData);
                        return null;
                    }

                    const tokens = await loginRes.json();

                    if (!tokens.access_token) {
                        console.error('[NextAuth] No access_token in response');
                        return null;
                    }

                    // Step 2: Fetch /me with the access token to get user info
                    const meRes = await fetch(`${apiUrl}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${tokens.access_token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!meRes.ok) {
                        console.error('[NextAuth] /me fetch failed:', meRes.status);
                        // Fallback: return minimal user from token
                        return {
                            id: 'unknown',
                            name: credentials?.email || 'User',
                            email: credentials?.email || '',
                            role: 'Admin',
                            accessToken: tokens.access_token,
                            refreshToken: tokens.refresh_token,
                            permissions: [],
                        } as any;
                    }

                    const me = await meRes.json();

                    return {
                        id: String(me.id),
                        name: me.full_name,
                        email: me.email,
                        role: me.role,          // e.g. "Admin", "Super Admin"
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        permissions: me.permissions || [],
                    } as any;
                } catch (error) {
                    console.error('[NextAuth] Login API error:', error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            // On initial sign-in, persist user fields + JWT into the token
            if (user) {
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.permissions = user.permissions;
                token.tenantId = user.tenantId;
                token.storeIds = user.storeIds;
            }
            return token;
        },
        async session({ session, token }: any) {
            // Expose role, tokens, and permissions to client-side session
            if (session.user) {
                session.user.role = token.role;
                session.user.accessToken = token.accessToken;
                session.user.refreshToken = token.refreshToken;
                session.user.permissions = token.permissions;
                session.user.tenantId = token.tenantId;
                session.user.storeIds = token.storeIds;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt"
    }
});

export { handler as GET, handler as POST };
