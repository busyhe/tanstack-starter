# AGENTS.md

本文件为在本仓库中工作的 AI 编码代理提供项目级指引,适用于整个仓库(子目录如有更近的 `AGENTS.md` 则以其为准)。回复用户时优先使用中文。

## 项目概览

pnpm + Turborepo monorepo,基于 TanStack Start。

| 位置                                                   | 说明                                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `apps/www`                                             | 主应用:React 19、TanStack Router/Query/Start、Vite 8、Tailwind CSS 4、Nitro                                       |
| `packages/ui`                                          | 共享 UI 库(shadcn/ui 风格),导出 `@workspace/ui/components/*`、`lib/*`、`hooks/*`、`globals.css`、`postcss.config` |
| `packages/eslint-config`、`packages/typescript-config` | 内部共享配置包                                                                                                    |
| `scripts/clean.mjs`                                    | `pnpm clean`,递归删除 `node_modules`、`dist`、`.turbo` 等,使用前确认确有必要                                      |

## 基本要求

- Node.js `>=22.12.0`;包管理器固定为 `pnpm@10.27.0`,禁止用 npm/yarn/bun 改写锁文件。
- monorepo 命令从仓库根目录运行;单包操作用 `pnpm --filter <name> <script>`(如 `pnpm --filter www test`、`pnpm --filter @workspace/ui lint`)。
- 遵循现有代码风格:TypeScript 严格模式、ESM,格式由 Prettier 决定(单引号、无分号)。

## 常用命令(根目录)

```bash
pnpm install        # 安装依赖
pnpm dev            # 开发(www 跑在 3000 端口)
pnpm build          # 构建
pnpm lint           # ESLint(--max-warnings 0)
pnpm check-types    # tsc --noEmit
pnpm test           # Vitest
pnpm format         # Prettier 格式化仓库内所有受支持文件
pnpm commit         # czg 交互式提交
pnpm release        # bumpp 发版(通常无需代理执行)
```

## Git 工作流

- 提交信息遵循 Conventional Commits(commitlint 校验)。
- lefthook 钩子:pre-commit 检查 Prettier + `pnpm lint`,pre-push 跑 `pnpm check-types`。格式检查失败时先运行 `pnpm format`,提交失败时先看钩子输出。

## 目录与文件约定(apps/www)

- `src/routes`:TanStack Router 文件路由,新页面/API route 放这里,用 `createFileRoute`;API route 用扁平点号命名(如 `api.health.tsx`)。新增公开页面需用 `src/lib/seo.ts` 声明 canonical,并同步 `src/config/sitemap.ts`;API route 不加入 sitemap。
- `src/routeTree.gen.ts`:自动生成,禁止手动编辑。
- `src/router.tsx`:QueryClient、路由创建和 SSR query 集成。
- `src/lib/api/*`:共享数据获取,优先导出 `queryOptions` factory,在组件或 loader 中复用。
- `src/config/site.ts`:站点级配置。
- `src/env-schema.ts` / `src/env.ts`:所有 `VITE_*` 环境变量必须在 schema 中用 zod 声明,由 Vite 配置在启动/构建前校验,业务代码只从 `env.ts` 读取。`VITE_SITE_URL` 生产构建必填;新增变量同步更新 `.env.example` 和 `turbo.json` 对应任务的 `env`。不要提交真实 `.env` 文件。
- `src/styles.css`:只导入共享全局样式并定义应用级 theme 扩展;Tailwind tokens 和 shadcn/ui 主题变量在 `packages/ui/src/globals.css`。

## 导入约定

- `apps/www` 内部用 `@/` 别名导入 `src/*`(唯一别名,勿引入其他)。
- 共享组件:`@workspace/ui/components/*`;共享工具:`@workspace/ui/lib/*`(如 `cn`);共享 hooks:`@workspace/ui/hooks/*`。
- 新增可复用 UI 放 `packages/ui/src/components`,确认 `packages/ui/package.json` 的 `exports` 已覆盖对应路径。

## UI 与样式

- 优先复用 `@workspace/ui` 现有组件和 `cn` 工具。
- 用 Tailwind CSS 4 工具类和现有 design tokens:`bg-background`、`text-foreground`、`border-border`、`text-muted-foreground` 等。
- 图标用 `lucide-react`;图标按钮需 `sr-only` 文本或明确的 accessible name。
- 暗色模式由 `theme-provider.tsx`、`mode-switcher.tsx` 和 `__root.tsx` 中的初始化脚本共同维护,修改时注意首屏主题闪烁和 localStorage 同步。

## 依赖管理

- 依赖版本由 `pnpm-workspace.yaml` 的 `catalog` 统一管理:新增公共依赖先在 catalog 声明版本,再在 package 中用 `"catalog:"` 引用。
- workspace 内部依赖用 `"workspace:*"`。
- 修改依赖后运行 `pnpm install` 更新 `pnpm-lock.yaml`。

## 测试与校验

- 涉及应用逻辑或组件行为时补充 Vitest + Testing Library 测试,测试文件与源码同目录(`*.test.{ts,tsx}`)。
- 测试环境为 jsdom,配置见 `apps/www/vitest.config.ts` 和 `vitest.setup.ts`。
- 改动后按影响范围校验:
  - 仅 `apps/www`:`pnpm --filter www lint && pnpm --filter www check-types`,必要时加 `test`。
  - 共享包:对应包的 lint/check-types,再考虑根目录 `pnpm test` 或 `pnpm build`。
  - 跨包或配置:根目录 `pnpm lint`、`pnpm check-types`、`pnpm test`,必要时 `pnpm build`。

## 禁止手动编辑

`node_modules`、`.turbo`、`dist`、`apps/www/.output`、`apps/www/.nitro`、`apps/www/.tanstack`、`apps/www/src/routeTree.gen.ts`,以及本地环境文件(`.env`、`.env.local`、`*.local`)。

## AI 辅助文件

- `CLAUDE.md`(根目录及 `packages/ui/`)只有一行 `@AGENTS.md`,让 Claude Code 复用本文件,不要往里写内容。
- 子目录约定写在就近的 `AGENTS.md`(如 `packages/ui/AGENTS.md`)。
- Skills 单一来源在 `.claude/skills/`(`new-route`、`new-ui-component`),`.agents/skills` 是指向它的软链供 Codex 读取;修改 skill 只改 `.claude/skills/` 下的 SKILL.md。
- `.claude/settings.json` 预授权了常用 pnpm 命令,并禁止编辑 `routeTree.gen.ts`、`pnpm-lock.yaml` 和读取 `.env*` 本地文件。

## 工作方式

- 先读相关代码和配置再改;保持变更聚焦,不做无关重构;不覆盖用户未要求修改的本地改动。
- 修改生成配置、路由、环境变量或包导出后,优先跑类型检查。
- 命令因缺依赖或环境变量失败时,在最终说明中列出未完成的校验及原因。
