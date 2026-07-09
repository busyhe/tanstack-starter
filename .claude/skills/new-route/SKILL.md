---
name: new-route
description: 在 apps/www 新增页面路由或 API route(TanStack Router 文件路由)。触发词:新增页面、新建路由、add page、new route、API 接口、api route、createFileRoute。仅适用于 apps/www 的路由,不用于共享 UI 组件。
---

# 新增路由(页面 / API)

## 页面路由

1. 在 `apps/www/src/routes/` 创建文件,扁平点号命名:`about.tsx` → `/about`,`blog.index.tsx` → `/blog`,`blog.$slug.tsx` → `/blog/:slug`。
2. 模板(参考 `src/routes/index.tsx`):

   ```tsx
   import { createFileRoute } from '@tanstack/react-router'

   export const Route = createFileRoute('/about')({ component: AboutPage })

   function AboutPage() {
     return <main>...</main>
   }
   ```

3. 需要数据时:在 `src/lib/api/<name>.ts` 导出 `queryOptions` factory(含响应类型),组件用 `useQuery(xxxQueryOptions())`;需要 SSR/预加载时在 route `loader` 中 `queryClient.ensureQueryData(xxxQueryOptions())`(router.tsx 的 ssr-query 集成会自动脱水/复水)。参考 `src/lib/api/health.ts`。
4. 布局复用 `SiteHeader` / `SiteFooter`(`@/components/*`),样式用现有 design tokens。

## API route

在 `apps/www/src/routes/` 创建 `api.<name>.tsx`,用 `server.handlers`(参考 `api.health.tsx`):

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/example')({
  server: {
    handlers: {
      GET: () => Response.json({ ok: true }),
    },
  },
})
```

## 注意与校验

- `src/routeTree.gen.ts` 由 dev/build 自动生成,禁止手动编辑;类型报错找不到新路由时先跑 `pnpm --filter www dev` 或 `build` 触发生成。
- 完成后运行:`pnpm --filter www lint && pnpm --filter www check-types`,有逻辑时补 `*.test.tsx` 并跑 `pnpm --filter www test`。
