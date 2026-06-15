import { NextRequest, NextResponse } from 'next/server';

async function handleProxy(
    req: NextRequest,
    context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
    // Resolve params whether it is a Promise (Next.js 15+) or a direct object (Next.js 14-)
    const resolvedParams = typeof (context.params as any).then === 'function'
        ? await (context.params as Promise<{ path: string[] }>)
        : (context.params as { path: string[] });

    const backendBaseUrl = process.env.BACKEND_PROXY_URL || process.env.NEXT_PUBLIC_API_URL;
    
    if (!backendBaseUrl) {
        return NextResponse.json(
            { error: 'Backend proxy target URL is not configured. Set BACKEND_PROXY_URL or NEXT_PUBLIC_API_URL.' },
            { status: 500 }
        );
    }

    try {
        // 1. Reconstruct target URL
        const cleanBackendUrl = backendBaseUrl.endsWith('/') 
            ? backendBaseUrl.slice(0, -1) 
            : backendBaseUrl;
        const cleanPath = resolvedParams.path.join('/');
        
        // Extract query parameters from original request
        const requestUrl = new URL(req.url);
        const targetUrl = `${cleanBackendUrl}/${cleanPath}${requestUrl.search}`;

        // 2. Prepare headers to forward
        const headers = new Headers();
        req.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            // Filter out hop-by-hop and browser-specific headers that interfere with proxying
            if (
                !lowerKey.startsWith('x-forwarded-') &&
                lowerKey !== 'host' &&
                lowerKey !== 'connection' &&
                lowerKey !== 'content-length' &&
                lowerKey !== 'accept-encoding'
            ) {
                headers.set(key, value);
            }
        });

        // CRITICAL: Skip ngrok's interstitial warning page to directly return JSON responses
        headers.set('ngrok-skip-browser-warning', 'true');

        // 3. Prepare body (if applicable)
        let body: ArrayBuffer | undefined = undefined;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            try {
                body = await req.arrayBuffer();
            } catch {
                // No body or failed to read
            }
        }

        // 4. Perform proxy request
        const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            body,
            cache: 'no-store',
        });

        // 5. Build response headers to forward back to client
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (lowerKey !== 'transfer-encoding' && lowerKey !== 'content-encoding') {
                responseHeaders.set(key, value);
            }
        });

        // Return the response streaming the body directly
        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders,
        });

    } catch (error: any) {
        console.error('[API Proxy Error]:', error);
        return NextResponse.json(
            { error: 'Failed to proxy request to backend', details: error.message },
            { status: 502 }
        );
    }
}

// Support all standard HTTP methods
export {
    handleProxy as GET,
    handleProxy as POST,
    handleProxy as PUT,
    handleProxy as DELETE,
    handleProxy as PATCH,
    handleProxy as OPTIONS,
    handleProxy as HEAD
};
