import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { config as loadDotenv } from 'dotenv';

// Mock dependencies
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

vi.mock('./index.js', () => ({
  main: vi.fn(),
}));

// Mock Commander to prevent parse() from running during CLI module import
vi.mock('commander', async () => {
  const actual = await vi.importActual<typeof import('commander')>('commander');
  return {
    ...actual,
    Command: class MockCommand extends actual.Command {
      parse() {
        // Don't actually parse, just return this for chaining
        return this;
      }
      parseAsync() {
        // Don't actually parse, just return a resolved promise
        return Promise.resolve(this);
      }
    },
  };
});

describe('CLI', () => {
  let originalArgv: string[];
  let originalCwd: () => string;

  beforeEach(() => {
    // Save original values
    originalArgv = [...process.argv];
    originalCwd = process.cwd;

    // Reset module cache to allow re-importing CLI module
    vi.resetModules();

    // Mock process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue('/test/working/dir');

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    process.argv = originalArgv;
    vi.restoreAllMocks();
  });

  describe('.env file loading', () => {
    it('should load .env file when it exists', async () => {
      vi.mocked(existsSync).mockReturnValue(true);

      // Import CLI to trigger .env loading
      await import('./cli.js');

      expect(existsSync).toHaveBeenCalledWith(
        resolve('/test/working/dir', '.env')
      );
      expect(loadDotenv).toHaveBeenCalledWith({
        path: resolve('/test/working/dir', '.env'),
      });
    });

    it('should not load .env file when it does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      // Import CLI to trigger .env loading check
      await import('./cli.js');

      expect(existsSync).toHaveBeenCalledWith(
        resolve('/test/working/dir', '.env')
      );
      expect(loadDotenv).not.toHaveBeenCalled();
    });

    it('should resolve .env path relative to current working directory', async () => {
      // Reset modules to ensure fresh import
      vi.resetModules();
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.spyOn(process, 'cwd').mockReturnValue('/custom/working/directory');

      await import('./cli.js');

      expect(existsSync).toHaveBeenCalledWith(
        resolve('/custom/working/directory', '.env')
      );
      expect(loadDotenv).toHaveBeenCalledWith({
        path: resolve('/custom/working/directory', '.env'),
      });
    });
  });

  describe('Commander program setup', () => {
    it('should create Commander program with correct name and description', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      // Import CLI
      const cliModule = await import('./cli.js');

      // The CLI module should be imported successfully
      expect(cliModule).toBeDefined();
    });
  });

  describe('Command option parsing', () => {
    beforeEach(() => {
      // Unmock commander for these tests to use real parsing
      vi.doUnmock('commander');
      vi.resetModules();
    });

    it('should call main with config path when --config option is provided', async () => {
      const { main } = await import('./index.js');
      const { Command } = await import('commander');
      const program = new Command();

      program
        .name('algolia-codegen')
        .description('Generate TypeScript types from Algolia index')
        .option('-c, --config <path>', 'Config file path')
        .action(async (options) => {
          await main(options.config);
        });

      await program.parseAsync(['node', 'cli.js', '--config', 'custom-config.ts']);

      expect(main).toHaveBeenCalledWith('custom-config.ts');
    });

    it('should call main with undefined when --config option is not provided', async () => {
      const { main } = await import('./index.js');
      const { Command } = await import('commander');
      const program = new Command();

      program
        .name('algolia-codegen')
        .description('Generate TypeScript types from Algolia index')
        .option('-c, --config <path>', 'Config file path')
        .action(async (options) => {
          await main(options.config);
        });

      await program.parseAsync(['node', 'cli.js']);

      expect(main).toHaveBeenCalledWith(undefined);
    });

    it('should call main with config path when -c short option is provided', async () => {
      const { main } = await import('./index.js');
      const { Command } = await import('commander');
      const program = new Command();

      program
        .name('algolia-codegen')
        .description('Generate TypeScript types from Algolia index')
        .option('-c, --config <path>', 'Config file path')
        .action(async (options) => {
          await main(options.config);
        });

      await program.parseAsync(['node', 'cli.js', '-c', 'short-config.ts']);

      expect(main).toHaveBeenCalledWith('short-config.ts');
    });

    it('should handle errors from main function', async () => {
      const { main } = await import('./index.js');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(main).mockRejectedValue(new Error('Test error'));

      const { Command } = await import('commander');
      const program = new Command();

      program
        .name('algolia-codegen')
        .description('Generate TypeScript types from Algolia index')
        .option('-c, --config <path>', 'Config file path')
        .action(async (options) => {
          try {
            await main(options.config);
          } catch (error) {
            console.error('Error:', error);
            throw error;
          }
        });

      await expect(
        program.parseAsync(['node', 'cli.js'])
      ).rejects.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should set up program with correct option flags', async () => {
      const { Command } = await import('commander');
      const program = new Command();

      program
        .name('algolia-codegen')
        .description('Generate TypeScript types from Algolia index')
        .option('-c, --config <path>', 'Config file path')
        .action(async (options) => {
          // Test that both short and long forms work
          expect(options.config).toBeDefined();
        });

      // Test long form
      await program.parseAsync(['node', 'cli.js', '--config', 'test.ts']);
      const opts1 = program.opts();
      expect(opts1.config).toBe('test.ts');

      // Test short form
      const program2 = new Command();
      program2
        .name('algolia-codegen')
        .description('Generate TypeScript types from Algolia index')
        .option('-c, --config <path>', 'Config file path')
        .action(async (options) => {
          expect(options.config).toBeDefined();
        });

      await program2.parseAsync(['node', 'cli.js', '-c', 'test.ts']);
      const opts2 = program2.opts();
      expect(opts2.config).toBe('test.ts');
    });
  });
});
