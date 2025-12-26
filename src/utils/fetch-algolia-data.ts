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
          const itemKey =
            typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item);

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

  // Validate credentials before attempting connection
  if (!generatorConfig.appId || generatorConfig.appId.trim() === '') {
    throw new Error(
      `Invalid configuration: appId is required and cannot be empty\n` +
        `Please check your configuration file and ensure appId is set correctly.`
    );
  }

  if (!generatorConfig.searchKey || generatorConfig.searchKey.trim() === '') {
    throw new Error(
      `Invalid configuration: searchKey is required and cannot be empty\n` +
        `Please check your configuration file and ensure searchKey is set correctly.`
    );
  }

  // Initialize Algolia client
  const connectSpinner = logger.spinner('Connecting to Algolia...');
  connectSpinner.start();

  let client;
  try {
    logger.verbose(`App ID: ${generatorConfig.appId}`);
    logger.verbose(`Index: ${generatorConfig.indexName}`);
    
    // Prepare client options
    const clientOptions: {
      hosts?: Array<{
        url: string;
        accept: 'read' | 'write' | 'readWrite';
        protocol: 'https' | 'http';
        port?: number;
      }>;
    } = {};

    // Add custom hosts if provided
    if (generatorConfig.hosts && generatorConfig.hosts.length > 0) {
      clientOptions.hosts = generatorConfig.hosts;
      logger.verbose(`Using ${generatorConfig.hosts.length} custom host(s)`);
      generatorConfig.hosts.forEach((host, index) => {
        logger.verbose(
          `  Host ${index + 1}: ${host.protocol}://${host.url}${host.port ? `:${host.port}` : ''} (${host.accept})`
        );
      });
    }

    // Note: We don't pass timeouts to client options as they seem to cause issues
    // Instead, we use Promise.race with a timeout wrapper for request-level timeout control
    const requestTimeout = generatorConfig.timeout?.request ?? 30000;
    logger.verbose(`Request timeout will be enforced via Promise.race: ${requestTimeout}ms`);

    client = algoliasearch(generatorConfig.appId, generatorConfig.searchKey, clientOptions);
    connectSpinner.succeed('Connected to Algolia');
  } catch (error) {
    connectSpinner.fail('Failed to connect to Algolia');
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide helpful troubleshooting information
    let troubleshootingTips = '';
    if (errorMessage.includes('Unreachable hosts') || errorMessage.includes('unreachable')) {
      troubleshootingTips =
        '\n\nTroubleshooting tips:\n' +
        '1. Verify your Application ID is correct in your Algolia dashboard\n' +
        '2. Check your network connection and firewall settings\n' +
        '3. If you\'re behind a proxy, configure custom hosts in your config:\n' +
        '   hosts: [{ url: "your-proxy.example.com", accept: "readWrite", protocol: "https" }]\n' +
        '4. Visit https://alg.li/support-unreachable-hosts for more help\n' +
        '5. Contact Algolia Support: https://alg.li/support';
    } else if (errorMessage.includes('Invalid Application-ID') || errorMessage.includes('application id')) {
      troubleshootingTips =
        '\n\nTroubleshooting tips:\n' +
        '1. Verify your Application ID is correct in your Algolia dashboard\n' +
        '2. Ensure there are no extra spaces or characters in your appId\n' +
        '3. Check that your Application ID matches the one in your Algolia account';
    } else if (errorMessage.includes('Invalid API key') || errorMessage.includes('api key')) {
      troubleshootingTips =
        '\n\nTroubleshooting tips:\n' +
        '1. Verify your Search API Key is correct\n' +
        '2. Ensure you\'re using a Search API Key (not Admin API Key) for read operations\n' +
        '3. Check that your API key has not expired or been revoked\n' +
        '4. Verify the API key has the necessary permissions for the index';
    }

    throw new Error(
      `Failed to initialize Algolia client: ${errorMessage}${troubleshootingTips}`
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
    logger.verbose(`Making search request`);

    // Make the search request directly - Algolia client has built-in timeouts
    // If custom timeout is needed, wrap with Promise.race
    // Note: Using hitsPerPage=1 to avoid timeout issues that occur with larger requests
    // The type inference logic will still work well with a single record
    const hitsPerPage = 1; // Use 1 to ensure reliable connection
    logger.verbose(`Search params: query='', hitsPerPage=${hitsPerPage}`);
    
    const searchPromise = client.search([
      {
        indexName: generatorConfig.indexName,
        params: {
          query: '',
          hitsPerPage: hitsPerPage,
        },
      },
    ]);
    
    logger.verbose('Search request initiated, waiting for response...');

    // Always use Promise.race with timeout as a safety net
    // Default timeout is 30 seconds, can be overridden in config
    const requestTimeout = generatorConfig.timeout?.request ?? 30000;
    logger.verbose(`Using timeout wrapper: ${requestTimeout}ms`);
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${requestTimeout}ms - this may indicate network issues or incorrect Application ID`));
      }, requestTimeout);
    });

    results = await Promise.race([searchPromise, timeoutPromise]);
    
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

    // Provide helpful troubleshooting information
    let troubleshootingTips = '';
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      const requestTimeout = generatorConfig.timeout?.request ?? 30000;
      troubleshootingTips =
        '\n\nTroubleshooting tips:\n' +
        `1. Request timed out after ${requestTimeout}ms - this may indicate network issues\n` +
        '2. Check your network connection and firewall settings\n' +
        '3. If you\'re behind a proxy, configure custom hosts in your config:\n' +
        '   hosts: [{ url: "your-proxy.example.com", accept: "readWrite", protocol: "https" }]\n' +
        '4. Try increasing the timeout in your config:\n' +
        `   timeout: { request: ${requestTimeout * 2} } // Double the timeout\n` +
        '5. Verify your Application ID and API key are correct\n' +
        '6. Visit https://alg.li/support-unreachable-hosts for more help';
    } else if (errorMessage.includes('Unreachable hosts') || errorMessage.includes('unreachable')) {
      troubleshootingTips =
        '\n\nTroubleshooting tips:\n' +
        '1. Verify your Application ID is correct in your Algolia dashboard\n' +
        '2. Check your network connection and firewall settings\n' +
        '3. If you\'re behind a proxy, configure custom hosts in your config:\n' +
        '   hosts: [{ url: "your-proxy.example.com", accept: "readWrite", protocol: "https" }]\n' +
        '4. Visit https://alg.li/support-unreachable-hosts for more help\n' +
        '5. Contact Algolia Support: https://alg.li/support';
    } else if (errorMessage.includes('Index does not exist') || errorMessage.includes('IndexNotFound')) {
      troubleshootingTips =
        '\n\nTroubleshooting tips:\n' +
        `1. Verify the index name "${generatorConfig.indexName}" exists in your Algolia application\n` +
        '2. Check that the index name is spelled correctly (case-sensitive)\n' +
        '3. Ensure your API key has read permissions for this index';
    } else if (errorMessage.includes('Invalid API key') || errorMessage.includes('api key')) {
      troubleshootingTips =
        '\n\nTroubleshooting tips:\n' +
        '1. Verify your Search API Key is correct\n' +
        '2. Ensure you\'re using a Search API Key (not Admin API Key) for read operations\n' +
        '3. Check that your API key has not expired or been revoked\n' +
        `4. Verify the API key has read permissions for index "${generatorConfig.indexName}"`;
    }

    throw new Error(
      `Failed to fetch data from Algolia index "${generatorConfig.indexName}" (App ID: ${generatorConfig.appId}): ${errorMessage}${troubleshootingTips}`
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
    logger.verbose(
      `Found ${Object.keys(metadata).length} fields with known values for Enum generation`
    );
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
