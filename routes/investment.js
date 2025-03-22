const express = require("express");
const router = express.Router();

// Models
const Investment = require("../models/Investment");
const UserInvestment = require("../models/UserInvestment");

// Middleware
const authenticateUser = require("../middleware/authMiddleware");

// POST /investments - Add multiple investments
router.post("/investments", async (req, res) => {
  const investments = req.body; // Expecting an array of investments

  try {
    const newInvestments = await Investment.insertMany(investments);
    res.status(201).json({ success: true, data: newInvestments });
  } catch (error) {
    console.error("Error adding investments:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add investments" });
  }
});

router.get("/investments", authenticateUser, async (req, res) => {
  try {
    const investments = await Investment.find();
    res.status(200).json({ success: true, data: investments });
  } catch (error) {
    console.error("Error fetching investments:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch investments" });
  }
});

router.post("/investments/buy", authenticateUser, async (req, res) => {
  const { investments } = req.body; // Expecting array of { investmentId, slotsPurchased }
  const userId = req.user?.user?.id;

  if (!Array.isArray(investments) || investments.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid investment data" });
  }

  const userInvestments = [];

  try {
    for (const item of investments) {
      const { investmentId, slotsPurchased } = item;

      const investment = await Investment.findById(investmentId);
      if (!investment) {
        return res.status(404).json({
          success: false,
          message: `Investment not found for ID: ${investmentId}`,
        });
      }

      if (slotsPurchased > investment.available_slots) {
        return res.status(400).json({
          success: false,
          message: `Not enough available slotsPurchased for ${investment.title}`,
        });
      }

      investment.available_slots -= slotsPurchased;
      await investment.save();

      // Save in UserInvestment
      userInvestments.push({
        userId,
        investmentId,
        slotsPurchased,
        purchaseDate: new Date(),
      });
    }

    // Insert all purchases at once
    await UserInvestment.insertMany(userInvestments);

    res.status(200).json({
      success: true,
      message: "Investments purchased successfully",
      data: userInvestments,
    });
  } catch (error) {
    console.error("Error purchasing investments:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to purchase investments" });
  }
});

router.get("/investments/history", authenticateUser, async (req, res) => {
  const userId = req.user?.user?.id;

  try {
    const history = await UserInvestment.find({ userId }).populate(
      "investmentId"
    );
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("Error fetching investment history:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch investment history" });
  }
});

router.post("/investments/repeat", authenticateUser, async (req, res) => {
  const { transactionId } = req.body;
  const userId = req.user?.user?.id;

  try {
    const transaction = await UserInvestment.findById(transactionId).populate(
      "investmentId"
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const investment = await Investment.findById(transaction.investmentId._id);
    if (
      !investment ||
      transaction.slotsPurchased > investment.available_slots
    ) {
      return res.status(400).json({
        success: false,
        message: "Not enough available slots to repeat the investment",
      });
    }

    investment.available_slots -= transaction.slotsPurchased;
    await investment.save();

    const newTransaction = new UserInvestment({
      userId,
      investmentId: transaction.investmentId._id,
      slotsPurchased: transaction.slotsPurchased,
      purchaseDate: new Date(),
    });
    await newTransaction.save();

    res.status(200).json({
      success: true,
      message: "Investment transaction repeated successfully",
      data: newTransaction,
    });
  } catch (error) {
    console.error("Error repeating investment transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to repeat investment transaction",
    });
  }
});

module.exports = router;
