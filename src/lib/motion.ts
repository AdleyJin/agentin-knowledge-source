/**
 * Motion design tokens for Agentin.
 *
 * Single source of truth for every duration / ease / spring used by
 * `motion/react`. All `ag-*` motion components and any inline animation
 * in `App.tsx` should import from this file instead of hard-coding numbers.
 *
 * Conventions:
 *   - Durations are in **seconds** (Motion's native unit).
 *   - Eases are cubic-bezier tuples typed as `Easing` so Motion's TS
 *     accepts them without `as const` gymnastics at the call site.
 *   - Springs are pre-tuned for specific UI roles (pop / panel / sheet)
 *     so visual rhythm stays consistent across the app.
 */

import type { Easing, Transition, Variants } from 'motion/react'

// ── Durations ────────────────────────────────────────────────────────
// Picked to preserve the visual "feel" of the original CSS-keyframe
// system that this file replaced (.ag-slide-down/up, .t-* tokens from
// the old transitions.css). `page` is intentionally the shortest —
// page swaps have to feel instant.
export const dur = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  page: 0.2,
} as const

// ── Eases ────────────────────────────────────────────────────────────
// `out`     — primary easing for entrances (matches the legacy CSS default).
// `inOut`   — symmetric, used for state toggles where direction is unclear.
// `bounce`  — playful overshoot for "pop" entrances (badges, digits).
// `swiftIn` — sharp acceleration, used for exits.
export const ease = {
  out: [0.22, 1, 0.36, 1] as Easing,
  inOut: [0.4, 0, 0.2, 1] as Easing,
  bounce: [0.34, 1.36, 0.64, 1] as Easing,
  swiftIn: [0.55, 0.06, 0.68, 0.19] as Easing,
}

// ── Springs ──────────────────────────────────────────────────────────
// Reach for these instead of new spring configs ad-hoc. If you need a
// different feel, add a *named* preset here so the rest of the app can
// reuse it.
export const spring = {
  /** Snappy pop for badges, toggles, icon swaps. */
  pop: { type: 'spring', stiffness: 420, damping: 26 } satisfies Transition,
  /** Larger surfaces (panels, cards) — slower, more substantial. */
  panel: { type: 'spring', stiffness: 280, damping: 32 } satisfies Transition,
  /** iOS-style bottom sheet drag/release. */
  sheet: { type: 'spring', stiffness: 500, damping: 42 } satisfies Transition,
  /** Layout reflow (FLIP) — gentle so resizing reads as continuous. */
  layout: { type: 'spring', stiffness: 260, damping: 30 } satisfies Transition,
}

// ── Common transitions (non-spring) ──────────────────────────────────
export const tx = {
  fast: { duration: dur.fast, ease: ease.inOut } satisfies Transition,
  base: { duration: dur.base, ease: ease.out } satisfies Transition,
  slow: { duration: dur.slow, ease: ease.out } satisfies Transition,
}

// ── Variants library ─────────────────────────────────────────────────
// Each `Variants` object below has the canonical 3 states:
//   `hidden` → `visible` → `exit`
// so they all plug into <AnimatePresence> the same way.

/**
 * Y-axis fade. Default direction is "down" (enters from above, exits up)
 * to match the legacy `.ag-slide-down` / `.ag-slide-up` pair.
 */
export const fadeVariants = (
  direction: 'up' | 'down' = 'down',
  distance = 8,
): Variants => {
  const offset = direction === 'down' ? -distance : distance
  return {
    hidden: { opacity: 0, y: offset, transition: tx.fast },
    visible: { opacity: 1, y: 0, transition: tx.base },
    exit: { opacity: 0, y: offset, transition: tx.fast },
  }
}

/**
 * Modal / dialog scale-in. Mirrors the legacy `.t-modal` pattern.
 */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, transition: tx.fast },
  visible: { opacity: 1, scale: 1, transition: tx.base },
  exit: { opacity: 0, scale: 0.96, transition: tx.fast },
}

/**
 * Origin-aware dropdown / popover. Pass the same `origin` string into
 * `style={{ transformOrigin }}` on the `motion.div` consuming this.
 */
export type DropdownOrigin =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, transition: tx.fast },
  visible: { opacity: 1, scale: 1, transition: tx.base },
  exit: { opacity: 0, scale: 0.99, transition: tx.fast },
}

export const originToCSS = (origin: DropdownOrigin): string =>
  origin.replace('-', ' ')

/**
 * Page / view switcher. Caller passes `direction` (1 forward, -1 back)
 * via `custom`, e.g. `<motion.div custom={dir} variants={pageVariants}>`.
 */
export const pageVariants: Variants = {
  enter: (dir: 1 | -1) => ({
    x: dir * 8,
    opacity: 0,
    filter: 'blur(3px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: dur.page, ease: ease.out },
  },
  exit: (dir: 1 | -1) => ({
    x: dir * -8,
    opacity: 0,
    filter: 'blur(3px)',
    transition: { duration: dur.page, ease: ease.out },
  }),
}

/**
 * Pop-in for small attention markers (notification dot, badge, etc.).
 * Combines scale + opacity + slight blur for a tactile entrance.
 */
export const badgePopVariants: Variants = {
  hidden: { scale: 0, opacity: 0, filter: 'blur(2px)', transition: tx.fast },
  visible: { scale: 1, opacity: 1, filter: 'blur(0px)', transition: spring.pop },
  exit: { scale: 0, opacity: 0, filter: 'blur(2px)', transition: tx.fast },
}

/**
 * Bottom-sheet slide-up (mobile). Y in viewport-percent so the same
 * variant works at any sheet height.
 */
export const sheetVariants: Variants = {
  hidden: { y: '100%', transition: { duration: 0.16, ease: ease.swiftIn } },
  visible: { y: 0, transition: spring.sheet },
  exit: { y: '100%', transition: { duration: 0.16, ease: ease.swiftIn } },
}

/**
 * Backdrop scrim that pairs with `sheetVariants` / modals.
 */
export const scrimVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: ease.inOut } },
}

/**
 * Stagger container — apply to a parent <motion.ul> / <motion.div> and
 * its `visible` children will animate in one after another.
 */
export const staggerParent = (stagger = 0.04): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
  exit: { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
})

/**
 * Default child variant for `staggerParent`. Subtle fade + 4px lift.
 */
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: tx.base },
  exit: { opacity: 0, y: 4, transition: tx.fast },
}
