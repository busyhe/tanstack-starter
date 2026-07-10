import { execFileSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
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

function toGitPath(path) {
  return relative(repositoryRoot, path).split(sep).join('/')
}

const branch = git(['branch', '--show-current'], 'Could not determine the current Git branch')
if (branch !== releaseBranch)
  fail(`Release commit must remain on ${releaseBranch}; current branch is ${branch || 'detached'}`)

const status = git(['status', '--porcelain'], 'Could not inspect the Git working tree')
if (status) fail('Git working tree changed after bumpp; refusing to push')

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

git(
  ['fetch', '--quiet', '--tags', remote],
  `Could not refresh ${remote}; the local release commit and Tag were not pushed`,
)

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
      fail(`Could not read ${toGitPath(manifestPath)}: ${error.message}`)
    }
  }),
)
const existingManifests = manifests.filter(Boolean)
const version = existingManifests[0]?.version
if (typeof version !== 'string' || !version) fail('Root package.json must declare a non-empty version')

const mismatches = existingManifests.filter((manifest) => manifest.version !== version)
if (mismatches.length > 0) {
  fail(
    `Package versions must match ${version}: ${mismatches
      .map(({ manifestPath, version: manifestVersion }) => `${toGitPath(manifestPath)}=${String(manifestVersion)}`)
      .join(', ')}`,
  )
}

const releaseCommit = git(['rev-parse', 'HEAD'], 'Could not resolve the release commit')
const releaseParent = git(['rev-parse', 'HEAD^'], 'Release commit must have one parent')
const upstreamHead = git(['rev-parse', '@{upstream}'], `Could not resolve ${upstream}`)
if (releaseParent !== upstreamHead) {
  fail(
    `The release commit must be the only commit ahead of ${upstream}. ` +
      'The remote may have advanced; the local release commit and Tag were not pushed.',
  )
}

const expectedCommitMessage = `chore(release): v${version}`
const commitMessage = git(['log', '-1', '--format=%s'], 'Could not inspect the release commit message')
if (commitMessage !== expectedCommitMessage) {
  fail(`Expected release commit "${expectedCommitMessage}", received "${commitMessage}"`)
}

const expectedFiles = existingManifests.map(({ manifestPath }) => toGitPath(manifestPath)).sort()
const changedFiles = git(
  ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'],
  'Could not inspect the release commit files',
)
  .split('\n')
  .filter(Boolean)
  .sort()
if (JSON.stringify(changedFiles) !== JSON.stringify(expectedFiles)) {
  fail(
    `Release commit must contain only version manifests. Expected [${expectedFiles.join(', ')}], received [${changedFiles.join(', ')}]`,
  )
}

const tagName = `v${version}`
const tagRef = `refs/tags/${tagName}`
const tagType = git(['cat-file', '-t', tagRef], `Expected annotated release Tag ${tagName}`)
if (tagType !== 'tag') fail(`Release Tag ${tagName} must be annotated`)
const taggedCommit = git(['rev-list', '-n', '1', tagRef], `Could not resolve release Tag ${tagName}`)
if (taggedCommit !== releaseCommit) fail(`Release Tag ${tagName} must point to the release commit`)

const remoteTagsOutput = git(
  ['ls-remote', '--tags', '--refs', remote],
  `Could not inspect tags on ${remote}; the local release commit and Tag were not pushed`,
)
const remoteTags = new Set(
  remoteTagsOutput
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split(/\s+/)[1]?.replace('refs/tags/', ''))
    .filter(Boolean),
)
if (remoteTags.has(tagName)) fail(`Remote Tag ${tagName} already exists; nothing was pushed`)

const localTags = git(['tag', '--list'], 'Could not inspect local Git tags').split('\n').filter(Boolean)
const localOnlyTags = localTags.filter((tag) => !remoteTags.has(tag))
if (localOnlyTags.length !== 1 || localOnlyTags[0] !== tagName) {
  fail(`Only ${tagName} may be local-only before push; found: ${localOnlyTags.join(', ') || 'none'}`)
}

console.log(`[release] Atomically pushing ${branch} and ${tagName} to ${remote}.`)
try {
  execFileSync('git', ['push', '--atomic', remote, `HEAD:${mergeRef}`, `${tagRef}:${tagRef}`], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  })
} catch {
  fail(
    `Atomic push failed; neither ${mergeRef} nor ${tagName} should have changed remotely. ` +
      'Resolve the error and rerun `node scripts/release-push.mjs` without running bumpp again.',
  )
}

console.log(`[release] Published ${tagName}; the remote release workflow can now verify and create the GitHub Release.`)
