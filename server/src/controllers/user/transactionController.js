const transactionService = require("../../services/user/transactionService");

exports.createTransaction = async (req, res, next) => {
  try {
    const {
      title,
      amount,
      type,
      date,
      currency,
      category,
      description,
      tags,
      isRecurring,
      recurrenceType,
      recurrenceEndDate,
    } = req.body;
    const transaction = await transactionService.createTransaction(
      req.user._id,
      {
        title,
        amount,
        type,
        date,
        category,
        currency,
        description,
        tags,
        isRecurring,
        recurrenceType,
        recurrenceEndDate,
      }
    );

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { category, type, tags, dateFrom, dateTo } = req.query;
    const transactions = await transactionService.getTransactions(
      req.user._id,
      { category, type, tags, dateFrom, dateTo }
    );
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const transactionId = req.params.id;
    const updatedTransaction = await transactionService.updateTransaction(
      req.user._id,
      transactionId,
      req.body
    );
    res.status(200).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transactionId = req.params.id;
    await transactionService.deleteTransaction(req.user._id, transactionId);
    res.status(200).json({ message: "Transaction deleted successfully." });
  } catch (error) {
    next(error);
  }
};
