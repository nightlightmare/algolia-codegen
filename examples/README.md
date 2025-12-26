# Examples

This directory contains various examples demonstrating how to use `algolia-codegen` in different scenarios.

## Available Examples

### Framework Integrations

#### [Next.js Example](./nextjs-example/)
Complete Next.js application with Algolia search integration and type generation.

**Features:**
- Next.js 14 with App Router
- Type-safe Algolia search
- Environment variable configuration
- Pre-build type generation

**Quick Start:**
```bash
cd nextjs-example
pnpm install
cp .env.example .env  # Fill in your Algolia credentials
pnpm codegen
pnpm dev
```

#### [React Example](./react-example/)
React application with Vite and Algolia integration.

**Features:**
- React 18 with TypeScript
- Vite build tool
- Automatic type generation before dev server
- Type-safe search components

**Quick Start:**
```bash
cd react-example
pnpm install
cp .env.example .env  # Fill in your Algolia credentials
pnpm codegen
pnpm dev
```

#### [Vue Example](./vue-example/)
Vue 3 application with Composition API and Algolia integration.

**Features:**
- Vue 3 with TypeScript
- Composition API
- Vite build tool
- Type-safe search components

**Quick Start:**
```bash
cd vue-example
pnpm install
cp .env.example .env  # Fill in your Algolia credentials
pnpm codegen
pnpm dev
```

### Configuration Examples

#### [Basic Example](./basic-example/)
Simple example showing the basic setup and usage.

#### [Multiple Indices](./multiple-indices/)
Example demonstrating how to generate types for multiple Algolia indices.

#### [Array Config](./array-config/)
Example showing how to use array-based configuration.

#### [Custom Prefixes/Postfixes](./custom-prefixes-postfixes/)
Demonstrates how to customize type naming with prefixes and postfixes.

**Features:**
- Custom prefix examples
- Custom postfix examples
- Combined prefix/postfix examples
- Domain-specific naming conventions

**Quick Start:**
```bash
cd custom-prefixes-postfixes
pnpm install
cp .env.example .env  # Fill in your Algolia credentials
pnpm codegen
```

### CI/CD Integration

#### [CI/CD Integration](./ci-cd-integration/)
GitHub Actions workflows for automated type generation.

**Features:**
- Automatic type generation on schedule
- Pre-commit type validation
- Auto-commit generated types
- PR creation for type updates

**Workflows:**
- `codegen.yml`: Automatic type generation and updates
- `pre-commit-check.yml`: Validates types are up to date in PRs

**Quick Start:**
1. Copy workflows to your `.github/workflows/` directory
2. Configure GitHub secrets:
   - `ALGOLIA_APP_ID`
   - `ALGOLIA_SEARCH_KEY`
3. Customize `algolia-codegen.ts` with your configuration

## Common Setup Steps

All examples follow a similar setup pattern:

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Algolia credentials
   ```

3. **Generate types:**
   ```bash
   pnpm codegen
   ```

4. **Start development (if applicable):**
   ```bash
   pnpm dev
   ```

## Environment Variables

Most examples require the following environment variables:

- `ALGOLIA_APP_ID`: Your Algolia Application ID
- `ALGOLIA_SEARCH_KEY`: Your Algolia Search API Key
- `ALGOLIA_INDEX_NAME`: Name of your Algolia index

**Note:** Framework-specific examples may use different variable names:
- Next.js: `NEXT_PUBLIC_ALGOLIA_*`
- React/Vue (Vite): `VITE_ALGOLIA_*`

## Choosing the Right Example

- **Starting a new project?** → Use the framework example that matches your stack
- **Adding to existing project?** → Check the basic example or custom prefixes example
- **Need CI/CD integration?** → See the CI/CD integration example
- **Working with multiple indices?** → Check the multiple indices example

## Contributing

If you'd like to add a new example:

1. Create a new directory under `examples/`
2. Include:
   - `algolia-codegen.ts` configuration file
   - `package.json` with dependencies
   - `README.md` with setup instructions
   - Example code demonstrating usage
3. Update this README with your example

## Need Help?

- Check the [main README](../README.md) for general usage
- Review the [documentation](https://github.com/nightlightmare/algolia-codegen)
- Open an [issue](https://github.com/nightlightmare/algolia-codegen/issues) for questions

