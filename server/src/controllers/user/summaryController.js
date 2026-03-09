const summaryService = require("../../services/user/summaryService");

// Controller for getting expense vs income
exports.getIncomeVsExpenseSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required." });
    }

    const summary = await summaryService.getIncomeVsExpenseSummary(
      userId,
      startDate,
      endDate
    );
    res.status(200).json(summary);
  } catch (error) {
    console.error("Error generating summary:", error);
    next(error);
  }
};

/** Get Budget Summary */
exports.getBudgetSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required." });
    }

    const summary = await summaryService.getBudgetSummary(
      req.user._id,
      startDate,
      endDate
    );
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

/** Get Goal Summary */
exports.getGoalSummary = async (req, res, next) => {
  try {
    const summary = await summaryService.getGoalSummary(req.user._id);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};
