# 知识库索引 · 设计指导（Design Guide for Vibe Design & Vibe Coding）

> 来源：基于 Figma《AgentIn 界面设计 · 知识库索引——需求分析》（节点 6692:248085）的二次提炼。
> 用途：同时服务于 **Vibe Design**（Figma / Pencil 中重构界面）与 **Vibe Coding**（在本仓库 React 19 + Tailwind v4 + shadcn/ui 中落地）。
> 阅读对象：设计师、产品、前端，以及对它们进行编排的 AI Agent。

---

## 0. North Star · 一句话设计目标

> **「信任感」是用户在知识库索引场景的核心诉求。所有交互与视觉决策，都必须回答同一个问题：这一处设计有没有让用户更敢相信 AI 的回答？**

判断一个方案好坏的唯一钢印：

- 它**降低了**用户对回答真实性的怀疑成本，→ 通过。
- 它**只是更好看**但与信任感无关，→ 不通过。
- 它让用户**更怀疑**或**更费力地核实**，→ 反向，必须否决。

---

## 1. 核心心智模型 · 信任感是连续体，不是节点

信任感不是一次性的「附上来源」动作，而是贯穿一次对话的三段连续体验：

```
等待时建立预期   →   阅读时逐句确认   →   存疑时即时核查
   (Anticipation)        (Continuous)        (Verification)
```


| 阶段      | 用户的潜台词                 | 我们要做的                         | 失败的代价                       |
| ------- | ---------------------- | ----------------------------- | --------------------------- |
| **等待时** | "它卡住了？还是真在查？要等多久？"     | 让用户**看见 AI 在真实检索**，建立"有根据"的预期 | 5 秒感觉像 15 秒，焦虑放大；信任未建立先被消耗  |
| **阅读时** | "这句结论有没有出处？我不想现在停下来查。" | 角标随答案**同步出现**，每个结论都有对应来源      | 来源与结论割裂，用户要么忽略要么打断阅读        |
| **存疑时** | "刚才这句我想确认一下。"          | 让验证成本**趋近于零**——hover 即可看证据    | 离开上下文（3-5 步）= 阅读位置丢失 = 来源失效 |


**这是判断功能完整性的最低标准：三段都成立，信任感才成立。任何一段缺位，整体感受会塌陷。**

---

## 2. 现状诊断 · 现行页面的三个方向性缺陷

> 这一节是为了让设计 / 编码时的取舍有据可依。看到「为什么改」，才能改得对。

### 2.1 来源放在顶部并默认展开

- **阅读动线被中断**：用户尚未读到任何结论，没有需要核实的内容，来源对他毫无意义。
- **来源在错误的时机出现**：动机在「读到具体结论」时才被激活。
- **来源越多，问题越严重**：用户要么逐张扫读卡片（浪费认知资源），要么直接跳过（来源完全失效）。**两条路都是损耗。**
- **方向性缺陷**：知识库越完善，首屏体验越差——这是一条线性恶化的曲线。

→ **设计决策**：来源默认**折叠在底部**，**展开使用侧栏**，**只在用户主动需要时浮现**。

### 2.2 对话中缺少过渡文案 / 阶段反馈

- **不确定性放大焦虑**："5 秒感觉像 15 秒"。
- **知识库越大，黑盒越长，焦虑越深。**

→ **设计决策**：检索/思考阶段，必须给出**显式的阶段化进度**（不是无信息的 spinner），具体在 §3 定义。

### 2.3 缺少 hover 角标弹出来源预览

- **验证一次来源 = 至少 3-5 步操作 + 丢失阅读位置**。
- 回答越长，这种损耗越严重。

→ **设计决策**：角标必须支持 hover 预览卡，覆盖文件类型 / 标题 / 引用片段 / 空间路径，让"可以查"本身消除疑虑——**即使用户不点开，知道能查也已减压**。

---

## 3. 三段式设计决策

> 每段都给出：① 状态机 / 信息架构 ② 设计规格 ③ 验收标准。

### 3.1 等待时 · 检索与生成的过渡状态

#### 状态机（统一术语，便于对齐 Design ↔ Code）

```
idle  →  thinking  →  retrieving  →  reading-sources  →  composing  →  streaming  →  done
                          │
                          └── (可见的来源卡片可在此阶段开始预热出现)
```


