import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fetchAlgoliaData } from './fetch-algolia-data.js';
import type { AlgoliaCodegenGeneratorConfig } from '../types.js';
import { algoliasearch } from 'algoliasearch';
import { generateTypeScriptTypes } from './generate-typescript-types.js';
import type Logger from './logger.js';

// Mock dependencies
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('./generate-typescript-types.js', () => ({
  generateTypeScriptTypes: vi.fn(),
}));

vi.mock('algoliasearch', () => ({
  algoliasearch: vi.fn(),
}));

describe('fetchAlgoliaData', () => {
  const baseConfig: AlgoliaCodegenGeneratorConfig = {
    appId: 'test-app-id',
    searchKey: 'test-search-key',
    indexName: 'test-index',
  };

  const mockSearchClient = {
    search: vi.fn(),
  };

  const mockSampleHit = {
    objectID: 'test-123',
    title: 'Test Title',
    description: 'Test Description',
  };

  const mockSearchResponse = {
    results: [
      {
        hits: [mockSampleHit],
      },
    ],
  };

  const mockSpinner = {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
  };

  const mockLogger: Logger = {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    verbose: vi.fn(),
    dryRun: vi.fn(),
    spinner: vi.fn(() => mockSpinner),
    fileOperation: vi.fn(),
    formatError: vi.fn((error: unknown) => {
      if (error instanceof Error) return error.message;
      return String(error);
    }),
    get isVerbose(): boolean {
      return false;
    },
    get isDryRun(): boolean {
      return false;
    },
  } as unknown as Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue('/test/working/dir');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(algoliasearch).mockReturnValue(mockSearchClient as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error if file exists and overwrite is false', async () => {
    const filePath = 'src/types/algolia.ts';
    const resolvedPath = resolve('/test/working/dir', filePath);

    vi.mocked(existsSync).mockImplementation((path) => {
      return String(path) === resolvedPath;
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      `File already exists: ${resolvedPath}`
    );

    expect(existsSync).toHaveBeenCalledWith(resolvedPath);
  });

  it('should proceed if file exists and overwrite is true', async () => {
    const filePath = 'src/types/algolia.ts';
    const resolvedPath = resolve('/test/working/dir', filePath);

    vi.mocked(existsSync).mockImplementation((path) => {
      const pathStr = String(path);
      return pathStr === resolvedPath || pathStr === dirname(resolvedPath);
    });
    vi.mocked(mockSearchClient.search).mockResolvedValue(mockSearchResponse);
    vi.mocked(generateTypeScriptTypes).mockReturnValue('export interface Test {}');

    await fetchAlgoliaData(filePath, baseConfig, true, mockLogger);

    expect(existsSync).toHaveBeenCalledWith(resolvedPath);
    expect(mockSearchClient.search).toHaveBeenCalled();
  });

  it('should throw error if Algolia client initialization fails', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(algoliasearch).mockImplementation(() => {
      throw new Error('Invalid API key');
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'Failed to initialize Algolia client: Invalid API key'
    );
  });

  it('should throw error if Algolia client initialization fails with non-Error', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(algoliasearch).mockImplementation(() => {
      throw 'String error';
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'Failed to initialize Algolia client: String error'
    );
  });

  it('should throw error if Algolia search fails with Error instance', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockRejectedValue(new Error('Network error'));

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'Failed to fetch data from Algolia index "test-index" (App ID: test-app-id): Network error'
    );
  });

  it('should throw error if Algolia search fails with object containing message', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockRejectedValue({
      message: 'Invalid index name',
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'Failed to fetch data from Algolia index "test-index" (App ID: test-app-id): Invalid index name'
    );
  });

  it('should throw error if Algolia search fails with object containing status', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockRejectedValue({
      status: 404,
      statusText: 'Not Found',
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'Failed to fetch data from Algolia index "test-index" (App ID: test-app-id): HTTP 404: Not Found'
    );
  });

  it('should throw error if Algolia search fails with object containing status but no statusText', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockRejectedValue({
      status: 500,
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'Failed to fetch data from Algolia index "test-index" (App ID: test-app-id): HTTP 500: Unknown error'
    );
  });

  it('should throw error if Algolia search fails with unknown error object', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockRejectedValue({
      code: 'ERR_UNKNOWN',
      data: { nested: 'value' },
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'Failed to fetch data from Algolia index "test-index"'
    );
  });

  it('should handle error when JSON.stringify fails', async () => {
    const filePath = 'src/types/algolia.ts';
    const circularError: Record<string, unknown> = {
      code: 'ERR_UNKNOWN',
    };
    circularError.self = circularError; // Create circular reference that JSON.stringify can't handle

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockRejectedValue(circularError);

    // Mock JSON.stringify to throw an error (simulating circular reference)
    const originalStringify = JSON.stringify;
    vi.spyOn(JSON, 'stringify').mockImplementation(() => {
      throw new Error('Circular reference');
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'Failed to fetch data from Algolia index "test-index"'
    );

    // Restore original
    JSON.stringify = originalStringify;
  });

  it('should throw error if Algolia search fails with string error', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockRejectedValue('String error');

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'Failed to fetch data from Algolia index "test-index" (App ID: test-app-id): String error'
    );
  });

  it('should throw error if no results returned', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockResolvedValue({
      results: [],
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'No results found in Algolia index: test-index'
    );
  });

  it('should throw error if results.results is undefined', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockResolvedValue({} as never);

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'No results found in Algolia index: test-index'
    );
  });

  it('should throw error if no hits found in results', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockResolvedValue({
      results: [{}],
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'No hits found in Algolia index: test-index'
    );
  });

  it('should throw error if hits array is empty', async () => {
    const filePath = 'src/types/algolia.ts';

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mockSearchClient.search).mockResolvedValue({
      results: [
        {
          hits: [],
        },
      ],
    });

    await expect(fetchAlgoliaData(filePath, baseConfig, false, mockLogger)).rejects.toThrow(
      'No hits found in Algolia index: test-index'
    );
  });

  it('should create directory if it does not exist', async () => {
    const filePath = 'src/types/algolia.ts';
    const resolvedPath = resolve('/test/working/dir', filePath);
    const dir = dirname(resolvedPath);

    vi.mocked(existsSync).mockImplementation((path) => {
      const pathStr = String(path);
      return pathStr === dir; // Directory exists, file doesn't
    });
    vi.mocked(mockSearchClient.search).mockResolvedValue(mockSearchResponse);
    vi.mocked(generateTypeScriptTypes).mockReturnValue('export interface Test {}');

    await fetchAlgoliaData(filePath, baseConfig, false, mockLogger);

    expect(existsSync).toHaveBeenCalledWith(dir);
    expect(mkdirSync).not.toHaveBeenCalled();
  });

  it('should create directory recursively if it does not exist', async () => {
    const filePath = 'src/types/algolia.ts';
    const resolvedPath = resolve('/test/working/dir', filePath);
    const dir = dirname(resolvedPath);

    vi.mocked(existsSync).mockImplementation((path) => {
      const pathStr = String(path);
      if (pathStr === resolvedPath) return false; // File doesn't exist
      if (pathStr === dir) return false; // Directory doesn't exist
      return false;
    });
    vi.mocked(mockSearchClient.search).mockResolvedValue(mockSearchResponse);
    vi.mocked(generateTypeScriptTypes).mockReturnValue('export interface Test {}');

    await fetchAlgoliaData(filePath, baseConfig, false, mockLogger);

    expect(existsSync).toHaveBeenCalledWith(dir);
    expect(mkdirSync).toHaveBeenCalledWith(dir, { recursive: true });
  });

  it('should write file with generated content', async () => {
    const filePath = 'src/types/algolia.ts';
    const resolvedPath = resolve('/test/working/dir', filePath);
    const dir = dirname(resolvedPath);
    const generatedContent = 'export interface TestHit {\n  objectID: string;\n  title: string;\n}';

    vi.mocked(existsSync).mockImplementation((path) => {
      const pathStr = String(path);
      return pathStr === dir; // Directory exists
    });
    vi.mocked(mockSearchClient.search).mockResolvedValue(mockSearchResponse);
    vi.mocked(generateTypeScriptTypes).mockReturnValue(generatedContent);

    await fetchAlgoliaData(filePath, baseConfig, false, mockLogger);

    expect(generateTypeScriptTypes).toHaveBeenCalledWith(mockSampleHit, baseConfig, {});
    expect(writeFileSync).toHaveBeenCalledWith(resolvedPath, generatedContent, 'utf-8');
  });

  it('should call Algolia search with correct parameters', async () => {
    const filePath = 'src/types/algolia.ts';
    const dir = dirname(resolve('/test/working/dir', filePath));

    vi.mocked(existsSync).mockImplementation((path) => {
      return String(path) === dir;
    });
    vi.mocked(mockSearchClient.search).mockResolvedValue(mockSearchResponse);
    vi.mocked(generateTypeScriptTypes).mockReturnValue('export interface Test {}');

    await fetchAlgoliaData(filePath, baseConfig, false, mockLogger);

    expect(mockSearchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'test-index',
        params: {
          query: '',
          hitsPerPage: 20,
        },
      },
    ]);
  });

  it('should log processing messages', async () => {
    const filePath = 'src/types/algolia.ts';
    const dir = dirname(resolve('/test/working/dir', filePath));

    vi.mocked(existsSync).mockImplementation((path) => {
      return String(path) === dir;
    });
    vi.mocked(mockSearchClient.search).mockResolvedValue(mockSearchResponse);
    vi.mocked(generateTypeScriptTypes).mockReturnValue('export interface Test {}');

    await fetchAlgoliaData(filePath, baseConfig, false, mockLogger);

    expect(mockLogger.info).toHaveBeenCalledWith(`Processing file: ${filePath}`);
    expect(mockLogger.spinner).toHaveBeenCalledWith('Connecting to Algolia...');
    expect(mockLogger.verbose).toHaveBeenCalledWith(`App ID: ${baseConfig.appId}`);
    expect(mockLogger.spinner).toHaveBeenCalledWith(
      `Fetching sample records from index: ${baseConfig.indexName}`
    );
    expect(mockLogger.verbose).toHaveBeenCalledWith(`Fetched 1 records`);
    expect(mockLogger.verbose).toHaveBeenCalledWith(`ObjectIDs: ${mockSampleHit.objectID}`);
    expect(mockLogger.verbose).toHaveBeenCalledWith('Merged records for type generation');
    expect(mockLogger.success).toHaveBeenCalledWith(`Generated file: ${filePath}`);
  });

  it('should handle objectID as undefined in sample hit', async () => {
    const filePath = 'src/types/algolia.ts';
    const dir = dirname(resolve('/test/working/dir', filePath));
    const hitWithoutObjectID = {
      title: 'Test Title',
    };

    vi.mocked(existsSync).mockImplementation((path) => {
      return String(path) === dir;
    });
    vi.mocked(mockSearchClient.search).mockResolvedValue({
      results: [
        {
          hits: [hitWithoutObjectID],
        },
      ],
    });
    vi.mocked(generateTypeScriptTypes).mockReturnValue('export interface Test {}');

    await fetchAlgoliaData(filePath, baseConfig, false, mockLogger);

    expect(mockLogger.verbose).toHaveBeenCalledWith('Fetched 1 records');
    expect(mockLogger.verbose).toHaveBeenCalledWith('ObjectIDs: N/A');
    expect(mockLogger.verbose).toHaveBeenCalledWith('Merged records for type generation');
  });

  it('should initialize Algolia client with correct credentials', async () => {
    const filePath = 'src/types/algolia.ts';
    const dir = dirname(resolve('/test/working/dir', filePath));

    vi.mocked(existsSync).mockImplementation((path) => {
      return String(path) === dir;
    });
    vi.mocked(mockSearchClient.search).mockResolvedValue(mockSearchResponse);
    vi.mocked(generateTypeScriptTypes).mockReturnValue('export interface Test {}');

    await fetchAlgoliaData(filePath, baseConfig, false, mockLogger);

    expect(algoliasearch).toHaveBeenCalledWith(baseConfig.appId, baseConfig.searchKey);
  });

  it('should handle config with prefix and postfix', async () => {
    const filePath = 'src/types/algolia.ts';
    const dir = dirname(resolve('/test/working/dir', filePath));
    const config: AlgoliaCodegenGeneratorConfig = {
      ...baseConfig,
      prefix: 'Algolia',
      postfix: 'Type',
    };

    vi.mocked(existsSync).mockImplementation((path) => {
      return String(path) === dir;
    });
    vi.mocked(mockSearchClient.search).mockResolvedValue(mockSearchResponse);
    vi.mocked(generateTypeScriptTypes).mockReturnValue('export interface Test {}');

    await fetchAlgoliaData(filePath, config, false, mockLogger);

    expect(generateTypeScriptTypes).toHaveBeenCalledWith(mockSampleHit, config, {});
  });
});
