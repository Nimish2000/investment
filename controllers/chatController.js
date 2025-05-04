const Message = require("../models/Message");

const getChatBetweenUsers = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ timestamp: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ success: false, message: "Error fetching chat" });
  }
};

module.exports = { getChatBetweenUsers };
