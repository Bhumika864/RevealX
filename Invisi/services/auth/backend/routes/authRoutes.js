const express = require("express");
const authController = require("../controllers/authController");
const protect = require("../middleware/protect");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.me);

module.exports = router;
