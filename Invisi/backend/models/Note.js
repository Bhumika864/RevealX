


// const mongoose = require("mongoose");

// const noteSchema = new mongoose.Schema(
//   {
//     sender: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     receiver: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // 🔐 ENCRYPTED DATA ONLY
//     cipherText: {
//       type: String,
//       required: true,
//     },
//     iv: {
//       type: String,
//       required: true,
//       immutable: true,
//     },
//     salt: {
//       type: String,
//       required: true,
//       immutable: true,
//     },

//     revealDate: {
//       type: Date,
//       required: true,
//       index: true,
//     },

//     revealedAt: {
//       type: Date,
//       default: null,
//     },

//     expiresAt: {
//       type: Date,
//       required: true,
//       index: { expires: 0 }, // TTL index
//     },

//     // 👤 OWNER — links note to authenticated user
//     owner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Note", noteSchema);



const mongoose = require("mongoose");
const crypto = require("crypto");

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

    // 📧 Recipient's email — used to send the share link
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    // 🔗 Unique public token for the shareable link (no auth required)
    shareToken: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(32).toString("hex"),
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

    // 📧 Track whether reveal-ready email was sent
    revealEmailSent: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },

    // 👤 OWNER
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);