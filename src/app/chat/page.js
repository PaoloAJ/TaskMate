"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/hooks/useChat";
import { generateClient } from "aws-amplify/data";
import { getOrCreateConversation } from "@/services/chatService";
import Navbar from "../components/Navbar";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

const client = generateClient({ authMode: "userPool" });

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [buddy, setBuddy] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [isLoadingBuddy, setIsLoadingBuddy] = useState(true);

  const {
    messages,
    isLoading: messagesLoading,
    isSending,
    sendMessage,
  } = useChat(conversation?.id, user?.userId);

  // Debug log to track conversation state
  useEffect(() => {
    console.log("Chat page state:", {
      conversation,
      conversationId: conversation?.id,
      userId: user?.userId,
      buddy,
    });
  }, [conversation, user?.userId, buddy]);

  // Fetch buddy and create/get conversation
  useEffect(() => {
    async function loadBuddyAndConversation() {
      if (!user?.userId) {
        setIsLoadingBuddy(false);
        return;
      }

      setIsLoadingBuddy(true);
      try {
        // Get current user's profile to find buddy_id
        const { data: userProfile } = await client.models.UserProfile.get({
          id: user.userId,
        });

        const buddyId = userProfile?.buddy_id;

        if (!buddyId) {
          setBuddy(null);
          setConversation(null);
          setIsLoadingBuddy(false);
          return;
        }

        // Get buddy's profile
        const { data: buddyProfile } = await client.models.UserProfile.get({
          id: buddyId,
        });

        setBuddy(buddyProfile);

        // Get or create conversation with buddy
        const { data: conversationData, error: convError } =
          await getOrCreateConversation(user.userId, buddyId);

        console.log("Conversation result:", { conversationData, convError });
        setConversation(conversationData);
      } catch (error) {
        console.error("Error loading buddy and conversation:", error);
      } finally {
        setIsLoadingBuddy(false);
      }
    }

    loadBuddyAndConversation();
  }, [user?.userId]);

  if (authLoading || isLoadingBuddy) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold text-[#563478] mb-8">Chat</h1>
            <p className="text-gray-600">Please sign in to use chat</p>
          </div>
        </main>
      </div>
    );
  }

  if (!buddy) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold text-[#563478] mb-8">Chat</h1>
            <p className="text-gray-600">
              You don&apos;t have a buddy yet. Please find a buddy first to start
              chatting.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-[#563478] mb-8">
            Chat with {buddy.name || buddy.username}
          </h1>

          <div className="w-full max-w-3xl bg-gray-100 border border-gray-300 rounded-lg shadow-sm p-6">
            <div className="h-[600px] flex flex-col">
              <MessageList
                messages={messages}
                currentUserId={user.userId}
                isLoading={messagesLoading}
              />
              <MessageInput onSendMessage={sendMessage} isSending={isSending} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
