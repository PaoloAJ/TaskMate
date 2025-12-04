'use client';

import React from "react";
import Navbar from "./components/Navbar";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f0e1] via-white to-[#f4f0e1]">
      <Navbar />

      {/* Main content - Full width */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto flex flex-col justify-center space-y-8 min-h-[calc(100vh-200px)]">
          <div className="space-y-6 text-center">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-[#563478] leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5A96] to-[#563478]">TaskMate</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Your intelligent task management companion that helps you stay
              organized, focused, and productive throughout your day.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold text-[#563478] text-center">
              Key Features
            </h2>
            <ul className="space-y-3 text-gray-700 text-lg">
              <li className="flex items-center justify-center space-x-3">
                <span className="w-3 h-3 bg-[#8B5A96] rounded-full"></span>
                <span>Smart task prioritization</span>
              </li>
              <li className="flex items-center justify-center space-x-3">
                <span className="w-3 h-3 bg-[#8B5A96] rounded-full"></span>
                <span>Intuitive drag-and-drop interface</span>
              </li>
              <li className="flex items-center justify-center space-x-3">
                <span className="w-3 h-3 bg-[#8B5A96] rounded-full"></span>
                <span>Real-time collaboration</span>
              </li>
              <li className="flex items-center justify-center space-x-3">
                <span className="w-3 h-3 bg-[#8B5A96] rounded-full"></span>
                <span>Progress tracking and analytics</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 text-center">
            <Link
              href="/signup"
              className="inline-block bg-gradient-to-r from-[#8B5A96] to-[#7A4A85] hover:from-[#7A4A85] hover:to-[#8B5A96] text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#8B5A96]/30 cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#563478] mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to keep you motivated and accountable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-[#563478]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B5A96] to-[#563478] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#563478] mb-3">Find Your Buddy</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with study partners who share your interests and goals. Build lasting accountability partnerships.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-[#563478]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B5A96] to-[#563478] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#563478] mb-3">Task Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Assign tasks, submit proof, and track completion. Stay organized with your accountability partner.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-[#563478]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B5A96] to-[#563478] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#563478] mb-3">Real-Time Chat</h3>
              <p className="text-gray-600 leading-relaxed">
                Communicate instantly with your buddy. Coordinate tasks, share updates, and stay connected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B5A96] to-[#563478]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Boost Your Productivity?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are achieving their goals with TaskMate
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#8B5A96] font-bold py-4 px-10 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
          >
            Start Your Journey Today
          </Link>
        </div>
      </section>
    </div>
  );
}
