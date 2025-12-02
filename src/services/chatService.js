import { generateClient } from "aws-amplify/data";

const client = generateClient({ authMode: "userPool" });

/**
 * Find or create a conversation between two users
 */
export async function getOrCreateConversation(currentUserId, otherUserId) {
  try {
    console.log("getOrCreateConversation called with:", { currentUserId, otherUserId });

    // First, try to find existing conversation
    const { data: conversations, errors: listErrors } = await client.models.Conversations.list();
    console.log("Existing conversations:", { conversations, listErrors });

    // Check if conversation already exists between these two users
    const existingConversation = conversations?.find(conv => {
      const members = conv.members || [];
      return members.includes(currentUserId) && members.includes(otherUserId);
    });

    if (existingConversation) {
      console.log("Found existing conversation:", existingConversation);
      return { data: existingConversation, error: null };
    }

    console.log("Creating new conversation...");
    // Create new conversation if it doesn't exist
    // Note: lastMessageAt is a date field, so we pass the date string in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const { data: newConversation, errors } = await client.models.Conversations.create({
      members: [currentUserId, otherUserId],
      lastMessageAt: today,
    });

    console.log("New conversation created:", { newConversation, errors });
    return { data: newConversation, error: errors };
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    return { data: null, error };
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId) {
  try {
    const { data: conversations, errors } = await client.models.Conversations.list();

    // Filter conversations where user is a member
    const userConversations = conversations?.filter(conv =>
      conv.members?.includes(userId)
    ) || [];

    // Sort by last message time (most recent first)
    userConversations.sort((a, b) => {
      const dateA = new Date(a.lastMessageAt || a.createdAt);
      const dateB = new Date(b.lastMessageAt || b.createdAt);
      return dateB - dateA;
    });

    return { data: userConversations, error: errors };
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    return { data: [], error };
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessages(conversationId) {
  try {
    const { data: messages, errors } = await client.models.Messages.list({
      filter: {
        conversation_id: { eq: conversationId }
      }
    });

    // Sort messages by creation time (oldest first)
    const sortedMessages = messages?.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt);
      const dateB = new Date(b.created_at || b.createdAt);
      return dateA - dateB;
    }) || [];

    return { data: sortedMessages, error: errors };
  } catch (error) {
    console.error("Error in getConversationMessages:", error);
    return { data: [], error };
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId, senderId, messageText) {
  try {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    // Create the message
    const { data: message, errors: messageErrors } = await client.models.Messages.create({
      conversation_id: conversationId,
      sender_id: senderId,
      message: messageText,
      created_at: now,
    });

    if (messageErrors) {
      return { data: null, error: messageErrors };
    }

    // Update conversation's last message info
    // Note: lastMessageAt is a date field (YYYY-MM-DD), not datetime
    await client.models.Conversations.update({
      id: conversationId,
      lastMessage: messageText,
      lastMessageAt: today,
    });

    return { data: message, error: null };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return { data: null, error };
  }
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(conversationId, callback) {
  try {
    const subscription = client.models.Messages.observeQuery({
      filter: {
        conversation_id: { eq: conversationId }
      }
    }).subscribe({
      next: ({ items }) => {
        // Sort messages by creation time
        const sortedMessages = items.sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt);
          const dateB = new Date(b.created_at || b.createdAt);
          return dateA - dateB;
        });
        callback(sortedMessages);
      },
      error: (error) => {
        console.error("Subscription error:", error);
      }
    });

    return subscription;
  } catch (error) {
    console.error("Error in subscribeToMessages:", error);
    return null;
  }
}

/**
 * Subscribe to conversation updates
 */
export function subscribeToConversations(userId, callback) {
  try {
    const subscription = client.models.Conversations.observeQuery().subscribe({
      next: ({ items }) => {
        // Filter conversations where user is a member
        const userConversations = items.filter(conv =>
          conv.members?.includes(userId)
        );

        // Sort by last message time
        userConversations.sort((a, b) => {
          const dateA = new Date(a.lastMessageAt || a.createdAt);
          const dateB = new Date(b.lastMessageAt || b.createdAt);
          return dateB - dateA;
        });

        callback(userConversations);
      },
      error: (error) => {
        console.error("Conversation subscription error:", error);
      }
    });

    return subscription;
  } catch (error) {
    console.error("Error in subscribeToConversations:", error);
    return null;
  }
}
