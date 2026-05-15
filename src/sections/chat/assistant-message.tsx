import * as React from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { BlurFade } from '@/components/magicui/blur-fade'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { SourceMarker } from '@/components/agentin/source-marker'
import {
  CHAR_DUR_MS,
  SCRIPT,
  type ScriptBlock,
} from '@/data/script'
import { SourcesBlock } from '@/sections/chat/sources-block'
import { ViewModeContext } from '@/contexts/agentin'

/**
 * Cursor passed in from `App.tsx`. After the D-slice refactor we only
 * track which block is current — the per-character cursor is owned by
 * each block's `<TypingAnimation>` instance.
 */
export interface StreamPos {
  blockIdx: number
}

/**
 * Possible states of the parent answer state machine. `AssistantMessage`
 * only renders for the last two (`streaming` and `complete`).
 */
export type AssistantPhase =
  | 'searching'
  | 'reading'
  | 'streaming'
  | 'complete'

export interface AssistantMessageProps {
  phase: AssistantPhase
  stream: StreamPos
  /** Renderer for the inline `images` block. Injected so this section
   * doesn't need to import the (large) `ImageGallery` from `App.tsx`. */
  imagesNode: React.ReactNode
  /** Renderer for the bottom action row, shown only when `complete`. */
  actionsNode: React.ReactNode
}

/**
 * Streamed AI answer.
 *
 * Renders all blocks up to and including `stream.blockIdx`. Each text
 * block is animated by `<TypingAnimation>` (Magic UI) which self-paces
 * character-by-character; non-text blocks (`divider`, `images`) snap
 * in instantly when their block becomes "past".
 *
 * No caret is rendered during typing — we use Magic UI's "Without
 * Cursor" preset for a cleaner read. The block-level fade still
 * makes it obvious which block is currently streaming, and the
 * absence of a blinking pill means nothing in the layout shifts as
 * the cursor would otherwise jump from line to line.
 *
 * The trailing `<SourcesBlock>` ("找到 N 篇知识库资料") is intentionally
 * deferred until the answer has fully streamed in (`complete`). During
 * `streaming` it stays hidden so the index row doesn't compete for
 * attention with the text that's still arriving.
 */
