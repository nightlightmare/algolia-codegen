import { describe, it, expect } from 'vitest';
import { validateUrlSchema } from './url-schema.js';
import type { UrlSchema } from '../../types.js';

describe('validateUrlSchema', () => {
  it('should validate a valid url schema', () => {
    const validSchema: UrlSchema = {
      'src/types/algolia.ts': {
        appId: 'test-app-id',
        searchKey: 'test-search-key',
        indexName: 'test-index',
      },
    };

    expect(() => validateUrlSchema(validSchema, 'test-path')).not.toThrow();
  });

  it('should validate a url schema with multiple entries', () => {
    const validSchema: UrlSchema = {
      'src/types/algolia.ts': {
        appId: 'test-app-id',
        searchKey: 'test-search-key',
        indexName: 'test-index',
      },
      'src/types/other.ts': {
        appId: 'test-app-id-2',
        searchKey: 'test-search-key-2',
        indexName: 'test-index-2',
        prefix: 'Test',
        postfix: 'Type',
      },
    };

    expect(() => validateUrlSchema(validSchema, 'test-path')).not.toThrow();
  });

  it('should throw error if schema is not an object', () => {
    expect(() => validateUrlSchema(null, 'test-path')).toThrow(
      'Invalid generates entry: must be an object'
    );
    expect(() => validateUrlSchema(undefined, 'test-path')).toThrow(
      'Invalid generates entry: must be an object'
    );
    expect(() => validateUrlSchema('string', 'test-path')).toThrow(
      'Invalid generates entry: must be an object'
    );
    expect(() => validateUrlSchema([], 'test-path')).toThrow(
      'Invalid generates entry: must be an object'
    );
  });

  it('should handle numeric keys (converted to strings)', () => {
    // In JavaScript, object keys are always strings, so numeric keys are converted
    const schemaWithNumericKey = {
      123: {
        appId: 'test-app-id',
        searchKey: 'test-search-key',
        indexName: 'test-index',
      },
    };

    // This should not throw because '123' is a valid string key
    expect(() => validateUrlSchema(schemaWithNumericKey, 'test-path')).not.toThrow();
  });

  it('should throw error if generator config is invalid', () => {
    const invalidSchema = {
      'src/types/algolia.ts': {
        appId: 'test-app-id',
        // missing searchKey and indexName
      },
    };

    expect(() => validateUrlSchema(invalidSchema, 'test-path')).toThrow();
  });

  it('should validate empty schema object', () => {
    const emptySchema: UrlSchema = {};

    expect(() => validateUrlSchema(emptySchema, 'test-path')).not.toThrow();
  });
});

