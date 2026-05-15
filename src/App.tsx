import * as React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronLeft,
  FileText,
  Folder,
  Monitor,
  PanelRight,
  Paperclip,
  Plus,
  RotateCcw,
  RotateCw,
  Search,
  Settings,
  Signal,
  Smartphone,
  Square,
  Trash2,
  Wifi,
  X,
} from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// Bundled locally so the demo works fully offline (no network calls).
// Vite inlines these as base64 in the single-file build.
import aiTutorAvatar from './assets/ai-tutor-avatar.png'

// Custom SVG icons (live in src/assets/icons, imported as React
// components via vite-plugin-svgr; they honor `currentColor`).
import IconStudents from './assets/icons/icon-students.svg?react'
import IconNewChat from './assets/icons/icon-new-chat.svg?react'
import IconMore from './assets/icons/icon-more.svg?react'

// Shared layer extracted from this file as part of the Motion + Magic UI refactor.
import {
  LightboxHostContext,
  MobileSheetContext,
  type MobileSheetState,
  ViewModeContext,
} from '@/contexts/agentin'
import { SCRIPT, blockEstimatedMs } from '@/data/script'
import { SearchingIndicator, ReadingIndicator } from '@/sections/chat/reading-indicator'
import { SourcesBlock } from '@/sections/chat/sources-block'
import { UserBubble } from '@/sections/chat/user-bubble'
import {
  AssistantMessage,
  type StreamPos,
} from '@/sections/chat/assistant-message'
import { ImageGallery } from '@/sections/chat/image-gallery'
import { MessageActions } from '@/sections/chat/message-actions'
import { MobileCiteSheet, MobileSourcesSheet } from '@/sections/mobile/sheets'

// ────────────────────────────────────────────────────────────────────
// Conversation timeline — phase machine + stream cursor
// ────────────────────────────────────────────────────────────────────

// Conversation timeline:
//   searching  → "正在检索知识库..." shimmer
//   reading    → "正在阅读知识库资料..." + 资料列表预览框
//   streaming  → 阅读资料区直接消失，进入流式输出（此阶段不显示「找到 N 篇」索引区）
//   complete   → 输出完成，追加「找到 N 篇知识库资料」索引区 + disclaimer + 操作按钮
type Phase = 'searching' | 'reading' | 'streaming' | 'complete'

// The full assistant answer (decomposed into typing-aware blocks) lives
// in `@/data/script`. The parent state machine below only needs the
// per-block estimated duration to drive the streaming timeline.

// Tunables: lower SEARCH_MS for snappier demo.
const SEARCH_MS = 3000

// "阅读中" 阶段被拆成四个子步骤，时序由 ReadingIndicator 内部按相同
// 常量驱动 —— 父状态机只需要总长 READ_MS 即可。
//   1) text-start    → 仅展示文案、还没出现资料区
//   2) sources-show  → 资料区展开、逐条入场 + 超过 3 条后滚动
//   3) sources-collapse → 资料区高度收回到 0
//   4) text-end      → 资料区彻底消失、再次只剩文案
const READ_TEXT_START_MS = 100
const READ_SOURCES_DISPLAY_MS = 6000
const READ_SOURCES_COLLAPSE_MS = 400
const READ_TEXT_END_MS = 100
const READ_MS =
  READ_TEXT_START_MS +
  READ_SOURCES_DISPLAY_MS +
  READ_SOURCES_COLLAPSE_MS +
  READ_TEXT_END_MS

// ────────────────────────────────────────────────────────────────────
// App
// ────────────────────────────────────────────────────────────────────

// View switcher: same conversation timeline rendered into either the
// desktop chrome or the iPhone 17 Pro Max device frame. Lifted to the
// app root so the bottom action bar (next to "重新开始") can flip between
// the two without resetting playback state.
type View = 'desktop' | 'mobile'

