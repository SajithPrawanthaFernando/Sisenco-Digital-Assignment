const Notification = require("../../models/notificationModel");

// service for getting notifications
exports.getNotifications = async (userId, unread) => {
  let query = { userId };
  if (unread === "true") {
    query.isRead = false;
  }

  return await Notification.find(query).sort({ date: -1 });
};

// service for mark as read
exports.markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }
};

// service for deleting notifications
exports.deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId,
  });

  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }
};
