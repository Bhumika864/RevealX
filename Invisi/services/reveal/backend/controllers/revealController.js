const noteServiceClient = require("../services/noteServiceClient");
const getSharedNotePath = require("../utils/sharedNotePath");

const health = async (req, res) => {
  try {
    const noteHealth = await noteServiceClient.getHealth();
    const ready = noteHealth.ok;
    res.status(ready ? 200 : 503).json({
      status: ready ? "ok" : "unavailable",
      noteService: ready ? "ready" : "unavailable",
    });
  } catch (err) {
    res.status(503).json({ status: "unavailable", noteService: "unavailable" });
  }
};

const forwardNoteRequest = async (req, res, path) => {
  try {
    const response = await noteServiceClient.forwardSharedNoteRequest(
      req.method,
      path,
      req.body
    );
    const body = await response.json();
    res.status(response.status).json(body);
  } catch (err) {
    console.error("Note service request failed:", err.message);
    res.status(502).json({ error: "Note service unavailable." });
  }
};

const getSharedNote = (req, res) =>
  forwardNoteRequest(req, res, getSharedNotePath(req.params.token));

const confirmSharedReveal = (req, res) =>
  forwardNoteRequest(req, res, getSharedNotePath(req.params.token, true));

module.exports = { health, getSharedNote, confirmSharedReveal };
