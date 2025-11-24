import { fetchAuthSession } from "aws-amplify/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Define your route categories
  const publicRoutes = ["/", "/signin", "/signup", "/verify"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check authentication
  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return (
          session.tokens?.accessToken !== undefined &&
          session.tokens?.idToken !== undefined
        );
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  });

  // Log authentication status
  console.log(`[Middleware] Path: ${pathname}`);
  console.log(`[Middleware] Authenticated: ${authenticated}`);
  console.log(`[Middleware] Is Public Route: ${isPublicRoute}`);

  // PUBLIC ROUTES LOGIC
  if (isPublicRoute) {
    // If user is authenticated and trying to access public routes, redirect to dashboard
    // Allow the root landing page to remain accessible even when authenticated.
    // Redirect authenticated users away from other public routes (signin/signup/verify)
    if (authenticated && pathname !== "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // If user is NOT authenticated, let them access public routes
    return response;
  }

  // PROTECTED ROUTES LOGIC (everything else)
  if (!authenticated) {
    // If user is NOT authenticated, redirect to signin
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname); // Remember where they wanted to go
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated and accessing protected route - allow
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
