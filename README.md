# Webflow Forms - Quality Assurance Setup

This repository contains JavaScript files for Webflow form tracking and validation. To prevent syntax errors and maintain code quality, several infrastructure steps have been implemented.

## 🛡️ Quality Assurance Infrastructure

### 1. Pre-commit Hook

- **Location**: `.git/hooks/pre-commit`
- **Purpose**: Automatically checks JavaScript syntax before allowing commits
- **What it does**: Runs `node -c` on all staged JavaScript files
- **Result**: Blocks commits with syntax errors

### 2. ESLint Configuration

- **Location**: `.eslintrc.js`
- **Purpose**: Enforces coding standards and catches common errors
- **Usage**: `npm run lint` or `npm run lint:fix`

### 3. GitHub Actions CI/CD

- **Location**: `.github/workflows/ci.yml`
- **Purpose**: Runs quality checks on every push and pull request
- **Checks**: Syntax validation, ESLint, pre-commit hook simulation

### 4. Package.json Scripts

- **Location**: `package.json`
- **Available commands**:
  - `npm run check-syntax` - Check JavaScript syntax
  - `npm run lint` - Run ESLint
  - `npm run lint:fix` - Fix auto-fixable ESLint issues
  - `npm run pre-commit` - Run all pre-commit checks

## 🚀 Setup Instructions

### For New Developers:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd website-webflow-code

# 2. Install dependencies
npm install

# 3. The pre-commit hook is already set up and will work automatically
```

### For Existing Developers:

```bash
# 1. Install dependencies
npm install

# 2. Test the pre-commit hook
.git/hooks/pre-commit

# 3. Run linting on all files
npm run lint
```

## 🔧 How It Prevents Errors

### Before Committing:

1. **Pre-commit hook** automatically runs
2. Checks syntax of all staged JavaScript files
3. Blocks commit if any syntax errors found
4. Shows clear error messages

### Before Pushing:

1. **GitHub Actions** runs on every push
2. Validates syntax and runs ESLint
3. Fails the build if issues found
4. Prevents merging broken code

### Manual Checks:

```bash
# Check syntax of all JS files
npm run check-syntax

# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## 📁 File Structure

```
├── .git/hooks/pre-commit          # Pre-commit hook
├── .github/workflows/ci.yml       # GitHub Actions
├── .eslintrc.js                   # ESLint configuration
├── package.json                   # Dependencies and scripts
├── README.md                      # This file
└── *.js                          # Your JavaScript files
```

## 🚨 What Happens When Errors Are Found

### Pre-commit Hook:

```
❌ Syntax error found in agent-form.js
Please fix syntax errors before committing.
❌ Commit blocked due to syntax errors.
```

### GitHub Actions:

- Build fails with detailed error messages
- Pull requests cannot be merged
- Email notifications sent to team

## 💡 Best Practices

1. **Always run `npm run lint` before committing**
2. **Fix ESLint warnings, not just errors**
3. **Use `npm run lint:fix` for auto-fixable issues**
4. **Test your changes locally before pushing**
5. **Review GitHub Actions results before merging**

## 🔍 Troubleshooting

### Pre-commit hook not working:

```bash
# Make sure it's executable
chmod +x .git/hooks/pre-commit

# Test it manually
.git/hooks/pre-commit
```

### ESLint errors:

```bash
# See all issues
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific file
npx eslint agent-form.js
```

This setup ensures that syntax errors like the corrupted "ttttttte" text will never make it into your repository again!
