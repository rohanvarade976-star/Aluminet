# AlumiNet 🎓
### Smart Alumni-Student Interaction Platform

A full-stack, AI-powered web platform connecting students, alumni, and institutions through mentorship, real-time chat, events, and a community forum.

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 Auth | JWT + Refresh tokens, email verification, role-based access (Student / Alumni / Admin) |
| 🤖 AI Mentor Matching | TF-IDF cosine similarity engine matches students to mentors based on skills & interests |
| 💬 Real-time Chat | Socket.io powered chat rooms with typing indicators and online presence |
| 📅 Events | Alumni can host webinars/talks; students can RSVP with email confirmation |
| 🗣️ Forum | Category-based discussion board with upvotes, replies, and pinned posts |
| 📊 Admin Dashboard | Analytics, user management, fraud detection & resolution |
| 🛡️ Fraud Detection | Heuristic scoring flags suspicious profiles and activity |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, TailwindCSS, Zustand, Socket.io-client, Recharts |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB Atlas (free tier) |
| Auth | JWT Access + Refresh Tokens, bcrypt |
| File Upload | Cloudinary (free tier) |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Vercel (frontend) + Railway (backend) — both free |

---

## 🚀 Setup Instructions (Local Development)

### Prerequisites
- Node.js v18+
- Git
- A free [MongoDB Atlas](https://cloud.mongodb.com) account
- A free [Cloudinary](https://cloudinary.com) account
- Gmail account (for email notifications)

---

### Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd aluminet
npm install
npm run install:all
```

---

### Step 2: Configure the Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/aluminet

JWT_SECRET=any_random_string_here_32chars
JWT_REFRESH_SECRET=another_random_string_here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Getting Gmail App Password:**
> Google Account → Security → 2-Step Verification → App Passwords → Generate

---

### Step 3: Seed Demo Data

```bash
npm run seed
```

This creates 6 demo users:
- **Student:** student@demo.com / demo123
- **Alumni:** alumni@demo.com / demo123
- **Admin:** admin@demo.com / demo123

---

### Step 4: Run the App

```bash
# From root folder - runs both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

## 📁 Project Structure

```
aluminet/
├── client/              ← React + Vite frontend
│   └── src/
│       ├── api/         ← Axios instance + API services
│       ├── components/  ← Reusable UI components
│       ├── pages/       ← Route-level page components
│       ├── store/       ← Zustand state (auth, socket)
│       └── hooks/       ← Custom React hooks
│
└── server/              ← Node.js + Express backend
    ├── config/          ← DB + Cloudinary config
    ├── controllers/     ← Route handler logic
    ├── middleware/       ← Auth, fraud detection
    ├── models/          ← Mongoose schemas
    ├── routes/          ← Express route definitions
    ├── services/        ← AI engine, email, matching
    └── socket/          ← Socket.io event handlers
```

---

## 🤖 AI Features Explained

### Mentor Matching Engine (`server/services/matchingEngine.js`)
Uses **TF-IDF cosine similarity** — no paid APIs needed:
1. Converts each user's skills, interests, bio, department into a term-frequency vector
2. Computes cosine similarity between student vector and each alumni vector
3. Applies domain boosts (same department +15%, active professional +5%)
4. Returns top 10 ranked matches with match score and common skills

### Fraud Detection (`server/middleware/fraud.middleware.js`)
Rule-based heuristic scoring:
- High request rate from same IP → +30 score
- Previously flagged account → +50 score
- Cumulative score > 70 → request blocked + logged
- Admin can review and resolve fraud logs

---

## 🌐 Free Deployment Guide

### Deploy Backend to Railway
1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the `server/` folder as root
4. Add all environment variables from `.env`
5. Railway auto-deploys on every push

### Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `client`
3. Add env variable: `VITE_API_URL=https://your-railway-app.up.railway.app`
4. Deploy!

---

## 📸 Demo Screenshots
*(Add screenshots after running locally)*

---

## 👨‍💻 Built For
- Final Year Engineering Project
- MERN Stack Portfolio Showcase
- Resume-worthy full-stack project with AI integration

---

## 📄 License
MIT — free to use, modify, and deploy.
