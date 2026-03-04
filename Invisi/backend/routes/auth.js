const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, JWT_SECRET } = require("../middleware/auth");

/* ---------- HELPERS ---------- */
const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

const sendToken = (res, user, statusCode) => {
  const token = signToken(user._id);

  // httpOnly cookie — JS cannot access it (XSS protection)
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(statusCode).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

/* =====================================================
   REGISTER
   ===================================================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const user = await User.create({ name, email, password });
    sendToken(res, user, 201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed." });
  }
});

/* =====================================================
   LOGIN
   ===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    sendToken(res, user, 200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed." });
  }
});

/* =====================================================
   LOGOUT
   ===================================================== */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully." });
});

/* =====================================================
   GET CURRENT USER (/api/auth/me)
   ===================================================== */
router.get("/me", protect, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

module.exports = router;