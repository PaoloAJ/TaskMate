import React from "react";
import Navbar from "../components/Navbar";
import TabBar from "./TabBar";

export const metadata = {
  title: 'Buddy - TaskMate',
};

export default function BuddyLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Tab bar with Chat and Task */}
      <TabBar />

      {/* Page content area */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
