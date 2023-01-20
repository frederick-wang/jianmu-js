const ChildProcess = require('child_process')
const Path = require('path')
const Chalk = require('chalk')
const Chokidar = require('chokidar')
const Electron = require('electron')

const buildRenderer = require('./build-renderer')
const getRendererServer = require('./get-renderer-server')
const buildMain = require('./build-main')
const {
  splitOutputData,
  printBanner,
  emptyTempDir,
  copyElectronMainFiles
} = require('./private/tools')

let viteServer = null
let electronProcess = null
let electronProcessLocker = false
let flaskProcess = null
let flaskProcessLocker = false
let rendererPort = 0
let pythonPath = null
let jianmuPath = null
let projectPath = null
let isDev = false

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
  console.log(Chalk.cyanBright(`[python] `) + 'Loading...')

  const jmPath = Path.resolve(jianmuPath, 'jm.py')
  const srcPath = Path.resolve(projectPath, 'src')
  const PYTHONPATH = process.env.PYTHONPATH
    ? `${srcPath}:${projectPath}:${process.env.PYTHONPATH}`
    : projectPath
  flaskProcess = ChildProcess.spawn(pythonPath, [jmPath], {
    cwd: srcPath,
    env: {
      ...process.env,
      PYTHONPATH
    }
  })
  flaskProcessLocker = false

  flaskProcess.stdout.on('data', (data) => {
    const prefix = Chalk.cyanBright('[python] ')
    for (const msg of splitOutputData(data)) {
      if (msg === '\n') {
        process.stdout.write(msg)
        continue
      }
      const funcIsCalledR = /^Function (.+) is called.$/.exec(msg.trim())?.[1]
      if (funcIsCalledR) {
        const time = new Date().toLocaleString()
        const calledTip = `Function ${Chalk.greenBright(
          funcIsCalledR
        )} is called`
        process.stdout.write(prefix + `${calledTip} at ${time}.\n`)
        continue
      }
      process.stdout.write(prefix + msg)
    }
  })

  flaskProcess.stderr.on('data', (data) => {
    const prefix = Chalk.cyanBright('[python] ')
    for (const msg of splitOutputData(data)) {
      if (msg === '\n') {
        process.stderr.write(msg)
        continue
      }
      if (msg.includes('POST /api')) {
        continue
      }
      const funcIsRegisteredR = /^Function (.+) is registered.$/.exec(
        msg.trim()
      )?.[1]
      if (funcIsRegisteredR) {
        process.stderr.write(
          prefix +
            `Function ${Chalk.greenBright(funcIsRegisteredR)} is registered.\n`
        )
        continue
      }
      process.stderr.write(prefix + msg)
    }
  })

  flaskProcess.on('exit', () => {
    // 如果 Electron 还没退出且处于开发模式，就重启 Flask 服务。
    if (isDev && electronProcess && electronProcess.exitCode === null) {
      // Clear outputs in the console.
      process.stdout.write('\x1Bc')
      console.log(
        Chalk.cyanBright(`[python] `) +
          'Reloading failed, try to reload again after 1 seconds...'
      )
      setTimeout(() => {
        restartFlask()
      }, 1000)
    } else {
      stop()
    }
  })
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

async function startElectron(copyStaticFiles = true) {
  if (electronProcess) {
    // single instance lock
    return
  }

  try {
    await buildMain(copyStaticFiles)
  } catch (e) {
    console.log(
      Chalk.redBright(
        'Could not start Electron because of the above typescript error(s).'
      )
    )
    electronProcessLocker = false
    return
  }

  console.log(Chalk.cyanBright(`[ui] `) + 'Starting...')

  const args = [
    Path.resolve(__dirname, '..', '.jianmu', 'electron', 'main.js'),
    rendererPort
  ]
  electronProcess = ChildProcess.spawn(Electron, args, {
    env: process.env
  })
  electronProcessLocker = false

  electronProcess.stdout.on('data', (data) => {
    const prefix = Chalk.blueBright(`[ui] `)
    for (const msg of splitOutputData(data)) {
      if (msg === '\n') {
        process.stdout.write(msg)
        continue
      }
      if (!msg.trim()) {
        continue
      }
      process.stdout.write(prefix + msg)
    }
  })

  electronProcess.stderr.on('data', (data) => {
    const prefix = Chalk.blue(`[ui] `)
    for (const msg of splitOutputData(data)) {
      if (msg === '\n') {
        process.stderr.write(msg)
        continue
      }
      if (!msg.trim()) {
        continue
      }
      process.stderr.write(prefix + msg)
    }
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
    // Clear outputs in the console.
    process.stdout.write('\x1Bc')
    startElectron(false)
  }
}

function stop() {
  console.log(Chalk.redBright('Stop Jianmu Development Server...'))
  if (isDev && viteServer) {
    viteServer.close()
  }
  if (electronProcess && electronProcess.exitCode === null) {
    electronProcess.removeAllListeners('exit')
    electronProcess.kill()
    electronProcess = null
  }
  if (flaskProcess && flaskProcess.exitCode === null) {
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
 * @param {boolean} _isDev Whether to start the dev server in development mode.
 */
async function start(_pythonPath, _jianmuPath, _projectPath, _isDev) {
  pythonPath = _pythonPath
  jianmuPath = _jianmuPath
  projectPath = _projectPath
  isDev = _isDev

  if (isDev) {
    process.env.NODE_ENV = 'development'
  } else {
    process.env.NODE_ENV = 'production'
  }

  // Clear outputs in the console.
  process.stdout.write('\x1Bc')
  printBanner()

  if (isDev) {
    console.log(
      Chalk.greenBright('Start Jianmu Application in development mode.\n')
    )
  } else {
    console.log(
      Chalk.greenBright('Start Jianmu Application in production mode.')
    )
    console.log(
      Chalk.yellowBright('[WARNING] ') +
        'In production mode, the Jianmu Application will not reload on file changes.\n'
    )
  }
  console.log(
    Chalk.yellowBright('You can press Ctrl+C to stop the Jianmu Application.\n')
  )

  // 删除临时文件目录 .jianmu
  await emptyTempDir()

  // 如果是 development 模式, 启动 vite dev server
  if (isDev) {
    viteServer = await getRendererServer(projectPath)
    await viteServer.listen(19021)
    rendererPort = viteServer.config.server.port
  } else {
    await buildRenderer(projectPath)
  }

  // 启动 Flask 服务
  startFlask(pythonPath, jianmuPath, projectPath)

  // 如果是 development 模式，侦听文件变化并重启 Flask 服务
  if (isDev) {
    const pythonSrcPath = Path.resolve(projectPath, 'src')
    Chokidar.watch(pythonSrcPath, {
      cwd: pythonSrcPath
    }).on('change', (path) => {
      if (path.endsWith('.pyc') || path.endsWith('.tmp')) {
        return
      }
      console.log(
        Chalk.cyanBright(`[python] `) + `Change in ${path}. reloading...`
      )
      restartFlask()
    })
  }

  // 编译 Electron Main 进程文件，并启动 Electron
  startElectron()

  // 如果是 development 模式，侦听文件变化并重启 Electron
  if (isDev) {
    const electronMainPath = Path.resolve(__dirname, '..', 'electron', 'main')
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
}

module.exports = start
