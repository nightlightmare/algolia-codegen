import type { AlgoliaCodegenConfig } from 'algolia-codegen';

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/types/algolia.ts': {
      appId: import.meta.env.VITE_ALGOLIA_APP_ID,
      searchKey: import.meta.env.VITE_ALGOLIA_SEARCH_KEY,
      indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME,
      prefix: 'Algolia',
      postfix: 'Type',
    },
  },
};

export default config;

