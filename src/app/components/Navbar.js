"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ProfilePicture from "./ProfilePicture";

function Navbar({ variant = "default" }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const isDefPage = variant === "default";
  const isAuthPage = variant === "auth";
  const isDashboardPage = variant === "dashboard";

  // Show navigation links only for authenticated users (except on auth/dashboard variants)
  const showNavLinks = isAuthenticated && !isAuthPage && !isDashboardPage;

  const handleSignOut = async () => {
    try {
      console.log("Sign out button clicked");
      await signOut();
      console.log("Sign out successful");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showProfileMenu]);

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

          {/* Navigation Links - visible on medium+ screens only if authenticated */}
          {showNavLinks && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/home"
                className="text-[#563478]/70 hover:text-[#563478] transition-colors"
              >
                Home
              </Link>
              {/* <Link
                href="/leaderboard"
                className="text-[#563478]/70 hover:text-[#563478] transition-colors"
              >
                Leaderboard
              </Link> */}
              <Link
                href="/task"
                className="text-[#563478]/70 hover:text-[#563478] transition-colors"
              >
                Task
              </Link>
              <Link
                href="/chat"
                className="text-[#563478]/70 hover:text-[#563478] transition-colors"
              >
                Chat
              </Link>
            </div>
          )}

          {/* Right side buttons / profile menu */}
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
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu((s) => !s)}
                  className="flex items-center space-x-2 focus:outline-none group p-1 rounded-md hover:bg-purple-50 transition-colors focus:ring-2 focus:ring-purple-200"
                  aria-expanded={showProfileMenu}
                  aria-haspopup="true"
                  type="button"
                >
                  <ProfilePicture size="sm" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600 group-hover:text-[#563478] transition-colors"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.25 4.656a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-20"
                    role="menu"
                    aria-orientation="vertical"
                    aria-label="User menu"
                  >
                    <Link
                      href="/settings"
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-[#563478]/70 hover:text-[#563478] hover:bg-purple-50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleSignOut();
                      }}
                      role="menuitem"
                      className="w-full text-left px-4 py-2 text-sm text-[#563478]/70 hover:text-[#563478] hover:bg-purple-50 transition-colors cursor-pointer"
                      type="button"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
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
