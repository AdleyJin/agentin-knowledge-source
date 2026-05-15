import * as React from 'react'
import { TooltipProvider } from '@app/components/ui/tooltip'

import { Sidebar, type NavItem } from './components/Sidebar'
import { ColorsPage } from './pages/ColorsPage'
import { TypographyPage } from './pages/TypographyPage'
import { ShapePage } from './pages/ShapePage'
import { MotionPage } from './pages/MotionPage'
import { ComponentsPage } from './pages/ComponentsPage'
import { BusinessPage } from './pages/BusinessPage'
import { OverviewPage } from './pages/OverviewPage'

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: '入门',
    items: [{ id: 'overview', label: '概览' }],
  },
  {
    title: '基础',
    items: [
      {
        id: 'colors',
        label: '颜色',
        children: [
          { id: 'colors-ag', label: 'Agentin Tokens' },
          { id: 'colors-shadcn', label: 'shadcn / 状态' },
          { id: 'colors-accent', label: '强调色 #2EE066' },
        ],
      },
      {
        id: 'typography',
        label: '字号 · 字重',
        children: [
          { id: 'typography-scale', label: '字号梯度' },
          { id: 'typography-roles', label: '常用角色' },
        ],
      },
      {
        id: 'shape',
        label: '圆角 · 阴影',
        children: [
          { id: 'shape-radius', label: '圆角' },
          { id: 'shape-shadow', label: '阴影' },
          { id: 'shape-spacing', label: '间距 / 尺寸' },
        ],
      },
    ],
  },
  {
    title: '动效',
    items: [
      {
        id: 'motion',
        label: '动效 Tokens',
        children: [
          { id: 'motion-dur', label: 'Durations' },
          { id: 'motion-ease', label: 'Eases' },
          { id: 'motion-spring', label: 'Springs' },
          { id: 'motion-variants', label: 'Variants 库' },
          { id: 'motion-containers', label: 'Ag-* 容器' },
        ],
      },
    ],
  },
  {
    title: '通用组件',
    items: [
      {
        id: 'components',
        label: 'UI Primitives',
        children: [
          { id: 'cmp-button', label: 'Button' },
          { id: 'cmp-badge', label: 'Badge' },
          { id: 'cmp-tooltip', label: 'Tooltip' },
          { id: 'cmp-skeleton', label: 'Skeleton' },
          { id: 'cmp-card', label: 'Card' },
          { id: 'cmp-separator', label: 'Separator' },
          { id: 'cmp-input', label: 'Input · Label' },
        ],
      },
    ],
  },
  {
    title: '业务组件',
    items: [
      {
        id: 'business',
        label: 'Agentin 业务层',
        children: [
          { id: 'biz-source-marker', label: '行内角标 SourceMarker' },
          { id: 'biz-source-tag', label: '类型标签 SourceTypeTag' },
          { id: 'biz-user-bubble', label: '用户气泡 UserBubble' },
          { id: 'biz-sources-block', label: '来源折叠 SourcesBlock' },
          { id: 'biz-reading', label: '检索 / 阅读 指示器' },
          { id: 'biz-actions', label: '消息操作 MessageActions' },
        ],
      },
    ],
  },
]

export function App() {
  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-svh bg-[var(--ag-bg)] text-[#1a1a1a]">
        <Header />

        <div className="mx-auto max-w-[1320px] px-6">
          <div className="flex gap-10">
            <Sidebar groups={NAV_GROUPS} />
            <main className="flex-1 min-w-0 pt-2 pb-32">
              <OverviewPage />
              <ColorsPage />
              <TypographyPage />
              <ShapePage />
              <MotionPage />
              <ComponentsPage />
              <BusinessPage />

              <Footer />
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

function Header() {
  return (
    <header
      className="sticky top-0 z-40 h-[var(--ds-header-h)] border-b border-[var(--ag-border)] bg-white/85 backdrop-blur"
    >
      <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-6 place-items-center rounded-md bg-[#1a1a1a] text-white text-[12px] font-semibold tracking-tight">
            A
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-semibold tracking-tight">
              Agentin Design System
            </span>
            <span className="hidden sm:inline text-[12px] text-[#868686]">
              · 知识库索引
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[var(--ag-bg)] px-2.5 py-1 text-[11px] text-[#868686]">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            v0.1 · 极简版
          </span>
          <a
            href="../docs/knowledge-source-design-guide.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-7 items-center rounded-md px-2.5 text-[12px] text-[#868686] transition-colors hover:bg-[rgba(26,26,26,0.05)] hover:text-[#1a1a1a]"
          >
            查阅设计指南
          </a>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <div className="mt-24 border-t border-[var(--ag-border)] pt-6 text-center text-[12px] text-[#bbbbbb]">
      Agentin Design System · 极简参考手册 · 任何与
      <span className="mx-1 font-medium text-[#868686]">
        信任感连续体
      </span>
      冲突的设计应被否决
    </div>
  )
}
