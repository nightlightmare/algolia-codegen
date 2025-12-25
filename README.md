# Algolia Type Generator

This script automatically generates TypeScript types from your Algolia indices by fetching sample records and analyzing their structure. It supports multiple indices and flexible configuration through a config file.

**Repository**: [https://github.com/nightlightmare/algolia-codegen](https://github.com/nightlightmare/algolia-codegen)

## Prerequisites

- Node.js >= 18
- Algolia account with at least one index

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

## Configuration

Create a configuration file named `algolia-codegen.ts` (or `.js`) in your project root. The config file should export a default object with the following structure:

```typescript
import type { AlgoliaCodegenConfig } from 'algolia-codegen';

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/algolia/types.ts': {
      appId: 'YOUR_APP_ID',
      searchKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'products',
      prefix: 'Algolia',  // Optional
      postfix: 'Type'      // Optional
    },
  },
};

export default config;
```

### Multiple Indices

You can generate types for multiple indices:

```typescript
const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/algolia/products.ts': {
      appId: 'YOUR_APP_ID',
      searchKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'products',
    },
    'src/algolia/users.ts': {
      appId: 'YOUR_APP_ID',
      searchKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'users',
    },
  },
};
```

### Using Environment Variables

You can use environment variables in your config:

```typescript
const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/algolia/types.ts': {
      appId: process.env.APP_ID!,
      searchKey: process.env.SEARCH_KEY!,
      indexName: process.env.INDEX_NAME!,
    },
  },
};
```

## Usage

### CLI Usage

After installation, you can use the CLI command:

```bash
algolia-codegen
```

Or specify a custom config file:

```bash
algolia-codegen --config path/to/config.ts
```

Or if installed locally:

```bash
npx algolia-codegen
```

## How It Works

1. **Loads Configuration**: Reads the `algolia-codegen.ts` config file (or custom path)
2. **Processes Each Path**: For each file path specified in the config:
   - Connects to Algolia using the provided credentials
   - Fetches a sample record from the specified index
   - Validates the connection and data availability
3. **Error Handling**: Continues processing other files even if one fails, with detailed error messages

> **Note**: Currently, the script validates connections and fetches sample data. Type generation functionality is coming soon.

## Configuration Schema

### `AlgoliaCodegenConfig`

```typescript
type AlgoliaCodegenConfig = {
  overwrite: boolean;
  generates: InstanceOrArray<UrlSchema>;
};
```

### `AlgoliaCodegenGeneratorConfig`

```typescript
type AlgoliaCodegenGeneratorConfig = {
  appId: string;           // Required: Algolia Application ID
  searchKey: string;       // Required: Algolia Search API Key
  indexName: string;       // Required: Algolia Index Name
  prefix?: string;         // Optional: Prefix for generated type names
  postfix?: string;        // Optional: Postfix for generated type names
};
```

## Notes

- Each index must have at least one record for the script to work
- The script processes files sequentially and continues even if one fails
- Make sure your config file exports a default object
- For TypeScript config files, you may need to use `tsx` or compile them first: `tsx algolia-codegen`

## Project Structure

The project is organized into the following structure:

```
src/
├── index.ts                    # Main entry point with exports and main function
├── types.ts                    # TypeScript type definitions
├── cli.ts                      # CLI entry point
├── generate-types.ts           # Type generation logic (legacy)
└── utils/
    ├── validation.ts           # Configuration validation functions
    ├── config-loader.ts        # Configuration file loading logic
    └── fetch-algolia-data.ts   # Algolia data fetching logic
```

### Module Exports

The package exports the following:

- **Types**: 
  - `AlgoliaCodegenConfig` - Main configuration type
  - `AlgoliaCodegenGeneratorConfig` - Generator configuration for each file
  - `UrlSchema` - Schema mapping file paths to generator configs
  - `InstanceOrArray<T>` - Utility type for single or array values
- **Main function**: `main(configPath?: string)` - Loads and processes configuration
- **Validation functions**: 
  - `validateConfig` - Validates the main configuration structure
  - `validateUrlSchema` - Validates URL schema objects
  - `validateGeneratorConfig` - Validates generator configuration

## Example

See `examples/simple/algolia-codegen.ts` for a complete example configuration file.

For contributions and feature requests, please visit the [GitHub repository](https://github.com/nightlightmare/algolia-codegen).

## Repository

- **GitHub**: [https://github.com/nightlightmare/algolia-codegen](https://github.com/nightlightmare/algolia-codegen)
- **Issues**: [https://github.com/nightlightmare/algolia-codegen/issues](https://github.com/nightlightmare/algolia-codegen/issues)
- **npm**: [https://www.npmjs.com/package/algolia-codegen](https://www.npmjs.com/package/algolia-codegen)
