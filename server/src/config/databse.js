const mongoose = require("mongoose");

class Database {
  constructor() {
    if (!Database.instance) {
      this.connection = null; // Initialize connection
      Database.instance = this; //  Singleton instance
    }
    return Database.instance; // return the same instance
  }

  async connect() {
    if (this.connection) {
      return this.connection; // Return existing connection
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }

    try {
      this.connection = await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "ExpenseTracker",
      });
      console.log("Database connected successfully.");
    } catch (error) {
      console.error("Database connection failed:", error);
      process.exit(1); // Exit process if DB connection fails
    }

    Object.freeze(this); // Prevent modifications
    return this.connection;
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      console.log("Database connection closed.");
    }
  }
}

// Export Singleton instance
module.exports = new Database();
