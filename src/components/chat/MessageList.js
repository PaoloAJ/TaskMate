import React, { useEffect, useRef } from "react";

export default function MessageList({ messages, currentUserId, isLoading }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const timestamp = new Date(message.created_at || message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwnMessage
                  ? "bg-[#563478] text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="break-words">{message.message}</p>
              <p
                className={`text-xs mt-1 ${
                  isOwnMessage ? "text-purple-200" : "text-gray-500"
                }`}
              >
                {timestamp}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
