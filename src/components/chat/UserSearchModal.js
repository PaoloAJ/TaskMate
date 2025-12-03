import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";

const client = generateClient({ authMode: "userPool" });

export default function UserSearchModal({ isOpen, onClose, onSelectUser, currentUserId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const { data } = await client.models.UserProfile.list();
      // Filter out current user
      const filteredUsers = data?.filter((user) => user.id !== currentUserId) || [];
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setIsLoading(false);
  }

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#563478]">Start New Conversation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#8B5A96]"
        />

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-gray-500 py-4">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No users found</p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  {user.program && (
                    <p className="text-sm text-gray-600">{user.program}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
