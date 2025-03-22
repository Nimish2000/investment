const investmentService = require("../services/investmentService");

exports.addInvestments = async (req, res) => {
  try {
    const newInvestments = await investmentService.addInvestments(req.body);
    res.status(201).json({ success: true, data: newInvestments });
  } catch (error) {
    console.error("Error adding investments:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add investments" });
  }
};

exports.getAllInvestments = async (req, res) => {
  try {
    const investments = await investmentService.getAllInvestments();
    res.status(200).json({ success: true, data: investments });
  } catch (error) {
    console.error("Error fetching investments:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch investments" });
  }
};

exports.purchaseInvestment = async (req, res) => {
  const { investmentId, slots } = req.body;

  try {
    const investment = await investmentService.purchaseInvestment(
      investmentId,
      slots
    );
    res.status(200).json({
      success: true,
      message: `Successfully purchased ${slots} slots in ${investment.title}`,
      data: investment,
    });
  } catch (error) {
    console.error("Error purchasing investment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
