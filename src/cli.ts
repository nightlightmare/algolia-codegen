#!/usr/bin/env node

import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { Command } from 'commander';
import { main } from './index.js';

// Load .env file if it exists
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  loadDotenv({ path: envPath });
}

const program = new Command();

program
  .name('algolia-codegen')
  .description('Generate TypeScript types from Algolia index')
  .option('-c, --config <path>', 'Config file path')
  .action(async (options) => {
    await main(options.config);
  })
  .parse();
