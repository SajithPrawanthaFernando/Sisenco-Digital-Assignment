const Budget = require("../../models/budgetModel");
const Transaction = require("../../models/transactionModel");
const Notification = require("../../models/notificationModel");
const { getIo } = require("../../config/socket");
const mongoose = require("mongoose");

// Service for creating a budget
exports.createBudget = async (userId, budgetData) => {
  budgetData.userId = userId;

  // Check if budget already exists for this category & month
  const existingBudget = await Budget.findOne({
    userId,
    category: budgetData.category,
    month: budgetData.month,
  });
  if (existingBudget) {
    const error = new Error(
      "Budget for this category and month already exists.",
    );
    error.statusCode = 400;
    throw error;
  }

  return await Budget.create(budgetData);
};

// Service for getting budgets
exports.getBudgets = async (userId, filters) => {
  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format.");
  }

  let query = { userId: new mongoose.Types.ObjectId(userId) };

  // Validate and apply budgetId filter
  if (filters.budgetId) {
    if (!mongoose.Types.ObjectId.isValid(filters.budgetId)) {
      throw new Error("Invalid budget ID format.");
    }
    query._id = new mongoose.Types.ObjectId(filters.budgetId);
  }

  // Validate and apply month filter
  if (filters.month) {
    const monthRegex = /^\d{4}-\d{2}$/; // Ensures format YYYY-MM
    if (!monthRegex.test(filters.month)) {
      throw new Error("Invalid month format. Use YYYY-MM.");
    }
    query.month = filters.month;
  }

  // Validate and apply category filter
  if (filters.category) {
    if (typeof filters.category !== "string") {
      throw new Error("Category must be a string.");
    }
    query.category = filters.category;
  }

  return await Budget.find(query);
};

// Service for updating a budget
exports.updateBudget = async (userId, budgetId, updateData) => {
  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format.");
  }

  // Validate budgetId format
  if (!mongoose.Types.ObjectId.isValid(budgetId)) {
    throw new Error("Invalid budget ID format.");
  }

  // Ensure at least one field is provided for the update
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new Error("At least one field is required to update.");
  }

  // Validate amount if provided
  if (updateData.amount !== undefined) {
    if (typeof updateData.amount !== "number" || updateData.amount < 0) {
      throw new Error("Budget amount must be a positive number.");
    }
  }

  // Validate month if provided
  if (updateData.month) {
    const monthRegex = /^\d{4}-\d{2}$/; // YYYY-MM format
    if (!monthRegex.test(updateData.month)) {
      throw new Error("Invalid month format. Use YYYY-MM.");
    }
  }

  // Validate category if provided
  if (updateData.category && typeof updateData.category !== "string") {
    throw new Error("Category must be a string.");
  }

  const budget = await Budget.findOneAndUpdate(
    { _id: budgetId, userId },
    updateData,
    {
      new: true,
      runValidators: true, // Ensures schema validation rules apply
    },
  );

  if (!budget) {
    throw new Error("Budget not found.");
  }

  return budget;
};

// Service for deleting a budget
exports.deleteBudget = async (userId, budgetId) => {
  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format.");
  }

  // Validate budgetId format
  if (!mongoose.Types.ObjectId.isValid(budgetId)) {
    throw new Error("Invalid budget ID format.");
  }

  const budget = await Budget.findOneAndDelete({ _id: budgetId, userId });

  if (!budget) {
    throw new Error("Budget not found.");
  }

  return { message: "Budget deleted successfully." };
};

