# TanStack Starter

一个面向生产环境的 [TanStack Start](https://tanstack.com/start) 全栈应用脚手架，使用 pnpm + Turborepo 管理 Monorepo。内置 SSR 数据预取、共享 UI、类型安全环境变量、健康检查、安全响应头、单元测试、覆盖率和端到端测试。

架构审计、问题清单、关键决策、验证记录和后续路线图见
[`docs/architecture-hardening.md`](docs/architecture-hardening.md)。

## 技术栈

- **应用框架**：[TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) + [TanStack Query](https://tanstack.com/query)
- **前端**：React 19、Vite 8、Tailwind CSS 4、shadcn/ui 风格组件
- **语言**：TypeScript 7.0（strict mode）
- **工程化**：pnpm 10、Turborepo、ESLint 9、Prettier、Lefthook、Commitlint
- **测试**：Vitest、Testing Library、V8 Coverage、Playwright
- **服务端**：TanStack Start + Nitro node-server

## 项目结构

```text
tanstack-starter/
├── apps/
│   └── www/                    # TanStack Start 主应用
├── packages/
│   ├── ui/                     # 共享 UI 组件与主题
│   ├── eslint-config/          # 共享 ESLint 配置
│   └── typescript-config/      # 共享 TypeScript 配置
├── scripts/                    # 初始化、清理等工程脚本
├── .github/workflows/          # CI、发布和供应链检查
├── turbo.json                  # Turborepo 任务配置
└── pnpm-workspace.yaml         # workspace 与依赖 catalog
```

## 环境要求

- Node.js `>= 22.12.0`
- pnpm `10.27.0`（由根 `packageManager` 字段锁定）

建议通过 Corepack 使用项目指定的 pnpm：

```bash
corepack enable
pnpm install
```

## 快速开始

从仓库根目录执行：

```bash
# 交互式生成 apps/www/.env
pnpm scaffold:init

# 启动开发服务器：http://localhost:3000
pnpm dev
```

也可以从示例文件手动创建本地配置：

```bash
cp apps/www/.env.example apps/www/.env
```

`apps/www/.env` 属于本地文件，不要提交到版本库。初始化脚本默认不会覆盖已有文件；确需重建时使用 `pnpm scaffold:init --force`。

## 环境变量

### 构建期公开变量

所有 `VITE_*` 变量都会进入客户端产物，**不得存放密钥、令牌或其他敏感信息**。它们在 Vite 启动/构建时由 `apps/www/src/env-schema.ts` 统一校验；只有 `VITE_SITE_URL` 在生产构建中必填，其余变量均可省略。

| 变量                    | 生产必填 | 用途                                                |
| ----------------------- | -------- | --------------------------------------------------- |
| `VITE_SITE_URL`         | 是       | 站点公开 URL，用于 canonical、Open Graph 和 sitemap |
| `VITE_GA_ID`            | 否       | GA4 Measurement ID；留空则不加载 Analytics          |
| `VITE_SITE_NAME`        | 否       | 站点名称                                            |
| `VITE_SITE_DESCRIPTION` | 否       | 站点描述                                            |
| `VITE_SITE_AUTHOR`      | 否       | 作者或组织名称                                      |
| `VITE_HOMEPAGE_URL`     | 否       | 作者或组织主页（HTTP/HTTPS URL）                    |
| `VITE_GITHUB_URL`       | 否       | 项目 GitHub 地址（HTTP/HTTPS URL）                  |
| `VITE_TWITTER_HANDLE`   | 否       | X/Twitter 用户名，可带或不带 `@`                    |

完整示例见 [`apps/www/.env.example`](apps/www/.env.example)。初始化脚本会同步 [`apps/www/public/manifest.json`](apps/www/public/manifest.json) 的名称和描述；图标仍需在同目录手动替换。

### 运行期服务端变量

以下变量只在服务端读取，不会进入客户端包：

| 变量          | 默认值        | 用途                                  |
| ------------- | ------------- | ------------------------------------- |
| `NODE_ENV`    | `development` | 运行模式；`pnpm start` 会设为生产模式 |
| `APP_VERSION` | `development` | 健康检查返回的部署版本                |
| `LOG_LEVEL`   | `info`        | `debug`、`info`、`warn` 或 `error`    |
| `HOST`        | 运行时默认值  | 服务监听地址                          |
| `PORT`        | `3000`        | 服务监听端口                          |

## 常用命令

| 命令                      | 说明                                                |
| ------------------------- | --------------------------------------------------- |
| `pnpm dev`                | 启动开发模式                                        |
| `pnpm build`              | 构建所有应用与包                                    |
| `pnpm start`              | 运行已构建的生产服务                                |
| `pnpm lint`               | 运行根目录及各 workspace 的 ESLint                  |
| `pnpm check-types`        | 执行 TypeScript 类型检查                            |
| `pnpm test`               | 运行 Vitest                                         |
| `pnpm test:coverage`      | 运行单元测试并检查覆盖率阈值                        |
| `pnpm test:e2e`           | 构建并运行 Playwright 端到端测试                    |
| `pnpm format`             | 使用 Prettier 格式化仓库                            |
| `pnpm format:check`       | 检查格式但不修改文件                                |
| `pnpm verify`             | 依次检查格式、Lint、类型、覆盖率、构建和 E2E        |
| `pnpm clean -- --dry-run` | 预览清理目标                                        |
| `pnpm clean`              | 清理依赖和构建产物；执行前先使用 `--dry-run`        |
| `pnpm commit`             | 交互式创建 Conventional Commit                      |
| `pnpm release`            | 先执行 `verify`，再交互式更新版本；不自动提交或推送 |

首次运行端到端测试前安装 Chromium：

```bash
pnpm --filter www exec playwright install chromium
pnpm test:e2e
```

## 构建与运行

```bash
VITE_SITE_URL=https://example.com pnpm build
APP_VERSION=local pnpm start
```

默认监听 `3000` 端口。应用提供以下不缓存的探针：

- `GET /api/health`：应用状态和版本
- `GET /api/health/live`：存活探针，适合容器进程检查
- `GET /api/health/ready`：就绪探针，适合流量接入检查

## Docker

Docker 生产构建要求显式传入公开站点 URL：

```bash
docker build \
  --build-arg VITE_SITE_URL=https://example.com \
  --build-arg VITE_GA_ID=G-XXXXXXXXXX \
  --build-arg APP_VERSION="$(git rev-parse --short HEAD)" \
  -t tanstack-starter .

docker run --rm -p 3000:3000 tanstack-starter
```

`VITE_GA_ID`、其他品牌类 `VITE_*` 参数和 `APP_VERSION` 均可省略。Dockerfile 已为 `.env.example` 中的公开变量声明对应构建参数；不要把敏感 `.env` 复制进镜像。

## 安全与部署注意事项

- 生产响应使用每请求 nonce 的 CSP，并设置 `Permissions-Policy`、`Referrer-Policy`、`X-Content-Type-Options` 和 `X-Frame-Options`。开发模式为支持 HMR 会放宽脚本和样式策略。
- HSTS 仅在生产环境且应用识别到 HTTPS 请求时发送。若 TLS 在反向代理或 CDN 终止，请确保应用能够识别原始协议，或直接在可信边缘层配置 HSTS。
- 请求日志为结构化 JSON，并通过 `X-Request-ID` 关联。不要在日志或公开环境变量中写入敏感数据。
- 依赖漏洞通过 CI 中的 OSV Scanner 检查；依赖与 GitHub Actions 更新由 Dependabot 管理。

安全问题请按 [`SECURITY.md`](SECURITY.md) 私下报告。

## 发布流程

`pnpm release` 会先执行完整的 `pnpm verify`，然后通过 bumpp 更新版本号。它**不会**自动创建提交、Tag 或推送：

1. 在干净工作区运行 `pnpm release` 并选择版本。
2. 审查版本变更，再创建 Conventional Commit。
3. 确认提交已进入 `main`，手动创建与根 `package.json` 版本完全一致的 `v<version>` Tag，并推送提交与 Tag。
4. `v*` Tag 会触发发布工作流；工作流再次执行验证和 Docker 冒烟测试，通过后创建 GitHub Release。

## 贡献与许可

- 贡献指南：[`CONTRIBUTING.md`](CONTRIBUTING.md)
- 安全策略：[`SECURITY.md`](SECURITY.md)
- 许可证：[`LICENSE`](LICENSE)（MIT）
