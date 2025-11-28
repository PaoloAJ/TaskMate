"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { generateClient } from "aws-amplify/data";
import { useAuth } from "@/lib/auth-context";

const client = generateClient({
  authMode: "userPool",
});

    //acess the user's buddy

export default function Page() {
  const { user } = useAuth();
  // Active buddy state (single object or null)
  const [activeBuddy, setActiveBuddy] = useState(null);
  const [isBuddyLoading, setIsBuddyLoading] = useState(false);
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
    setIsBuddyLoading(true);
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
      setIsBuddyLoading(false);
    }
  };

  useEffect(() => {
    getBuddy();
  }, [user?.userId]);

  const router = useRouter();

  const handleLeaveBuddy = async () => {
    if (!user?.userId) return;
    // confirm already handled in UI, but double-check
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to leave your buddy? This will reset your streak.")) {
      return;
    }
    setIsBuddyLoading(true);
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
      setIsBuddyLoading(false);
    }
  };

  // Users only have one buddy at a time; `activeBuddy` is the constant buddy on the right (or null)
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="default" />

      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
          {/* Left - Leaderboard */}
          <div className="col-span-6">
            <div className="border rounded-lg bg-white p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Leaderboard</h3>
              <div className="space-y-4">
                {pairs.map((p) => (
                  <div key={p.id} className="w-full flex items-center gap-4 p-3 rounded-md bg-white hover:bg-gray-50 transition text-left">
                    <div className="flex gap-2">
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex-shrink-0"></div>
                      <div className="h-12 w-12 rounded-full bg-gray-400 flex-shrink-0"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-md font-medium text-gray-900">{p.users[0]} &amp; {p.users[1]}</div>
                      <div className="text-sm text-gray-500">Streak: <span className="font-semibold text-purple-600">{p.streak}d</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Chat */}
          <div className="col-span-6">
            <div className="border rounded-lg bg-white p-6 h-full flex flex-col">
              {/* Chat header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      {isBuddyLoading && (
                        <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                      )}
                      <div className="text-lg font-medium text-gray-900">{isBuddyLoading ? "Loading..." : (activeBuddy ? activeBuddy.username : "No Buddy")}</div>
                    </div>
                    <div className="text-sm text-gray-500">{isBuddyLoading ? (
                      "Loading buddy info..."
                    ) : activeBuddy ? (
                      <>Streak: <span className="font-semibold text-purple-600">{activeBuddy.streak}d</span></>
                    ) : (
                      "You currently have no active buddy"
                    )}</div>
                  </div>
                </div>
                <div>
                    <button
                      type="button"
                      onClick={() => handleLeaveBuddy()}
                      disabled={isBuddyLoading}
                      className="text-sm text-white bg-red-600 px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBuddyLoading ? "Leaving..." : "Leave Buddy"}
                    </button>
                </div>
              </div>

              {/* Chat area placeholder */}
              <div className="flex-1 border rounded-md bg-gray-50 p-4 overflow-y-auto">
                {!activeBuddy ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="text-lg font-medium text-gray-700 mb-2">No active buddy</div>
                      <div className="text-sm text-gray-500">You currently have no buddy to chat with.</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-500">Chat placeholder — messages would appear here.</div>
                    <div className="mt-6 space-y-4">
                      <div className="flex">
                        <div className="h-8 w-8 rounded-full bg-gray-300 mr-3"></div>
                        <div className="bg-white p-3 rounded-lg shadow">Hey — want to meet for a study session this week?</div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-purple-100 p-3 rounded-lg">Sure! How about Thursday?</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Input placeholder */}
                  <div className="mt-4">
                <input
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={activeBuddy ? "Type a message (placeholder)" : "No buddy to message"}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
