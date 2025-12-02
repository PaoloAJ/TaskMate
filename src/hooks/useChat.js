import { useState, useEffect, useCallback } from "react";
import {
  getConversationMessages,
  sendMessage as sendMessageService,
  subscribeToMessages,
} from "@/services/chatService";

/**
 * Custom hook for managing chat functionality in a specific conversation
 */
export function useChat(conversationId, currentUserId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  // Load initial messages
  useEffect(() => {
    if (!conversationId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadMessages() {
      setIsLoading(true);
      const { data, error } = await getConversationMessages(conversationId);

      if (isMounted) {
        if (error) {
          setError(error);
        } else {
          setMessages(data);
        }
        setIsLoading(false);
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const subscription = subscribeToMessages(conversationId, (updatedMessages) => {
      setMessages(updatedMessages);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [conversationId]);

  // Send a message
  const sendMessage = useCallback(
    async (messageText) => {
      console.log("useChat sendMessage called with:", {
        messageText,
        conversationId,
        currentUserId,
      });

      if (!messageText.trim() || !conversationId || !currentUserId) {
        console.error("Invalid message data:", {
          messageText: !!messageText.trim(),
          conversationId,
          currentUserId,
        });
        return { success: false, error: "Invalid message data" };
      }

      setIsSending(true);
      setError(null);

      const { data, error } = await sendMessageService(
        conversationId,
        currentUserId,
        messageText.trim()
      );

      console.log("sendMessageService result:", { data, error });

      setIsSending(false);

      if (error) {
        setError(error);
        return { success: false, error };
      }

      return { success: true, data };
    },
    [conversationId, currentUserId]
  );

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
  };
}
