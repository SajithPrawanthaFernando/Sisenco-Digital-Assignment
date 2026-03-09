const io = require("socket.io-client");

// Connect to WebSocket server
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to WebSocket server");

  // Subscribe to notifications for a specific user
  const userId = "67c68dcfb211bb9ec839a292";
  socket.emit("subscribe", { userId });

  console.log(`Listening for notifications for user: ${userId}`);
});

// Listen for all WebSocket messages
socket.onAny((event, data) => {
  console.log(`Received WebSocket Message: ${event} -`, data);
});

// Handle disconnection
socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});
