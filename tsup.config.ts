import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    splitting: false,
    clean: true,
    dts: true,
    minify: !options.watch,
    format: ['esm', 'cjs'],
    entry: ['src/index.ts', 'src/api.ts']
  }
})
