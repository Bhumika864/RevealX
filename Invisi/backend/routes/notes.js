

const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const isValidDate = require("../utils/validateDate");
const isValidObjectId = require("../utils/isValidObjectId");

/* =====================================================
   CREATE NOTE
   ===================================================== */
router.post("/", async (req, res) => {
  const { sender, receiver, cipherText, iv, salt, revealDate } = req.body;

  if (!sender || !receiver || !cipherText || !iv || !salt || !revealDate) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!isValidDate(revealDate)) {
    return res.status(400).json({ error: "Invalid revealDate." });
  }

  try {
    const revealAt = new Date(revealDate);

    const note = await Note.create({
      sender,
      receiver,
      cipherText,
      iv,
      salt,
      revealDate: revealAt,
      expiresAt: new Date(revealAt.getTime() + 24 * 60 * 60 * 1000), // TTL
    });

    res.status(201).json({ id: note._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create note." });
  }
});

/* =====================================================
   NOTES SUMMARY (METADATA ONLY)
   ===================================================== */
router.get("/summary", async (req, res) => {
  try {
    const now = new Date();

    const notes = await Note.find(
      {},
      { sender: 1, receiver: 1, revealDate: 1, revealedAt: 1 }
    ).sort({ createdAt: -1 });

    const summary = notes.map((note) => {
      let status = "hidden";

      if (note.revealedAt) status = "revealed";
      else if (now >= note.revealDate) status = "ready";

      return {
        id: note._id,
        sender: note.sender,
        receiver: note.receiver,
        revealDate: note.revealDate,
        status,
      };
    });

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes summary." });
  }
});

/* =====================================================
   FETCH NOTE (NO DESTRUCTION)
   ===================================================== */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid note ID." });
  }

  try {
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: "Note not found." });

    const now = new Date();

    // Too early
    if (now < note.revealDate) {
      return res.status(200).json({
        sender: note.sender,
        receiver: note.receiver,
        revealAllowed: false,
        revealDate: note.revealDate,
      });
    }

    // Already revealed
    if (note.revealedAt) {
      return res.status(410).json({ error: "Note already revealed." });
    }

    // Reveal allowed — but NOT destroyed yet
    res.json({
      sender: note.sender,
      receiver: note.receiver,
      cipherText: note.cipherText,
      iv: note.iv,
      salt: note.salt,
      revealAllowed: true,
      revealDate: note.revealDate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

/* =====================================================
   CONFIRM REVEAL (DESTRUCTIVE STEP)
   ===================================================== */
router.post("/:id/reveal", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid note ID." });
  }

  try {
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: "Note not found." });

    if (note.revealedAt) {
      return res.status(410).json({ error: "Note already revealed." });
    }

    note.revealedAt = new Date();
    await note.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to confirm reveal." });
  }
});

module.exports = router;