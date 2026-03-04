
// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const rateLimit = require("express-rate-limit");

// dotenv.config();
// require("./config/db");

// const app = express();

// app.use(cors());
// app.use(express.json());

// // 🔒 Rate limit reveal abuse
// app.use(
//   "/api/notes",
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//   })
// );

// app.use("/api/notes", require("./routes/notes"));

// // ❗ Global error fallback
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ error: "Unexpected server error." });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

dotenv.config();
require("./config/db");

const app = express();

// ✅ CORS — allow cookies from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // required for cookies
  })
);

app.use(express.json());
app.use(cookieParser()); // required to read req.cookies

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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));