import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ChevronDown, ChevronUp, Play, RotateCcw } from 'lucide-react'

import { dur, ease, spring } from '@app/lib/motion'
import {
  AgFade,
  AgCollapse,
  AgIconSwap,
  AgBadgePop,
  AgPanel,
  AgPageSwitch,
} from '@app/components/motion'
import { cn } from '@app/lib/utils'

import { Section, SubHeading } from '../components/Section'
import { CopyToken } from '../components/CopyToken'

export function MotionPage() {
  return (
    <Section
      id="motion"
      eyebrow="Motion"
      title="动效 Tokens"
      description={
        <>
          所有动效都从
          <CopyToken value="@/lib/motion" />
          取数,绝不硬编码
          <code className="rounded bg-[var(--ag-bg)] px-1 text-[12px]">
            duration: 0.4
          </code>
          这种字面量。
        </>
      }
    >
      <DurationsBlock />
      <EasesBlock />
      <SpringsBlock />
      <VariantsBlock />
      <ContainersBlock />
    </Section>
  )
}

// ── Durations ────────────────────────────────────────────────────────

function DurationsBlock() {
  const items: { token: keyof typeof dur; ms: number; usage: string }[] = [
    { token: 'fast', ms: dur.fast * 1000, usage: '退场 / 关闭 / 状态收回' },
    { token: 'base', ms: dur.base * 1000, usage: '入场 / 展开 / 大多数情况' },
    { token: 'slow', ms: dur.slow * 1000, usage: '强调入场(图片 lightbox)' },
    { token: 'page', ms: dur.page * 1000, usage: '页面切换 · 接近瞬时' },
  ]

  return (
    <>
      <SubHeading id="motion-dur" hint="单位:秒(motion 原生)">
        Durations
      </SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((d) => (
          <PlayCard
            key={d.token}
            label={`dur.${d.token}`}
            sub={`${d.ms}ms`}
            usage={d.usage}
            renderDemo={(playing) => (
              <motion.div
                key={String(playing)}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: playing ? 0 : -40, opacity: playing ? 1 : 0 }}
                transition={{ duration: d.ms / 1000, ease: ease.out }}
                className="size-10 rounded-full bg-[#1a1a1a]"
              />
            )}
            copy={`dur.${d.token}`}
          />
        ))}
      </div>
    </>
  )
}

// ── Eases ────────────────────────────────────────────────────────────

function EasesBlock() {
  const items: {
    token: keyof typeof ease
    bezier: [number, number, number, number]
    usage: string
  }[] = [
    {
      token: 'out',
      bezier: ease.out as [number, number, number, number],
      usage: '入场首选 · 单调减速,无过冲',
    },
    {
      token: 'inOut',
      bezier: ease.inOut as [number, number, number, number],
      usage: '状态切换 · 方向不明显时',
    },
    {
      token: 'bounce',
      bezier: ease.bounce as [number, number, number, number],
      usage: '小元素 pop · 数字 / 徽章',
    },
    {
      token: 'swiftIn',
      bezier: ease.swiftIn as [number, number, number, number],
      usage: '退场加速 · sheet 关闭',
    },
  ]

  return (
    <>
      <SubHeading id="motion-ease" hint="cubic-bezier(p1x, p1y, p2x, p2y)">
        Eases
      </SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((e) => (
          <PlayCard
            key={e.token}
            label={`ease.${e.token}`}
            sub={`[${e.bezier.join(', ')}]`}
            usage={e.usage}
            renderDemo={(playing) => (
              <div className="relative h-12 w-full">
                <motion.div
                  key={String(playing)}
                  initial={{ x: 0 }}
                  animate={{ x: playing ? 'calc(100% - 40px)' : 0 }}
                  transition={{ duration: 0.7, ease: e.bezier }}
                  className="absolute top-1/2 -translate-y-1/2 size-10 rounded-full bg-[#1a1a1a]"
                />
              </div>
            )}
            copy={`ease.${e.token}`}
          />
        ))}
      </div>
    </>
  )
}

