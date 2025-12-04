"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import ProfilePicture from "../components/ProfilePicture";
import { generateClient } from "aws-amplify/data";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatTime } from "@/lib/helperFuncts";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";

const client = generateClient({
  authMode: "userPool",
});

    //acess the user's buddy

export default function Page() {
  const { user } = useAuth();
  // Active buddy state (single object or null)
  const [activeBuddy, setActiveBuddy] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const [userTasks, setUserTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const { getOrCreateConversation } = useConversations(user?.userId || null);
  const { messages, isLoading: chatLoading, isSending, sendMessage } = useChat(conversationId, user?.userId || null);
  // Leaderboard shows top pairs (two usernames per entry)
  const pairs = [
    { id: 1, users: ["Alex Kim", "Samira Noor"], streak: 18 },
    { id: 2, users: ["Riley Park", "Jordan Li"], streak: 12 },
    { id: 3, users: ["Taylor Smith", "Avery Cole"], streak: 9 },
    { id: 4, users: ["Maya Gomez", "Ethan Brown"], streak: 22 },
    { id: 5, users: ["Kai Nguyen", "Liam Patel"], streak: 16 },
    { id: 6, users: ["Zoe Martinez", "Noah Davis"], streak: 14 },
    { id: 7, users: ["Olivia Chen", "Lucas Green"], streak: 11 },
    { id: 8, users: ["Isabella Rossi", "Mason Clark"], streak: 8 },
    { id: 9, users: ["Chloe Adams", "Benjamin Young"], streak: 6 },
    { id: 10, users: ["Sofia Lopez", "Jack Wilson"], streak: 4 },
  ]; 

  const getBuddy = async () => {
    if (!user?.userId) return;
    setIsButtonLoading(true);
    try {
      // fetch current user's profile to read buddy_id
      const userRes = await client.models.UserProfile.get({ id: user.userId });
      const userProfile = userRes?.data;
      const buddyId = userProfile?.buddy_id;
      if (!buddyId) {
        setActiveBuddy(null);
        return;
      }

      const buddyRes = await client.models.UserProfile.get({ id: buddyId });
      const buddyProfile = buddyRes?.data || null;
      setActiveBuddy(buddyProfile);
    } catch (err) {
      console.error("Failed to load buddy:", err);
      setActiveBuddy(null);
    } finally {
      setIsButtonLoading(false);
    }
  };

  useEffect(() => {
    getBuddy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  // Load tasks assigned to the current user
  const loadUserTasks = async () => {
    if (!user?.userId) return;
    setTasksLoading(true);
    try {
      const { data: tasks, errors } = await client.models.Tasks.list({
        filter: { reciever_id: { eq: user.userId } },
      });

      if (errors) {
        console.error("Errors fetching tasks:", errors);
        setUserTasks([]);
        return;
      }

      setUserTasks(tasks || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setUserTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    loadUserTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  // When activeBuddy appears, ensure there's a conversation and set it
  useEffect(() => {
    let mounted = true;
    async function ensureConversation() {
      if (!activeBuddy || !user?.userId) {
        setConversationId(null);
        return;
      }

      try {
        const { data, error } = await getOrCreateConversation(activeBuddy.id);
        if (error) {
          console.error("Failed to get/create conversation:", error);
          return;
        }
        if (mounted && data) {
          // data may be the conversation object or an id
          const id = data.id || data.conversation?.id || data;
          setConversationId(id);
        }
      } catch (err) {
        console.error("Error ensuring conversation:", err);
      }
    }

    ensureConversation();
    return () => {
      mounted = false;
    };
  }, [activeBuddy?.id, user?.userId, getOrCreateConversation]);

  // Auto-scroll when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const router = useRouter();

  const handleLeaveBuddy = async () => {
    if (!user?.userId) return;
    // confirm already handled in UI, but double-check
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to leave your buddy? This will reset your streak.")) {
      return;
    }
    setIsButtonLoading(true);
    try {
      const userRes = await client.models.UserProfile.get({ id: user.userId });
      const userProfile = userRes?.data || {};
      const buddyId = userProfile?.buddy_id;
      if (!buddyId) {
        // nothing to do
        setActiveBuddy(null);
        return;
      }

      // Clear buddy_id for both users and optionally clear requests/sent
        await Promise.all([
          client.models.UserProfile.update({ id: user.userId, buddy_id: null }),
          client.models.UserProfile.update({ id: buddyId, buddy_id: null }),
        ]);

      // Update local state
      setActiveBuddy(null);
      // Refresh server-side data and re-run fetches
      await getBuddy();
      try {
        router.refresh();
      } catch (e) {
        // router.refresh may not be available in some contexts; ignore
      }
    } catch (err) {
      console.error("Failed to leave buddy:", err);
      if (typeof window !== "undefined") {
        window.alert("Failed to leave buddy. Check console for details.");
      }
    } finally {
      setIsButtonLoading(false);
    }
  };

  const reportUser = async () => {
    if (!user?.userId) return;

    //Quick confirmation check
    const ok = typeof window !== "undefined" ? window.confirm("Report this user for inappropriate behavior?") : true;
    if (!ok) return;

    let reason = null;
    if (typeof window !== "undefined") {
      reason = window.prompt("Optional: add a short reason for the report (visible to admins)", "");
    }
    
    const reportReason = reason?.trim() || "No reason provided.";

    try {
      // Fetch profiles to get usernames
      const currentUserProfile = await client.models.UserProfile.get({ id: user.userId });
      const id = currentUserProfile?.data.buddy_id;
      const selectedUserProfile = await client.models.UserProfile.get({ id: id});
      
      if (!currentUserProfile.data) {
        throw new Error("Failed to fetch current user profile");
      }

      const reporterUsername = currentUserProfile.data.username || "";
      const reportedUsername = selectedUserProfile.data.username || "";

      //Check to see if report records exists first
      const existing = await client.models.Report.get({reported_user_id: id});

      const formattedDate = formatDate(new Date());


      //makes the report record in the database
      if (existing.data) {
        //edge testing incase a repeat report somehow happens
        if (existing.data.reporter_username.includes(reporterUsername)) {
          alert("You have already reported this user.");
          return;
        }
        await client.models.Report.update({
          reported_user_id: id,
          reporter_username: [...existing.data.reporter_username, reporterUsername],
          amt: existing.data.amt + 1,
          reason: [...existing.data.reason, reportReason],
          created_at: [...existing.data.created_at, formattedDate],
        })
      } else {
        await client.models.Report.create({
          reported_user_id: id,
          reported_username: reportedUsername,
          reporter_username: [reporterUsername],
          amt: 1,
          reason: [reportReason],
          created_at: [formattedDate],
        })
      }
      if (typeof window !== "undefined") {
        window.alert("User reported. Thank you — moderators will review the report.");
      }
    } catch (err) {
      console.error("Failed to report user:", err);
      if (typeof window !== "undefined") window.alert("Failed to report user. See console for details.");
    }
  };

  const goToChat = () => {
    try {
      router.push("/chat");
    } catch (err) {
      console.log("unable to go to chat");
    }
  };
  
  const goToTasks = () => {
    try {
      router.push("/task");
    } catch (err) {
      console.log
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="default" />

      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
          {/* Left - Buddy details */}
          <div className="col-span-6">
              <div className="border rounded-lg bg-white p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Your Buddy</h3>

              <div className="flex-1 w-full flex flex-col items-center text-center">
                <div className="flex-1 flex flex-col items-center">
                  <div>
                    {activeBuddy ? (
                      <ProfilePicture userId={activeBuddy.id} size="3xl" />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gray-300 mx-auto"></div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-2xl font-bold text-gray-900">{activeBuddy ? activeBuddy.username : "No Buddy"}</div>
                    <div className="text-sm text-gray-500">{activeBuddy ? activeBuddy.school : ""}</div>
                  </div>

                  <div className="mt-4 text-sm text-gray-700 max-w-md">
                    {activeBuddy ? (activeBuddy.bio || "No bio available") : "Find a buddy to see their profile and start collaborating."}
                  </div>

                  {activeBuddy && activeBuddy.interests && activeBuddy.interests.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {activeBuddy.interests.map((it, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{it}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-3 self-center">
                  <button
                    onClick={() => handleLeaveBuddy()}
                    disabled={isButtonLoading || !activeBuddy}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isButtonLoading ? "Leaving..." : "Leave Buddy"}
                  </button>

                  <button
                    onClick={() => reportUser()}
                    disabled={isButtonLoading || !activeBuddy}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Tasks & Chat */}
          <div className="col-span-6">
            <div className="space-y-8">
              {/* Tasks Panel */}
              <div className="border rounded-lg bg-white p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">My Task</h3>
                  <button 
                  onClick={goToTasks}
                  className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Go to Task</button>
                </div>
                <div className="text-sm text-gray-500">
                  {tasksLoading ? (
                    <div className="text-center text-gray-500">Loading tasks...</div>
                  ) : userTasks && userTasks.length > 0 ? (
                    <div className="space-y-3 items-center">
                      {userTasks.map((t) => (
                        <div key={t.id} className="p-3 bg-gray-50 rounded">
                          <div className="text-gray-800">{t.task}</div>
                        </div>
                      ))}
                    
                      <button 
                        onClick={goToTasks}
                        className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Submit Task
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded">No tasks yet — create a task to collaborate with your buddy.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Panel */}
              <div className="border rounded-lg bg-white p-6 h-96 flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-4">
                    <div>
                      {activeBuddy ? (
                          <ProfilePicture userId={activeBuddy.id} size="lg" />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-300 mx-auto"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{activeBuddy ? activeBuddy.username : "No Buddy"}</div>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      {chatLoading && (
                        <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                      )}
                      <button
                        onClick={goToChat}
                        disabled={!conversationId || chatLoading || tasksLoading}
                        className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Go to chat
                      </button>
                    </div>
                </div>

                <div className="flex-1 border rounded-md bg-gray-50 p-4 overflow-y-auto text-sm text-gray-600">
                  {chatLoading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : conversationId ? (
                    <div className="space-y-3">
                      {messages && messages.length > 0 ? (
                        messages.map((m) => (
                          <div key={m.id || m.created_at} className={`p-2 rounded ${m.sender_id === user?.userId ? "bg-purple-100 self-end" : "bg-white"}`}>
                            <div className="text-xs text-gray-500">{m.sender_id === user?.userId ? "You" : activeBuddy.username}</div>
                            <div className="mt-1 text-sm text-gray-800">{m.message || m.text || m.body}</div>
                            <div className="text-xs">{formatTime(m.created_at)}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500">No messages yet.</div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center">No active conversation. Start a conversation with your buddy.</div>
                  )}
                </div>

                <div className="mt-4">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!conversationId || !messageText.trim()) return;
                      try {
                        await sendMessage(messageText.trim());
                        setMessageText("");
                      } catch (err) {
                        console.error("Failed to send message:", err);
                        if (typeof window !== "undefined") window.alert("Failed to send message. See console.");
                      }
                    }}
                  >
                    <input
                      ref={messageInputRef}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder={activeBuddy ? "Type a message" : "No buddy to message"}
                      disabled={!conversationId}
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
