const Path = require('path')
const Vite = require('vite')

/**
 * @param {string} projectPath
 */
async function getRendererServer(projectPath) {
  const { getViteConfig } = require('../config/vite.js')
  const viteConfig = getViteConfig(projectPath)
  const jianmuJSPath = Path.join(__dirname, '..')
  const rendererPath = Path.join(jianmuJSPath, 'electron', 'renderer')
  const mainPath = Path.join(jianmuJSPath, 'electron', 'main')

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
  const viteEntryPath = Path.join(rendererPath, 'index.html')
  const viteServer = await Vite.createServer({
    ...viteConfig,
    publicDir: Path.join(uiPath, 'public'),
    build: {
      rollupOptions: {
        input: viteEntryPath
      }
    },
    mode: 'development',
    server: {
      hmr: true,
      fs: {
        allow: [projectPath, jianmuJSPath]
      }
    },
    resolve: {
      alias
    }
  })

  return viteServer
}

module.exports = getRendererServer
