const Path = require('path')
const vuePlugin = require('@vitejs/plugin-vue')
const { createHtmlPlugin } = require('vite-plugin-html')

const { defineConfig } = require('vite')

/**
 * Generate the configuration for vite.
 *
 * @param {string} projectPath Path to the project.
 * @returns {object} The UserConfigExport for vite.
 */
const getViteConfig = (projectPath) => {
  const { productName, version } = require(Path.join(
    projectPath,
    'package.json'
  ))
  const jianmuJSPath = Path.join(__dirname, '..')
  const rendererPath = Path.join(jianmuJSPath, 'electron', 'renderer')
  const mainPath = Path.join(jianmuJSPath, 'electron', 'main')
  const outDir = Path.join(jianmuJSPath, '.jianmu', 'electron', 'renderer')

  const uiPath = Path.join(projectPath, 'ui')
  const componentsPath = Path.join(uiPath, 'components')
  const composablesPath = Path.join(uiPath, 'composables')
  const layoutsPath = Path.join(uiPath, 'layouts')
  const pagesPath = Path.join(uiPath, 'pages')
  const assetsPath = Path.join(uiPath, 'assets')
  const storesPath = Path.join(uiPath, 'stores')
  const alias = {
    // 建木别名
    jianmu: Path.join(jianmuJSPath, 'dist'),
    // 项目文件夹别名
    '@': uiPath,
    project: uiPath,
    '~': projectPath,
    components: componentsPath,
    composables: composablesPath,
    layouts: layoutsPath,
    pages: pagesPath,
    assets: assetsPath,
    stores: storesPath,
    // jianmu-js 别名
    renderer: rendererPath,
    main: mainPath
  }
  /**
   * https://vitejs.dev/config
   */
  const config = defineConfig({
    root: rendererPath,
    publicDir: 'public',
    server: {
      port: 8080
    },
    open: false,
    build: {
      outDir,
      emptyOutDir: true
    },
    plugins: [
      vuePlugin(),
      createHtmlPlugin({
        inject: {
          data: {
            title: `${productName} ${version}`
          }
        }
      })
    ],
    resolve: {
      alias
    }
  })
  return config
}

exports.getViteConfig = getViteConfig
