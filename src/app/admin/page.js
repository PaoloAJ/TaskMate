"use client";

import { useMemo, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { generateClient } from "aws-amplify/data";
import { useAuth } from "@/lib/auth-context";

export default function Page() {
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch reports and user profiles
  useEffect(() => {
    // Wait for auth to be ready before fetching data
    if (authLoading) return;

    async function fetchData() {
      try {
        setLoading(true);

        // Generate client inside the component after Amplify is configured
        const client = generateClient({
          authMode: "userPool",
        });

        // Fetch all reports
        const { data: reportsData } = await client.models.Report.list();
        setReports(reportsData || []);

        // Fetch all user profiles
        const { data: profilesData } = await client.models.UserProfile.list();

        // Create a map of user profiles for easy lookup
        const profilesMap = {};
        (profilesData || []).forEach((profile) => {
          profilesMap[profile.id] = profile;
        });
        setUserProfiles(profilesMap);

        // Group reports by reported user
        const reportsByUser = {};
        (reportsData || []).forEach((report) => {
          if (!reportsByUser[report.reported_user_id]) {
            reportsByUser[report.reported_user_id] = [];
          }
          reportsByUser[report.reported_user_id].push(report);
        });

        // Create users array with reports
        const usersWithReports = Object.keys(reportsByUser).map((userId) => {
          const profile = profilesMap[userId];
          const userReports = reportsByUser[userId].map((r) => ({
            id: r.id,
            reporter: r.reporter_username,
            reason: r.reason,
            date: r.created_at
              ? new Date(r.created_at).toLocaleDateString()
              : "N/A",
          }));

          return {
            id: userId,
            username: profile?.username || "Unknown User",
            banned: profile?.banned || false,
            reports: userReports,
          };
        });

        setUsers(usersWithReports);
        if (usersWithReports.length > 0) {
          setSelectedUserId(usersWithReports[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authLoading]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => b.reports.length - a.reports.length);
  }, [users]);

  const banUser = async (id) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Are you sure you want to ban this user?")
    )
      return;

    try {
      const client = generateClient({
        authMode: "userPool",
      });

      // Update the user profile in the database
      await client.models.UserProfile.update({
        id: id,
        banned: true,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, banned: true } : u))
      );
    } catch (error) {
      console.error("Error banning user:", error);
      alert("Failed to ban user. Please try again.");
    }
  };

  const unbanUser = async (id) => {
    try {
      const client = generateClient({
        authMode: "userPool",
      });

      // Update the user profile in the database
      await client.models.UserProfile.update({
        id: id,
        banned: false,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, banned: false } : u))
      );
    } catch (error) {
      console.error("Error unbanning user:", error);
      alert("Failed to unban user. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="dashboard" />

      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
          {/* Left: reported users list (sorted) */}
          <div className="col-span-5">
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-full">
              <h2 className="text-xl font-semibold mb-4">Reported Users</h2>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center text-gray-500 py-8">
                    Loading...
                  </div>
                ) : sorted.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No reported users found
                  </div>
                ) : (
                  sorted.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      role="button"
                      className={`w-full flex items-center gap-4 p-3 rounded-md hover:bg-gray-50 transition text-left cursor-pointer ${
                        selectedUserId === u.id ? "ring-2 ring-purple-300" : ""
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full flex-shrink-0 bg-purple-400 flex items-center justify-center text-white font-semibold">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {u.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          Reports:{" "}
                          <span className="font-semibold">
                            {u.reports.length}
                          </span>
                        </div>
                      </div>
                      {u.banned ? (
                        <div className="text-sm text-red-600 font-semibold">
                          BANNED
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: selected user's reports + ban action */}
          <div className="col-span-7">
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
              {!selectedUser ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a reported user to view reports.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="h-16 w-16 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-xl">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xl font-semibold">
                        {selectedUser.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedUser.reports.length} reports
                      </div>
                    </div>
                    <div className="ml-auto">
                      {selectedUser.banned ? (
                        <button
                          onClick={() => unbanUser(selectedUser.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => banUser(selectedUser.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Ban User
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h3 className="text-lg font-medium">Reports</h3>
                    <p className="text-sm text-gray-500">
                      Review the reports below and take action if necessary.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3">
                    {selectedUser.reports.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 border rounded-md bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">
                              {r.reporter}
                            </div>
                            <div className="text-xs text-gray-500">
                              {r.date}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">Reason</div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          {r.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
