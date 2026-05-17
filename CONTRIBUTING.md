# AlumiNet - Contributing Guide

## Welcome to AlumiNet! 👋

We appreciate your interest in contributing to AlumiNet. This guide will help you get started.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Aluminet.git
   cd Aluminet
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/rohanvarade976-star/Aluminet.git
   ```

4. **Follow the SETUP_GUIDE.md** to configure your environment

## Development Workflow

### Creating a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/your-bug-fix
```

### Making Changes
- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Test your changes locally

### Committing Changes
```bash
git add .
git commit -m "type: description"
```

**Commit types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style (formatting, missing semicolons, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Dependency updates, build changes

### Pushing Your Changes
```bash
git push origin feature/your-feature-name
```

### Creating a Pull Request
1. Go to GitHub and create a PR against the main repository
2. Fill in the PR template
3. Ensure CI/CD checks pass
4. Request reviews from maintainers
5. Address feedback and iterate

## Code Standards

### JavaScript/Node.js
- Use ES6+ syntax
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants
- Use const by default, let if reassignment needed
- No var

### React Components
- Use functional components with hooks
- One component per file (unless very small)
- Use descriptive component names
- Add PropTypes or TypeScript
- Keep components small and focused

### Naming Conventions
```javascript
// Constants
const MAX_RETRIES = 3;
const API_TIMEOUT = 5000;

// Variables and functions
const userName = "John";
function getUserData() { }

// React Components
function UserProfile() { }
function useUserData() { }
```

## Testing

Before submitting a PR:
```bash
# Run tests
npm test

# Check code quality
npm run lint

# Build to check for errors
npm run build
```

## Security

- **Never commit `.env` files**
- **Never hardcode secrets** in code
- Use GitHub Secrets for sensitive data
- Follow SECURITY.md guidelines
- Use strong, unique API keys
- Enable 2FA on all accounts

## Documentation

- Update README.md if adding new features
- Document complex functions with comments
- Update SETUP_GUIDE.md if changing setup process
- Add examples for new features

## Need Help?

- Check existing issues and discussions
- Read SETUP_GUIDE.md for setup help
- Read SECURITY.md for security questions
- Create a GitHub issue if stuck
- Ask maintainers for clarification

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- No harassment or discrimination
- Report violations to maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to AlumiNet! 🚀
