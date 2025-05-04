const Message = require("../models/Message");

const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Step 1: User joins their own room (based on userId)
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their private room.`);
    });

    // Step 2: When a message is sent
    socket.on("send_message", async (data) => {
      try {
        const newMessage = new Message({
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
        });
        const savedMessage = await newMessage.save();

        // Emit message only to receiver (and optionally back to sender too)
        io.to(data.receiverId).emit("receive_message", savedMessage);
        io.to(data.senderId).emit("receive_message", savedMessage); // optional, to show sender their sent message
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = { setupChatSocket };