export function AssistantMessage({
  phase,
  stream,
  imagesNode,
  actionsNode,
}: AssistantMessageProps) {
  const complete = phase === 'complete'
  const streaming = phase === 'streaming'
  const view = React.useContext(ViewModeContext)

  const visibleBlocks: React.ReactNode[] = []
  if (streaming || complete) {
    for (let i = 0; i < SCRIPT.length; i++) {
      const block = SCRIPT[i]
      const isPast = complete || i < stream.blockIdx
      const isCurrent = !complete && i === stream.blockIdx
      const isFuture = !complete && i > stream.blockIdx
      if (isFuture) break
      visibleBlocks.push(renderBlock(block, i, { isPast, isCurrent }, imagesNode, view))
    }
  }

  return (
    <div className="flex flex-col gap-3 text-[14px] text-[#1a1a1a]">
      {visibleBlocks}

      {complete && (
        <>
          {/* Index row only appears once the answer has finished streaming. */}
          <SourcesBlock />
          <p className="ag-rise text-[12px] text-[#868686]">
            内容由 AI 生成，请仔细甄别。
          </p>
          {actionsNode}
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Block renderers
// ─────────────────────────────────────────────────────────────────────

function renderBlock(
  block: ScriptBlock,
  idx: number,
  state: { isPast: boolean; isCurrent: boolean },
  imagesNode: React.ReactNode,
  view: 'desktop' | 'mobile' = 'desktop',
): React.ReactNode {
  const key = `b-${idx}`
  const { isPast, isCurrent } = state

  switch (block.kind) {
    case 'p':
      return (
        <p key={key} className="ag-rise leading-[1.7]">
          <TypedText text={block.text} typing={isCurrent} />
        </p>
      )
    case 'h3':
      return (
        <h3
          key={key}
          className="ag-rise text-[16px] font-medium leading-[24px] mt-1"
        >
          <TypedText text={block.text} typing={isCurrent} />
        </h3>
      )
    case 'olPrefix':
      return (
        <p key={key} className="ag-rise leading-[1.7]">
          <TypedText text={block.text} typing={isCurrent} />
        </p>
      )
    case 'divider':
      // Only paint the divider once it has fully "elapsed".
      return isPast ? (
        <div
          key={key}
          className="ag-rise h-px bg-[var(--ag-border)] my-1"
        />
      ) : null
    case 'bullet':
      return (
        <div key={key} className="ag-rise flex gap-2 leading-[1.7]">
          <span className="text-[#9a9a9a] shrink-0 mt-[10px] inline-block size-1 rounded-full bg-[#9a9a9a] ml-2" />
          <div className="flex-1 min-w-0">
            <TypedText text={block.text} typing={isCurrent} />
            {isPast &&
              block.cites?.map((c) => <SourceMarker key={c} n={c} />)}
          </div>
        </div>
      )
    case 'orderedItem':
      return (
        <div key={key} className="ag-rise flex gap-2 pl-5 leading-[1.7]">
          <span className="text-[#9a9a9a] shrink-0 w-4">{block.marker}</span>
          <div className="flex-1 min-w-0">
            <TypedText text={block.text} typing={isCurrent} />
            {isPast &&
              block.cites?.map((c) => <SourceMarker key={c} n={c} />)}
          </div>
        </div>
      )
    case 'images':
      // While "loading", show skeleton tiles; once past, swap to
      // the gallery (provided by the parent so this section file stays
      // free of heavy desktop-only deps).
      if (isPast) return <React.Fragment key={key}>{imagesNode}</React.Fragment>
      if (isCurrent) {
        if (view === 'mobile') {
          // Mirror the actual mobile gallery: horizontal scroll row, fixed 160×120 tiles
          return (
            <div key={key} className="ag-rise -mx-6 overflow-x-hidden">
              <div className="flex gap-2 px-6">
                {[0, 1, 2, 3].map((i) => (
                  <BlurFade
                    key={i}
                    delay={i * 0.08}
                    duration={0.4}
                    direction="up"
                    offset={4}
                    blur="8px"
                    className="shrink-0"
                  >
                    <Skeleton className="w-[160px] h-[120px] rounded-[12px]" />
                  </BlurFade>
                ))}
              </div>
            </div>
          )
        }
        return (
          <div key={key} className="ag-rise grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <BlurFade
                key={i}
                delay={i * 0.08}
                duration={0.4}
                direction="up"
                offset={4}
                blur="8px"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              </BlurFade>
            ))}
          </div>
        )
      }
      return null
  }
}

/**
 * Thin wrapper around Magic UI's `<TypingAnimation>`.
 *
 * Only the *current* block uses the typing animation. Past blocks
 * render as a plain `<span>` so they don't re-mount (and re-type)
 * every time the parent stream cursor advances. This is the single
 * most important invariant in this file — get it wrong and every
 * cursor tick replays the entire conversation.
 *
 * Behaviour tweaks vs. Magic UI defaults:
 *   - `startOnView={false}` — animate as soon as we mount; the parent
 *     already gates mounting via its stream cursor.
 *   - `showCursor={false}` — Magic UI's "Without Cursor" preset.
 *     The block-level entrance fade already signals "this is what's
 *     streaming right now"; an extra blinking caret would only add
 *     visual noise and a layout shift each time the stream cursor
 *     jumps from one block to the next.
 */
function TypedText({ text, typing }: { text: string; typing: boolean }) {
  if (!typing) return <span>{text}</span>
  return (
    <TypingAnimation
      as="span"
      duration={CHAR_DUR_MS}
      startOnView={false}
      showCursor={false}
    >
      {text}
    </TypingAnimation>
  )
}
