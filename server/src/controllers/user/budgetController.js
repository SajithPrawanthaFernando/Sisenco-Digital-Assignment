const budgetService = require("../../services/user/budgetService");

// Controller for creating a budget
exports.createBudget = async (req, res, next) => {
  try {
    const { category, amount, month } = req.body;
    const budget = await budgetService.createBudget(req.user._id, {
      category,
      amount,
      month,
    });

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

// Controller for getting budgets
exports.getBudgets = async (req, res, next) => {
  try {
    const { month, category } = req.query;
    const budgets = await budgetService.getBudgets(req.user._id, {
      month,
      category,
    });

    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
};

// Controller for updating a budget
exports.updateBudget = async (req, res, next) => {
  try {
    const budgetId = req.params.id;
    const updatedBudget = await budgetService.updateBudget(
      req.user._id,
      budgetId,
      req.body
    );

    res.status(200).json(updatedBudget);
  } catch (error) {
    next(error);
  }
};

// Controller for deleting a budget
exports.deleteBudget = async (req, res, next) => {
  try {
    const budgetId = req.params.id;
    await budgetService.deleteBudget(req.user._id, budgetId);
    res.status(200).json({ message: "Budget deleted successfully." });
  } catch (error) {
    next(error);
  }
};
