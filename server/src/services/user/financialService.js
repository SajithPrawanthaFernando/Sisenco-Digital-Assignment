const Transaction = require("../../models/transactionModel");
const { getIo } = require("../../config/socket");

/**
 * Get Financial Trends Over Time
 */
exports.getFinancialTrends = async (userId, months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const trends = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          year: { $year: "$date" },
        },
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },
        totalExpenses: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return trends.map((trend) => ({
    month: trend._id.month,
    year: trend._id.year,
    totalIncome: trend.totalIncome,
    totalExpenses: trend.totalExpenses,
    netBalance: trend.totalIncome - trend.totalExpenses,
  }));
};

/**
 * Detect Spending Increase and Send WebSocket Notification
 */
exports.detectSpendingIncrease = async (userId, months = 6) => {
  console.log(`Checking spending trends for user: ${userId}`);

  const trends = await this.getFinancialTrends(months);

  if (trends.length < 2) return;

  const lastMonth = trends[trends.length - 2];
  const currentMonth = trends[trends.length - 1];

  if (currentMonth.totalExpenses > lastMonth.totalExpenses * 1.3) {
    const today = new Date().toISOString().slice(0, 10);
    const message = `Your spending increased by more than 30% this month! Last month: ${lastMonth.totalExpenses} LKR, This month: ${currentMonth.totalExpenses} LKR.`;

    // Check if a similar notification already exists for today
    const existingNotification = await Notification.findOne({
      userId,
      message: new RegExp(`spending increased by more than 30%`),
      date: { $gte: new Date(today) },
    });

    if (!existingNotification) {
      // Store notification in database
      await Notification.create({
        userId,
        message,
        isRead: false,
        date: new Date(),
      });

      console.log(`Notification Stored: ${message}`);

      // Send WebSocket Notification
      getIo().to(`notification-${userId}`).emit("spendingAlert", {
        message,
        lastMonth: lastMonth.totalExpenses,
        currentMonth: currentMonth.totalExpenses,
      });

      console.log(`Spending Alert Sent for User: ${userId}`);
    } else {
      console.log(`Spending alert already exists for today. Skipping.`);
    }
  }
};

/**
 * Get spending by category
 */
exports.getSpendingByCategory = async (userId) => {
  const spendingData = await Transaction.aggregate([
    { $match: { userId, type: "expense" } },
    {
      $group: {
        _id: "$category",
        totalSpent: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } }, // Sort by highest spending
  ]);

  const totalExpenses = spendingData.reduce(
    (sum, cat) => sum + cat.totalSpent,
    0,
  );

  return spendingData.map((category) => ({
    category: category._id,
    totalSpent: category.totalSpent,
    percentage: ((category.totalSpent / totalExpenses) * 100).toFixed(2) + "%",
    transactionCount: category.count,
  }));
};
