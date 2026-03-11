// src/app.js

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const videoRoutes = require("./routes/videoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "API Running 🚀",
    message: "Kids Short Video Backend",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

module.exports = app;
