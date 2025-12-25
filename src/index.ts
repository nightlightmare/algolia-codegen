import { loadConfig } from './utils/config-loader.js';

// Export types for users
export type {
  AlgoliaCodegenConfig,
  AlgoliaCodegenGeneratorConfig,
  InstanceOrArray,
  UrlSchema,
} from './types.js';

// Export validation functions for advanced usage
export {
  validateConfig,
  validateUrlSchema,
  validateGeneratorConfig,
} from './utils/validation.js';

/**
 * Main function to load and process configuration
 */
export const main = async (configPath?: string) => {
  try {
    const config = await loadConfig(configPath);

    // Output config contents
    console.log('Config loaded successfully:');
    console.log(JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error loading config:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    process.exit(1);
  }
};