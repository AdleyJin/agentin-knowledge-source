# 对话流交互动效规约 · Conversation Flow Motion Spec

> 阅读对象：前端开发 / 设计 review。
> 作用：把 Figma 上"对话流动效"的每一帧拆成可实现的参数清单，配合代码位置一一对应。
> 不在范围：通用动效原则、Token 定义见 [`motion-guidelines.md`](./motion-guidelines.md)。

---

## 0. 一句话概览

对话流是一个**单向、不可回退**的状态机，按 5 个 phase 串起来：

```
searching ─► reading ─► searchComplete ─► streaming ─► complete
   3 s        3.6 s         0.5 s          可变           ∞
```

整条流的总时长 ≈ `3 s + 3.6 s + 0.5 s + Σ(每 block 字数 × 20 ms × 1.05)`。
phase 流转由 `App.tsx` 的根 `useEffect` 调度（`src/App.tsx:124`），所有时长常量见下方 §1.2。

---

## 1. Phase 时间线总览

### 1.1 时间轴

下表 t=0 是用户提交问题的那一刻。

| t (ms) | phase | 视觉 | 主要事件 |
|---|---|---|---|
| 0 | `searching` | 仅一行 shimmer 文案 | "正在检索知识库..." 灰底白光循环 |
| 3000 | `reading` | shimmer 文案不变，下方资料区准备出场 | 切到 `text-start` 子步骤，停 100 ms |
| 3100 | `reading` | 资料区高度从 0 展开 + 资料逐条入场 | 切到 `sources-show`，3 s 内匀速进 6 条，超 3 条上滚 |
| 6100 | `reading` | 资料区高度从满收回到 0 | 切到 `sources-collapse`，400 ms |
| 6500 | `reading` | 仅剩 shimmer 文案 | 切到 `text-end`，停 100 ms |
| 6600 | `searchComplete` | shimmer 消失，"找到 6 篇知识库资料"出现，并固定停留 | 短暂停顿 500 ms，让用户看清 |
| 7100 | `streaming` | 答案块按字符流式输出、末尾闪烁光标 | 按 SCRIPT 顺序逐 block 进入 |
| ≈ T | `complete` | disclaimer + 操作按钮直接显示 | 收尾 |

### 1.2 时长常量（单一事实源）

```ts
// src/App.tsx
SEARCH_MS                   = 3000  // 检索阶段
READ_TEXT_START_MS          = 100   // 阅读·准备
READ_SOURCES_DISPLAY_MS     = 3000  // 阅读·资料展示
READ_SOURCES_COLLAPSE_MS    = 400   // 阅读·资料收回
READ_TEXT_END_MS            = 100   // 阅读·收尾
READ_MS                     = 3600  // = 上面四项之和
RESULTS_PAUSE_MS            = 500   // 「找到 N 篇」停顿
// streaming 阶段每 block 的时长 = ceil(block.text.length × CHAR_DUR_MS × 1.05)
CHAR_DUR_MS                 = 20    // src/data/script.ts
```

> ⚠️ 不允许在组件里硬编码这些数字；改时长只改这一处。

---

## 2. 每个 Phase 的动效细节

### 2.1 `searching` —— shimmer 文案

文件：`src/sections/chat/reading-indicator.tsx` 的 `<SearchingIndicator>`，CSS 在 `src/styles.css:184` 的 `.ag-shimmer-text`。

| 参数 | 值 |
|---|---|
| 文案 | "正在检索知识库..." |
| 字号 / 行高 | 12 / 18 px |
| 基础色 | `#868686` |
| 高光色 | `#E6E6E6` |
| 渐变 | `linear-gradient(90deg, #868686 0% 32%, #E6E6E6 50%, #868686 68% 100%)` |
| `background-size` | `250% 100%` |
| 关键帧 | `background-position` 从 `100% center` → `0% center` |
| 周期 | 1.8 s `linear`，无限循环 |
| 容器布局 | `mt-1 flex flex-col gap-2`（与 `<SourcesBlock>` 一致，避免阶段切换时高度跳变） |

> 容器宽度与下文 `<ReadingIndicator>` 完全一致，是为了让 `searching → reading` 切换时高度/留白不抖动——任何调整请保持两个组件外层 wrapper 同步。

### 2.2 `reading` —— 阅读 + 资料预览（4 个子步骤）

文件：`src/sections/chat/reading-indicator.tsx` 的 `<ReadingIndicator>`。
父 phase 不变，组件内部用 `step` 状态切换 4 个子步骤：

```
text-start → sources-show → sources-collapse → text-end
   100 ms       3000 ms          400 ms          100 ms
```

#### 2.2.1 `text-start` (0 → 100 ms)

