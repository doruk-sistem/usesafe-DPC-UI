import type { NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Update the session
  const response = await updateSession(request);
  
  // Add Content Security Policy headers to allow Hedera connections
  if (response) {
    // Get the existing headers
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    
    // Set CSP headers with Hedera domains
    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; connect-src 'self' https://*.hedera.com wss://*.hedera.com https://testnet-node*.hedera.com https://mainnet-node*.hedera.com data: ${
        process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      } ${process.env.NEXT_PUBLIC_VERCEL_URL ? 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL : ''} ws://localhost:*; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: ${
        process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      } https://images.unsplash.com https://udmyjobxsovqdshhavus.supabase.co; font-src 'self' data:; frame-src 'self'; base-uri 'self'; form-action 'self';`
    );
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
