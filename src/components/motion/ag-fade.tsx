import * as React from 'react'
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react'

import { cn } from '@/lib/utils'
import { fadeVariants } from '@/lib/motion'

/**
 * State-driven fade + slight Y translate. Replacement for the legacy
 * `.ag-slide-down` / `.ag-slide-up` CSS keyframe pair.
 *
 * Unlike `<BlurFade>` (which fires on in-view), `<AgFade>` mounts and
 * unmounts based on the explicit `open` prop and animates through
 * `<AnimatePresence>` so exits are honored even when React unmounts the
 * subtree.
 *
 * @example
 *   <AgFade open={showCard} direction="down">
 *     <ReadingCard />
 *   </AgFade>
 */
export interface AgFadeProps
  extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'exit'> {
  /** Controls mount / unmount. */
  open: boolean
  /** Slide direction the element enters from. Default `"down"` (enters from above). */
  direction?: 'up' | 'down'
  /** Translate distance in px. Default `8`. */
  distance?: number
  /** Optional `key` forwarded to the inner motion node so callers can force a remount. */
  itemKey?: React.Key
  children: React.ReactNode
}

export function AgFade({
  open,
  direction = 'down',
  distance = 8,
  itemKey,
  className,
  children,
  ...rest
}: AgFadeProps) {
  const variants = React.useMemo(
    () => fadeVariants(direction, distance),
    [direction, distance],
  )

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key={itemKey ?? 'ag-fade'}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(className)}
          {...rest}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