export default function App() {
  const [view, setView] = useState<View>('desktop')
  const [playKey, setPlayKey] = useState(0)
  const [phase, setPhase] = useState<Phase>('searching')
  const [stream, setStream] = useState<StreamPos>({ blockIdx: 0 })

  // Restart: 检索 → 阅读资料 → 流式输出 → 完成
  // 注意：阅读资料结束后直接进入 streaming，不再有「检索完成」的中间状态，
  // 「找到 N 篇知识库资料」索引区也只在 complete 阶段才出现。
  useEffect(() => {
    setPhase('searching')
    setStream({ blockIdx: 0 })
    const tRead = window.setTimeout(
      () => setPhase('reading'),
      SEARCH_MS,
    )
    const tStream = window.setTimeout(
      () => setPhase('streaming'),
      SEARCH_MS + READ_MS,
    )
    return () => {
      window.clearTimeout(tRead)
      window.clearTimeout(tStream)
    }
  }, [playKey])

  // Stream block-by-block while in `streaming` phase. Each block self-
  // paces via `<TypingAnimation>` inside `<AssistantMessage>`; here we
  // only schedule when to advance the cursor to the *next* block. The
  // per-block duration (`blockEstimatedMs`) is sized slightly longer
  // than the typing animation so it never gets cut off mid-stroke.
  useEffect(() => {
    if (phase !== 'streaming') return

    let blockIdx = 0
    let cancelled = false
    let timer: number | null = null

    const advance = () => {
      if (cancelled) return
      if (blockIdx >= SCRIPT.length) {
        setPhase('complete')
        return
      }
      setStream({ blockIdx })
      const dur = blockEstimatedMs(SCRIPT[blockIdx])
      timer = window.setTimeout(() => {
        blockIdx += 1
        advance()
      }, dur)
    }
    advance()

    return () => {
      cancelled = true
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [phase, playKey])

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-svh bg-[var(--ag-bg)] py-6 sm:py-10 flex items-start justify-center">
        <div className="w-full max-w-[1360px] px-4">
          {view === 'desktop' ? (
            <DesktopWindow phase={phase} stream={stream} playKey={playKey} />
          ) : (
            <MobilePhoneFrame phase={phase} stream={stream} playKey={playKey} />
          )}
          <p className="mt-4 text-center text-[12px] text-[#a0a0a0]">
            Agentin · 知识库索引方案 —
            {view === 'desktop' ? ' 电脑端落地原型' : ' 手机端落地原型'}
          </p>
        </div>

        <RestartBar
          phase={phase}
          view={view}
          onViewChange={setView}
          onRestart={() => setPlayKey((k) => k + 1)}
        />
      </div>
    </TooltipProvider>
  )
}

// ────────────────────────────────────────────────────────────────────
// Desktop window: chrome + sidebar + chat
// ────────────────────────────────────────────────────────────────────

function DesktopWindow({
  phase,
  stream,
  playKey,
}: {
  phase: Phase
  stream: StreamPos
  playKey: number
}) {
  // Host element for in-frame overlays (image lightbox). Sits as the
  // last child so it always paints above the chat. `pointer-events-none`
  // when empty so it doesn't steal clicks; the lightbox itself opts in
  // to `pointer-events-auto` when it mounts.
  const lightboxHostRef = useRef<HTMLDivElement | null>(null)
  return (
    <ViewModeContext.Provider value="desktop">
      <LightboxHostContext.Provider value={lightboxHostRef}>
        <div className="relative rounded-[20px] bg-[var(--ag-bg)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden ring-1 ring-black/5">
          <WindowChrome />
          <div className="px-2 pb-2">
            <div className="bg-white rounded-[12px] border border-[var(--ag-border)] flex h-[700px] overflow-hidden">
              <Sidebar />
              <ChatPanel phase={phase} stream={stream} playKey={playKey} />
            </div>
          </div>
          <div ref={lightboxHostRef} className="pointer-events-none absolute inset-0 z-50" />
        </div>
      </LightboxHostContext.Provider>
    </ViewModeContext.Provider>
  )
}

// ────────────────────────────────────────────────────────────────────
// Window chrome (skeleton): traffic lights + dynamic island + actions
// ────────────────────────────────────────────────────────────────────

function WindowChrome() {
  return (
    <div className="relative h-12 px-4 flex items-center bg-[var(--ag-bg)]">
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-full bg-[#ff5f57] ring-1 ring-black/15" />
        <span className="size-3 rounded-full bg-[#febc2e] ring-1 ring-black/15" />
        <span className="size-3 rounded-full bg-[#28c840] ring-1 ring-black/15" />
      </div>

      <div className="ml-4 flex items-center gap-1.5 text-[#1a1a1a] opacity-70">
        <ArrowLeft className="size-4" />
        <span className="text-[12px]">返回主页</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <button
          aria-label="搜索"
          className="size-9 grid place-items-center rounded-full hover:bg-black/5 transition-colors"
        >
          <Search className="size-[18px] text-[#1a1a1a]" />
        </button>
        <div className="h-9 px-3 pr-4 rounded-full bg-[#1a1a1a] text-white inline-flex items-center gap-1.5">
          <BarChart3 className="size-[14px] text-[#5cd984]" />
          <span className="text-[12px] leading-none">10 节课</span>
        </div>
        <button
          aria-label="新增"
          className="size-9 grid place-items-center rounded-full hover:bg-black/5 transition-colors"
        >
          <Plus className="size-[18px] text-[#1a1a1a]" />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          aria-label="刷新"
          className="size-8 grid place-items-center rounded-md hover:bg-black/5 transition-colors"
        >
          <RotateCw className="size-[15px] text-[#1a1a1a]" />
        </button>
        <button
          aria-label="收起侧边栏"
          className="size-8 grid place-items-center rounded-md hover:bg-black/5 transition-colors"
        >
          <PanelRight className="size-[15px] text-[#1a1a1a]" />
        </button>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Sidebar (skeleton-styled placeholders for the not-in-scope area)
// ────────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="w-[272px] shrink-0 border-r border-[var(--ag-border)] bg-white flex flex-col">
      {/* Sidebar head — mirrors Figma node 45:11619 */}
      <div className="flex items-start justify-between pt-5 pb-4 px-6 shrink-0">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          {/* Avatar: image overflows slightly to match the Figma crop */}
          <div className="relative size-10 rounded-[8px] shrink-0 overflow-hidden">
            <img
              alt=""
              src="https://www.figma.com/api/mcp/asset/009ec04b-acef-42e7-a26c-a6ac4466957b"
              className="absolute w-[110%] h-[115%] left-[-1.87%] top-[-5%] object-cover max-w-none"
            />
          </div>
          {/* Class info */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-[16px] font-semibold text-[#1a1a1a] leading-snug truncate">
              人大附2023级(3)班
            </p>
            <p className="text-[12px] text-[#868686] leading-4 truncate">
              人民大学附属中学
            </p>
          </div>
        </div>
        {/* Expand / switch button */}
        <button
          type="button"
          aria-label="切换班级"
          className="size-6 shrink-0 grid place-items-center rounded-[6px] text-[#868686] hover:bg-black/5 transition-colors"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-4">
        <SidebarSection
          title="课程"
          actions={
            <>
              <SidebarHeaderIcon icon={<Settings className="size-3.5" />} />
              <SidebarHeaderIcon icon={<Plus className="size-3.5" />} />
            </>
          }
          items={[
            '教育研究方案',
            '未来课堂探索之旅',
            '数学思维突破课堂',
            'AI 故事创作工坊',
            '编程启蒙趣味课',
            '高效学习方法训练营',
          ]}
          icon={<Folder className="size-[14px] text-[#868686]" />}
        />

        <SidebarSection
          title="共创"
          actions={
            <>
              <SidebarHeaderIcon icon={<Bell className="size-3.5" />} />
              <SidebarHeaderIcon icon={<Settings className="size-3.5" />} />
              <SidebarHeaderIcon icon={<Plus className="size-3.5" />} />
            </>
          }
          items={[
            '语文学习小组',
            '新页面',
            '古代文学经典与文化价值',
            '研究汉字起源与发展的意义',
            '回收站',
          ]}
          icon={<FileText className="size-[14px] text-[#868686]" />}
          lastIcon={<Trash2 className="size-[14px] text-[#868686]" />}
        />

        {/* AI 应用 — same list cadence as the sections above so it feels
         * like a continuation of the nav, not a separate dock. The
         * single item is currently active (highlighted). */}
        <div>
          <div className="h-6 flex items-center justify-between px-2 mb-1">
            <span className="text-[12px] text-[#bbbbbb] font-medium">
              AI 应用
            </span>
            <div className="flex items-center gap-2">
              <SidebarHeaderIcon icon={<Settings className="size-3.5" />} />
              <SidebarHeaderIcon icon={<Plus className="size-3.5" />} />
            </div>
          </div>
          <ul className="space-y-px">
            <li className="h-9 px-2 rounded-lg bg-[var(--ag-active)] flex items-center gap-1.5">
              <span className="size-5 grid place-items-center">
                <img
                  src={aiTutorAvatar}
                  alt=""
                  className="size-5 rounded-full object-cover"
                />
              </span>
              <span className="text-[14px] text-[#1a1a1a] font-medium truncate">
                AI 助教
              </span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}

function SidebarSection({
  title,
  actions,
  items,
  icon,
  lastIcon,
}: {
  title: string
  actions: React.ReactNode
  items: string[]
  icon: React.ReactNode
  lastIcon?: React.ReactNode
}) {
  return (
    <div>
      <div className="h-6 flex items-center justify-between px-2 mb-1">
        <span className="text-[12px] text-[#bbbbbb] font-medium">{title}</span>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <ul className="space-y-px">
        {items.map((label, i) => {
          const isLast = i === items.length - 1 && lastIcon
          return (
            <li
              key={label}
              className="h-9 px-2 rounded-lg flex items-center gap-1.5 hover:bg-[var(--ag-hover)] transition-colors"
            >
              <span className="size-5 grid place-items-center">
                {isLast ? lastIcon : icon}
              </span>
              <span className="text-[14px] text-[#1a1a1a] truncate">
                {label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SidebarHeaderIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="size-5 grid place-items-center text-[#868686] rounded hover:bg-black/5 transition-colors"
    >
      {icon}
    </button>
  )
}

// ────────────────────────────────────────────────────────────────────
// Chat panel — header / thread / input
// ────────────────────────────────────────────────────────────────────

// Tail-follow threshold: how close to the bottom (in px) we still
// consider the user "pinned". Keep this small so even a tiny scroll up
// immediately releases the lock — prevents jitter from fighting the user.
const PIN_THRESHOLD = 8

function ChatPanel({
  phase,
  stream,
  playKey,
}: {
  phase: Phase
  stream: StreamPos
  playKey: number
}) {
  const threadRef = useRef<HTMLDivElement>(null)
  // `pinned` mirrors "is the user currently looking at the bottom?".
  // Drives both the floating button (only visible when NOT pinned) and
  // the streaming auto-scroll (only follows when pinned). Mirrored to a
  // ref so the streaming effect can read the latest value without
  // re-running on every pin flip.
  const [pinned, setPinned] = useState(true)
  const pinnedRef = useRef(true)
  // Sync helper — updates both ref and state atomically so stream ticks
  // never read a stale ref value during the async render gap.
  const setPinnedSync = (val: boolean) => {
    pinnedRef.current = val
    setPinned(val)
  }

  // Tail-follow during streaming. Must run *before* the browser fires
  // ResizeObserver callbacks for the same DOM growth — otherwise the
  // observer measures `scrollHeight (new) - scrollTop (old) - clientHeight`
  // which is briefly > PIN_THRESHOLD and flips `pinned` to false for
  // one frame, making the scroll-to-bottom button flicker on every
  // streamed token. `useLayoutEffect` runs synchronously between commit
  // and the browser's render step, which is the only place where this
  // ordering is guaranteed.
  useLayoutEffect(() => {
    if (!pinnedRef.current) return
    const el = threadRef.current
    if (!el) return
    // `behavior: 'instant'` overrides the parent's CSS `scroll-behavior`
    // so streaming auto-follow doesn't smooth-animate (which would also
    // keep us "behind" the bottom for several frames per token).
    el.scrollTo({ top: el.scrollHeight, behavior: 'instant' })
  }, [stream, phase])

  // Reset everything when the demo restarts.
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTo({ top: 0 })
    setPinnedSync(true)
  }, [playKey])

  // Single source of truth for `pinned`. Two signals feed it:
  //   - `scroll` events (real user input or our programmatic snap):
  //     measure distance and update.
  //   - `ResizeObserver` (content grew while streaming): when already
  //     pinned, just re-snap to the new bottom synchronously instead
  //     of measuring. Measuring here would race the layout effect above
  //     and cause the same one-frame flicker we're avoiding.
  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    const measureAndSetPin = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      setPinnedSync(distance <= PIN_THRESHOLD)
    }
    measureAndSetPin()
    el.addEventListener('scroll', measureAndSetPin, { passive: true })
    const ro = new ResizeObserver(() => {
      if (pinnedRef.current) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'instant' })
        return
      }
      measureAndSetPin()
    })
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', measureAndSetPin)
      ro.disconnect()
    }
  }, [])

  // Smooth-scroll on manual click — feels intentional vs. the snap used
  // during streaming.
  const scrollToBottom = () => {
    const el = threadRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative flex-1 min-w-0 flex flex-col">
      <ChatHeader />
      <ChatThread ref={threadRef} phase={phase} stream={stream} />
      <ChatInput busy={phase !== 'complete'} />
      <ScrollToBottomButton visible={!pinned} onClick={scrollToBottom} />
    </section>
  )
}

function ChatHeader() {
  return (
    <header className="flex items-center justify-between pl-4 pr-4 pt-5 pb-1 shrink-0">
      <div className="flex items-center gap-2">
        <img
          src={aiTutorAvatar}
          alt=""
          className="size-5 rounded-full object-cover"
        />
        <span className="text-[14px] font-medium text-[#1a1a1a]">AI 助教</span>
      </div>
      <div className="flex items-center gap-1">
        <button className="h-8 px-3 inline-flex items-center gap-1 rounded-lg text-[14px] text-[#1c1f25] hover:bg-black/5 transition-colors">
          <IconStudents className="size-[18px]" />
          <span>学生对话</span>
        </button>
        <button className="h-8 px-3 inline-flex items-center gap-1 rounded-lg text-[14px] text-[#1c1f25] hover:bg-black/5 transition-colors">
          <IconNewChat className="size-[18px]" />
          <span>新建对话</span>
        </button>
        <button
          aria-label="更多"
          className="size-8 grid place-items-center rounded-lg text-[#1a1a1a] hover:bg-black/5 transition-colors"
        >
          <IconMore className="size-[18px]" />
        </button>
      </div>
    </header>
  )
}

// ── Thread ────────────────────────────────────────────────────────

// Bottom buffer inside the scrollable thread. The chat input dock floats
// over the bottom of the panel, so we pad the content so users can always
// scroll the latest line clear of the dock (and so its shadow never sits
// on top of the text).
const THREAD_BOTTOM_PAD = 'pb-[152px]'

const ChatThread = React.forwardRef<
  HTMLDivElement,
  { phase: Phase; stream: StreamPos }
>(function ChatThread({ phase, stream }, ref) {
  // 阶段切换是即时的: ReadingIndicator 内部已经把 text-end 那 100ms
  // 留出来作为"资料收起后的文案停留", 父层不需要再额外加退出动画。
  // 同样, "正在阅读..." → "找到 N 篇..." 之间直接做 in-place 替换,
  // 与用户给的动效顺序一致。
  return (
    <div
      ref={ref}
      className="flex-1 min-h-0 overflow-y-auto px-6"
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[690px] pt-4 flex flex-col gap-4',
          THREAD_BOTTOM_PAD,
        )}
      >
        <UserBubble text="我的班级最近的学习情况如何？" />

        {phase === 'searching' && <SearchingIndicator />}

        {phase === 'reading' && <ReadingIndicator />}

        {(phase === 'streaming' || phase === 'complete') && (
          <AssistantMessage
            phase={phase}
            stream={stream}
            imagesNode={<ImageGallery />}
            actionsNode={<MessageActions />}
          />
        )}
      </div>
    </div>
  )
})

