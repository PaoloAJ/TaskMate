import React from "react";

export default function BuddyChatPage() {
  return (
    <div>
      {/* Chat heading is provided by TabBar; this area contains the chat box design */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg h-96 p-4 flex flex-col justify-between">
        <div className="flex-1 overflow-auto rounded-md">
          {/* Placeholder for chat messages (design-only) */}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Type a message..."
          />
        </div>
      </div>
    </div>
  );
}
