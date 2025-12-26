import { algoliasearch } from 'algoliasearch';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import type { AlgoliaCodegenGeneratorConfig } from '../types.js';
import { generateTypeScriptTypes } from './generate-typescript-types.js';
import Logger from './logger.js';

/**
 * Fetches data from Algolia for a given generator config and generates TypeScript types
 */
export async function fetchAlgoliaData(
  filePath: string,
  generatorConfig: AlgoliaCodegenGeneratorConfig,
  overwrite: boolean,
  logger: Logger
): Promise<void> {
  logger.info(`Processing file: ${filePath}`);

  // Resolve file path relative to current working directory
  const resolvedPath = resolve(process.cwd(), filePath);
  logger.verbose(`Resolved path: ${resolvedPath}`);

  // Check if file exists and overwrite is false
  if (existsSync(resolvedPath) && !overwrite) {
    throw new Error(
      `File already exists: ${resolvedPath}\n` +
        `Set overwrite: true in config to allow overwriting existing files.`
    );
  }

  // Initialize Algolia client
  const connectSpinner = logger.spinner('Connecting to Algolia...');
  connectSpinner.start();

  let client;
  try {
    logger.verbose(`App ID: ${generatorConfig.appId}`);
    logger.verbose(`Index: ${generatorConfig.indexName}`);
    client = algoliasearch(generatorConfig.appId, generatorConfig.searchKey);
    connectSpinner.succeed('Connected to Algolia');
  } catch (error) {
    connectSpinner.fail('Failed to connect to Algolia');
    throw new Error(
      `Failed to initialize Algolia client: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Fetch a sample record
  const fetchSpinner = logger.spinner(
    `Fetching sample record from index: ${generatorConfig.indexName}`
  );
  fetchSpinner.start();

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
    fetchSpinner.succeed('Sample record fetched successfully');
  } catch (error) {
    fetchSpinner.fail('Failed to fetch data from Algolia');
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
  logger.verbose(`ObjectID: ${sampleHit.objectID || 'N/A'}`);

  // Generate TypeScript types from the sample hit
  const generateSpinner = logger.spinner('Generating TypeScript types...');
  generateSpinner.start();

  const fileContent = generateTypeScriptTypes(sampleHit, generatorConfig);
  generateSpinner.succeed('TypeScript types generated');

  // Ensure directory exists
  const dir = dirname(resolvedPath);
  if (!existsSync(dir)) {
    if (!logger.isDryRun) {
      mkdirSync(dir, { recursive: true });
      logger.verbose(`Created directory: ${dir}`);
    } else {
      logger.dryRun(`Would create directory: ${dir}`);
    }
  }

  // Write file (or simulate in dry-run mode)
  if (logger.isDryRun) {
    logger.dryRun(`Would write file: ${filePath}`);
    logger.verbose(`File content length: ${fileContent.length} characters`);
  } else {
    writeFileSync(resolvedPath, fileContent, 'utf-8');
    logger.success(`Generated file: ${filePath}`);
  }
}
