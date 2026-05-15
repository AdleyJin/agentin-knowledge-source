/**
 * AI assistant answer script — the full canned response, decomposed
 * into typing-aware blocks. Order here is the order text appears on
 * screen as the model "responds".
 *
 * Decoupled from the rendering layer so the chat sections can be
 * exercised in isolation (storybook, tests, …).
 */
export type ScriptBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'divider' }
  | { kind: 'bullet'; text: string; cites?: number[] }
  | { kind: 'orderedItem'; text: string; cites?: number[]; marker: string }
  | { kind: 'olPrefix'; text: string }
  | { kind: 'images' }

export const SCRIPT: ScriptBlock[] = [
  {
    kind: 'p',
    text:
      '根据现有内容，关于"我的班级最近的学习情况如何"这一问题，文档中并未直接提供具体的班级学习数据、成绩统计或近期表现分析。但可以从大单元设计与学情分析的关联方法中，找到间接指导如何评估班级学习情况的思路，具体如下：',
  },
  { kind: 'divider' },
  {
    kind: 'h3',
    text: '一、需通过「学情把握」分析班级现状（核心依据）',
  },
  {
    kind: 'p',
    text:
      '文档强调，大单元设计需精准把握学情（即班级学生的学习基础、能力水平、兴趣特点等），这是制定科学学习目标与策略的基础。',
  },
  {
    kind: 'bullet',
    text:
      '关键点：需通过分析明确"本班学生适合怎样的学习方法、策略与程序"（如：是否需要分层任务？小组合作是否有效？）。',
    cites: [1],
  },
  {
    kind: 'bullet',
    text:
      '如何操作：结合课标要求、教材内容，观察学生当前的知识掌握程度（如：对单元核心概念的理解、任务完成度），从而判断班级整体学习进度与薄弱点。',
    cites: [2],
  },
  { kind: 'images' },
  { kind: 'divider' },
  {
    kind: 'h3',
    text: '二、通过「单元目标与评价」间接反映学习情况',
  },
  {
    kind: 'p',
    text:
      '大单元设计要求从"单元目标制定"到"持续性评价"，需将课标解析与学情分析转化为具体的学习目标（如：3-5 个重点目标），并通过评价任务（如：课堂表现、作业反馈）监测达成度。',
  },
  { kind: 'olPrefix', text: '· 可关注的方向：' },
  {
    kind: 'orderedItem',
    text: '目标达成状态：学生是否能完成单元预设的主要学习目标。',
    cites: [1, 3],
    marker: 'a.',
  },
  {
    kind: 'orderedItem',
    text:
      '评价任务结果：通过单元内的评价任务（如：任务执行中的自我评估、作业反馈），观察学生对核心知识的掌握程度与应用能力。',
    cites: [4, 5, 6],
    marker: 'b.',
  },
]

// ── Per-block streaming duration ─────────────────────────────────────
//
// In the new Motion-driven typing flow each block self-paces via
// `<TypingAnimation duration>`. The parent state machine in `App.tsx`
// only needs to know "how long until I move to the next block". These
// helpers keep both numbers in sync from one place.
//
// `CHAR_DUR_MS = 20` ⇒ 50 chars/sec, matching the legacy
// `TICK_MS=40 / CHARS_PER_TICK=2` rate so the perceived speed is
// identical after the refactor.

/** Time per character (ms). Drives `<TypingAnimation duration>`. */
export const CHAR_DUR_MS = 20

/** Visual length used for non-text blocks. */
const NON_TEXT_WEIGHT: Record<'divider' | 'images', number> = {
  divider: 8,
  images: 60,
}

/**
 * Estimated time the parent should hold on this block before
 * advancing to the next one. Slightly longer than the typing animation
 * itself so the cursor never gets cut off mid-stroke.
 */
export function blockEstimatedMs(block: ScriptBlock): number {
  const buffer = 1.05
  switch (block.kind) {
    case 'p':
    case 'h3':
    case 'bullet':
    case 'orderedItem':
    case 'olPrefix':
      return Math.ceil(block.text.length * CHAR_DUR_MS * buffer)
    case 'divider':
      return NON_TEXT_WEIGHT.divider * CHAR_DUR_MS
    case 'images':
      return NON_TEXT_WEIGHT.images * CHAR_DUR_MS
  }
}
