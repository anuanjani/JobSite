import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // =========================================================================
  // 1. CSRF PROTECTION FOR ALL STATE-CHANGING API ROUTES (/api/*)
  // =========================================================================
  if (
    pathname.startsWith('/api/') &&
    STATE_CHANGING_METHODS.has(method) &&
    !pathname.startsWith('/api/uploadthing') // Allow UploadThing signed callbacks
  ) {
    // A. Block explicit cross-site requests flagged by browser Fetch Metadata
    const secFetchSite = request.headers.get('sec-fetch-site');
    if (secFetchSite && secFetchSite === 'cross-site') {
      return NextResponse.json(
        { error: 'CSRF check failed: Cross-site requests are forbidden.' },
        { status: 403 }
      );
    }

    // B. Verify Origin / Referer host matches the application's Host header
    const host =
      request.headers.get('x-forwarded-host') || request.headers.get('host');
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    if (host) {
      let sourceHost: string | null = null;

      if (origin && origin !== 'null') {
        try {
          sourceHost = new URL(origin).host;
        } catch {
          return NextResponse.json(
            { error: 'CSRF check failed: Malformed Origin header.' },
            { status: 403 }
          );
        }
      } else if (referer) {
        try {
          sourceHost = new URL(referer).host;
        } catch {
          return NextResponse.json(
            { error: 'CSRF check failed: Malformed Referer header.' },
            { status: 403 }
          );
        }
      }

      if (!sourceHost || sourceHost !== host) {
        return NextResponse.json(
          { error: 'CSRF check failed: Origin mismatch.' },
          { status: 403 }
        );
      }
    }

    // C. Block HTML <form> CSRF attacks by requiring application/json on body mutations
    // (DELETE requests with query parameters may not include a body/content-type)
    const contentType = request.headers.get('content-type') || '';
    if (
      (method === 'POST' || method === 'PUT' || method === 'PATCH') &&
      !contentType.toLowerCase().includes('application/json')
    ) {
      return NextResponse.json(
        {
          error:
            'CSRF check failed: Content-Type must be application/json.',
        },
        { status: 415 }
      );
    }
  }

  // =========================================================================
  // 2. GLOBAL ANTI-XSS & CLICKJACKING SECURITY HEADERS
  // =========================================================================
  const response = NextResponse.next();

  // Issue a SameSite=Strict CSRF token cookie if not already present
  if (!request.cookies.get('rm_csrf_token')) {
    const token = crypto.randomUUID();
    response.cookies.set('rm_csrf_token', token, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self';"
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};