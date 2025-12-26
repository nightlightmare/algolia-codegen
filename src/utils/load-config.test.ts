import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, type PathLike } from 'fs';
import { resolve } from 'path';
import { loadConfig } from './load-config.js';

// Mock dependencies
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('./load-typescript-config.js', () => ({
  loadTypeScriptConfig: vi.fn(),
}));

vi.mock('./validations/index.js', () => ({
  validateConfig: vi.fn(),
}));

vi.mock('url', () => ({
  pathToFileURL: (path: string) => ({
    href: `file://${path}`,
  }),
}));

describe('loadConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue('/test/working/dir');
  });

  it('should load config from default path when no path provided', async () => {
    const mockConfig = {
      overwrite: true,
      generates: {
        'src/types/algolia.ts': {
          appId: 'test-app-id',
          searchKey: 'test-search-key',
          indexName: 'test-index',
        },
      },
    };

    const { loadTypeScriptConfig } = await import('./load-typescript-config.js');
    const { validateConfig } = await import('./validations/index.js');

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(loadTypeScriptConfig).mockResolvedValue({
      default: mockConfig,
    });
    vi.mocked(validateConfig).mockImplementation(() => {});

    const result = await loadConfig();

    expect(existsSync).toHaveBeenCalledWith(
      resolve('/test/working/dir', 'algolia-codegen.ts')
    );
    expect(result).toEqual(mockConfig);
  });

  it('should load config from custom path', async () => {
    const customPath = 'custom-config.ts';
    const mockConfig = {
      overwrite: false,
      generates: {
        'src/types/algolia.ts': {
          appId: 'test-app-id',
          searchKey: 'test-search-key',
          indexName: 'test-index',
        },
      },
    };

    const { loadTypeScriptConfig } = await import('./load-typescript-config.js');
    const { validateConfig } = await import('./validations/index.js');

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(loadTypeScriptConfig).mockResolvedValue({
      default: mockConfig,
    });
    vi.mocked(validateConfig).mockImplementation(() => {});

    const result = await loadConfig(customPath);

    expect(existsSync).toHaveBeenCalledWith(
      resolve('/test/working/dir', customPath)
    );
    expect(result).toEqual(mockConfig);
  });

  it('should throw error if config file does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    await expect(loadConfig('non-existent.ts')).rejects.toThrow(
      'Config file not found'
    );
  });

  it('should throw error if config file does not have default export', async () => {
    const { loadTypeScriptConfig } = await import('./load-typescript-config.js');
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(loadTypeScriptConfig).mockResolvedValue({
      // No default export
    } as any);

    await expect(loadConfig()).rejects.toThrow(
      'Config file does not export a default object'
    );
  });

  it('should throw error if default export is not an object', async () => {
    const { loadTypeScriptConfig } = await import('./load-typescript-config.js');
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(loadTypeScriptConfig).mockResolvedValue({
      default: 'not an object',
    } as any);

    await expect(loadConfig()).rejects.toThrow(
      'Config file default export must be an object'
    );
  });

  it('should throw error if default export is null', async () => {
    const { loadTypeScriptConfig } = await import('./load-typescript-config.js');
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(loadTypeScriptConfig).mockResolvedValue({
      default: null,
    } as any);

    // When default is null, the check !configModule.default catches it first
    await expect(loadConfig()).rejects.toThrow(
      'Config file does not export a default object'
    );
  });

  it('should throw error if default export is an array', async () => {
    const { loadTypeScriptConfig } = await import('./load-typescript-config.js');
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(loadTypeScriptConfig).mockResolvedValue({
      default: [],
    } as any);

    await expect(loadConfig()).rejects.toThrow(
      'Config file default export must be an object'
    );
  });

  it('should validate config after loading', async () => {
    const mockConfig = {
      overwrite: true,
      generates: {
        'src/types/algolia.ts': {
          appId: 'test-app-id',
          searchKey: 'test-search-key',
          indexName: 'test-index',
        },
      },
    };

    const { loadTypeScriptConfig } = await import('./load-typescript-config.js');
    const { validateConfig } = await import('./validations/index.js');

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(loadTypeScriptConfig).mockResolvedValue({
      default: mockConfig,
    });
    vi.mocked(validateConfig).mockImplementation(() => {});

    await loadConfig();

    expect(validateConfig).toHaveBeenCalledWith(
      mockConfig,
      resolve('/test/working/dir', 'algolia-codegen.ts')
    );
  });

  it('should handle TypeScript config loading errors', async () => {
    const { loadTypeScriptConfig } = await import('./load-typescript-config.js');
    // Mock existsSync to return true for .ts file, false for .js file
    vi.mocked(existsSync).mockImplementation((path: PathLike) => {
      return String(path).endsWith('.ts');
    });
    vi.mocked(loadTypeScriptConfig).mockRejectedValue(
      new Error('TypeScript compilation error')
    );

    await expect(loadConfig()).rejects.toThrow('Failed to load TypeScript config file');
  });
});