// ── Springs ──────────────────────────────────────────────────────────

function SpringsBlock() {
  const items = [
    {
      key: 'pop',
      label: 'spring.pop',
      sub: 'stiffness 420, damping 26',
      usage: '徽章 / icon swap / 数字',
      transition: spring.pop,
    },
    {
      key: 'panel',
      label: 'spring.panel',
      sub: 'stiffness 280, damping 32',
      usage: 'Panel / Card · 较大表面',
      transition: spring.panel,
    },
    {
      key: 'sheet',
      label: 'spring.sheet',
      sub: 'stiffness 500, damping 42',
      usage: 'iOS 式 bottom sheet',
      transition: spring.sheet,
    },
    {
      key: 'layout',
      label: 'spring.layout',
      sub: 'stiffness 260, damping 30',
      usage: 'FLIP 布局重排',
      transition: spring.layout,
    },
  ]
  return (
    <>
      <SubHeading id="motion-spring" hint="必须复用,不要 ad-hoc 新 spring">
        Springs
      </SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((s) => (
          <PlayCard
            key={s.key}
            label={s.label}
            sub={s.sub}
            usage={s.usage}
            copy={s.label}
            renderDemo={(playing) => (
              <motion.div
                key={String(playing)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: playing ? 1 : 0, opacity: playing ? 1 : 0 }}
                transition={s.transition}
                className="size-12 rounded-xl bg-[#1a1a1a] grid place-items-center text-white text-[10px]"
              >
                spring
              </motion.div>
            )}
          />
        ))}
      </div>
    </>
  )
}

// ── Variants library ─────────────────────────────────────────────────

