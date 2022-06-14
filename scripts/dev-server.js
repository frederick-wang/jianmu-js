process.env.NODE_ENV = 'development'

const Vite = require('vite')
const ChildProcess = require('child_process')
const Path = require('path')
const Chalk = require('chalk')
const Chokidar = require('chokidar')
const Electron = require('electron')
const compileTs = require('./private/tsc')
const FileSystem = require('fs')

let viteServer = null
let electronProcess = null
let electronProcessLocker = false
let flaskProcess = null
let flaskProcessLocker = false
let rendererPort = 0
let pythonPath = null
let jianmuPath = null
let projectPath = null

/**
 *
 * @param {string} projectPath Path to the project.
 * @returns
 */
async function startRendererServer() {
  const { getViteConfig } = require(Path.join('..', 'config', 'vite.js'))
  const config = getViteConfig(projectPath)
  const viteEntryPath = Path.join(
    __dirname,
    '..',
    'electron',
    'renderer',
    'main.ts'
  )
  viteServer = await Vite.createServer({
    ...config,
    build: {
      rollupOptions: {
        input: viteEntryPath
      }
    },
    mode: 'development',
    server: {
      fs: {
        allow: [
          Vite.searchForWorkspaceRoot(Path.join(projectPath, 'ui')),
          Vite.searchForWorkspaceRoot(
            Path.join(__dirname, '..', 'electron', 'renderer')
          )
        ]
      }
    }
  })

  return viteServer.listen(19021)
}

/**
 * Start the Flask server.
 *
 * @param {string} pythonPath Path to the Python executable.
 * @param {string} jianmuPath Path to the Jianmu package.
 * @param {string} projectPath Path to the project.
 */
async function startFlask() {
  if (flaskProcess) {
    // single instance lock
    return
  }

  const jmPath = Path.join(jianmuPath, 'jm.py')
  const srcPath = Path.join(projectPath, 'src')
  const env = {
    ...process.env,
    PATH: `${srcPath}${Path.delimiter}${projectPath}${Path.delimiter}${process.env.PATH}`,
    DEBUGGING: 1
  }
  flaskProcess = ChildProcess.spawn(pythonPath, [jmPath], {
    cwd: projectPath,
    env
  })
  flaskProcessLocker = false

  flaskProcess.stdout.on('data', (data) => {
    const msg = data.toString()
    const funcIsCalledR = /^Function (.+) is called.$/.exec(msg.trim())?.[1]
    if (funcIsCalledR) {
      process.stdout.write(
        Chalk.cyanBright('[python] ') +
          `Function ${Chalk.greenBright(funcIsCalledR)} is called.\n`
      )
      return
    }
    process.stdout.write(Chalk.cyanBright('[python] ') + msg)
  })

  flaskProcess.stderr.on('data', (data) => {
    const msg = data.toString()
    if (msg.includes('POST /api')) {
      return
    }
    const funcIsRegisteredR = /^Function (.+) is registered.$/.exec(
      msg.trim()
    )?.[1]
    if (funcIsRegisteredR) {
      process.stdout.write(
        Chalk.cyanBright('[python] ') +
          `Function ${Chalk.greenBright(funcIsRegisteredR)} is registered.\n`
      )
      return
    }
    process.stderr.write(Chalk.cyan(`[python] `) + msg)
  })

  flaskProcess.on('exit', () => stop())
}

function restartFlask() {
  if (flaskProcess) {
    flaskProcess.removeAllListeners('exit')
    flaskProcess.kill()
    flaskProcess = null
  }

  if (!flaskProcessLocker) {
    flaskProcessLocker = true
    startFlask()
  }
}

