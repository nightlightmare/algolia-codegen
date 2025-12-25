import algoliasearch from 'algoliasearch';
import type { AlgoliaCodegenGeneratorConfig } from '../types.js';

/**
 * Fetches data from Algolia for a given generator config
 * Based on main() function from generate-types.ts
 */
export async function fetchAlgoliaData(
  filePath: string,
  generatorConfig: AlgoliaCodegenGeneratorConfig
): Promise<void> {
  console.log(`\nProcessing file: ${filePath}`);
  console.log(`Connecting to Algolia...`);

  const client = algoliasearch(
    generatorConfig.appId,
    generatorConfig.searchKey,
  );

  console.log(`Fetching sample record from index: ${generatorConfig.indexName}`);

  // Fetch a sample record
  const results = await client.search([
    {
      indexName: generatorConfig.indexName,
      query: '',
      params: {
        hitsPerPage: 1,
      },
    },
  ]);

  if (!results.results || results.results.length === 0) {
    throw new Error(`No results found in Algolia index: ${generatorConfig.indexName}`);
  }

  const result = results.results[0];
  // Check if result is SearchResponse (has hits property)
  if (!('hits' in result) || !result.hits || result.hits.length === 0) {
    throw new Error(`No hits found in Algolia index: ${generatorConfig.indexName}`);
  }

  const sampleHit = result.hits[0] as Record<string, unknown>;
  console.log('Sample record fetched successfully');
  console.log(`ObjectID: ${sampleHit.objectID || 'N/A'}`);
}

