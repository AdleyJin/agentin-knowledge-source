/**
 * Right-aligned user message bubble. Trivial visually but lifted out
 * of `App.tsx` so the chat thread can be assembled from focused
 * section files.
 */
export function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end ag-rise">
      <div className="bg-[var(--ag-bubble-user)] rounded-xl px-3 py-2.5 text-[14px] text-black max-w-[80%]">
        {text}
      </div>
    </div>
  )
}
