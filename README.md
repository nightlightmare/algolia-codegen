# Algolia Type Generator

This script automatically generates TypeScript types from your Algolia index by fetching a sample record and analyzing its structure.

**Repository**: [https://github.com/nightlightmare/algolia-codegen](https://github.com/nightlightmare/algolia-codegen)

## Prerequisites

Make sure you have the following environment variables set in your `.env` file:

- `ALGOLIA_APP_ID` - Your Algolia Application ID
- `ALGOLIA_SEARCH_KEY` - Your Algolia Search API Key
- `ALGOLIA_INDEX_NAME` - Your Algolia Index Name

The script will automatically check for `.env`, `.env.local`, and `.env.development.local` files in the current directory.

## Installation

Install the package globally or locally:

```bash
# Global installation
npm install -g algolia-codegen

# Or local installation
npm install algolia-codegen
# or
pnpm add algolia-codegen
# or
yarn add algolia-codegen
```

## Usage

### CLI Usage

After installation, you can use the CLI command:

```bash
algolia-codegen
```

Or if installed locally:

```bash
npx algolia-codegen
```

### Programmatic Usage

You can also import and use the package programmatically:

```typescript
import { main } from 'algolia-codegen';

main();
```

## How It Works

1. **Connects to Algolia**: Uses your configured Algolia credentials to connect to your index
2. **Fetches Sample Record**: Retrieves one record from your Algolia index
3. **Analyzes Structure**: Recursively analyzes the JSON structure to infer TypeScript types
4. **Generates Types**: Creates TypeScript interface files in the specified output directory
5. **Handles Special Cases**:
   - Detects `AlgoliaIdValue` patterns (objects with `id` and `value` properties)
   - Handles nested objects and arrays
   - Preserves optional fields (null/undefined values)
   - Generates proper imports between types

## Generated Files

The script generates TypeScript interface files in the output directory (default: `src/shared/algolia/`).

Each type gets its own file (e.g., `AlgoliaCampground.ts`, `AlgoliaAddress.ts`), and an `index.ts` file exports all types.

## Notes

- The script analyzes a single sample record, so make sure your index has at least one record
- If your data structure varies significantly between records, you may need to manually adjust some types
- The script will overwrite existing type files, so make sure to commit your changes before running
- Consider running this script as part of your CI/CD pipeline to keep types in sync with your Algolia index

## Customization

You can modify `generate-types.ts` to:
- Adjust type naming conventions
- Add custom type inference logic
- Change the output directory
- Add additional type transformations

For contributions and feature requests, please visit the [GitHub repository](https://github.com/nightlightmare/algolia-codegen).

## Publishing

This package is automatically published to npm when changes are merged into the `main` branch via GitHub Actions.

### Setting up NPM_TOKEN

To enable automatic publishing, you need to configure the `NPM_TOKEN` secret in your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Your npm access token (create one at https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
6. Make sure the token has **Automation** or **Publish** permissions
7. Click **Add secret**

The workflow will automatically:
- Build the package
- Publish to npm when PRs are merged into `main`
- Use provenance for enhanced security

### Manual Publishing

To publish manually:

```bash
pnpm build
pnpm publish
```

## Repository

- **GitHub**: [https://github.com/nightlightmare/algolia-codegen](https://github.com/nightlightmare/algolia-codegen)
- **Issues**: [https://github.com/nightlightmare/algolia-codegen/issues](https://github.com/nightlightmare/algolia-codegen/issues)
- **npm**: [https://www.npmjs.com/package/algolia-codegen](https://www.npmjs.com/package/algolia-codegen)

