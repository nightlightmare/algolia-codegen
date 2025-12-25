import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts'
  },
  format: ['esm', 'cjs'],
  target: 'node18',
  dts: true,
  clean: true,
  shims: false
})
