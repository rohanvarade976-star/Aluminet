# AlumiNet Architecture Specification

## Overview
AlumiNet is engineered as a monolithic MERN architecture designed for maintainability, low operational latency, and real-time bi-directional responsiveness.

```
[ Client: React 18 / Vite / Tailwind ]
       │                      ▲
       │ HTTPS REST           │ WebSocket (Socket.io)
       ▼                      │
[ Express.js Gateway ]────────┘
   ├── Security Layer (Helmet, CORS, Rate Limiters)
   ├── Fraud Detection Middleware (IP rate bursts, cumulative scoring)
   ├── JWT Auth Middleware (RBAC: Student, Alumni, Admin)
   │
   ├── Core Services
   │    ├── Matching Engine (Weighted Skills 60% + Interests 40%)
   │    ├── AI Service (Groq SDK: qwen/qwen3.8-27b)
   │    └── Notification & Real-Time Handler
   │
   └── Persistence Layer (MongoDB Atlas via Mongoose)
```

## Frontend Architecture
- **Single Page Application:** React 18 with Vite for optimized bundling and instant HMR.
- **State Segregation:** Global stores managed cleanly via Zustand (`authStore`, `socketStore`, `themeStore`), avoiding component re-render cascading.
- **Design System:** Tailwind CSS with responsive layout and glassmorphism styling, anchored to a normalized `15px` root typography scale.

## Backend Architecture
- **MVC Design Pattern:** Separation of concerns across Models, Controllers, Routes, Services, and Middleware.
- **Security & RBAC:** All sensitive routes enforce token verification and role permissions.
- **Automated Fraud Scoring:** Heuristic middleware evaluates request anomalies, with a background decay timer (`decayFraudScores`) running every 24 hours.
