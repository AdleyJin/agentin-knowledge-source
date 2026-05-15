# Agentin Design System (子站点)

一个独立的文档站,用来预览本仓库使用的全部颜色、字号、圆角、阴影、动效与组件。

## 启动

在仓库根执行:

```bash
npm run dev:ds      # 启动设计系统 dev server (默认 http://localhost:5174)
npm run build:ds    # 打包到 design-system/dist/
```

## 设计目标

- **零重复**:不维护组件副本。所有 UI 与业务组件都直接从 `../src` 真实引用,主项目升级时设计系统页同步更新。
- **零滚动失同步**:Token / 动效参数都从 `../src/styles.css` 与 `../src/lib/motion.ts` 获取。
- **极简范围**:用户在 v0.1 选定的范围只覆盖
  - Token(颜色 / 字号 / 圆角 / 阴影 / 间距)
  - 动效(durations / eases / springs / variants / Ag-* 容器)
  - UI Primitives(shadcn 9 个基础组件)
  - 业务组件(SourceMarker / SourceTypeTag / UserBubble / SourcesBlock / ReadingIndicator / MessageActions)

设计原则、Don't 反例等长篇内容在主仓 `docs/knowledge-source-design-guide.md` 中,设计系统页只引用结论。

## 目录结构

```
design-system/
├── index.html
├── vite.config.ts          # 独立 vite 配置;复用主项目 node_modules
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx             # Sticky 顶栏 + 左锚点导航 + 右主体
    ├── styles.css          # @import "../../src/styles.css" + DS 微样式
    ├── components/
    │   ├── Sidebar.tsx     # 锚点导航 + IntersectionObserver 高亮
    │   ├── Section.tsx     # 通用章节 + #anchor
    │   ├── Preview.tsx     # 组件展示框 (Live + 复制代码)
    │   ├── CodeBlock.tsx   # 复制代码片段
    │   └── CopyToken.tsx   # 点击复制 token 名 + flash
    └── pages/
        ├── OverviewPage.tsx
        ├── ColorsPage.tsx
        ├── TypographyPage.tsx
        ├── ShapePage.tsx
        ├── MotionPage.tsx
        ├── ComponentsPage.tsx
        └── BusinessPage.tsx
```

## Path aliases

| Alias    | 解析到                | 用途                              |
| -------- | ------------------ | ------------------------------- |
| `@/*`    | `../src/*`         | 与主项目保持一致,组件直接复制粘贴可用             |
| `@app/*` | `../src/*`         | DS 自身代码里"显式跨项目引用"使用              |
| `@ds/*`  | `./src/*`          | DS 本地文件之间相互引用                   |
