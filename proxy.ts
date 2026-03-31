// proxy.ts (formerly middleware.ts)
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/", "/docs", "/about", "/pricing", "/dashbaord"]
const AUTH_ROUTES = ["/auth/login", "/auth/signup", "/auth/forgot-password"]

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const pathname = nextUrl.pathname

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isAuthenticated = !!session

  // 1. Handle Expired Sessions
  if (session?.error === "RefreshTokenExpired") {
    return NextResponse.redirect(new URL("/api/auth/signout?callbackUrl=/auth/login", nextUrl.origin))
  }

  // 2. Redirect logged-in users away from Auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
  }

  // 3. Allow Public Routes
  if (isPublicRoute) return NextResponse.next()

  // 4. Protect everything else
  if (!isAuthenticated && !isAuthRoute) {
    const loginUrl = new URL("/auth/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}