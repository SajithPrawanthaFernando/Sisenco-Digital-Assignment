const express = require("express");
const dashboardController = require("../../controllers/user/userdashboardController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/savings-progress", dashboardController.getSavingsProgress); // Get savings progress
router.get("/user", dashboardController.getUserDashboard); // User dashboard

module.exports = router;
