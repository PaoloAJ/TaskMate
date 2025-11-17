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
            <div className="h-full border-4 border-blue-400 rounded-lg bg-white p-6">
              <div className="space-y-6">
                {placeholders.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`w-full text-left flex items-center gap-6 p-4 rounded-md transition hover:bg-gray-100 focus:outline-none ${
                      selected?.id === p.id ? "ring-2 ring-purple-300" : ""
                    }`}
                    aria-pressed={selected?.id === p.id}
                  >
                    <div className="h-10 w-10 rounded-full bg-black flex-shrink-0"></div>
                    <div>
                      <div className="text-lg font-medium text-gray-900">{p.username} &nbsp;|&nbsp; {p.school} &nbsp;|&nbsp; {p.interests.join(", ")}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right profile */}
          <div className="col-span-4">
            <div className="h-full border rounded-md bg-white p-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{selected.username}</h2>

              <div className="h-20 w-20 rounded-full bg-red-500 mb-6"></div>

              <div className="text-sm text-gray-600 mb-6">{selected.school}</div>

              <div className="text-sm text-gray-700 text-center">{selected.bio}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
