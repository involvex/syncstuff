const { Server } = require("socket.io");

// This is a very basic signaling server.
// In a real-world app, you'd want to add rooms, authentication, etc.

const io = new Server(3001, {
  cors: {
    origin: "*",
  },
});
// oxlint-disable-next-line no-unused-expressions
// oxlint-disable-next-line no-unused-expressions
("use strict");

console.log("Signaling server running on port 3001");

io.on("connection", socket => {
  console.log(`Client connected: ${socket.id}`);

  // When a client joins, they should announce their device ID
  socket.on("join", deviceId => {
    console.log(`Device ${deviceId} joined with socket ${socket.id}`);
    socket.join(deviceId); // Join a room identified by its own deviceId
  });

  // Forward signals to the intended recipient
  socket.on("signal", data => {
    console.log(`Forwarding signal from ${data.from} to ${data.to}`);
    // The 'to' field contains the deviceId of the recipient
    // We emit the event to the room named after the recipient's deviceId
    io.to(data.to).emit("signal", data);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});
