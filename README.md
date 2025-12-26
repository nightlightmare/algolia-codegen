# Algolia Type Generator

[![npm version](https://img.shields.io/npm/v/algolia-codegen.svg?style=flat-square)](https://www.npmjs.com/package/algolia-codegen)
[![npm downloads](https://img.shields.io/npm/dm/algolia-codegen.svg?style=flat-square)](https://www.npmjs.com/package/algolia-codegen)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/algolia-codegen?style=flat-square)](https://bundlephobia.com/package/algolia-codegen)
[![GitHub stars](https://img.shields.io/github/stars/nightlightmare/algolia-codegen.svg?style=flat-square&logo=github)](https://github.com/nightlightmare/algolia-codegen)
[![GitHub issues](https://img.shields.io/github/issues/nightlightmare/algolia-codegen.svg?style=flat-square&logo=github)](https://github.com/nightlightmare/algolia-codegen/issues)
[![GitHub license](https://img.shields.io/github/license/nightlightmare/algolia-codegen.svg?style=flat-square)](https://github.com/nightlightmare/algolia-codegen/blob/main/LICENSE)
[![Node.js version](https://img.shields.io/node/v/algolia-codegen.svg?style=flat-square)](https://nodejs.org/)

This script automatically generates TypeScript types from your Algolia indices by fetching sample records and analyzing their structure. It supports multiple indices and flexible configuration through a config file.

**Repository**: [https://github.com/nightlightmare/algolia-codegen](https://github.com/nightlightmare/algolia-codegen)

## Prerequisites

- Node.js >= 20
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

## Quick Start

1. Create a configuration file named `algolia-codegen.ts` (or `.js`) in your project root:

```typescript
import type { AlgoliaCodegenConfig } from 'algolia-codegen';

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/algolia/types.ts': {
      appId: 'YOUR_APP_ID',
      searchKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'products',
      prefix: 'Algolia', // Optional
      postfix: 'Type', // Optional
    },
  },
};

export default config;
```

2. Run the generator:

```bash
algolia-codegen
```

Or if installed locally:

```bash
npx algolia-codegen
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
      prefix: 'Algolia', // Optional
      postfix: 'Type', // Optional
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

### Array of Configurations

You can also use an array of configurations:

```typescript
const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: [
    {
      'src/algolia/products.ts': {
        appId: 'YOUR_APP_ID',
        searchKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'products',
      },
    },
    {
      'src/algolia/users.ts': {
        appId: 'YOUR_APP_ID',
        searchKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'users',
      },
    },
  ],
};
```

## Usage

### CLI Usage

After installation, you can use the CLI command:

```bash
algolia-codegen
```

#### Options

- `-c, --config <path>` - Specify a custom config file path
- `-v, --verbose` - Enable verbose output (shows detailed logging)
- `--dry-run` - Simulate execution without writing files (useful for testing)

#### Examples

Specify a custom config file:

```bash
algolia-codegen --config path/to/config.ts
# or
algolia-codegen -c path/to/config.ts
```

Enable verbose output:

```bash
algolia-codegen --verbose
# or
algolia-codegen -v
```

Run in dry-run mode (no files will be written):

```bash
algolia-codegen --dry-run
```

Combine options:

```bash
algolia-codegen --config custom-config.ts --verbose --dry-run
```

Or if installed locally:

```bash
npx algolia-codegen
```

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
  appId: string; // Required: Algolia Application ID
  searchKey: string; // Required: Algolia Search API Key
  indexName: string; // Required: Algolia Index Name
  prefix?: string; // Optional: Prefix for generated type names
  postfix?: string; // Optional: Postfix for generated type names
};
```

## How It Works

1. **Loads Environment Variables**: Automatically loads `.env` file if present in the current directory
2. **Loads Configuration**: Reads the `algolia-codegen.ts` config file (or custom path), supporting both TypeScript and JavaScript
3. **Processes Each Path**: For each file path specified in the config:
   - Connects to Algolia using the provided credentials
   - Fetches a sample record from the specified index
   - Analyzes the record structure and generates TypeScript types
   - Creates a single TypeScript file containing all types found in the index
4. **Type Generation**: The generator automatically:
   - Fetches 20 sample records from each index for better type inference
   - Merges data from multiple records to ensure proper type detection
   - Infers types from the sample record structure
   - Handles nested objects, arrays, and complex types
   - **Generates Enum types** for string/number arrays with known values (up to 100 unique values)
   - Detects and generates generic `IdValue<T>` types for Algolia's id-value pattern arrays
   - Generates proper TypeScript interfaces with JSDoc comments
   - Sorts types by dependencies for correct ordering
5. **Error Handling**: Continues processing other files even if one fails, with detailed error messages

Each generated file contains all types found in the index, including nested types, properly organized and sorted by dependencies.

## Notes

- Each index must have at least one record for the script to work
- The script processes files sequentially and continues even if one fails
- Make sure your config file exports a default object
- TypeScript config files (`.ts`) are automatically supported - no compilation needed
- Environment variables from `.env` file are automatically loaded if present in the current directory
- Each generated file contains all types found in the index (including nested types) in a single file
- Types are automatically sorted by dependencies to ensure correct ordering
- The generator handles arrays, nested objects, optional fields, and null values
- **Enum types are automatically generated** for string/number arrays when all possible values are known (up to 100 unique values)
- The script fetches 20 sample records to improve type inference, especially for fields that may be empty in some records
- Automatically detects Algolia's `IdValue` pattern (arrays of objects with `id` and `value` properties) and generates generic types
- The project uses ES Modules - all local imports use `.js` extensions
- The library is compiled to both ESM and CommonJS formats for maximum compatibility

## Enum Type Generation

When the generator finds string or number arrays with a limited set of known values (up to 100 unique values), it automatically generates TypeScript Enum types instead of `string[]` or `number[]`. This provides better type safety and autocomplete support.

Example:

If your Algolia records contain a `facilityOnSite` field with values like `['wifi', 'parking', 'restaurant']`, the generator will create:

```typescript
export enum ParkInfoFacilityOnSiteEnum {
  WIFI = 'wifi',
  PARKING = 'parking',
  RESTAURANT = 'restaurant',
}

interface ParkInfo {
  facilityOnSite: ParkInfoFacilityOnSiteEnum[];
}
```

This ensures type safety and prevents typos when working with these values in your code.

## Examples

See the [examples directory](./examples/) for comprehensive examples including:

- Framework integrations (Next.js, React, Vue)
- CI/CD integration (GitHub Actions)
- Custom prefixes/postfixes
- Multiple indices configuration

## Repository

- **GitHub**: [https://github.com/nightlightmare/algolia-codegen](https://github.com/nightlightmare/algolia-codegen)
- **Issues**: [https://github.com/nightlightmare/algolia-codegen/issues](https://github.com/nightlightmare/algolia-codegen/issues)
- **npm**: [https://www.npmjs.com/package/algolia-codegen](https://www.npmjs.com/package/algolia-codegen)

## License

MIT
