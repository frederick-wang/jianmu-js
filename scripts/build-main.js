const Path = require('path')
const compileTs = require('./private/tsc')
const { copyElectronMainStaticFiles } = require('./private/tools')

async function buildMain(copyStaticFiles = true) {
  if (copyStaticFiles) {
    copyElectronMainStaticFiles()
  }
  const electronMainDir = Path.resolve(__dirname, '..', 'electron', 'main')
  await compileTs(electronMainDir)
}

module.exports = buildMain
