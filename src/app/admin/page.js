"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";

export default function Page() {
  // Placeholder reported users with reports array
  const [users, setUsers] = useState([
    {
      id: 1,
      username: "trouble_maker",
      avatarColor: "bg-red-400",
      reports: [
        { id: 11, reporter: "alice", reason: "Spam messages", date: "2025-11-10" },
        { id: 12, reporter: "bob", reason: "Harassment", date: "2025-11-12" },
      ],
    },
    {
      id: 2,
      username: "spammer123",
      avatarColor: "bg-yellow-400",
      reports: [
        { id: 21, reporter: "carla", reason: "Repeated spam links", date: "2025-11-13" },
      ],
    },
    {
      id: 3,
      username: "annoying_user",
      avatarColor: "bg-purple-400",
      reports: [
        { id: 31, reporter: "dan", reason: "Offensive language", date: "2025-11-11" },
        { id: 32, reporter: "eva", reason: "Inappropriate images", date: "2025-11-14" },
        { id: 33, reporter: "frank", reason: "Harassment", date: "2025-11-15" },
      ],
    },
  ]);

  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || null);

  const selectedUser = useMemo(() => users.find((u) => u.id === selectedUserId) || null, [users, selectedUserId]);

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => b.reports.length - a.reports.length);
  }, [users]);

  const banUser = (id) => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to ban this user?")) return;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, banned: true } : u)));
  };

  const unbanUser = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, banned: false } : u)));
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
                {sorted.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    role="button"
                    className={`w-full flex items-center gap-4 p-3 rounded-md hover:bg-gray-50 transition text-left cursor-pointer ${
                      selectedUserId === u.id ? "ring-2 ring-purple-300" : ""
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-full flex-shrink-0 ${u.avatarColor} flex items-center justify-center text-white font-semibold`}>{u.username.charAt(0).toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{u.username}</div>
                      <div className="text-sm text-gray-500">Reports: <span className="font-semibold">{u.reports.length}</span></div>
                    </div>
                    {u.banned ? (
                      <div className="text-sm text-red-600 font-semibold">BANNED</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: selected user's reports + ban action */}
          <div className="col-span-7">
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
              {!selectedUser ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">Select a reported user to view reports.</div>
              ) : (
                <>
                  <div className="flex items-center gap-6 mb-4">
                    <div className={`h-16 w-16 rounded-full ${selectedUser.avatarColor} flex items-center justify-center text-white font-bold text-xl`}>{selectedUser.username.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="text-xl font-semibold">{selectedUser.username}</div>
                      <div className="text-sm text-gray-500">{selectedUser.reports.length} reports</div>
                    </div>
                    <div className="ml-auto">
                      {selectedUser.banned ? (
                        <button onClick={() => unbanUser(selectedUser.id)} className="px-3 py-1 bg-gray-300 rounded">Unban</button>
                      ) : (
                        <button onClick={() => banUser(selectedUser.id)} className="px-3 py-1 bg-red-600 text-white rounded">Ban User</button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h3 className="text-lg font-medium">Reports</h3>
                    <p className="text-sm text-gray-500">Review the reports below and take action if necessary.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3">
                    {selectedUser.reports.map((r) => (
                      <div key={r.id} className="p-3 border rounded-md bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{r.reporter}</div>
                            <div className="text-xs text-gray-500">{r.date}</div>
                          </div>
                          <div className="text-sm text-gray-500">Reason</div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">{r.reason}</div>
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
