"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <nav className="w-full p-6 flex justify-between items-center z-10 max-w-7xl mx-auto">
      <Link
        href="/"
        className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
      >
        ExpenTrack
      </Link>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <LayoutDashboard size={18} />
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-bold bg-white text-black hover:bg-zinc-200 rounded-full transition-colors"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