| State             | 中文名      | 文案示例（默认）         | 视觉指引                  |
| ----------------- | -------- | ---------------- | --------------------- |
| `thinking`        | 正在理解你的问题 | "正在理解你的问题…"      | 三点呼吸光标                |
| `retrieving`      | 检索知识库    | "在 N 个空间中检索…"    | 检索图标 + 知识库名           |
| `reading-sources` | 找到 X 篇资料 | "找到 X 篇资料，正在阅读…" | 显示资料缩略卡（≤3 张，"+x"折叠）  |
| `composing`       | 正在整理回答   | "正在整理回答…"        | 行内骨架                  |
| `streaming`       | 输出答案     | （文字流式输出，不显式标注）   | 文本 streaming + 角标同步出现 |
| `done`            | 完成       | （隐藏过程，折叠"思考过程"）  | 显示「思考用时 X 秒 ▾」        |


#### 设计规格

- **位置**：固定在最新一条 AI 消息的上方，与消息共享 padding，不挤占主阅读区。
- **过渡**：每个 state 的文案变化使用 ≤200ms 的 cross-fade，避免跳动。
- **可折叠**：完成后默认折叠为一行 "思考用时 N 秒 · X 篇资料"，可展开。
- **耗时占位**：超过 1.5s 仍在 `thinking` 时，必须升级到 `retrieving`，否则要补充更细的文案（"知识库较大，正在检索…"）。

#### 验收标准

- 任意阶段切换都有显式文案变化，不存在静止的 spinner。
- 用户在任何时间点都能回答"它现在在做什么"——这是这一阶段唯一的成功标准。
- 来源卡片**不**在 `streaming` 之前完全到位，而是随阅读进度浮现。

---

### 3.2 阅读时 · 行内角标（CitationBadge）+ 预览卡（SourcePopover）

#### 信息层次


| 元素            | 必须                           | 推荐                       | 不要放                             |
| ------------- | ---------------------------- | ------------------------ | ------------------------------- |
| **角标本身**      | 引用序号（如 `1`、`2`）              | 多引用合并为 `[1+3]` 的 `+x` 形态 | 文件名、emoji、彩色图标（除非文件类型 token 明确） |
| **Hover 预览卡** | 文件类型图标、文件标题、被引用片段（≤3 行）、所在空间 | 跳转按钮、复制引用按钮、上下条切换        | 完整文件内容、附件列表、评论                  |


> **竞品取舍参照**：Gemini 的预览卡最完整（文件类型 + 标题 + 空间 + 详细内容），是当前最值得对标的形态。Perplexity 的"+x" 折叠是处理多引用的最优解。**结论：信息层取 Gemini，多引用合并取 Perplexity。**

#### 角标视觉规格

- 形态：圆形 / 椭圆胶囊，仅文字，**不带颜色填充**（默认态用文字色 `--muted-foreground` + 1px 边框 `--border`）。
- 尺寸：高度 16px，最小宽度 16px，padding `0 4px`，字号 11px / 字重 500，行高 1。
- 与正文的关系：垂直居中于行内文字，左 margin 2px，**不**改变行高。
- 状态：
  - default：边框灰 + 文字灰
  - hover：边框 → `--primary`，文字 → `--primary`，背景轻染 4% primary
  - 关联高亮（双向联动，见 §3.3）：背景 → `--primary/16`，文字 → `--primary`
  - active（已点开侧栏对应来源）：背景 → `--primary`，文字 → `--primary-foreground`

#### 多引用 `+x` 规则

- 1 个 → `1`
- 2 个 → `1 2`（横向并列，间距 2px）
- 3 个及以上 → `1 +N`（点击 / hover 后在弹层内**支持左右切换**或网格列出）

#### 预览卡（Popover）规格

- 触发：hover 角标 200ms 后展开；离开 hover 区域 250ms 后收起；触屏长按 300ms 触发。
- 尺寸：宽 320–360px，最大高度 280px（超出滚动）。
- 偏移：默认在角标上方 8px，碰边自动翻转。
- 内容结构：

