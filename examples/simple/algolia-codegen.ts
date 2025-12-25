import type { AlgoliaCodegenConfig } from '../../src/index.js';

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/algolia/types.ts': {
      appId: 'YOUR_APP_ID',
      searchKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'products',
      prefix: 'Algolia',
      postfix: 'Type'
    },
  },
};

export default config;