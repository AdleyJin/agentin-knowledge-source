import * as React from 'react'
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react'

import { cn } from '@/lib/utils'
import { badgePopVariants, dur, ease } from '@/lib/motion'

/**
 * Notification-style "pop in" marker with an optional diagonal slide.
 * Replaces the legacy `.t-badge` / `.t-badge-dot` CSS pattern.
 *
 * The wrapper is `position: absolute` and anchors to the top-right of
 * its (relatively-positioned) trigger by default. Pass `offset` to nudge
 * it, or override with `className`.
 *
 * Composition:
 *   - Outer `<motion.span>` slides from `slideFromX/Y` to `(0, 0)` on
 *     mount, mimicking the original "drops onto the bell" feel.
 *   - Inner `<motion.span>` handles scale/opacity/blur via
 *     `badgePopVariants` (a spring) so the dot itself pops.
 *
 * @example
 *   <button className="relative">
 *     <Bell />
 *     <AgBadgePop open={hasUnread}>
 *       <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">
 *         {unreadCount}
 *       </span>
 *     </AgBadgePop>
 *   </button>
 */
export interface AgBadgePopProps
  extends Omit<HTMLMotionProps<'span'>, 'variants' | 'initial' | 'animate' | 'exit'> {
  open: boolean
  /** Tailwind override for the outer wrapper's positioning. */
  className?: string
  /** Diagonal slide-in from `(slideFromX, slideFromY)` (px). Default `(-8, 12)`. */
  slideFromX?: number
  slideFromY?: number
  children: React.ReactNode
}

export function AgBadgePop({
  open,
  slideFromX = -8,
  slideFromY = 12,
  className,
  children,
  ...rest
}: AgBadgePopProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.span
          key="ag-badge-slide"
          initial={{ x: slideFromX, y: slideFromY }}
          animate={{ x: 0, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur.base, ease: ease.out }}
          className={cn(
            'pointer-events-none absolute -top-1.5 -right-2',
            className,
          )}
          {...rest}
        >
          <motion.span
            variants={badgePopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="block origin-center"
          >
            {children}
          </motion.span>
        </motion.span>
      )}
    </AnimatePresence>
  )
}
