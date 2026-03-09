"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  LayoutDashboard,
  Receipt,
  Target,
  PieChart,
  FileText,
  Settings,
  LogOut,
  Bell,
  Check,
  Trash2,
  X,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications"; // Import new hook
import { format } from "date-fns"; // Optional: For formatting dates nicely

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Transactions", icon: Receipt, href: "/dashboard/transactions" },
  { name: "Goals", icon: Target, href: "/dashboard/goals" },
  { name: "Budgets", icon: PieChart, href: "/dashboard/budgets" },
  { name: "Reports", icon: FileText, href: "/dashboard/reports" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const sidebarRef = useRef(null);

  // Hook states
  const { notifications, unreadCount, markAsRead, deleteNotification } =
    useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  useGSAP(
    () => {
      gsap.from(".nav-item", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: sidebarRef, dependencies: [] },
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 h-full w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col p-6 z-50"
    >
      <div className="nav-item mb-10 px-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          <Link href="/">ExpenTrack</Link>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                  : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white border border-transparent"
              }`}
            >
              <Icon
                size={20}
                className={
                  isActive
                    ? "text-blue-400"
                    : "text-zinc-400 group-hover:text-white"
                }
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="nav-item relative mt-auto mb-2">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border ${
            showNotifications
              ? "bg-zinc-800 text-white border-zinc-700"
              : "text-zinc-300 hover:text-white hover:bg-zinc-800/50 border-transparent"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell
                size={20}
                className={unreadCount > 0 ? "text-blue-400" : ""}
              />
              {/* Red dot indicator */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#09090b]"></span>
              )}
            </div>
            <span className="font-medium">Notifications</span>
          </div>
          {/* Badge count */}
          {unreadCount > 0 && (
            <span className="bg-red-500/10 text-red-500 py-0.5 px-2 rounded-full text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Floating Notifications Panel (Pops out to the right) */}
        {showNotifications && (
          <div className="absolute bottom-0 left-full ml-4 w-[340px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-in fade-in slide-in-from-left-4 duration-200">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 backdrop-blur-sm">
              <h3 className="font-bold text-white">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
              {!notifications || notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
                  <Bell size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((n: any) => (
                  <div
                    key={n._id}
                    className={`p-4 rounded-xl border transition-colors group relative ${
                      n.isRead
                        ? "border-transparent bg-transparent hover:bg-zinc-800/30"
                        : "border-blue-500/20 bg-blue-500/5"
                    }`}
                  >
                    <p
                      className={`text-sm pr-12 ${
                        n.isRead ? "text-zinc-400" : "text-zinc-200 font-medium"
                      }`}
                    >
                      {n.message || "Notification"}
                    </p>

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                        {n.createdAt
                          ? format(new Date(n.createdAt), "MMM dd, hh:mm a")
                          : "New"}
                      </span>

                      {/* Action Icons (Show on hover) */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-md transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n._id)}
                          className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="nav-item flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </aside>
  );
}
