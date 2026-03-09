const cron = require("node-cron");
const Goal = require("../models/financialGoalModel");
const Notification = require("../models/notificationModel");
const { getIo } = require("../config/socket");

console.log("Goal Notification Cron Job Loaded!");

cron.schedule("0 9 * * *", async () => {
  console.log("Checking Near-Completion Goals...");

  try {
    const goals = await Goal.find({ isCompleted: false });

    for (let goal of goals) {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;

      if (progress >= 90 && progress < 100) {
        console.log(`Goal "${goal.title}" is 90% complete`);

        const existingNotification = await Notification.findOne({
          userId: goal.userId,
          message: new RegExp(`Goal "${goal.title}" is near completion`),
        });

        if (!existingNotification) {
          await Notification.create({
            userId: goal.userId,
            message: `Goal "${
              goal.title
            }" is near completion! You're at ${progress.toFixed(2)}%.`,
            isRead: false,
            date: new Date(),
          });

          // Send WebSocket notification
          getIo()
            .to(`notification-${goal.userId}`)
            .emit("goalProgress", {
              message: `Goal Progress: You are 90% towards your '${goal.title}' goal!`,
              goal: {
                title: goal.title,
                progress: `${progress.toFixed(2)}%`,
              },
            });

          console.log(
            `Notification sent for near-complete goal: "${goal.title}"`,
          );
        }
      }
    }

    console.log("Goal Notification Check Completed.");
  } catch (error) {
    console.error("Error in Goal Notification Cron Job:", error);
  }
});
