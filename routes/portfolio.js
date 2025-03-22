const express = require("express");
const router = express.Router();

// Models
const Investment = require("../models/Investment");
const UserInvestment = require("../models/UserInvestment");

// Middleware
const authenticateUser = require("../middleware/authMiddleware");

// GET /portfolio - Get user's portfolio summary
router.get("/", authenticateUser, async (req, res) => {
  const userId = req.user?.user?.id;

  try {
    const userInvestments = await UserInvestment.find({ userId }).populate(
      "investmentId"
    );

    const portfolioSummary = userInvestments.reduce((acc, investment) => {
      const { investmentId, slotsPurchased } = investment;

      const totalValue = slotsPurchased * investmentId.price_per_slot;

      if (!acc[investmentId._id]) {
        acc[investmentId._id] = {
          title: investmentId.title,
          investmentId: investmentId._id,
          slotsPurchased: 0,
          totalValue: 0,
          roiPercent: investmentId.roi_percent,
        };
      }

      acc[investmentId._id].slotsPurchased += slotsPurchased;
      acc[investmentId._id].totalValue += totalValue;

      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: Object.values(portfolioSummary),
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch portfolio" });
  }
});

// DELETE /portfolio/delete - Delete multiple investments for a user
router.delete("/delete", authenticateUser, async (req, res) => {
  const { investmentIds } = req.body; // Expecting an array of investment IDs
  const userId = req.user?.user?.id;

  if (!Array.isArray(investmentIds) || investmentIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Investment IDs are required",
    });
  }

  try {
    let totalSlotsToRestore = 0;

    for (const investmentId of investmentIds) {
      const transactions = await UserInvestment.find({ userId, investmentId });

      if (!transactions || transactions.length === 0) {
        continue; // Skip if no records are found for this investmentId
      }

      totalSlotsToRestore += transactions.reduce(
        (total, txn) => total + txn.slotsPurchased,
        0
      );

      await UserInvestment.deleteMany({ userId, investmentId });

      const investment = await Investment.findById(investmentId);
      if (investment) {
        investment.available_slots += totalSlotsToRestore;
        await investment.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Investments deleted successfully",
      restoredSlots: totalSlotsToRestore,
    });
  } catch (error) {
    console.error("Error deleting investments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete investments",
    });
  }
});

router.delete("/delete/all", authenticateUser, async (req, res) => {
  const userId = req.user?.user?.id;

  try {
    const transactions = await UserInvestment.find({ userId });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No investments found to delete",
      });
    }

    let totalSlotsToRestore = transactions.reduce(
      (total, txn) => total + txn.slotsPurchased,
      0
    );

    await UserInvestment.deleteMany({ userId });

    for (const txn of transactions) {
      const investment = await Investment.findById(txn.investmentId);
      if (investment) {
        investment.available_slots += txn.slotsPurchased;
        await investment.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "All investments deleted successfully",
      restoredSlots: totalSlotsToRestore,
    });
  } catch (error) {
    console.error("Error deleting all investments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete all investments",
    });
  }
});

module.exports = router;
