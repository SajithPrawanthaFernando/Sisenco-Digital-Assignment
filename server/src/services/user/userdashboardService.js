const Transaction = require("../../models/transactionModel");
const Goal = require("../../models/financialGoalModel");
const User = require("../../models/userModel");
const Budget = require("../../models/budgetModel");

exports.getSavingsProgressData = async (userId) => {
  const goals = await Goal.find({ userId });

  return goals.map((goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return {
      _id: goal._id,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progress: progress.toFixed(2), // Convert to percentage
      isCompleted: goal.isCompleted,
      isNearCompletion: progress >= 90 && progress < 100, // Flag if goal is >90% complete
      deadline: goal.deadline,
    };
  });
};

exports.getUserDashboardData = async (userId) => {
  const totalIncome = await Transaction.aggregate([
    { $match: { userId, type: "income" } },
    { $group: { _id: null, totalIncome: { $sum: "$amount" } } },
  ]);

  const totalExpenses = await Transaction.aggregate([
    { $match: { userId, type: "expense" } },
    { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
  ]);

  const goals = await Goal.find({ userId });
  const budgets = await Budget.find({ userId });

  return {
    totalIncome: totalIncome.length ? totalIncome[0].totalIncome : 0,
    totalExpenses: totalExpenses.length ? totalExpenses[0].totalExpenses : 0,
    remainingBalance:
      (totalIncome.length ? totalIncome[0].totalIncome : 0) -
      (totalExpenses.length ? totalExpenses[0].totalExpenses : 0),
    goals,
    budgets,
  };
};
