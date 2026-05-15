import * as React from 'react'

import { Section, SubHeading } from '../components/Section'
import { CopyToken } from '../components/CopyToken'

const RADII = [
  { name: '4 · 标签内嵌', px: 4, class: 'rounded-[4px]' },
  { name: '6 · 控件 / icon button', px: 6, class: 'rounded-[6px]' },
  { name: '8 · 列表项 / 头像方块', px: 8, class: 'rounded-lg' },
  { name: '10 · 来源卡片', px: 10, class: 'rounded-[10px]' },
  { name: '12 · 弹层 / preview 卡', px: 12, class: 'rounded-xl' },
  { name: '16 · 输入框 / 大卡片', px: 16, class: 'rounded-2xl' },
  { name: '20 · 桌面外壳', px: 20, class: 'rounded-[20px]' },
  { name: '999 · 角标 / pill / 头像', px: 999, class: 'rounded-full' },
]

const SHADOWS = [
  {
    name: 'shadow-xs',
    style: '0 1px 2px rgba(0,0,0,0.05)',
    note: 'shadcn 默认 outline 按钮',
  },
  {
    name: 'input dock',
    style: '0 4px 12px 0 rgba(0,0,0,0.06)',
    note: '输入框浮在对话上方',
  },
  {
    name: 'scroll-to-bottom',
    style: '0 4px 8px rgba(0,0,0,0.05)',
    note: '小型悬浮按钮',
  },
  {
    name: 'restart bar',
    style: '0 8px 28px rgba(0,0,0,0.08)',
    note: '右下浮动状态条',
  },
  {
    name: '桌面窗框',
    style:
      '0 24px 60px -20px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)',
    note: '主窗体外壳',
  },
  {
    name: 'iPhone 外壳',
    style:
      '0 40px 80px -20px rgba(0,0,0,0.45), 0 12px 32px rgba(0,0,0,0.18)',
    note: '移动端设备框',
  },
]

const SPACING = [
  { name: 'gap-inline-badge', px: 2, note: '角标与正文' },
  { name: 'gap-popover-stack', px: 8, note: '预览卡内段落' },
  { name: 'gap-source-card-stack', px: 12, note: '侧栏卡片堆叠' },
  { name: 'icon size · 角标', px: 16, note: '行内引用 16×16' },
  { name: 'icon size · 工具栏', px: 18, note: '导航 / 头部图标' },
  { name: 'tap target', px: 32, note: '所有可点击 icon button 的最小尺寸' },
  { name: 'avatar · sm', px: 20, note: '助教头像 / 列表头像' },
  { name: 'avatar · md', px: 40, note: '侧栏班级头像' },
]

export function ShapePage() {
  return (
    <Section
      id="shape"
      eyebrow="Foundations"
      title="圆角 · 阴影 · 间距"
      description={
        <>
          形态语言克制:圆角分 8 档,阴影只在浮起时使用,间距精确到 px。
          所有规格均
          <strong className="text-[#1a1a1a]">点击复制</strong>。
        </>
      }
    >
      <SubHeading id="shape-radius" hint="rounded-* / radius-*">
        圆角
      </SubHeading>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {RADII.map((r) => (
          <div
            key={r.name}
            className="flex flex-col items-center gap-3 rounded-[12px] border border-[var(--ag-border)] bg-white p-5"
          >
            <div
              className={
                'h-16 w-16 bg-[#1a1a1a] ' +
                (r.px >= 32 ? 'rounded-full' : '')
              }
              style={{
                borderRadius: r.px === 999 ? '999px' : `${r.px}px`,
              }}
            />
            <div className="text-center">
              <p className="text-[12px] font-medium text-[#1a1a1a]">
                {r.px === 999 ? 'full' : `${r.px}px`}
              </p>
              <p className="mt-0.5 text-[11px] text-[#868686]">{r.name}</p>
              <div className="mt-1.5">
                <CopyToken
                  value={r.class}
                  className="text-[11px] text-[#868686]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <SubHeading id="shape-shadow" hint="只在浮层 / 悬空元素上使用">
        阴影
      </SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SHADOWS.map((s) => (
          <div
            key={s.name}
            className="rounded-[12px] border border-[var(--ag-border)] bg-[var(--ag-bg)] p-6"
          >
            <div
              className="h-20 rounded-[10px] bg-white"
              style={{ boxShadow: s.style }}
              aria-hidden
            />
            <p className="mt-4 text-[13px] font-medium text-[#1a1a1a]">
              {s.name}
            </p>
            <p className="mt-0.5 text-[11.5px] text-[#868686]">{s.note}</p>
            <div className="mt-2">
              <CopyToken
                value={`shadow-[${s.style.replaceAll(' ', '_')}]`}
                display={s.style.length > 60 ? s.style.slice(0, 56) + '…' : s.style}
                className="text-[11px] text-[#868686]"
              />
            </div>
          </div>
        ))}
      </div>

      <SubHeading id="shape-spacing" hint="间距 / 尺寸 token">
        间距 / 尺寸
      </SubHeading>
      <div className="rounded-[12px] border border-[var(--ag-border)] bg-white overflow-hidden">
        <ul>
          {SPACING.map((s, i) => (
            <li
              key={i}
              className="grid grid-cols-[1fr_auto_220px] items-center gap-4 px-5 py-3 border-b border-[var(--ag-border-soft)] last:border-b-0"
            >
              <div>
                <p className="text-[13px] text-[#1a1a1a]">{s.name}</p>
                <p className="text-[11.5px] text-[#868686]">{s.note}</p>
              </div>
              <span className="font-mono text-[12px] text-[#1a1a1a]">
                {s.px}px
              </span>
              <div className="flex items-center justify-end">
                <span
                  aria-hidden
                  className="block bg-[#1a1a1a] rounded-sm"
                  style={{
                    width: Math.min(s.px * 4, 140),
                    height: 6,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
