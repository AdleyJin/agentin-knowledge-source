import * as React from 'react'
import { motion } from 'motion/react'

import { AgCollapse } from '@/components/motion'
import { dur, ease, spring } from '@/lib/motion'
import { SourceTypeIcon } from '@/components/agentin/source-type-icon'
import { SOURCES } from '@/data/sources'

/**
 * "正在检索知识库..." — first-stage shimmer indicator.
 *
 * Wrapper geometry mirrors `<SourcesBlock>` exactly (`mt-1 flex
 * flex-col gap-2`) so the slot doesn't jump in height when the shimmer
 * is replaced by "找到 N 篇知识库资料". A plain block wrapper would put
 * the inline-block child inside a line box that inherits a larger
 * line-height (~24px) from the thread, leaving a few pixels of bottom
 * slack the SourcesBlock flex layout doesn't have.
 */
export function SearchingIndicator() {
  return (
    <div className="mt-1 flex flex-col gap-2">
      <span className="ag-shimmer-text self-start text-[12px] leading-[18px] font-normal tracking-wide">
        正在检索知识库...
      </span>
    </div>
  )
}

/** Compact tag used inside `ReadingIndicator` rows — per Figma 102:12620. */
function ReadingSourceTag({ type }: { type: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-[2px] rounded-[4px] bg-[#f5f5f5] pl-[2px] pr-[4px] py-[2px]">
      <SourceTypeIcon
        type={type}
        className="size-[18px] text-[#868686]"
        wrapperClassName="w-[18px]"
      />
      <span className="text-[10px] leading-none text-[#868686] whitespace-nowrap">
        {type}
      </span>
    </span>
  )
}

// Reading sub-step machine:
//   text-start       → 100ms 纯文案,资料区还没出现
//   sources-show     → 资料区展开 + 逐条入场,超过 MAX_VISIBLE 后向上滚动
//   sources-collapse → 资料区高度回到 0(动画收起)
//   text-end         → 100ms 纯文案,资料区彻底从布局消失
type ReadingStep =
  | 'text-start'
  | 'sources-show'
  | 'sources-collapse'
  | 'text-end'

// Phase timings (kept in sync with App.tsx — these used to live there
// as module-level constants, but only `READ_MS` is consumed externally
// so the sub-timings are colocated here now).
const READ_TEXT_START_MS = 100
const READ_SOURCES_DISPLAY_MS = 6000

const MAX_VISIBLE = 3

/**
 * "正在阅读知识库资料..." — second-stage shimmer + animated sources strip.
 *
 * Replaces the legacy inline `transition: height …, padding …` style
 * (`App.tsx:869`) with `<AgCollapse>` (height/padding) plus a Motion
 * spring on the inner translate (replaces `transition: transform …`
 * at `App.tsx:877`).
 */
export function ReadingIndicator() {
  const [step, setStep] = React.useState<ReadingStep>('text-start')
  const [visibleCount, setVisibleCount] = React.useState(0)

  React.useEffect(() => {
    const timers: number[] = []

    timers.push(
      window.setTimeout(() => {
        setStep('sources-show')
        setVisibleCount(1)
        const interval = Math.floor(READ_SOURCES_DISPLAY_MS / SOURCES.length)
        for (let i = 1; i < SOURCES.length; i++) {
          timers.push(
            window.setTimeout(() => {
              setVisibleCount(i + 1)
            }, interval * i),
          )
        }
      }, READ_TEXT_START_MS),
    )

    timers.push(
      window.setTimeout(() => {
        setStep('sources-collapse')
      }, READ_TEXT_START_MS + READ_SOURCES_DISPLAY_MS),
    )

    timers.push(
      window.setTimeout(() => {
        setStep('text-end')
      }, READ_TEXT_START_MS + READ_SOURCES_DISPLAY_MS + 400),
    )

    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [])

  // Row height = icon 18px + tag py-[2px]*2 (4px) = 22px; gap-2 (8px).
  const ITEM_H = 22
  const GAP_H = 8
  const overflowCount = Math.max(0, visibleCount - MAX_VISIBLE)
  const translateY = -(overflowCount * (ITEM_H + GAP_H))
  // Cap the visible list to MAX_VISIBLE rows. Without this the inner
  // `motion.div` keeps growing past 3 items (it still renders 4–6 to
  // animate them in/out) so `AgCollapse` measures the full height and
  // the left border drawn on its outer container ends up extending
  // below the last visible row — the "leaked" line segment in Figma.
  const MAX_VISIBLE_H = MAX_VISIBLE * ITEM_H + (MAX_VISIBLE - 1) * GAP_H

  // The strip is "open" only during sources-show; AgCollapse handles
  // height + padding tweening cleanly on both edges.
  const open = step === 'sources-show'

  return (
    <div className="mt-1 flex flex-col gap-2">
      <span className="ag-shimmer-text self-start text-[12px] leading-[18px] font-normal tracking-wide">
        正在阅读知识库资料...
      </span>

      {/* Left-border strip per Figma 102:12620 — height + padding
       * collapse together, replacing the old hand-rolled transition. */}
      <AgCollapse
        open={open}
        padding={4}
        duration={open ? 0.5 : 0.15}
        className="border-l border-[#f4f4f4] px-3"
      >
        {/* Clip to MAX_VISIBLE rows so AgCollapse's measured height —
         * and therefore the left border — never grows past 3 rows. */}
        <div style={{ maxHeight: MAX_VISIBLE_H, overflow: 'hidden' }}>
          {/* Inner list slides upward when items exceed MAX_VISIBLE. */}
          <motion.div
            className="flex flex-col gap-2"
            animate={{ y: translateY }}
            transition={{
              // Gentler spring than spring.layout (260/30) — lower stiffness
              // and damping give a slower, more deliberate scroll that reads
              // as "the agent is actually working through each source".
              type: 'spring',
              stiffness: 140,
              damping: 22,
              // Tween fallback for reduced-motion.
              duration: dur.slow,
              ease: ease.out,
            }}
          >
            {SOURCES.slice(0, visibleCount).map((src, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <ReadingSourceTag type={src.type} />
                <span className="truncate text-[12px] text-[#868686]">
                  {src.title}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </AgCollapse>
    </div>
  )
}
