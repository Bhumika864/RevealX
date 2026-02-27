
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    receiver: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔐 ENCRYPTED DATA ONLY
    cipherText: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
      immutable: true,
    },
    salt: {
      type: String,
      required: true,
      immutable: true,
    },

    revealDate: {
      type: Date,
      required: true,
      index: true,
    },

    revealedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);