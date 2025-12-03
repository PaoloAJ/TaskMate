import React, { useState } from "react";

export default function MessageInput({ onSendMessage, isSending }) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    console.log("Sending message:", message);
    const result = await onSendMessage(message);
    console.log("Send result:", result);
    if (result?.success) {
      setMessage("");
    } else {
      console.error("Failed to send message:", result?.error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Message:
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5A96]"
          placeholder="Type a message..."
          aria-label="Message"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="bg-[#563478] text-white px-6 py-2 rounded-md hover:bg-[#6d4291] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
