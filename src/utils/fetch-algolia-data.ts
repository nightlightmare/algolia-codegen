import algoliasearch from 'algoliasearch';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import type { AlgoliaCodegenGeneratorConfig } from '../types.js';

/**
 * Fetches data from Algolia for a given generator config and generates TypeScript types
 * Based on main() function from generate-types.ts
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

/**
 * Generates TypeScript types from a sample Algolia hit
 */
function generateTypeScriptTypes(
  sampleHit: Record<string, unknown>,
  config: AlgoliaCodegenGeneratorConfig
): string {
  const prefix = config.prefix || 'Algolia';
  const postfix = config.postfix || '';
  const typeName = `${prefix}Hit${postfix}`;
  
  const lines: string[] = [];
  lines.push('/**');
  lines.push(` * Generated TypeScript types for Algolia index: ${config.indexName}`);
  lines.push(' * This file is auto-generated. Do not edit manually.');
  lines.push(' */');
  lines.push('');
  lines.push(`export interface ${typeName} {`);
  
  // Generate properties from sample hit
  const sortedKeys = Object.keys(sampleHit).sort();
  for (const key of sortedKeys) {
    const value = sampleHit[key];
    const type = inferType(value);
    const optional = value === null || value === undefined ? '?' : '';
    lines.push(`  ${key}${optional}: ${type};`);
  }
  
  lines.push('}');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Infers TypeScript type from a JavaScript value
 */
function inferType(value: unknown): string {
  if (value === null || value === undefined) {
    return 'unknown';
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'unknown[]';
    }
    const itemType = inferType(value[0]);
    return `${itemType}[]`;
  }
  
  if (typeof value === 'object') {
    // For nested objects, use Record<string, unknown> for simplicity
    // In a full implementation, this could generate nested interfaces
    return 'Record<string, unknown>';
  }
  
  return typeof value;
}

