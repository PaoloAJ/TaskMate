import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";

const client = generateClient({ authMode: "userPool" });

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  isLoading,
}) {
  const [userProfiles, setUserProfiles] = useState({});

  // Fetch user profiles for conversation members
  useEffect(() => {
    async function fetchUserProfiles() {
      const userIds = new Set();
      conversations.forEach((conv) => {
        conv.members?.forEach((memberId) => {
          if (memberId !== currentUserId) {
            userIds.add(memberId);
          }
        });
      });

      const profiles = {};
      for (const userId of userIds) {
        try {
          const { data } = await client.models.UserProfile.get({ id: userId });
          if (data) {
            profiles[userId] = data;
          }
        } catch (error) {
          console.error(`Error fetching profile for user ${userId}:`, error);
        }
      }

      setUserProfiles(profiles);
    }

    if (conversations.length > 0) {
      fetchUserProfiles();
    }
  }, [conversations, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherUserId = conversation.members?.find((id) => id !== currentUserId);
        const otherUser = userProfiles[otherUserId];
        const isSelected = conversation.id === selectedConversationId;

        const lastMessageTime = conversation.lastMessageAt
          ? new Date(conversation.lastMessageAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              isSelected
                ? "bg-[#563478] text-white border-[#563478]"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold">
                {otherUser?.name || "Unknown User"}
              </h3>
              {lastMessageTime && (
                <span
                  className={`text-xs ${
                    isSelected ? "text-purple-200" : "text-gray-500"
                  }`}
                >
                  {lastMessageTime}
                </span>
              )}
            </div>
            {conversation.lastMessage && (
              <p
                className={`text-sm truncate ${
                  isSelected ? "text-purple-100" : "text-gray-600"
                }`}
              >
                {conversation.lastMessage}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
