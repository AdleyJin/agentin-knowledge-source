# 动效指南 · Motion Guidelines

> 来源：本仓库 2026-05 完成的 "Motion + Magic UI" 重构沉淀。
> 用途：在新增动效或调整既有动效时给出**做不做**与**怎么做**的统一答案。
> 阅读对象：前端、设计师、AI Agent。

---

## 0. North Star · 动效的唯一目标

> **动效服务于信任感的连续体，不是装饰。**
> 它必须让用户**理解发生了什么**或**感知到完成了什么**，否则就不应该存在。

判断一个动效该不该做的钢印，借用主设计指南里的同一把尺子（[§0 信任感](./knowledge-source-design-guide.md)）：

- 它**降低了**用户的认知成本（看清状态在变化、感知到流程到了哪一步）→ 通过。
- 它**只是更好看**或者"让界面活一点"→ 不通过。
- 它让用户的**视线被引去无关位置**或**在阅读中产生干扰** → 反向，必须否决。

任何与"信任感连续体"无关的动效，都应该不做。

---

## 1. 取舍原则 · 哪些区域才允许动效

把界面按"用户视线焦点"分三层：

| 层 | 范围 | 动效准入 |
|---|---|---|
| **L1 主流（Chat Panel）** | 用户消息、AI 流式回答、来源块、阅读指示器、图廊与灯箱 | ✅ **必须做**——这是信任感发生的地方 |
| **L2 主流上的浮层** | Mobile bottom sheet、citation tooltip、source sheet | ✅ **必须做**——开关本身需要被感知 |
| **L3 外围控件** | 顶部 chrome、左侧 sidebar、底部固定 RestartBar、桌面/手机切换、ViewToggle | ❌ **不做**——不在阅读视线，加动效只会变成噪音 |

> **本次重构两次回退（页面切换 + 重启按钮 shimmer）的根因都是把 L3 当成了 L1。**
> 任何"为了使用 motion 库而 motion"的改动都会被这条原则筛掉。

---

## 2. Tokens · 一个数都不要硬编码

动效参数全部从 [`src/lib/motion.ts`](../src/lib/motion.ts) 拿。**禁止**在组件里写 `duration: 0.4` 或 `[0.22, 1, 0.36, 1]` 这种字面量。

### 2.1 Durations（秒）

| Token | 值 | 用途 |
|---|---|---|
| `dur.fast` | `0.15` | 退场、关闭、状态收回——"快但不突兀" |
| `dur.base` | `0.25` | 入场、展开、状态推进——大多数情况都用它 |
| `dur.slow` | `0.40` | 强调性入场（如 lightbox 的图片 spring） |
| `dur.page` | `0.20` | 页面级切换——必须感觉接近瞬时 |

### 2.2 Eases（cubic-bezier）

| Token | 值 | 用途 |
|---|---|---|
| `ease.out` | `[0.22, 1, 0.36, 1]` | **入场首选**，单调减速，没有过冲 |
| `ease.inOut` | `[0.4, 0, 0.2, 1]` | 状态切换，方向不明显时 |
| `ease.bounce` | `[0.34, 1.36, 0.64, 1]` | 小元素 pop（badge / 数字） |
| `ease.swiftIn` | `[0.55, 0.06, 0.68, 0.19]` | 退场加速曲线 |

### 2.3 Springs

```ts
spring.pop    // stiffness 420, damping 26 — 小元素弹入（badge、icon swap）
spring.panel  // stiffness 280, damping 32 — 较大表面（panel、card）
spring.sheet  // stiffness 300, damping 34 — iOS 式 bottom sheet
spring.layout // stiffness 260, damping 30 — FLIP 布局重排
```

> **避坑**：`spring.pop` 阻尼比 0.63（欠阻尼），有过冲。它适合**视觉上有惯性预期**的小元素（图标、徽章、emoji 反应）。**不要**用在大块矩形或图片上——过冲会被读作"末段加速"。**lightbox 图片入场就踩过这个坑**，最终改回 `dur.slow + ease.out` 的 tween。

### 2.4 已封装的 Variants

