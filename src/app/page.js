import React from "react";
import Navbar from "./components/Navbar";

function page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6D9] to-[#F5E6B8]">
      <Navbar />

      {/* Main content with vertical split */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-120px)]">
          {/* Left side - Introduction */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#000000] leading-tight">
                Welcome to <span className="text-[#8B5A96]">TaskMate</span>
              </h1>
              <p className="text-xl text-[#000000] leading-relaxed">
                Your intelligent task management companion that helps you stay
                organized, focused, and productive throughout your day.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[#000000]">
                Key Features
              </h2>
              <ul className="space-y-2 text-[#000000]/70">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#8B5A96] rounded-full"></span>
                  <span>Smart task prioritization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#8B5A96] rounded-full"></span>
                  <span>Intuitive drag-and-drop interface</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#8B5A96] rounded-full"></span>
                  <span>Real-time collaboration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#8B5A96] rounded-full"></span>
                  <span>Progress tracking and analytics</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <button className="bg-[#8B5A96] hover:bg-[#7A4A85] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Get Started
              </button>
            </div>
          </div>

          {/* Right side - Masonry Screenshot Gallery */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#563478] mb-6 text-center">
              App Screenshots
            </h2>
            <div className="masonry-grid">
              {/* Screenshot 1 - Large */}
              <div className="masonry-item masonry-item-large">
                <div className="bg-white rounded-lg shadow-lg p-4 border border-[#563478]/20">
                  <div className="bg-gradient-to-br from-[#8B5A96]/10 to-[#8B5A96]/20 h-48 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[#563478] font-medium">
                        Dashboard View
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot 2 - Medium */}
              <div className="masonry-item masonry-item-medium">
                <div className="bg-white rounded-lg shadow-lg p-4 border border-[#563478]/20">
                  <div className="bg-gradient-to-br from-[#8B5A96]/10 to-[#8B5A96]/20 h-32 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[#563478] text-sm font-medium">
                        Task List
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot 3 - Small */}
              <div className="masonry-item masonry-item-small">
                <div className="bg-white rounded-lg shadow-lg p-4 border border-[#563478]/20">
                  <div className="bg-gradient-to-br from-[#8B5A96]/10 to-[#8B5A96]/20 h-24 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[#563478] text-xs font-medium">
                        Analytics
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot 4 - Medium */}
              <div className="masonry-item masonry-item-medium">
                <div className="bg-white rounded-lg shadow-lg p-4 border border-[#563478]/20">
                  <div className="bg-gradient-to-br from-[#8B5A96]/10 to-[#8B5A96]/20 h-36 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[#563478] text-sm font-medium">
                        Team View
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot 5 - Small */}
              <div className="masonry-item masonry-item-small">
                <div className="bg-white rounded-lg shadow-lg p-4 border border-[#563478]/20">
                  <div className="bg-gradient-to-br from-[#8B5A96]/10 to-[#8B5A96]/20 h-28 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[#563478] text-xs font-medium">
                        Quick Add
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot 6 - Large */}
              <div className="masonry-item masonry-item-large">
                <div className="bg-white rounded-lg shadow-lg p-4 border border-[#563478]/20">
                  <div className="bg-gradient-to-br from-[#8B5A96]/10 to-[#8B5A96]/20 h-40 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[#563478] font-medium">
                        Project Overview
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
