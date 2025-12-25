#!/usr/bin/env node

import { Command } from 'commander'

const program = new Command()

program
  .name('algolia-codegen')
  .description('Generate TypeScript types from Algolia index')
  .option('-c, --config <path>', 'Config file path')
  .parse()

console.log('algolia-codegen bootstrap')
