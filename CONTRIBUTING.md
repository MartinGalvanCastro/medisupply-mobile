# Contributing to MediSupply Mobile

This guide covers the development workflow, code quality standards, and pre-commit hooks.

## Table of Contents

- [Getting Started](#getting-started)
- [Code Quality](#code-quality)
- [Pre-Commit Hooks](#pre-commit-hooks)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn (Corepack enabled)
- Git

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd medisupply-mobile
```

2. Install dependencies:
```bash
yarn install
```

3. Initialize Husky (if not already done):
```bash
yarn prepare
```

This will set up Git hooks automatically.

## Code Quality

The project uses several tools to ensure code quality:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files

### Run Quality Checks Manually

```bash
# Lint check
yarn lint

# Lint and auto-fix
yarn lint:fix

# Format check
yarn format:check

# Format and auto-fix
yarn format

# Type check
yarn type-check
```

## Pre-Commit Hooks

**All code is automatically checked before every commit!**

### What Happens on `git commit`

1. **Husky** intercepts the commit
2. **lint-staged** runs on your staged files:
   - TypeScript/JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`):
     - ✅ ESLint auto-fix
     - ✅ Prettier formatting
   - JSON/Markdown files (`.json`, `.md`):
     - ✅ Prettier formatting
3. If any errors are found:
   - ❌ Commit is blocked
   - 📝 You'll see error messages
   - 🔧 Fix the issues and try again
4. If everything passes:
   - ✅ Commit succeeds

### Example Workflow

```bash
# 1. Make your changes
vim src/components/MyComponent.tsx

# 2. Stage your changes
git add src/components/MyComponent.tsx

# 3. Commit (pre-commit hook runs automatically)
git commit -m "Add MyComponent"

# If there are issues:
# ❌ error  Missing semicolon  prettier/prettier
# Fix the issues and commit again

# After fixing:
git add src/components/MyComponent.tsx
git commit -m "Add MyComponent"
# ✅ Commit succeeds!
```

### What Gets Checked

**TypeScript/JavaScript Files:**
- ✅ ESLint rules (unused vars, type safety, best practices)
- ✅ Prettier formatting (semicolons, quotes, indentation)
- ✅ Import ordering
- ✅ Code style consistency

**JSON/Markdown Files:**
- ✅ Prettier formatting
- ✅ Consistent indentation

**What's NOT Checked:**
- Generated files (`src/api/generated/*`)
- Build output (`dist/`, `build/`, `android/`, `ios/`)
- Dependencies (`node_modules/`)

See `.prettierignore` for the full list.

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

Follow the project's folder-based structure and best practices.

### 3. Run Tests

```bash
yarn test
```

### 4. Check Code Quality

```bash
# Run all checks
yarn lint && yarn format:check && yarn type-check

# Or auto-fix everything
yarn lint:fix && yarn format
```

### 5. Commit Changes

```bash
git add .
git commit -m "Add feature: description"
# Pre-commit hooks run automatically ✅
```

### 6. Push and Create PR

```bash
git push origin feature/my-feature
```

Then create a Pull Request on GitHub.

## Code Style

### Prettier Configuration

The project uses the following Prettier settings (`.prettierrc.json`):

```json
{
  "semi": true,              // Use semicolons
  "trailingComma": "es5",    // Trailing commas where valid in ES5
  "singleQuote": true,       // Use single quotes
  "printWidth": 100,         // Line width of 100 characters
  "tabWidth": 2,             // 2 spaces per indentation
  "useTabs": false,          // Use spaces, not tabs
  "arrowParens": "always",   // Always include arrow function parens
  "endOfLine": "lf",         // Unix-style line endings
  "bracketSpacing": true,    // Spaces in object literals
  "bracketSameLine": false   // JSX closing bracket on new line
}
```

### ESLint Rules

Key ESLint rules:

- **No unused variables** (except when prefixed with `_`)
- **Warn on `any` types** (prefer explicit types)
- **Prettier integration** (formatting errors fail linting)

### TypeScript Style

```typescript
// ✅ Good
export const MyComponent: React.FC<Props> = ({ name, age }) => {
  return <Text>{name}</Text>;
};

// ❌ Bad - missing types
export const MyComponent = ({ name, age }) => {
  return <Text>{name}</Text>;
};
```

### Import Order

Imports are automatically organized by ESLint:

```typescript
// 1. External dependencies
import React from 'react';
import { View } from 'react-native';

// 2. Internal imports
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';

// 3. Relative imports
import { MyComponent } from './MyComponent';
```

## Bypassing Pre-Commit Hooks

**⚠️ Not recommended!**

In rare cases, you may need to bypass the hooks:

```bash
git commit --no-verify -m "Emergency fix"
```

**Only use this for:**
- Emergency hotfixes
- Work-in-progress commits on your local branch
- Generated/auto-formatted code

**Never bypass hooks for:**
- Commits to `main` or `develop`
- Pull requests
- Shared branches

## Troubleshooting

### Hook doesn't run

```bash
# Reinstall Husky
rm -rf .husky
yarn prepare
```

### Lint-staged fails

```bash
# Clear cache and reinstall
rm -rf node_modules .yarn/cache
yarn install
```

### ESLint/Prettier conflicts

The configuration is set up to avoid conflicts:
- Prettier handles **formatting**
- ESLint handles **code quality**
- `eslint-config-prettier` disables conflicting ESLint rules

If you see conflicts:

```bash
# Format first, then lint
yarn format
yarn lint:fix
```

### Files not being checked

Make sure files are staged:

```bash
git status  # Check what's staged
git add <file>  # Stage files
git commit  # Hooks run on staged files only
```

## Best Practices

### 1. Commit Often

Small, focused commits are easier to review and revert if needed.

```bash
# ✅ Good - focused commit
git commit -m "Add user authentication hook"

# ❌ Bad - too many changes
git commit -m "Add everything"
```

### 2. Fix Issues Immediately

Don't accumulate formatting/linting issues:

```bash
# Run checks frequently during development
yarn lint
yarn format
```

### 3. Use Editor Integration

Install Prettier and ESLint extensions for your editor:

**VS Code:**
- ESLint extension
- Prettier extension
- Enable "Format on Save"

**WebStorm/IntelliJ:**
- Built-in Prettier support
- Built-in ESLint support
- Enable on save

### 4. Review Before Committing

```bash
# See what will be committed
git diff --staged

# Review changes
git status
```

## Git Workflow

### Recommended Commit Message Format

```
<type>: <short description>

<optional longer description>

<optional footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
git commit -m "feat: add user profile screen"
git commit -m "fix: resolve authentication token expiry"
git commit -m "docs: update README with new setup instructions"
git commit -m "refactor: extract common button component"
```

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)

## Summary

- ✅ Pre-commit hooks are set up with Husky
- ✅ lint-staged runs on staged files only
- ✅ ESLint + Prettier ensure code quality
- ✅ TypeScript checks for type safety
- ✅ All checks run automatically before every commit
- ✅ Failing checks block the commit
- ✅ Fix issues and commit again

Happy coding! 🚀
