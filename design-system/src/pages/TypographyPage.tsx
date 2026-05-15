import * as React from 'react'

import { Section, SubHeading } from '../components/Section'
import { CopyToken } from '../components/CopyToken'

interface Step {
  px: number
  weight: 400 | 500 | 600
  /** Where this step shows up in the product. */
  usage: string
  /** Sample text — falls back to a sensible Chinese default. */
  sample?: string
}

const SCALE: Step[] = [
  { px: 11, weight: 500, usage: '行内角标数字 · 类型标签', sample: '1 · PDF · 共创文档' },
  { px: 12, weight: 400, usage: '元信息 · disclaimer · 占位提示', sample: '内容由 AI 生成,请仔细甄别。' },
  { px: 13, weight: 500, usage: '阶段进度 / 折叠条', sample: '找到 6 篇知识库资料' },
  { px: 14, weight: 400, usage: '正文 · 用户气泡 · 行内文字', sample: '我的班级最近的学习情况如何？' },
  { px: 14, weight: 500, usage: '导航 / 头部标题', sample: 'AI 助教 · 学生对话' },
  { px: 14, weight: 600, usage: '预览卡标题 · 强调小标题', sample: '第 1 讲：评价画面优劣的标准' },
  { px: 16, weight: 600, usage: '侧栏顶部班级名 · 中级标题', sample: '人大附2023级(3)班' },
  { px: 18, weight: 600, usage: '页面 / 区块标题', sample: '知识库索引' },
]

const ROLES: { name: string; class: string; sample: string; note: string }[] = [
  {
    name: '正文 · 14 / 1.6',
    class: 'text-[14px] leading-[1.6] text-[#1a1a1a]',
    sample:
      '画面减法的核心在于克制 —— 把"非主体"的视觉权重降到最低,留出呼吸感,让观众的视线第一时间落在最重要的被摄对象上。',
    note: '对话气泡 / 流式 AI 文本',
  },
  {
    name: '次要 · 12 / 18px',
    class: 'text-[12px] leading-[18px] text-[#868686]',
    sample: '正在阅读知识库资料...',
    note: '阶段文案 / 元信息 / 引用计数',
  },
  {
    name: '弱提示 · 14 / leading-none',
    class: 'text-[14px] leading-none text-[#bbbbbb]',
    sample: '即时开问',
    note: '输入框 placeholder',
  },
  {
    name: '类型标签 · 11 / 16px',
    class: 'text-[11px] leading-[16px] text-[#1a1a1a]',
    sample: 'Flowin 文档',
    note: 'SourceTypeTag 内的文字',
  },
]

export function TypographyPage() {
  return (
    <Section
      id="typography"
      eyebrow="Foundations"
      title="字号 · 字重"
      description={
        <>
          字体使用系统默认 sans 栈,只通过
          <strong className="text-[#1a1a1a]">字号 + 字重 + 颜色</strong>
          建立层次。所有数字均为
          <CopyToken value="px" />
          —— 与 Figma 1:1 对齐。
        </>
      }
    >
      <SubHeading id="typography-scale" hint="点击行复制对应 Tailwind 类">
        字号梯度
      </SubHeading>
      <div className="rounded-[12px] border border-[var(--ag-border)] bg-white overflow-hidden">
        <div className="grid grid-cols-[80px_72px_1fr_auto] items-center gap-4 border-b border-[var(--ag-border)] bg-[var(--ag-bg)] px-5 py-2.5 text-[11px] uppercase tracking-[0.08em] text-[#868686]">
          <span>SIZE</span>
          <span>WEIGHT</span>
          <span>SAMPLE</span>
          <span className="text-right pr-1">CLASS</span>
        </div>
        <ul>
          {SCALE.map((s, i) => (
            <li
              key={i}
              className="grid grid-cols-[80px_72px_1fr_auto] items-center gap-4 px-5 py-3 border-b border-[var(--ag-border-soft)] last:border-b-0"
            >
              <span className="font-mono text-[12px] text-[#1a1a1a]">
                {s.px}px
              </span>
              <span className="font-mono text-[12px] text-[#868686]">
                {s.weight}
              </span>
              <span
                style={{ fontSize: s.px, fontWeight: s.weight }}
                className="text-[#1a1a1a] truncate"
              >
                {s.sample}
              </span>
              <CopyToken
                value={`text-[${s.px}px] font-${
                  s.weight === 400 ? 'normal' : s.weight === 500 ? 'medium' : 'semibold'
                }`}
                className="text-[11.5px] text-[#868686]"
              />
            </li>
          ))}
        </ul>
      </div>

      <SubHeading id="typography-roles" hint={'组合好的「角色」令调用更直观'}>
        常用角色
      </SubHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ROLES.map((r) => (
          <div
            key={r.name}
            className="rounded-[12px] border border-[var(--ag-border)] bg-white p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-[#868686]">
              {r.name}
            </p>
            <p className={r.class + ' mt-3'}>{r.sample}</p>
            <p className="mt-3 text-[11.5px] text-[#bbbbbb]">{r.note}</p>
            <div className="mt-3">
              <CopyToken value={r.class} className="text-[11.5px] text-[#868686]" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