```
┌─────────────────────────────────────┐
│  [类型图标] 文件标题            ↗   │  ← 标题区，含跳转按钮
│  空间 / 路径 · 更新于 X 天前         │  ← 元信息（次要文字色）
│ ─────────────────────────           │
│  「被引用的原文片段，≤3 行省略」     │  ← 引用区，左侧有 4px primary 竖条
│                                     │
│  〈  1 / 3  〉                       │  ← 多引用切换器（仅多引用时）
└─────────────────────────────────────┘
```

- 阴影：`--shadow-lg`；圆角 12px；背景 `--popover`，文字 `--popover-foreground`。
- 引用片段使用窄字体 / 略小字号 / 引号包裹，与正文形成视觉差。

#### 验收标准

- 用户读到任何一句结论，眼睛只需移动 ≤16px 就能看到对应角标。
- hover 角标 → 看到原文片段的总耗时 ≤ 1 秒（含动画）。
- 角标的存在不破坏正文的行高节律（贴行测试：正文行间距与无角标段落一致）。
- 多引用从不溢出一行高度。

---

### 3.3 存疑时 · 来源面板与双向高亮

#### 位置 & 形态决策


| 维度   | 决策                                 | 原因                     |
| ---- | ---------------------------------- | ---------------------- |
| 位置   | **底部 / 折叠**                        | 顶部展开是当前最大问题；底部折叠尊重阅读节奏 |
| 默认态  | **折叠**，仅显示 "X 个来源 · 来自 N 个空间 ▸" 一行 | 阅读尚未发生时不打扰             |
| 展开形式 | **右侧抽屉 / 侧栏**（非模态）                 | 抽屉允许"边读边查"，模态会打断       |
| 入口   | 折叠条点击 / 角标点击 / 预览卡的"查看全部"          | 三处入口，统一目的地             |


> **方向参照**：Gemini + ChatGPT 深度研究采用的是「角标↔侧栏双向高亮」的模式，是目前最优解。我们采纳这一模式，并加入 ChatGPT 风格的"对引用追问"作为下一阶段增强。

#### 双向高亮（核心交互）

```
hover 正文角标 [1]                          hover 侧栏来源卡片
        │                                          │
        ▼                                          ▼
正文中所有 [1] 角标变 primary 高亮         正文里引用了该来源的句子
+ 侧栏自动滚动并高亮对应卡片              整段背景轻染 + 对应角标高亮
```

- 高亮颜色：`--primary` @ 16% alpha（背景）+ `--primary` @ 100%（边/文字）。
- 滚动行为：使用 `scroll-margin-top` 留出安全距离；动画 ≤ 300ms ease-out。
- 反向触发距离：在视口外的关联角标，使用边缘指示（如顶/底淡入小箭头）提示有更多。

#### 侧栏卡片规格

- 卡片宽度：抽屉宽 380–420px，卡片占满除 padding 外的宽度。
- 卡片内容：序号徽标、文件类型图标、标题、空间路径、引用片段（默认折叠 2 行 / 可展开）、跳转按钮。
- 排序：按引用顺序（与角标序号一致），不要按相关度——序号必须可索引。

#### 验收标准

- 用户从"产生疑问"到"看见证据"的最短路径：1 次 hover（不离开正文）。
- 用户从"产生疑问"到"看到完整原文"的最短路径：1 次 hover + 1 次点击。
- 关闭侧栏后再开，状态保留（不丢失上次定位）。
- 屏幕宽度 < 1024px 时，侧栏退化为底部 sheet，不强制压缩主对话宽度。

---

## 4. 设计 Token（Vibe Design ↔ Vibe Coding 共享语言）

> Token 同时给出 **Figma / Pencil 中的命名** 与 `**src/styles.css` 中的 CSS 变量名**，两边对齐。新增 token 优先复用现有 shadcn 体系的命名习惯。

### 4.1 颜色


