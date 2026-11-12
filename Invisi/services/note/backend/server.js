const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDatabase = require("./config/db");
const noteRoutes = require("./routes/noteRoutes");
const internalRoutes = require("./routes/internalRoutes");
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

app.get("/health", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});

app.use("/api/notes", noteRoutes);
app.use("/_internal", internalRoutes);
app.use(errorHandler);

const start = async () => {
  await connectDatabase();
  app.listen(Number(process.env.PORT || 5002), () => {
    console.log(`Note service listening on port ${process.env.PORT || 5002}`);
  });
};

start().catch((err) => {
  console.error("Note service MongoDB connection error:", err.message);
  process.exit(1);
});
