import { execFileSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const releaseBranch = 'main'

function fail(message) {
  console.error(`[release] ${message}`)
  process.exit(1)
}

function git(args, errorMessage) {
  try {
    return execFileSync('git', args, {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch (error) {
    const detail = error?.stderr?.trim()
    fail(detail ? `${errorMessage}: ${detail}` : errorMessage)
  }
}

const branch = git(['branch', '--show-current'], 'Could not determine the current Git branch')
if (!branch) fail('Detached HEAD is not allowed for a release')
if (branch !== releaseBranch) {
  fail(`Releases must run from ${releaseBranch}; current branch is ${branch}`)
}

const status = git(['status', '--porcelain'], 'Could not inspect the Git working tree')
if (status) {
  fail('Git working tree must be clean before release')
}

const upstream = git(
  ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'],
  `Branch ${branch} must track a remote branch before release`,
)
const remote = git(['config', `branch.${branch}.remote`], `Could not determine the remote for ${upstream}`)
if (!remote || remote === '.') fail(`Branch ${branch} must track a real remote branch`)
const mergeRef = git(['config', `branch.${branch}.merge`], `Could not determine the remote ref for ${upstream}`)
if (mergeRef !== `refs/heads/${branch}`) {
  fail(`Branch ${branch} must track refs/heads/${branch}; configured target is ${mergeRef}`)
}

git(['fetch', '--quiet', '--tags', remote], `Could not fetch ${remote}; no release changes were made`)

const head = git(['rev-parse', 'HEAD'], 'Could not resolve the current commit')
const upstreamHead = git(['rev-parse', '@{upstream}'], `Could not resolve ${upstream}`)
if (head !== upstreamHead) {
  const [behind = '?', ahead = '?'] = git(
    ['rev-list', '--left-right', '--count', '@{upstream}...HEAD'],
    `Could not compare ${branch} with ${upstream}`,
  ).split(/\s+/)
  fail(
    `${branch} must be synchronized with ${upstream} before release (behind: ${behind}, ahead: ${ahead}). ` +
      'Push reviewed commits or update the branch first.',
  )
}

const remoteTagsOutput = git(
  ['ls-remote', '--tags', '--refs', remote],
  `Could not inspect tags on ${remote}; no release changes were made`,
)
const remoteTags = new Set(
  remoteTagsOutput
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split(/\s+/)[1]?.replace('refs/tags/', ''))
    .filter(Boolean),
)
const localTags = git(['tag', '--list'], 'Could not inspect local Git tags').split('\n').filter(Boolean)
const localOnlyTags = localTags.filter((tag) => !remoteTags.has(tag))
if (localOnlyTags.length > 0) {
  fail(
    `Local-only tags would also be pushed by bumpp: ${localOnlyTags.join(', ')}. ` +
      'Publish or remove them intentionally before release.',
  )
}

const applicationEntries = await readdir(resolve(repositoryRoot, 'apps'), { withFileTypes: true })
const manifestPaths = [
  resolve(repositoryRoot, 'package.json'),
  ...applicationEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(repositoryRoot, 'apps', entry.name, 'package.json')),
]

const manifests = await Promise.all(
  manifestPaths.map(async (manifestPath) => {
    try {
      const value = JSON.parse(await readFile(manifestPath, 'utf8'))
      return { manifestPath, version: value.version }
    } catch (error) {
      if (error?.code === 'ENOENT') return undefined
      fail(`Could not read ${relative(repositoryRoot, manifestPath)}: ${error.message}`)
    }
  }),
)
const existingManifests = manifests.filter(Boolean)
const rootVersion = existingManifests[0]?.version

if (typeof rootVersion !== 'string' || !rootVersion) {
  fail('Root package.json must declare a non-empty version')
}

const mismatches = existingManifests.filter(({ version }) => version !== rootVersion)
if (mismatches.length > 0) {
  fail(
    `Package versions must match ${rootVersion}: ${mismatches
      .map(({ manifestPath, version }) => `${relative(repositoryRoot, manifestPath)}=${String(version)}`)
      .join(', ')}`,
  )
}

console.log(
  `[release] Preflight passed: ${branch} is clean and synchronized with ${upstream}; ` +
    `${existingManifests.length} package manifest(s) are at ${rootVersion}; no local-only tags exist.`,
)
