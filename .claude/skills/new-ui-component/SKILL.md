---
name: new-ui-component
description: 在 packages/ui 新增共享 UI 组件(shadcn/ui 风格)。触发词:新增组件、封装组件、add component、new component、shadcn、@workspace/ui。仅用于可复用组件;应用内一次性组件放 apps/www/src/components。
---

# 新增共享 UI 组件

1. 判断归属:多处复用 → `packages/ui/src/components/<kebab-name>.tsx`;仅 www 用 → `apps/www/src/components/`(不走本 skill 其余步骤)。
2. 按 `button.tsx` 的模式编写:
   - 用 `cva` 定义 variants,导出组件和 `xxxVariants`;
   - `cn`(来自 `@workspace/ui/lib/utils`)合并 className;
   - 支持 `asChild` 时用 `@radix-ui/react-slot` 的 `Slot`;
   - 根元素加 `data-slot="<name>"`;
   - props 类型:`React.ComponentProps<'xxx'> & VariantProps<typeof xxxVariants>`;
   - 函数组件 + 具名导出,不用 default export。
3. 样式只用 Tailwind 工具类和 design tokens(`bg-primary`、`text-muted-foreground` 等,定义在 `packages/ui/src/globals.css`),不写死颜色。
4. 可访问性:图标按钮加 `sr-only` 文本;交互元素保持 `focus-visible` 环(参考 button 的 ring 类)。
5. 新依赖:先在 `pnpm-workspace.yaml` 的 `catalog` 声明,再在 `packages/ui/package.json` 用 `"catalog:"` 引用,跑 `pnpm install`。
6. `packages/ui/package.json` 的 `exports` 已含 `./components/*`,单文件组件无需改;新增子目录或 hooks 时确认对应 export 路径存在。
7. 消费端:`import { Xxx } from '@workspace/ui/components/<kebab-name>'`。
8. 校验:`pnpm --filter @workspace/ui lint && pnpm --filter @workspace/ui check-types`,消费方再跑 `pnpm --filter www check-types`。
