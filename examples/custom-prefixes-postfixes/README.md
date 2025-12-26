# Custom Prefixes and Postfixes Example

This example demonstrates how to use custom prefixes and postfixes to customize the naming of generated TypeScript types.

## Why Use Custom Prefixes/Postfixes?

Custom prefixes and postfixes help you:
- **Avoid naming conflicts**: When working with multiple indices or integrating with existing codebases
- **Improve code clarity**: Use domain-specific naming conventions
- **Maintain consistency**: Align with your project's naming patterns

## Configuration Examples

### Example 1: Custom Prefix Only

```typescript
{
  'src/types/products.ts': {
    appId: '...',
    searchKey: '...',
    indexName: 'products',
    prefix: 'Product', // Types: ProductHitType, ProductMetadataType
  }
}
```

### Example 2: Custom Postfix Only

```typescript
{
  'src/types/users.ts': {
    appId: '...',
    searchKey: '...',
    indexName: 'users',
    postfix: 'Record', // Types: AlgoliaHitRecord, AlgoliaUserRecord
  }
}
```

### Example 3: Both Prefix and Postfix

```typescript
{
  'src/types/articles.ts': {
    appId: '...',
    searchKey: '...',
    indexName: 'articles',
    prefix: 'Article',
    postfix: 'Type', // Types: ArticleHitType, ArticleAuthorType
  }
}
```

### Example 4: Default Behavior (No Prefix/Postfix)

```typescript
{
  'src/types/default.ts': {
    appId: '...',
    searchKey: '...',
    indexName: 'default_index',
    // Types: AlgoliaHitType, AlgoliaMetadataType (default)
  }
}
```

## Generated Type Names

The naming convention follows this pattern:

```
[prefix] + FieldName + [postfix]
```

- **Default**: `AlgoliaHitType`, `AlgoliaMetadataType`
- **With prefix**: `ProductHitType`, `ProductMetadataType`
- **With postfix**: `AlgoliaHitRecord`, `AlgoliaMetadataRecord`
- **With both**: `ArticleHitType`, `ArticleAuthorType`

## Usage

1. Copy `.env.example` to `.env` and fill in your Algolia credentials:

```bash
cp .env.example .env
```

2. Generate types:

```bash
pnpm codegen
```

3. Import and use the generated types:

```typescript
// With custom prefix
import type { ProductHitType } from './types/products';

// With custom postfix
import type { AlgoliaHitRecord } from './types/users';

// With both
import type { ArticleHitType } from './types/articles';
```

## Best Practices

1. **Consistent naming**: Use the same prefix/postfix pattern across related indices
2. **Domain-specific**: Use prefixes that reflect your domain (e.g., `Product`, `User`, `Article`)
3. **Avoid conflicts**: Use prefixes when you have multiple indices that might generate similar type names
4. **Team conventions**: Align with your team's TypeScript naming conventions