// ── Chat input (floats over the bottom of the thread) ────────────
//
// Pinned to the bottom of ChatPanel with `absolute`, so message
// content can scroll past it. The wrapper has `pointer-events-none`
// (with the input box itself overriding to `pointer-events-auto`) so
// the gradient/shadow region above the box never swallows clicks
// targeted at content underneath.

function ChatInput({ busy }: { busy: boolean }) {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-20 pointer-events-none',
        'pt-10 pb-2 px-6',
      )}
    >
      <div className="relative mx-auto w-full max-w-[690px] pointer-events-auto">
        {/* White mask sized to the dialog (so the right-hand scrollbar
         * stays visible) and starting at the dialog's vertical midpoint
         * — the upper half of the dialog has no extra layer behind it,
         * while the lower half + the disclaimer + the gap to the panel
         * bottom all sit on a solid white backing. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/2 -bottom-2 bg-white"
        />
        <div className="relative rounded-3xl border border-[#e0e0e0] bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.06)] p-3 flex flex-col gap-3">
          <div className="px-2 py-1.5 text-[14px] text-[#bbbbbb] leading-none">
            即时开问
          </div>
          <div className="flex items-center justify-between">
            <button
              aria-label="附件"
              className="size-8 grid place-items-center rounded-full text-[#1a1a1a] hover:bg-black/5 transition-colors"
            >
              <Paperclip className="size-4" />
            </button>

            {busy ? (
              <button
                aria-label="停止"
                className="size-8 grid place-items-center rounded-full bg-[#1a1a1a] text-white hover:bg-black transition-colors"
              >
                <Square className="size-3 fill-white" />
              </button>
            ) : (
              <button
                aria-label="发送"
                // "Un" / empty state from Figma: light grey pill with a
                // muted arrow. Becomes solid black + white arrow once the
                // user starts typing (handled in a future input state).
                className="size-8 grid place-items-center rounded-full bg-black/5 text-[#bbbbbb] hover:bg-black/10 transition-colors"
              >
                <ArrowUp className="size-4" strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>
        <p className="relative mt-2 text-center text-[12px] text-[#868686]">
          15:20 前的内容可问答
        </p>
      </div>
    </div>
  )
}

// ── Scroll-to-bottom button — surfaces when latest content is hidden
// behind the floating input dock. Click snaps the thread back to bottom.
// ────────────────────────────────────────────────────────────────────

function ScrollToBottomButton({
  visible,
  onClick,
}: {
  visible: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="滚动到底部"
      tabIndex={visible ? 0 : -1}
      className={cn(
        'absolute left-1/2 -translate-x-1/2 z-30',
        // Sits just above the input dock; matches the Figma spec
        // (32 × 32 white circle with hairline border + soft shadow).
        'bottom-[140px] size-8 rounded-full',
        'bg-white border border-[var(--ag-border)]',
        'shadow-[0_4px_8px_rgba(0,0,0,0.05)]',
        'grid place-items-center text-[#1a1a1a]',
        'hover:bg-[#fafafa] transition-all duration-200 ease-out',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none',
      )}
    >
      <ArrowDown className="size-4" strokeWidth={1.75} />
    </button>
  )
}

// ────────────────────────────────────────────────────────────────────
// Restart bar (fixed bottom-right) — replays the conversation and lets
// the user flip between the desktop and mobile prototypes.
// ────────────────────────────────────────────────────────────────────

function RestartBar({
  phase,
  view,
  onViewChange,
  onRestart,
}: {
  phase: Phase
  view: View
  onViewChange: (v: View) => void
  onRestart: () => void
}) {
  const status =
    phase === 'searching'
      ? '检索中…'
      : phase === 'reading'
        ? '阅读资料中…'
        : phase === 'streaming'
          ? '答案输出中…'
          : '已完成'
  const playing = phase !== 'complete'

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="rounded-full border border-[var(--ag-border)] bg-white/95 backdrop-blur shadow-[0_8px_28px_rgba(0,0,0,0.08)] flex items-center gap-3 pl-3 pr-1 py-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'size-1.5 rounded-full',
              playing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500',
            )}
          />
          <span className="text-[12px] text-[#868686] tabular-nums">
            {status}
          </span>
        </div>

        {/* Desktop ↔ mobile toggle. Pill segmented control sits to the
         * left of "重新开始" so the two primary controls (switch view /
         * replay) read as a single bottom action bar. */}
        <ViewToggle view={view} onChange={onViewChange} />

        <button
          type="button"
          onClick={onRestart}
          className="h-7 px-3 inline-flex items-center gap-1.5 rounded-full bg-[#1a1a1a] text-white text-[12px] hover:bg-black transition-colors"
        >
          <RotateCcw className="size-3.5" />
          <span>重新开始</span>
        </button>
      </div>
    </div>
  )
}

