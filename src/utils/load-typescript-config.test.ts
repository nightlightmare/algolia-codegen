import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { loadTypeScriptConfig } from './load-typescript-config.js';

// Mock dependencies
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

vi.mock('esbuild', () => ({
  transformSync: vi.fn(),
}));

describe('loadTypeScriptConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and transform TypeScript config file', async () => {
    const mockSource = `
      export default {
        overwrite: true,
        generates: {
          'src/types/algolia.ts': {
            appId: 'test-app-id',
            searchKey: 'test-search-key',
            indexName: 'test-index',
          },
        },
      };
    `;

    const mockTransformed = `
      export default {
        overwrite: true,
        generates: {
          'src/types/algolia.ts': {
            appId: 'test-app-id',
            searchKey: 'test-search-key',
            indexName: 'test-index',
          },
        },
      };
    `;

    vi.mocked(readFileSync).mockReturnValue(mockSource);

    const esbuild = await import('esbuild');
    vi.mocked(esbuild.transformSync).mockReturnValue({
      code: mockTransformed,
      map: '',
      warnings: [],
      mangleCache: undefined,
      legalComments: undefined,
    });

    // Note: We can't easily mock the dynamic import() in ESM, so we just verify
    // that the function processes the file correctly and calls the right functions
    const result = await loadTypeScriptConfig('/test/path/config.ts');

    expect(readFileSync).toHaveBeenCalledWith('/test/path/config.ts', 'utf-8');
    expect(esbuild.transformSync).toHaveBeenCalledWith(mockSource, {
      loader: 'ts',
      format: 'esm',
      target: 'node20',
      sourcefile: '/test/path/config.ts',
    });
    // Verify that result is an object (module)
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('should throw error if esbuild transformation fails', async () => {
    vi.mocked(readFileSync).mockReturnValue('export default {};');

    const esbuild = await import('esbuild');
    vi.mocked(esbuild.transformSync).mockReturnValue({
      code: '',
      map: '',
      warnings: [],
      mangleCache: undefined,
      legalComments: undefined,
    });

    await expect(loadTypeScriptConfig('/test/path/config.ts')).rejects.toThrow(
      'Failed to transform TypeScript config file'
    );
  });

  it('should handle esbuild transformation errors', async () => {
    vi.mocked(readFileSync).mockReturnValue('invalid typescript code');

    const esbuild = await import('esbuild');
    vi.mocked(esbuild.transformSync).mockImplementation(() => {
      throw new Error('Syntax error');
    });

    await expect(loadTypeScriptConfig('/test/path/config.ts')).rejects.toThrow();
  });
});