仅显示 shimmer 文案"正在阅读知识库资料..."（同 §2.1 的 shimmer 配方）。资料区还没挂载到布局里。

#### 2.2.2 `sources-show` (100 → 3100 ms)

**资料区开框**

`<AgCollapse>` 包裹的资料 strip 从 `height: 0` 展开到内容自然高度。

| 参数 | 值 |
|---|---|
| 容器 | `border-l border-[#f4f4f4] px-3` 左侧 1 px 灰线 + 12 px 内边距 |
| 上下 padding | 4 px（`<AgCollapse padding={4}>`） |
| 展开 transition | `duration: 0.5 s, ease: ease.out`（`[0.22, 1, 0.36, 1]`） |
| 关闭 transition | `duration: 0.15 s` |
| 高度上限 | `MAX_VISIBLE_H = 3 × 22 + 2 × 8 = 82 px`（即最多容纳 3 行） |
| 溢出 | 一层 `max-height + overflow:hidden` 的剪裁层包裹列表，防左侧 border 漏出 |

**资料逐条入场**

按 `READ_SOURCES_DISPLAY_MS / SOURCES.length = 500 ms` 的固定间隔依次把 `visibleCount` 加 1。每条本身没有进场动画——直接出现在列表里，由父容器的高度增加 + 列表上滚来产生"接连冒出"的感觉。

| 参数 | 值 |
|---|---|
| 间隔 | 500 ms（= 3000 / 6） |
| 单行高 (`ITEM_H`) | 22 px（icon 18 + 上下 padding 4） |
| 行间距 (`GAP_H`) | 8 px |
| 标签样式 | 4 px 圆角，`#f5f5f5` 灰底，icon 18 × 18，类型字 10 px / `#868686` |
| 标题 | 12 px / `#868686`，`truncate` |

**第 4 / 5 / 6 条出现时——列表上滚**

第 N 条进入（N > 3）时，内部 `motion.div` 的 `y` 从 `0` 渐变到 `-(N-3) × (22 + 8) = -(N-3) × 30 px`，把第 1、2…条挤出可视区。

| 参数 | 值 |
|---|---|
| 动画属性 | `transform: translateY` |
| transition | `spring.layout`（stiffness 260, damping 30）+ 兜底 `duration: 0.4 s, ease.out`（reduced-motion 时使用） |
| 触发 | 每次 `visibleCount` 自增时由 motion 自动插值 |

#### 2.2.3 `sources-collapse` (3100 → 3500 ms)

`<AgCollapse open={false}>` —— 高度 + padding 在 `0.15 s` 内回到 0。
`text-end` 子步骤仅留 100 ms 让 shimmer 文案独立停一帧，避免"资料区刚消失就立刻切到下一 phase"的视觉断裂。

#### 2.2.4 关键交互不变量

- **不要**回到 `height: 'auto'` 的 tween（卡顿，详见 motion-guidelines §6.5）。
- **不要**移除 `max-height` 剪裁层，否则 6 条全在 DOM 时左侧 border 会漏出 3 条之外。
- 列表项始终挂在 DOM 里，`AgCollapse` 内部用 `inert` 屏蔽交互。

### 2.3 `searchComplete` —— 「找到 6 篇知识库资料」停顿

文件：`src/sections/chat/sources-block.tsx` 的 `<SourcesBlock>`。

`searchComplete` phase 持续 500 ms，期间已经渲染 `<AssistantMessage>`（但 `streaming || complete` 还都是 false），所以正文区还是空的，只有底部锚定的 `<SourcesBlock>` 出现。

| 元素 | 动效 |
|---|---|
| "找到 6 篇知识库资料" 标签 | 直接显示，不带专门入场动画（`.ag-rise` 当前为 no-op，但保留挂点） |
| 右侧 chevron | `<AgIconSwap>` 双状态 crossfade，state = `expanded ? 'up' : 'down'`，size 12 px |
| 用户点击展开 | `<AgCollapse open={expanded} padding={0}>` 把详细列表展开/收起 |
| 列表行 hover | 背景 `rgba(26,26,26,0.05)` 即时变更（CSS transition），右上角箭头从 `opacity-0` 渐显（CSS `transition-opacity`，无显式时长，使用浏览器默认 150 ms） |

> 这 500 ms 的"停顿感"非常重要：让用户在文字流式喷出之前，先看清"AI 引用了哪些资料"。**不要把这一段缩短到不可感知**。

### 2.4 `streaming` —— 答案流式输出

文件：`src/sections/chat/assistant-message.tsx`。

每个 SCRIPT block 按下表渲染：

