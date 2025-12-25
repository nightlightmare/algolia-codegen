import { existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { AlgoliaCodegenConfig } from '../types.js';
import { loadTypeScriptConfig } from './load-typescript-config.js';
import { validateConfig } from './validations/index.js';

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
  
  // If it's a TypeScript file, use esbuild to load it
  if (resolvedPath.endsWith('.ts')) {
    try {
      configModule = await loadTypeScriptConfig(resolvedPath);
    } catch (tsError) {
      // If esbuild fails, try .js extension as fallback
      const jsPath = resolvedPath.replace(/\.ts$/, '.js');
      if (existsSync(jsPath)) {
        const jsUrl = pathToFileURL(jsPath).href;
        try {
          configModule = await import(jsUrl);
        } catch (jsImportError) {
          throw new Error(
            `Failed to import config file: ${resolvedPath}\n` +
            `Tried both .ts (via esbuild) and .js extensions.\n` +
            `TypeScript error: ${tsError instanceof Error ? tsError.message : String(tsError)}\n` +
            `JavaScript error: ${jsImportError instanceof Error ? jsImportError.message : String(jsImportError)}`
          );
        }
      } else {
        throw new Error(
          `Failed to load TypeScript config file: ${resolvedPath}\n` +
          `Error: ${tsError instanceof Error ? tsError.message : String(tsError)}\n` +
          `Make sure esbuild is installed as a dependency.`
        );
      }
    }
  } else {
    // Regular JavaScript file, use standard import
    try {
      configModule = await import(configUrl);
    } catch (importError) {
      const errorMessage = importError instanceof Error ? importError.message : String(importError);
      throw new Error(
        `Failed to import config file: ${resolvedPath}\n` +
        `Error: ${errorMessage}`
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

