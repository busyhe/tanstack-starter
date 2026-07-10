# 贡献指南

感谢参与改进 TanStack Starter。请保持变更聚焦、可验证，并避免把项目专属品牌或敏感配置写入通用脚手架。

## 开发环境

- Node.js `>= 22.12.0`
- pnpm `10.27.0`

从仓库根目录初始化：

```bash
corepack enable
pnpm install
pnpm scaffold:init
pnpm dev
```

本地 `apps/www/.env` 不得提交。所有公开环境变量统一在 `apps/www/src/env-schema.ts` 声明并由 Vite 校验，业务代码只从 `env.ts` 读取；新增 `VITE_*` 变量时同步更新 `.env.example` 和 Turborepo 环境变量声明。服务端敏感配置放在运行期环境变量中。

## 开发约定

- 遵循现有 TypeScript strict、ESM、Prettier 和 ESLint 风格。
- 应用内部使用 `@/` 导入 `apps/www/src/*`；共享代码使用 `@workspace/*`。
- 新页面或 API route 放在 `apps/www/src/routes`，不要手动编辑 `routeTree.gen.ts`。
- 可复用 UI 放在 `packages/ui`，应用专用组件放在 `apps/www/src/components`。
- 公共依赖先加入 `pnpm-workspace.yaml` catalog，再以 `"catalog:"` 引用；workspace 依赖使用 `"workspace:*"`。
- 行为变更应补充 Vitest/Testing Library 测试；关键用户流程或 HTTP 契约应补充 Playwright 测试。

## 提交前检查

按影响范围执行检查，跨包或配置改动建议运行完整验证：

```bash
pnpm verify
```

首次运行 E2E 前安装浏览器：

```bash
pnpm --filter www exec playwright install chromium
```

如果环境限制导致某项检查无法执行，请在 Pull Request 中明确说明命令、失败原因和已完成的替代验证。

## 提交与 Pull Request

- 使用 [Conventional Commits](https://www.conventionalcommits.org/)；可运行 `pnpm commit`。
- 不提交 `.env`、构建产物、覆盖率报告、Playwright 报告或编辑器本地配置。
- Pull Request 应说明问题、方案、风险、验证结果；UI 改动附截图，架构或配置改动说明迁移影响。
- 保持单个 Pull Request 目标清晰，不夹带无关格式化或重构。

## 安全问题

疑似漏洞不要公开提交 Issue 或 Pull Request，请按 [`SECURITY.md`](SECURITY.md) 私下报告。
