import * as React from 'react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'
import { dur, ease } from '@/lib/motion'

/**
 * Vertical collapse / expand container. Replaces the legacy inline
 * `transition: height …, padding …` pattern in `App.tsx` (the
 * `ReadingIndicator` source list strip and `SourcesBlock` toggle).
 *
 * Implementation notes:
 *   - Children are kept mounted at all times and `inert`-ed when
 *     closed. This lets a `ResizeObserver` track the natural inner
 *     height continuously, so the very first expand animates from `0`
 *     to a *known* number — never to the placeholder string `'auto'`,
 *     which forces Motion to perform a synchronous `getBoundingClientRect`
 *     measurement on every toggle (the source of the visible jank when
 *     opening "找到 N 篇知识库资料").
 *   - We animate `height` only (a single composited property). Padding
 *     lives on the inner wrapper as a static style — so it is included
 *     in the measured height but never tweened separately.
 *   - `overflow: hidden` clips the children during the transition so
 *     borders/padding outside the collapse wrapper stay hidden until
 *     the strip has actually grown into existence.
 *
 * @example
 *   <AgCollapse open={hasSources} padding={4} className="border-l px-3">
 *     <SourcesList items={sources} />
 *   </AgCollapse>
 */
export interface AgCollapseProps {
  open: boolean
  /** Vertical padding applied to the inner wrapper, in px. Default `0`. */
  padding?: number
  /** Override transition duration in seconds. Default `dur.base` (250ms). */
  duration?: number
  /** Tailwind classes applied to the *outer* (clipping) container. */
  className?: string
  /** Tailwind classes applied to the *inner* wrapper that holds the content. */
  innerClassName?: string
  /** Disable the transition entirely (e.g. for SSR or first paint). */
  instant?: boolean
  children: React.ReactNode
}

export function AgCollapse({
  open,
  padding = 0,
  duration = dur.base,
  className,
  innerClassName,
  instant = false,
  children,
}: AgCollapseProps) {
  const innerRef = React.useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = React.useState<number>(0)

  // Track the inner wrapper's natural height via ResizeObserver so the
  // outer motion node always has a real number to animate to.
  React.useLayoutEffect(() => {
    const node = innerRef.current
    if (!node) return

    // Pick up the initial height synchronously so the first open
    // doesn't go through a 0 → 0 → real-height jitter frame.
    setContentHeight(node.scrollHeight)

    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      // Prefer `borderBoxSize` (includes padding) so the measurement
      // matches the eventual layout exactly. `contentRect.height`
      // ignores padding which would leave a 1-frame visual gap.
      const next =
        entry.borderBoxSize?.[0]?.blockSize ??
        (entry.target as HTMLElement).getBoundingClientRect().height
      setContentHeight((prev) => (prev === next ? prev : next))
    })
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  return (
    <motion.div
      // `initial={false}` skips the mount animation so the first paint
      // matches the resting state (open or closed) exactly.
      initial={false}
      animate={{ height: open ? contentHeight : 0 }}
      transition={
        instant
          ? { duration: 0 }
          : { duration, ease: ease.out }
      }
      style={{ overflow: 'hidden' }}
      // Children always live in the DOM but are made inert + invisible
      // to assistive tech when collapsed.
      aria-hidden={!open || undefined}
      className={cn(className)}
    >
      <div
        ref={innerRef}
        // Padding is *static* and lives on the inner wrapper, where it
        // contributes to `scrollHeight` and gets measured automatically.
        style={{ paddingTop: padding, paddingBottom: padding }}
        // `inert` disables focus + pointer events on the subtree
        // without removing it from layout — important here because we
        // keep children mounted at all times to avoid first-open
        // measurement jank.
        inert={!open}
        className={cn(innerClassName)}
      >
        {children}
      </div>
    </motion.div>
  )
}
