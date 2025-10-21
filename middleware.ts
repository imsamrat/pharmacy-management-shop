import { auth } from "./lib/auth";

export default auth((req) => {
  const isAuth = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthPage) {
    if (isAuth) {
      return Response.redirect(new URL("/", req.nextUrl));
    }
    return;
  }

  if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return Response.redirect(
      new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.nextUrl)
    );
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
