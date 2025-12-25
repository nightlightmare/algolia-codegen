import { algoliasearch } from 'algoliasearch';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import type { AlgoliaCodegenGeneratorConfig } from '../types.js';
import { generateTypeScriptTypes } from './generate-typescript-types.js';

/**
 * Fetches data from Algolia for a given generator config and generates TypeScript types
 */
export async function fetchAlgoliaData(
  filePath: string,
  generatorConfig: AlgoliaCodegenGeneratorConfig,
  overwrite: boolean
): Promise<void> {
  console.log(`\nProcessing file: ${filePath}`);

  // Resolve file path relative to current working directory
  const resolvedPath = resolve(process.cwd(), filePath);

  // Check if file exists and overwrite is false
  if (existsSync(resolvedPath) && !overwrite) {
    throw new Error(
      `File already exists: ${resolvedPath}\n` +
      `Set overwrite: true in config to allow overwriting existing files.`
    );
  }

  console.log(`Connecting to Algolia...`);
  console.log(`App ID: ${generatorConfig.appId}`);

  let client;
  try {
    client = algoliasearch(
      generatorConfig.appId,
      generatorConfig.searchKey,
    );
  } catch (error) {
    throw new Error(
      `Failed to initialize Algolia client: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  console.log(`Fetching sample record from index: ${generatorConfig.indexName}`);

  // Fetch a sample record
  let results;
  try {
    results = await client.search([
      {
        indexName: generatorConfig.indexName,
        params: {
          query: '',
          hitsPerPage: 1,
        },
      },
    ]);
  } catch (error) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object') {
      // Try to extract meaningful information from Algolia error object
      const errorObj = error as Record<string, unknown>;
      if (errorObj.message) {
        errorMessage = String(errorObj.message);
      } else if (errorObj.status) {
        errorMessage = `HTTP ${errorObj.status}: ${errorObj.statusText || 'Unknown error'}`;
      } else {
        try {
          errorMessage = JSON.stringify(error, null, 2);
        } catch {
          errorMessage = String(error);
        }
      }
    } else {
      errorMessage = String(error);
    }
    throw new Error(
      `Failed to fetch data from Algolia index "${generatorConfig.indexName}" (App ID: ${generatorConfig.appId}): ${errorMessage}`
    );
  }

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

  // Generate TypeScript types from the sample hit
  const fileContent = generateTypeScriptTypes(sampleHit, generatorConfig);

  // Ensure directory exists
  const dir = dirname(resolvedPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Write file
  writeFileSync(resolvedPath, fileContent, 'utf-8');
  console.log(`Generated file: ${filePath}`);
}