| block.kind | 入场 | 流式效果 |
|---|---|---|
| `p` / `h3` / `olPrefix` | 直接挂到 DOM（`.ag-rise` 占位，无动画） | `<TypingAnimation>` 字符级追加，速度 50 字/秒 |
| `bullet` / `orderedItem` | 同上 | 同上；输入完后在末尾追加引用 chip `<SourceMarker>` |
| `divider` | 仅当 `isPast` 时才挂载，瞬时显示 | — |
| `images` | 进入 `current` 时显示 3 个 `Skeleton` 占位（带 shimmer），切到 `past` 时换成 `<ImageGallery>` | — |

#### 2.4.1 字符级打字

| 参数 | 值 |
|---|---|
| 单字时长 | `CHAR_DUR_MS = 20 ms`（≈ 50 字/秒） |
| 实现 | Magic UI `<TypingAnimation>`，`startOnView={false}, showCursor={false}` |
| 单元 | 按 `Array.from(text)` 切 grapheme，CJK 不被拆字 |
| 触发 | 父层 cursor `stream.blockIdx` 指向时挂载，自身从 char=0 开始 |

> ⚠️ "只有当前 block 用 `<TypingAnimation>`，过去 block 渲染成普通 `<span>`" 是这里最关键的一条不变量——不然每一次 cursor 推进都会让全部历史文字重新打字一遍。

#### 2.4.2 末尾光标 `<Caret>`

文件：`src/sections/chat/caret.tsx`。

| 参数 | 值 |
|---|---|
| 形态 | 6 × 14 px、圆角 1 px、`#1a1a1a`、`marginLeft: 2 px`、`verticalAlign: -2 px` |
| 闪烁 | `opacity` 关键帧 `[1, 1, 0, 0]`，`times: [0, 0.499, 0.5, 1]`，`duration: 0.9 s`，`linear`，`repeat: Infinity` |
| 行为 | 翻转刚好在 50% 时刻发生（无渐变），与原 CSS `steps(2, start)` 视觉一致 |
| 显示位置 | 当前 block 的 `<TypingAnimation>` 之后，past block 不渲染光标 |
| reduced-motion | 自动停止闪烁（全局 `<MotionConfig reducedMotion="user">`） |

#### 2.4.3 引用标记 `<SourceMarker>`

`bullet` / `orderedItem` 在 `isPast=true` 时把 `cites` 数组里每个引用号渲染为 inline chip。chip 自身的 hover/tooltip 动效不在本 spec 范围（见 `source-marker.tsx`）。

#### 2.4.4 图片块 `images`

| 状态 | 视觉 | 动效 |
|---|---|---|
| `current` | 3 个 `<Skeleton>`（4:3 比例、12 px 圆角、灰底） | Skeleton 内部一段灰色横向 shimmer（`@keyframes shimmer`，2 s 周期，`-100% → 100% translateX`） |
| `past` | `<ImageGallery>`：桌面 3 列等宽 5:4 网格 / 移动端横向滑动条 | hover 时 `scale(1.02)`，`transition: transform 0.3s` |

#### 2.4.5 滚动跟随 + 置底悬浮按钮

文件：`src/App.tsx` 的 `<ChatPanel>`（桌面）/ `<MobileChatPanel>`（移动）。

| 行为 | 触发 | 实现 |
|---|---|---|
| 流式期间自动追随到底部 | `useLayoutEffect([stream, phase])`，`pinnedRef.current === true` 时 | `el.scrollTo({ top: scrollHeight, behavior: 'instant' })`，必须在浏览器跑 ResizeObserver 之前同步执行 |
| 内容增长时保持 pin | `ResizeObserver` 回调，`pinnedRef.current === true` 时 | 直接 re-snap 到底部，**不重新测量距离**——避免按钮 1 帧闪现 |
| 用户主动上滑 → 释放 pin | `scroll` 事件 | `distance = scrollHeight - scrollTop - clientHeight > PIN_THRESHOLD(8 px)` 时 `pinned = false` |
| 置底悬浮按钮显隐 | `visible = !pinned` | 32 × 32 白圆 + 1 px 灰边 + `0_4px_8px_rgba(0,0,0,0.05)` 阴影；`opacity: 0/1` + `translate-y-2/0`，`transition-all 0.2 s ease-out` |
| 点击按钮回底 | manual click | `el.scrollTo({ top: scrollHeight, behavior: 'smooth' })` —— 这是唯一一个使用平滑滚动的入口 |

> ⚠️ thread 容器**不要**加 `scroll-smooth` 类。CSS 平滑会让自动追随永远落后于内容增长，叠加观察者竞态会导致按钮反复闪烁。

### 2.5 `complete` —— 收尾

