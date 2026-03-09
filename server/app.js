const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./src/middleware/errorHandler");

const userRouter = require("./src/routes/user/userRoutes");
const transactionRouter = require("./src/routes/user/transactionRoutes");
const budgetRouter = require("./src/routes/user/budgetRoutes");
const notificationRouter = require("./src/routes/user/notificationRoutes");
const goalRouter = require("./src/routes/user/goalRoutes");
const balanceRouter = require("./src/routes/user/balanceRoutes");
const financialRouter = require("./src/routes/user/financialRoutes");
const systemSettingsRouter = require("./src/routes/user/systemSettingsRoutes");
const summaryRouter = require("./src/routes/user/summaryRoutes");
const userreportsRouter = require("./src/routes/user/userreportRoutes");
const userdashboardRouter = require("./src/routes/user/userdashboardRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

// Set up routes
app.use("/auth", userRouter);
app.use("/transactions", transactionRouter);
app.use("/budget", budgetRouter);
app.use("/notifications", notificationRouter);
app.use("/goals", goalRouter);
app.use("/balance", balanceRouter);
app.use("/userdashboard", userdashboardRouter);
app.use("/financial", financialRouter);
app.use("/settings", systemSettingsRouter);
app.use("/summary", summaryRouter);
app.use("/userreports", userreportsRouter);

app.use(errorHandler);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Something went wrong!" });
});

app.get("/", (req, res) => {
  res.send("Server is running"); // just for security testing
});

module.exports = app; // Export only the app instance
