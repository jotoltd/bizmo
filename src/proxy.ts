import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const securityHeaders = {
  "X-XSS-Protection": "1; mode=block",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://plausible.io",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://plausible.io",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join("; "),
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "speaker=()",
    "fullscreen=(self)",
    "accelerometer=()",
  ].join(", "),
  ...(process.env.NODE_ENV === "production" && {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  }),
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;

const rateLimitExemptPaths = [
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
  "/robots.txt",
];

function isRateLimitExempt(path: string): boolean {
  return rateLimitExemptPaths.some((exempt) => path.startsWith(exempt));
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const path = request.nextUrl.pathname;

  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  if ((path.startsWith("/api/") || path.startsWith("/")) && !isRateLimitExempt(path)) {
    if (!checkRateLimit(ip)) {
      return new NextResponse("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": "60",
          ...Object.fromEntries(
            Object.entries(securityHeaders).filter(([, v]) => v !== undefined) as [string, string][]
          ),
        },
      });
    }
  }

  response.headers.set("X-Request-ID", crypto.randomUUID());

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
