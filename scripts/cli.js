#!/usr/bin/env node

const { Command } = require('commander')
const startDevServer = require('./dev-server')

const program = new Command()

program
  .name('jianmu-js')
  .description('CLI tools for Jianmu Framework.')
  .version('0.0.1')

program
  .command('dev')
  .description('Run the jianmu application in development mode.')
  .option('-p, --python-path <path>', 'Path to the Python executable.')
  .option('-j, --jianmu-path <path>', 'Path to the Jianmu package.')
  .option('-P, --project-path <path>', 'Path to the project.')
  .action(({ pythonPath, jianmuPath, projectPath }) => {
    startDevServer(pythonPath, jianmuPath, projectPath)
  })

program.parse(process.argv)
