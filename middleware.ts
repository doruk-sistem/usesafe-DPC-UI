import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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
      `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: hashconnect.hashpack.app; connect-src 'self' https://*.hashpack.app https://*.hedera.com wss://*.hedera.com https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; frame-src 'self' hashconnect.hashpack.app;`
    );

    // Add locale header
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'tr';
    response.headers.set('x-next-locale', locale);

    return response;
  }

  // If no session response, just add locale header
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'tr';
  const newResponse = NextResponse.next();
  newResponse.headers.set('x-next-locale', locale);
  return newResponse;
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
