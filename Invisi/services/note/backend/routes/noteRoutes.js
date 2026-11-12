const express = require("express");
const noteController = require("../controllers/noteController");
const protect = require("../middleware/protect");
const { validateCreateNote, validateNoteId } = require("../middleware/validateNoteRequest");

const router = express.Router();

router.post("/", protect, validateCreateNote, noteController.createNote);
router.get("/summary", protect, noteController.getSummary);
router.get("/:id", protect, validateNoteId, noteController.getById);
router.post("/:id/reveal", protect, validateNoteId, noteController.confirmOwnerReveal);

module.exports = router;
