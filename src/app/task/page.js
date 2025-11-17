import Navbar from "../components/Navbar";
import React from "react";

export default function TaskPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          {/* Heading centered at top */}
          <h1 className="text-3xl font-bold text-[#563478] mb-8">Task</h1>

          {/* Assigned task card (fun task) */}
          <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800">Assigned Task from Buddy</h2>
            <p className="text-sm text-gray-500 mt-1">From: <span className="font-medium text-gray-700">A Friendly Buddy</span></p>

            <div className="mt-4">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-800">Plan a Surprise Picnic</h3>
                <p className="text-gray-600 mt-2">Put together a relaxed, themed picnic for your friend(s): pick a location, bring a blanket and snacks, and create a simple playlist. Bonus: include one small surprise like a handwritten note or a favorite treat.</p>

                <ul className="mt-3 list-disc list-inside text-gray-600 text-sm">
                  <li>Choose a nearby park or scenic spot</li>
                  <li>Prepare 3 easy snacks or finger foods</li>
                  <li>Create a 20-minute playlist</li>
                  <li>Bring a small thoughtful surprise</li>
                </ul>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    <div><strong>Due:</strong> <span className="font-medium text-gray-700">2025-12-05</span></div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div><strong>Status:</strong> <span className="font-medium text-gray-700">Assigned</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button className="bg-[#8B5A96] text-white px-4 py-2 rounded-lg" disabled>
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
