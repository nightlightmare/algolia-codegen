import { describe, it, expect } from 'vitest';
import { validateConfig } from './config.js';
import type { AlgoliaCodegenConfig } from '../../types.js';

describe('validateConfig', () => {
  it('should validate a valid config object', () => {
    const validConfig: AlgoliaCodegenConfig = {
      overwrite: true,
      generates: {
        'src/types/algolia.ts': {
          appId: 'test-app-id',
          searchKey: 'test-search-key',
          indexName: 'test-index',
        },
      },
    };

    expect(() => validateConfig(validConfig, 'test-path')).not.toThrow();
  });

  it('should validate a valid config with array generates', () => {
    const validConfig: AlgoliaCodegenConfig = {
      overwrite: false,
      generates: [
        {
          'src/types/algolia.ts': {
            appId: 'test-app-id',
            searchKey: 'test-search-key',
            indexName: 'test-index',
          },
        },
        {
          'src/types/other.ts': {
            appId: 'test-app-id-2',
            searchKey: 'test-search-key-2',
            indexName: 'test-index-2',
          },
        },
      ],
    };

    expect(() => validateConfig(validConfig, 'test-path')).not.toThrow();
  });

  it('should throw error if config is not an object', () => {
    expect(() => validateConfig(null, 'test-path')).toThrow(
      'Invalid config: must be an object'
    );
    expect(() => validateConfig(undefined, 'test-path')).toThrow(
      'Invalid config: must be an object'
    );
    expect(() => validateConfig('string', 'test-path')).toThrow(
      'Invalid config: must be an object'
    );
    expect(() => validateConfig([], 'test-path')).toThrow(
      'Invalid config: must be an object'
    );
  });

  it('should throw error if overwrite is missing', () => {
    const invalidConfig = {
      generates: {
        'src/types/algolia.ts': {
          appId: 'test-app-id',
          searchKey: 'test-search-key',
          indexName: 'test-index',
        },
      },
    };

    expect(() => validateConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid config: missing required property 'overwrite'"
    );
  });

  it('should throw error if overwrite is not a boolean', () => {
    const invalidConfig = {
      overwrite: 'true',
      generates: {
        'src/types/algolia.ts': {
          appId: 'test-app-id',
          searchKey: 'test-search-key',
          indexName: 'test-index',
        },
      },
    };

    expect(() => validateConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid config: 'overwrite' must be a boolean"
    );
  });

  it('should throw error if generates is missing', () => {
    const invalidConfig = {
      overwrite: true,
    };

    expect(() => validateConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid config: missing required property 'generates'"
    );
  });

  it('should throw error if generates is not an object or array', () => {
    const invalidConfig = {
      overwrite: true,
      generates: 'invalid',
    };

    expect(() => validateConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid config: 'generates' must be an object or an array of objects"
    );
  });

  it('should throw error if generates array contains invalid items', () => {
    const invalidConfig = {
      overwrite: true,
      generates: [
        {
          'src/types/algolia.ts': {
            appId: 'test-app-id',
            searchKey: 'test-search-key',
            indexName: 'test-index',
          },
        },
        'invalid',
      ],
    };

    expect(() => validateConfig(invalidConfig, 'test-path')).toThrow();
  });
});

