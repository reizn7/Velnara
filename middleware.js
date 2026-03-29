import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session");

  const isPublicPath = pathname === "/login";

  // If on login page with session, redirect to home
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If on protected route without session, redirect to login
  if (!isPublicPath && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|ico|jpg|jpeg)$).*)",
  ],
};