```ts
fadeVariants(direction, distance)  // Y 轴 fade，AgFade 默认源
modalVariants                       // 缩放入场，dialog/lightbox 用
dropdownVariants                    // origin-aware dropdown
pageVariants                        // 方向感页面切换（仅 L1/L2 切换才用）
badgePopVariants                    // 小徽章 spring pop
sheetVariants                       // bottom sheet slide-up
scrimVariants                       // 任何 backdrop 都用这个
staggerParent / staggerChild        // 列表/卡片错峰入场
```

---

## 3. 组件分层 · 永远从最高层开始选

**优先级从高到低**——能用现成的就别自己写 motion 调用：

```
1. Magic UI 完成品（src/components/magicui/）
        ↓ 没有合适的
2. ag-* 语义层（src/components/motion/）
        ↓ 没有合适的
3. 在场景内直接写 motion/react variants
        ↓ 自己写的 variants 有第二处使用
   ↑ 把它沉淀回 src/lib/motion.ts
```

### 3.1 Magic UI 完成品

| 组件 | 适用场景 | 已使用位置 |
|---|---|---|
| `<TypingAnimation>` | 字符级流式打字 | `AssistantMessage` 文本块 |
| `<NumberTicker>` | 数字滚动到目标值 | （未启用，候选：sources count "找到 N 篇"） |
| `<BlurFade>` | 视口可见时 fade-in | （未启用） |
| `<AnimatedList>` | 列表元素错峰入场 | （未启用） |
| `<ShimmerButton>` | 跑马灯按钮 | （已尝试，因 RestartBar 不在 L1 而撤回） |

> **TypingAnimation 注意**：upstream 在 `as="span"` 时硬编码了 `leading-20 inline-block`（v4 下行高变 80px 且无法换行）。本仓库的副本 [`src/components/magicui/typing-animation.tsx`](../src/components/magicui/typing-animation.tsx) 已修补此问题，**升级时务必保留这个 patch**。

### 3.2 ag-\* 语义层

7 个组件覆盖 95% 场景，[barrel 入口](../src/components/motion/index.ts)：

| 组件 | 替代的 CSS | 何时用 |
|---|---|---|
| `<AgFade>` | `.ag-slide-down/up` | 任何 mount/unmount 的 Y 轴 fade |
| `<AgPanel>` | `.t-panel-slide` | 大型面板入场（带 cross-blur） |
| `<AgSheet>` | `.ag-sheet-panel/scrim` | iOS 式 bottom sheet（带 drag-to-dismiss） |
| `<AgPageSwitch>` | `.t-page-slide` | **仅 L1/L2 内**的方向感页面切换；L3 view toggle **禁用** |
| `<AgIconSwap>` | `.t-icon-swap` | 双状态图标的 crossfade |
| `<AgBadgePop>` | `.t-badge` | 通知红点、状态徽章 |
| `<AgCollapse>` | inline height transition | 垂直展开/折叠（带 ResizeObserver 量准确高度） |

> **AgCollapse 性能注意**：早期版本用 `height: 'auto'` 导致明显卡顿。当前实现通过 `useLayoutEffect + ResizeObserver` 同步量出像素高度，再让 motion 在 `0` 与具体数值之间 tween。如需修改，**不要**回到 `'auto'`。

### 3.3 直接 motion/react

只有当上述都不合适时才下沉。原则：

- 用 `MotionValue` / `useSpring` 时**先想清楚**有没有 ag-\* 能复用
- 写完后立即问自己：**这个 variants 会被第二处用吗？**——会的话沉淀到 `src/lib/motion.ts`
- **绝不**在 JSX 里写 `[0.22, 1, 0.36, 1]` 这种 magic number

---

## 4. 实施模式 · 六个高频 Recipe

### 4.1 状态出现/消失

```tsx
import { AgFade } from '@/components/motion'

<AgFade open={visible} direction="down">
  <YourContent />
</AgFade>
```

### 4.2 垂直展开/折叠（高度不固定）

```tsx
import { AgCollapse } from '@/components/motion'

<AgCollapse open={expanded}>
  {/* children 始终挂载，AgCollapse 会用 ResizeObserver 量准确高度 */}
</AgCollapse>
```

### 4.3 Bottom sheet

```tsx
import { AgSheet } from '@/components/motion'

<AgSheet open={open} onClose={() => setOpen(false)}>
  <YourSheetBody />
</AgSheet>
```

