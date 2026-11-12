const transporter = require("../config/emailTransport");
const { getPendingNotifications, markSent } = require("./noteServiceClient");
const escapeHtml = require("../utils/escapeHtml");

const sendNotification = async (type, notification) => {
  const sender = escapeHtml(notification.senderName);
  const receiver = escapeHtml(notification.receiverName);
  const shareUrl = escapeHtml(notification.shareUrl);
  const formattedDate = new Date(notification.revealDate).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const revealReady = type === "reveal";
  const subject = revealReady
    ? `Your secret from ${notification.senderName} is ready to open`
    : `${notification.senderName} sent you a secret message`;
  const text = revealReady
    ? `The secret message from ${notification.senderName} is ready: ${notification.shareUrl}`
    : `Hi ${notification.receiverName}, ${notification.senderName} sent you an encrypted secret message. It can be opened after ${formattedDate}: ${notification.shareUrl}`;
  const html = revealReady
    ? `<p>The secret message from <strong>${sender}</strong> is ready to open.</p><p><a href="${shareUrl}">Reveal your secret</a></p>`
    : `<p>Hi ${receiver},</p><p><strong>${sender}</strong> sent you an encrypted secret message. It can be opened after ${escapeHtml(formattedDate)}.</p><p><a href="${shareUrl}">Open your secret</a></p>`;

  await transporter.sendMail({
    from: `"RevealX" <${process.env.EMAIL_USER}>`,
    to: notification.recipientEmail,
    subject,
    text,
    html,
  });
  await markSent(type, notification.id);
  console.log(`${type} email sent for note ${notification.id}`);
};

let isRunning = false;
const checkNotifications = async () => {
  if (!transporter || isRunning) return;
  isRunning = true;

  try {
    for (const type of ["share", "reveal"]) {
      const notifications = await getPendingNotifications(type);
      for (const notification of notifications) {
        try {
          await sendNotification(type, notification);
        } catch (err) {
          console.error(`Failed to send ${type} email for note ${notification.id}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error("Notification worker check failed:", err.message);
  } finally {
    isRunning = false;
  }
};

module.exports = { checkNotifications };
