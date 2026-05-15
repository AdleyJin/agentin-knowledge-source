import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

import { LightboxHostContext } from '@/contexts/agentin'
import { dur, ease, scrimVariants, spring } from '@/lib/motion'
import { cn } from '@/lib/utils'

// Lightbox toolbar icons (Figma 37:22331 — SF-style glyphs that don't
// have a great Lucide match; keep them as standalone assets so the
// toolbar matches the design pixel-for-pixel).
import IconChevronLeft from '@/assets/icons/icon-chevron-left.svg?react'
import IconChevronRight from '@/assets/icons/icon-chevron-right.svg?react'
import IconZoomOut from '@/assets/icons/icon-zoom-out.svg?react'
import IconZoomIn from '@/assets/icons/icon-zoom-in.svg?react'
import IconActualSize from '@/assets/icons/icon-actual-size.svg?react'
import IconRotateRight from '@/assets/icons/icon-rotate-right.svg?react'
import IconFitScreen from '@/assets/icons/icon-fit-screen.svg?react'

const ZOOM_STEP = 0.25
const ZOOM_MIN = 0.25
const ZOOM_MAX = 4.0

/**
 * Full-screen image preview, portaled into `LightboxHostContext` so it
 * is clipped to the device frame (desktop window or phone screen).
 *
 * Motion upgrades vs. the legacy version:
 *   - Scrim fades through `scrimVariants` so close gets an exit anim.
 *   - The image opens with a smooth ease-out tween (scale 0.96 → 1 +
 *     opacity 0 → 1, 320ms). We deliberately avoid springs here —
 *     a spring's overshoot reads as "the image accelerates again at
 *     the end" instead of settling naturally.
 *   - Rotation is also driven by Motion (`animate.rotate`) rather
 *     than an inline `transform: rotate()`, so we never set the same
 *     `transform` property from two competing sources.
 *   - Zoom (width %) stays as a direct style change — width isn't on
 *     the transform pipeline so there's no conflict, and the lack of
 *     interpolation matches the snappy feel of the original.
 *   - All of the above are wrapped in `<AnimatePresence>` so the
 *     lightbox can play its exit before unmounting.
 */
