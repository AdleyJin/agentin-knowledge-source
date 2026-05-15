import * as React from 'react'
import { Bell, ChevronRight, Loader2, Sparkles } from 'lucide-react'

import { Button } from '@app/components/ui/button'
import { Badge } from '@app/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@app/components/ui/tooltip'
import { Skeleton } from '@app/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@app/components/ui/card'
import { Separator } from '@app/components/ui/separator'
import { Input } from '@app/components/ui/input'
import { Label } from '@app/components/ui/label'

import { Section, SubHeading } from '../components/Section'
import { Preview } from '../components/Preview'

export function ComponentsPage() {
  return (
    <Section
      id="components"
      eyebrow="UI Primitives"
      title="通用组件"
      description={
        <>
          基于 shadcn/ui (zinc / new-york) 的最小可用集。每个组件都是
          <strong className="text-[#1a1a1a]">真实运行版本</strong>
          —— 直接从主项目 <code className="text-[12px] bg-[var(--ag-bg)] rounded px-1">src/components/ui</code> 引入。
        </>
      }
    >
      {/* ── Button ─────────────────────────────────────────────── */}
      <SubHeading
        id="cmp-button"
        hint="6 variants × 7 sizes · CVA 驱动"
      >
        Button
      </SubHeading>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Preview
          caption="6 种 variant · 颜色随 shadcn token 自动跟随主题"
          code={`<Button>默认</Button>
<Button variant="secondary">次要</Button>
<Button variant="outline">轮廓</Button>
<Button variant="ghost">幽灵</Button>
<Button variant="destructive">危险</Button>
<Button variant="link">链接</Button>`}
        >
          <div className="flex flex-wrap gap-2">
            <Button>默认</Button>
            <Button variant="secondary">次要</Button>
            <Button variant="outline">轮廓</Button>
            <Button variant="ghost">幽灵</Button>
            <Button variant="destructive">危险</Button>
            <Button variant="link">链接</Button>
          </div>
        </Preview>

        <Preview
          caption="尺寸 · xs → lg + 4 个 icon-only 尺寸"
          code={`<Button size="xs">XS</Button>
<Button size="sm">小</Button>
<Button>中</Button>
<Button size="lg">大</Button>
<Button size="icon-sm"><Bell /></Button>
<Button size="icon"><Bell /></Button>`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs">XS</Button>
            <Button size="sm">小</Button>
            <Button>中</Button>
            <Button size="lg">大</Button>
            <Button size="icon-sm" variant="outline" aria-label="通知">
              <Bell />
            </Button>
            <Button size="icon" variant="outline" aria-label="通知">
              <Bell />
            </Button>
          </div>
        </Preview>

        <Preview
          caption="loading / disabled · 加 icon 自动调字号"
          code={`<Button disabled>已禁用</Button>
<Button>
  <Loader2 className="animate-spin" /> 加载中
</Button>
<Button variant="secondary">
  <Sparkles /> 用 AI 改写
</Button>`}
        >
          <div className="flex flex-wrap gap-2">
            <Button disabled>已禁用</Button>
            <Button>
              <Loader2 className="animate-spin" /> 加载中
            </Button>
            <Button variant="secondary">
              <Sparkles /> 用 AI 改写
            </Button>
          </div>
        </Preview>

        <Preview
          background="dark"
          caption="深色背景上仍保持可读对比"
          code={`<Button>默认 (在深色 bg 上)</Button>`}
        >
          <div className="flex gap-2">
            <Button>默认</Button>
            <Button variant="secondary">次要</Button>
            <Button variant="outline">轮廓</Button>
          </div>
        </Preview>
      </div>

      {/* ── Badge ──────────────────────────────────────────────── */}
      <SubHeading id="cmp-badge" hint="rounded-full · text-xs · CVA 驱动">
        Badge
      </SubHeading>
      <Preview
        caption="6 种 variant"
        code={`<Badge>默认</Badge>
<Badge variant="secondary">次要</Badge>
<Badge variant="outline">轮廓</Badge>
<Badge variant="ghost">幽灵</Badge>
<Badge variant="destructive">危险</Badge>
<Badge variant="link">链接</Badge>`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge>默认</Badge>
          <Badge variant="secondary">次要</Badge>
          <Badge variant="outline">轮廓</Badge>
          <Badge variant="ghost">幽灵</Badge>
          <Badge variant="destructive">危险</Badge>
          <Badge variant="link">链接</Badge>
        </div>
      </Preview>

      {/* ── Tooltip ────────────────────────────────────────────── */}
      <SubHeading id="cmp-tooltip" hint="Radix Tooltip · 120ms 延迟">
        Tooltip
      </SubHeading>
      <Preview
        caption="hover 任意按钮 · 业务里 SourceMarker 的 hover 卡也是它"
        code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">悬停我</Button>
  </TooltipTrigger>
  <TooltipContent>这就是一个 tooltip</TooltipContent>
</Tooltip>`}
      >
        <div className="flex gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">默认 tooltip</Button>
            </TooltipTrigger>
            <TooltipContent>这就是一个 tooltip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="帮助">
                <Bell />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">右侧弹出</TooltipContent>
          </Tooltip>
        </div>
      </Preview>

      {/* ── Skeleton ──────────────────────────────────────────── */}
      <SubHeading id="cmp-skeleton" hint="加载占位 · shimmer 动画">
        Skeleton
      </SubHeading>
      <Preview
        caption="对话场景:头像 + 多行文本"
        code={`<Skeleton className="size-10 rounded-full" />
<Skeleton className="h-4 w-[260px]" />
<Skeleton className="h-4 w-[200px]" />`}
        align="start"
      >
        <div className="flex items-start gap-3 w-full max-w-md">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[40%]" />
          </div>
        </div>
      </Preview>

      {/* ── Card ──────────────────────────────────────────────── */}
      <SubHeading id="cmp-card" hint="标题 + 说明 + 内容 + 操作">
        Card
      </SubHeading>
      <Preview
        caption="shadcn Card · 容器化展示"
        code={`<Card>
  <CardHeader>
    <CardTitle>来源详情</CardTitle>
    <CardDescription>第 1 讲：评价画面优劣的标准</CardDescription>
  </CardHeader>
  <CardContent>
    引用自 00:32:56 — 通过古镇水墨风格作品演示减法原则的应用
  </CardContent>
</Card>`}
        align="start"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>来源详情</CardTitle>
            <CardDescription>第 1 讲：评价画面优劣的标准</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-[#868686] leading-[1.6]">
              引用自 00:32:56 — 通过古镇水墨风格作品,演示减法原则的应用：黑白影调控制、人物位置经营、动态虚化处理。
            </p>
          </CardContent>
        </Card>
      </Preview>

      {/* ── Separator ─────────────────────────────────────────── */}
      <SubHeading id="cmp-separator" hint="水平 / 垂直 分隔线">
        Separator
      </SubHeading>
      <Preview
        caption="既有水平也有垂直版本"
        code={`<div>第一段</div>
<Separator />
<div>第二段</div>

{/* 垂直 */}
<Separator orientation="vertical" />`}
        align="start"
      >
        <div className="w-full max-w-md flex flex-col gap-3 text-[13px] text-[#1a1a1a]">
          <p>这是第一段说明文字。</p>
          <Separator />
          <p>这是第二段说明文字。</p>
          <div className="mt-2 flex h-6 items-center gap-3 text-[12px] text-[#868686]">
            <span>列表 A</span>
            <Separator orientation="vertical" />
            <span>列表 B</span>
            <Separator orientation="vertical" />
            <span>列表 C</span>
          </div>
        </div>
      </Preview>

      {/* ── Input · Label ─────────────────────────────────────── */}
      <SubHeading id="cmp-input" hint="表单基础 · 与 Label 配套">
        Input · Label
      </SubHeading>
      <Preview
        caption="带 label 的输入框 · 焦点 ring 跟随 --ring"
        code={`<Label htmlFor="q">问题</Label>
<Input id="q" placeholder="即时开问" />`}
        align="start"
      >
        <div className="flex flex-col gap-2 w-full max-w-md">
          <Label htmlFor="ds-input">问题</Label>
          <Input id="ds-input" placeholder="即时开问" />
          <p className="mt-1 text-[12px] text-[#bbbbbb]">
            <ChevronRight className="inline size-3 align-text-top" />
            实际项目里输入框是浮在对话上方的,具体见业务组件页。
          </p>
        </div>
      </Preview>
    </Section>
  )
}