function ViewToggle({
  view,
  onChange,
}: {
  view: View
  onChange: (v: View) => void
}) {
  return (
    <div className="relative inline-flex items-center h-7 p-0.5 rounded-full bg-[#f2f2f2] text-[#868686]">
      {/* Sliding pill behind the active option for a smooth Apple-style
       * toggle feel. The thumb width matches one of the two equal-sized
       * buttons (h-6 + horizontal padding). */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0.5 bottom-0.5 w-[58px] rounded-full bg-white',
          'shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]',
          'transition-transform duration-200 ease-out',
          view === 'desktop' ? 'translate-x-0' : 'translate-x-[58px]',
        )}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onChange('desktop')}
            aria-pressed={view === 'desktop'}
            className={cn(
              'relative z-10 inline-flex items-center justify-center gap-1 w-[58px] h-6 rounded-full',
              'text-[12px] font-medium transition-colors',
              view === 'desktop' ? 'text-[#1a1a1a]' : 'text-[#868686] hover:text-[#1a1a1a]',
            )}
          >
            <Monitor className="size-3.5" strokeWidth={1.75} />
            <span>电脑</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>切换到电脑端</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onChange('mobile')}
            aria-pressed={view === 'mobile'}
            className={cn(
              'relative z-10 inline-flex items-center justify-center gap-1 w-[58px] h-6 rounded-full',
              'text-[12px] font-medium transition-colors',
              view === 'mobile' ? 'text-[#1a1a1a]' : 'text-[#868686] hover:text-[#1a1a1a]',
            )}
          >
            <Smartphone className="size-3.5" strokeWidth={1.75} />
            <span>手机</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>切换到手机端</TooltipContent>
      </Tooltip>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Mobile prototype — iPhone 17 Pro Max device frame
