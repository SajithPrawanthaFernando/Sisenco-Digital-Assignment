const Transaction = require("../../models/transactionModel");
const currencyService = require("./currencyService");
const User = require("../../models/userModel");
const { getIo } = require("../../config/socket");
const mongoose = require("mongoose");

exports.createTransaction = async (userId, transactionData) => {
  transactionData.userId = userId;

  // Ensure user exists
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  // Validate fields
  const { title, amount, currency, type, date, category } = transactionData;

  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new Error("Title is required and must be a non-empty string.");
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }
  if (
    !currency ||
    !["USD", "EUR", "GBP", "LKR", "INR", "AUD", "CAD"].includes(currency)
  ) {
    throw new Error("Invalid currency format.");
  }
  if (!type || !["expense", "income"].includes(type)) {
    throw new Error("Transaction type must be 'expense' or 'income'.");
  }
  if (!date || isNaN(new Date(date).getTime())) {
    throw new Error("Invalid date format.");
  }
  if (!category || typeof category !== "string" || category.trim() === "") {
    throw new Error("Category is required and must be a non-empty string.");
  }

  if (
    transactionData.isRecurring === true &&
    (!transactionData.recurrenceEndDate ||
      isNaN(Date.parse(transactionData.recurrenceEndDate)))
  ) {
    throw new Error(
      "Please provide a valid end date for recurring transactions."
    );
  }

  // Validate recurrence fields if provided
  if (transactionData.isRecurring) {
    if (
      !["daily", "weekly", "monthly", "yearly"].includes(
        transactionData.recurrenceType
      )
    ) {
      throw new Error(
        "Invalid recurrence type. Must be 'daily', 'weekly', 'monthly', or 'yearly'."
      );
    }
    if (
      transactionData.recurrenceEndDate &&
      isNaN(new Date(transactionData.recurrenceEndDate).getTime())
    ) {
      throw new Error("Invalid recurrenceEndDate format.");
    }
  }

  // Convert currency
  const convertedAmount = await currencyService.convertCurrency(
    transactionData.amount,
    transactionData.currency,
    user.currency
  );
  transactionData.convertedAmount = convertedAmount;

  // Save transaction
  const transaction = await Transaction.create(transactionData);

  console.log("Transaction Created: ", transaction);

  // Send real-time WebSocket notification AFTER saving transaction
  try {
    console.log(`Sending WebSocket Message to: notification-${userId}`);

    getIo()
      .to(`notification-${userId}`)
      .emit("transactionUpdate", {
        message: `New transaction added: ${transaction.amount} ${transaction.currency} (Converted: ${transaction.convertedAmount} ${user.currency})`,
        transaction,
      });

    console.log(`Real-time transaction update sent to user: ${userId}`);
  } catch (error) {
    console.error("Error sending WebSocket notification:", error);
  }

  return transaction;
};

exports.getTransactions = async (userId, filters) => {
  let query = { userId };

  if (filters.transactionId) {
    if (!mongoose.Types.ObjectId.isValid(filters.transactionId)) {
      throw new Error("Invalid transaction ID format.");
    }
    query._id = filters.transactionId;
  }

  if (filters.category) {
    if (typeof filters.category !== "string") {
      throw new Error("Category filter must be a string.");
    }
    query.category = filters.category;
  }

  if (filters.type) {
    if (!["income", "expense"].includes(filters.type)) {
      throw new Error(
        "Invalid type filter. Allowed values: 'income' or 'expense'."
      );
    }
    query.type = filters.type;
  }

  if (filters.tags) {
    if (
      !Array.isArray(filters.tags) ||
      filters.tags.some((tag) => typeof tag !== "string")
    ) {
      throw new Error("Tags filter must be an array of strings.");
    }
    query.tags = { $in: filters.tags };
  }

  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      if (isNaN(dateFrom.getTime())) {
        throw new Error("Invalid dateFrom format.");
      }
      query.date.$gte = dateFrom;
    }
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      if (isNaN(dateTo.getTime())) {
        throw new Error("Invalid dateTo format.");
      }
      query.date.$lte = dateTo;
    }
  }

  return await Transaction.find(query).sort({ date: -1 });
};

/** Update Transaction */
exports.updateTransaction = async (userId, transactionId, updateData) => {
  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format.");
  }

  // Validate transactionId
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error("Invalid transaction ID format.");
  }

  // Check if user exists
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new Error("User not found.");
  }

  // Ensure at least one field is provided for the update
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new Error("At least one field is required to update.");
  }

  // Validate updateData fields
  const allowedUpdates = [
    "title",
    "amount",
    "type",
    "category",
    "date",
    "tags",
    "description",
  ];
  const invalidFields = Object.keys(updateData).filter(
    (key) => !allowedUpdates.includes(key)
  );

  if (invalidFields.length > 0) {
    throw new Error(`Invalid update fields: ${invalidFields.join(", ")}`);
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!transaction) {
    throw new Error("Transaction not found.");
  }

  return transaction;
};

/** Delete Transaction */
exports.deleteTransaction = async (userId, transactionId) => {
  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID format.");
    error.statusCode = 400;
    throw error;
  }

  // Validate transactionId format
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    const error = new Error("Invalid transaction ID format.");
    error.statusCode = 400;
    throw error;
  }

  // Check if user exists
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // Check if transaction exists and belongs to the user before deleting
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found.");
    error.statusCode = 404;
    throw error;
  }

  return { message: "Transaction deleted successfully." };
};
