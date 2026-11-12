const express = require("express");
const noteController = require("../controllers/noteController");

const router = express.Router();

router.get("/notes/shared/:token", noteController.getSharedNote);
router.post("/notes/shared/:token/reveal", noteController.confirmSharedReveal);
router.get("/notifications/:type", noteController.getPendingNotifications);
router.post("/notifications/:type/:id/sent", noteController.markNotificationSent);

module.exports = router;
