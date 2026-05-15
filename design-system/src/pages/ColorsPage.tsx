import * as React from 'react'

import { Section, SubHeading } from '../components/Section'
import { CopyToken } from '../components/CopyToken'

interface Swatch {
  name: string
  cssVar: string
  hex: string
  on?: 'light' | 'dark'
  note?: string
}

const AG_TOKENS: Swatch[] = [
  { name: '页面背景', cssVar: '--ag-bg', hex: '#f2f2f2', note: '应用主背景' },
  { name: '卡片表面', cssVar: '--ag-surface', hex: '#ffffff', note: '对话气泡 / 卡片' },
  { name: '边框 · 默认', cssVar: '--ag-border', hex: '#e6e6e6' },
  { name: '边框 · 柔', cssVar: '--ag-border-soft', hex: 'rgba(230,230,230,0.6)' },
  { name: '主文字', cssVar: '--ag-text', hex: '#1a1a1a' },
  { name: '强文字', cssVar: '--ag-text-strong', hex: '#1c1f25' },
  { name: '次要文字', cssVar: '--ag-text-muted', hex: '#868686', note: '副标题 / 提示' },
  { name: '弱文字', cssVar: '--ag-text-faint', hex: '#bbbbbb', note: '占位 / 元信息' },
  { name: 'Hover 态', cssVar: '--ag-hover', hex: 'rgba(0,0,0,0.04)' },
  { name: '用户气泡', cssVar: '--ag-bubble-user', hex: 'rgba(26,26,26,0.05)' },
  { name: 'Active', cssVar: '--ag-active', hex: '#ebebeb', note: '当前选中项' },
]

const SHADCN_TOKENS: Swatch[] = [
  { name: 'background', cssVar: '--background', hex: 'oklch(1 0 0)' },
  {
    name: 'foreground',
    cssVar: '--foreground',
    hex: 'oklch(0.141 …)',
    on: 'dark',
  },
  {
    name: 'primary',
    cssVar: '--primary',
    hex: 'oklch(0.21 …)',
    on: 'dark',
    note: '主要按钮 / 强调',
  },
  {
    name: 'primary-foreground',
    cssVar: '--primary-foreground',
    hex: 'oklch(0.985 0 0)',
  },
  {
    name: 'muted-foreground',
    cssVar: '--muted-foreground',
    hex: 'oklch(0.552 …)',
  },
  {
    name: 'border',
    cssVar: '--border',
    hex: 'oklch(0.92 …)',
  },
  {
    name: 'destructive',
    cssVar: '--destructive',
    hex: 'oklch(0.577 0.245 27.325)',
    on: 'dark',
    note: '错误 / 失败态',
  },
]

export function ColorsPage() {
  return (
    <Section
      id="colors"
      eyebrow="Foundations"
      title="颜色"
      description={
        <>
          以 shadcn/ui (zinc 基色 / new-york style) 为底,在其上叠加 Agentin
          自有 token 表达"对话场景"的层次。任何 token 都
          <strong className="text-[#1a1a1a]">点击即复制</strong>。
        </>
      }
    >
      <SubHeading id="colors-ag" hint="src/styles.css · :root">
        Agentin 自有 Tokens
      </SubHeading>
      <SwatchGrid swatches={AG_TOKENS} />

      <SubHeading id="colors-shadcn" hint="基于 oklch · 完整列表见 styles.css">
        shadcn 状态色
      </SubHeading>
      <SwatchGrid swatches={SHADCN_TOKENS} />

      <SubHeading id="colors-accent" hint="仅用于角标 hover / active">
        强调绿
      </SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <SwatchCard
          swatch={{
            name: 'Citation Hover Green',
            cssVar: '#2EE066',
            hex: '#2EE066',
            note: '行内角标 hover / active 唯一允许的色块',
            on: 'light',
          }}
          highlight
        />
        <div className="sm:col-span-2 lg:col-span-2 rounded-[12px] border border-[var(--ag-border)] bg-white p-5">
          <p className="text-[12px] uppercase tracking-[0.08em] font-medium text-[#868686]">
            使用守则
          </p>
          <ul className="mt-3 space-y-2 text-[13px] leading-[1.6] text-[#1a1a1a]">
            <li>
              <span className="text-[#868686]">Do</span>
              ：仅作为
              <CopyToken value="bg-[#2EE066]" />
              出现在 16×16 圆形角标的 hover / active 态。
            </li>
            <li>
              <span className="text-[#868686]">Don't</span>
              ：不要把它扩大成大块面积、不要用作品牌色、不要染按钮。
            </li>
          </ul>
        </div>
      </div>
    </Section>
  )
}

function SwatchGrid({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {swatches.map((s) => (
        <SwatchCard key={s.cssVar} swatch={s} />
      ))}
    </div>
  )
}

function SwatchCard({
  swatch,
  highlight,
}: {
  swatch: Swatch
  highlight?: boolean
}) {
  const isAlpha = swatch.hex.includes('rgba') || swatch.hex.includes('/')
  const fill = swatch.cssVar.startsWith('--')
    ? `var(${swatch.cssVar})`
    : swatch.cssVar
  const onDark = swatch.on === 'dark'

  return (
    <article
      className={
        'flex overflow-hidden rounded-[12px] border ' +
        (highlight
          ? 'border-[#2EE066] ring-1 ring-[#2EE066]/30'
          : 'border-[var(--ag-border)]')
      }
    >
      <div
        className={'relative w-[96px] shrink-0 ' + (isAlpha ? 'ds-checker' : '')}
      >
        <div
          className="h-full w-full"
          style={{ background: fill }}
          aria-hidden
        />
        {onDark && (
          <span className="absolute inset-0 grid place-items-center text-[11px] text-white/85">
            Aa
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between bg-white p-3">
        <div>
          <p className="text-[13px] font-medium text-[#1a1a1a]">{swatch.name}</p>
          {swatch.note && (
            <p className="mt-0.5 text-[11.5px] text-[#868686]">{swatch.note}</p>
          )}
        </div>
        <div className="mt-2 flex flex-col gap-0.5 text-[11.5px]">
          <CopyToken value={swatch.cssVar} className="text-[#1a1a1a]" />
          <CopyToken value={swatch.hex} className="text-[#868686]" />
        </div>
      </div>
    </article>
  )
}
