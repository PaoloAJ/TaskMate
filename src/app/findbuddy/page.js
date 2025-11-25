"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { generateClient } from "aws-amplify/data";
import { useAuth } from "@/lib/auth-context";

const client = generateClient({
  authMode: "userPool",
});

export default function Page() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [nextToken, setNextToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  const fetchUsers = async (currentToken = null, idToFilter = null) => {
    if (!idToFilter) {
      console.log("No user ID to filter by");
      return;
    }
    setLoading(true);
    console.log("Fetching users, filtering out user ID:", idToFilter);
    try {
      const { data: newUsers, nextToken: newNextToken } =
        await client.models.UserProfile.list({
          limit: 10,
          nextToken: currentToken,
          filter: {
            id: { ne: idToFilter },
          },
        });
      console.log("Fetched users:", newUsers);
      console.log("Next token:", newNextToken);
      setUsers((prevUsers) => [...prevUsers, ...newUsers]);
      setNextToken(newNextToken);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId && !hasFetchedRef.current) {
      console.log("Current user ID:", user.userId);
      hasFetchedRef.current = true;
      setUsers([]); // reset users when user changes
      fetchUsers(null, user.userId);
    }
  }, [user?.userId]);

  const placeholders = [
    // replace placeholders with useres
    {
      id: 1,
      username: "Alvin Cabe",
      school: "UF",
      interests: ["Music", "Food", "Travel"],
      bio: "I love exploring new places and trying different foods. Coffee, good music, and long walks keep me sane.",
    },
    {
      id: 2,
      username: "Jamie Roe",
      school: "FSU",
      interests: ["Coding", "Gaming", "Photography"],
      bio: "Product designer and amateur photographer. I enjoy solving problems and documenting the world through a lens.",
    },
    {
      id: 3,
      username: "Taylor Smith",
      school: "USF",
      interests: ["Fitness", "Reading", "Nature"],
      bio: "Runner, reader, and outdoor enthusiast. I like long bios that tell a story about curiosity and persistence.",
    },
  ];

  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("received");

  // Auto-select first user when users are loaded
  useEffect(() => {
    if (users.length > 0 && !selected) {
      setSelected(users[0]);
    }
  }, [users, selected]);

  // Placeholder pending requests
  const [sentRequests, setSentRequests] = useState([
    { id: 1, username: "carla", school: "Eastside Univ" },
  ]);
  const [receivedRequests, setReceivedRequests] = useState([
    { id: 2, username: "dan", school: "North Tech" },
    { id: 3, username: "eva", school: "South Arts" },
  ]);

  const acceptRequest = (id) => {};

  const rejectRequest = (id) => {};

  const cancelRequest = (id) => {};

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
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                        {p.username?.charAt(0) || "?"}
                      </div>

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

              {!loading && users.length > 0 && nextToken && (
                <button
                  onClick={() => fetchUsers(nextToken, user?.userId)}
                  className="mt-4 w-full py-2 text-purple-600 hover:bg-purple-50 rounded-md transition"
                >
                  Load More
                </button>
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

                    <div className="h-20 w-20 rounded-full bg-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                      {selected.username?.charAt(0).toUpperCase() || "?"}
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
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
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.alert(
                            `Buddy request sent to ${selected.username}`
                          );
                        }
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                    >
                      Request Buddy
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
                      onClick={() => setTab("received")}
                    >
                      Received
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${tab === "sent" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
                      onClick={() => setTab("sent")}
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
                                  onClick={() => acceptRequest(r.id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => rejectRequest(r.id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded"
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
                                  onClick={() => cancelRequest(s.id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded"
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
