const express = require("express");
const router = express.Router();

// Models
const UserInvestment = require("../models/UserInvestment");
const User = require("../models/User");

router.get("/all", async (req, res) => {
  try {
    const userInvestments = await UserInvestment.find();

    // Extract unique user IDs
    const userIds = [...new Set(userInvestments.map((inv) => inv.userId))];

    // Fetch user details for those IDs
    const users = await User.find({ _id: { $in: userIds } });

    // Create a user map for faster lookup
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id] = user;
    });

    // Group investments by user
    const groupedInvestments = {};
    userInvestments.forEach((investment) => {
      const userId = investment.userId;
      if (!groupedInvestments[userId]) {
        groupedInvestments[userId] = {
          userDetails: userMap[userId] || null,
          investments: [],
        };
      }
      groupedInvestments[userId].investments.push(investment);
    });

    res.status(200).json({
      success: true,
      data: Object.values(groupedInvestments),
    });
  } catch (error) {
    console.error("Error fetching user investments:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user investments" });
  }
});

module.exports = router;
