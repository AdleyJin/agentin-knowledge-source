import { useReducedMotion, type Transition } from 'motion/react'

/**
 * Returns a Motion `Transition` that respects the user's
 * `prefers-reduced-motion` setting.
 *
 * When the user has reduced motion enabled, we return a transition that
 * snaps to the end state with `duration: 0`. Otherwise we return the
 * caller-supplied transition unchanged.
 *
 * Use this whenever you build a one-off transition inline in a
 * component. For shared variants, prefer the `tx.*` / `spring.*`
 * presets in `src/lib/motion.ts` and rely on the global
 * `<MotionConfig reducedMotion="user">` wrapper in `main.tsx`.
 *
 * @example
 *   const transition = useAgTransition({ duration: 0.3, ease: 'easeOut' })
 *   return <motion.div animate={{ opacity: 1 }} transition={transition} />
 */
export function useAgTransition(transition: Transition): Transition {
  const reduced = useReducedMotion()
  if (reduced) return { duration: 0 }
  return transition
}

/**
 * Convenience: returns `true` when the user prefers reduced motion.
 * Mirrors `useReducedMotion` so consumers don't have to import directly
 * from `motion/react` for this single check.
 */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false
}
