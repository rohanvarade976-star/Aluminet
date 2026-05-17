# Security Guidelines for AlumiNet

## ⚠️ Critical: Exposed Credentials Found

**Status**: ✅ Resolved (Commit: 192ef1197528b4637cbd1bedc8d5be342ca95dd2)

Exposed credentials were previously committed to the repository. All credentials have been replaced with placeholder values.

### Immediate Actions Required

#### 1. Rotate All Credentials
If you or anyone else accessed the repository before May 10, 2026, consider these credentials compromised:

- **MongoDB Atlas**
  - [ ] Change MongoDB user password
  - [ ] Generate new database user credentials
  - [ ] Update connection string in your `.env` file

- **JWT Secrets**
  - [ ] Generate new JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - [ ] Generate new JWT_REFRESH_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - [ ] Update `.env` and redeploy

- **Groq API Key**
  - [ ] Revoke current API key at https://console.groq.com
  - [ ] Generate new API key
  - [ ] Update `.env`

- **Cloudinary Credentials**
  - [ ] Regenerate API keys at https://cloudinary.com/console
  - [ ] Update `.env`

- **Email Credentials**
  - [ ] Change Gmail password
  - [ ] Regenerate App Password at https://myaccount.google.com/apppasswords
  - [ ] Update `.env`

#### 2. Clean Git History (Optional but Recommended)
To completely remove credentials from git history, use BFG Repo Cleaner:

```bash
# Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Create a file with patterns to remove
echo "password" > expressions.txt
echo "secret" >> expressions.txt
echo "token" >> expressions.txt

# Run BFG to remove sensitive data
java -jar bfg-1.14.0.jar --replace-text expressions.txt .

# Cleanup and push
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force-with-lease
```

## Security Best Practices

### 1. Environment Variables (.env)
- ✅ `.env` is in `.gitignore` and will NOT be committed
- Always copy `.env.example` to `.env` locally
- Never commit `.env` files
- Never share `.env` files via email or chat

### 2. API Keys & Secrets
- Rotate keys regularly (quarterly recommended)
- Use different keys for development and production
- Never commit secrets to version control
- Use GitHub Secrets for CI/CD pipelines

### 3. Credentials Management
- Use strong, unique passwords (20+ characters)
- Enable 2-Factor Authentication (2FA) on all accounts
- For Gmail: Use App Passwords, not your main password
- Store backup codes securely for 2FA recovery

### 4. MongoDB Security
- Enable IP Whitelist in MongoDB Atlas
- Use VPN or SSH tunnel for local development
- Enable encryption at rest and in transit
- Regularly backup your database

### 5. Git Security
- Add `*.env` to `.gitignore` (already done)
- Use `.env.example` for configuration templates
- Review commits before pushing (git log)
- Enable branch protection rules
- Require pull request reviews before merge

### 6. Deployment Security
- Use GitHub Secrets for sensitive values in Actions
- Never log sensitive data
- Use HTTPS only in production
- Set secure HTTP headers
- Enable CORS properly

## GitHub Secrets for CI/CD

To use credentials in GitHub Actions without exposing them:

1. Go to: Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each credential:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `GROQ_API_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`

Use in GitHub Actions:
```yaml
env:
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  # ... etc
```

## Monitoring & Alerts

Consider using:
- **GitHub Secret Scanning** - Detects exposed tokens
- **Snyk** - Finds vulnerable dependencies
- **OWASP Dependency Check** - Scans for security vulnerabilities
- **SonarQube** - Code quality and security analysis

## References

- [GitHub: Managing sensitive data](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App: Config](https://12factor.net/config)
- [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

## Questions?

If you have security concerns, create a private security advisory or contact your team lead.
