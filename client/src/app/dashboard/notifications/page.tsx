"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Bell, Check, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";

export default function NotificationsPage() {
  const container = useRef(null);
  const { notifications, loading, markAsRead, deleteNotification } =
    useNotifications();

  useGSAP(
    () => {
      if (!loading) {
        gsap.from(".notif-item, .anim-header", {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
          clearProps: "all",
        });
      }
    },
    { scope: container, dependencies: [loading] },
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-zinc-500 animate-pulse font-medium text-lg flex items-center gap-2">
          <Bell className="animate-bounce" size={20} />
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div ref={container} className="space-y-8 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 anim-header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <Bell size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Notifications
            </h2>
            <p className="text-zinc-400 mt-1">
              Stay updated on your budgets, goals, and account activity.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl min-h-[400px]">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-500 anim-header">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-zinc-300">All caught up!</h3>
            <p className="mt-2 text-sm">You have no new notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n: any) => (
              <div
                key={n._id}
                className={`notif-item flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border transition-all ${
                  n.isRead
                    ? "bg-zinc-800/20 border-zinc-800/50"
                    : "bg-blue-500/5 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon Indicator based on read status */}
                  <div className="mt-1">
                    {n.isRead ? (
                      <CheckCircle2 size={20} className="text-zinc-500" />
                    ) : (
                      <AlertCircle size={20} className="text-blue-500" />
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-sm sm:text-base ${
                        n.isRead ? "text-zinc-400" : "text-zinc-100 font-medium"
                      }`}
                    >
                      {n.message || "You have a new notification."}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1.5 font-medium uppercase tracking-wider">
                      {n.createdAt
                        ? format(
                            new Date(n.createdAt),
                            "MMM dd, yyyy • hh:mm a",
                          )
                        : "Just now"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 text-xs font-bold rounded-lg transition-colors"
                    >
                      <Check size={14} />
                      <span className="hidden sm:inline">Mark Read</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 text-xs font-bold rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
