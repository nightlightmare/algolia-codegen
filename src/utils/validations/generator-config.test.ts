import { describe, it, expect } from 'vitest';
import { validateGeneratorConfig } from './generator-config.js';
import type { AlgoliaCodegenGeneratorConfig } from '../../types.js';

describe('validateGeneratorConfig', () => {
  it('should validate a valid generator config', () => {
    const validConfig: AlgoliaCodegenGeneratorConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 'test-index',
    };

    expect(() => validateGeneratorConfig(validConfig, 'test-path')).not.toThrow();
  });

  it('should validate a valid generator config with optional fields', () => {
    const validConfig: AlgoliaCodegenGeneratorConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 'test-index',
      prefix: 'Test',
      postfix: 'Type',
    };

    expect(() => validateGeneratorConfig(validConfig, 'test-path')).not.toThrow();
  });

  it('should throw error if config is not an object', () => {
    expect(() => validateGeneratorConfig(null, 'test-path')).toThrow(
      'Invalid generator config: must be an object'
    );
    expect(() => validateGeneratorConfig(undefined, 'test-path')).toThrow(
      'Invalid generator config: must be an object'
    );
    expect(() => validateGeneratorConfig('string', 'test-path')).toThrow(
      'Invalid generator config: must be an object'
    );
    expect(() => validateGeneratorConfig([], 'test-path')).toThrow(
      'Invalid generator config: must be an object'
    );
  });

  it('should throw error if appId is missing', () => {
    const invalidConfig = {
      searchKey: 'test-search-key',
      indexName: 'test-index',
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: missing required property 'appId'"
    );
  });

  it('should throw error if searchKey is missing', () => {
    const invalidConfig = {
      appId: 'test-app-id',
      indexName: 'test-index',
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: missing required property 'searchKey'"
    );
  });

  it('should throw error if indexName is missing', () => {
    const invalidConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: missing required property 'indexName'"
    );
  });

  it('should throw error if appId is not a string', () => {
    const invalidConfig = {
      appId: 123,
      searchKey: 'test-search-key',
      indexName: 'test-index',
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: 'appId' must be a string"
    );
  });

  it('should throw error if searchKey is not a string', () => {
    const invalidConfig = {
      appId: 'test-app-id',
      searchKey: 123,
      indexName: 'test-index',
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: 'searchKey' must be a string"
    );
  });

  it('should throw error if indexName is not a string', () => {
    const invalidConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 123,
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: 'indexName' must be a string"
    );
  });

  it('should throw error if prefix is not a string', () => {
    const invalidConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 'test-index',
      prefix: 123,
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: 'prefix' must be a string or undefined"
    );
  });

  it('should throw error if postfix is not a string', () => {
    const invalidConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 'test-index',
      postfix: 123,
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: 'postfix' must be a string or undefined"
    );
  });

  it('should allow undefined prefix', () => {
    const validConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 'test-index',
      prefix: undefined,
    };

    expect(() => validateGeneratorConfig(validConfig, 'test-path')).not.toThrow();
  });

  it('should allow undefined postfix', () => {
    const validConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 'test-index',
      postfix: undefined,
    };

    expect(() => validateGeneratorConfig(validConfig, 'test-path')).not.toThrow();
  });

  it('should include path in error messages', () => {
    const invalidConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      // missing indexName
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'config[generates]["file.ts"]')).toThrow(
      'Path: config[generates]["file.ts"]'
    );
  });

  it('should include received type in error messages', () => {
    const invalidConfig = {
      appId: 123,
      searchKey: 'test-search-key',
      indexName: 'test-index',
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Received: number"
    );
  });

  it('should validate empty string values for required fields', () => {
    // Empty strings are technically valid strings, though not recommended
    const configWithEmptyStrings = {
      appId: '',
      searchKey: '',
      indexName: '',
    };

    expect(() => validateGeneratorConfig(configWithEmptyStrings, 'test-path')).not.toThrow();
  });

  it('should validate empty string values for optional fields', () => {
    const configWithEmptyOptional = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 'test-index',
      prefix: '',
      postfix: '',
    };

    expect(() => validateGeneratorConfig(configWithEmptyOptional, 'test-path')).not.toThrow();
  });

  it('should throw error if prefix is null', () => {
    const invalidConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 'test-index',
      prefix: null,
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: 'prefix' must be a string or undefined"
    );
  });

  it('should throw error if postfix is null', () => {
    const invalidConfig = {
      appId: 'test-app-id',
      searchKey: 'test-search-key',
      indexName: 'test-index',
      postfix: null,
    };

    expect(() => validateGeneratorConfig(invalidConfig, 'test-path')).toThrow(
      "Invalid generator config: 'postfix' must be a string or undefined"
    );
  });
});