### 4.4 Lightbox / Modal（开关都需要平滑）

```tsx
import { AnimatePresence, motion } from 'motion/react'
import { dur, ease, scrimVariants } from '@/lib/motion'

<AnimatePresence>
  {open && (
    <motion.div variants={scrimVariants} initial="hidden" animate="visible" exit="exit">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0, transition: { duration: dur.fast, ease: ease.inOut } }}
        transition={{ duration: dur.slow, ease: ease.out }}
      >
        <YourContent />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

> **关键**：scale 与任何 inline `transform` 不能共存。如需要旋转，用 `animate={{ rotate: deg }}` 让 motion 统一接管 transform，**不要**用 `style={{ transform: 'rotate(...)' }}`。

### 4.5 流式文字打字

```tsx
import { TypingAnimation } from '@/components/magicui/typing-animation'

<TypingAnimation as="span" duration={CHAR_DUR_MS} startOnView={false} showCursor={false}>
  {text}
</TypingAnimation>
```

### 4.6 流式输出不要光标

本仓库的流式回答采用 Magic UI 的 "Without Cursor" 预设（`showCursor={false}`），不渲染任何 caret/cursor。

理由：

- 块级入场 fade 已经清晰指示了 "现在在流式输出哪一块"
- 在多行答案中光标会随着行切换跳跃，反而成为视觉噪音
- 引入额外的 caret 元素会让父容器在 typing 期间发生宽度抖动

如果未来确实需要 caret，**不要**写 CSS keyframes，用 `motion/react` 的 `animate` + `transition.repeat`，但必须先回答：它真的提升了用户对"系统在工作"的感知吗？

---

## 5. 可访问性 · prefers-reduced-motion

全局已在 [`src/main.tsx`](../src/main.tsx) 包了 `<MotionConfig reducedMotion="user">`，所有 motion/react 动效自动尊重 OS 设置。

仍需要手动判断的情况（CSS keyframes、inline transition、setTimeout 串）：

```tsx
import { useAgTransition } from '@/hooks/useAgTransition'

