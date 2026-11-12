const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set.");
}

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already registered.");
    error.statusCode = 409;
    throw error;
  }
  return User.create({ name, email, password });
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }
  return user;
};

const getCurrentUser = async (id) => User.findById(id).select("-password");

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = { register, login, getCurrentUser, signToken, verifyToken };