| 用途                | Figma Token            | CSS 变量                                                 | 备注                                 |
| ----------------- | ---------------------- | ------------------------------------------------------ | ---------------------------------- |
| 角标默认文字            | `text/muted`           | `--muted-foreground`                                   |                                    |
| 角标默认描边            | `border/default`       | `--border`                                             |                                    |
| 角标 hover / 关联高亮文字 | `brand/primary`        | `--primary`                                            |                                    |
| 角标关联高亮背景          | `brand/primary-16`     | `color-mix(in oklab, var(--primary) 16%, transparent)` | 新增 token：`--citation-highlight-bg` |
| 引用片段竖条            | `brand/primary`        | `--primary`                                            | 4px                                |
| 来源卡片背景            | `surface/popover`      | `--popover`                                            |                                    |
| 思考过程容器            | `surface/muted`        | `--muted`                                              | 与对话气泡区分                            |
| 危险/校验失败           | `feedback/destructive` | `--destructive`                                        | 引用源不可达时使用                          |


### 4.2 字号 & 字重


| 角色          | size / weight     | tracking |
| ----------- | ----------------- | -------- |
| 角标数字        | 11 / 500          | 0        |
| 预览卡标题       | 14 / 600          | -0.01em  |
| 预览卡元信息      | 12 / 400          | 0        |
| 预览卡引用片段     | 13 / 400 / italic | 0        |
| 阶段进度文案      | 13 / 500          | 0        |
| 折叠条「X 个来源…」 | 13 / 500          | 0        |


### 4.3 间距 & 圆角


| Token                   | 值     | 用途     |
| ----------------------- | ----- | ------ |
| `radius-citation-badge` | 999px | 胶囊角标   |
| `radius-popover`        | 12px  | 预览卡    |
| `radius-source-card`    | 10px  | 侧栏卡片   |
| `gap-inline-badge`      | 2px   | 角标与正文  |
| `gap-popover-stack`     | 8px   | 预览卡内段落 |
| `gap-source-card-stack` | 12px  | 侧栏卡片堆叠 |


### 4.4 动效（必须，不是装饰）

> 动效在这里**承担信息**：让"AI 在工作 / 来源在出现 / 高亮在响应"被身体感知到。


| 场景          | duration | easing                              | 说明                     |
| ----------- | -------- | ----------------------------------- | ---------------------- |
| 阶段文案切换      | 180ms    | `ease-out`                          | cross-fade，无位移         |
| 角标出现（随流式输出） | 220ms    | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 微弹，传达"刚刚生成"            |
| 预览卡入场       | 160ms    | `ease-out`                          | y +4px → 0 + opacity   |
| 双向高亮        | 200ms    | `ease-out`                          | 背景颜色过渡                 |
| 侧栏抽屉        | 280ms    | `ease-out`                          | 从右滑入，使用 transform，避免重排 |
| 思考过程折叠      | 240ms    | `ease-in-out`                       | height + opacity       |


复用本仓库的 `transitions.css`（`.t-`* 命名空间），不污染 shadcn。新增一族 `.t-citation-`* 与 `.t-source-`* 即可。

---

## 5. 组件清单（在 `src/components/` 落地的契约）

> 本节是 **Vibe Coding 的入口**：每个组件都给出最小契约，AI 编码时按此对齐 props 与状态。

### 5.1 `<RetrievalProgress />`

负责 §3.1 的状态机渲染。

```tsx
type RetrievalState =
  | { kind: 'thinking' }
  | { kind: 'retrieving'; spaces: string[] }
  | { kind: 'reading-sources'; total: number; previews: SourcePreview[] }
  | { kind: 'composing' }
  | { kind: 'streaming' }
  | { kind: 'done'; durationMs: number; sourceCount: number }

interface RetrievalProgressProps {
  state: RetrievalState
  collapsed?: boolean
  onToggle?: () => void
}
```

要求：

- 状态切换内部用 `data-state` 暴露给 CSS，便于动效绑定。
- `done` 时默认折叠，再次点击展开历程。
- 文案完全可注入（i18n / 业务文案库），不写死。

### 5.2 `<CitationBadge />`

```tsx
interface CitationBadgeProps {
  ids: number[]                 // 单条或多条引用序号
  active?: boolean              // 与侧栏卡片关联高亮
  highlighted?: boolean         // 反向 hover 触发的高亮
  onActivate?: (id: number) => void  // 点击 → 打开/定位侧栏
}
```

要求：

- 多引用 ≥3 自动渲染 `1 +N`。
- `data-state="default | hover | active | highlighted"`。
- 必须使用 `<button>` 语义，键盘可达，`aria-label` 描述"查看引用 1 等 N 条来源"。
- **不要**作为链接（`<a>`）—— 它的目的是触发侧栏，不是跳转。

