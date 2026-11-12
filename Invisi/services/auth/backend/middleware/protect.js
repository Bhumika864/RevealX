const authService = require("../services/authService");

const protect = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Not authenticated. Please log in." });
  }

  try {
    const decoded = authService.verifyToken(token);
    const user = await authService.getCurrentUser(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
};

module.exports = protect;
