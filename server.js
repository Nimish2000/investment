const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");

// Config
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const investmentRoutes = require("./routes/investment");
const portfolioRoutes = require("./routes/portfolio");
const userInvestmentsRoutes = require("./routes/userInvestment");
const chatRoutes = require("./routes/chatRoutes");
const marketplaceRoutes = require("./routes/marketplace");
// Sockets
const { setupChatSocket } = require("./sockets/chatSocket");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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
app.use("/api/chat", chatRoutes);
app.use("/api/marketplace", marketplaceRoutes);
// Socket Setup
setupChatSocket(io);

// Start server
const PORT = process.env.PORT || 3000; // Use the port from the .env file or fallback to 5001

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
