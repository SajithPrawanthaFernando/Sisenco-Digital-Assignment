const express = require("express");
const financialController = require("../../controllers/user/financialController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

// Get Financial Trends
router.get("/financial-trends", financialController.getFinancialTrends);

// Get spending by category
router.get("/spending", financialController.getSpendingByCategory);

module.exports = router;
