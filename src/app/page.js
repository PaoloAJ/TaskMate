'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Navbar from "./components/Navbar";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Don't render landing page if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Simplified Home Design: TaskMate in navbar (top-left), greeting and centered grey box */}
      <div className="min-h-[calc(100vh-80px)] flex flex-col">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Greeting */}
            <h2 className="text-2xl font-semibold text-[#111827]">Hello NAME</h2>
          </div>
        </div>

        {/* Centered grey box */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            <div className="bg-gray-100 border border-gray-200 rounded-lg h-48 flex items-center justify-center text-gray-500 text-lg font-medium">
              Finish setting up your profile
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
