import * as React from 'react'
import {
  AnimatePresence,
  motion,
  type PanInfo,
  type HTMLMotionProps,
} from 'motion/react'

import { cn } from '@/lib/utils'
import { dur, ease, scrimVariants, sheetVariants, spring } from '@/lib/motion'

/**
 * iOS-style bottom sheet. Replaces the legacy `.ag-sheet-panel` /
 * `.ag-sheet-scrim` CSS animations *and* adds drag-to-dismiss out of
 * the box.
 *
 * `<AgSheet>` is intentionally **render-only** — it does not portal.
 * Wrap it in `createPortal(...)` at the call site if you need to escape
 * a parent's stacking context (the existing mobile demo portals into
 * `LightboxHostContext` so the sheet only covers the desktop window).
 *
 * Behaviour:
 *   - Scrim fades in/out and is tap-to-dismiss.
 *   - Panel springs up from `translateY(100%)` to `translateY(0)`.
 *   - Vertical drag is enabled on the panel; releasing past
 *     `dragCloseThreshold` (px) OR with downward velocity above
 *     `dragVelocityThreshold` (px/s) triggers `onClose`.
 *
 * @example
 *   <AgSheet open={open} onClose={close} height={464}>
 *     <SourcesList />
 *   </AgSheet>
 */
export interface AgSheetProps extends Omit<HTMLMotionProps<'div'>, 'drag'> {
  open: boolean
  onClose: () => void
  /** Sheet height in px. */
  height: number
  /** Panel border radius. Default `16` (px, top corners only). */
  radius?: number
  /** Drag distance past which release closes the sheet. Default `80px`. */
  dragCloseThreshold?: number
  /** Downward velocity past which release closes the sheet. Default `500 px/s`. */
  dragVelocityThreshold?: number
  /** Disable drag-to-dismiss (keeps tap-on-scrim close). */
  disableDrag?: boolean
  /** Tailwind classes for the scrim. Default is a black 50% overlay. */
  scrimClassName?: string
  /** Panel background. Default `bg-white`. */
  panelClassName?: string
  children: React.ReactNode
}

export function AgSheet({
  open,
  onClose,
  height,
  radius = 16,
  dragCloseThreshold = 80,
  dragVelocityThreshold = 500,
  disableDrag = false,
  scrimClassName,
  panelClassName,
  className,
  children,
  ...rest
}: AgSheetProps) {
  const handleDragEnd = React.useCallback(
    (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (
        info.offset.y > dragCloseThreshold ||
        info.velocity.y > dragVelocityThreshold
      ) {
        onClose()
      }
    },
    [dragCloseThreshold, dragVelocityThreshold, onClose],
  )

  return (
    <AnimatePresence>
      {open && (
        <div className={cn('pointer-events-auto absolute inset-0', className)}>
          {/* Scrim — tap to close */}
          <motion.div
            key="ag-sheet-scrim"
            variants={scrimVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className={cn('absolute inset-0 bg-black/50', scrimClassName)}
          />

          {/* Panel — springs up + drag-to-dismiss */}
          <motion.div
            key="ag-sheet-panel"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag={disableDrag ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            // Resist upward drag (no value) but let downward feel natural.
            dragElastic={{ top: 0, bottom: 0.4 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            // Re-spring back to 0 if the user releases before threshold.
            dragTransition={{
              ...spring.sheet,
              // Drag's own snap-back; keep duration short.
              bounceStiffness: spring.sheet.stiffness,
              bounceDamping: spring.sheet.damping,
            }}
            transition={{
              y: spring.sheet,
              // Honored by `exit` only (variants override during enter).
              default: { duration: dur.base, ease: ease.swiftIn },
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              height,
              touchAction: disableDrag ? undefined : 'pan-x',
            }}
            className={cn(
              'absolute bottom-0 left-0 right-0 overflow-hidden bg-white',
              panelClassName,
            )}
            {...rest}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
