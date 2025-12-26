import type { AlgoliaCodegenConfig } from 'algolia-codegen';

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    // Example 1: Custom prefix only
    'src/types/products.ts': {
      appId: process.env.ALGOLIA_APP_ID!,
      searchKey: process.env.ALGOLIA_SEARCH_KEY!,
      indexName: 'products',
      prefix: 'Product', // Types will be: ProductHitType, ProductMetadataType, etc.
    },
    
    // Example 2: Custom postfix only
    'src/types/users.ts': {
      appId: process.env.ALGOLIA_APP_ID!,
      searchKey: process.env.ALGOLIA_SEARCH_KEY!,
      indexName: 'users',
      postfix: 'Record', // Types will be: AlgoliaHitRecord, AlgoliaUserRecord, etc.
    },
    
    // Example 3: Both prefix and postfix
    'src/types/articles.ts': {
      appId: process.env.ALGOLIA_APP_ID!,
      searchKey: process.env.ALGOLIA_SEARCH_KEY!,
      indexName: 'articles',
      prefix: 'Article',
      postfix: 'Type', // Types will be: ArticleHitType, ArticleAuthorType, etc.
    },
    
    // Example 4: No prefix or postfix (default behavior)
    'src/types/default.ts': {
      appId: process.env.ALGOLIA_APP_ID!,
      searchKey: process.env.ALGOLIA_SEARCH_KEY!,
      indexName: 'default_index',
      // Types will be: AlgoliaHitType, AlgoliaMetadataType, etc. (default)
    },
    
    // Example 5: Domain-specific naming
    'src/types/ecommerce.ts': {
      appId: process.env.ALGOLIA_APP_ID!,
      searchKey: process.env.ALGOLIA_SEARCH_KEY!,
      indexName: 'ecommerce',
      prefix: 'Ecommerce',
      postfix: 'Model', // Types will be: EcommerceHitModel, EcommerceProductModel, etc.
    },
  },
};

export default config;

