# Next.js Example with Algolia Codegen

This example demonstrates how to integrate `algolia-codegen` with a Next.js application.

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

The generated types are available in `src/types/algolia.ts` and can be imported throughout your Next.js application:

```typescript
import type { AlgoliaHitType } from '@/types/algolia';
```

## Integration with Next.js

### Pre-build Type Generation

Add the codegen step to your build process:

```json
{
  "scripts": {
    "prebuild": "pnpm codegen",
    "build": "next build"
  }
}
```

### Watch Mode

For development, you can run codegen and Next.js together:

```bash
pnpm codegen:watch
```

## Type Safety

The generated types ensure type safety when working with Algolia search results:

```typescript
const hits: AlgoliaHitType[] = results[0].hits;
// TypeScript will autocomplete and validate all fields
```

