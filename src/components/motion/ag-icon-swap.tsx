import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/utils'
import { dur, ease } from '@/lib/motion'

/**
 * Crossfade two (or more) icons by `state` key, with a small scale +
 * blur to soften the transition. Replaces the legacy `.t-icon-swap` /
 * `.t-icon[data-icon=*]` CSS pattern.
 *
 * @example
 *   <AgIconSwap state={isOpen ? 'open' : 'closed'}>
 *     {isOpen ? <ChevronUp /> : <ChevronDown />}
 *   </AgIconSwap>
 *
 * Pass a stable identifier as `state` — anytime it changes, the inner
 * children animate out and the new ones animate in via `mode="popLayout"`
 * so the wrapper does not collapse.
 */
export interface AgIconSwapProps {
  /** Identity of the current icon. Use any stable value (string/number). */
  state: string | number
  className?: string
  /** Blur applied to the outgoing icon, in px. Default `2`. */
  blur?: number
  /** Initial scale of the incoming icon. Default `0.6`. */
  startScale?: number
  /** Width / height of the swap area. Defaults to `1em` so it follows font size. */
  size?: number | string
  children: React.ReactNode
}

export function AgIconSwap({
  state,
  className,
  blur = 2,
  startScale = 0.6,
  size = '1em',
  children,
}: AgIconSwapProps) {
  return (
    <span
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, scale: startScale, filter: `blur(${blur}px)` }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: startScale, filter: `blur(${blur}px)` }}
          transition={{ duration: dur.fast, ease: ease.inOut }}
          className="col-start-1 row-start-1 inline-flex items-center justify-center"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
