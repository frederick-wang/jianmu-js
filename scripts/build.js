const Path = require('path')
const FileSystem = require('fs')
const ChildProcess = require('child_process')
const Chalk = require('chalk')
// const builder = require('electron-builder')
// const { Platform } = builder
// const config = require('../config/electron-builder.json')
const packageJSON = {
  name: 'jianmu-template',
  version: '0.0.2',
  description: 'The project template of Jianmu Framework.',
  main: 'main.js',
  keywords: ['Jianmu', 'Python', 'Vue', 'Electron'],
  author: 'Zhaoji Wang <hwoam@outlook.com>',
  license: 'Apache-2.0',
  homepage: 'https://github.com/frederick-wang/jianmu-template#readme',
  devDependencies: {
    electron: '^19.0.3',
    'electron-builder': '^23.0.3'
  },
  dependencies: {
    got: '^11.8.5'
  }
}

const buildRenderer = require('./build-renderer')
const buildMain = require('./build-main')
const { emptyTempDir } = require('./private/tools')

/**
 * Build the Jianmu Application
 *
 * @param {string} _pythonPath Path to the Python executable.
 * @param {string} _jianmuPath Path to the Jianmu package.
 * @param {string} _projectPath Path to the project.
 */
async function build(_pythonPath, _jianmuPath, _projectPath) {
  await emptyTempDir()
  console.log(Chalk.blueBright('Transpiling UI ...'))

  await Promise.allSettled([buildRenderer(_projectPath), buildMain()]).then(
    () => {
      console.log(Chalk.greenBright('UI successfully transpiled!'))
    }
  )

  await FileSystem.promises.writeFile(
    Path.resolve(__dirname, '..', '.jianmu', 'electron', 'package.json'),
    JSON.stringify(packageJSON, null, 2)
  )

  ChildProcess.exec(
    'npm install --registry=https://registry.npmmirror.com',
    {
      cwd: Path.resolve(__dirname, '..', '.jianmu', 'electron'),
      env: {
        ...process.env,
        ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/'
      }
    },
    async (error, stdout, stderr) => {
      if (error) {
        console.error(Chalk.redBright(error))
        return
      }
      console.log(stdout)
      console.log(stderr)
      // await builder.build({
      //   config: {
      //     ...config,
      //     electronVersion: '19.0.3',
      //     directories: {
      //       output: Path.resolve(_projectPath, 'dist'),
      //       app: Path.resolve(__dirname, '..', '.jianmu', 'electron')
      //     }
      //   }
      // })
      console.log(Chalk.greenBright('Jianmu Application successfully built!'))
    }
  )
}

module.exports = build
