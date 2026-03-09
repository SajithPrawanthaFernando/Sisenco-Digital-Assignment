const cron = require("node-cron");
const Transaction = require("../models/transactionModel");
const { getIo } = require("../config/socket");
const Notification = require("../models/notificationModel");

console.log("Recurring Transactions Cron Job Loaded!");

cron.schedule("0 0 * * *", async () => {
  console.log("Running Recurring Transactions Job...");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recurringTransactions = await Transaction.find({
      isRecurring: true,
      recurrenceEndDate: { $gte: today },
    });

    for (const transaction of recurringTransactions) {
      console.log(`Checking transaction: ${transaction.title}`);

      if (await shouldCreateTransaction(transaction, today)) {
        const newTransaction = await createRecurringTransaction(transaction);
        console.log(`Recurring transaction processed: ${transaction.title}`);

        // **Save Notification in the Database**
        const notification = await Notification.create({
          userId: transaction.userId,
          message: `Your recurring transaction '${newTransaction.title}' (${
            newTransaction.amount
          } ${newTransaction.currency || "LKR"}) has been processed.`,
          isRead: false,
          date: new Date(),
        });

        console.log(`Notification stored: ${notification.message}`);

        // Send WebSocket notification
        getIo()
          .to(`notification-${transaction.userId}`)
          .emit("recurringTransactionProcessed", {
            message: `Your recurring transaction '${newTransaction.title}' (${
              newTransaction.amount
            } ${newTransaction.currency || "LKR"}) has been processed.`,
            transaction: newTransaction,
          });

        console.log(
          `Recurring Transaction Notification Sent: ${newTransaction.title}`,
        );
      } else {
        console.log(`No new transaction needed for: ${transaction.title}`);
      }
    }

    console.log("Recurring Transactions Job Completed.");
  } catch (error) {
    console.error("Error in Recurring Transactions Job:", error);
  }
});

/**
 * Determines if a recurring transaction should be created
 */
async function shouldCreateTransaction(transaction, today) {
  const lastTransactionDate = new Date(transaction.date);
  lastTransactionDate.setHours(0, 0, 0, 0);

  const recurrenceType = transaction.recurrenceType;
  if (!recurrenceType) return false;

  // Check if a recurring transaction already exists for today
  const existingTransaction = await Transaction.findOne({
    userId: transaction.userId,
    title: transaction.title,
    date: today, // Ensures only one transaction per day
    isRecurring: true,
  });

  if (existingTransaction) {
    console.log(
      `Skipping duplicate recurring transaction for: ${transaction.title}`,
    );
    return false;
  }

  switch (recurrenceType) {
    case "daily":
      return hasDaysPassed(lastTransactionDate, today, 1);
    case "weekly":
      return hasDaysPassed(lastTransactionDate, today, 7);
    case "monthly":
      return hasMonthsPassed(lastTransactionDate, today, 1);
    case "yearly":
      return hasYearsPassed(lastTransactionDate, today, 1);
    default:
      return false;
  }
}

/**
 * Creates a new recurring transaction (Only if not already created)
 */
async function createRecurringTransaction(transaction) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if a transaction was already created today
  const existingTransaction = await Transaction.findOne({
    userId: transaction.userId,
    title: transaction.title,
    date: today,
    isRecurring: true,
  });

  if (existingTransaction) {
    console.log(
      `Skipping duplicate recurring transaction for today: ${transaction.title}`,
    );
    return null;
  }

  const newTransaction = new Transaction({
    userId: transaction.userId,
    title: transaction.title,
    amount: transaction.amount,
    type: transaction.type,
    date: today,
    currency: transaction.currency || "LKR",
    category: transaction.category,
    description: transaction.description,
    tags: transaction.tags,
    isRecurring: transaction.isRecurring,
    recurrenceType: transaction.recurrenceType,
    recurrenceEndDate: transaction.recurrenceEndDate,
  });

  await newTransaction.save();
  console.log(`New Recurring Transaction Created for ${transaction.title}`);

  return newTransaction;
}

/**
 * Checks if a given number of days have passed since the last transaction.
 */
function hasDaysPassed(lastDate, today, days) {
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  return diffDays >= days;
}

/**
 * Checks if a given number of months have passed since the last transaction.
 */
function hasMonthsPassed(lastDate, today, months) {
  return (
    today.getMonth() - lastDate.getMonth() >= months &&
    today.getFullYear() >= lastDate.getFullYear()
  );
}

/**
 * Checks if a given number of years have passed since the last transaction.
 */
function hasYearsPassed(lastDate, today, years) {
  return today.getFullYear() - lastDate.getFullYear() >= years;
}
