# www

仓库中的 TanStack Start 主应用，提供基于文件的路由、SSR、TanStack Query 数据预取、共享 UI、主题切换、健康检查和生产安全响应头。

## 技术栈

- TanStack Start + TanStack Router + TanStack Query
- React 19、Vite 8、Tailwind CSS 4
- `@workspace/ui` 共享组件和主题
- TypeScript 7.0（strict mode）
- Vitest + Testing Library + jsdom + V8 Coverage
- Playwright 端到端测试

## 环境要求

- Node.js `>= 22.12.0`
- pnpm `10.27.0`

## 快速开始

请从 Monorepo 根目录执行：

```bash
pnpm install
pnpm scaffold:init
pnpm --filter www dev
```

开发服务器默认地址为 [http://localhost:3000](http://localhost:3000)。也可以用根命令 `pnpm dev` 启动 Turborepo 开发任务。

## 应用命令

以下命令均从仓库根目录执行：

| 命令                              | 说明                              |
| --------------------------------- | --------------------------------- |
| `pnpm --filter www dev`           | 在 `3000` 端口启动开发服务        |
| `pnpm --filter www build`         | 构建 Nitro node-server 产物       |
| `pnpm --filter www start`         | 运行 `.output` 中的生产服务       |
| `pnpm --filter www preview`       | 使用 Vite 预览构建                |
| `pnpm --filter www lint`          | 运行应用 ESLint                   |
| `pnpm --filter www check-types`   | 运行应用类型检查                  |
| `pnpm --filter www test`          | 运行 Vitest                       |
| `pnpm --filter www test:coverage` | 运行测试并检查 V8 覆盖率阈值      |
| `pnpm --filter www test:e2e`      | 运行 Playwright；需要已有生产构建 |

根命令 `pnpm test:e2e` 会通过 Turborepo 先构建应用。首次使用 Playwright 前运行：

```bash
pnpm --filter www exec playwright install chromium
```

## 环境变量

### 客户端/构建期

变量示例位于 [`.env.example`](.env.example)，解析规则位于 `src/env-schema.ts`。所有 `VITE_*` 值都会进入客户端产物，不能用于保存密钥。`VITE_SITE_URL` 在生产构建中必填，在开发模式中可省略。

| 变量                    | 用途                                            |
| ----------------------- | ----------------------------------------------- |
| `VITE_SITE_URL`         | 站点 URL；用于 canonical、Open Graph 和 sitemap |
| `VITE_GA_ID`            | GA4 Measurement ID；留空时禁用 Analytics        |
| `VITE_SITE_NAME`        | 站点名称                                        |
| `VITE_SITE_DESCRIPTION` | 站点描述                                        |
| `VITE_SITE_AUTHOR`      | 作者或组织名称                                  |
| `VITE_HOMEPAGE_URL`     | 作者或组织主页                                  |
| `VITE_GITHUB_URL`       | 项目 GitHub 地址                                |
| `VITE_TWITTER_HANDLE`   | X/Twitter 用户名，可带或不带 `@`                |

`pnpm scaffold:init` 会交互式生成本地 `apps/www/.env`，并同步 [`public/manifest.json`](public/manifest.json) 的名称和描述；`.env` 不应提交，PWA 图标仍需在 `public/` 中手动替换。

### 仅服务端/运行期

`NODE_ENV`、`APP_VERSION` 和 `LOG_LEVEL` 由 `src/env.server.ts` 校验，只在服务端读取。`APP_VERSION` 会出现在健康检查中；`LOG_LEVEL` 支持 `debug`、`info`、`warn`、`error`。监听地址和端口可通过 `HOST`、`PORT` 配置。

## 项目结构

```text
src/
├── routes/              # 文件路由和 API routes
├── components/          # 应用级组件、主题和 Analytics
├── config/site.ts       # 由环境变量派生的站点配置
├── config/sitemap.ts    # 公开、可索引页面清单
├── lib/api/             # 查询契约、queryOptions 和服务端函数
├── env.ts               # 客户端环境变量入口
├── env.server.ts        # 仅服务端环境变量入口
├── router.tsx           # Router、QueryClient 和 SSR Query 集成
├── start.ts             # 请求中间件、安全头和结构化日志
├── routeTree.gen.ts     # 自动生成，禁止手动编辑
└── styles.css           # Tailwind 与应用主题入口
```

应用内源码只使用 `@/` 别名指向 `src/*`：

```ts
import { siteConfig } from '@/config/site'
import { healthQueryOptions } from '@/lib/api/health'
```

共享 UI 使用 `@workspace/ui/components/*`，工具函数使用 `@workspace/ui/lib/*`。不存在 `#/*` 应用别名。

## 路由与数据获取

- 页面和 API route 放在 `src/routes`，使用 TanStack Router 文件路由约定。
- 每个公开页面通过 `createSeo` 声明自己的 canonical，并同步 `src/config/sitemap.ts`；API route 不加入 sitemap。
- 共享请求契约放在 `src/lib/api`，优先导出 `queryOptions` factory。
- SSR loader 使用 `queryClient.ensureQueryData(...)` 预取；组件复用同一 factory，避免缓存 key 和请求逻辑分叉。
- `src/routeTree.gen.ts` 由构建工具生成，禁止手动编辑。

健康检查接口均返回 `Cache-Control: no-store`：

- `/api/health`：基础状态与版本
- `/api/health/live`：存活探针
- `/api/health/ready`：就绪探针及依赖检查结果

## 安全策略

生产模式通过请求中间件添加 nonce CSP 和常用安全头；开发模式为 Vite HMR 放宽 CSP。HSTS 仅在生产环境且请求被识别为 HTTPS 时返回。使用 TLS 终止代理/CDN 时，应正确传递原始协议或在可信边缘层设置 HSTS。

## Monorepo 约定

- 公共依赖版本先加入根 [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) catalog，再在应用中使用 `"catalog:"`。
- 应用内部使用 `@/`；跨包依赖使用 `workspace:*`。
- 共享组件放在 [`packages/ui`](../../packages/ui)，应用一次性组件放在 `src/components`。
- 完整开发、测试、部署与发布说明见[根 README](../../README.md)。

## 治理文件

- [贡献指南](../../CONTRIBUTING.md)
- [安全策略](../../SECURITY.md)
- [MIT License](../../LICENSE)
