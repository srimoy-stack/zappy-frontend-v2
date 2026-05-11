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
                    // Authenticate against the Laravel JWT API
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                    const res = await fetch(`${apiUrl}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials?.email,
                            password: credentials?.password,
                        }),
                    });

                    const data = await res.json();

                    if (res.ok && data.access_token) {
                        // Return user object with JWT token embedded
                        return {
                            id: String(data.user.id),
                            name: data.user.name,
                            email: data.user.email,
                            role: data.user.role,
                            accessToken: data.access_token,
                            tokenExpiry: data.expires_in,
                        } as any;
                    }

                    // Auth failed
                    return null;
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
                token.tokenExpiry = user.tokenExpiry;
                token.tenantId = user.tenantId;
                token.storeIds = user.storeIds;
            }
            return token;
        },
        async session({ session, token }: any) {
            // Expose role and access token to client-side session
            if (session.user) {
                session.user.role = token.role;
                session.user.accessToken = token.accessToken;
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
