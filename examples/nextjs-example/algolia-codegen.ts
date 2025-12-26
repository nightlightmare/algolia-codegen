import type { AlgoliaCodegenConfig } from 'algolia-codegen';

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/types/algolia.ts': {
      appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      searchKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!,
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
      prefix: 'Algolia',
      postfix: 'Type',
    },
  },
};

export default config;

