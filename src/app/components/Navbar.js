'use client';
import React from "react";
import Link from "next/link";

function Navbar({ variant = "default" }) {
  const isDefPage = variant === "default";
  const isAuthPage = variant === "auth";
  
  return (
    <nav className={"bg-white/80 backdrop-blur-sm' shadow-sm border-b border-[#563478]/20"}>
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

          {isDefPage && (
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

          <div className="flex items-center space-x-3">
            {isAuthPage ? (
              <Link href="/">
                <button className="text-[#563478]/70 hover:text-[#563478] transition-colors px-4 py-2 rounded-lg hover:bg-purple-50" cursor="pointer">
                  ← Home
                </button>
              </Link>
            ) :  isDefPage ? (
              <> 
                <Link href="/signup">
                  <button className="text-[#563478]/70 hover:text-[#563478] transition-colors" cursor="pointer">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-[#8B5A96] hover:bg-[#7A4A85] text-white px-4 py-2 rounded-lg transition-colors" cursor="pointer">
                    Get Started
                  </button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
