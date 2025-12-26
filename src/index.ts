import { loadConfig } from './utils/load-config.js';
import { fetchAlgoliaData } from './utils/fetch-algolia-data.js';
import type { UrlSchema } from './types.js';

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
} from './utils/validations/index.js';

/**
 * Main function to load and process configuration
 */
export const main = async (configPath?: string) => {
  try {
    const config = await loadConfig(configPath);

    console.log('Config loaded successfully');

    // Normalize generates to array of UrlSchema
    const generatesArray: UrlSchema[] = Array.isArray(config.generates)
      ? config.generates
      : [config.generates];

    // Process each UrlSchema
    for (const urlSchema of generatesArray) {
      // Process each file path in the schema
      for (const [filePath, generatorConfig] of Object.entries(urlSchema)) {
        try {
          await fetchAlgoliaData(filePath, generatorConfig, config.overwrite);
        } catch (error) {
          console.error(`\nError processing file: ${filePath}`);
          if (error instanceof Error) {
            console.error(error.message);
            if (error.stack) {
              console.error(error.stack);
            }
          } else {
            // Try to stringify the error object for better debugging
            try {
              console.error(JSON.stringify(error, null, 2));
            } catch {
              console.error(String(error));
            }
          }
          // Continue processing other files even if one fails
        }
      }
    }
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
