import * as React from 'react'
import { cn } from '@app/lib/utils'
import { CodeBlock } from './CodeBlock'

/**
 * Standard component preview frame. Renders the live demo on top + a
 * code block underneath, both inside a card. Optional caption explains
 * what's being shown so the page reads as a "specimen".
 */
export function Preview({
  caption,
  code,
  background = 'app',
  align = 'center',
  density = 'comfortable',
  children,
  className,
  /** When true, wrap the live area in a max-width frame to mimic chat width. */
  framed = false,
}: {
  caption?: React.ReactNode
  code: string
  /**
   *  - `app`  → matches the chat background (`#f2f2f2`) so contrast is honest
   *  - `card` → solid white surface for chips/buttons
   *  - `dark` → dark surface for color-on-dark cases
   */
  background?: 'app' | 'card' | 'dark'
  align?: 'start' | 'center'
  density?: 'comfortable' | 'compact'
  children: React.ReactNode
  className?: string
  framed?: boolean
}) {
  const bg =
    background === 'app'
      ? 'bg-[var(--ag-bg)]'
      : background === 'dark'
        ? 'bg-[#1a1a1a]'
        : 'bg-white'

  return (
    <figure
      className={cn(
        'rounded-[12px] border border-[var(--ag-border)] bg-white overflow-hidden',
        className,
      )}
    >
      <div
        className={cn(
          bg,
          density === 'comfortable' ? 'p-8' : 'p-5',
          'flex',
          align === 'center' ? 'justify-center items-center' : 'justify-start items-start',
        )}
      >
        {framed ? (
          <div className="w-full max-w-[560px]">{children}</div>
        ) : (
          children
        )}
      </div>
      {caption && (
        <figcaption className="border-t border-[var(--ag-border)] px-4 py-2 text-[12px] text-[#868686]">
          {caption}
        </figcaption>
      )}
      <div className="border-t border-[var(--ag-border)] p-3">
        <CodeBlock code={code} />
      </div>
    </figure>
  )
}

/**
 * Compact preview that only shows a live area (no code) — useful when
 * the example is purely visual (e.g. a color stop, a radius circle).
 */
export function VisualOnly({
  children,
  className,
  background = 'app',
}: {
  children: React.ReactNode
  className?: string
  background?: 'app' | 'card'
}) {
  const bg = background === 'app' ? 'bg-[var(--ag-bg)]' : 'bg-white'
  return (
    <div
      className={cn(
        'rounded-[10px] border border-[var(--ag-border)]',
        bg,
        'p-5 flex items-center justify-center',
        className,
      )}
    >
      {children}
    </div>
  )
}
