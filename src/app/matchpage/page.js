"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";

export default function Page() {
  const placeholders = [
    {
      id: 1,
      username: "Alvin Cabe",
      school: "UF",
      interests: ["Music", "Food", "Travel"],
      bio: "I love exploring new places and trying different foods. Coffee, good music, and long walks keep me sane.",
    },
    {
      id: 2,
      username: "Jamie Roe",
      school: "FSU",
      interests: ["Coding", "Gaming", "Photography"],
      bio: "Product designer and amateur photographer. I enjoy solving problems and documenting the world through a lens.",
    },
    {
      id: 3,
      username: "Taylor Smith",
      school: "USF",
      interests: ["Fitness", "Reading", "Nature"],
      bio: "Runner, reader, and outdoor enthusiast. I like long bios that tell a story about curiosity and persistence.",
    },
  ];

  const [selected, setSelected] = useState(placeholders[0]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="dashboard" />

      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
          {/* Left list */}
          <div className="col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-full">
              <h2 className="text-xl font-semibold mb-4">Users</h2>

              <div className="space-y-3">
                {placeholders.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`w-full flex items-center space-x-4 p-3 rounded-md hover:bg-gray-50 transition text-left ${
                      selected?.id === p.id ? "ring-2 ring-purple-300" : ""
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                      {p.username.charAt(0)}
                    </div>

                    <div className="text-sm text-gray-700">
                      <div className="font-medium">{p.username}</div>
                      <div className="text-gray-500 text-xs">{p.school} | {p.interests.join(', ')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right profile */}
          <div className="col-span-4">
            <div className="h-full border rounded-md bg-white p-6 flex flex-col">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selected.username}</h2>

                <div className="h-20 w-20 rounded-full bg-red-500 mb-4"></div>

                <div className="text-sm text-gray-600 mb-4">{selected.school}</div>

                <div className="text-sm text-gray-700 text-center">{selected.bio}</div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.alert(`Buddy request sent to ${selected.username}`);
                    }
                  }}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                >
                  Request Buddy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
