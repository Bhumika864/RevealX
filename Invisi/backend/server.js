
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

dotenv.config();
require("./config/db");

const { startRevealChecker } = require("./services/revealChecker");

const app = express();

// ✅ CORS — allow cookies from frontend
const allowedOrigin = (origin, callback) => {
  // Allow any localhost port in development
  if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
    return callback(null, true);
  }
  // In production, only allow FRONTEND_URL
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
    return callback(null, true);
  }
  callback(new Error("Not allowed by CORS"));
};

app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// 🔒 Rate limit on notes API
app.use(
  "/api/notes",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// 🔒 Rate limit on auth (stricter — prevents brute force)
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many attempts. Try again later." },
  })
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

// ❗ Global error fallback
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startRevealChecker(); // ⏰ start polling for reveal-ready emails
});