//
// Same conversation timeline as the desktop window, re-laid for a 375 ×
// 812 viewport and wrapped in a faux titanium phone shell. The shell
// itself is decorative (CSS only — see `.ag-iphone*` in styles.css);
// inside the screen we recreate the iOS chrome (status bar, navigation
// bar, dynamic island, home indicator) at native fidelity so the
// prototype reads as "this is what the phone experience feels like".
// ────────────────────────────────────────────────────────────────────

function MobilePhoneFrame({
  phase,
  stream,
  playKey,
}: {
  phase: Phase
  stream: StreamPos
  playKey: number
}) {
  const lightboxHostRef = useRef<HTMLDivElement | null>(null)
  const [sheet, setSheet] = useState<MobileSheetState>(null)
  const openSheet = (s: NonNullable<MobileSheetState>) => setSheet(s)
  const closeSheet = () => setSheet(null)

  // Persist the last-shown citation index across the close animation
  // so MobileCiteSheet still has a valid `n` to render while it slides
  // back down. Without this the sheet body would blank out the moment
  // `sheet` flips back to `null`.
  const lastCiteN = useRef<number>(1)
  if (sheet?.kind === 'cite') lastCiteN.current = sheet.n

  return (
    <ViewModeContext.Provider value="mobile">
      <LightboxHostContext.Provider value={lightboxHostRef}>
        <MobileSheetContext.Provider value={{ openSheet, closeSheet }}>
          <div className="flex justify-center">
            <div className="ag-iphone">
              <div className="ag-iphone-screen">
                <MobileChatExperience
                  phase={phase}
                  stream={stream}
                  playKey={playKey}
                />
                {/* Dynamic Island + Home indicator sit on top of every layer
                 * inside the screen so they always read as system chrome.
                 * They're decorative — pointer-events-none so they don't
                 * steal clicks from anything underneath. */}
                <div className="ag-iphone-island" />
                <div className="ag-iphone-home" />
                {/* Lightbox host — same pattern as DesktopWindow so image
                 * previews AND bottom sheets are clipped to the phone screen,
                 * not the whole page. z-40 keeps both below the z-50 island
                 * and home indicator so system chrome is always on top. */}
                <div
                  ref={lightboxHostRef}
                  className="pointer-events-none absolute inset-0 z-40"
                />
              </div>
            </div>
          </div>
          {/* Bottom sheets are now always rendered; AgSheet handles the
           * enter / exit animation + drag-to-dismiss based on `open`. */}
          <MobileSourcesSheet
            open={sheet?.kind === 'sources'}
            onClose={closeSheet}
          />
          <MobileCiteSheet
            open={sheet?.kind === 'cite'}
            n={lastCiteN.current}
            onClose={closeSheet}
          />
        </MobileSheetContext.Provider>
      </LightboxHostContext.Provider>
    </ViewModeContext.Provider>
  )
}

