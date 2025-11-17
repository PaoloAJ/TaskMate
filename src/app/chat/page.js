"use client";
import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          {/* Heading centered at top */}
          <h1 className="text-3xl font-bold text-[#563478] mb-8">Chat</h1>

          {/* Large grey rectangle */}
          <div className="w-full max-w-3xl bg-gray-100 border border-gray-300 rounded-lg shadow-sm p-6">
            <div className="h-96 flex flex-col justify-end">
              {/* Placeholder area for messages (empty for now) */}
              <div className="flex-1" />

              {/* Message input area (interactive) */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message:
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5A96]"
                  placeholder="Type a message..."
                  aria-label="Message"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
