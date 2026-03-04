

// const express = require("express");
// const router = express.Router();
// const Note = require("../models/Note");
// const isValidDate = require("../utils/validateDate");
// const isValidObjectId = require("../utils/isValidObjectId");

// /* =====================================================
//    CREATE NOTE
//    ===================================================== */
// router.post("/", async (req, res) => {
//   const { sender, receiver, cipherText, iv, salt, revealDate } = req.body;

//   if (!sender || !receiver || !cipherText || !iv || !salt || !revealDate) {
//     return res.status(400).json({ error: "Missing required fields." });
//   }

//   if (!isValidDate(revealDate)) {
//     return res.status(400).json({ error: "Invalid revealDate." });
//   }

//   try {
//     const revealAt = new Date(revealDate);

//     const note = await Note.create({
//       sender,
//       receiver,
//       cipherText,
//       iv,
//       salt,
//       revealDate: revealAt,
//       expiresAt: new Date(revealAt.getTime() + 24 * 60 * 60 * 1000), // TTL
//     });

//     res.status(201).json({ id: note._id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create note." });
//   }
// });

// /* =====================================================
//    NOTES SUMMARY (METADATA ONLY)
//    ===================================================== */
// router.get("/summary", async (req, res) => {
//   try {
//     const now = new Date();

//     const notes = await Note.find(
//       {},
//       { sender: 1, receiver: 1, revealDate: 1, revealedAt: 1 }
//     ).sort({ createdAt: -1 });

//     const summary = notes.map((note) => {
//       let status = "hidden";

//       if (note.revealedAt) status = "revealed";
//       else if (now >= note.revealDate) status = "ready";

//       return {
//         id: note._id,
//         sender: note.sender,
//         receiver: note.receiver,
//         revealDate: note.revealDate,
//         status,
//       };
//     });

//     res.json(summary);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch notes summary." });
//   }
// });

// /* =====================================================
//    FETCH NOTE (NO DESTRUCTION)
//    ===================================================== */
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;

//   if (!isValidObjectId(id)) {
//     return res.status(400).json({ error: "Invalid note ID." });
//   }

//   try {
//     const note = await Note.findById(id);
//     if (!note) return res.status(404).json({ error: "Note not found." });

//     const now = new Date();

//     // Too early
//     if (now < note.revealDate) {
//       return res.status(200).json({
//         sender: note.sender,
//         receiver: note.receiver,
//         revealAllowed: false,
//         revealDate: note.revealDate,
//       });
//     }

//     // Already revealed
//     if (note.revealedAt) {
//       return res.status(410).json({ error: "Note already revealed." });
//     }

//     // Reveal allowed — but NOT destroyed yet
//     res.json({
//       sender: note.sender,
//       receiver: note.receiver,
//       cipherText: note.cipherText,
//       iv: note.iv,
//       salt: note.salt,
//       revealAllowed: true,
//       revealDate: note.revealDate,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// /* =====================================================
//    CONFIRM REVEAL (DESTRUCTIVE STEP)
//    ===================================================== */
// router.post("/:id/reveal", async (req, res) => {
//   const { id } = req.params;

//   if (!isValidObjectId(id)) {
//     return res.status(400).json({ error: "Invalid note ID." });
//   }

//   try {
//     const note = await Note.findById(id);
//     if (!note) return res.status(404).json({ error: "Note not found." });

//     if (note.revealedAt) {
//       return res.status(410).json({ error: "Note already revealed." });
//     }

//     note.revealedAt = new Date();
//     await note.save();

//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to confirm reveal." });
//   }
// });

// module.exports = router;










// //notes.js
// const express = require("express");
// const router = express.Router();
// const Note = require("../models/Note");
// const isValidDate = require("../utils/validateDate");
// const isValidObjectId = require("../utils/isValidObjectId");
// const { protect } = require("../middleware/auth");

// /* =====================================================
//    CREATE NOTE  — auth required
//    ===================================================== */
// router.post("/", protect, async (req, res) => {
//   const { sender, receiver, cipherText, iv, salt, revealDate } = req.body;

//   if (!sender || !receiver || !cipherText || !iv || !salt || !revealDate) {
//     return res.status(400).json({ error: "Missing required fields." });
//   }

//   if (!isValidDate(revealDate)) {
//     return res.status(400).json({ error: "Invalid revealDate." });
//   }

//   try {
//     const revealAt = new Date(revealDate);

//     const note = await Note.create({
//       sender,
//       receiver,
//       cipherText,
//       iv,
//       salt,
//       revealDate: revealAt,
//       expiresAt: new Date(revealAt.getTime() + 24 * 60 * 60 * 1000), // TTL
//       owner: req.user._id, // 👤 attach owner
//     });

//     res.status(201).json({ id: note._id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create note." });
//   }
// });

// /* =====================================================
//    NOTES SUMMARY — auth required, only owner's notes
//    ===================================================== */
// router.get("/summary", protect, async (req, res) => {
//   try {
//     const now = new Date();

//     // 👤 Only fetch notes belonging to the logged-in user
//     const notes = await Note.find(
//       { owner: req.user._id },
//       { sender: 1, receiver: 1, revealDate: 1, revealedAt: 1 }
//     ).sort({ createdAt: -1 });

//     const summary = notes.map((note) => {
//       let status = "hidden";

//       if (note.revealedAt) status = "revealed";
//       else if (now >= note.revealDate) status = "ready";

//       return {
//         id: note._id,
//         sender: note.sender,
//         receiver: note.receiver,
//         revealDate: note.revealDate,
//         status,
//       };
//     });

//     res.json(summary);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch notes summary." });
//   }
// });

