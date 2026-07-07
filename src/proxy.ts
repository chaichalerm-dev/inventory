import { NextResponse, type NextRequest } from "next/server";

// UX-level redirect only: real authorization happens in requireSession()
// inside server layouts and actions. Keeping Prisma/bcrypt out of the
// proxy keeps it edge-compatible and fast.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) =>
    request.cookies.has(name),
  );
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals, static assets, and the auth API.
  matcher: ["/((?!api/auth|_next|favicon.ico|.*\\..*).*)"],
};
