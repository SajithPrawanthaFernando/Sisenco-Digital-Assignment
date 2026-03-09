const express = require("express");
const transactionController = require("../../controllers/user/transactionController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.post("/createtransaction", transactionController.createTransaction); // Create a transaction
router.get("/getalltransaction", transactionController.getTransactions); // Get all transactions
router.put("/updatetransaction/:id", transactionController.updateTransaction); // Update a transaction

router.delete(
  "/deletetransaction/:id",
  transactionController.deleteTransaction
); // Delete a transaction

module.exports = router;
