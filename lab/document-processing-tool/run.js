#!/usr/bin/env node

const { spawnSync } = require('node:child_process')
const path = require('node:path')

const mainPath = path.join(__dirname, 'src', 'main.ts')
const result = spawnSync(process.execPath, ['--import', 'tsx', mainPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
})

if (typeof result.status === 'number') {
  process.exit(result.status)
}
process.exit(1)
