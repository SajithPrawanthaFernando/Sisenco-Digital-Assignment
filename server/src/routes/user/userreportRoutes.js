const express = require("express");
const reportController = require("../../controllers/user/userreportController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// Export Transactions
router.get("/transactions/csv", reportController.exportTransactionCSV);
router.get("/transactions/pdf", reportController.exportTransactionPDF);

// Export Budgets
router.get("/budgets/csv", reportController.exportBudgetCSV);
router.get("/budgets/pdf", reportController.exportBudgetPDF);

// Export Goals as CSV
router.get("/export-goals/csv", reportController.exportGoalCSV);

// Export Goals as PDF
router.get("/export-goals/pdf", reportController.exportGoalPDF);

// Export Financial Trends as CSV
router.get("/financial-trends/csv", reportController.exportTrendCSV);

// Export Financial Trends as PDF
router.get("/financial-trends/pdf", reportController.exportTrendPDF);

module.exports = router;
