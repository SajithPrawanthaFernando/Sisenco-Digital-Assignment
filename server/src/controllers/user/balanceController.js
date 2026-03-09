const balanceService = require("../../services/user/balanceService");

// Controller for getting users monthly balance
exports.getMonthlyBalance = async (req, res, next) => {
  try {
    const balance = await balanceService.getMonthlyBalance(req.user._id);
    res.status(200).json(balance);
  } catch (error) {
    next(error);
  }
};
