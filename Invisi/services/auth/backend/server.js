const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDatabase = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_URL_PREVIEW].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});

app.use("/api/auth", authRoutes);
app.use(errorHandler);

const start = async () => {
  await connectDatabase();
  app.listen(Number(process.env.PORT || 5001), () => {
    console.log(`Auth service listening on port ${process.env.PORT || 5001}`);
  });
};

start().catch((err) => {
  console.error("Auth service MongoDB connection error:", err.message);
  process.exit(1);
});
