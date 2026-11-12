const express = require("express");
const revealController = require("../controllers/revealController");

const router = express.Router();

router.get("/health", revealController.health);
router.get("/api/reveal/:token", revealController.getSharedNote);
router.post("/api/reveal/:token/reveal", revealController.confirmSharedReveal);

module.exports = router;
