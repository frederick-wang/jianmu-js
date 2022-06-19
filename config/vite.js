const Path = require('path')
const vuePlugin = require('@vitejs/plugin-vue')
const { createHtmlPlugin } = require('vite-plugin-html')

const { defineConfig } = require('vite')

/**
 * Generate the configuration for vite.
 *
 * @param {string} projectPath Path to the project.
 * @returns {import('vite').UserConfigExport} The UserConfigExport for vite.
 */
const getViteConfig = (projectPath) => {
  const { productName } = require(Path.join(projectPath, 'package.json'))
  const jianmuJSPath = Path.join(__dirname, '..')
  const outDir = Path.join(jianmuJSPath, '.jianmu', 'electron', 'renderer')
  const rendererPath = Path.join(jianmuJSPath, 'electron', 'renderer')
  /**
   * https://vitejs.dev/config
   */
  const config = defineConfig({
    root: rendererPath,
    publicDir: 'public',
    open: false,
    build: {
      outDir,
      emptyOutDir: true,
      // set chunkSizeWarningLimit to 5 MB
      chunkSizeWarningLimit: 1024 * 5
    },
    plugins: [
      vuePlugin(),
      createHtmlPlugin({
        inject: {
          data: {
            title: productName
          }
        }
      })
    ]
  })
  return config
}

exports.getViteConfig = getViteConfig
