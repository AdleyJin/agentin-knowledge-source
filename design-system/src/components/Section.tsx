import * as React from 'react'
import { cn } from '@app/lib/utils'

/**
 * Anchorable doc section. The `id` becomes a hash target for left-nav
 * scrolling; the title carries a hover-to-reveal `#` link so users can
 * deep-link to any block.
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id: string
  eyebrow?: string
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('scroll-mt-20 pt-12 first:pt-6', className)}>
      <div className="mb-6">
        {eyebrow && (
          <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.08em] text-[#868686]">
            {eyebrow}
          </p>
        )}
        <h2 className="group flex items-baseline gap-2 text-[22px] font-semibold tracking-tight text-[#1a1a1a]">
          <span>{title}</span>
          <a
            href={`#${id}`}
            aria-label={`链接到「${title}」`}
            className="text-[14px] font-normal text-[#bbbbbb] opacity-0 transition-opacity hover:text-[#1a1a1a] group-hover:opacity-100"
          >
            #
          </a>
        </h2>
        {description && (
          <p className="mt-2 max-w-[640px] text-[14px] leading-[1.6] text-[#868686]">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

/**
 * Smaller heading used inside a Section to break sub-groups apart.
 */
export function SubHeading({
  id,
  children,
  hint,
}: {
  id?: string
  children: React.ReactNode
  hint?: React.ReactNode
}) {
  return (
    <div id={id} className="mt-10 mb-4 flex items-baseline justify-between scroll-mt-20">
      <h3 className="text-[14px] font-semibold tracking-tight text-[#1a1a1a]">
        {children}
      </h3>
      {hint && <span className="text-[12px] text-[#bbbbbb]">{hint}</span>}
    </div>
  )
}
