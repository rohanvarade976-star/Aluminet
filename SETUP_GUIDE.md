# AlumiNet Setup Guide

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/rohanvarade976-star/Aluminet.git
cd Aluminet
```

### 2. Install Dependencies
```bash
# Backend setup
cd server
npm install

# Frontend setup
cd ../client
npm install
```

### 3. Configure Environment Variables

#### Backend (.env)
```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in your credentials:

**MongoDB Setup:**
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user
4. Get connection string and paste in MONGODB_URI

**JWT Secrets:**
```bash
# Generate secure secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Groq API Key:**
1. Visit https://console.groq.com
2. Sign up for free
3. Generate API key
4. Paste in GROQ_API_KEY

**Cloudinary (Optional):**
1. Sign up at https://cloudinary.com
2. Get credentials from dashboard
3. Fill in CLOUDINARY_* variables

**Email (Optional):**
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in EMAIL_PASS

### 4. Run Application

**Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT token signing | Generate with crypto.randomBytes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Generate with crypto.randomBytes |
| `GROQ_API_KEY` | Groq AI API key | From https://console.groq.com |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From cloudinary dashboard |
| `EMAIL_USER` | Gmail address | your_email@gmail.com |
| `EMAIL_PASS` | Gmail App Password | 16-character generated password |

## Security Checklist

- [ ] `.env` file is in `.gitignore` and not committed
- [ ] All credentials are strong and unique
- [ ] 2FA is enabled on all service accounts
- [ ] Credentials are rotated regularly
- [ ] `.env.example` contains only placeholders
- [ ] No credentials in code comments

## Troubleshooting

**MongoDB Connection Error:**
- Check MONGODB_URI format
- Verify IP is whitelisted in MongoDB Atlas
- Confirm database user password

**Port Already in Use:**
```bash
# Change PORT in .env or kill process:
lsof -ti:5000 | xargs kill -9
```

**Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Read [SECURITY.md](./SECURITY.md) for security best practices
2. Set up GitHub Secrets for deployments
3. Configure GitHub Actions workflows
4. Enable branch protection rules
5. Set up monitoring and alerts

## Support

For issues or questions, please:
1. Check existing issues on GitHub
2. Create a new GitHub issue with details
3. Contact the development team