function MobileChatExperience({
  phase,
  stream,
  playKey,
}: {
  phase: Phase
  stream: StreamPos
  playKey: number
}) {
  const threadRef = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(true)
  const pinnedRef = useRef(true)
  const setPinnedSync = (val: boolean) => {
    pinnedRef.current = val
    setPinned(val)
  }

  // Tail-follow during streaming — see ChatPanel for the full rationale.
  // Layout effect + instant scroll + ResizeObserver re-pin together
  // eliminate the per-token flicker of the scroll-to-bottom button.
  useLayoutEffect(() => {
    if (!pinnedRef.current) return
    const el = threadRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'instant' })
  }, [stream, phase])

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTo({ top: 0 })
    setPinnedSync(true)
  }, [playKey])

  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    const measureAndSetPin = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      setPinnedSync(distance <= PIN_THRESHOLD)
    }
    measureAndSetPin()
    el.addEventListener('scroll', measureAndSetPin, { passive: true })
    const ro = new ResizeObserver(() => {
      if (pinnedRef.current) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'instant' })
        return
      }
      measureAndSetPin()
    })
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', measureAndSetPin)
      ro.disconnect()
    }
  }, [])

  // 同 ChatThread: ReadingIndicator 内部已自带 text-start / text-end
  // 子步骤, 父层只需根据 phase 直接切换显示哪一段即可。
  const scrollToBottom = () => {
    const el = threadRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative size-full bg-white flex flex-col">
      <MobileStatusBar />
      <MobileNavBar />

      {/* Scrollable conversation. Padding-bottom reserves room for the
       * floating input dock above the home indicator (115 dock + 24
       * indicator + ~24 spacing = ~165). */}
      <div
        ref={threadRef}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <div className="px-6 pt-4 pb-[180px] flex flex-col gap-4">
          <UserBubble text="我的班级最近的学习情况如何？" />

          {phase === 'searching' && <SearchingIndicator />}

          {phase === 'reading' && <ReadingIndicator />}

          {(phase === 'streaming' || phase === 'complete') && (
            <AssistantMessage
              phase={phase}
              stream={stream}
              imagesNode={<ImageGallery />}
              actionsNode={<MessageActions />}
            />
          )}
        </div>
      </div>

      <MobileChatInput busy={phase !== 'complete'} />

      {/* Scroll-to-bottom button — same affordance as desktop, sized for
       * the mobile dock height. */}
      <MobileScrollToBottomButton visible={!pinned} onClick={scrollToBottom} />
    </section>
  )
}

