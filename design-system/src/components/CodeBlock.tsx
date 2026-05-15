import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@app/lib/utils'

/**
 * Click-to-copy code block. Used by every component preview so users can
 * grab the exact JSX they're looking at. Uses the `Clipboard API` with a
 * `document.execCommand` fallback for older browsers / file:// previews.
 */
export function CodeBlock({
  code,
  language = 'tsx',
  className,
}: {
  code: string
  language?: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const t = document.createElement('textarea')
      t.value = code
      document.body.appendChild(t)
      t.select()
      try {
        document.execCommand('copy')
      } catch {
        /* noop */
      }
      document.body.removeChild(t)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className={cn('relative group', className)}>
      <pre className="ds-codeblock">{code.trim()}</pre>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? '已复制' : '复制代码'}
        className={cn(
          'absolute top-2 right-2 inline-flex items-center gap-1 rounded-md',
          'bg-white/8 px-2 py-1 text-[11px] text-white/80',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-white/15 hover:text-white',
        )}
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        <span>{copied ? '已复制' : '复制'}</span>
      </button>
      <span className="absolute bottom-2 right-3 text-[10px] uppercase tracking-wide text-white/30">
        {language}
      </span>
    </div>
  )
}
