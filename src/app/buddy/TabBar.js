"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function TabBar() {
  const pathname = usePathname() || "";

  const isActive = (path) => pathname.startsWith(path);

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto flex justify-center py-6">
        <div className="flex items-center space-x-8">
          <Link href="/buddy/chat">
            <span className={"text-2xl font-semibold cursor-pointer " + (isActive('/buddy/chat') ? 'text-[#111827]' : 'text-gray-600')}>Chat</span>
          </Link>

          <Link href="/buddy/task">
            <span className={"text-2xl font-semibold cursor-pointer " + (isActive('/buddy/task') ? 'text-[#111827]' : 'text-gray-600')}>Task</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
