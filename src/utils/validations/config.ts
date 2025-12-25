import type { AlgoliaCodegenConfig, UrlSchema } from '../../types.js';
import { validateUrlSchema } from './url-schema.js';

/**
 * Validates the structure of AlgoliaCodegenConfig
 */
export function validateConfig(
  config: unknown,
  configPath: string
): asserts config is AlgoliaCodegenConfig {
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error(
      `Invalid config: must be an object\n` +
      `Config file: ${configPath}`
    );
  }

  const cfg = config as Record<string, unknown>;

  // Validate overwrite
  if (!('overwrite' in cfg)) {
    throw new Error(
      `Invalid config: missing required property 'overwrite'\n` +
      `Config file: ${configPath}`
    );
  }
  if (typeof cfg.overwrite !== 'boolean') {
    throw new Error(
      `Invalid config: 'overwrite' must be a boolean\n` +
      `Config file: ${configPath}\n` +
      `Received: ${typeof cfg.overwrite}`
    );
  }

  // Validate generates
  if (!('generates' in cfg)) {
    throw new Error(
      `Invalid config: missing required property 'generates'\n` +
      `Config file: ${configPath}`
    );
  }

  const generates = cfg.generates;

  // generates can be an object (UrlSchema) or an array of UrlSchema
  if (Array.isArray(generates)) {
    // Validate array of UrlSchema
    generates.forEach((item, index) => {
      validateUrlSchema(item, `${configPath}[generates][${index}]`);
    });
  } else if (typeof generates === 'object' && generates !== null) {
    // Validate single UrlSchema object
    validateUrlSchema(generates, `${configPath}[generates]`);
  } else {
    throw new Error(
      `Invalid config: 'generates' must be an object or an array of objects\n` +
      `Config file: ${configPath}\n` +
      `Received: ${typeof generates}`
    );
  }
}

