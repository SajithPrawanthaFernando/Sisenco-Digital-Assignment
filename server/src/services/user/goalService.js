const Goal = require("../../models/financialGoalModel");
const balanceService = require("./balanceService");
const mongoose = require("mongoose");
const User = require("../../models/userModel");

// Service for creating a goal
exports.createGoal = async (
  userId,
  title,
  targetAmount,
  deadline,
  savingsPercentage
) => {
  const existingGoals = await Goal.find({ userId });

  let totalPercentage = existingGoals.reduce(
    (sum, goal) => sum + goal.savingsPercentage,
    0
  );
  totalPercentage += savingsPercentage; // Add the new goal's percentage

  if (totalPercentage > 100) {
    throw new Error(
      "Total savings percentage across goals cannot exceed 100%."
    );
  }

  return await Goal.create({
    userId,
    title,
    targetAmount,
    deadline,
    savingsPercentage,
  });
};

// Service for getting goals
exports.getGoals = async (userId, filters) => {
  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format.");
  }

  let query = { userId: new mongoose.Types.ObjectId(userId) };

  // Validate goalId if provided
  if (filters.goalId) {
    if (!mongoose.Types.ObjectId.isValid(filters.goalId)) {
      throw new Error("Invalid goal ID format.");
    }
    query._id = new mongoose.Types.ObjectId(filters.goalId);
  }

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new Error("User not found.");
  }

  if (filters.isCompleted !== undefined)
    query.isCompleted = filters.isCompleted;

  // Validate and apply date filters
  if (filters.startDate || filters.endDate) {
    query.deadline = {};
    if (filters.startDate) {
      if (isNaN(Date.parse(filters.startDate))) {
        throw new Error("Invalid start date format.");
      }
      query.deadline.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      if (isNaN(Date.parse(filters.endDate))) {
        throw new Error("Invalid end date format.");
      }
      query.deadline.$lte = new Date(filters.endDate);
    }
  }

  // Log query for debugging
  console.log("Goal Query:", query);

  return await Goal.find(query).sort({ deadline: 1 });
};

exports.allocateSavings = async (userId) => {
  const { remainingBalance } = await balanceService.getMonthlyBalance(userId);
  if (remainingBalance <= 0) {
    console.log("No remaining balance to allocate for savings.");
    return;
  }

  const goals = await Goal.find({ userId, isCompleted: false });

  let totalPercentage = goals.reduce(
    (sum, goal) => sum + goal.savingsPercentage,
    0
  );
  if (totalPercentage > 100) {
    throw new Error(
      "Total savings percentage across goals cannot exceed 100%."
    );
  }

  for (let goal of goals) {
    const savingsAmount = (remainingBalance * goal.savingsPercentage) / 100;

    goal.currentAmount += savingsAmount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    await goal.save();
    console.log(`${savingsAmount} allocated to "${goal.title}"`);
  }
};

// Service for updating goals
exports.updateGoal = async (userId, goalId, updates) => {
  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format.");
  }

  // Validate goalId format
  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    throw new Error("Invalid goal ID format.");
  }

  // Ensure at least one field is provided for the update
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("At least one field is required to update.");
  }

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new Error("User not found.");
  }

  // Validate savings percentage if provided
  if (updates.savingsPercentage !== undefined) {
    if (
      typeof updates.savingsPercentage !== "number" ||
      updates.savingsPercentage < 0 ||
      updates.savingsPercentage > 100
    ) {
      throw new Error("Savings percentage must be a number between 0 and 100.");
    }
  }

  const goalToUpdate = await Goal.findOne({ _id: goalId, userId });
  if (!goalToUpdate) throw new Error("Goal not found.");

  const existingGoals = await Goal.find({ userId, _id: { $ne: goalId } });

  let totalPercentage = existingGoals.reduce(
    (sum, goal) => sum + goal.savingsPercentage,
    0
  );

  totalPercentage +=
    updates.savingsPercentage || goalToUpdate.savingsPercentage;

  if (totalPercentage > 100) {
    throw new Error(
      "Total savings percentage across goals cannot exceed 100%."
    );
  }

  return await Goal.findOneAndUpdate({ _id: goalId, userId }, updates, {
    new: true,
    runValidators: true,
  });
};

// Service for deleting goals with validation
exports.deleteGoal = async (userId, goalId) => {
  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format.");
  }

  // Validate goalId format
  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    throw new Error("Invalid goal ID format.");
  }

  const goal = await Goal.findOneAndDelete({ _id: goalId, userId });

  if (!goal) {
    throw new Error("Goal not found.");
  }

  return { message: "Goal deleted successfully." };
};
