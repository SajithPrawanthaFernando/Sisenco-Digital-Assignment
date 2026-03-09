const cron = require("node-cron");
const goalService = require("../services/user/goalService");
const User = require("../models/userModel");
const Goal = require("../models/financialGoalModel");
const { getIo } = require("../config/socket");
const Notification = require("../models/notificationModel");

console.log("Savings Allocation Cron Job Loaded!");

cron.schedule("0 23 28-31 * *", async () => {
  // Runs on the last day of the month at 11:59 PM
  console.log("Running Monthly Savings Allocation...");

  try {
    const usersWithGoals = await Goal.distinct("userId");

    for (let user of usersWithGoals) {
      console.log(`Allocating savings for User: ${user._id}`);
      const savingsData = await goalService.allocateSavings(user._id);

      // **Save Notification in the Database**
      const notification = await Notification.create({
        userId: user._id,
        message: `Monthly savings allocation completed. Your savings have been automatically distributed.`,
        isRead: false,
        date: new Date(),
      });

      console.log(`Notification stored: ${notification.message}`);

      // Send WebSocket notification for savings allocation
      getIo().to(`notification-${user._id}`).emit("savingsAllocated", {
        message: `Monthly savings allocation completed. Your savings have been automatically distributed.`,
        savingsData,
      });

      console.log(`Savings Allocation Notification Sent for User: ${user._id}`);
    }

    console.log("Monthly Savings Allocation Completed.");
  } catch (error) {
    console.error("Error in Monthly Savings Allocation:", error);
  }
});
