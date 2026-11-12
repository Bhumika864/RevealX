const mongoose = require("mongoose");
const crypto = require("crypto");

const noteSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true, trim: true },
    receiver: { type: String, required: true, trim: true },
    recipientEmail: { type: String, trim: true, lowercase: true, default: null },
    shareToken: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(32).toString("hex"),
    },
    cipherText: { type: String, required: true },
    iv: { type: String, required: true, immutable: true },
    salt: { type: String, required: true, immutable: true },
    revealDate: { type: Date, required: true, index: true },
    revealedAt: { type: Date, default: null },
    shareEmailSent: { type: Boolean, default: false },
    revealEmailSent: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
