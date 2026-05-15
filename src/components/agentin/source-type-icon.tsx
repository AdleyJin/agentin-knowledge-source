import * as React from 'react'
import { ClipboardList } from 'lucide-react'

import { cn } from '@/lib/utils'

import IconSourceRecorded from '@/assets/icons/icon-source-recorded.svg?react'
import IconSourceStudy from '@/assets/icons/icon-source-study.svg?react'
import IconSourceFlowin from '@/assets/icons/icon-source-flowin.svg?react'
import IconSourceCoDoc from '@/assets/icons/icon-source-co-doc.svg?react'
import IconSourcePdf from '@/assets/icons/icon-source-pdf.svg?react'
import IconSourceUnknown from '@/assets/icons/icon-source-unknown.svg?react'

/**
 * Monochrome line glyph for a given source type. Falls back to the
 * "unknown file" icon for unmapped types so layout never breaks.
 *
 * Per Figma 102:12620 — every type chip sits on the same `#f5f5f5`
 * background, so we lean on shape (not hue) to differentiate. The text
 * label is what the user actually reads.
 */
export function SourceTypeIcon({
  type,
  className,
  wrapperClassName,
}: {
  type: string
  className?: string
  wrapperClassName?: string
}) {
  const map: Record<
    string,
    React.ComponentType<{ className?: string; strokeWidth?: number }>
  > = {
    录播课: IconSourceRecorded,
    学习资料: IconSourceStudy,
    'Flowin 文档': IconSourceFlowin,
    PDF: IconSourcePdf,
    '共创文档': IconSourceCoDoc,
    作业: ClipboardList,
  }
  const Icon = map[type] ?? IconSourceUnknown

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        wrapperClassName,
      )}
      aria-hidden="true"
    >
      <Icon className={cn('text-[#1a1a1a]', className)} strokeWidth={1.75} />
    </span>
  )
}

/**
 * Compact `[icon][label]` chip used in `SourcesBlock` rows.
 */
export function SourceTypeTag({
  type,
  iconClassName,
}: {
  type: string
  iconClassName?: string
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-[2px] rounded-[4px] bg-[#f5f5f5] pl-[2px] pr-[4px] py-[2px]">
      <SourceTypeIcon
        type={type}
        className={cn('size-[15px]', iconClassName)}
        wrapperClassName="w-[16px]"
      />
      <span className="text-[11px] leading-[16px] text-[#1a1a1a] whitespace-nowrap">
        {type}
      </span>
    </span>
  )
}
