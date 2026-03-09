import { useState, useEffect, useCallback } from "react";
import api from "@/lib/utils";
import { io } from "socket.io-client";
import { useToast } from "@/context/ToastContext";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications/getnotifications");

      const data = response.data.notifications || response.data;
      setNotifications(data);

      const unread = data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Frontend connected to WebSocket server");

      const userData = localStorage.getItem("user");

      if (userData) {
        try {
          const user = JSON.parse(userData);

          const userId = user._id;

          if (userId) {
            socket.emit("subscribe", { userId });
            console.log(`Subscribed to notifications for user: ${userId}`);
          }
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
        }
      }
    });

    socket.on("newNotification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      showToast(newNotif.message || "You have a new notification!", "success");
      console.log("Received new notification via WebSocket:", newNotif);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [showToast]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await api.put(`/notifications/mark-read/${id}`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      await api.delete(`/notifications/deletenotification/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
};
