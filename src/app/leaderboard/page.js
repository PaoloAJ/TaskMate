import Navbar from "../components/Navbar";
import React from "react";

export default function LeaderboardPage() {
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
  // Sort pairs by streak descending so highest streaks appear first
  const sortedPairs = pairs.slice().sort((a, b) => b.streak - a.streak);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="default" />

      <div className="flex-1 px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="border rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Leaderboard</h3>
            <div className="space-y-4">
              {sortedPairs.map((p, index) => (
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
      </div>
    </div>
  );
}
