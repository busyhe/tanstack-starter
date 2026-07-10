import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const env = {
  ...process.env,
  VITE_SITE_URL: process.env.VITE_SITE_URL || 'http://127.0.0.1:3100',
}

const exitCode = await new Promise((resolveExitCode, reject) => {
  const child = spawn(command, ['exec', 'turbo', 'test:e2e'], {
    cwd: repositoryRoot,
    env,
    stdio: 'inherit',
  })

  child.once('error', reject)
  child.once('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }
    resolveExitCode(code ?? 1)
  })
})

process.exitCode = exitCode
