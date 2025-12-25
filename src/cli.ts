#!/usr/bin/env node

import { Command } from 'commander'
import { main } from './index.js'

const program = new Command()

program
  .name('algolia-codegen')
  .description('Generate TypeScript types from Algolia index')
  .option('-c, --config <path>', 'Config file path')
  .action(async (options) => {
    await main(options.config)
  })
  .parse()
