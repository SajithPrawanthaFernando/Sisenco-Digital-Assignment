const reportService = require("../../services/user/userreportService");

exports.exportTransactionCSV = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      userId: req.user._id,
    };

    const filePath = await reportService.generateTransactionCSV(filters);
    res.download(filePath, "transactions.csv");
  } catch (error) {
    next(error);
  }
};

exports.exportTransactionPDF = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      userId: req.user._id,
    };

    const filePath = await reportService.generateTransactionPDF(filters);
    res.download(filePath, "transactions.pdf");
  } catch (error) {
    next(error);
  }
};

exports.exportBudgetCSV = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      userId: req.user._id,
    };

    const filePath = await reportService.generateBudgetCSV(filters);
    res.download(filePath, "budgets.csv");
  } catch (error) {
    next(error);
  }
};

exports.exportBudgetPDF = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      userId: req.user._id,
    };

    const filePath = await reportService.generateBudgetPDF(filters);
    res.download(filePath, "budgets.pdf");
  } catch (error) {
    next(error);
  }
};

exports.exportGoalCSV = async (req, res, next) => {
  try {
    const filePath = await reportService.generateGoalCSV(req.user._id);
    res.download(filePath, "goals.csv");
  } catch (error) {
    next(error);
  }
};

exports.exportGoalPDF = async (req, res, next) => {
  try {
    const filePath = await reportService.generateGoalPDF(req.user._id);
    res.download(filePath, "goals.pdf");
  } catch (error) {
    next(error);
  }
};

exports.exportTrendCSV = async (req, res, next) => {
  try {
    const filePath = await reportService.generateTrendCSV(
      req.user._id,
      req.query.months || 6,
    );
    res.download(filePath, "financial_trends.csv");
  } catch (error) {
    next(error);
  }
};

exports.exportTrendPDF = async (req, res, next) => {
  try {
    const filePath = await reportService.generateTrendPDF(
      req.user._id,
      req.query.months || 6,
    );
    res.download(filePath, "financial_trends.pdf");
  } catch (error) {
    next(error);
  }
};
