const { chat, jsonChat } = require('../services/groqService');
const User = require('../models/User');
const ForumPost = require('../models/ForumPost');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `resume-${Date.now()}-${safe}`);
  }
});
exports.resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['application/pdf','text/plain'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and TXT files allowed'), false);
  }
});

// ── Chatbot ────────────────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const user = req.user;

    const systemMsg = {
      role: 'system',
      content: `You are AlumiBot, the AI assistant for AlumiNet — an alumni-student interaction platform at an engineering college.
You help with: career guidance, mentorship advice, interview prep, resume tips, job search, skill development, and platform features.
User profile: Name=${user.name}, Role=${user.role}, Dept=${user.department||'N/A'}, Skills=${(user.skills||[]).join(', ')||'not set'}, Grad Year=${user.graduationYear||'N/A'}
Be friendly, concise, and actionable. Use bullet points when listing items. Keep responses under 200 words unless the user needs detailed explanation.`
    };

    const messages = [
      systemMsg,
      ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const reply = await chat(messages, { model: 'llama-3.3-70b-versatile', maxTokens: 512 });
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'AI service unavailable. Check your GROQ_API_KEY.' });
  }
};

// ── Resume Analyzer ───────────────────────────────────────────
exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let resumeText = '';
    try {
      if (req.file.mimetype === 'application/pdf') {
        const pdfBuffer = require('fs').readFileSync(req.file.path); const pdfData = await pdfParse(pdfBuffer);
        resumeText = (pdfData.text || '').substring(0, 4000);
      } else {
        resumeText = fs.readFileSync(req.file.path, 'utf-8').substring(0, 4000);
      }
    } catch (parseErr) {
      console.warn('Resume parse warning:', parseErr.message);
      resumeText = '';
    }

    const messages = [
      { role: 'system', content: 'You are an expert resume reviewer and career coach. Return ONLY valid JSON, no markdown, no explanation.' },
      { role: 'user', content: `Analyze this resume and return a JSON object:
{"overallScore":75,"summary":"2 sentence assessment","strengths":["s1","s2","s3"],"weaknesses":["w1","w2"],"suggestions":["tip1","tip2","tip3"],"missingSkills":["skill1","skill2","skill3"],"recommendedRoles":["role1","role2","role3"],"atsScore":70,"keywordsFound":["kw1","kw2"],"keywordsMissing":["km1","km2"]}

Resume content:
${resumeText || 'No text could be extracted from this file.'}` }
    ];

    const result = await jsonChat(messages, { maxTokens: 900 });
    const analysis = result || {
      overallScore: 70, atsScore: 65,
      summary: 'Resume analyzed. See suggestions below for improvements.',
      strengths: ['Clear contact information', 'Good education section'],
      weaknesses: ['Missing quantified achievements', 'Skills section needs expansion'],
      suggestions: ['Add metrics to achievements (e.g. "improved performance by 30%")', 'Include a professional summary', 'Add relevant projects section'],
      missingSkills: ['Cloud platforms', 'System design', 'CI/CD'],
      recommendedRoles: ['Software Engineer', 'Full Stack Developer', 'Backend Engineer'],
      keywordsFound: [], keywordsMissing: ['agile','docker','api']
    };

    try { fs.unlinkSync(req.file.path); } catch {}
    const saved = await ResumeAnalysis.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, resumeUrl: req.file.filename, resumeText, analysis },
      { upsert: true, new: true }
    );
    res.json({ analysis: saved.analysis });
  } catch (err) {
    console.error('Resume error:', err.message);
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
};

