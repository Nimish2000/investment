const mongoose = require("mongoose");

const userInvestmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Investment",
    required: true,
  },
  slotsPurchased: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserInvestment", userInvestmentSchema);