// Service for geting budget status
exports.checkBudgetStatus = async (userId, month) => {
  console.log(`Checking budgets for user: ${userId}, month: ${month}`);

  if (!userId || !month) {
    console.error("Missing userId or month in budget check.");
    return [];
  }

  const budgets = await Budget.find({ userId, month });

  if (!budgets.length) {
    console.log("No budgets found for this month.");
    return [];
  }

  let exceededBudgets = [];

  for (let budget of budgets) {
    console.log(
      `Checking category: ${budget.category}, budget: ${budget.amount}`,
    );

    const totalSpent = await Transaction.aggregate([
      {
        $match: {
          userId,
          category: budget.category,
          type: "expense",
          date: {
            $gte: new Date(`${month}-01`),
            $lte: new Date(`${month}-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const spent = totalSpent.length ? totalSpent[0].totalAmount : 0;
    const isExceeded = spent > budget.amount;

    console.log(
      `Spent: ${spent} / Budget: ${budget.amount} (Exceeded: ${isExceeded})`,
    );

    if (isExceeded) {
      // Update budget exceeded status if changed
      if (isExceeded !== budget.isExceeded) {
        await Budget.findByIdAndUpdate(budget._id, { isExceeded });
        console.log(
          `Budget updated: ${budget.category} -> isExceeded = ${isExceeded}`,
        );
      } else {
        console.log(
          `Budget already exceeded for ${budget.category}, sending reminder notification.`,
        );
      }

      // Prevent duplicate notifications within the same day
      const today = new Date().toISOString().slice(0, 10);
      const existingNotification = await Notification.findOne({
        userId: budget.userId,
        message: new RegExp(`Budget exceeded for ${budget.category}`),
        date: { $gte: new Date(today) },
      });

      if (!existingNotification) {
        const notification = await Notification.create({
          userId: budget.userId,
          message: `Budget exceeded for ${budget.category}: Spent ${spent}/${budget.amount}`,
          isRead: false,
          date: new Date(),
        });

        console.log(
          `Notification Created: Budget exceeded for ${budget.category}`,
        );

        // Send WebSocket Notification
        getIo().to(`notification-${userId}`).emit("budgetExceeded", {
          message: notification.message,
          category: budget.category,
          spent,
          budget: budget.amount,
        });

        console.log(`Budget Exceeded Notification Sent for ${budget.category}`);
      } else {
        console.log(
          `Notification already exists for ${budget.category} today. Skipping.`,
        );
      }

      exceededBudgets.push({
        userId: budget.userId,
        category: budget.category,
        spent,
        budget: budget.amount,
      });
    } else {
      console.log(`No change in exceeded status for ${budget.category}`);
    }
  }

  return exceededBudgets;
};

// Service for analyzing budget spending trends
exports.analyzeSpendingTrends = async (userId, month) => {
  console.log(`Analyzing spending trends for user: ${userId}, month: ${month}`);

  const budgets = await Budget.find({ userId, month });

  if (!budgets.length) {
    console.log("No budgets found for analysis.");
    return [];
  }

  let recommendations = [];

  for (let budget of budgets) {
    console.log(
      `Checking category: ${budget.category}, budget: ${budget.amount}`,
    );

    // Get last 3 months' spending
    const pastMonths = getPreviousMonths(month, 3);
    const spendingHistory = await Transaction.aggregate([
      {
        $match: {
          userId,
          category: budget.category,
          type: "expense",
          date: { $gte: new Date(pastMonths[0] + "-01") },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const currentSpent = await Transaction.aggregate([
      {
        $match: {
          userId,
          category: budget.category,
          type: "expense",
          date: {
            $gte: new Date(`${month}-01`),
            $lte: new Date(`${month}-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const spentThisMonth = currentSpent.length ? currentSpent[0].totalSpent : 0;
    const avgSpent =
      spendingHistory.reduce((acc, entry) => acc + entry.totalSpent, 0) /
        pastMonths.length || spentThisMonth;

    console.log(
      `Avg. Past 3 Months: ${avgSpent} | This Month: ${spentThisMonth}`,
    );

    let adjustment = null;
    let notificationMessage = null;

    // Suggest Increasing Budget if user frequently overspends
    if (spentThisMonth > budget.amount && spentThisMonth > avgSpent) {
      adjustment = Math.ceil(spentThisMonth * 1.2); // Increase budget by 20%
      recommendations.push({
        category: budget.category,
        suggestedBudget: adjustment,
      });

      console.log(`Increase recommended: ${budget.category} -> ${adjustment}`);

      notificationMessage = `Based on your spending trends, we recommend increasing your "${budget.category}" budget to ${adjustment} LKR.`;
    }

    // Suggest Decreasing Budget if user regularly underspends
    if (spentThisMonth < budget.amount * 0.7) {
      adjustment = Math.floor(spentThisMonth * 1.1); // Reduce budget to 110% of current spending
      recommendations.push({
        category: budget.category,
        suggestedBudget: adjustment,
      });

      console.log(`Decrease recommended: ${budget.category} -> ${adjustment}`);

      notificationMessage = `You are underspending in "${budget.category}". We recommend lowering your budget to ${adjustment} LKR.`;
    }

    // Store and Send Notification if there is an adjustment suggestion
    if (notificationMessage) {
      const today = new Date().toISOString().slice(0, 10);

      // Check if a similar notification already exists for today
      const existingNotification = await Notification.findOne({
        userId,
        message: new RegExp(notificationMessage),
        date: { $gte: new Date(today) },
      });

      if (!existingNotification) {
        const notification = await Notification.create({
          userId,
          message: notificationMessage,
          isRead: false,
          date: new Date(),
        });

        console.log(`Notification Created: ${notificationMessage}`);

        // Send WebSocket Notification
        getIo().to(`notification-${userId}`).emit("budgetRecommendation", {
          message: notification.message,
          category: budget.category,
          suggestedBudget: adjustment,
        });

        console.log(
          `Budget Recommendation Notification Sent for ${budget.category}`,
        );
      } else {
        console.log(
          `Notification already exists for ${budget.category} today. Skipping.`,
        );
      }
    }
  }

  return recommendations;
};

/**
 * Get last `numMonths` months in YYYY-MM format
 */
function getPreviousMonths(currentMonth, numMonths) {
  const months = [];
  let [year, month] = currentMonth.split("-").map(Number);

  for (let i = 0; i < numMonths; i++) {
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    months.push(`${year}-${month.toString().padStart(2, "0")}`);
  }

  return months;
}
