const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const investmentRoutes = require("./routes/investment");
const portfolioRoutes = require("./routes/portfolio");
const userInvestmentsRoutes = require("./routes/userInvestment");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

app.use(
  cors({
    origin: "*", // Replace '*' with 'http://localhost:5500' for better security
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle OPTIONS preflight requests
app.options("*", (req, res) => {
  res.status(200).send();
});

// Connect to database
connectDB();

// Middleware
app.use(express.json());

app.get("/", (req, res) => res.send("Hello World"));
app.get("/user-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", investmentRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/userInvestments", userInvestmentsRoutes);

// Start server
const PORT = process.env.PORT || 3001; // Use the port from the .env file or fallback to 5001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
