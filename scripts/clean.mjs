import { promises as fs } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = await fs.realpath(resolve(scriptDir, '..'))
const workspaceGroups = ['apps', 'packages']
const targetNames = [
  'node_modules',
  'dist',
  '.turbo',
  '.output',
  '.nitro',
  '.tanstack',
  'coverage',
  'playwright-report',
  'test-results',
  'dist.zip',
]
const supportedArguments = new Set(['--', '--dry-run', '--del-lock'])
const argumentsList = process.argv.slice(2)
const unknownArguments = argumentsList.filter((argument) => !supportedArguments.has(argument))

if (unknownArguments.length > 0) {
  console.error(`[clean] Unknown argument(s): ${unknownArguments.join(', ')}`)
  console.error('[clean] Usage: node scripts/clean.mjs [--dry-run] [--del-lock]')
  process.exitCode = 1
} else {
  await clean()
}

async function clean() {
  const dryRun = argumentsList.includes('--dry-run')
  const deleteLockFile = argumentsList.includes('--del-lock')
  const errors = []
  const scopes = await findScopes(errors)
  const targets = scopes.flatMap((scope) =>
    targetNames.map((targetName) => ({
      path: resolve(scope, targetName),
      scope,
      targetName,
    })),
  )

  if (deleteLockFile) {
    targets.push({
      path: resolve(rootDir, 'pnpm-lock.yaml'),
      scope: rootDir,
      targetName: 'pnpm-lock.yaml',
    })
  }

  console.log(`[clean] ${dryRun ? 'Dry run' : 'Cleanup'} from repository root: ${rootDir}`)
  console.log(`[clean] Scopes: repository root and ${Math.max(scopes.length - 1, 0)} direct workspace package(s)`)

  let removedCount = 0
  let missingCount = 0

  for (const target of targets) {
    try {
      assertSafeTarget(target)

      if (!(await pathExists(target.path))) {
        missingCount += 1
        continue
      }

      if (dryRun) {
        console.log(`[clean] Would remove: ${target.path}`)
      } else {
        await fs.rm(target.path, { force: true, recursive: true })
        console.log(`[clean] Removed: ${target.path}`)
      }

      removedCount += 1
    } catch (error) {
      errors.push(formatError(target.path, error))
    }
  }

  const action = dryRun ? 'would remove' : 'removed'
  console.log(`[clean] Summary: ${removedCount} ${action}, ${missingCount} not present, ${errors.length} error(s).`)

  if (errors.length > 0) {
    console.error('[clean] Errors:')
    for (const error of errors) {
      console.error(`[clean] - ${error}`)
    }
    process.exitCode = 1
  }
}

async function findScopes(errors) {
  const scopes = [rootDir]

  for (const groupName of workspaceGroups) {
    const groupDir = resolve(rootDir, groupName)

    try {
      const groupStats = await fs.lstat(groupDir)
      if (!groupStats.isDirectory() || groupStats.isSymbolicLink()) {
        throw new Error('refusing workspace group that is not a real directory')
      }

      const realGroupDir = await fs.realpath(groupDir)
      if (realGroupDir !== groupDir) {
        throw new Error(`refusing workspace group outside its canonical path: ${realGroupDir}`)
      }

      const entries = await fs.readdir(groupDir, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const scope = resolve(groupDir, entry.name)
          const realScope = await fs.realpath(scope)
          if (realScope !== scope) {
            errors.push(`refusing workspace scope outside its canonical path: ${realScope}`)
            continue
          }
          scopes.push(scope)
        }
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        errors.push(formatError(groupDir, error))
      }
    }
  }

  return scopes.sort()
}

function assertSafeTarget({ path, scope, targetName }) {
  const normalizedScope = resolve(scope)
  const normalizedTarget = resolve(path)
  const scopeRelativePath = relative(rootDir, normalizedScope)
  const scopeSegments = scopeRelativePath.split(sep).filter(Boolean)
  const isRootScope = scopeRelativePath === ''
  const isDirectWorkspaceScope = scopeSegments.length === 2 && workspaceGroups.includes(scopeSegments[0])
  const isAllowedTarget = targetNames.includes(targetName) || (targetName === 'pnpm-lock.yaml' && isRootScope)
  const targetRelativePath = relative(rootDir, normalizedTarget)
  const escapesRoot =
    targetRelativePath === '..' || targetRelativePath.startsWith(`..${sep}`) || isAbsolute(targetRelativePath)

  if (!isRootScope && !isDirectWorkspaceScope) {
    throw new Error(`refusing unsupported scope: ${normalizedScope}`)
  }

  if (!isAllowedTarget) {
    throw new Error(`refusing unsupported target name: ${targetName}`)
  }

  if (dirname(normalizedTarget) !== normalizedScope) {
    throw new Error(`refusing target outside its scope: ${normalizedTarget}`)
  }

  if (targetRelativePath === '' || escapesRoot || targetRelativePath.split(sep).includes('.git')) {
    throw new Error(`refusing unsafe target path: ${normalizedTarget}`)
  }
}

async function pathExists(path) {
  try {
    await fs.lstat(path)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

function formatError(path, error) {
  const message = error instanceof Error ? error.message : String(error)
  return `${path}: ${message}`
}
