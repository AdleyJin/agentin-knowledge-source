import * as React from 'react'
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { AgCollapse, AgIconSwap } from '@/components/motion'
import { SourceTypeTag } from '@/components/agentin/source-type-icon'
import { MobileSheetContext, ViewModeContext } from '@/contexts/agentin'
import { SOURCES, openSource } from '@/data/sources'

/**
 * Collapsible "找到 N 篇知识库资料" block — per Figma 31:18309.
 *
 * Behavior:
 *   - Mobile: tap opens the full-screen bottom sheet (`MobileSheetContext`).
 *   - Desktop: tap toggles an inline collapsible list in place.
 *
 * Animations (new in the Motion refactor):
 *   - The chevron uses `<AgIconSwap>` to crossfade up/down on toggle.
 *   - The list itself uses `<AgCollapse>` for a clean height + opacity
 *     animation in both directions (the legacy version snapped open).
 */
export function SourcesBlock() {
  const [expanded, setExpanded] = React.useState(false)
  const isMobile = React.useContext(ViewModeContext) === 'mobile'
  const sheetCtx = React.useContext(MobileSheetContext)

  const handleClick = () => {
    if (isMobile) {
      sheetCtx?.openSheet({ kind: 'sources' })
    } else {
      setExpanded((v) => !v)
    }
  }

  return (
    <div className="ag-rise mt-1 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'self-start inline-flex items-center gap-1 leading-[18px] text-[12px] text-[#868686] transition-colors',
          !isMobile && 'hover:text-[#1a1a1a]',
        )}
        aria-expanded={isMobile ? undefined : expanded}
      >
        <span>找到 {SOURCES.length} 篇知识库资料</span>
        <span
          className="inline-flex size-4 items-center justify-center"
          aria-hidden="true"
        >
          {/* Mobile shows a static chevron-down (sheet opens on tap);
           * desktop swaps up/down with a soft crossfade. */}
          {isMobile ? (
            <ChevronDown className="size-3" strokeWidth={2} />
          ) : (
            <AgIconSwap state={expanded ? 'up' : 'down'} size={12}>
              {expanded ? (
                <ChevronUp className="size-3" strokeWidth={2} />
              ) : (
                <ChevronDown className="size-3" strokeWidth={2} />
              )}
            </AgIconSwap>
          )}
        </span>
      </button>

      {/* Desktop only: inline collapsible list — per Figma 31:18314 */}
      {!isMobile && (
        <AgCollapse open={expanded} padding={0}>
          <ol className="flex flex-col gap-[4px] pb-1">
            {SOURCES.map((src, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => openSource(src)}
                  aria-label={`打开资料：${src.title}`}
                  className="group relative flex w-full items-center gap-[4px] rounded-[6px] py-1 pr-1 text-left transition-colors focus:outline-none focus-visible:bg-[rgba(26,26,26,0.05)] cursor-pointer hover:bg-[rgba(26,26,26,0.05)]"
                >
                  <span className="inline-flex size-5 shrink-0 items-center justify-center text-[12px] leading-none text-[#868686] tabular-nums">
                    {i + 1}
                  </span>

                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <SourceTypeTag type={src.type} />
                    <div className="flex min-w-0 items-center gap-1">
                      <span className="truncate text-[12px] text-[#1a1a1a]">
                        {src.title}
                      </span>
                      {src.cite && (
                        <span className="shrink-0 text-[10px] text-[#868686]">
                          {src.cite}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ↗ hint arrow — desktop hover only */}
                  <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight
                      className="size-2 text-[#bbbbbb]"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </AgCollapse>
      )}
    </div>
  )
}
