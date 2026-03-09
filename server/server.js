const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const db = require("./src/config/databse");
const { initializeSocket } = require("./src/config/socket");

const PORT = process.env.PORT || 5000;

// Function to start the server
const startServer = async () => {
  try {
    await db.connect();
    console.log("MongoDB connection established successfully.");

    require("./src/cron/budgetChecker");
    require("./src/cron/recurringTransactions");
    require("./src/cron/savingsAllocation");
    require("./src/cron/goalNotifications");

    // Start HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket AFTER server is created
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`HTTP & WebSocket Server running on port ${PORT}`);
    });

    server.keepAliveTimeout = 120 * 1000;
    server.headersTimeout = 120 * 1000;

    // Graceful Shutdown Handling
    process.on("SIGTERM", async () => {
      console.log("Shutting down gracefully...");
      server.close(async () => {
        console.log("Closing MongoDB connection...");
        await mongoose.connection.close();
        console.log("Server shut down.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