function VariantsBlock() {
  const items = [
    {
      name: 'fadeVariants',
      usage: 'AgFade · 默认 Y 轴入场',
      code: `<AgFade open={open}>\n  <Card />\n</AgFade>`,
    },
    {
      name: 'modalVariants',
      usage: 'Dialog / Lightbox 缩放',
      code: `<motion.div variants={modalVariants}\n  initial="hidden" animate="visible" exit="exit" />`,
    },
    {
      name: 'dropdownVariants',
      usage: 'Origin-aware 弹层',
      code: `style={{ transformOrigin: originToCSS(origin) }}`,
    },
    {
      name: 'pageVariants',
      usage: '方向感页面切换 (仅 L1/L2)',
      code: `<motion.div custom={dir} variants={pageVariants} />`,
    },
    {
      name: 'badgePopVariants',
      usage: 'AgBadgePop · 小徽章弹入',
      code: `<AgBadgePop open={hasUnread}>...</AgBadgePop>`,
    },
    {
      name: 'sheetVariants',
      usage: 'AgSheet · 底部抽屉',
      code: `<AgSheet open={open} onClose={...} height={172}>`,
    },
    {
      name: 'staggerParent / staggerChild',
      usage: '列表错峰入场',
      code: `<motion.ul variants={staggerParent()}>`,
    },
  ]

  return (
    <>
      <SubHeading id="motion-variants" hint="src/lib/motion.ts">
        Variants 库
      </SubHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((v) => (
          <div
            key={v.name}
            className="rounded-[12px] border border-[var(--ag-border)] bg-white p-4"
          >
            <div className="flex items-baseline justify-between">
              <code className="text-[13px] font-mono text-[#1a1a1a]">
                {v.name}
              </code>
              <CopyToken value={v.name} className="text-[11px] text-[#868686]" />
            </div>
            <p className="mt-1 text-[12px] text-[#868686]">{v.usage}</p>
            <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--ag-bg)] px-3 py-2 font-mono text-[11.5px] leading-[1.55] text-[#1a1a1a]">
              {v.code}
            </pre>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Ag-* containers (live demos) ─────────────────────────────────────

function ContainersBlock() {
  return (
    <>
      <SubHeading id="motion-containers" hint="开箱即用的 motion 容器">
        Ag-* 容器
      </SubHeading>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AgFadeDemo />
        <AgCollapseDemo />
        <AgIconSwapDemo />
        <AgBadgePopDemo />
        <AgPanelDemo />
        <AgPageSwitchDemo />
      </div>
    </>
  )
}

function ContainerCard({
  title,
  usage,
  children,
  control,
}: {
  title: string
  usage: string
  children: React.ReactNode
  control: React.ReactNode
}) {
  return (
    <div className="rounded-[12px] border border-[var(--ag-border)] bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ag-border)]">
        <div>
          <p className="text-[13px] font-medium text-[#1a1a1a]">{title}</p>
          <p className="text-[11.5px] text-[#868686]">{usage}</p>
        </div>
        {control}
      </div>
      <div className="bg-[var(--ag-bg)] p-6 min-h-[120px] flex items-center justify-center overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function AgFadeDemo() {
  const [open, setOpen] = React.useState(true)
  return (
    <ContainerCard
      title="<AgFade>"
      usage="open 控制的 Y 轴 fade · direction up/down"
      control={<TogglePill value={open} onChange={setOpen} />}
    >
      <AgFade open={open}>
        <div className="rounded-xl bg-white border border-[var(--ag-border)] px-5 py-4 text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          一个 fade 进入 / 退出的卡片
        </div>
      </AgFade>
    </ContainerCard>
  )
}

function AgCollapseDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <ContainerCard
      title="<AgCollapse>"
      usage="高度展开 / 收起 · 内置 ResizeObserver 测量"
      control={<TogglePill value={open} onChange={setOpen} />}
    >
      <div className="w-full max-w-[320px]">
        <AgCollapse open={open} padding={8} className="border-l border-[var(--ag-border)] px-3">
          <ol className="flex flex-col gap-2 text-[13px] text-[#1a1a1a]">
            <li>1 · 第 1 讲：评价画面优劣的标准</li>
            <li>2 · 古代文学经典与文化价值</li>
            <li>3 · 第 10 讲：拍摄角度对摄影画质的影响</li>
            <li>4 · 第 12 讲：正面角度</li>
          </ol>
        </AgCollapse>
        <p className="mt-2 text-[11.5px] text-[#868686]">
          {open ? '已展开' : '已收起'}
        </p>
      </div>
    </ContainerCard>
  )
}

function AgIconSwapDemo() {
  const [up, setUp] = React.useState(false)
  return (
    <ContainerCard
      title="<AgIconSwap>"
      usage="状态变化时图标 crossfade · scale + blur"
      control={
        <button
          onClick={() => setUp((v) => !v)}
          className="inline-flex h-7 items-center gap-1 rounded-md bg-[var(--ag-bg)] px-2.5 text-[12px] hover:bg-[var(--ag-hover)]"
        >
          <RotateCcw className="size-3" /> 切换
        </button>
      }
    >
      <button className="inline-flex items-center gap-2 rounded-lg bg-white border border-[var(--ag-border)] px-4 py-2 text-[13px] hover:bg-[rgba(26,26,26,0.04)]">
        找到 6 篇知识库资料
        <AgIconSwap state={up ? 'up' : 'down'} size={14}>
          {up ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </AgIconSwap>
      </button>
    </ContainerCard>
  )
}

function AgBadgePopDemo() {
  const [open, setOpen] = React.useState(true)
  return (
    <ContainerCard
      title="<AgBadgePop>"
      usage="徽章入场 spring + 滑动 · 反复点击试试"
      control={<TogglePill value={open} onChange={setOpen} />}
    >
      <button className="relative grid size-10 place-items-center rounded-full bg-white border border-[var(--ag-border)]">
        <span className="text-[18px]">🔔</span>
        <AgBadgePop open={open}>
          <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#2EE066] px-1 text-[10px] font-medium text-[#1a1a1a]">
            3
          </span>
        </AgBadgePop>
      </button>
    </ContainerCard>
  )
}

function AgPanelDemo() {
  const [open, setOpen] = React.useState(true)
  return (
    <ContainerCard
      title="<AgPanel>"
      usage="较大表面 Y 轴滑入 + 模糊"
      control={<TogglePill value={open} onChange={setOpen} />}
    >
      <div className="relative h-[140px] w-[260px]">
        <AgPanel open={open}>
          <div className="absolute inset-0 rounded-xl bg-white border border-[var(--ag-border)] p-4 text-[13px] text-[#1a1a1a] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <p className="font-medium">右侧来源面板</p>
            <p className="mt-1 text-[12px] text-[#868686]">
              桌面端的抽屉式来源面板就是用这个容器实现的。
            </p>
          </div>
        </AgPanel>
      </div>
    </ContainerCard>
  )
}

function AgPageSwitchDemo() {
  const [page, setPage] = React.useState(0)
  const labels = ['第 1 屏', '第 2 屏', '第 3 屏']
  return (
    <ContainerCard
      title="<AgPageSwitch>"
      usage="带方向感的页面切换 · forward/back 自动推断"
      control={
        <div className="inline-flex h-7 items-center rounded-md bg-[var(--ag-bg)] p-0.5 text-[12px]">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-2 hover:text-[#1a1a1a] text-[#868686] disabled:opacity-30"
            disabled={page === 0}
          >
            ←
          </button>
          <span className="px-1 font-mono text-[#1a1a1a]">{page + 1}/3</span>
          <button
            onClick={() => setPage((p) => Math.min(2, p + 1))}
            className="px-2 hover:text-[#1a1a1a] text-[#868686] disabled:opacity-30"
            disabled={page === 2}
          >
            →
          </button>
        </div>
      }
    >
      <div className="w-[260px]">
        <AgPageSwitch pageKey={page}>
          <div className="rounded-xl bg-white border border-[var(--ag-border)] px-5 py-6 text-center text-[14px] font-medium text-[#1a1a1a] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            {labels[page]}
          </div>
        </AgPageSwitch>
      </div>
    </ContainerCard>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────

function TogglePill({
  value,
  onChange,
}: {
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        'relative inline-flex h-6 w-10 items-center rounded-full transition-colors',
        value ? 'bg-[#1a1a1a]' : 'bg-[var(--ag-border)]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform',
          value ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

/**
 * Tap-to-play demo card. The internal `playing` flag flips momentarily
 * when the user clicks Play, runs the animation, and resets so the
 * next click re-fires it. Honors `prefers-reduced-motion`.
 */
function PlayCard({
  label,
  sub,
  usage,
  renderDemo,
  copy,
}: {
  label: string
  sub: string
  usage: string
  renderDemo: (playing: boolean) => React.ReactNode
  copy?: string
}) {
  const reduced = useReducedMotion()
  const [playing, setPlaying] = React.useState(false)
  // `key` increments on each play so motion remounts the demo node.
  const [key, setKey] = React.useState(0)

  const onPlay = () => {
    if (reduced) return
    setKey((k) => k + 1)
    setPlaying(false)
    requestAnimationFrame(() => setPlaying(true))
  }

  return (
    <div className="rounded-[12px] border border-[var(--ag-border)] bg-white overflow-hidden">
      <div className="bg-[var(--ag-bg)] px-5 py-7 grid place-items-center min-h-[100px]">
        <div key={key}>{renderDemo(playing)}</div>
      </div>
      <div className="border-t border-[var(--ag-border)] px-4 py-3">
        <div className="flex items-baseline justify-between">
          <code className="text-[12.5px] font-mono text-[#1a1a1a]">{label}</code>
          {copy && <CopyToken value={copy} className="text-[11px] text-[#868686]" />}
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-[#868686]">{sub}</p>
        <p className="mt-1 text-[11.5px] text-[#868686]">{usage}</p>
        <button
          type="button"
          onClick={onPlay}
          className="mt-2 inline-flex h-7 items-center gap-1 rounded-md bg-[#1a1a1a] px-2.5 text-[12px] text-white hover:bg-black"
        >
          <Play className="size-3" /> 播放
        </button>
      </div>
    </div>
  )
}