async function startElectron() {
  if (electronProcess) {
    // single instance lock
    return
  }

  try {
    const electronScriptsDir = Path.join(__dirname, '..', 'electron', 'main')
    await compileTs(electronScriptsDir)
  } catch (e) {
    console.log(
      Chalk.redBright(
        'Could not start Electron because of the above typescript error(s).'
      )
    )
    electronProcessLocker = false
    return
  }

  const args = [
    Path.join(__dirname, '..', '.jianmu', 'electron', 'main', 'main.js'),
    rendererPort
  ]
  electronProcess = ChildProcess.spawn(Electron, args)
  electronProcessLocker = false

  electronProcess.stdout.on('data', (data) => {
    const msg = data.toString()
    if (!msg.trim()) {
      return
    }
    process.stdout.write(Chalk.blueBright(`[ui] `) + Chalk.white(msg))
  })

  electronProcess.stderr.on('data', (data) => {
    const msg = data.toString()
    if (!msg.trim()) {
      return
    }
    process.stderr.write(Chalk.blue(`[ui] `) + Chalk.white(data.toString()))
  })

  electronProcess.on('exit', () => stop())
}

function restartElectron() {
  if (electronProcess) {
    electronProcess.removeAllListeners('exit')
    electronProcess.kill()
    electronProcess = null
  }

  if (!electronProcessLocker) {
    electronProcessLocker = true
    startElectron()
  }
}

function copyElectronMainStaticFiles() {
  copyElectronMainFiles('static')
}

/*
The working dir of Electron is .jianmu/electron/main instead of electron/main because of TS.
tsc does not copy static files, so copy them over manually for dev server.
*/
function copyElectronMainFiles(path) {
  FileSystem.cpSync(
    Path.join(__dirname, '..', 'electron', 'main', path),
    Path.join(__dirname, '..', '.jianmu', 'electron', 'main', path),
    { recursive: true }
  )
}

function stop() {
  console.log(Chalk.redBright('Stop Jianmu Development Server...'))
  viteServer.close()
  if (electronProcess.exitCode === null) {
    electronProcess.removeAllListeners('exit')
    electronProcess.kill()
    electronProcess = null
  }
  if (flaskProcess.exitCode === null) {
    flaskProcess.removeAllListeners('exit')
    flaskProcess.kill()
    flaskProcess = null
  }
  process.exit()
}

/**
 * Start the dev server.
 *
 * @param {string} _pythonPath Path to the Python executable.
 * @param {string} _jianmuPath Path to the Jianmu package.
 * @param {string} _projectPath Path to the project.
 */
async function start(_pythonPath, _jianmuPath, _projectPath) {
  pythonPath = _pythonPath
  jianmuPath = _jianmuPath
  projectPath = _projectPath
  printBanner()
  console.log(Chalk.greenBright('Start Jianmu Development Server...\n'))
  console.log(Chalk.yellowBright('You can press Ctrl+C to stop the server.\n'))

  const rendererServer = await startRendererServer()
  rendererPort = rendererServer.config.server.port

  startFlask(pythonPath, jianmuPath, projectPath)
  const pythonSrcPath = Path.join(projectPath, 'src')
  Chokidar.watch(pythonSrcPath, {
    cwd: pythonSrcPath
  }).on('change', (path) => {
    if (path.endsWith('.pyc')) {
      return
    }
    console.log(
      Chalk.cyanBright(`[python] `) + `Change in ${path}. reloading...`
    )
    restartFlask()
  })

  copyElectronMainStaticFiles()
  startElectron()

  const electronMainPath = Path.join(__dirname, '..', 'electron', 'main')
  Chokidar.watch(electronMainPath, {
    cwd: electronMainPath
  }).on('change', (path) => {
    console.log(Chalk.blueBright(`[ui] `) + `Change in ${path}. reloading...`)

    if (path.startsWith(Path.join('static', '/'))) {
      copyElectronMainFiles(path)
    }

    restartElectron()
  })
}

function printBanner() {
  const banner = FileSystem.readFileSync(
    Path.join(__dirname, 'private', 'banner.txt'),
    'utf8'
  ).split('\n')
  banner.forEach((line) => {
    console.log(Chalk.greenBright(line))
  })
}

module.exports = start
