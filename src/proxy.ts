import { NextResponse, type NextRequest } from "next/server";

// UX-level redirect only: real authorization happens in requireSession()
// inside server layouts and actions. Keeping Prisma/bcrypt out of the
// proxy keeps it edge-compatible and fast.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

// "/" is matched exactly — it must NOT use startsWith, since every path on
// the site begins with "/" and that would make the whole app public.
const PUBLIC_PREFIX_PATHS = ["/sign-in", "/sign-up"];
const PUBLIC_EXACT_PATHS = ["/"];

/**
 * Nonce-based Content-Security-Policy, following the official Next.js
 * guidance: the nonce is minted per request here, travels to the renderer
 * via request headers, and Next stamps it onto every inline script it
 * emits — so script-src needs no 'unsafe-inline'.
 */
function buildCsp(nonce: string): string {
  const dev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    // 'strict-dynamic': only nonce-carrying scripts run (plus what they
    // load). Dev additionally needs eval for Turbopack/React Refresh.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // Tailwind ships as external CSS, but Radix/Recharts/next-font set
    // inline styles and style attributes.
    "style-src 'self' 'unsafe-inline'",
    // Product photos, avatars, and the custom logo are data: URLs.
    "img-src 'self' data:",
    "font-src 'self'",
    // Server actions POST same-origin; dev HMR runs over a websocket.
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) =>
    request.cookies.has(name),
  );
  const isPublic =
    PUBLIC_EXACT_PATHS.includes(pathname) ||
    PUBLIC_PREFIX_PATHS.some((path) => pathname.startsWith(path));

  // Only guard the unauthenticated direction here. Cookie presence does not
  // prove validity (e.g. a cookie signed with a rotated AUTH_SECRET), so
  // redirecting cookie-holders away from /sign-in would loop them against
  // the server-side check in the app layout. The (auth) layout already
  // redirects genuinely signed-in users off the auth pages after full
  // session validation. Redirects carry no HTML, so they skip the CSP work.
  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // Next reads these request headers during render to apply the nonce to
  // its own inline scripts — without them the CSP would block hydration.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Everything except Next internals, static assets, the auth API, and the
  // generated favicon (src/app/icon.tsx — has no file extension, so it isn't
  // caught by the .* exclusion below, and needs to load before login too).
  matcher: ["/((?!api/auth|_next|favicon.ico|icon|.*\\..*).*)"],
};
