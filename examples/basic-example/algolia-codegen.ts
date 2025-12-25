const { APP_ID, SEARCH_KEY, INDEX_NAME } = process.env

const config = {
  overwrite: true,
  generates: {
    "src/types/algolia.ts": {
      appId: APP_ID,
      searchKey: SEARCH_KEY,
      indexName: INDEX_NAME,
    },
  },
};

export default config;

