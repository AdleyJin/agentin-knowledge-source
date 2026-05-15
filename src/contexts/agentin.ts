import { createContext, type RefObject } from 'react'

/**
 * Lightbox / overlay host.
 *
 * `DesktopWindow` and `MobilePhoneFrame` each render a transparent
 * `<div ref={lightboxHostRef}>` covering the inside of their own frame.
 * Children that need to render an overlay (image lightbox, mobile
 * bottom sheets) read this ref and `createPortal` into it so the
 * overlay is clipped to the device, not the whole browser viewport.
 */
export const LightboxHostContext = createContext<
  RefObject<HTMLDivElement | null> | null
>(null)

/**
 * View mode — desktop vs mobile shell.
 *
 * Mostly read by layout-aware children (image gallery: 3 tiles on
 * desktop, 2 on mobile; source marker: tooltip on desktop, sheet on
 * mobile). Provided by `DesktopWindow` and `MobilePhoneFrame`
 * respectively.
 */
export const ViewModeContext = createContext<'desktop' | 'mobile'>('desktop')

/**
 * Mobile bottom-sheet controller.
 *
 * Lets any child component (SourceMarker, SourcesBlock, …) open a
 * bottom sheet without prop-drilling. Provided by `MobilePhoneFrame`.
 */
export type MobileSheetState =
  | null
  | { kind: 'sources' }
  | { kind: 'cite'; n: number }

export interface MobileSheetCtrl {
  openSheet: (s: NonNullable<MobileSheetState>) => void
  closeSheet: () => void
}

export const MobileSheetContext = createContext<MobileSheetCtrl | null>(null)
