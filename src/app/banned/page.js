"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { generateClient } from "aws-amplify/data";
import { useAuth } from "@/lib/auth-context";

const client = generateClient({ authMode: "userPool" });

export default function Page() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        if (!user?.userId) {
          setProfile(null);
          return;
        }
        const res = await client.models.UserProfile.get({ id: user.userId });
        if (cancelled) return;
        setProfile(res?.data || null);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.userId]);

  // If still loading auth/profile, show neutral loader
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Checking account status…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="banned" />
      <div className="flex-1 px-8 py-12">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold text-red-600">Account BANNED</h1>
          <p className="mt-4 text-gray-700">Your account has been BANNED and you cannot access TaskMate.</p>

          <div className="mt-6">
            <p className="text-sm text-gray-600">If you believe this is a mistake, contact support at <a href="mailto:TaskMate@tm.com" className="text-purple-600">TaskMate@tm.com</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
