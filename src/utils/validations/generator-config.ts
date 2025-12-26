import type { AlgoliaCodegenGeneratorConfig } from '../../types.js';

/**
 * Validates AlgoliaCodegenGeneratorConfig
 */
export function validateGeneratorConfig(
  config: unknown,
  path: string
): asserts config is AlgoliaCodegenGeneratorConfig {
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error(`Invalid generator config: must be an object\n` + `Path: ${path}`);
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
        `Invalid generator config: missing required property '${field}'\n` + `Path: ${path}`
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

  // Validate optional hosts configuration
  if ('hosts' in cfg && cfg.hosts !== undefined) {
    if (!Array.isArray(cfg.hosts)) {
      throw new Error(
        `Invalid generator config: 'hosts' must be an array or undefined\n` +
          `Path: ${path}\n` +
          `Received: ${typeof cfg.hosts}`
      );
    }

    for (let i = 0; i < cfg.hosts.length; i++) {
      const host = cfg.hosts[i];
      if (typeof host !== 'object' || host === null || Array.isArray(host)) {
        throw new Error(
          `Invalid generator config: 'hosts[${i}]' must be an object\n` + `Path: ${path}`
        );
      }

      const hostObj = host as Record<string, unknown>;

      // Validate required host fields
      if (!('url' in hostObj) || typeof hostObj.url !== 'string') {
        throw new Error(
          `Invalid generator config: 'hosts[${i}].url' must be a string\n` + `Path: ${path}`
        );
      }

      if (
        !('accept' in hostObj) ||
        !['read', 'write', 'readWrite'].includes(hostObj.accept as string)
      ) {
        throw new Error(
          `Invalid generator config: 'hosts[${i}].accept' must be 'read', 'write', or 'readWrite'\n` +
            `Path: ${path}`
        );
      }

      if (
        !('protocol' in hostObj) ||
        !['https', 'http'].includes(hostObj.protocol as string)
      ) {
        throw new Error(
          `Invalid generator config: 'hosts[${i}].protocol' must be 'https' or 'http'\n` +
            `Path: ${path}`
        );
      }

      // Validate optional port
      if ('port' in hostObj && hostObj.port !== undefined) {
        if (typeof hostObj.port !== 'number' || hostObj.port < 1 || hostObj.port > 65535) {
          throw new Error(
            `Invalid generator config: 'hosts[${i}].port' must be a number between 1 and 65535\n` +
              `Path: ${path}`
          );
        }
      }
    }
  }

  // Validate optional timeout configuration
  if ('timeout' in cfg && cfg.timeout !== undefined) {
    if (typeof cfg.timeout !== 'object' || cfg.timeout === null || Array.isArray(cfg.timeout)) {
      throw new Error(
        `Invalid generator config: 'timeout' must be an object or undefined\n` + `Path: ${path}`
      );
    }

    const timeoutObj = cfg.timeout as Record<string, unknown>;

    if ('connect' in timeoutObj && timeoutObj.connect !== undefined) {
      if (typeof timeoutObj.connect !== 'number' || timeoutObj.connect < 1) {
        throw new Error(
          `Invalid generator config: 'timeout.connect' must be a positive number\n` +
            `Path: ${path}`
        );
      }
    }

    if ('request' in timeoutObj && timeoutObj.request !== undefined) {
      if (typeof timeoutObj.request !== 'number' || timeoutObj.request < 1) {
        throw new Error(
          `Invalid generator config: 'timeout.request' must be a positive number\n` +
            `Path: ${path}`
        );
      }
    }
  }
}
