# AlumiNet 🎓
### Smart Alumni-Student Interaction & Career Acceleration Platform

A production-grade, full-stack platform bridging the gap between university engineering students and graduated alumni through intelligent matching, context-aware AI advisory, real-time messaging, and institutional community spaces.

---

## ✨ Core Features

| Module | Technical Overview |
|---|---|
| 🎯 **Intelligent Alumni Matching** | Deterministic weighted overlap algorithm evaluating technical skill coverage (60%) and career interests (40%) with a strict 70% threshold. |
| 🤖 **Generative AI Career Suite** | Powered by Groq (`qwen/qwen3.8-27b`) for sub-second career guidance, personalized skill-gap roadmaps, and mock technical interview questions. |
| 💬 **Real-Time Collaboration** | Socket.io WebSockets with room multiplexing, optimistic updates via Zustand, typing indicators, read receipts, and online presence tracking. |
| 🛡️ **Identity Verification & RBAC** | Institutional ID verification workflow separating Student, Alumni, and Admin access levels. |
| 🚨 **Automated Fraud Prevention** | IP burst detection and cumulative fraud scoring with automated account flagging and a scheduled 24-hour score decay routine. |
| 💼 **Job & Referral Board** | Verified alumni post company openings and internal referrals filterable by tech stack, department, and experience level. |
| 📅 **Webinars & Events** | Alumni-hosted sessions with RSVP tracking, attendee limits, and calendar links. |
| 🗣️ **Discussion Forum** | Reddit-style campus forum with category tagging, upvoting, admin pinning, and AI co-pilot suggestions. |
| 📚 **Study Groups** | Peer-to-peer collaborative learning hubs with member caps and dedicated chat channels. |
| 🏆 **Gamification** | Points, badges, and unlockable achievements incentivizing community participation. |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Zustand, Lucide React, Recharts, React Hot Toast
- **Backend:** Node.js, Express.js (REST API, MVC Architecture)
- **Database:** MongoDB Atlas, Mongoose ODM
- **Real-Time:** Socket.io
- **AI Engine:** Groq SDK (`qwen/qwen3.8-27b`)
- **Authentication:** JWT (Access & Refresh tokens), Bcrypt.js (12 rounds)
- **Security:** Helmet, Express Rate Limit, Express Validator

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URI
- Free Groq API Key (from [console.groq.com](https://console.groq.com))

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/rohanvarade976-star/Aluminet.git
cd Aluminet

# Install all dependencies (Root, Server, Client)
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory (reference `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GROQ_API_KEY=your_groq_api_key
```

### 3. Seed Demo Data
```bash
npm run seed
```

### 4. Run Development Servers
```bash
# Start both Backend and Frontend concurrently
npm run dev
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🔑 Demo Credentials

- **Student:** `student@demo.com` / `demo123`
- **Alumni:** `alumni@demo.com` / `demo123`
- **Admin:** `admin@demo.com` / `demo123`

---

## 📄 License
This project is open-source and licensed under the MIT License.