### 5.3 `<SourcePopover />`

```tsx
interface SourcePopoverProps {
  sources: SourceRef[]          // 多引用支持
  initialIndex?: number
  trigger: React.ReactNode      // 通常是 <CitationBadge />
}

interface SourceRef {
  id: number
  title: string
  type: 'doc' | 'sheet' | 'pdf' | 'wiki' | 'web' | string
  spacePath: string             // "公司/产品/2024Q4 规划"
  snippet: string               // 被引用片段
  updatedAt?: string
  href?: string                 // 跳转完整文档
}
```

要求：

- 基于 Radix Popover（仓库已有 radix-ui）。
- hover / focus 都能触发；触屏长按触发。
- 多引用时内置左右切换器与键盘 `←/→`。

### 5.4 `<SourcePanel />`

```tsx
interface SourcePanelProps {
  open: boolean
  sources: SourceRef[]
  activeId?: number
  onActiveChange?: (id: number) => void
  onClose: () => void
}
```

要求：

- 桌面端使用右侧抽屉（Drawer / Sheet 形态），`width: clamp(380px, 28vw, 440px)`。
- 移动端（< 1024px）退化为底部 Sheet。
- 内部维护"当前 active id"——hover 正文角标可外部更新此 id，触发滚动定位。
- 关闭后 active id 持久化（最简：组件外部 context / store）。

### 5.5 `<CitationProvider />`（建议）

提供一个 context，让正文区域的 `<CitationBadge />` 与侧栏的 `<SourcePanel />` 共享状态：哪个 id 正在被 hover、哪个 id 是 active、消息粒度的来源列表是什么。这是 §3.3 双向高亮成立的前提。

```tsx
interface CitationContextValue {
  hoveredId: number | null
  activeId: number | null
  setHovered: (id: number | null) => void
  setActive: (id: number | null) => void
  sourcesByMessage: Record<string, SourceRef[]>
}
```

---

## 6. 编排与状态流（数据契约）

> 后端流式数据建议按下面的事件约定推送，前端按此切换 state，**不要让前端自己推断**。

```ts
type ChatStreamEvent =
  | { type: 'phase'; phase: RetrievalState['kind']; meta?: any }
  | { type: 'sources'; messageId: string; sources: SourceRef[] }   // 可分批
  | { type: 'token'; messageId: string; delta: string; citationIds?: number[] } // delta 中包含 [^id] 标记
  | { type: 'done'; messageId: string; durationMs: number }
```

约束：

- **token 必须带 citationIds**（最迟在结束本句时）——这是"逐句确认"得以成立的数据基础。
- **sources 可以早于 done**——这样 `reading-sources` 阶段才有真实预览。
- 角标的视觉序号（1, 2, 3…）与 `SourceRef.id` 强一致，**不在前端重排**。

---

## 7. 不要做的事（取舍清单）

- ❌ 不要把来源默认展开放在顶部（这是当前最大问题）。
- ❌ 不要在 `thinking` 阶段使用无信息的 spinner——必须有文字说明在做什么。
- ❌ 不要让角标用色块/彩色图标，它们的存在感应该**安静但可达**。
- ❌ 不要把预览卡做成模态——它必须能与正文共存。
- ❌ 不要在屏幕窄时硬挤侧栏，宁可降级为底部 sheet。
- ❌ 不要让"+x"折叠的多引用要求点击两次才能切换——切换器内置在弹层中。
- ❌ 不要让 hover 反向高亮在视口外"消失"——必须给出边缘提示。

---

## 8. 实施路线图（最小可信任版本 → 完整体验）


| 阶段             | 范围                                                                                            | 验收                           |
| -------------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| **M1 · 信任最小集** | RetrievalProgress（5 状态）+ CitationBadge（单引用） + SourcePopover（基础） + SourcePanel（折叠条 + 抽屉，无双向高亮） | 用户在三个阶段都能感知到来源；hover 看到原文片段  |
| **M2 · 关联感**   | 双向高亮（角标 ↔ 侧栏） + 多引用 `+x` 折叠 + 切换器 + 阶段文案完整可注入                                                 | 验证一次来源 ≤ 1 hover             |
| **M3 · 增益**    | 思考过程可折叠/展开 + "对引用追问"（ChatGPT 模式）+ 来源失效（dead link）友好态 + 移动端 sheet                              | 与一线竞品（Gemini / ChatGPT）信任感持平 |


