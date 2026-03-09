const goalService = require("../../services/user/goalService");

// Controller for creating a goal
exports.createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, deadline, savingsPercentage } = req.body;
    const goal = await goalService.createGoal(
      req.user._id,
      title,
      targetAmount,
      deadline,
      savingsPercentage
    );
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

// Controller for getting goals
exports.getGoals = async (req, res, next) => {
  try {
    const { goalId, isCompleted, startDate, endDate } = req.query;

    const filters = {
      goalId,
      isCompleted:
        isCompleted !== undefined ? isCompleted === "true" : undefined,
      startDate,
      endDate,
    };

    const goals = await goalService.getGoals(req.user._id, filters);
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
};

// Controller for updating a goal
exports.updateGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const updates = req.body;
    const updatedGoal = await goalService.updateGoal(
      req.user._id,
      goalId,
      updates
    );
    res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
};

// Controller for deleting a goal
exports.deleteGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    await goalService.deleteGoal(req.user._id, goalId);
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    next(error);
  }
};
