const express = require("express");
const summaryController = require("../../controllers/user/summaryController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// Get income vs. expenses summary
router.get("/income-vs-expense", summaryController.getIncomeVsExpenseSummary);

// Get Budget Summary
router.get("/budget-summary", summaryController.getBudgetSummary);

// Get Goal Summary
router.get("/goal-summary", summaryController.getGoalSummary);

module.exports = router;
