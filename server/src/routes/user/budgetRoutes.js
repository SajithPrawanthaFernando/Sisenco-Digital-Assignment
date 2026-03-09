const express = require("express");
const budgetController = require("../../controllers/user/budgetController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.post("/createbudget", budgetController.createBudget); // Create a budget
router.get("/getbudget", budgetController.getBudgets); // Get budgets
router.put("/updatebudget/:id", budgetController.updateBudget); // Update a budget
router.delete("/deletebudget/:id", budgetController.deleteBudget); // Delete a budget

module.exports = router;