// ── Status bar — clock + signal/wifi/battery glyphs ───────────────

function MobileStatusBar() {
  return (
    <div className="ag-iphone-status">
      <span className="ag-iphone-status-time">9:41</span>
      <span className="ag-iphone-status-icons">
        <Signal className="size-[15px]" strokeWidth={2.5} fill="currentColor" />
        <Wifi className="size-[15px]" strokeWidth={2.5} />
        <BatteryGlyph />
      </span>
    </div>
  )
}

// Battery icon — drawn inline so it can match the iOS rounded shape and
// solid-fill style without pulling another SVG asset. Sized to align
// with the Signal/Wifi glyphs above.
function BatteryGlyph() {
  return (
    <svg
      width="26"
      height="13"
      viewBox="0 0 26 13"
      aria-hidden="true"
      className="text-[#1a1a1a]"
    >
      <rect
        x="0.5"
        y="0.5"
        width="22"
        height="12"
        rx="3.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
      />
      <rect x="2" y="2" width="19" height="9" rx="2" fill="currentColor" />
      <rect x="23.5" y="4" width="1.5" height="5" rx="0.6" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

// ── Navigation bar — back / avatar / "AI 助教" + 3 icon buttons ────

function MobileNavBar() {
  return (
    <header className="h-11 shrink-0 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          aria-label="返回"
          className="size-8 grid place-items-center -ml-2 rounded-lg text-[#1a1a1a] transition-colors"
        >
          <ChevronLeft className="size-5" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={aiTutorAvatar}
            alt=""
            className="size-6 rounded-full object-cover shrink-0"
          />
          <span className="text-[14px] font-medium text-[#1a1a1a] truncate">
            AI 助教
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <MobileNavIcon icon={<IconStudents className="size-[22px] text-[#1a1a1a]" />} label="学生对话" />
        <MobileNavIcon icon={<IconNewChat className="size-[22px] text-[#1a1a1a]" />} label="新建对话" />
        <MobileNavIcon icon={<IconMore className="size-[22px] text-[#1a1a1a]" />} label="更多" />
      </div>
    </header>
  )
}

function MobileNavIcon({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="size-8 grid place-items-center rounded-lg text-[#1a1a1a] transition-colors"
    >
      {icon}
    </button>
  )
}

// ── Mobile chat input dock — floats above the home indicator with a
// white-to-transparent gradient mask so streaming content fades into
// the dock instead of stopping abruptly. ──────────────────────────

function MobileChatInput({ busy }: { busy: boolean }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
      <div className="px-6 pt-10 pb-8 bg-gradient-to-b from-transparent via-white to-white">
        <div className="pointer-events-auto rounded-3xl border border-[#e6e6e6] bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.05)] p-3 flex flex-col gap-2.5">
          <div className="px-2 pt-1 text-[14px] text-[#bbbbbb] leading-none">
            即时开问
          </div>
          <div className="flex items-center justify-between">
            <button
              aria-label="附件"
              className="size-8 grid place-items-center rounded-full text-[#1a1a1a] transition-colors"
            >
              <Paperclip className="size-4" />
            </button>

            {busy ? (
              <button
                aria-label="停止"
                className="size-8 grid place-items-center rounded-full bg-[#1a1a1a] text-white transition-colors"
              >
                <Square className="size-3 fill-white" />
              </button>
            ) : (
              <button
                aria-label="发送"
                className="size-8 grid place-items-center rounded-full bg-black/5 text-[#bbbbbb] transition-colors"
              >
                <ArrowUp className="size-4" strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>
        <p className="pointer-events-auto mt-2 text-center text-[12px] text-[#868686]">
          15:20 前的内容可问答
        </p>
      </div>
    </div>
  )
}

function MobileScrollToBottomButton({
  visible,
  onClick,
}: {
  visible: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="滚动到底部"
      tabIndex={visible ? 0 : -1}
      className={cn(
        'absolute left-1/2 -translate-x-1/2 z-30',
        'bottom-[176px] size-8 rounded-full',
        'bg-white border border-[var(--ag-border)]',
        'shadow-[0_4px_8px_rgba(0,0,0,0.05)]',
        'grid place-items-center text-[#1a1a1a]',
        'transition-all duration-200 ease-out',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none',
      )}
    >
      <ArrowDown className="size-4" strokeWidth={1.75} />
    </button>
  )
}

