const express = require("express");
const { getChatBetweenUsers } = require("../controllers/chatController");
const router = express.Router();

// GET /api/chat/:userId1/:userId2
router.get("/:userId1/:userId2", getChatBetweenUsers);

module.exports = router;
