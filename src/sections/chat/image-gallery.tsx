import * as React from 'react'

import { cn } from '@/lib/utils'
import { ViewModeContext } from '@/contexts/agentin'

import { ImageLightbox } from './image-lightbox'

import gallery1 from '@/assets/gallery-1.jpg'
import gallery2 from '@/assets/gallery-2.jpg'
import gallery3 from '@/assets/gallery-3.jpg'
import gallery4 from '@/assets/gallery-4.jpg'
import IconImageCount from '@/assets/icons/icon-image-count.svg?react'

/**
 * Fade-in image: starts transparent, transitions to fully visible once
 * the browser decodes the bitmap. Avoids the jarring "pop" of images
 * appearing at full opacity while also not relying on `loading="lazy"`
 * (which misfires inside overflow:hidden scroll containers in Electron).
 */
function FadeImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [loaded, setLoaded] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  // If the image is already in the browser cache, the browser fires `load`
  // before React attaches the onLoad handler. Checking `img.complete` on
  // mount catches this case so the image never gets stuck at opacity-0.
  React.useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [])

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={cn(
        loaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
      onLoad={() => setLoaded(true)}
    />
  )
}

// Desktop: three equal-width tiles in a grid (5:4 aspect ratio).
// Mobile: single horizontally-scrollable row showing every image at a
// fixed 160 × 120 px tile so they all stay accessible without a count
// chip. Negative horizontal margins let the strip bleed to the chat
// padding edge, giving a full-width feel inside the narrow phone screen.
const GALLERY_IMAGES: string[] = [gallery1, gallery2, gallery3, gallery4]

const GALLERY_TOTAL = GALLERY_IMAGES.length

export function ImageGallery() {
  const view = React.useContext(ViewModeContext)
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  const lightbox = (
    <ImageLightbox
      open={openIndex !== null}
      index={openIndex ?? 0}
      onIndexChange={(i) => setOpenIndex(i)}
      onClose={() => setOpenIndex(null)}
      images={GALLERY_IMAGES}
    />
  )

  if (view === 'mobile') {
    return (
      <>
        {/* Bleed the strip to the left/right chat padding (px-6 = 24px) so
         * it fills the full phone-screen width. `overflow-x-auto` with
         * `scrollbar-none` keeps the native scroll gesture without the
         * browser scrollbar gutter stealing height. */}
        <div className="ag-rise -mx-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 px-6 w-max">
            {GALLERY_IMAGES.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpenIndex(i)}
                className="relative shrink-0 w-[160px] h-[120px] cursor-pointer overflow-hidden rounded-[12px] bg-[#ececec] focus:outline-none focus:ring-2 focus:ring-black/30"
              >
                <FadeImage
                  src={src}
                  alt=""
                  className="size-full object-cover transition-opacity duration-300"
                />
              </button>
            ))}
            {/* Right-side breathing room so the last tile doesn't sit flush
             * against the scroll container edge. */}
            <div className="w-0 shrink-0 pr-6" aria-hidden="true" />
          </div>
        </div>
        {lightbox}
      </>
    )
  }

  // Desktop: 3-column grid (original layout)
  const previewCount = 3
  const preview = GALLERY_IMAGES.slice(0, previewCount)
  return (
    <>
      <div className="ag-rise grid grid-cols-3 gap-2">
        {preview.map((src, i) => {
          const showCountChip = i === preview.length - 1 && GALLERY_TOTAL > previewCount
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative aspect-[5/4] w-full cursor-pointer overflow-hidden rounded-[12px] bg-[#ececec] focus:outline-none focus:ring-2 focus:ring-black/30"
            >
              <FadeImage
                src={src}
                alt=""
                className="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              {showCountChip && (
                <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-[rgba(26,26,26,0.8)] pl-1.5 pr-2 py-0.5 text-[12px] leading-none text-white">
                  <IconImageCount className="size-4" aria-hidden="true" />
                  {GALLERY_TOTAL}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {lightbox}
    </>
  )
}
