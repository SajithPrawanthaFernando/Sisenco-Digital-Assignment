const express = require("express");
const notificationController = require("../../controllers/user/notificationController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/getnotifications", notificationController.getNotifications); // Get all notifications
router.put("/mark-read/:id", notificationController.markAsRead); // Mark as read

router.delete(
  "/deletenotification/:id",
  notificationController.deleteNotification,
); // Delete notification

module.exports = router;
