# AlumiNet Setup Guide

## Prerequisites

- Node.js and npm
- A free [MongoDB Atlas](https://cloud.mongodb.com) account
- A free [Groq](https://console.groq.com) API key

## 1. Clone the repository

```bash
git clone https://github.com/rohanvarade976-star/Aluminet.git
cd Aluminet
```

## 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

On Windows you can run `scripts\SETUP.bat` from the repository root to install both.

## 3. Configure environment variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in your own values. Example shape (placeholders only):

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/aluminet?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret>
JWT_REFRESH_SECRET=<your_jwt_refresh_secret>
GROQ_API_KEY=<your_groq_api_key>
EMAIL_USER=<your_email_address>
EMAIL_PASS=<your_email_app_password>
EMAIL_FROM=AlumiNet <your_email_address>
```

**MongoDB**
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user
4. Copy the connection string into `MONGODB_URI`

**JWT secrets**

Generate a strong value for each secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Groq API key**
1. Visit https://console.groq.com
2. Sign up (free)
3. Generate an API key
4. Paste it into `GROQ_API_KEY`

**Cloudinary (optional)**
1. Sign up at https://cloudinary.com
2. Copy the credentials from the dashboard
3. Fill in the `CLOUDINARY_*` variables, or leave them unset to skip

**Email (optional, needed for password reset and notifications)**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password in `EMAIL_PASS`

## 4. Seed demo data

```bash
cd server
node seed.js
```

Or run `scripts\seed.bat` on Windows.

## 5. Run the application

**Backend**
```bash
cd server
npm run dev
# http://localhost:5000
```

**Frontend**
```bash
cd client
npm run dev
# http://localhost:5173
```

On Windows, `scripts\start.bat` opens both in separate terminal windows.

## Environment variables reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend origin (CORS) | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<username>:<password>@<cluster-host>/<db>` |
| `JWT_SECRET` | Secret for signing access tokens | Generate with `crypto.randomBytes` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | Generate with `crypto.randomBytes` |
| `JWT_EXPIRE` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token lifetime | `7d` |
| `GROQ_API_KEY` | Groq AI API key | From https://console.groq.com |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (optional) | From the Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key (optional) | From the Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (optional) | From the Cloudinary dashboard |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Gmail address | `your_email@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | 16-character generated password |
| `EMAIL_FROM` | Sender shown on emails | `AlumiNet <your_email@gmail.com>` |

## Security checklist

- [ ] `.env` is in `.gitignore` and not committed
- [ ] All credentials are strong and unique
- [ ] 2FA is enabled on all service accounts
- [ ] Credentials are rotated regularly
- [ ] `.env.example` contains only placeholders
- [ ] No credentials in code comments

## Troubleshooting

**MongoDB connection error**
- Check the `MONGODB_URI` format
- Verify your IP is allowed in MongoDB Atlas (Network Access)
- Confirm the database user's password

**Port already in use**

Change `PORT` in `server/.env`, or free the port:

```bash
# macOS / Linux
lsof -ti:5000 | xargs kill -9
```

On Windows, find the process with `netstat -ano | findstr :5000` and stop it with `taskkill /PID <pid> /F`.

**Module not found**

Reinstall dependencies in the affected folder:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next steps

1. Read [SECURITY.md](../SECURITY.md) for security best practices
2. Set up GitHub Secrets for deployments
3. Configure GitHub Actions workflows
4. Enable branch protection rules
5. Set up monitoring and alerts

## Support

1. Check existing issues on GitHub
2. Create a new GitHub issue with details
3. Contact the development team
