import React from "react";

function Navbar() {
  return (
    <nav className="bg-fff6d9 shadow-sm border-b border-[#563478]/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#8B5A96] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TM</span>
            </div>
            <span className="text-xl font-bold text-[#563478]">TaskMate</span>
          </div>

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

          <div className="flex items-center space-x-3">
            <button className="text-[#563478]/70 hover:text-[#563478] transition-colors">
              Sign In
            </button>
            <button className="bg-[#8B5A96] hover:bg-[#7A4A85] text-white px-4 py-2 rounded-lg transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
