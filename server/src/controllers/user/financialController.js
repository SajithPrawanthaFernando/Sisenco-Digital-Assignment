const financialService = require("../../services/user/financialService");

/** Get Financial Trends */
exports.getFinancialTrends = async (req, res, next) => {
  try {
    const months = req.query.months || 6; // Default to last 6 months
    const trends = await financialService.getFinancialTrends(months);
    res.status(200).json(trends);
  } catch (error) {
    next(error);
  }
};

/** Get spending by category */
exports.getSpendingByCategory = async (req, res, next) => {
  try {
    const spendingData = await financialService.getSpendingByCategory(
      req.user._id
    );
    res.status(200).json(spendingData);
  } catch (error) {
    next(error);
  }
};
