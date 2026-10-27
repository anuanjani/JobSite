import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// #7 Rate Limiting: In-memory sliding window store per IP + bucket
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  ip: string,
  bucket: 'auth' | 'mutation' | 'general'
): { allowed: boolean; remaining: number; limit: number; resetSeconds: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const limit =
    bucket === 'auth' ? 15 : bucket === 'mutation' ? 60 : 240;

  const key = `${ip}:${bucket}`;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      limit,
      resetSeconds: 60,
    };
  }

  existing.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    limit,
    resetSeconds,
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // =========================================================================
  // 1. CORS PREFLIGHT & ORIGIN POLICY (#16)
  // =========================================================================
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  const origin = request.headers.get('origin');

  if (method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const preflight = new NextResponse(null, { status: 204 });
    if (origin && host && new URL(origin).host === host) {
      preflight.headers.set('Access-Control-Allow-Origin', origin);
    }
    preflight.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    preflight.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-user-email'
    );
    preflight.headers.set('Access-Control-Max-Age', '86400');
    return preflight;
  }

  // =========================================================================
  // 2. SLIDING-WINDOW API RATE LIMITING (#7)
  // =========================================================================
  let rateInfo = { allowed: true, remaining: 240, limit: 240, resetSeconds: 60 };
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/uploadthing')) {
    const isAuthRoute =
      pathname.startsWith('/api/login') || pathname.startsWith('/api/register');
    const bucket = isAuthRoute
      ? 'auth'
      : STATE_CHANGING_METHODS.has(method)
      ? 'mutation'
      : 'general';

    rateInfo = checkRateLimit(ip, bucket);
    if (!rateInfo.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Please wait ${rateInfo.resetSeconds} seconds and try again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateInfo.resetSeconds),
            'X-RateLimit-Limit': String(rateInfo.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  // =========================================================================
  // 3. CSRF PROTECTION FOR ALL STATE-CHANGING API ROUTES (#3)
  // =========================================================================
  if (
    pathname.startsWith('/api/') &&
    STATE_CHANGING_METHODS.has(method) &&
    !pathname.startsWith('/api/uploadthing')
  ) {
    const secFetchSite = request.headers.get('sec-fetch-site');
    if (secFetchSite && secFetchSite === 'cross-site') {
      return NextResponse.json(
        { error: 'CSRF check failed: Cross-site requests are forbidden.' },
        { status: 403 }
      );
    }

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

    const contentType = request.headers.get('content-type') || '';
    if (
      (method === 'POST' || method === 'PUT' || method === 'PATCH') &&
      !contentType.toLowerCase().includes('application/json')
    ) {
      return NextResponse.json(
        {
          error: 'CSRF check failed: Content-Type must be application/json.',
        },
        { status: 415 }
      );
    }
  }

  // =========================================================================
  // 4. GLOBAL SECURITY, CORS & RATE-LIMIT HEADERS (#2, #16)
  // =========================================================================
  const response = NextResponse.next();

  if (!request.cookies.get('rm_csrf_token')) {
    const token = crypto.randomUUID();
    response.cookies.set('rm_csrf_token', token, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Limit', String(rateInfo.limit));
    response.headers.set('X-RateLimit-Remaining', String(rateInfo.remaining));
    if (origin && host) {
      try {
        if (new URL(origin).host === host) {
          response.headers.set('Access-Control-Allow-Origin', origin);
          response.headers.set('Vary', 'Origin');
        }
      } catch {}
    }
  }

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'Content-Security-Policy',
    "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self';"
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};