// /* =====================================================
//    FETCH NOTE — auth required, ownership verified
//    ===================================================== */
// router.get("/:id", protect, async (req, res) => {
//   const { id } = req.params;

//   if (!isValidObjectId(id)) {
//     return res.status(400).json({ error: "Invalid note ID." });
//   }

//   try {
//     const note = await Note.findById(id);
//     if (!note) return res.status(404).json({ error: "Note not found." });

//     // 🔒 Ownership check
//     if (note.owner.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: "Access denied." });
//     }

//     const now = new Date();

//     // Too early
//     if (now < note.revealDate) {
//       return res.status(200).json({
//         sender: note.sender,
//         receiver: note.receiver,
//         revealAllowed: false,
//         revealDate: note.revealDate,
//       });
//     }

//     // Already revealed
//     if (note.revealedAt) {
//       return res.status(410).json({ error: "Note already revealed." });
//     }

//     // Reveal allowed — return encrypted payload
//     res.json({
//       sender: note.sender,
//       receiver: note.receiver,
//       cipherText: note.cipherText,
//       iv: note.iv,
//       salt: note.salt,
//       revealAllowed: true,
//       revealDate: note.revealDate,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// /* =====================================================
//    CONFIRM REVEAL — auth required, ownership verified
//    ===================================================== */
// router.post("/:id/reveal", protect, async (req, res) => {
//   const { id } = req.params;

//   if (!isValidObjectId(id)) {
//     return res.status(400).json({ error: "Invalid note ID." });
//   }

//   try {
//     const note = await Note.findById(id);
//     if (!note) return res.status(404).json({ error: "Note not found." });

//     // 🔒 Ownership check
//     if (note.owner.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: "Access denied." });
//     }

//     if (note.revealedAt) {
//       return res.status(410).json({ error: "Note already revealed." });
//     }

//     note.revealedAt = new Date();
//     await note.save();

//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to confirm reveal." });
//   }
// });

// module.exports = router;





const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const isValidDate = require("../utils/validateDate");
const isValidObjectId = require("../utils/isValidObjectId");
const { protect } = require("../middleware/auth");
const { sendShareEmail } = require("../services/emailService");

/* =====================================================
   CREATE NOTE — auth required
   ===================================================== */
router.post("/", protect, async (req, res) => {
  const { sender, receiver, recipientEmail, cipherText, iv, salt, revealDate } = req.body;

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
      recipientEmail: recipientEmail || null,
      cipherText,
      iv,
      salt,
      revealDate: revealAt,
      expiresAt: new Date(revealAt.getTime() + 24 * 60 * 60 * 1000),
      owner: req.user._id,
    });

    // 🔗 Build the public shareable link
    const shareUrl = `${process.env.FRONTEND_URL}/reveal/${note.shareToken}`;

    // 📧 Send email to recipient if email was provided
    if (recipientEmail) {
      try {
        await sendShareEmail({
          recipientEmail,
          receiverName: receiver,
          senderName: sender,
          shareUrl,
          revealDate: revealAt,
        });
      } catch (emailErr) {
        console.error("⚠️ Failed to send share email:", emailErr.message);
      }
    }

    res.status(201).json({
      id: note._id,
      shareUrl, // 🔗 return share URL to frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create note." });
  }
});

/* =====================================================
   NOTES SUMMARY — auth required, only owner's notes
   ===================================================== */
router.get("/summary", protect, async (req, res) => {
  try {
    const now = new Date();

    const notes = await Note.find(
      { owner: req.user._id },
      { sender: 1, receiver: 1, revealDate: 1, revealedAt: 1, shareToken: 1 }
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
        shareUrl: `${process.env.FRONTEND_URL}/reveal/${note.shareToken}`,
      };
    });

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes summary." });
  }
});

/* =====================================================
   PUBLIC FETCH BY SHARE TOKEN — no auth required
   Recipients open this via their share link
   ===================================================== */
router.get("/shared/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const note = await Note.findOne({ shareToken: token });
    if (!note) return res.status(404).json({ error: "Note not found." });

    const now = new Date();

    if (now < note.revealDate) {
      return res.status(200).json({
        sender: note.sender,
        receiver: note.receiver,
        revealAllowed: false,
        revealDate: note.revealDate,
      });
    }

    if (note.revealedAt) {
      return res.status(410).json({ error: "Note already revealed." });
    }

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
   PUBLIC CONFIRM REVEAL BY SHARE TOKEN — no auth required
   ===================================================== */
router.post("/shared/:token/reveal", async (req, res) => {
  const { token } = req.params;

  try {
    const note = await Note.findOne({ shareToken: token });
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

/* =====================================================
   FETCH NOTE BY ID — auth required, ownership verified
   ===================================================== */
router.get("/:id", protect, async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid note ID." });
  }

  try {
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: "Note not found." });

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied." });
    }

    const now = new Date();

    if (now < note.revealDate) {
      return res.status(200).json({
        sender: note.sender,
        receiver: note.receiver,
        revealAllowed: false,
        revealDate: note.revealDate,
        shareUrl: `${process.env.FRONTEND_URL}/reveal/${note.shareToken}`,
      });
    }

    if (note.revealedAt) {
      return res.status(410).json({ error: "Note already revealed." });
    }

    res.json({
      sender: note.sender,
      receiver: note.receiver,
      cipherText: note.cipherText,
      iv: note.iv,
      salt: note.salt,
      revealAllowed: true,
      revealDate: note.revealDate,
      shareUrl: `${process.env.FRONTEND_URL}/reveal/${note.shareToken}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

/* =====================================================
   CONFIRM REVEAL BY ID — auth required, ownership verified
   ===================================================== */
router.post("/:id/reveal", protect, async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid note ID." });
  }

  try {
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: "Note not found." });

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied." });
    }

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