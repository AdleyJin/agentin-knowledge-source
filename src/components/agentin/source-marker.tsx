import * as React from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MobileSheetContext, ViewModeContext } from '@/contexts/agentin'
import { SOURCES, openSource } from '@/data/sources'
import { SourceTypeIcon } from '@/components/agentin/source-type-icon'

/**
 * Inline citation pill — `[n]` appended to a finished answer block.
 *
 * Layout: 16×16 circle, `#f5f5f5` fill, 9px `#868686` glyph. Sits 2px
 * above the text top via `align-text-top + -translate-y-0.5`.
 *
 * Behavior:
 *   - Desktop → `<Tooltip>` showing the source card on hover.
 *   - Mobile  → tap opens the citation bottom sheet via
 *     `MobileSheetContext`.
 */
export function SourceMarker({ n }: { n: number }) {
  const src = SOURCES[n - 1]
  const view = React.useContext(ViewModeContext)
  const isMobile = view === 'mobile'
  const sheetCtx = React.useContext(MobileSheetContext)

  if (isMobile) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          sheetCtx?.openSheet({ kind: 'cite', n })
        }}
        className="inline-flex size-4 items-center justify-center rounded-full mx-0.5 align-text-top -translate-y-0.5 text-[9px] font-medium leading-none transition-colors bg-[#f5f5f5] text-[#868686] active:bg-[#2EE066] active:text-[#1a1a1a]"
        aria-label={`查看引用 ${n}`}
      >
        {n}
      </button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex size-4 items-center justify-center rounded-full mx-0.5 align-text-top -translate-y-0.5 text-[9px] font-medium leading-none transition-colors bg-[#f5f5f5] text-[#868686] hover:bg-[#2EE066] hover:text-[#1a1a1a]"
          aria-label={`查看引用 ${n}`}
        >
          {n}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        sideOffset={4}
        className="w-[320px] p-0"
      >
        {/* Layout follows Figma 31:18180 — three stacked rows with 4px
         * gap, 16px card padding:
         *   1. header row — left: [icon + "类型 / 来源名"], right: cite
         *   2. title — single-line, ellipsis on overflow
         *   3. description — content excerpt, 2-line clamp
         */}
        <button
          type="button"
          onClick={() => {
            if (src) openSource(src)
          }}
          aria-label={src ? `打开引用：${src.title}` : `打开引用 ${n}`}
          className="flex w-full flex-col gap-1 items-start rounded-[12px] p-4 text-left focus:outline-none cursor-pointer"
        >
          {/* Row 1: icon + "类型 / 来源名" */}
          <div className="flex items-center gap-1">
            <SourceTypeIcon
              type={src?.type ?? ''}
              className="size-[16px] text-[#868686]"
              wrapperClassName="w-[16px]"
            />
            <span className="text-[11px] leading-[18px] text-[#868686] whitespace-nowrap">
              {src?.type}
            </span>
          </div>

          {/* Row 2: title */}
          <p className="w-full truncate text-[14px] font-medium leading-[normal] text-[#1a1a1a]">
            {src?.title}
          </p>

          {/* Row 3: description excerpt */}
          {src?.description && (
            <p className="w-full line-clamp-2 text-[14px] leading-[22px] text-[#868686]">
              {src.description}
            </p>
          )}

          {/* Row 4: cite — moved to bottom */}
          {src?.cite && (
            <p className="text-[11px] leading-[18px] text-[#868686] whitespace-nowrap">
              {src.cite}
            </p>
          )}
        </button>
      </TooltipContent>
    </Tooltip>
  )
}
