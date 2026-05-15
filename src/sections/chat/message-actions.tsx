import * as React from 'react'

import { cn } from '@/lib/utils'
import { ViewModeContext } from '@/contexts/agentin'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import IconRegenerate from '@/assets/icons/icon-regenerate.svg?react'
import IconCopy from '@/assets/icons/icon-copy.svg?react'
import IconThumbsUp from '@/assets/icons/icon-thumbs-up.svg?react'
import IconThumbsDown from '@/assets/icons/icon-thumbs-down.svg?react'

/**
 * Footer row under an assistant message — regenerate / copy / 👍 / 👎.
 *
 * Kept as a tiny standalone section so `App.tsx` stays focused on
 * orchestration. The `.ag-rise` class still drives the entrance —
 * we'll fold it into a motion variant in a later cleanup pass once
 * the rest of the inline `.ag-rise` callers are converted.
 *
 * Icon set: custom 16×16 SVGs in `src/assets/icons/`. They use
 * `fill="currentColor"` so the parent button's `text-[#868686]` /
 * `hover:text-[#1a1a1a]` colors flow through unchanged.
 */
export function MessageActions() {
  return (
    <div className="ag-rise flex items-center gap-1 -ml-2">
      <ActionIcon icon={<IconRegenerate className="size-4" />} label="重新生成" />
      <ActionIcon icon={<IconCopy className="size-4" />} label="复制" />
      <ActionIcon icon={<IconThumbsUp className="size-4" />} label="赞" />
      <ActionIcon icon={<IconThumbsDown className="size-4" />} label="踩" />
    </div>
  )
}

function ActionIcon({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  const isMobile = React.useContext(ViewModeContext) === 'mobile'

  const btn = (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'size-8 grid place-items-center rounded-md text-[#868686] transition-colors',
        !isMobile && 'hover:bg-black/5 hover:text-[#1a1a1a]',
      )}
    >
      {icon}
    </button>
  )

  // Mobile: no hover tooltip — touch devices don't have pointer hover,
  // and a mouse-triggered tooltip in the prototype is distracting.
  if (isMobile) return btn

  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
