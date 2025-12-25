import type {
  AlgoliaCodegenConfig,
  AlgoliaCodegenGeneratorConfig,
  UrlSchema,
} from '../types.js';

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

/**
 * Validates a UrlSchema object
 */
export function validateUrlSchema(
  urlSchema: unknown,
  path: string
): asserts urlSchema is UrlSchema {
  if (typeof urlSchema !== 'object' || urlSchema === null || Array.isArray(urlSchema)) {
    throw new Error(
      `Invalid generates entry: must be an object\n` +
      `Path: ${path}`
    );
  }

  const schema = urlSchema as Record<string, unknown>;

  // Validate each entry in the schema
  for (const [filePath, generatorConfig] of Object.entries(schema)) {
    if (typeof filePath !== 'string') {
      throw new Error(
        `Invalid generates entry: file path must be a string\n` +
        `Path: ${path}[${filePath}]`
      );
    }

    validateGeneratorConfig(generatorConfig, `${path}["${filePath}"]`);
  }
}

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

