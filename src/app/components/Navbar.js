"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function Navbar({ variant = "default" }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, signOut } = useAuth();

  const isDefPage = variant === "default";
  const isAuthPage = variant === "auth";
  const isDashboardPage = variant === "dashboard";

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav
      className={
        "bg-white/80 backdrop-blur-sm shadow-sm border-b border-[#563478]/20"
      }
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#8B5A96] rounded-lg flex items-center justify-center">
              <Link href="/">
                <span className="text-white font-bold text-sm">TM</span>
              </Link>
            </div>
            <Link href="/">
              <span className="text-xl font-bold text-[#563478]">TaskMate</span>
            </Link>
          </div>

          {/* Navigation Links - only show on default page when not authenticated */}
          {isDefPage && !isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#"
                className="text-[#563478]/70 hover:text-[#563478] transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-[#563478]/70 hover:text-[#563478] transition-colors"
              >
                Leaderboard
              </a>
            </div>
          )}

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {isAuthPage ? (
              // Auth pages (sign in/sign up) - show home button
              <Link href="/">
                <button
                  className="text-[#563478]/70 hover:text-[#563478] transition-colors px-4 py-2 rounded-lg hover:bg-purple-50"
                  type="button"
                >
                  ← Home
                </button>
              </Link>
            ) : isLoading ? (
              // Loading state
              <div className="w-8 h-8 animate-pulse bg-purple-200 rounded"></div>
            ) : isAuthenticated ? (
              // Authenticated state - show sign out button
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                type="button"
              >
                Sign Out
              </button>
            ) : (
              // Unauthenticated state - show sign in and get started
              <>
                <Link href="/signin">
                  <button
                    className="text-[#563478]/70 hover:text-[#563478] transition-colors"
                    type="button"
                  >
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button
                    className="bg-[#8B5A96] hover:bg-[#7A4A85] text-white px-4 py-2 rounded-lg transition-colors"
                    type="button"
                  >
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
