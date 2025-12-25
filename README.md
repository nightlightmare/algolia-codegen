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

## Quick Start

1. Create a configuration file named `algolia-codegen.ts` (or `.js`) in your project root:

```typescript
import type { AlgoliaCodegenConfig } from "algolia-codegen";

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    "src/algolia/types.ts": {
      appId: "YOUR_APP_ID",
      searchKey: "YOUR_SEARCH_API_KEY",
      indexName: "products",
      prefix: "Algolia", // Optional
      postfix: "Type", // Optional
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
import type { AlgoliaCodegenConfig } from "algolia-codegen";

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    "src/algolia/types.ts": {
      appId: "YOUR_APP_ID",
      searchKey: "YOUR_SEARCH_API_KEY",
      indexName: "products",
      prefix: "Algolia", // Optional
      postfix: "Type", // Optional
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
    "src/algolia/products.ts": {
      appId: "YOUR_APP_ID",
      searchKey: "YOUR_SEARCH_API_KEY",
      indexName: "products",
    },
    "src/algolia/users.ts": {
      appId: "YOUR_APP_ID",
      searchKey: "YOUR_SEARCH_API_KEY",
      indexName: "users",
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
      "src/algolia/products.ts": {
        appId: "YOUR_APP_ID",
        searchKey: "YOUR_SEARCH_API_KEY",
        indexName: "products",
      },
    },
    {
      "src/algolia/users.ts": {
        appId: "YOUR_APP_ID",
        searchKey: "YOUR_SEARCH_API_KEY",
        indexName: "users",
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

Or specify a custom config file:

```bash
algolia-codegen --config path/to/config.ts
# or
algolia-codegen -c path/to/config.ts
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
3. **Type Generation**: The generator automatically:
   - Infers types from the sample record structure
   - Handles nested objects, arrays, and complex types
   - Detects and generates generic `IdValue<T>` types for Algolia's id-value pattern arrays
   - Generates proper TypeScript interfaces with JSDoc comments
   - Sorts types by dependencies for correct ordering
4. **Error Handling**: Continues processing other files even if one fails, with detailed error messages

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
- Automatically detects Algolia's `IdValue` pattern (arrays of objects with `id` and `value` properties) and generates generic types
- The project uses ES Modules - all local imports use `.js` extensions
- The library is compiled to both ESM and CommonJS formats for maximum compatibility

## Examples

### Generated Type Example

Given an Algolia record like:

```json
{
  "objectID": "123",
  "name": "Product Name",
  "price": 99.99,
  "tags": ["tag1", "tag2"],
  "metadata": {
    "category": "electronics",
    "rating": 4.5
  }
}
```

The generator will create TypeScript types:

```typescript
/**
 * Generated TypeScript types for Algolia index: products
 * This file is auto-generated. Do not edit manually.
 */

export interface AlgoliaHitType {
  metadata: AlgoliaMetadataType;
  name: string;
  objectID: string;
  price: number;
  tags: string[];
}

export interface AlgoliaMetadataType {
  category: string;
  rating: number;
}
```

## Repository

- **GitHub**: [https://github.com/nightlightmare/algolia-codegen](https://github.com/nightlightmare/algolia-codegen)
- **Issues**: [https://github.com/nightlightmare/algolia-codegen/issues](https://github.com/nightlightmare/algolia-codegen/issues)
- **npm**: [https://www.npmjs.com/package/algolia-codegen](https://www.npmjs.com/package/algolia-codegen)

## License

MIT
