import * as React from 'react'
import { cn } from '@app/lib/utils'

/**
 * Inline pill that copies the displayed token name to clipboard on
 * click and shows a tiny "已复制" flash. Used by every swatch / row in
 * the foundations pages so the user can reach for tokens with one tap.
 */
export function CopyToken({
  value,
  display,
  className,
  variant = 'mono',
}: {
  /** The string copied to clipboard (e.g. `var(--primary)` or `#1a1a1a`). */
  value: string
  /** Optional visible text — defaults to `value`. */
  display?: string
  className?: string
  /** `mono` for code-style; `plain` for plain text. */
  variant?: 'mono' | 'plain'
}) {
  const [flashed, setFlashed] = React.useState(0)

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const t = document.createElement('textarea')
      t.value = value
      document.body.appendChild(t)
      t.select()
      try {
        document.execCommand('copy')
      } catch {
        /* noop */
      }
      document.body.removeChild(t)
    }
    setFlashed((n) => n + 1)
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center rounded-md px-1.5 py-0.5 text-left transition-colors',
          'cursor-pointer hover:bg-[rgba(26,26,26,0.05)] active:bg-[rgba(26,26,26,0.08)]',
          variant === 'mono' && 'font-mono',
          className,
        )}
        aria-label={`复制 ${value}`}
      >
        {display ?? value}
      </button>
      {flashed > 0 && (
        <span
          key={flashed}
          aria-hidden
          className="ds-flash pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded-md bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] text-white"
        >
          已复制
        </span>
      )}
    </span>
  )
}