| 元素 | 动效 |
|---|---|
| 已输出的全部 block | `isCurrent=false`，光标移除；非 text block（divider / images）瞬时显示完整状态 |
| `<SourcesBlock>` | 保持原状（已经在 `searchComplete` 时挂载） |
| disclaimer "内容由 AI 生成..." | 直接挂载，`.ag-rise` 占位（当前为 no-op） |
| `<MessageActions>` | 直接挂载，4 个 32 × 32 图标按钮，hover 加 `bg-black/5`（CSS 默认 transition） |

---

## 3. 用户消息气泡

文件：`src/sections/chat/user-bubble.tsx`。

| 参数 | 值 |
|---|---|
| 对齐 | 右对齐（`flex justify-end`） |
| 背景 | `var(--ag-bubble-user)` |
| 圆角 | 12 px |
| padding | `px-3 py-2.5` |
| 字号 / 颜色 | 14 px / `#000` |
| 最大宽度 | 容器 80% |
| 入场动画 | 当前为 no-op（`.ag-rise` 占位）。如需恢复参考 motion-guidelines §4.1 的 `<AgFade>` |

---

## 4. 浮层与外围（与对话流并存的辅助动效）

| 模块 | 文件 | 动效 |
|---|---|---|
| 引用 tooltip | `src/components/agentin/source-marker.tsx` | Radix Tooltip，进入 120 ms `dur.fast` fade |
| 移动端来源 sheet | `src/sections/mobile/sheets.tsx` | `<AgSheet>` —— `sheetVariants` slide-up + `scrimVariants` 背景 fade |
| 图片 lightbox | `src/sections/chat/image-lightbox.tsx` | `scale 0.96→1, opacity 0→1`，`duration: 0.4 s, ease.out`；scrim 用 `scrimVariants`。**禁止** spring（参见 motion-guidelines §6.3） |
| 顶部 chrome / sidebar / RestartBar | `src/App.tsx` | L3 区域，**不做动效** |

---

## 5. 可访问性

- 全局 `<MotionConfig reducedMotion="user">` 已加在 `src/main.tsx`，所有 motion/react 动效会自动尊重 OS 的 "reduce motion" 设置。
- CSS `@keyframes`（`.ag-shimmer-text`、`@keyframes shimmer`、`@keyframes ag-shimmer-sweep`、`@keyframes blink-cursor`）需手动写 `@media (prefers-reduced-motion: reduce)` 兜底。当前 `.ag-shimmer-text` 已经有兜底（`src/styles.css:209`），其余 keyframe 在 reduce-motion 下也应保持禁用——对应位置如有新增，请补足。
- 任何带 `setTimeout` 串的 phase 调度，使用时长可被动态读取，但当前 demo 不会因 reduce-motion 而压缩——这是有意的：用户必须看到完整的 phase 顺序才能理解流程。

---

## 6. 文件 ↔ 动效 速查

| 关心什么 | 看哪 |
|---|---|
| 整个 phase 状态机 + 时长常量 | `src/App.tsx:79-105`、`src/App.tsx:124-177` |
| Token (duration / ease / spring / variants) | `src/lib/motion.ts` |
| shimmer / 阅读资料预览 | `src/sections/chat/reading-indicator.tsx` |
| 「找到 N 篇」展开 | `src/sections/chat/sources-block.tsx` |
| 字符级打字 + 光标 + 块渲染 | `src/sections/chat/assistant-message.tsx`、`src/sections/chat/caret.tsx`、`src/components/magicui/typing-animation.tsx` |
| 滚动跟随 + 置底按钮 | `src/App.tsx`（`ChatPanel` / `MobileChatPanel`） |
| Collapse 引擎（高度 ResizeObserver tween） | `src/components/motion/ag-collapse.tsx` |
| Icon 双态 crossfade | `src/components/motion/ag-icon-swap.tsx` |
| 通用动效准则 / 反模式 | `docs/motion-guidelines.md` |

---

## 7. 改动 checklist

提交涉及对话流动效的 PR 前过一遍：

- [ ] 改的是 phase 时长？只改了 `src/App.tsx` 的常量，没在组件里另写一份？
- [ ] 改的是动效曲线/时长？参数从 `src/lib/motion.ts` 取，没有 magic number？
- [ ] 改了 `<ReadingIndicator>` 的 4 个子步骤之一？同步检查父 `READ_MS` 是否仍等于 4 项之和？
- [ ] 动了滚动逻辑？验证流式输出全程"置底按钮稳定不显示"、用户主动上滑后"按钮稳定显示"、点按钮"平滑回到底部"三种场景都正常？
- [ ] 给 `<TypingAnimation>` 加了新 wrapper？保留 `startOnView={false}` 与 `showCursor={false}`，并核实当前 block 才挂载？
- [ ] 新增 CSS keyframe？补 `@media (prefers-reduced-motion: reduce)` 兜底？
