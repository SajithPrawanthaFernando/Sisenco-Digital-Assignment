const express = require("express");
const balanceController = require("../../controllers/user/balanceController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/monthlybalance", balanceController.getMonthlyBalance); // Get user's monthly balance

module.exports = router;
