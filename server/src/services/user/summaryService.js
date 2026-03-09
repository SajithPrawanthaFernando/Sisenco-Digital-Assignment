const Transaction = require("../../models/transactionModel");
const Goal = require("../../models/financialGoalModel");
const Budget = require("../../models/budgetModel");

// Income vs Expense summary
exports.getIncomeVsExpenseSummary = async (userId, startDate, endDate) => {
  console.log(`Generating Income vs Expense Summary for User: ${userId}`);

  const matchQuery = {
    userId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  };

  const summary = await Transaction.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  console.log(summary);
  let totalIncome = 0;
  let totalExpenses = 0;

  summary.forEach((entry) => {
    if (entry._id === "income") totalIncome = entry.totalAmount;
    if (entry._id === "expense") totalExpenses = entry.totalAmount;
  });

  console.log(`Income: ${totalIncome} | Expenses: ${totalExpenses}`);

  return {
    userId,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
};

/**
 * Get Budget Summary
 */
exports.getBudgetSummary = async (userId, startDate, endDate) => {
  console.log(`Generating Budget Summary for User: ${userId}`);

  // Get all budgets for the user in the specified date range
  const budgets = await Budget.find({
    userId,
    month: { $gte: startDate.slice(0, 7), $lte: endDate.slice(0, 7) }, // Convert to YYYY-MM format
  });

  if (!budgets.length) return { message: "No budgets found in this period." };

  // Get expenses for the same period
  const expenses = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: "expense",
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $group: {
        _id: "$category",
        totalSpent: { $sum: "$amount" },
      },
    },
  ]);

  // Map budgets and check how much has been spent in each category
  const budgetSummary = budgets.map((budget) => {
    const spent =
      expenses.find((e) => e._id === budget.category)?.totalSpent || 0;
    return {
      category: budget.category,
      budgetLimit: budget.amount,
      totalSpent: spent,
      remainingBudget: budget.amount - spent,
      exceeded: spent > budget.amount,
    };
  });

  return budgetSummary;
};

/**
 * Get Goals Summary
 */
exports.getGoalSummary = async (userId) => {
  console.log(`Generating Goal Summary for User: ${userId}`);

  // Get all goals for the user
  const goals = await Goal.find({ userId });

  if (!goals.length) return { message: "No goals found for this user." };

  // Map goals and calculate progress
  const goalSummary = goals.map((goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return {
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progress: progress.toFixed(2), // Convert to percentage
      isCompleted: goal.isCompleted,
      isNearCompletion: progress >= 90 && progress < 100, // Flag if goal is >90% complete
      deadline: goal.deadline,
    };
  });

  return goalSummary;
};
