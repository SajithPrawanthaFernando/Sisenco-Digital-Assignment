const express = require("express");
const goalController = require("../../controllers/user/goalController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.post("/creategoal", goalController.createGoal); // Create a new goal
router.get("/getgoals", goalController.getGoals); // Get all goals for user
router.put("/updategoals/:goalId", goalController.updateGoal); // Update a goal
router.delete("/deletegoals/:goalId", goalController.deleteGoal); // Delete a goal

module.exports = router;
