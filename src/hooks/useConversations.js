import { useState, useEffect } from "react";
import {
  getUserConversations,
  getOrCreateConversation as getOrCreateConversationService,
  subscribeToConversations,
} from "@/services/chatService";

/**
 * Custom hook for managing user conversations
 */
export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial conversations
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadConversations() {
      setIsLoading(true);
      const { data, error } = await getUserConversations(userId);

      if (isMounted) {
        if (error) {
          setError(error);
        } else {
          setConversations(data);
        }
        setIsLoading(false);
      }
    }

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Subscribe to real-time conversation updates
  useEffect(() => {
    if (!userId) return;

    const subscription = subscribeToConversations(userId, (updatedConversations) => {
      setConversations(updatedConversations);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

  // Create or get conversation with another user
  const getOrCreateConversation = async (otherUserId) => {
    if (!userId || !otherUserId) {
      return { data: null, error: "Invalid user IDs" };
    }

    const { data, error } = await getOrCreateConversationService(userId, otherUserId);

    if (!error && data) {
      // Refresh conversations list
      const { data: updatedConversations } = await getUserConversations(userId);
      if (updatedConversations) {
        setConversations(updatedConversations);
      }
    }

    return { data, error };
  };

  return {
    conversations,
    isLoading,
    error,
    getOrCreateConversation,
  };
}
