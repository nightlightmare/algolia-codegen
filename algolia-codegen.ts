import type { AlgoliaCodegenConfig } from './src/types.js';

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/algolia/products.ts': {
      appId: process.env.APP_ID || 'T58W6G9J3Y',
      searchKey: process.env.SEARCH_KEY || '',
      indexName: process.env.INDEX_NAME || 'gs-ml-cb-assets-test',
      // Removed timeout to use default client behavior
    },
  },
};

export default config;

