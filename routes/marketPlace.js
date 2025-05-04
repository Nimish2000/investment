const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const Product = require("../models/ProductDetail");

// Middlewares
const authenticateUser = require("../middleware/authMiddleware");

// Readers
const userDetailsReader = require("../readers/User");

// Utils
const getUserId = require("../utils/user");

router.post("/bid", authenticateUser, async (req, res) => {
  const { description, productName, location, bidAmount } = req.body;
  const userId = getUserId(req);
  try {
    const userDetails = await User.findById(userId);
    const { username, email } = userDetails;
    const newProduct = new Product({
      userId,
      description,
      productName,
      location,
      bidAmount,
      username,
      email,
    });
    await newProduct.save();
    res.status(200).json({ success: true, message: "bid placed successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error" });
  }
});

router.get("/all", authenticateUser, async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
});

router.post("/add/bid", authenticateUser, async (req, res) => {
  const { amount, message, productId } = req.body;
  const userId = getUserId(req);
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          bids: {
            userId,
            amount,
            message,
            bidDate: new Date(),
          },
        },
      },
      { new: true } // return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error adding bid:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
