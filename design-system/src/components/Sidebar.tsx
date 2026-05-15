import * as React from 'react'
import { cn } from '@app/lib/utils'

export interface NavItem {
  /** Anchor id (matches Section.id). */
  id: string
  label: string
  /** Optional sub-anchors rendered as a nested list when this item is the active root. */
  children?: { id: string; label: string }[]
}

/**
 * Left-rail anchor navigation. Highlights the section currently centered
 * in the viewport via IntersectionObserver, and supports nested
 * sub-anchors for the longer sections (e.g. Components → Button / Badge…).
 */
export function Sidebar({
  groups,
}: {
  groups: { title: string; items: NavItem[] }[]
}) {
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Collect every anchor id we care about (top-level + nested).
    const ids: string[] = []
    for (const g of groups) {
      for (const it of g.items) {
        ids.push(it.id)
        for (const c of it.children ?? []) ids.push(c.id)
      }
    }
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    if (els.length === 0) return

    // Track which sections are currently above the activation line
    // (~30% from the top of the viewport). The lowest such section
    // wins — same behavior as MDN / Tailwind docs.
    const ratios = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target.id, e.intersectionRatio)
        }
        let bestId: string | null = null
        let best = 0
        ratios.forEach((r, id) => {
          if (r >= best) {
            best = r
            bestId = id
          }
        })
        if (bestId) setActiveId(bestId)
      },
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [groups])

  return (
    <nav className="w-[var(--ds-nav-w)] shrink-0 hidden lg:block">
      <div className="sticky top-[var(--ds-header-h)] max-h-[calc(100vh-var(--ds-header-h))] overflow-y-auto py-8 pr-4">
        <ol className="flex flex-col gap-6">
          {groups.map((group) => (
            <li key={group.title}>
              <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#bbbbbb]">
                {group.title}
              </p>
              <ul className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const isActive =
                    activeId === item.id ||
                    item.children?.some((c) => c.id === activeId)
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={cn(
                          'block rounded-md px-2 py-1.5 text-[13px] transition-colors',
                          isActive
                            ? 'bg-[var(--ag-active)] text-[#1a1a1a] font-medium'
                            : 'text-[#868686] hover:bg-[rgba(26,26,26,0.04)] hover:text-[#1a1a1a]',
                        )}
                      >
                        {item.label}
                      </a>
                      {item.children && isActive && (
                        <ul className="mt-1 mb-1 ml-3 flex flex-col gap-px border-l border-[var(--ag-border)] pl-3">
                          {item.children.map((c) => (
                            <li key={c.id}>
                              <a
                                href={`#${c.id}`}
                                className={cn(
                                  'block rounded-md px-2 py-1 text-[12.5px] transition-colors',
                                  activeId === c.id
                                    ? 'text-[#1a1a1a] font-medium'
                                    : 'text-[#868686] hover:text-[#1a1a1a]',
                                )}
                              >
                                {c.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
