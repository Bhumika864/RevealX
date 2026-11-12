const isValidDate = require("../utils/validateDate");
const isValidObjectId = require("../utils/isValidObjectId");

const validateCreateNote = (req, res, next) => {
  const { sender, receiver, cipherText, iv, salt, revealDate } = req.body;
  if (!sender || !receiver || !cipherText || !iv || !salt || !revealDate) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (!isValidDate(revealDate)) {
    return res.status(400).json({ error: "Invalid revealDate." });
  }
  next();
};

const validateNoteId = (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid note ID." });
  }
  next();
};

module.exports = { validateCreateNote, validateNoteId };
