const cron = require("node-cron");
const budgetService = require("../services/user/budgetService");
const Budget = require("../models/budgetModel");
const { getIo } = require("../config/socket");

console.log("Budget Checker Cron Job Loaded!");

cron.schedule("*/5 * * * *", async () => {
  console.log("Running Budget Status Check...");

  try {
    // Get all users who have budgets
    const usersWithBudgets = await Budget.distinct("userId");

    for (const userId of usersWithBudgets) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      console.log(
        `Checking budgets for user: ${userId}, month: ${currentMonth}`,
      );

      const exceededBudgets = await budgetService.checkBudgetStatus(
        userId,
        currentMonth,
      );

      await budgetService.analyzeSpendingTrends(userId, currentMonth);
    }

    console.log("Budget Status Check Completed.");
  } catch (error) {
    console.error("Error in Budget Checker Cron Job:", error);
  }
});
