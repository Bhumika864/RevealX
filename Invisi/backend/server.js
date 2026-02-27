
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();
require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// 🔒 Rate limit reveal abuse
app.use(
  "/api/notes",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use("/api/notes", require("./routes/notes"));

// ❗ Global error fallback
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));