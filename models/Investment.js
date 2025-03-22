const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    available_slots: { type: Number, required: true },
    duration: { type: String, required: true },
    roi_percent: { type: Number, required: true },
    price_per_slot: { type: Number, required: true },
    location: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    investment_policies: { type: [String], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);
