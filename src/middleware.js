import { fetchAuthSession } from "aws-amplify/auth/server";
import { NextResponse } from "next/server";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";
import outputs from "../amplify_outputs.json";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/verify",
    "/forgot-password",
    "/reset-password",
  ];
  const isPublicRoute = publicRoutes.includes(pathname);
  const setupProfileRoute = "/setup-profile";
  const findBuddyRoute = "/findbuddy";
  // Routes that require both profile AND buddy
  const fullyProtectedRoutes = ["/home", "/tasks", "/chat", "/settings"];
  const isFullyProtectedRoute = fullyProtectedRoutes.includes(pathname);
  // Routes that requires Admin status
  const adminRoute = ["/leaderboard", "/admin", "/banned"];
  const isAdminRoute = adminRoute.includes(pathname);

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

  const { hasProfile, hasBuddy, isBanned, isAdmin } =
    await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec);
          const userId = session.tokens?.accessToken?.payload?.sub;
          const token = session.tokens?.accessToken?.toString();

          if (!userId || !token) {
            return { hasProfile: false, hasBuddy: false };
          }

          // Direct AppSync API call
          const query = `
          query GetUserProfile($id: ID!) {
            getUserProfile(id: $id) {
              id
              buddy_id
              banned
              admin
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
          const profile = result.data?.getUserProfile;
          return {
            hasProfile: profile,
            hasBuddy: profile?.buddy_id,
            isBanned: profile?.banned,
            isAdmin: profile?.admin,
          };
        } catch (error) {
          // Suppress "no federated jwt" errors for unauthenticated users
          if (error.message && !error.message.includes("No federated jwt")) {
            console.log("Profile check error:", error);
          }
          return {
            hasProfile: false,
            hasBuddy: false,
            isBanned: false,
            isAdmin: false,
          };
        }
      },
    });

  // Log authentication status
  console.log(`[Middleware] Path: ${pathname}`);
  console.log(`[Middleware] Authenticated: ${authenticated}`);
  console.log(`[Middleware] Is Public Route: ${isPublicRoute}`);
  console.log(`[Middleware] Has Profile: ${hasProfile}`);
  console.log(`[Middleware] Has Buddy: ${hasBuddy}`);
  console.log(`[Middleware] Is Banned: ${isBanned}`);
  console.log(`[Middleware] Is Admin: ${isAdmin}`);

  // BANNED USER CHECK - Apply globally for all authenticated users
  // Allow access only to /banned page and public routes
  if (authenticated && isBanned && pathname !== "/banned" && !isPublicRoute) {
    return NextResponse.redirect(new URL("/banned", request.url));
  }

  // PUBLIC ROUTES LOGIC
  if (isPublicRoute) {
    // If user is authenticated and trying to access public routes, redirect based on their state
    // Allow the root landing page to remain accessible even when authenticated.
    if (authenticated && pathname !== "/") {
      // Banned users should stay on /banned page (handled by global check above)
      // Determine where to redirect based on user's completion state
      if (!hasProfile) {
        return NextResponse.redirect(new URL("/setup-profile", request.url));
      } else if (!hasBuddy) {
        return NextResponse.redirect(new URL("/findbuddy", request.url));
      } else {
        return NextResponse.redirect(new URL("/home", request.url));
      }
    }
    // If user is NOT authenticated, let them access public routes
    return response;
  }

  // SETUP PROFILE ROUTE
  if (pathname === setupProfileRoute) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    if (!hasProfile) {
      return response; // Allow access to setup profile
    } else {
      // Profile exists, move to next step (findbuddy)
      return NextResponse.redirect(new URL("/findbuddy", request.url));
    }
  }

  // FINDBUDDY ROUTE
  if (pathname === findBuddyRoute) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    if (!hasProfile) {
      // Need to complete profile first
      return NextResponse.redirect(new URL("/setup-profile", request.url));
    }
    if (hasBuddy) {
      // Already has a buddy, redirect to home
      return NextResponse.redirect(new URL("/home", request.url));
    }
    // User has profile but no buddy - allow access to findbuddy
    return response;
  }

  // FULLY PROTECTED ROUTES (require authentication + profile + buddy)
  if (!authenticated) {
    // If user is NOT authenticated, redirect to signin
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isFullyProtectedRoute) {
    if (!hasProfile) {
      // Need to complete profile first
      return NextResponse.redirect(new URL("/setup-profile", request.url));
    }
    if (!hasBuddy) {
      // Need to find a buddy first
      return NextResponse.redirect(new URL("/findbuddy", request.url));
    }
  }

  if (isAdminRoute) {
    if (!isAdmin) {
      // Non-admin users are redirected to home
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // User is authenticated and has completed all required steps - allow
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
