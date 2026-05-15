/**
 * Barrel for the Agentin "ag-motion" semantic layer.
 *
 * Components in here are state-driven, design-token-aware wrappers
 * around `motion/react`. They replace the legacy `.t-*` and `.ag-*`
 * CSS animation utilities one-for-one. See `docs/motion-guidelines.md`
 * (Stage 4) for usage rules.
 */

export { AgFade, type AgFadeProps } from './ag-fade'
export { AgPanel, type AgPanelProps } from './ag-panel'
export { AgSheet, type AgSheetProps } from './ag-sheet'
export { AgPageSwitch, type AgPageSwitchProps } from './ag-page-switch'
export { AgIconSwap, type AgIconSwapProps } from './ag-icon-swap'
export { AgBadgePop, type AgBadgePopProps } from './ag-badge-pop'
export { AgCollapse, type AgCollapseProps } from './ag-collapse'
