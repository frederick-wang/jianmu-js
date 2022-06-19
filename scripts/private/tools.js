const FileSystem = require('fs')
const Chalk = require('chalk')
const Path = require('path')

/**
 * @param {Buffer} data
 */
const splitOutputData = (data) => {
  const outputString = data
    .toString()
    .replaceAll('\r', '\n')
    .replace(/\n+/g, '\n')
  if (outputString === '\n') {
    return [outputString]
  }
  let lines = outputString.split('\n')
  if (lines.length && !lines[0]) {
    lines = lines.slice(1)
  }
  if (lines.length && !lines[lines.length - 1]) {
    lines = lines.slice(0, -1)
  }
  lines = lines.map((line) => line + '\n')
  return lines
}

/**
 * Print the Jianmu banner.
 */
function printBanner() {
  const banner = FileSystem.readFileSync(
    Path.join(__dirname, 'banner.txt'),
    'utf8'
  ).split('\n')
  banner.forEach((line) => {
    console.log(Chalk.greenBright(line))
  })
}

/**
 * Empty the temp directory .jianmu
 */
async function emptyTempDir() {
  const tempDir = Path.join(__dirname, '..', '..', '.jianmu')
  await FileSystem.promises.rm(tempDir, { recursive: true, force: true })
  await FileSystem.promises.mkdir(tempDir)
}

/**
 * The working dir of Electron is .jianmu/electron/main instead of electron/main because of TS.
 * tsc does not copy static files, so copy them over manually for dev server.
 * @param {string} path
 */
function copyElectronMainFiles(path) {
  FileSystem.cpSync(
    Path.resolve(__dirname, '..', '..', 'electron', 'main', path),
    Path.resolve(__dirname, '..', '..', '.jianmu', 'electron', path),
    { recursive: true }
  )
}

function copyElectronMainStaticFiles() {
  copyElectronMainFiles('static')
}

exports.splitOutputData = splitOutputData
exports.printBanner = printBanner
exports.emptyTempDir = emptyTempDir
exports.copyElectronMainFiles = copyElectronMainFiles
exports.copyElectronMainStaticFiles = copyElectronMainStaticFiles
