# Contributing to Algolia Codegen

Thank you for your interest in contributing to Algolia Codegen! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Building](#building)
- [Submitting Changes](#submitting-changes)
- [Project Structure](#project-structure)
- [Additional Notes](#additional-notes)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20 (check with `node --version`)
- **pnpm** (recommended package manager)
  - Install with: `npm install -g pnpm`
- **Git** for version control

## Getting Started

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/algolia-codegen.git
   cd algolia-codegen
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/nightlightmare/algolia-codegen.git
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   ```

5. **Verify the setup**:
   ```bash
   pnpm build
   pnpm test
   ```

## Development Workflow

### Branch Naming

Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

Use descriptive branch names:
- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation updates
- `refactor/` - for code refactoring
- `test/` - for adding or updating tests

### Making Changes

1. Make your changes in the `src/` directory
2. Write or update tests for your changes
3. Ensure all tests pass: `pnpm test`
4. Check code style: `pnpm lint` and `pnpm format:check`
5. Build the project: `pnpm build`

### Commit Messages

Write clear and descriptive commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
```
feat: add support for custom type prefixes

Add ability to specify custom prefixes for generated type names
in the configuration file.

Closes #123
```

```
fix: handle empty arrays in type generation

Fix issue where empty arrays caused type generation to fail.
Add proper null/undefined checks.

Fixes #456
```

## Code Style

### TypeScript

- Use TypeScript strict mode (already configured)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer explicit types over `any`
- Use ES Modules (`.js` extensions for local imports)

### ESLint

The project uses ESLint with TypeScript support. Run linting:

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

### Prettier

Code formatting is handled by Prettier. Format your code:

```bash
# Format all files
pnpm format

# Check formatting without changing files
pnpm format:check
```

### Type Checking

Run TypeScript type checking:

```bash
pnpm type-check
```

## Testing

### Writing Tests

- Write tests for all new features and bug fixes
- Place test files next to source files with `.test.ts` extension
- Use Vitest testing framework
- Follow existing test patterns in the codebase

Example test structure:

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Coverage Requirements

The project maintains minimum coverage thresholds:
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

Ensure your changes maintain or improve these thresholds. Coverage reports are generated in the `coverage/` directory.

## Building

Build the project:

```bash
# Build once
pnpm build

# Build in watch mode (for development)
pnpm dev
```

The build process:
- Compiles TypeScript to JavaScript
- Generates type definitions (`.d.ts` files)
- Outputs both ESM (`.js`) and CommonJS (`.cjs`) formats
- Outputs to the `dist/` directory

## Submitting Changes

### Before Submitting

Ensure you've completed the following:

- [ ] All tests pass (`pnpm test`)
- [ ] Code is formatted (`pnpm format`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Coverage thresholds are met (`pnpm test:coverage`)
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow the guidelines

### Pull Request Process

1. **Update your branch** with the latest changes from upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes** to your fork:
   ```bash
   git push origin your-branch-name
   ```

3. **Create a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots or examples if applicable
   - Ensure CI checks pass

4. **Respond to feedback**:
   - Address review comments promptly
   - Make requested changes
   - Keep discussions focused and constructive

### Pull Request Template

When creating a PR, include:

- **Description**: What changes were made and why
- **Type**: Feature, Bug Fix, Documentation, etc.
- **Testing**: How the changes were tested
- **Checklist**: Confirm all requirements are met

## Project Structure

```
algolia-codegen/
├── src/                    # Source code
│   ├── cli.ts             # CLI entry point
│   ├── index.ts           # Main library entry point
│   ├── types.ts           # Type definitions
│   └── utils/             # Utility functions
│       ├── fetch-algolia-data.ts
│       ├── generate-typescript-types.ts
│       ├── load-config.ts
│       ├── load-typescript-config.ts
│       └── validations/   # Validation schemas
├── examples/              # Example configurations
├── dist/                  # Build output (generated)
├── coverage/              # Test coverage reports (generated)
├── tests/                # Test files (co-located with source)
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── vitest.config.ts      # Vitest configuration
├── tsup.config.ts        # Build configuration
└── eslint.config.mjs     # ESLint configuration
```

### Key Files

- `src/cli.ts` - Command-line interface
- `src/index.ts` - Main library exports
- `src/utils/` - Core functionality
  - `fetch-algolia-data.ts` - Fetches data from Algolia
  - `generate-typescript-types.ts` - Generates TypeScript types
  - `load-config.ts` - Loads configuration files
  - `load-typescript-config.ts` - Loads TypeScript config
  - `validations/` - Configuration validation schemas

## Additional Notes

### Environment Variables

The project supports loading environment variables from `.env` files. If you need to test with Algolia credentials:

1. Create a `.env` file in the project root (this file is gitignored)
2. Add your Algolia credentials:
   ```
   ALGOLIA_APP_ID=your_app_id
   ALGOLIA_SEARCH_KEY=your_search_key
   ```

### ES Modules

The project uses ES Modules. When importing local files, use `.js` extensions:

```typescript
import { something } from './utils/helper.js';
```

### Build Output

- The project builds to both ESM and CommonJS formats
- Type definitions are automatically generated
- The `dist/` directory contains the compiled output

### Examples

The `examples/` directory contains example configurations. When adding new features, consider adding examples if they help users understand the feature.

### Questions?

If you have questions or need help:

- Open an issue on GitHub
- Check existing issues and discussions
- Review the README.md for usage information

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

Thank you for contributing to Algolia Codegen! 🎉

