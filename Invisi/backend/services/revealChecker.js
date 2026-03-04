const Note = require("../models/Note");
const { sendRevealReadyEmail } = require("./emailService");

/**
 * Runs every minute.
 * Finds notes whose revealDate has passed, have a recipientEmail,
 * and haven't had their reveal email sent yet — then sends it.
 */
const startRevealChecker = () => {
  const CHECK_INTERVAL_MS = 60 * 1000; // every 1 minute

  const check = async () => {
    try {
      const now = new Date();

      const readyNotes = await Note.find({
        revealDate: { $lte: now },   // reveal time has passed
        revealedAt: null,             // not yet revealed
        revealEmailSent: false,       // email not sent yet
        recipientEmail: { $ne: null }, // has a recipient email
      });

      for (const note of readyNotes) {
        try {
          const shareUrl = `${process.env.FRONTEND_URL}/reveal/${note.shareToken}`;

          await sendRevealReadyEmail({
            recipientEmail: note.recipientEmail,
            receiverName: note.receiver,
            senderName: note.sender,
            shareUrl,
          });

          // Mark email as sent so we don't resend
          note.revealEmailSent = true;
          await note.save();

          console.log(`📧 Reveal-ready email sent for note ${note._id}`);
        } catch (err) {
          console.error(`❌ Failed to send reveal email for note ${note._id}:`, err.message);
        }
      }
    } catch (err) {
      console.error("❌ Reveal checker error:", err.message);
    }
  };

  // Run immediately on startup, then every minute
  check();
  setInterval(check, CHECK_INTERVAL_MS);

  console.log("⏰ Reveal email checker started");
};

module.exports = { startRevealChecker };