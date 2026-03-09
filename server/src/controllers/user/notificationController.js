const notificationService = require("../../services/user/notificationService");

// Controller for get notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { unread } = req.query;
    const notifications = await notificationService.getNotifications(
      req.user._id,
      unread
    );
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// Controller for mark as read
exports.markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user._id);
    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    next(error);
  }
};

// Controller for delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user._id);
    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    next(error);
  }
};
