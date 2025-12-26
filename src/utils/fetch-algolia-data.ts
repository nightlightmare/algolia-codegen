import { algoliasearch } from 'algoliasearch';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import type { AlgoliaCodegenGeneratorConfig } from '../types.js';
import { generateTypeScriptTypes } from './generate-typescript-types.js';
import Logger from './logger.js';

/**
 * Metadata about possible values for array fields
 */
interface ArrayValuesMetadata {
  [fieldPath: string]: {
    values: Set<string | number>;
    isStringArray: boolean;
  };
}

/**
 * Merges multiple Algolia hits into a single composite hit for better type inference.
 * This helps when some records have empty arrays - we can get types from records that have populated arrays.
 * Also collects metadata about all possible values for string arrays to generate Enum types.
 */
function mergeHits(
  hits: Record<string, unknown>[],
  metadata: ArrayValuesMetadata = {},
  path: string[] = []
): { merged: Record<string, unknown>; metadata: ArrayValuesMetadata } {
  if (hits.length === 0) {
    return { merged: {}, metadata };
  }
  if (hits.length === 1) {
    return { merged: hits[0], metadata };
  }

  const merged: Record<string, unknown> = {};
  const allKeys = new Set<string>();
  
  // Collect all keys from all hits
  for (const hit of hits) {
    for (const key of Object.keys(hit)) {
      allKeys.add(key);
    }
  }

  // Merge each key
  for (const key of allKeys) {
    const values = hits.map((hit) => hit[key]).filter((v) => v !== undefined);
    
    if (values.length === 0) {
      continue;
    }

    // If all values are arrays, merge them
    if (values.every((v) => Array.isArray(v))) {
      const arrays = values as unknown[][];
      // Flatten and collect unique values
      const mergedArray: unknown[] = [];
      const seen = new Set<string>();
      const stringValues = new Set<string>();
      const numberValues = new Set<number>();
      let isStringArray = false;
      let isNumberArray = false;
      
      let allStrings = true;
      let allNumbers = true;
      
      for (const arr of arrays) {
        for (const item of arr) {
          // Check if all items are strings or numbers
          if (typeof item === 'string') {
            stringValues.add(item);
            allNumbers = false;
          } else if (typeof item === 'number') {
            numberValues.add(item);
            allStrings = false;
          } else {
            allStrings = false;
            allNumbers = false;
          }
          
          // For objects, use JSON.stringify to check uniqueness
          // For primitives, use the value directly
          const itemKey = typeof item === 'object' && item !== null
            ? JSON.stringify(item)
            : String(item);
          
          if (!seen.has(itemKey)) {
            seen.add(itemKey);
            mergedArray.push(item);
          }
        }
      }
      
      // Store metadata for string/number arrays to generate Enum types
      const fieldPath = [...path, key].join('.');
      if (allStrings && stringValues.size > 0 && stringValues.size <= 100) {
        // Only create Enum for string arrays with reasonable number of values
        metadata[fieldPath] = {
          values: stringValues,
          isStringArray: true,
        };
      } else if (allNumbers && numberValues.size > 0 && numberValues.size <= 100) {
        metadata[fieldPath] = {
          values: numberValues,
          isStringArray: false,
        };
      }
      
      // If merged array has items, use it. Otherwise, try to find first non-empty array
      if (mergedArray.length > 0) {
        merged[key] = mergedArray;
      } else {
        // Find first non-empty array to preserve type information
        const firstNonEmpty = arrays.find((arr) => arr.length > 0);
        merged[key] = firstNonEmpty !== undefined ? firstNonEmpty : [];
      }
    }
    // If all values are objects, merge them recursively
    else if (values.every((v) => typeof v === 'object' && v !== null && !Array.isArray(v))) {
      const objects = values as Record<string, unknown>[];
      const result = mergeHits(objects, metadata, [...path, key]);
      merged[key] = result.merged;
      Object.assign(metadata, result.metadata);
    }
    // Otherwise, use the first non-null value
    else {
      const firstNonNull = values.find((v) => v !== null);
      merged[key] = firstNonNull !== undefined ? firstNonNull : values[0];
    }
  }

  return { merged, metadata };
}

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

  // Fetch multiple sample records to get better type inference
  // This helps when some records have empty arrays - we can get types from records that have populated arrays
  const fetchSpinner = logger.spinner(
    `Fetching sample records from index: ${generatorConfig.indexName}`
  );
  fetchSpinner.start();

  let results;
  try {
    results = await client.search([
      {
        indexName: generatorConfig.indexName,
        params: {
          query: '',
          hitsPerPage: 20, // Fetch more records to get better type inference
        },
      },
    ]);
    fetchSpinner.succeed('Sample records fetched successfully');
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

  const hits = result.hits as Record<string, unknown>[];
  logger.verbose(`Fetched ${hits.length} records`);
  logger.verbose(`ObjectIDs: ${hits.map((h) => h.objectID || 'N/A').join(', ')}`);

  // Merge multiple hits to get better type inference
  // This ensures we get proper types even if some records have empty arrays
  // Also collects metadata about all possible values for string arrays
  const { merged: mergedHit, metadata } = mergeHits(hits);
  logger.verbose('Merged records for type generation');
  if (Object.keys(metadata).length > 0) {
    logger.verbose(`Found ${Object.keys(metadata).length} fields with known values for Enum generation`);
  }

  // Generate TypeScript types from the merged hit with metadata for Enum generation
  const generateSpinner = logger.spinner('Generating TypeScript types...');
  generateSpinner.start();

  const fileContent = generateTypeScriptTypes(mergedHit, generatorConfig, metadata);
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
