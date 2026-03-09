const Transaction = require("../../models/transactionModel");

// service for getting users monthly balance
exports.getMonthlyBalance = async (userId) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  const [incomeResult, expenseResult] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "income",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
    ]),
  ]);

  const totalIncome = incomeResult.length ? incomeResult[0].totalIncome : 0;
  const totalExpenses = expenseResult.length
    ? expenseResult[0].totalExpenses
    : 0;
  const remainingBalance = totalIncome - totalExpenses;

  return { totalIncome, totalExpenses, remainingBalance };
};
