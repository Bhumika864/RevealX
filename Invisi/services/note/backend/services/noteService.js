const Note = require("../models/Note");

const createNote = async ({ data, owner }) => {
  const revealAt = new Date(data.revealDate);
  return Note.create({
    sender: data.sender,
    receiver: data.receiver,
    recipientEmail: data.recipientEmail || null,
    cipherText: data.cipherText,
    iv: data.iv,
    salt: data.salt,
    revealDate: revealAt,
    expiresAt: new Date(revealAt.getTime() + 24 * 60 * 60 * 1000),
    owner,
  });
};

const getOwnerNotes = async (owner) =>
  Note.find(
    { owner },
    { sender: 1, receiver: 1, revealDate: 1, revealedAt: 1, shareToken: 1 }
  ).sort({ createdAt: -1 });

const getNoteById = async (id) => Note.findById(id);

const getOwnerNoteById = async (id, owner) => Note.findOne({ _id: id, owner });

const confirmOwnerReveal = async (id, owner) => {
  const now = new Date();
  const note = await Note.findOneAndUpdate(
    { _id: id, owner, revealedAt: null, revealDate: { $lte: now } },
    { $set: { revealedAt: now } },
    { new: true }
  );
  if (note) return { status: "revealed" };

  const existing = await getOwnerNoteById(id, owner);
  if (!existing) return { status: "not_found" };
  if (existing.revealedAt) return { status: "already_revealed" };
  if (new Date() < existing.revealDate) return { status: "not_ready" };
  return { status: "conflict" };
};

const getNoteByShareToken = async (token) => Note.findOne({ shareToken: token });

const confirmSharedReveal = async (token) => {
  const now = new Date();
  const note = await Note.findOneAndUpdate(
    { shareToken: token, revealedAt: null, revealDate: { $lte: now } },
    { $set: { revealedAt: now } },
    { new: true }
  );
  if (note) return { status: "revealed" };

  const existing = await getNoteByShareToken(token);
  if (!existing) return { status: "not_found" };
  if (existing.revealedAt) return { status: "already_revealed" };
  return { status: "not_ready" };
};

const getPendingNotifications = async (type) => {
  const now = new Date();
  const query = {
    recipientEmail: { $ne: null },
    revealedAt: null,
    ...(type === "share"
      ? { shareEmailSent: false }
      : { revealDate: { $lte: now }, revealEmailSent: false }),
  };

  return Note.find(query)
    .select("recipientEmail receiver sender shareToken revealDate")
    .sort({ createdAt: 1 })
    .limit(100);
};

const markNotificationSent = async (type, id) => {
  const sentField = type === "share" ? "shareEmailSent" : "revealEmailSent";
  return Note.findByIdAndUpdate(id, { $set: { [sentField]: true } }, { new: true });
};

module.exports = {
  createNote,
  getOwnerNotes,
  getNoteById,
  getOwnerNoteById,
  confirmOwnerReveal,
  getNoteByShareToken,
  confirmSharedReveal,
  getPendingNotifications,
  markNotificationSent,
};
