const Transaction = require("../../models/transactionModel");
const Budget = require("../../models/budgetModel");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Goal = require("../../models/financialGoalModel");
const { getFinancialTrends } = require("../../services/user/financialService");

/**
 * Generate CSV Report for Transactions
 */
exports.generateTransactionCSV = async (filters) => {
  const transactions = await getFilteredTransactions(filters);

  const filePath = path.join(__dirname, "../../exports/transactions.csv");
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: "userId", title: "User ID" },
      { id: "title", title: "Title" },
      { id: "amount", title: "Amount" },
      { id: "currency", title: "Currency" },
      { id: "type", title: "Type" },
      { id: "category", title: "Category" },
      { id: "date", title: "Date" },
    ],
  });

  await csvWriter.writeRecords(transactions);
  return filePath;
};

/**
 * Generate PDF Report for Transactions
 */
exports.generateTransactionPDF = async (filters) => {
  const transactions = await getFilteredTransactions(filters);
  const filePath = path.join(__dirname, "../../exports/transactions.pdf");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.fontSize(20).text("Transactions Report", { align: "center" });
    doc.moveDown();

    transactions.forEach((t) => {
      doc.fontSize(12).text(`Title: ${t.title}`);
      doc.text(`Amount: ${t.amount} ${t.currency}`);
      doc.text(`Type: ${t.type}`);
      doc.text(`Date: ${new Date(t.date).toLocaleDateString()}`);
      doc.text(`Category: ${t.category}`);
      doc.moveDown();
    });

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

/**
 * Generate CSV Report for Budgets
 */
exports.generateBudgetCSV = async (filters) => {
  const budgets = await getFilteredBudgets(filters);

  const filePath = path.join(__dirname, "../../exports/budgets.csv");
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: "userId", title: "User ID" },
      { id: "category", title: "Category" },
      { id: "amount", title: "Budget Amount" },
      { id: "month", title: "Month" },
    ],
  });

  await csvWriter.writeRecords(budgets);
  return filePath;
};

/**
 * Generate PDF Report for Budgets
 */
exports.generateBudgetPDF = async (filters) => {
  const budgets = await getFilteredBudgets(filters);
  const filePath = path.join(__dirname, "../../exports/budgets.pdf");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.fontSize(20).text("Budgets Report", { align: "center" });
    doc.moveDown();

    budgets.forEach((b) => {
      doc.fontSize(12).text(`Category: ${b.category}`);
      doc.text(`Budget: ${b.amount}`);
      doc.text(`Month: ${b.month}`);
      doc.moveDown();
    });

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

/**
 * Generate Goals CSV Report
 */
exports.generateGoalCSV = async (userId) => {
  const goals = await Goal.find({ userId });

  if (!goals.length) {
    throw new Error("No goals found for this user.");
  }

  const filePath = path.join(__dirname, "../../exports/goals.csv");
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: "title", title: "Goal Title" },
      { id: "targetAmount", title: "Target Amount" },
      { id: "currentAmount", title: "Current Savings" },
      { id: "progress", title: "Progress (%)" },
      { id: "isCompleted", title: "Completed" },
      { id: "deadline", title: "Deadline" },
    ],
  });

  const records = goals.map((goal) => ({
    title: goal.title,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    progress: ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2),
    isCompleted: goal.isCompleted ? "Yes" : "No",
    deadline: goal.deadline.toISOString().split("T")[0],
  }));

  await csvWriter.writeRecords(records);
  return filePath;
};

/**
 * Generate Goals PDF Report
 */
exports.generateGoalPDF = async (userId) => {
  const goals = await Goal.find({ userId });

  if (!goals.length) {
    throw new Error("No goals found for this user.");
  }

  const filePath = path.join(__dirname, "../../exports/goals.pdf");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.fontSize(20).text("Savings Goals Report", { align: "center" });
    doc.moveDown();

    goals.forEach((goal) => {
      const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(
        2,
      );
      doc.fontSize(12).text(`Goal: ${goal.title}`);
      doc.text(`Target Amount: ${goal.targetAmount}`);
      doc.text(`Current Savings: ${goal.currentAmount}`);
      doc.text(`Progress: ${progress}%`);
      doc.text(`Completed: ${goal.isCompleted ? "Yes" : "No"}`);
      doc.text(`Deadline: ${goal.deadline.toISOString().split("T")[0]}`);
      doc.moveDown();
    });

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

/**
 * Generate CSV Report for Financial Trends
 */
exports.generateTrendCSV = async (userId, months = 6) => {
  const trends = await getFinancialTrends(userId, months);

  const filePath = path.join(__dirname, "../../exports/financial_trends.csv");
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: "year", title: "Year" },
      { id: "month", title: "Month" },
      { id: "totalIncome", title: "Total Income" },
      { id: "totalExpenses", title: "Total Expenses" },
      { id: "netBalance", title: "Net Balance" },
    ],
  });

  await csvWriter.writeRecords(trends);
  return filePath;
};

/**
 * Generate PDF Report for Financial Trends
 */
exports.generateTrendPDF = async (userId, months = 6) => {
  const trends = await getFinancialTrends(userId, months);

  const filePath = path.join(__dirname, "../../exports/financial_trends.pdf");
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("Financial Trends Report", { align: "center" });
    doc.moveDown();

    trends.forEach((trend) => {
      doc.fontSize(12).text(`Year: ${trend.year}, Month: ${trend.month}`);
      doc.text(`Total Income: ${trend.totalIncome}`);
      doc.text(`Total Expenses: ${trend.totalExpenses}`);
      doc.text(`Net Balance: ${trend.netBalance}`);
      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

/**
 * Helper Function: Get Filtered Transactions
 */
async function getFilteredTransactions(filters) {
  let query = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
  }
  return await Transaction.find(query);
}

/**
 * Helper Function: Get Filtered Budgets
 */
async function getFilteredBudgets(filters) {
  let query = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.category) query.category = filters.category;
  if (filters.month) query.month = filters.month;
  return await Budget.find(query);
}
