const { Server } = require("socket.io");

let io;

console.log("Initializing WebSocket server...");

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New WebSocket connection established");

    socket.on("subscribe", ({ userId }) => {
      console.log(`User ${userId} subscribed to notifications`);
      socket.join(`notification-${userId}`);
      console.log(`User ${userId} joined room: notification-${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    console.error("WebSocket is not initialized yet!");
    throw new Error("Socket.io is not initialized yet!");
  }
  return io;
};

module.exports = { initializeSocket, getIo };
