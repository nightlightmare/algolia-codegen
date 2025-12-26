import { loadConfig } from './utils/load-config.js';
import { fetchAlgoliaData } from './utils/fetch-algolia-data.js';
import type { UrlSchema } from './types.js';
import Logger from './utils/logger.js';

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

export interface MainOptions {
  configPath?: string;
  verbose?: boolean;
  dryRun?: boolean;
}

/**
 * Main function to load and process configuration
 */
export const main = async (options?: MainOptions | string) => {
  // Support legacy string parameter for backward compatibility
  const opts: MainOptions = typeof options === 'string' ? { configPath: options } : (options ?? {});

  const logger = new Logger({
    verbose: opts.verbose ?? false,
    dryRun: opts.dryRun ?? false,
  });

  try {
    const configSpinner = logger.spinner('Loading configuration...');
    configSpinner.start();

    const config = await loadConfig(opts.configPath);

    configSpinner.succeed('Configuration loaded successfully');
    logger.verbose(`Config path: ${opts.configPath || 'default'}`);
    logger.verbose(`Overwrite mode: ${config.overwrite ? 'enabled' : 'disabled'}`);

    // Normalize generates to array of UrlSchema
    const generatesArray: UrlSchema[] = Array.isArray(config.generates)
      ? config.generates
      : [config.generates];

    logger.verbose(`Found ${generatesArray.length} generate configuration(s)`);

    // Process each UrlSchema
    for (const urlSchema of generatesArray) {
      // Process each file path in the schema
      for (const [filePath, generatorConfig] of Object.entries(urlSchema)) {
        try {
          await fetchAlgoliaData(filePath, generatorConfig, config.overwrite, logger);
        } catch (error) {
          logger.error(`Error processing file: ${filePath}`);
          const errorMessage = logger.formatError(error, 'Processing failed');
          logger.error(errorMessage);
          // Continue processing other files even if one fails
        }
      }
    }

    if (opts.dryRun) {
      logger.info('Dry-run completed. No files were written.');
    } else {
      logger.success('All files generated successfully!');
    }
  } catch (error) {
    logger.error('Failed to load configuration');
    const errorMessage = logger.formatError(error, 'Configuration error');
    logger.error(errorMessage);
    process.exit(1);
  }
};
