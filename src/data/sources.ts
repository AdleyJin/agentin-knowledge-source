/**
 * Knowledge-base citations rendered both as inline `[n]` markers in the
 * streamed answer and as the collapsible "找到 N 篇知识库资料" list.
 *
 * - `source` is the parent level of the resource, shown as `类型 / 来源名`
 *   in the hover tooltip card. For Flowin 文档 / PDF it is the Flowin space
 *   name; for all other types it is the class name (e.g. "人大附2023级(3)班").
 * - `cite` shows a sub-position inside the source (timestamp / page).
 * - `description` is a short excerpt of the cited passage, shown in the
 *   hover tooltip card beneath the title.
 */
export type SourceItem = {
  type: '录播课' | '学习资料' | 'Flowin 文档' | 'PDF' | '作业' | '共创文档'
  title: string
  source?: string
  cite?: string
  description?: string
}

export const SOURCES: readonly SourceItem[] = [
  {
    type: '录播课',
    title: '第 1 讲：评价画面优劣的标准',
    source: '人大附2023级(3)班',
    cite: '引用自 00:32:56',
    description:
      '通过古镇水墨风格作品，演示减法原则的应用：黑白影调控制、人物位置经营、动态虚化处理等手法，将复杂场景提炼为具有东方美学意境的简洁画面。',
  },
  {
    type: '共创文档',
    title: '古代文学经典与文化价值',
    source: '人大附2023级(3)班',
    description:
      '从主体大小、位置、明暗、虚实、色彩五个维度，系统讲解如何在画面中建立主次关系，让观众的视线第一时间落在最重要的被摄对象上。',
  },
  {
    type: '学习资料',
    title: '第 10 讲：拍摄角度对摄影画质的影响',
    source: '人大附2023级(3)班',
    description:
      '对比仰拍、俯拍、平拍三类常见角度对透视和情绪的影响，并结合具体作品分析镜头高度变化带来的画面叙事差异。',
  },
  {
    type: '录播课',
    title: '第 12 讲：正面角度',
    source: '人大附2023级(3)班',
    description:
      '正面角度强调对称与稳定，常用于呈现建筑、人物肖像和产品。课中通过案例拆解正面角度的优缺点与适用场景。',
  },
  {
    type: 'Flowin 文档',
    title: '第 10 讲：拍摄角度对摄影画质的影响',
    source: '2026年下学期教研规划',
    description:
      '同一被摄主体在不同视角下呈现完全不同的视觉感受：低角度强化气势，高角度放大场景，平视则贴近日常。',
  },
  {
    type: 'PDF',
    title: '第三次作业：拍摄并提交"光影造型"摄影作业 1 幅',
    source: '2026年下学期教研规划',
    description:
      '作业要求围绕"光影造型"主题完成 1 幅原创摄影作品，重点考察布光意识与影调控制能力，并附 200 字以内创作说明。',
  },
] as const

/**
 * Click handler shared by the sources list rows and the inline citation
 * tooltip cards. The demo doesn't have real backing URLs so we just
 * log the intent — wire this up to your routing layer when integrating
 * for real.
 */
export function openSource(src: SourceItem): void {
  console.info('[demo] open source →', src.type, src.title)
}
