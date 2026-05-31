import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const protectedPaths = ["/members"];

export async function proxy(request) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/members", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
