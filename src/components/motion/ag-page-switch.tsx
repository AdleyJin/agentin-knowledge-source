import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/utils'
import { dur, ease, pageVariants } from '@/lib/motion'

/**
 * Forward / back-aware page switcher. Replaces the legacy
 * `.t-page-slide` CSS pattern.
 *
 * The component renders one child at a time keyed by `pageKey`.
 * Direction is auto-detected by the order in which `pageKey` values
 * appear (a higher index than the previous one ⇒ forward, lower ⇒
 * back). You can also force it explicitly via `direction`.
 *
 * @example
 *   <AgPageSwitch pageKey={view}>
 *     {view === 'list' ? <ListView /> : <DetailView />}
 *   </AgPageSwitch>
 */
export interface AgPageSwitchProps {
  /** Stable identifier for the current page. Driving `<AnimatePresence>`. */
  pageKey: string | number
  /** Force direction. Default `auto` infers from the change order of `pageKey`. */
  direction?: 'auto' | 'forward' | 'back'
  className?: string
  /** Optional className on the inner motion node (the "page" itself). */
  pageClassName?: string
  children: React.ReactNode
}

export function AgPageSwitch({
  pageKey,
  direction = 'auto',
  className,
  pageClassName,
  children,
}: AgPageSwitchProps) {
  const previousKeyRef = React.useRef<string | number>(pageKey)
  const previousDirRef = React.useRef<1 | -1>(1)

  const dir: 1 | -1 = React.useMemo(() => {
    if (direction === 'forward') return 1
    if (direction === 'back') return -1
    if (pageKey === previousKeyRef.current) return previousDirRef.current
    const next: 1 | -1 = pageKey > previousKeyRef.current ? 1 : -1
    previousKeyRef.current = pageKey
    previousDirRef.current = next
    return next
  }, [pageKey, direction])

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div
          key={pageKey}
          custom={dir}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: dur.page, ease: ease.out }}
          className={cn(pageClassName)}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
