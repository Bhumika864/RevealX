const noteService = require("../services/noteService");
const isValidObjectId = require("../utils/isValidObjectId");
const serializeNoteForReveal = require("../utils/serializeNoteForReveal");

const createNote = async (req, res) => {
  try {
    const note = await noteService.createNote({ data: req.body, owner: req.userId });
    const shareUrl = `${process.env.FRONTEND_URL}/reveal/${note.shareToken}`;
    res.status(201).json({ id: note._id, shareUrl });
  } catch (err) {
    console.error("Failed to create note:", err.message);
    res.status(500).json({ error: "Failed to create note." });
  }
};

const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const notes = await noteService.getOwnerNotes(req.userId);
    res.json(
      notes.map((note) => ({
        id: note._id,
        sender: note.sender,
        receiver: note.receiver,
        revealDate: note.revealDate,
        status: note.revealedAt ? "revealed" : now >= note.revealDate ? "ready" : "hidden",
        shareUrl: `${process.env.FRONTEND_URL}/reveal/${note.shareToken}`,
      }))
    );
  } catch (err) {
    console.error("Failed to fetch notes summary:", err.message);
    res.status(500).json({ error: "Failed to fetch notes summary." });
  }
};

const getById = async (req, res) => {
  const { id } = req.params;

  try {
    const note = await noteService.getNoteById(id);
    if (!note) return res.status(404).json({ error: "Note not found." });
    if (note.owner.toString() !== req.userId) {
      return res.status(403).json({ error: "Access denied." });
    }
    const result = serializeNoteForReveal(note, new Date());
    if (!result) return res.status(410).json({ error: "Note already revealed." });
    res.json({
      ...result,
      shareUrl: `${process.env.FRONTEND_URL}/reveal/${note.shareToken}`,
    });
  } catch (err) {
    console.error("Failed to fetch note:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

const confirmOwnerReveal = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await noteService.confirmOwnerReveal(id, req.userId);
    if (result.status === "revealed") return res.json({ success: true });
    if (result.status === "not_found") {
      return res.status(404).json({ error: "Note not found." });
    }
    if (result.status === "already_revealed") {
      return res.status(410).json({ error: "Note already revealed." });
    }
    if (result.status === "not_ready") {
      return res.status(403).json({ error: "Note cannot be revealed yet." });
    }
    return res.status(409).json({ error: "Note could not be revealed." });
  } catch (err) {
    console.error("Failed to confirm reveal:", err.message);
    res.status(500).json({ error: "Failed to confirm reveal." });
  }
};

const getSharedNote = async (req, res) => {
  try {
    const note = await noteService.getNoteByShareToken(req.params.token);
    if (!note) return res.status(404).json({ error: "Note not found." });
    const result = serializeNoteForReveal(note, new Date());
    if (!result) return res.status(410).json({ error: "Note already revealed." });
    res.json(result);
  } catch (err) {
    console.error("Internal shared-note lookup failed:", err.message);
    res.status(500).json({ error: "Failed to fetch shared note." });
  }
};

const confirmSharedReveal = async (req, res) => {
  try {
    const result = await noteService.confirmSharedReveal(req.params.token);
    if (result.status === "revealed") return res.json({ success: true });
    if (result.status === "not_found") {
      return res.status(404).json({ error: "Note not found." });
    }
    if (result.status === "already_revealed") {
      return res.status(410).json({ error: "Note already revealed." });
    }
    return res.status(403).json({ error: "Note cannot be revealed yet." });
  } catch (err) {
    console.error("Internal reveal confirmation failed:", err.message);
    res.status(500).json({ error: "Failed to confirm reveal." });
  }
};

const getPendingNotifications = async (req, res) => {
  const { type } = req.params;
  if (!["share", "reveal"].includes(type)) {
    return res.status(404).json({ error: "Notification type not found." });
  }

  try {
    const notes = await noteService.getPendingNotifications(type);
    res.json(
      notes.map((note) => ({
        id: note._id,
        recipientEmail: note.recipientEmail,
        receiverName: note.receiver,
        senderName: note.sender,
        shareUrl: `${process.env.FRONTEND_URL}/reveal/${note.shareToken}`,
        revealDate: note.revealDate,
      }))
    );
  } catch (err) {
    console.error("Failed to fetch pending notifications:", err.message);
    res.status(500).json({ error: "Failed to fetch pending notifications." });
  }
};

const markNotificationSent = async (req, res) => {
  const { type, id } = req.params;
  if (!["share", "reveal"].includes(type) || !isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid notification confirmation." });
  }

  try {
    const note = await noteService.markNotificationSent(type, id);
    if (!note) return res.status(404).json({ error: "Note not found." });
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to mark notification sent:", err.message);
    res.status(500).json({ error: "Failed to mark notification sent." });
  }
};

module.exports = {
  createNote,
  getSummary,
  getById,
  confirmOwnerReveal,
  getSharedNote,
  confirmSharedReveal,
  getPendingNotifications,
  markNotificationSent,
};
