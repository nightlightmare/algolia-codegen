import type { UrlSchema } from '../../types.js';
import { validateGeneratorConfig } from './generator-config.js';

/**
 * Validates a UrlSchema object
 */
export function validateUrlSchema(
  urlSchema: unknown,
  path: string
): asserts urlSchema is UrlSchema {
  if (typeof urlSchema !== 'object' || urlSchema === null || Array.isArray(urlSchema)) {
    throw new Error(`Invalid generates entry: must be an object\n` + `Path: ${path}`);
  }

  const schema = urlSchema as Record<string, unknown>;

  // Validate each entry in the schema
  for (const [filePath, generatorConfig] of Object.entries(schema)) {
    if (typeof filePath !== 'string') {
      throw new Error(
        `Invalid generates entry: file path must be a string\n` + `Path: ${path}[${filePath}]`
      );
    }

    validateGeneratorConfig(generatorConfig, `${path}["${filePath}"]`);
  }
}
