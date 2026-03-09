"use client";

import { GsapConfig } from "@/animations/GsapConfig";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GsapConfig>
      <div className="flex min-h-screen bg-zinc-950 text-white">
        {/* Persistent Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-8 ml-64 overflow-y-auto">{children}</main>
      </div>
    </GsapConfig>
  );
}
