# packages/ui — AGENTS.md

共享 UI 包专属约定,补充仓库根 `AGENTS.md`。

## 组件编写模式(以 `src/components/button.tsx` 为准)

- 文件:`src/components/<kebab-name>.tsx`,一个文件一个组件族。
- 用 `cva` 定义 variants,同时导出组件和 `xxxVariants`;具名导出,不用 default export。
- className 一律经 `cn`(`@workspace/ui/lib/utils`)合并,并把 `className` prop 放进 `cn(...)` 最后。
- 支持 `asChild` 用 `@radix-ui/react-slot` 的 `Slot`;根元素加 `data-slot="<name>"`。
- props 类型:`React.ComponentProps<'元素'> & VariantProps<typeof xxxVariants>`。
- 只用 Tailwind 工具类 + `src/globals.css` 中的 design tokens,禁止硬编码颜色;保留 `focus-visible` ring 与 `aria-invalid` 样式约定。

## 包级约束

- 本包不含应用逻辑、路由和数据获取;那些放 `apps/www`。
- `react`/`react-dom` 是 peerDependencies,不要加进 dependencies。
- 新依赖走根 `pnpm-workspace.yaml` catalog。
- 新增导出路径(子目录、hooks)时同步更新 `package.json` 的 `exports`。
- 校验:`pnpm --filter @workspace/ui lint && pnpm --filter @workspace/ui check-types`。
