import { describe, it, expect } from 'vitest';
import { generateTypeScriptTypes } from './generate-typescript-types.js';
import type { AlgoliaCodegenGeneratorConfig } from '../types.js';

describe('generateTypeScriptTypes', () => {
  const baseConfig: AlgoliaCodegenGeneratorConfig = {
    appId: 'test-app-id',
    searchKey: 'test-search-key',
    indexName: 'test-index',
  };

  it('should generate types for simple object', () => {
    const sampleHit = {
      objectID: '123',
      title: 'Test Title',
      description: 'Test Description',
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('export interface');
    expect(result).toContain('objectID');
    expect(result).toContain('title');
    expect(result).toContain('description');
    expect(result).toContain('string');
    expect(result).toContain('test-index');
  });

  it('should generate types with prefix and postfix', () => {
    const sampleHit = {
      objectID: '123',
      name: 'Test',
    };

    const config: AlgoliaCodegenGeneratorConfig = {
      ...baseConfig,
      prefix: 'Algolia',
      postfix: 'Type',
    };

    const result = generateTypeScriptTypes(sampleHit, config);

    expect(result).toContain('AlgoliaHitType');
    expect(result).toContain('Algolia');
    expect(result).toContain('Type');
  });

  it('should handle nested objects', () => {
    const sampleHit = {
      objectID: '123',
      user: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('user');
    expect(result).toContain('id');
    expect(result).toContain('name');
    expect(result).toContain('email');
  });

  it('should handle arrays of primitives', () => {
    const sampleHit = {
      objectID: '123',
      tags: ['tag1', 'tag2', 'tag3'],
      numbers: [1, 2, 3],
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('tags');
    expect(result).toContain('string[]');
    expect(result).toContain('numbers');
    expect(result).toContain('number[]');
  });

  it('should handle arrays of objects', () => {
    const sampleHit = {
      objectID: '123',
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('items');
    expect(result).toContain('[]');
  });

  it('should handle AlgoliaIdValue pattern', () => {
    const sampleHit = {
      objectID: '123',
      categories: [
        { id: 'cat1', value: 'Category 1' },
        { id: 'cat2', value: 'Category 2' },
      ],
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('IdValue');
    expect(result).toContain('categories');
    expect(result).toContain('id: string');
    expect(result).toContain('value:');
  });

  it('should handle AlgoliaIdValue with non-string values', () => {
    const sampleHit = {
      objectID: '123',
      metadata: [
        { id: 'meta1', value: 123 },
        { id: 'meta2', value: 456 },
      ],
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('IdValue');
    expect(result).toContain('metadata');
  });

  it('should handle null and undefined values', () => {
    const sampleHit = {
      objectID: '123',
      optionalField: null,
      undefinedField: undefined,
      nullableString: null as string | null,
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('optionalField');
    expect(result).toContain('undefinedField');
    expect(result).toContain('nullableString');
  });

  it('should handle boolean values', () => {
    const sampleHit = {
      objectID: '123',
      isActive: true,
      isPublished: false,
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('isActive');
    expect(result).toContain('isPublished');
    expect(result).toContain('boolean');
  });

  it('should handle number values', () => {
    const sampleHit = {
      objectID: '123',
      price: 99.99,
      quantity: 10,
      rating: 4.5,
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('price');
    expect(result).toContain('quantity');
    expect(result).toContain('rating');
    expect(result).toContain('number');
  });

  it('should handle empty arrays', () => {
    const sampleHit = {
      objectID: '123',
      emptyArray: [],
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('emptyArray');
    expect(result).toContain('unknown[]');
  });

  it('should handle mixed type arrays', () => {
    const sampleHit = {
      objectID: '123',
      mixedArray: ['string', 123, true],
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('mixedArray');
    expect(result).toContain('[]');
  });

  it('should handle deeply nested objects', () => {
    const sampleHit = {
      objectID: '123',
      level1: {
        level2: {
          level3: {
            value: 'deep value',
          },
        },
      },
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('level1');
    expect(result).toContain('level2');
    expect(result).toContain('level3');
    expect(result).toContain('value');
  });

  it('should generate proper TypeScript syntax', () => {
    const sampleHit = {
      objectID: '123',
      name: 'Test',
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    // Check for proper TypeScript interface syntax
    expect(result).toMatch(/export interface \w+/);
    expect(result).toContain('{');
    expect(result).toContain('}');
    expect(result).toContain(':');
    expect(result).toContain(';');
  });

  it('should include JSDoc comments', () => {
    const sampleHit = {
      objectID: '123',
      name: 'Test',
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('/**');
    expect(result).toContain('*/');
  });

  it('should include file header with index name', () => {
    const sampleHit = {
      objectID: '123',
      name: 'Test',
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('test-index');
    expect(result).toContain('auto-generated');
  });

  it('should handle complex real-world example', () => {
    const sampleHit = {
      objectID: 'product-123',
      title: 'Test Product',
      description: 'A test product description',
      price: 29.99,
      inStock: true,
      tags: ['electronics', 'gadgets'],
      images: [
        { id: 'img1', value: 'https://example.com/img1.jpg' },
        { id: 'img2', value: 'https://example.com/img2.jpg' },
      ],
      metadata: {
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        author: {
          id: 'author-1',
          name: 'John Doe',
        },
      },
      reviews: [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Great product!',
        },
      ],
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    expect(result).toContain('objectID');
    expect(result).toContain('title');
    expect(result).toContain('price');
    expect(result).toContain('inStock');
    expect(result).toContain('tags');
    expect(result).toContain('images');
    expect(result).toContain('metadata');
    expect(result).toContain('reviews');
    expect(result).toContain('IdValue');
  });

  it('should sort interface properties alphabetically', () => {
    const sampleHit = {
      zebra: 'z',
      apple: 'a',
      banana: 'b',
    };

    const result = generateTypeScriptTypes(sampleHit, baseConfig);

    const appleIndex = result.indexOf('apple');
    const bananaIndex = result.indexOf('banana');
    const zebraIndex = result.indexOf('zebra');

    expect(appleIndex).toBeLessThan(bananaIndex);
    expect(bananaIndex).toBeLessThan(zebraIndex);
  });
});
