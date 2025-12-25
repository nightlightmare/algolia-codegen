import { existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { AlgoliaCodegenConfig } from '../types.js';
import { validateConfig } from './validation.js';

/**
 * Loads and validates configuration from a file
 */
export async function loadConfig(
  configPath?: string
): Promise<AlgoliaCodegenConfig> {
  // Determine config file path
  const defaultConfigPath = 'algolia-codegen.ts';
  const finalConfigPath = configPath || defaultConfigPath;

  // Resolve path relative to current working directory
  const resolvedPath = resolve(process.cwd(), finalConfigPath);

  // Check if file exists
  if (!existsSync(resolvedPath)) {
    throw new Error(
      `Config file not found: ${resolvedPath}\n` +
      `Please create a config file or specify a different path using --config option.`
    );
  }

  // Try to import the config file
  // Convert file path to file URL for dynamic import
  const configUrl = pathToFileURL(resolvedPath).href;

  let configModule;
  try {
    configModule = await import(configUrl);
  } catch (importError) {
    // If .ts import fails, try .js extension
    const jsPath = resolvedPath.replace(/\.ts$/, '.js');
    if (existsSync(jsPath)) {
      const jsUrl = pathToFileURL(jsPath).href;
      try {
        configModule = await import(jsUrl);
      } catch (jsImportError) {
        throw new Error(
          `Failed to import config file: ${resolvedPath}\n` +
          `Tried both .ts and .js extensions.\n` +
          `Error: ${jsImportError instanceof Error ? jsImportError.message : String(jsImportError)}\n` +
          `Note: If using TypeScript config, you may need to compile it first or use a tool like tsx.`
        );
      }
    } else {
      const errorMessage = importError instanceof Error ? importError.message : String(importError);
      const isTypeScriptError = resolvedPath.endsWith('.ts') &&
        (errorMessage.includes('Cannot find module') || errorMessage.includes('Unknown file extension'));

      throw new Error(
        `Failed to import config file: ${resolvedPath}\n` +
        (isTypeScriptError
          ? `Node.js cannot directly import TypeScript files.\n` +
          `Please either:\n` +
          `  1. Compile your config to JavaScript (.js)\n` +
          `  2. Use a tool like tsx to run the CLI: tsx algolia-codegen\n` +
          `  3. Or use a JavaScript config file instead\n`
          : `Error: ${errorMessage}`)
      );
    }
  }

  // Get default export
  if (!configModule.default) {
    throw new Error(
      `Config file does not export a default object: ${resolvedPath}\n` +
      `Please ensure your config file exports a default object: export default { ... }`
    );
  }

  const config = configModule.default;

  // Validate that config is an object
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error(
      `Config file default export must be an object: ${resolvedPath}\n` +
      `Received: ${typeof config}`
    );
  }

  // Validate config structure
  validateConfig(config, resolvedPath);

  return config;
}