---

## 9. Vibe Design / Vibe Coding 协作规则

- **设计稿命名**：组件 frame 与本文档第 5 节同名（`RetrievalProgress`、`CitationBadge` 等），避免翻译损耗。
- **Token 命名**：CSS 变量名直接作为 Figma token 名复用；新增 token 必须先入 `src/styles.css`，再同步至 Figma。
- **状态命名**：`thinking | retrieving | reading-sources | composing | streaming | done` 是项目唯一术语集。
- **AI 编码 prompt 模板**：
  > 「实现 §5.x `<XXX />`，遵守 §4 的 token，使用 transitions.css 的 `.t-`* 命名空间承载 §4.4 的动效，可访问性按 §5 的 aria 要求。所有文案接受 props 注入。」
- **AI 设计 prompt 模板**：
  > 「在 Figma 中绘制 §3.x 的状态/组件，使用 §4 的 token，复刻 §3.x 的验收标准；先按 M1 范围给出，再迭代到 M2/M3。」

---

## 10. 一页速查（Cheat Sheet）

```
North Star · 信任感连续体：等待 → 阅读 → 存疑

等待：状态机文案，不留黑盒
阅读：角标静默贴行，随句出现
存疑：hover 看片段，点击进侧栏，双向高亮

不要：顶部默认展开来源 / 无信息 spinner / 模态来源卡 / 彩色重角标
要：折叠在底部 / 抽屉式侧栏 / hover 预览 / 文字进度

Token：--primary（高亮）/ --muted-foreground（角标默认）
       /  --citation-highlight-bg（关联染色）/ --popover（弹层）
组件：RetrievalProgress · CitationBadge · SourcePopover · SourcePanel
      · CitationProvider（共享 hover/active）

里程碑：M1 信任最小集 → M2 双向关联 → M3 与一线竞品持平
```

---

## 11. 图标实现规范

### 11.1 SVG 内置留白与视觉尺寸偏差

项目所用的自定义 SVG 图标（`src/assets/icons/icon-source-*.svg`）的 `viewBox` 均为 `"0 0 24 24"`，但路径内容**不贴边**，只占画布面积约 70%。这意味着：

> **渲染成 12px 时，视觉实际只有 ≈ 8–9px**

Figma 组件内部会裁剪到内容边界，因此设计稿里标注的「12px」是**视觉像素**，而非 SVG 元素的 `width/height`。

### 11.2 补偿规则：图标尺寸 × 1.25

要让渲染出的图标与设计稿视觉像素对齐，需将 `size-*` 放大约 **1.25 倍**：

| 设计稿视觉尺寸 | 代码中应填写的尺寸 | Tailwind 写法 |
|---|---|---|
| 12 px | 15 px | `size-[15px]` |
| 16 px | 20 px | `size-5` |
| 18 px | 22–23 px | `size-[22px]` |
| 20 px | 25 px | `size-[25px]` |
| 24 px | 30 px | `size-[30px]` |

### 11.3 适用范围

- **所有** `<SourceTypeIcon>` / `<SourceMarker>` 等使用 `src/assets/icons/icon-source-*.svg` 的地方均适用此规则。
- 来自 **Lucide** 的图标不受此影响——Lucide 图标路径贴边设计，直接按设计稿数值使用。
- 如果某个 SVG 资源被重新导出为内容贴边版，需移除此补偿（逐文件评估，不可全局修改）。

### 11.4 检查清单

新增或修改图标时，逐条确认：

- [ ] 是 Lucide 图标？→ 按设计稿尺寸直接用。
- [ ] 是 `src/assets/icons/` 下的自定义 SVG？→ 尺寸 × 1.25 后填写。
- [ ] 视觉对比：放到浏览器中截图，与 Figma 截图叠加比较，误差 ≤ 1px。

---

> 本文档与 Figma 需求分析（节点 `6692:248085`）配套阅读。任何与本文档冲突的设计/实现，应以"是否更好地服务信任感"为最终裁决标准——这是唯一不可让步的原则。

