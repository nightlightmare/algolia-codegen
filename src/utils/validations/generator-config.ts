import type { AlgoliaCodegenGeneratorConfig } from '../../types.js';

/**
 * Validates AlgoliaCodegenGeneratorConfig
 */
export function validateGeneratorConfig(
  config: unknown,
  path: string
): asserts config is AlgoliaCodegenGeneratorConfig {
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error(
      `Invalid generator config: must be an object\n` +
      `Path: ${path}`
    );
  }

  const cfg = config as Record<string, unknown>;

  // Validate required fields
  const requiredFields: Array<keyof AlgoliaCodegenGeneratorConfig> = [
    'appId',
    'searchKey',
    'indexName',
  ];

  for (const field of requiredFields) {
    if (!(field in cfg)) {
      throw new Error(
        `Invalid generator config: missing required property '${field}'\n` +
        `Path: ${path}`
      );
    }
    if (typeof cfg[field] !== 'string') {
      throw new Error(
        `Invalid generator config: '${field}' must be a string\n` +
        `Path: ${path}\n` +
        `Received: ${typeof cfg[field]}`
      );
    }
  }

  // Validate optional fields
  if ('prefix' in cfg && cfg.prefix !== undefined && typeof cfg.prefix !== 'string') {
    throw new Error(
      `Invalid generator config: 'prefix' must be a string or undefined\n` +
      `Path: ${path}\n` +
      `Received: ${typeof cfg.prefix}`
    );
  }

  if ('postfix' in cfg && cfg.postfix !== undefined && typeof cfg.postfix !== 'string') {
    throw new Error(
      `Invalid generator config: 'postfix' must be a string or undefined\n` +
      `Path: ${path}\n` +
      `Received: ${typeof cfg.postfix}`
    );
  }
}

