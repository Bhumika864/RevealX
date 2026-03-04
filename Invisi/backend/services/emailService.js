const nodemailer = require("nodemailer");

// ✅ Verify email config on startup
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️  EMAIL_USER or EMAIL_PASS not set in .env — emails will be skipped.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Must be Gmail App Password, not real password
    },
  });
};

const transporter = createTransporter();

// Verify connection on startup
if (transporter) {
  transporter.verify((err) => {
    if (err) {
      console.error("❌ Email config error:", err.message);
      console.error("   Make sure EMAIL_PASS is a Gmail App Password, not your real password.");
      console.error("   Generate one at: Google Account → Security → 2-Step Verification → App Passwords");
    } else {
      console.log("✅ Email service ready");
    }
  });
}

/**
 * Send the shareable link to recipient right after note creation
 */
const sendShareEmail = async ({ recipientEmail, receiverName, senderName, shareUrl, revealDate }) => {
  if (!transporter) {
    console.warn("⚠️  Email skipped — transporter not configured.");
    return;
  }

  const formattedDate = new Date(revealDate).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  await transporter.sendMail({
    from: `"RevealX 🕵️" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `${senderName} sent you a secret message 🔒`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f8f7ff; border-radius: 12px;">
        <h1 style="color: #7c3aed; margin-bottom: 4px;">RevealX 🕵️‍♂️</h1>
        <p style="color: #555; margin-top: 0;">Secure Timed Messages</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

        <h2 style="color: #1a1a2e;">Hey ${receiverName}! 👋</h2>
        <p style="color: #444; line-height: 1.6;">
          <strong>${senderName}</strong> has sent you a secret message that will unlock on:
        </p>

        <div style="background: #7c3aed; color: white; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold;">🔓 ${formattedDate}</p>
        </div>

        <p style="color: #444; line-height: 1.6;">
          Click the button below to open your secret. You'll need the
          <strong>passphrase</strong> from ${senderName} to decrypt it.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${shareUrl}"
            style="background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px;
                   text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
            Open My Secret 🔒
          </a>
        </div>

        <p style="color: #888; font-size: 13px; text-align: center;">
          If the button doesn't work, copy this link:<br/>
          <a href="${shareUrl}" style="color: #7c3aed; word-break: break-all;">${shareUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          RevealX — Your message is end-to-end encrypted. We can never read it.
        </p>
      </div>
    `,
  });

  console.log(`📧 Share email sent to ${recipientEmail}`);
};

/**
 * Send "your secret is ready!" email when reveal time arrives
 */
const sendRevealReadyEmail = async ({ recipientEmail, receiverName, senderName, shareUrl }) => {
  if (!transporter) {
    console.warn("⚠️  Email skipped — transporter not configured.");
    return;
  }

  await transporter.sendMail({
    from: `"RevealX 🕵️" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `🔓 Your secret from ${senderName} is ready to open!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f8f7ff; border-radius: 12px;">
        <h1 style="color: #7c3aed; margin-bottom: 4px;">RevealX 🕵️‍♂️</h1>
        <p style="color: #555; margin-top: 0;">Secure Timed Messages</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

        <h2 style="color: #1a1a2e;">The moment has arrived, ${receiverName}! 🎉</h2>
        <p style="color: #444; line-height: 1.6;">
          The secret message from <strong>${senderName}</strong> is now unlocked and waiting for you.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${shareUrl}"
            style="background: #16a34a; color: white; padding: 14px 32px; border-radius: 8px;
                   text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
            Reveal My Secret 🔓
          </a>
        </div>

        <p style="color: #888; font-size: 13px; text-align: center;">
          If the button doesn't work, copy this link:<br/>
          <a href="${shareUrl}" style="color: #7c3aed; word-break: break-all;">${shareUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          RevealX — Your message is end-to-end encrypted. We can never read it.
        </p>
      </div>
    `,
  });

  console.log(`📧 Reveal-ready email sent to ${recipientEmail}`);
};

module.exports = { sendShareEmail, sendRevealReadyEmail };