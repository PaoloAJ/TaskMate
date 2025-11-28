"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import ProfilePicture from "../components/ProfilePicture";
import { generateClient } from "aws-amplify/data";
import { useAuth } from "@/lib/auth-context";


const client = generateClient({
  authMode: "userPool",
});

export default function Page() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [nextToken, setNextToken] = useState(null);
  const [previousTokens, setPreviousTokens] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  const fetchUsers = async (currentToken = null, idToFilter = null, isNextPage = false) => {
    if (!idToFilter) {
      console.log("No user ID to filter by");
      return;
    }
    setLoading(true);
    console.log("Fetching users, filtering out user ID:", idToFilter);
    try {
      const { data: newUsers, nextToken: newNextToken } =
        await client.models.UserProfile.list({
          limit: 6,
          nextToken: currentToken,
          filter: {
            id: { ne: idToFilter },
          },
        });
      console.log("Fetched users:", newUsers);
      console.log("Next token:", newNextToken);
      const visible = (newUsers || []).filter((u) => !u?.buddy_id);
      setUsers(visible);
      setNextToken(newNextToken);

      // Track token history for pagination
      if (isNextPage && currentToken) {
        setPreviousTokens(prev => [...prev, currentToken]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    if (nextToken && user?.userId) {
      setCurrentPage(prev => prev + 1);
      fetchUsers(nextToken, user.userId, true);
      setSelected(null);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1 && user?.userId) {
      setCurrentPage(prev => prev - 1);
      const newTokens = [...previousTokens];
      newTokens.pop(); // Remove the last token
      const prevToken = newTokens[newTokens.length - 1] || null;
      setPreviousTokens(newTokens);
      fetchUsers(prevToken, user.userId, false);
      setSelected(null);
    }
  };

  useEffect(() => {
    if (user?.userId && !hasFetchedRef.current) {
      console.log("Current user ID:", user.userId);
      hasFetchedRef.current = true;
      setUsers([]); // reset users when user changes
      setCurrentPage(1);
      setPreviousTokens([]);
      fetchUsers(null, user.userId, false);
    }
  }, [user?.userId]);

  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("received");
  const [actionLoading, setActionLoading] = useState(false);

  const hasLoadedRequestsRef = useRef(false);

  // Helper function to compare arrays as sets (extracted to avoid recreation)
  const arraysEqualAsSets = (a = [], b = []) => {
    if (a.length !== b.length) return false;
    const sa = new Set(a);
    for (const v of b) if (!sa.has(v)) return false;
    return true;
  };

 // Load the current user's sent/received IDs from the DB, fetch each profile,
 // then store minimal profile objects for UI display.
 const loadUserRequests = async () => {
   if (!user?.userId) return;
   try {
     const res = await client.models.UserProfile.get({ id: user.userId });
     const profile = res.data;
     if (!profile) return;

     const sentIds = profile.sent || [];
     const reqIds = profile.request || [];

     const fetchProfilesByIds = async (ids) => {
      if (!ids || ids.length === 0) return {profiles: [], keptIds: []};
      const results = await Promise.allSettled(
        ids.map((id) => client.models.UserProfile.get({ id }))
      );
      const profiles = results
       .filter((r) => r.status === "fulfilled" && r.value?.data)
       .map((r) => r.value.data)
       .filter((p) => !p?.buddy_id)
       .map((p) => ({ id: p.id, username: p.username, school: p.school }));
      const keptIds = results
       .filter((r) => r.status === "fulfilled" && r.value?.data && !r.value.data?.buddy_id)
       .map((r) => r.value.data.id);
      return { profiles, keptIds};
     };

     const [sentResult, receivedResult] = await Promise.all([
       fetchProfilesByIds(sentIds),
       fetchProfilesByIds(reqIds),
     ]);

     // Only update state if data actually changed (optimization)
     setSentRequests((prev) => {
       const prevIds = prev.map(p => p.id).sort();
       const newIds = sentResult.profiles.map(p => p.id).sort();
       if (arraysEqualAsSets(prevIds, newIds)) return prev;
       return sentResult.profiles;
     });

     setReceivedRequests((prev) => {
       const prevIds = prev.map(p => p.id).sort();
       const newIds = receivedResult.profiles.map(p => p.id).sort();
       if (arraysEqualAsSets(prevIds, newIds)) return prev;
       return receivedResult.profiles;
     });

     //cleans the database for ids that are not filtered out properly
     if (!arraysEqualAsSets(sentIds, sentResult.keptIds) || !arraysEqualAsSets(reqIds, receivedResult.keptIds)) {
       try {
         await client.models.UserProfile.update({
           id: user.userId,
           sent: sentResult.keptIds,
           request: receivedResult.keptIds,
         });
       } catch (e) {
         console.error("Failed to persist cleaned request IDs:", e);
       }
     }

     //refresh the user list for the left side
     //updates during every button click, takes a while to load, but is technically optimal
    //  setUsers([]);
    //  setNextToken(null);
    //  await fetchUsers(null, user.userId);

   } catch (err) {
     console.error("Error loading requests:", err);
   }
 };

  // Auto-select first user when users are loaded
  useEffect(() => {
    if (users.length > 0 && !selected) {
      setSelected(users[0]);
    }
  }, [users, selected]);

  //load requests / sent on mount
  //if loaduserrequest on every click, then needs to be commented out so no double users
  useEffect(() => {
    if (user?.userId && !hasLoadedRequestsRef.current) {
      hasLoadedRequestsRef.current = true;
      loadUserRequests();
    }
  }, [user?.userId])

  // Placeholder pending requests
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  const sendRequest = async (selectedUser) => {
    const selectedUserId = selectedUser.id;
    if (!user?.userId || !selectedUserId) {
      throw new Error("User ID or selected user ID is missing");
    }

    if (actionLoading) return; // Prevent concurrent operations
    setActionLoading(true);

    try {
      // Fetch both user profiles
      const [currentUserProfile, selectedUserProfile] = await Promise.all([
        client.models.UserProfile.get({ id: user.userId }),
        client.models.UserProfile.get({ id: selectedUserId }),
      ]);

      if (!currentUserProfile.data || !selectedUserProfile.data) {
        throw new Error("Failed to fetch user profiles");
      }

      //Edge case for if someone has a buddy already
      if (currentUserProfile.data.buddy_id) {
        throw new Error("You already have a buddy and cannot send requests");
      }
      if (selectedUserProfile.data.buddy_id) {
        throw new Error("This user already has a buddy and cannot receive requests");
      }

      // Get existing arrays or initialize as empty arrays
      const currentUserSent = currentUserProfile.data.sent || [];
      const selectedUserRequest = selectedUserProfile.data.request || [];

      // Check if request already exists to avoid duplicates
      if (currentUserSent.includes(selectedUserId)) {
        throw new Error("Request already sent to this user");
      }

      if (selectedUserRequest.includes(user.userId)) {
        throw new Error("Request already exists");
      }

      // Append IDs to respective arrays
      const updatedCurrentUserSent = [...currentUserSent, selectedUserId];
      const updatedSelectedUserRequest = [...selectedUserRequest, user.userId];

      // Update both profiles in parallel
      await Promise.all([
        client.models.UserProfile.update({
          id: user.userId,
          sent: updatedCurrentUserSent,
        }),
        client.models.UserProfile.update({
          id: selectedUserId,
          request: updatedSelectedUserRequest,
        }),
      ]);

      setSentRequests((prev) => {
        const profile = selectedUserProfile.data || {};
        if (!profile.id) return prev;

        if (prev.some((p) => p.id === profile.id)) return prev;
        return [
          ...prev,
          {id: profile.id, username: profile.username, school: profile.school},
        ];
      })

      await loadUserRequests();

      return true;
    } catch (error) {
      console.error("Error sending request:", error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const acceptRequest = async (id) => {
    const selectedUserId = id;
    if (actionLoading) return; // Prevent concurrent operations
    setActionLoading(true);

    try {
      // same logic as sending Requests
      const [currentUserProfile, selectedUserProfile] = await Promise.all([
        client.models.UserProfile.get({ id: user.userId }),
        client.models.UserProfile.get({ id: selectedUserId }),
      ]);

      if (!currentUserProfile.data || !selectedUserProfile.data) {
        throw new Error("Failed to fetch user profiles");
      }

      await Promise.all([
        client.models.UserProfile.update({id: user.userId, buddy_id: selectedUserId, request: [], sent: []}),
        client.models.UserProfile.update({id: selectedUserId, buddy_id: user.userId, request: [], sent: []}),
      ]);

      setSentRequests([]);
      setReceivedRequests([]);

      await loadUserRequests(); 
    } catch (err) {
      console.error("Error accepting request:", err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRequest = async (id) => {
    const selectedUserId = id;
    if (actionLoading) return; // Prevent concurrent operations
    setActionLoading(true);

    try {
      // same logic as sending Requests
      const [currentUserProfile, selectedUserProfile] = await Promise.all([
        client.models.UserProfile.get({ id: user.userId }),
        client.models.UserProfile.get({ id: selectedUserId }),
      ]);

      if (!currentUserProfile.data || !selectedUserProfile.data) {
        throw new Error("Failed to fetch user profiles");
      }

      const currentUserRequest = currentUserProfile.data.request || [];
      const selectedUserSent = selectedUserProfile.data.sent || [];
      
      const updCurrentRequest = currentUserRequest.filter((uid) => uid !== selectedUserId);
      const updSelectedSent = selectedUserSent.filter((uid) => uid !== user.userId);

      await Promise.all([
        client.models.UserProfile.update({id: user.userId, request: updCurrentRequest}),
        client.models.UserProfile.update({id: selectedUserId, sent: updSelectedSent}),
      ]);

      setReceivedRequests((prev) => prev.filter((p) => p.id !== selectedUserId));

      await loadUserRequests(); 
    } catch (err) {
      console.error("Error rejecting request:", err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const cancelRequest = async (id) => {
    const selectedUserId = id;
    if (actionLoading) return; // Prevent concurrent operations
    setActionLoading(true);

    try {
      // same logic as sending Requests
      const [currentUserProfile, selectedUserProfile] = await Promise.all([
        client.models.UserProfile.get({ id: user.userId }),
        client.models.UserProfile.get({ id: selectedUserId }),
      ]);

      if (!currentUserProfile.data || !selectedUserProfile.data) {
        throw new Error("Failed to fetch user profiles");
      }

      const currentUserSent = currentUserProfile.data.sent || [];
      const selectedUserRequest = selectedUserProfile.data.request || [];
      
      const updCurrentSent = currentUserSent.filter((uid) => uid !== selectedUserId);
      const updSelectedRequest = selectedUserRequest.filter((uid) => uid !== user.userId);

      await Promise.all([
        client.models.UserProfile.update({id: user.userId, sent: updCurrentSent}),
        client.models.UserProfile.update({id: selectedUserId, request: updSelectedRequest}),
      ]);

      setSentRequests((prev) => prev.filter((p) => p.id !== selectedUserId));

      await loadUserRequests(); //optional
    } catch (err) {
      console.error("Error canceling request:", err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="dashboard" />

      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
          {/* Left list */}
          <div className="col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-full">
              <h2 className="text-xl font-semibold mb-4">Users</h2>

              {loading && users.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`w-full flex items-center space-x-4 p-3 rounded-md hover:bg-gray-50 transition text-left ${
                        selected?.id === p.id ? "ring-2 ring-purple-300" : ""
                      }`}
                    >
                      <ProfilePicture userId={p.id} size="sm" />

                      <div className="text-sm text-gray-700">
                        <div className="font-medium">
                          {p.username || "Unknown"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {p.school || "N/A"} |{" "}
                          {p.interests?.join(", ") || "No interests"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && users.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    ← Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage}
                  </span>

                  <button
                    onClick={goToNextPage}
                    disabled={!nextToken}
                    className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right profile */}
          <div className="col-span-4">
            <div className="h-full border rounded-md bg-white p-6 flex flex-col">
              {selected ? (
                <>
                  <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {selected.username}
                    </h2>

                    <ProfilePicture userId={selected.id} size="xl" />

                    <div className="text-sm text-gray-600 mb-4 mt-4">
                      {selected.school || "No school listed"}
                    </div>

                    {selected.interests && selected.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {selected.interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-sm text-gray-700 text-center">
                      {selected.bio || "No bio available"}
                    </div>
                  </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={async () => {
                          try {
                            await sendRequest(selected);
                            if (typeof window !== "undefined") {
                              window.alert(`Buddy request sent to ${selected.username}`);
                            }
                          } catch (err) {
                            console.error("Failed to send buddy request:", err);
                            if (typeof window !== "undefined") {
                              window.alert(`Failed to send request: ${err.message}`);
                            }
                          }
                        }}
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? "..." : "Request Buddy"}
                      </button>
                    </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Select a user to view their profile</p>
                </div>
              )}

              {/* Pending Friend Requests */}
              <div className="mt-6 w-full">
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Pending Friend Requests
                  </h3>

                  <div className="flex gap-2 mb-3">
                    <button
                      className={`px-3 py-1 rounded ${tab === "received" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
                      onClick={async () => {
                        setTab("received");
                        loadUserRequests();
                      }
                      }
                    >
                      Received
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${tab === "sent" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
                      onClick={async () => {
                        setTab("sent");
                        loadUserRequests();
                      }}
                    >
                      Sent
                    </button>
                  </div>

                  <div>
                    {tab === "received" ? (
                      <div className="space-y-3">
                        {receivedRequests.length === 0 ? (
                          <div className="text-sm text-gray-500">
                            No received requests.
                          </div>
                        ) : (
                          receivedRequests.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded"
                            >
                              <div>
                                <div className="font-medium">{r.username}</div>
                                <div className="text-xs text-gray-500">
                                  {r.school}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      await acceptRequest(r.id);
                                      if (typeof window !== "undefined") {
                                        window.alert(`Buddy request accepted!`);
                                      }
                                    } catch (err) {
                                      if (typeof window !== "undefined") {
                                        window.alert(`Failed to accept request: ${err.message}`);
                                      }
                                    }
                                  }}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await rejectRequest(r.id);
                                    } catch (err) {
                                      if (typeof window !== "undefined") {
                                        window.alert(`Failed to reject request: ${err.message}`);
                                      }
                                    }
                                  }}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sentRequests.length === 0 ? (
                          <div className="text-sm text-gray-500">
                            No sent requests.
                          </div>
                        ) : (
                          sentRequests.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded"
                            >
                              <div>
                                <div className="font-medium">{s.username}</div>
                                <div className="text-xs text-gray-500">
                                  {s.school}
                                </div>
                              </div>
                              <div>
                                <button
                                  onClick={async () => {
                                    try {
                                      await cancelRequest(s.id);
                                    } catch (err) {
                                      if (typeof window !== "undefined") {
                                        window.alert(`Failed to cancel request: ${err.message}`);
                                      }
                                    }
                                  }}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
