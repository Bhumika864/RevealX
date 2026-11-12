const nodemailer = require("nodemailer");

const transporter =
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      })
    : null;

if (!transporter) {
  console.warn("Email delivery is disabled: EMAIL_USER or EMAIL_PASS is not configured.");
}

module.exports = transporter;