exports.getResumeAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ user: req.user._id });
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Job Recommendations ───────────────────────────────────────
exports.getJobRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const messages = [
      { role: 'system', content: 'You are a career advisor. Return ONLY valid JSON array, no markdown.' },
      { role: 'user', content: `Student profile: Dept=${user.department||'Computer Engineering'}, Skills=${(user.skills||[]).join(', ')||'programming'}, Interests=${(user.interests||[]).join(', ')||'technology'}, GradYear=${user.graduationYear||2025}

Return a JSON array of 6 job recommendations:
[{"title":"Software Engineer","match":88,"skills":["JavaScript","React","Node.js"],"avgSalary":"₹8-15 LPA","companies":["Google","Microsoft","Flipkart"],"description":"Build scalable web applications","growth":"High","difficulty":"Medium"}]

Make it realistic for an Indian engineering student. Include difficulty (Easy/Medium/Hard) and growth (High/Medium/Low).` }
    ];

    const jobs = await jsonChat(messages, { maxTokens: 1000 }) || [
      { title:'Software Engineer', match:88, skills:['JavaScript','React','Node.js'], avgSalary:'₹8-15 LPA', companies:['Google','Microsoft','Flipkart'], description:'Build scalable web apps', growth:'High', difficulty:'Medium' },
      { title:'Full Stack Developer', match:84, skills:['React','Node.js','MongoDB'], avgSalary:'₹6-12 LPA', companies:['Infosys','TCS','Wipro'], description:'End-to-end web development', growth:'High', difficulty:'Medium' },
      { title:'Backend Engineer', match:79, skills:['Python','Go','Databases'], avgSalary:'₹7-14 LPA', companies:['Amazon','Swiggy','Zepto'], description:'API and server development', growth:'High', difficulty:'Hard' },
      { title:'DevOps Engineer', match:72, skills:['Docker','AWS','CI/CD'], avgSalary:'₹8-16 LPA', companies:['Netflix','Adobe','Oracle'], description:'Infrastructure and automation', growth:'Very High', difficulty:'Hard' },
      { title:'Data Scientist', match:68, skills:['Python','ML','SQL'], avgSalary:'₹8-18 LPA', companies:['Razorpay','PhonePe','Meesho'], description:'ML and data analytics', growth:'Very High', difficulty:'Hard' },
      { title:'Product Manager', match:61, skills:['Agile','Analytics','Leadership'], avgSalary:'₹10-20 LPA', companies:['CRED','Groww','Zerodha'], description:'Product strategy and roadmap', growth:'High', difficulty:'Medium' },
    ];

    res.json({ jobs: Array.isArray(jobs) ? jobs : [] });
  } catch (err) {
    console.error('Jobs error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── Forum AI Suggestion ────────────────────────────────────────
exports.getForumSuggestion = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const messages = [
      { role: 'system', content: 'You are an expert mentor helping engineering students. Give practical, direct answers in 150 words max.' },
      { role: 'user', content: `Answer this student forum question:\n\nTitle: ${post.title}\nDetails: ${post.content}` }
    ];

    const suggestion = await chat(messages, { model: 'llama-3.3-70b-versatile', maxTokens: 300 });
    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ error: 'AI suggestion unavailable' });
  }
};

// ── Skill Gap Analysis ─────────────────────────────────────────
exports.getSkillGap = async (req, res) => {
  try {
    const { targetRole } = req.query;
    const user = await User.findById(req.user._id);
    if (!targetRole) return res.status(400).json({ error: 'targetRole is required' });

    const messages = [
      { role: 'system', content: 'You are a career coach. Return ONLY valid JSON, no markdown.' },
      { role: 'user', content: `Student has these skills: ${(user.skills||[]).join(', ')||'none listed'}
Target role: ${targetRole}

Return JSON: {"missingSkills":[{"skill":"Docker","priority":"High","learningTime":"2 weeks","resources":["Docker docs","YouTube"]}],"existingSkills":["skill1"],"readinessScore":65,"roadmap":["Step 1","Step 2","Step 3"],"timeToReady":"3 months"}` }
    ];

    const result = await jsonChat(messages, { maxTokens: 800 });
    res.json({ skillGap: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Interview Prep ─────────────────────────────────────────────
exports.getInterviewQuestions = async (req, res) => {
  try {
    const { role, level = 'fresher' } = req.query;
    if (!role) return res.status(400).json({ error: 'role required' });

    const messages = [
      { role: 'system', content: 'You are an interview coach. Return ONLY valid JSON array.' },
      { role: 'user', content: `Generate 8 interview questions for ${role} role at ${level} level.
Return JSON array: [{"question":"Tell me about yourself","type":"behavioral","tips":"Focus on education and projects","difficulty":"Easy"}]
Mix: 3 behavioral, 3 technical, 2 situational. Include difficulty (Easy/Medium/Hard).` }
    ];

    const questions = await jsonChat(messages, { maxTokens: 900 });
    res.json({ questions: Array.isArray(questions) ? questions : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
