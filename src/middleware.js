import { fetchAuthSession } from "aws-amplify/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";
import outputs from "../amplify_outputs.json";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const publicRoutes = ["/", "/signin", "/signup", "/verify"];
  const isPublicRoute = publicRoutes.includes(pathname);
  // All the other routes after profile setup
  const protectedRoutes = ["/home", "/findbuddy", "/leaderboard"];
  const isProtectedRoute = protectedRoutes.includes(pathname);
  const setupProfileRoute = "/setup-profile";

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
        // Suppress "no federated jwt" errors for unauthenticated users
        // This is expected when checking auth status without valid tokens
        if (error.message && !error.message.includes("No federated jwt")) {
          console.log("Auth check error:", error);
        }
        return false;
      }
    },
  });

  const hasProfile = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        const userId = session.tokens?.accessToken?.payload?.sub;
        const token = session.tokens?.accessToken?.toString();

        if (!userId || !token) {
          return false;
        }

        // Direct AppSync API call
        const query = `
          query GetUserProfile($id: ID!) {
            getUserProfile(id: $id) {
              id
            }
          }
        `;

        const apiResponse = await fetch(outputs.data.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            query,
            variables: { id: userId },
          }),
        });

        const result = await apiResponse.json();
        return result.data?.getUserProfile !== null;
      } catch (error) {
        // Suppress "no federated jwt" errors for unauthenticated users
        if (error.message && !error.message.includes("No federated jwt")) {
          console.log("Profile check error:", error);
        }
        return false;
      }
    },
  });

  // Log authentication status
  console.log(`[Middleware] Path: ${pathname}`);
  console.log(`[Middleware] Authenticated: ${authenticated}`);
  console.log(`[Middleware] Is Public Route: ${isPublicRoute}`);
  console.log(`[Middleware] Has Profile: ${hasProfile}`);

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

  if (pathname === setupProfileRoute) {
    if (!hasProfile) {
      return response;
    } else {
      const homeUrl = new URL("/findbuddy", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // PROTECTED ROUTES LOGIC (everything else)
  if (!authenticated) {
    // If user is NOT authenticated, redirect to signin
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname); // Remember where they wanted to go
    return NextResponse.redirect(signInUrl);
  }

  if (isProtectedRoute) {
    if (!hasProfile) {
      // If user is authenticated but has no profile, redirect to setup-profile
      const setupProfileUrl = new URL("/setup-profile", request.url);
      return NextResponse.redirect(setupProfileUrl);
    }
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
