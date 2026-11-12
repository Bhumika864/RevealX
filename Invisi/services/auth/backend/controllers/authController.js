const authService = require("../services/authService");
const serializeUser = require("../utils/serializeUser");

const sendToken = (res, user, statusCode) => {
  res.cookie("token", authService.signToken(user._id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({ user: serializeUser(user) });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    const user = await authService.register({ name, email, password });
    sendToken(res, user, 201);
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ error: err.message });
    }
    console.error("Registration failed:", err.message);
    res.status(500).json({ error: "Registration failed." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required." });
  }

  try {
    const user = await authService.login({ email, password });
    sendToken(res, user, 200);
  } catch (err) {
    if (err.statusCode === 401) {
      return res.status(401).json({ error: err.message });
    }
    console.error("Login failed:", err.message);
    res.status(500).json({ error: "Login failed." });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully." });
};

const me = (req, res) => {
  res.json({ user: serializeUser(req.user) });
};

module.exports = { register, login, logout, me };
