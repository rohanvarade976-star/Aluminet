require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const { isEmailConfigured } = require('./services/emailService');
const { initSocket } = require('./socket/socketHandler');
const { decayFraudScores } = require('./middleware/fraud.middleware');

// Routes
const authRoutes         = require('./routes/auth.routes');
const userRoutes         = require('./routes/user.routes');
const mentorRoutes       = require('./routes/mentor.routes');
const eventRoutes        = require('./routes/event.routes');
const forumRoutes        = require('./routes/forum.routes');
const chatRoutes         = require('./routes/chat.routes');
const adminRoutes        = require('./routes/admin.routes');
const verificationRoutes = require('./routes/verification.routes');
const aiRoutes           = require('./routes/ai.routes');
const notifRoutes        = require('./routes/notification.routes');
const jobsRoutes         = require('./routes/jobs.routes');
const studyGroupRoutes   = require('./routes/studygroups.routes');
const achievementRoutes  = require('./routes/achievements.routes');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

connectDB();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global rate limiter (more permissive — auth routes have their own strict limiter)
app.set('trust proxy', 1);
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10000 });
app.use('/api/', limiter);

// Attach socket.io to every request
app.use((req, res, next) => { req.io = io; next(); });

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/mentors',       mentorRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/forum',         forumRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/verification',  verificationRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/jobs',          jobsRoutes);
app.use('/api/study-groups',  studyGroupRoutes);
app.use('/api/achievements',  achievementRoutes);

app.get('/api/health', (req, res) =>
  res.json({ status: 'AlumiNet v4 running 🚀', ai: 'Groq (llama-3.3-70b-versatile)', timestamp: new Date() })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const errorMsg = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(err.status || 500).json({ error: errorMsg });
});

initSocket(io);

// Scheduled fraud score decay — runs every 24 hours
setInterval(decayFraudScores, 24 * 60 * 60 * 1000);
// Also run once on startup (after DB is likely ready)
setTimeout(decayFraudScores, 10000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 AlumiNet v4 server on port ${PORT} | AI: Groq llama-3.3-70b-versatile`);
  console.log(isEmailConfigured()
    ? '📧 Email: SMTP configured'
    : '⚠️  Email: NOT configured — set EMAIL_USER & EMAIL_PASS in server/.env (forgot-password will show dev link only)');
});
