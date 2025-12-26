import type { AlgoliaCodegenConfig } from 'algolia-codegen';

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/types/algolia.ts': {
      appId: process.env.ALGOLIA_APP_ID!,
      searchKey: process.env.ALGOLIA_SEARCH_KEY!,
      indexName: process.env.ALGOLIA_INDEX_NAME!,
    },
  },
};

export default config;

