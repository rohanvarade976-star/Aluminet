const VerificationRequest = require('../models/VerificationRequest');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const { PRIVATE_DIR } = require('../utils/uploadPaths');

// multer v2 API. Documents are saved to uploads/private, which is never served statically.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRIVATE_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/png','image/jpg','application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPG, PNG and PDF files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadMiddleware = upload.fields([
  { name: 'collegeId', maxCount: 1 },
  { name: 'degree', maxCount: 1 },
  { name: 'offerLetter', maxCount: 1 },
]);

exports.submitVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const files = req.files || {};
    const updateData = { user: req.user._id, role: user.role, status: 'pending' };

    // Stored relative to server/uploads; fetched through GET /api/verification/:id/file/:field
    if (files.collegeId?.[0]) updateData.collegeIdUrl = `private/${files.collegeId[0].filename}`;
    if (files.degree?.[0]) updateData.degreeUrl = `private/${files.degree[0].filename}`;
    if (files.offerLetter?.[0]) updateData.offerLetterUrl = `private/${files.offerLetter[0].filename}`;

    const verif = await VerificationRequest.findOneAndUpdate(
      { user: req.user._id }, updateData, { upsert: true, new: true }
    );
    await User.findByIdAndUpdate(req.user._id, { verificationStatus: 'pending' });
    res.json({ message: 'Verification request submitted!', verif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyVerification = async (req, res) => {
  try {
    const verif = await VerificationRequest.findOne({ user: req.user._id });
    res.json({ verif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// URL field in VerificationRequest for each :field accepted by the download route
const FILE_FIELDS = { collegeId: 'collegeIdUrl', degree: 'degreeUrl', offerLetter: 'offerLetterUrl' };
// Content types we are willing to serve inline; anything else is forced to download
const SAFE_TYPES = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };

// Download a verification document: admins and the user who uploaded it only
exports.getVerificationFile = async (req, res) => {
  try {
    const urlField = FILE_FIELDS[req.params.field];
    if (!urlField || !mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const verif = await VerificationRequest.findById(req.params.id).select(`user ${urlField}`);
    if (!verif) return res.status(404).json({ error: 'File not found' });

    const isOwner = verif.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this document' });
    }

    const stored = verif[urlField];
    if (!stored) return res.status(404).json({ error: 'File not found' });

    // basename() keeps the lookup inside PRIVATE_DIR whatever is stored (also handles legacy "/uploads/<name>")
    const filePath = path.join(PRIVATE_DIR, path.basename(stored));
    const type = SAFE_TYPES[path.extname(filePath).toLowerCase()];
    res.set({
      'Content-Type': type || 'application/octet-stream',
      'Content-Disposition': type ? 'inline' : 'attachment',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.sendFile(filePath, { dotfiles: 'deny' }, (err) => {
      if (err && !res.headersSent) res.status(404).json({ error: 'File not found' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllVerifications = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const verifs = await VerificationRequest.find({ status })
      .populate('user', 'name email avatar role department graduationYear currentCompany')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ verifs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reviewVerification = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['approved','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const verif = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('user', 'name email role');

    if (!verif) return res.status(404).json({ error: 'Request not found' });
    await User.findByIdAndUpdate(verif.user._id, { verificationStatus: status });

    if (status === 'approved') {
      const { awardAchievement } = require('./achievements.controller');
      awardAchievement(verif.user._id, 'verified', req.io).catch(() => {});
    }

    const { createNotification } = require('./notification.controller');
    await createNotification({
      recipient: verif.user._id,
      sender: req.user._id,
      type: status === 'approved' ? 'verification_approved' : 'verification_rejected',
      title: status === 'approved' ? '✅ Account Verified!' : '⚠️ Verification Update',
      message: status === 'approved'
        ? 'Your account has been verified. You now have full access.'
        : `Your verification was rejected. ${reviewNote ? 'Reason: ' + reviewNote : 'Please resubmit.'}`,
      link: status === 'approved' ? '/dashboard' : '/verify',
      io: req.io
    }).catch(() => {});

    const subject = status === 'approved' ? '✅ Your AlumiNet account is verified!' : '❌ AlumiNet verification update';
    const html = status === 'approved'
      ? `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#4f46e5">Congratulations ${verif.user.name}! 🎉</h2>
          <p>Your account has been <strong>verified</strong>. You now have full access to all features.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Go to Dashboard</a>
        </div>`
      : `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#ef4444">Verification Update</h2>
          <p>Your request was <strong>rejected</strong>. ${reviewNote ? `Reason: ${reviewNote}` : ''}</p>
          <a href="${process.env.CLIENT_URL}/verify" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Resubmit</a>
        </div>`;

    await sendEmail({ to: verif.user.email, subject, html });
    res.json({ message: `Verification ${status}`, verif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
