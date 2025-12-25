import type { AlgoliaCodegenConfig } from '../../src/index.js';

const indexName = process.env.INDEX_NAME;
const appId = process.env.APP_ID;
const searchKey = process.env.SEARCH_KEY;

if (!indexName || !appId || !searchKey) {
  throw new Error('Missing required environment variables');
}

const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/algolia/types.ts': {
      appId,
      indexName,
      searchKey
    },
  },
};

export default config;