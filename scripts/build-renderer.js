const Path = require('path')
const FileSystem = require('fs')
const Vite = require('vite')
const del = require('del')

/**
 * build the renderer files
 *
 * @param {string} projectPath The path to the project.
 */
async function buildRenderer(projectPath) {
  const jianmuJSPath = Path.join(__dirname, '..')
  const rendererPath = Path.join(jianmuJSPath, 'electron', 'renderer')
  const mainPath = Path.join(jianmuJSPath, 'electron', 'main')
  await del([Path.join(jianmuJSPath, '.jianmu', 'package.json')], {
    force: true
  })
  FileSystem.cpSync(
    Path.resolve(projectPath, 'package.json'),
    Path.join(jianmuJSPath, '.jianmu', 'package.json'),
    {
      recursive: true
    }
  )
  await del([Path.join(jianmuJSPath, '.jianmu', 'src-renderer')], {
    force: true
  })
  FileSystem.cpSync(
    Path.resolve(projectPath, 'ui'),
    Path.join(jianmuJSPath, '.jianmu', 'src-renderer'),
    {
      recursive: true
    }
  )
  const { getViteConfig } = require('../config/vite.js')
  const viteConfig = getViteConfig(projectPath)

  const uiPath = Path.join(jianmuJSPath, '.jianmu', 'src-renderer')
  // const uiPath = Path.join(projectPath, 'ui')
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
  const viteEntryPath = Path.join(
    jianmuJSPath,
    'electron',
    'renderer',
    'index.html'
  )
  return Vite.build({
    ...viteConfig,
    publicDir: Path.join(uiPath, 'public'),
    build: {
      outDir: Path.join(__dirname, '..', '.jianmu', 'electron', 'renderer'),
      emptyOutDir: true,
      // set chunkSizeWarningLimit to 5 MB
      chunkSizeWarningLimit: 1024 * 5,
      rollupOptions: {
        input: viteEntryPath
      }
    },
    base: './',
    mode: 'production',
    resolve: {
      alias
    }
  })
}

module.exports = buildRenderer
