const Investment = require("../models/Investment");

exports.addInvestments = async (investments) => {
  return await Investment.insertMany(investments);
};

exports.getAllInvestments = async () => {
  return await Investment.find();
};

exports.purchaseInvestment = async (investmentId, slots) => {
  const investment = await Investment.findById(investmentId);

  if (!investment) {
    throw new Error("Investment not found");
  }

  if (slots > investment.available_slots) {
    throw new Error("Not enough available slots");
  }

  investment.available_slots -= slots;
  await investment.save();

  return investment;
};
