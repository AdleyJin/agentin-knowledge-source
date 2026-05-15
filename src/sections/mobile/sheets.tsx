import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { AgSheet } from '@/components/motion'
import { LightboxHostContext } from '@/contexts/agentin'
import { SourceTypeIcon } from '@/components/agentin/source-type-icon'
import { SOURCES, openSource } from '@/data/sources'

/**
 * Shared wrapper that portals the sheet into the phone-screen overlay
 * (the `lightboxHostRef` div rendered by `MobilePhoneFrame`) so the
 * sheet is visually clipped to the device frame, not the whole page.
 *
 * `<AgSheet>` (motion-driven) handles the slide-up enter, slide-down
 * exit, scrim fade, AND drag-to-dismiss. The `open` prop replaces the
 * old "conditional render" pattern so exit animations can play.
 */
function MobileBottomSheet({
  open,
  onClose,
  height,
  children,
}: {
  open: boolean
  onClose: () => void
  height: number
  children: React.ReactNode
}) {
  const hostRef = React.useContext(LightboxHostContext)

  // The host ref is set during mount, but `useRef` doesn't trigger a
  // re-render. Force one once so the portal target becomes available
  // on the first paint after mount.
  const [, forceUpdate] = React.useState(0)
  React.useEffect(() => {
    forceUpdate((n) => n + 1)
  }, [])

  if (!hostRef?.current) return null

  return createPortal(
    <AgSheet open={open} onClose={onClose} height={height}>
      {children}
    </AgSheet>,
    hostRef.current,
  )
}

/**
 * Citation sheet — single source card (height 172 px).
 * Mirrors Figma node 31:16448 "批阅弹窗".
 *
 * `n` is captured by the parent (`MobilePhoneFrame`) into a ref so the
 * exit animation still has a valid source to render after the sheet
 * has been logically dismissed.
 */
/**
 * Citation sheet — single source card (height 172 px).
 * Mirrors Figma node 142:13981. Card layout is identical to the rows
 * inside MobileSourcesSheet: tag / title / description / cite.
 */
export function MobileCiteSheet({
  open,
  n,
  onClose,
}: {
  open: boolean
  n: number
  onClose: () => void
}) {
  const src = SOURCES[n - 1]

  return (
    <MobileBottomSheet open={open} onClose={onClose} height={172}>
      {src && (
        <>
          {/* Card content — left: 24px, width: 327px (= 375 - 24 - 24) */}
          <div
            className="absolute left-6 top-6 flex flex-col gap-1"
            style={{ width: 'calc(100% - 48px)' }}
          >
            {/* Tag row: icon + "类型 / 来源" 11 px */}
            <div className="flex items-center gap-1 h-[18px]">
              <SourceTypeIcon
                type={src.type}
                className="size-[15px] text-[#868686]"
                wrapperClassName="w-4"
              />
              <span className="text-[11px] leading-[16px] text-[#868686]">
                {src.type}
              </span>
            </div>

            {/* Title */}
            <p className="text-[14px] font-medium leading-[20px] text-[#1a1a1a] truncate">
              {src.title}
            </p>

            {/* Description excerpt — 1 line max to fit 172 px height */}
            {src.description && (
              <p className="text-[14px] leading-[22px] text-[#868686] line-clamp-2">
                {src.description}
              </p>
            )}

            {/* Citation position */}
            {src.cite && (
              <p className="text-[11px] leading-[16px] text-[#868686]">
                {src.cite}
              </p>
            )}
          </div>

          {/* Close button — top-16px, right-24px */}
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="absolute top-4 right-6 size-6 rounded-full bg-[#f5f5f5] flex items-center justify-center"
          >
            <X className="size-3.5 text-[#868686]" />
          </button>
        </>
      )}
    </MobileBottomSheet>
  )
}

/**
 * Sources sheet — full list (height 464 px).
 * Mirrors Figma node 31:16571 "批阅弹窗" (sources variant).
 */
export function MobileSourcesSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const HEADER_H = 56

  return (
    <MobileBottomSheet open={open} onClose={onClose} height={464}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <span className="text-[16px] font-medium text-[#1a1a1a]">
          {SOURCES.length} 个来源
        </span>
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="size-6 rounded-full bg-[#f5f5f5] flex items-center justify-center"
        >
          <X className="size-3.5 text-[#868686]" />
        </button>
      </div>

      {/* Scrollable card list — gap-4 (16 px) between cards, no inner
       * padding on each card (matches Figma 142:14107). */}
      <div
        className="overflow-y-auto px-6 flex flex-col gap-4 pb-8"
        style={{ height: 464 - HEADER_H }}
      >
        {SOURCES.map((src, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="h-px bg-[#f4f4f4] shrink-0" />}
            <button
              type="button"
              onClick={() => {
                openSource(src)
                onClose()
              }}
              className="w-full flex flex-col gap-1 text-left"
            >
            {/* Tag row: 12 px icon + "类型 / 来源" in 11 px gray */}
            <div className="flex items-center gap-1 h-[18px]">
              <SourceTypeIcon
                type={src.type}
                className="size-[15px] text-[#868686]"
                wrapperClassName="w-4"
              />
              <span className="text-[11px] leading-[16px] text-[#868686]">
                {src.type}
              </span>
            </div>

            {/* Title — 14 px medium */}
            <p className="text-[14px] font-medium leading-[20px] text-[#1a1a1a] truncate">
              {src.title}
            </p>

            {/* Description excerpt — 14 px regular, max 2 lines */}
            {src.description && (
              <p className="text-[14px] leading-[22px] text-[#868686] line-clamp-2">
                {src.description}
              </p>
            )}

            {/* Citation position — 11 px */}
            {src.cite && (
              <p className="text-[11px] leading-[16px] text-[#868686]">
                {src.cite}
              </p>
            )}
            </button>
          </React.Fragment>
        ))}
      </div>
    </MobileBottomSheet>
  )
}
