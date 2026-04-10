# AlumiNet v2 — Setup Guide

## Step 1: Install dependencies
```
cd server && npm install
cd ../client && npm install
```

## Step 2: Create server/.env
Copy server/.env.example to server/.env and fill in:

MONGODB_URI=mongodb+srv://rohanvarade976:Rohan1234@cluster0.nuwuup5.mongodb.net/aluminet?retryWrites=true&w=majority
JWT_SECRET=aluminet_jwt_secret_key_2025
JWT_REFRESH_SECRET=aluminet_refresh_secret_2025

# Get FREE Anthropic API key at https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE

# Leave these as-is for now:
CLOUDINARY_CLOUD_NAME=skip
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=skipskipskipskipskipskipskip
EMAIL_USER=skip@skip.com
EMAIL_PASS=skipskipskipskip
EMAIL_FROM=AlumiNet <noreply@aluminet.com>

## Step 3: Seed demo data
```
cd server && node seed.js
```

## Step 4: Run
Terminal 1: cd server && npm run dev
Terminal 2: cd client && npm run dev

Open: http://localhost:5173

## Login:
- student@demo.com / demo123
- alumni@demo.com / demo123
- admin@demo.com / demo123

## New in v2:
- AI ChatBot (bottom right on every page)
- Job Recommendations (/jobs)
- Resume Analyzer (/resume)
- Verification system (/verify)
- Admin verification queue (/admin/verify)
- Full dark mode UI
