# React Example with Algolia Codegen

This example demonstrates how to integrate `algolia-codegen` with a React application using Vite.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and fill in your Algolia credentials:

```bash
cp .env.example .env
```

3. Generate TypeScript types from your Algolia index:

```bash
pnpm codegen
```

4. Start the development server:

```bash
pnpm dev
```

## Usage

The generated types are available in `src/types/algolia.ts` and can be imported throughout your React application:

```typescript
import type { AlgoliaHitType } from './types/algolia';
```

## Integration with React

### Automatic Type Generation

The `predev` script automatically runs codegen before starting the dev server:

```json
{
  "scripts": {
    "predev": "pnpm codegen",
    "dev": "vite"
  }
}
```

### Type Safety

The generated types ensure type safety when working with Algolia search results:

```typescript
const hits: AlgoliaHitType[] = results[0].hits;
// TypeScript will autocomplete and validate all fields
```

## Environment Variables

This example uses Vite's environment variable system. Make sure your variables are prefixed with `VITE_` to be accessible in the browser.

