import React from "react";
import Navbar from "../components/Navbar";

const sampleUsers = [
  { username: 'alice', school: 'Central High', interests: 'Photography, Design' },
  { username: 'bob', school: 'Westview College', interests: 'Coding, Robotics' },
  { username: 'carla', school: 'Eastside Univ', interests: 'Music, Hiking' },
  { username: 'dan', school: 'North Tech', interests: 'AI, Startups' },
  { username: 'eva', school: 'South Arts', interests: 'Painting, UX' },
];

export default function FinderPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: list of sample users (takes two columns on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Users</h2>

              <div className="space-y-3">
                {sampleUsers.map((u) => (
                  <div key={u.username} className="flex items-center space-x-4 p-3 rounded-md hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">{u.username.charAt(0).toUpperCase()}</div>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">{u.username}</div>
                      <div className="text-gray-500 text-xs">{u.school} | {u.interests}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: current logged-in user's small profile box (design-only) */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Your Profile</h3>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold text-xl">Y</div>
                <div className="text-sm text-gray-700 font-medium">Your School</div>
                <div className="text-sm text-gray-600 text-center">This is your bio. It can be a short description about yourself. (Design placeholder)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
