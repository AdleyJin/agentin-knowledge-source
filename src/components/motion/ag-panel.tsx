import * as React from 'react'
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react'

import { cn } from '@/lib/utils'
import { dur, ease, spring } from '@/lib/motion'

/**
 * Larger surface that slides in along the Y axis with a cross-blur.
 * Replacement for the legacy `.t-panel-slide` CSS class.
 *
 * Use for things like the right-side reading panel, sidebar drawers,
 * or any "section" that reveals beneath an existing layout. For modal
 * dialogs prefer `<DialogContent>` (shadcn) which handles focus traps;
 * for mobile bottom sheets use `<AgSheet>` instead (it has drag).
 *
 * The panel uses a spring on the Y translate for a tactile feel and a
 * tween on opacity/blur so the cross-fade stays predictable.
 *
 * @example
 *   <AgPanel open={show} translateY={120}>…panel body…</AgPanel>
 */
export interface AgPanelProps
  extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'exit'> {
  open: boolean
  /** Y offset (px) the panel enters from / exits to. Default `94`. */
  translateY?: number
  /** Blur radius (px) applied during enter/exit. Default `2`. */
  blur?: number
  children: React.ReactNode
}

export function AgPanel({
  open,
  translateY = 94,
  blur = 2,
  className,
  children,
  ...rest
}: AgPanelProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="ag-panel"
          initial={{
            y: translateY,
            opacity: 0,
            filter: `blur(${blur}px)`,
          }}
          animate={{
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
              y: spring.panel,
              opacity: { duration: dur.slow, ease: ease.out },
              filter: { duration: dur.slow, ease: ease.out },
            },
          }}
          exit={{
            y: translateY,
            opacity: 0,
            filter: `blur(${blur}px)`,
            transition: {
              duration: dur.base,
              ease: ease.out,
            },
          }}
          style={{ willChange: 'transform, opacity, filter' }}
          className={cn(className)}
          {...rest}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
