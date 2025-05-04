const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String },
  email: { type: String },
  description: { type: String, required: true },
  productName: { type: String, required: true },
  location: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  bids: { type: Array },
});

module.exports = mongoose.model("Products", productSchema);
