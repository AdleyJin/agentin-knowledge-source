import * as React from 'react'

import { Section } from '../components/Section'

/**
 * Compact landing card. The user picked the "minimal" scope, so this
 * isn't a long primer — just a one-screen summary plus jump links to
 * each foundation. It still mentions the project's North Star (信任感
 * 连续体) because every other section's existence rests on it.
 */
export function OverviewPage() {
  return (
    <Section
      id="overview"
      eyebrow="Agentin Knowledge Source"
      title="设计系统 · 极简参考手册"
      description={
        <>
          组件、Token、动效都从主项目实时引用 —— 不是一份滚动失同步的快照。
          展示形式按"看一眼就能取色 / 一键复制代码"为目标精简。
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Stat n="11" label="Agentin 颜色 Tokens" hint="--ag-* + 状态色" />
        <Stat n="6" label="字号 · 字重" hint="11 → 18 / 400 · 500 · 600" />
        <Stat n="4" label="动效 Duration Tokens" hint="fast · base · slow · page" />
        <Stat n="7" label="Motion Variants" hint="fade · modal · sheet · …" />
        <Stat n="9" label="UI Primitives" hint="Button · Tooltip · Skeleton · …" />
        <Stat n="6+" label="业务组件" hint="SourceMarker · ReadingIndicator · …" />
      </div>

      <div className="mt-6 rounded-[12px] border border-[var(--ag-border)] bg-white p-5">
        <p className="text-[12px] uppercase tracking-[0.08em] font-medium text-[#868686]">
          North Star
        </p>
        <p className="mt-2 text-[15px] leading-[1.6] text-[#1a1a1a]">
          所有 Token 与组件最终只回答一个问题：
          <span className="font-semibold">「这一处设计有没有让用户更敢相信 AI 的回答？」</span>
        </p>
        <p className="mt-3 text-[13px] leading-[1.6] text-[#868686]">
          信任感是连续体 ——
          <span className="text-[#1a1a1a]">等待时</span>
          建立预期 →
          <span className="text-[#1a1a1a]">阅读时</span>
          逐句确认 →
          <span className="text-[#1a1a1a]">存疑时</span>
          即时核查。本设计系统中的每一个组件都对应到这个三段连续体上的某一拍。
        </p>
      </div>
    </Section>
  )
}

function Stat({ n, label, hint }: { n: string; label: string; hint: string }) {
  return (
    <div className="rounded-[12px] border border-[var(--ag-border)] bg-white p-4">
      <p className="text-[24px] font-semibold tracking-tight text-[#1a1a1a]">
        {n}
      </p>
      <p className="mt-0.5 text-[13px] text-[#1a1a1a]">{label}</p>
      <p className="mt-0.5 text-[12px] text-[#868686]">{hint}</p>
    </div>
  )
}
