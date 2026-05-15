import * as React from 'react'

import { ViewModeContext } from '@app/contexts/agentin'
import { SourceMarker } from '@app/components/agentin/source-marker'
import {
  SourceTypeIcon,
  SourceTypeTag,
} from '@app/components/agentin/source-type-icon'
import { UserBubble } from '@app/sections/chat/user-bubble'
import { SourcesBlock } from '@app/sections/chat/sources-block'
import {
  SearchingIndicator,
  ReadingIndicator,
} from '@app/sections/chat/reading-indicator'
import { MessageActions } from '@app/sections/chat/message-actions'

import { Section, SubHeading } from '../components/Section'
import { Preview } from '../components/Preview'

/**
 * Business-layer components that encode the trust continuum
 * (anticipation → reading → verification). All previews wrap the live
 * component in `ViewModeContext` ("desktop") so behaviour matches the
 * default surface shown in the main app.
 */
export function BusinessPage() {
  return (
    <ViewModeContext.Provider value="desktop">
      <Section
        id="business"
        eyebrow="Business · Agentin"
        title="业务组件"
        description={
          <>
            为知识库索引场景沉淀的核心组件。每一个都对应到
            <strong className="text-[#1a1a1a]">信任感连续体</strong>
            的某一拍 —— 删掉任何一个,信任感都会塌陷。
          </>
        }
      >
        {/* ── SourceMarker ────────────────────────────────────── */}
        <SubHeading
          id="biz-source-marker"
          hint="阅读时 · 行内角标 (16×16)"
        >
          SourceMarker · 行内角标
        </SubHeading>
        <Preview
          caption="鼠标悬停在角标上 → 弹出预览卡（类型 · 标题 · 引用片段）"
          code={`import { SourceMarker } from '@/components/agentin/source-marker'

<p>
  画面减法的核心在于克制
  <SourceMarker n={1} />
  。把"非主体"的视觉权重降到最低
  <SourceMarker n={2} />
  ,留出呼吸感。
</p>`}
          align="start"
          framed
        >
          <p className="text-[14px] leading-[1.7] text-[#1a1a1a]">
            画面减法的核心在于克制
            <SourceMarker n={1} />
            。把"非主体"的视觉权重降到最低
            <SourceMarker n={2} />
            ,留出呼吸感,让观众的视线第一时间落在最重要的被摄对象上
            <SourceMarker n={3} />
            。
          </p>
        </Preview>

        {/* ── SourceTypeTag ───────────────────────────────────── */}
        <SubHeading
          id="biz-source-tag"
          hint="资源类型小标签 · 单色 line glyph"
        >
          SourceTypeTag · 类型标签
        </SubHeading>
        <Preview
          caption="6 种资源类型 · 全部走灰底,通过形状区分"
          code={`<SourceTypeTag type="录播课" />
<SourceTypeTag type="学习资料" />
<SourceTypeTag type="Flowin 文档" />
<SourceTypeTag type="共创文档" />
<SourceTypeTag type="PDF" />
<SourceTypeTag type="作业" />`}
        >
          <div className="flex flex-wrap gap-2">
            <SourceTypeTag type="录播课" />
            <SourceTypeTag type="学习资料" />
            <SourceTypeTag type="Flowin 文档" />
            <SourceTypeTag type="共创文档" />
            <SourceTypeTag type="PDF" />
            <SourceTypeTag type="作业" />
          </div>
        </Preview>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(
            [
              '录播课',
              '学习资料',
              'Flowin 文档',
              '共创文档',
              'PDF',
              '作业',
            ] as const
          ).map((t) => (
            <div
              key={t}
              className="flex flex-col items-center gap-2 rounded-[10px] border border-[var(--ag-border)] bg-white p-4"
            >
              <SourceTypeIcon
                type={t}
                className="size-[20px] text-[#1a1a1a]"
                wrapperClassName="size-[20px]"
              />
              <span className="text-[11.5px] text-[#868686]">{t}</span>
            </div>
          ))}
        </div>

        {/* ── UserBubble ──────────────────────────────────────── */}
        <SubHeading id="biz-user-bubble" hint="右对齐 · max-w-80%">
          UserBubble · 用户气泡
        </SubHeading>
        <Preview
          caption="用户提问气泡 · 浅灰底"
          code={`<UserBubble text="我的班级最近的学习情况如何？" />`}
          align="start"
          framed
        >
          <UserBubble text="我的班级最近的学习情况如何？" />
        </Preview>

        {/* ── SearchingIndicator / ReadingIndicator ───────────── */}
        <SubHeading
          id="biz-reading"
          hint="等待时 · 三段式状态机的可视层"
        >
          检索 / 阅读 指示器
        </SubHeading>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Preview
            caption="阶段 1：检索中 · shimmer 文字扫光"
            code={`<SearchingIndicator />`}
            align="start"
            framed
            background="card"
          >
            <SearchingIndicator />
          </Preview>
          <Preview
            caption="阶段 2：阅读资料 · 资料列表向上滚动"
            code={`<ReadingIndicator />`}
            align="start"
            framed
            background="card"
          >
            <RemountOnTab>
              <ReadingIndicator />
            </RemountOnTab>
          </Preview>
        </div>

        {/* ── SourcesBlock ────────────────────────────────────── */}
        <SubHeading
          id="biz-sources-block"
          hint="存疑时 · 折叠在底部的来源列表"
        >
          SourcesBlock · 来源折叠条
        </SubHeading>
        <Preview
          caption={'点击「找到 6 篇知识库资料」查看完整列表'}
          code={`<SourcesBlock />`}
          align="start"
          framed
          background="card"
        >
          <SourcesBlock />
        </Preview>

        {/* ── MessageActions ──────────────────────────────────── */}
        <SubHeading
          id="biz-actions"
          hint="完成后追加的消息操作行"
        >
          MessageActions · 消息操作
        </SubHeading>
        <Preview
          caption="重新生成 / 复制 / 赞 / 踩"
          code={`<MessageActions />`}
          align="start"
          background="card"
        >
          <MessageActions />
        </Preview>

        {/* ── 三段式 cheat-sheet ──────────────────────────────── */}
        <div className="mt-12 rounded-[12px] border border-[var(--ag-border)] bg-white p-6">
          <p className="text-[12px] uppercase tracking-[0.08em] font-medium text-[#868686]">
            连续体速查 · Trust Continuum
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContinuumStep
              phase="等待时"
              en="Anticipation"
              what="让用户看见 AI 在真实检索"
              who="SearchingIndicator · ReadingIndicator"
            />
            <ContinuumStep
              phase="阅读时"
              en="Continuous"
              what="角标随结论同步出现"
              who="SourceMarker (+ AssistantMessage)"
            />
            <ContinuumStep
              phase="存疑时"
              en="Verification"
              what="hover 即可看证据"
              who="SourcePopover · SourcesBlock · MobileSheets"
            />
          </div>
        </div>
      </Section>
    </ViewModeContext.Provider>
  )
}

function ContinuumStep({
  phase,
  en,
  what,
  who,
}: {
  phase: string
  en: string
  what: string
  who: string
}) {
  return (
    <div className="rounded-[10px] bg-[var(--ag-bg)] p-4">
      <p className="text-[14px] font-semibold text-[#1a1a1a]">{phase}</p>
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#bbbbbb]">
        {en}
      </p>
      <p className="mt-3 text-[13px] text-[#1a1a1a]">{what}</p>
      <p className="mt-2 font-mono text-[11.5px] text-[#868686]">{who}</p>
    </div>
  )
}

/**
 * The ReadingIndicator runs a 6-second sub-step machine on mount and
 * then collapses, so a single rendered instance only animates once.
 * This wrapper bumps a key every ~7s so visitors of the doc page see
 * it loop indefinitely — important because the indicator is the
 * largest "wow" moment of the trust continuum.
 */
function RemountOnTab({ children }: { children: React.ReactNode }) {
  const [k, setK] = React.useState(0)
  React.useEffect(() => {
    const id = window.setInterval(() => setK((v) => v + 1), 7200)
    return () => window.clearInterval(id)
  }, [])
  return <div key={k}>{children}</div>
}