export function ImageLightbox({
  open,
  onClose,
  index,
  onIndexChange,
  images,
}: {
  open: boolean
  onClose: () => void
  index: number
  onIndexChange: (i: number) => void
  images: string[]
}) {
  const hostRef = React.useContext(LightboxHostContext)
  const total = images.length

  // Zoom state: `null` = fit-to-screen; number = explicit scale.
  const [zoom, setZoom] = React.useState<number | null>(null)
  // True = currently showing 1:1 original size.
  const [isActual, setIsActual] = React.useState(false)
  const [rotation, setRotation] = React.useState(0)

  const resetTransform = React.useCallback(() => {
    setZoom(null)
    setIsActual(false)
    setRotation(0)
  }, [])

  const prev = () => {
    resetTransform()
    onIndexChange((index - 1 + total) % total)
  }
  const next = () => {
    resetTransform()
    onIndexChange((index + 1) % total)
  }

  // Reset transform when image changes (prev/next while open).
  React.useEffect(() => {
    resetTransform()
  }, [index, resetTransform])

  // Reset whenever the lightbox closes so the next open starts clean.
  React.useEffect(() => {
    if (!open) resetTransform()
  }, [open, resetTransform])

  // Force one re-render on mount so `hostRef.current` is available the
  // first time the lightbox tries to open. (Same trick as the bottom
  // sheets — `useRef` doesn't trigger renders by itself.)
  const [, forceUpdate] = React.useState(0)
  React.useEffect(() => {
    forceUpdate((n) => n + 1)
  }, [])

  // Keyboard shortcuts only while open.
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, total, onClose, onIndexChange])

  if (!hostRef?.current) return null

  const displayPct = zoom === null ? 100 : Math.round(zoom * 100)

  const zoomIn = () => {
    const base = zoom ?? 1
    const n = Math.min(ZOOM_MAX, parseFloat((base + ZOOM_STEP).toFixed(2)))
    setZoom(n)
    setIsActual(false)
  }
  const zoomOut = () => {
    const base = zoom ?? 1
    const n = Math.max(ZOOM_MIN, parseFloat((base - ZOOM_STEP).toFixed(2)))
    setZoom(n)
    setIsActual(false)
  }
  const toggleActualSize = () => {
    if (isActual) {
      setZoom(null)
      setIsActual(false)
    } else {
      setZoom(1)
      setIsActual(true)
    }
  }
  // Keep rotation ever-increasing so CSS transition always goes clockwise.
  const rotate = () => setRotation((r) => r + 90)

  // Sizing only — rotation is handled by motion's `animate.rotate` so
  // we never end up with two writers fighting over `transform`.
  const sizeStyle: React.CSSProperties =
    zoom === null
      ? { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }
      : { width: `${zoom * 100}%`, objectFit: 'contain' }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="ag-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
          onClick={onClose}
          variants={scrimVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="pointer-events-auto absolute inset-0 bg-black/85"
        >
          {/* Image — opens with a smooth ease-out tween. Scale +
           * opacity + rotate are all on the same `transform`/style
           * pipeline owned by Motion, so they compose cleanly without
           * any inline `transform: rotate()` to fight with. */}
          <div className="absolute inset-0 flex items-center justify-center overflow-auto">
            <motion.img
              key={`img-${index}`}
              src={images[index]}
              alt=""
              style={sizeStyle}
              onClick={(e) => e.stopPropagation()}
              className={cn('shadow-2xl')}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: rotation }}
              exit={{
                scale: 0.96,
                opacity: 0,
                transition: { duration: dur.fast, ease: ease.inOut },
              }}
              transition={{
                scale: { duration: 0.32, ease: ease.out },
                opacity: { duration: 0.32, ease: ease.out },
                rotate: { duration: 0.25, ease: ease.out },
              }}
            />
          </div>

          {/* Close button — overlaid top-right */}
          <button
            type="button"
            aria-label="关闭"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-4 right-4 z-10 size-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {/* Toolbar — overlaid at bottom */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 flex justify-center pb-6 pt-2 pointer-events-none"
            initial={{ y: 16, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { ...spring.panel, delay: 0.05 },
            }}
            exit={{
              y: 16,
              opacity: 0,
              transition: { duration: dur.fast, ease: ease.inOut },
            }}
          >
            <div className="pointer-events-auto flex items-center gap-2.5 rounded-[8px] bg-[rgba(26,26,26,0.6)] p-1 text-white backdrop-blur-sm">
              <button
                aria-label="上一张"
                onClick={prev}
                className="size-8 grid place-items-center rounded-[8px] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <IconChevronLeft className="size-5" />
              </button>
              <span className="text-[14px] tabular-nums px-0.5">
                {index + 1} / {total}
              </span>
              <button
                aria-label="下一张"
                onClick={next}
                className="size-8 grid place-items-center rounded-[8px] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <IconChevronRight className="size-5" />
              </button>
              <span aria-hidden className="h-5 w-px bg-white/20" />
              <button
                aria-label="缩小"
                onClick={zoomOut}
                disabled={zoom !== null && zoom <= ZOOM_MIN}
                className="size-8 grid place-items-center rounded-[8px] hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <IconZoomOut className="size-5" />
              </button>
              <span className="text-[14px] tabular-nums px-0.5 w-12 text-center">
                {displayPct}%
              </span>
              <button
                aria-label="放大"
                onClick={zoomIn}
                disabled={zoom !== null && zoom >= ZOOM_MAX}
                className="size-8 grid place-items-center rounded-[8px] hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <IconZoomIn className="size-5" />
              </button>
              <button
                aria-label={isActual ? '适应屏幕' : '原始尺寸'}
                onClick={toggleActualSize}
                className="size-8 grid place-items-center rounded-[8px] hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isActual ? (
                  <IconFitScreen className="size-5" />
                ) : (
                  <IconActualSize className="size-5" />
                )}
              </button>
              <span aria-hidden className="h-5 w-px bg-white/20" />
              <button
                aria-label="旋转"
                onClick={rotate}
                className="size-8 grid place-items-center rounded-[8px] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <IconRotateRight className="size-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    hostRef.current,
  )
}
