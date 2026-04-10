const JobPosting = require('../models/JobPosting');
const { createNotification } = require('./notification.controller');
const User = require('../models/User');

exports.createJob = async (req, res) => {
  try {
    const job = await JobPosting.create({ ...req.body, postedBy: req.user._id });
    await job.populate('postedBy', 'name avatar currentRole currentCompany');

    // Notify all students
    const students = await User.find({ role: 'student', isActive: true }).select('_id').limit(100);
    for (const s of students) {
      await createNotification({
        recipient: s._id, sender: req.user._id, type: 'job_posted',
        title: `New ${job.type} at ${job.company}`,
        message: `${req.user.name} posted: ${job.title}`,
        link: '/jobs', io: req.io
      });
    }
    res.status(201).json({ job });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getJobs = async (req, res) => {
  try {
    const { type, search, department, level, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (department) filter.department = department;
    if (level) filter.experienceLevel = level;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } }
    ];
    const jobs = await JobPosting.find(filter)
      .populate('postedBy', 'name avatar currentRole currentCompany')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await JobPosting.countDocuments(filter);
    res.json({ jobs, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id)
      .populate('postedBy', 'name avatar currentRole currentCompany linkedIn')
      .populate('applicants', 'name avatar');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.applyJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const already = job.applicants.includes(req.user._id);
    if (already) { job.applicants.pull(req.user._id); }
    else { job.applicants.push(req.user._id); }
    await job.save();
    res.json({ applied: !already, count: job.applicants.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.saveJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const saved = job.saved.includes(req.user._id);
    if (saved) job.saved.pull(req.user._id); else job.saved.push(req.user._id);
    await job.save();
    res.json({ saved: !saved });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Not found' });
    if (!job.postedBy.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
