import { defineConfig } from 'bumpp'

export default defineConfig({
  all: false,
  commit: 'chore(release): v%s',
  confirm: true,
  ignoreScripts: true,
  noGitCheck: false,
  noVerify: false,
  push: false,
  tag: 'v%s',
})