const transition = useAgTransition({ duration: dur.base, ease: ease.out })
// reduced motion 下会自动变成 { duration: 0 }
```

> **本仓库已经清理了所有 CSS keyframes，理论上不再需要这个 hook**——它是给未来新写 setTimeout 串的人用的。

---

## 6. 反模式 · 什么样的动效一定不要做

下列模式在本次重构中被尝试并撤回，引以为戒：

### 6.1 给"切换控件"加方向感页面切换

> **场景**：把"桌面 ↔ 手机"切换包成 `<AgPageSwitch>`，让两个原型左右滑动。
> **失败原因**：用户切换的目的是"看另一种 UI"，不是"看一个翻页动画"。这种切换是 L3 控件触发的，不在阅读视线焦点上。中间 `mode="wait"` 的间隙反而被读作"卡了一下"。
> **教训**：方向感切换只用在**主流内**的 page-like 区域（如阅读 → 详情）。

### 6.2 给"收尾按钮"加跑马灯

> **场景**：phase=complete 后给"重新开始"按钮加 ShimmerButton 微光，作为"可以重玩"的引导。
> **失败原因**：RestartBar 是固定底部的 L3 控件。即便 shimmer 只在 complete 触发，它也只是装饰——用户看完答案的下一步动作是**回看内容**，不是马上重玩。把视线拉到 L3 反而是干扰。
> **教训**：动效不能"为状态而动"，要"为用户的下一个动作而动"。

### 6.3 在大矩形/图片上用 spring.pop

> **场景**：lightbox 图片用 `spring.pop` 入场。
> **失败原因**：`spring.pop` 阻尼比 0.63，过冲约 5%。在 emoji 大小的元素上读作"弹"，在屏幕大小的图片上读作"末段不自然加速"。
> **教训**：spring 的视觉感知与元素尺寸成反比。大元素用 `dur.slow + ease.out` 的 tween。

### 6.4 让 motion 与 inline `style.transform` 抢同一个 CSS 属性

> **场景**：lightbox 图片同时设 `style={{ transform: 'rotate(Ndeg)' }}` 和 motion 的 `animate={{ scale: 1 }}`。
> **失败原因**：Motion 接管整个 `transform` 属性，inline rotate 在动画期间失效，等动画结束 inline rotate 才"补"上去——肉眼看就是"末端突然 expand"。
> **教训**：transform 子属性（scale/x/y/rotate）只能由一个系统管理。要么全交给 motion 的 `animate`，要么用 wrapper div 把动画与持久 transform 隔开。

### 6.5 在 `height: 'auto'` 之间 tween

> **场景**：AgCollapse 早期版本直接 `animate={{ height: 'auto' }}`。
> **失败原因**：每帧重新 layout，浏览器主线程被吃满，肉眼可见卡顿。
> **教训**：高度动画必须有具体数值。用 `useLayoutEffect + ResizeObserver` 量出来，再 tween 数字。

---

## 7. 新增动效的 checklist

提交一个新 motion 改动前，过一遍：

- [ ] 它发生在 L1 或 L2 区域吗？（如果是 L3，停止）
- [ ] 它服务于"等待 / 阅读 / 验证"哪一段？说不出来就不做。
- [ ] 时长 / 缓动 / spring 全部从 `src/lib/motion.ts` 拿，没有 magic number？
- [ ] 优先级顺序：Magic UI > ag-\* > 自写 motion——是否走完了一遍？
- [ ] 大于一个屏幕区块的元素，用了 tween 而不是 spring？
- [ ] 同一个 transform 子属性只被一个系统管理？
- [ ] reduced motion 行得通？（用 motion/react 一般自动满足）
- [ ] 写完是否会被第二处使用？是的话沉淀到 `lib/motion.ts` 或 `components/motion/`。

---

## 8. 重构后的代码地图

```
src/
├── lib/motion.ts                    # 单一 token 源
├── hooks/useAgTransition.ts         # 给非 motion 代码用的 reduced-motion 钩子
├── components/
│   ├── motion/                      # 7 个 ag-* 语义层组件
│   │   ├── ag-fade.tsx
│   │   ├── ag-panel.tsx
│   │   ├── ag-sheet.tsx
│   │   ├── ag-page-switch.tsx
│   │   ├── ag-icon-swap.tsx
│   │   ├── ag-badge-pop.tsx
│   │   ├── ag-collapse.tsx
│   │   └── index.ts                 # barrel
│   └── magicui/                     # Magic UI 副本（带本地 patch）
│       ├── typing-animation.tsx     # ⚠️ 升级时保留 line-height patch
│       ├── number-ticker.tsx
│       ├── blur-fade.tsx
│       ├── animated-list.tsx
│       └── shimmer-button.tsx
├── sections/                        # 按用户旅程切片的业务组件
│   ├── chat/
│   │   ├── assistant-message.tsx    # AgCollapse + TypingAnimation (no cursor)
│   │   ├── reading-indicator.tsx    # AgCollapse + Y-fade
│   │   ├── sources-block.tsx        # AgCollapse + AgIconSwap
│   │   ├── image-gallery.tsx
│   │   ├── image-lightbox.tsx       # AnimatePresence + scrim/spring/tween 组合
│   │   ├── message-actions.tsx
│   │   └── user-bubble.tsx
│   └── mobile/
│       └── sheets.tsx               # AgSheet × 多个
└── styles.css                       # 仅剩：design tokens + .ag-shimmer-text + .ag-iphone* 设备外观
```

历史包袱（**已删除**，不要找）：

- ~~`transitions.css`~~ — `.t-*` 全套 CSS 动效，已被 `ag-*` 语义层完全替代
- ~~`@keyframes ag-caret / ag-slide-down / ag-slide-up / ag-sheet-in / ag-sheet-fade`~~ — 已迁移到 motion/react

---

## 9. 维护规则

- 新 ag-\* 语义层组件：在 `components/motion/` 下加文件 + 更新 `index.ts` barrel + 在本文档 §3.2 表格中登记。
- 新 motion variants：定义在 `src/lib/motion.ts` 的 `Variants library` 区，命名 `<role>Variants`。
- 升级 Magic UI 副本：用 `pnpx shadcn@latest add` 拉新版后 **diff 本地 patch**，确认没有覆盖 `typing-animation.tsx` 的 line-height 修复。
- 任何对动效"该不该做"的争议：回到 §0 + §1 决策。
