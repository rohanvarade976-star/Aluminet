const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) { console.error('Email error:', err.message); }
};
module.exports = { sendEmail };
