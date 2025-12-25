# Algolia Type Generator

This script automatically generates TypeScript types from your Algolia index by fetching a sample record and analyzing its structure.

## Prerequisites

Make sure you have the following environment variables set in your `.env` file (located in `packages/app/.env`):

- `NEXT_PUBLIC_ALGOLIA_APP_ID` - Your Algolia Application ID
- `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` - Your Algolia Search API Key
- `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` - Your Algolia Index Name

The script will automatically check for `.env`, `.env.local`, and `.env.development.local` files in the `packages/app/` directory.

## Installation

First, install the required dependencies:

```bash
pnpm install
```

This will install `tsx` and `dotenv` as dev dependencies if they're not already installed.

## Usage

Run the type generation script:

```bash
pnpm algolia:generate-types
```

Or from the root of the monorepo:

```bash
pnpm --filter "app" algolia:generate-types
```

## How It Works

1. **Connects to Algolia**: Uses your configured Algolia credentials to connect to your index
2. **Fetches Sample Record**: Retrieves one record from your Algolia index
3. **Analyzes Structure**: Recursively analyzes the JSON structure to infer TypeScript types
4. **Generates Types**: Creates TypeScript interface files in `src/features/Algolia/types/`
5. **Handles Special Cases**:
   - Detects `AlgoliaIdValue` patterns (objects with `id` and `value` properties)
   - Handles nested objects and arrays
   - Preserves optional fields (null/undefined values)
   - Generates proper imports between types

## Generated Files

The script generates TypeScript interface files in:
- `packages/app/src/features/Algolia/types/`

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

