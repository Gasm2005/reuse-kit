"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { IconButton } from "./Button";
import type { PropertyImage } from "@/lib/types";

type MediaItem = { type: "image" | "video"; url: string; room: string | null };

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function VideoThumb({ url }: { url: string }) {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  return <div className="absolute inset-0 bg-ink" />;
}

function VideoPlayer({ url, className }: { url: string; className?: string }) {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}`}
        title="Property video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={className}
      />
    );
  }
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video src={url} controls className={className} />
  );
}

export default function PropertyGallery({
  images,
  videos = [],
  title,
  overlay,
  heightClassName = "h-[340px] sm:h-[440px]",
  showThumbnails = true,
}: {
  images: PropertyImage[];
  videos?: string[];
  title: string;
  /**
   * Content rendered over the bottom of the main photo, with its own scrim.
   * Used on the property page only — the title/eyebrow/location sit on the
   * photo itself for a full-screen-first look, rather than beside it.
   * Every other use of this component (none yet elsewhere) leaves it unset
   * and gets the plain photo.
   */
  overlay?: React.ReactNode;
  /** Lets the one caller that wants a taller, more cinematic photo ask for
   * it without changing the default for everyone else. */
  heightClassName?: string;
  /**
   * Off for the property page's hero use: with the strip rendered, a
   * caller pulling a sibling element up with a negative margin overlaps
   * the *thumbnails*, not the photo, since the strip sits between them in
   * flow. Off, the photo's bottom edge is the last thing in normal flow,
   * so the overlap lands where it's meant to. Browsing still works via the
   * lightbox's arrows.
   */
  showThumbnails?: boolean;
}) {
  const media: MediaItem[] = useMemo(
    () => [
      ...images.map((img) => ({
        type: "image" as const,
        url: img.url,
        room: img.room,
      })),
      ...videos.map((url) => ({ type: "video" as const, url, room: null })),
    ],
    [images, videos]
  );

  // Someone shopping a 4BHK wants to see each bedroom and know which is
  // which — a flat strip of thumbnails can't say that. Rooms that were
  // actually tagged become filter chips; if nothing was tagged, this list
  // is empty and the chip row just doesn't render.
  const rooms = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const m of media) {
      if (m.room && !seen.has(m.room)) {
        seen.add(m.room);
        ordered.push(m.room);
      }
    }
    return ordered;
  }, [media]);

  const [roomFilter, setRoomFilter] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const visible = useMemo(
    () => (roomFilter ? media.filter((m) => m.room === roomFilter) : media),
    [media, roomFilter]
  );

  // Clamp rather than reset to 0 — picking a room chip should land on that
  // room's first photo, not silently keep whatever index was active before.
  const activeIndex = Math.min(active, Math.max(visible.length - 1, 0));

  function selectRoom(room: string | null) {
    setRoomFilter(room);
    setActive(0);
  }

  const goPrev = useCallback(() => {
    setActive((i) => (i - 1 + visible.length) % visible.length);
  }, [visible.length]);

  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % visible.length);
  }, [visible.length]);

  // Swipe on the main photo. A ref, not state — touch coordinates during a
  // drag don't need to trigger a render, only the final decision does.
  // swiped guards the click handler: a touchend fires a click right after
  // it on most mobile browsers, and without this a swipe would also pop
  // the lightbox open.
  const touchStartX = useRef<number | null>(null);
  const swiped = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    swiped.current = true;
    if (delta < 0) goNext();
    else goPrev();
  }

  function onPhotoClick() {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    setLightboxOpen(true);
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, goPrev, goNext]);

  if (media.length === 0) {
    return (
      <div className="w-full h-[340px] rounded-xl bg-paper-dim flex items-center justify-center text-ink-soft">
        No photos available yet
      </div>
    );
  }

  const activeItem = visible[activeIndex];

  return (
    <div>
      {rooms.length > 1 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          <RoomChip active={roomFilter === null} onClick={() => selectRoom(null)}>
            All photos
          </RoomChip>
          {rooms.map((room) => (
            <RoomChip
              key={room}
              active={roomFilter === room}
              onClick={() => selectRoom(room)}
            >
              {room}
            </RoomChip>
          ))}
        </div>
      )}

      <div className="relative">
        <button
          onClick={onPhotoClick}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className={`w-full ${heightClassName} relative rounded-xl overflow-hidden bg-paper-dim block group`}
          aria-label="Open full-screen gallery"
        >
        {activeItem.type === "image" ? (
          <Image
            src={activeItem.url}
            alt={
              activeItem.room
                ? `${activeItem.room} — ${title}`
                : `Photo ${activeIndex + 1} of ${title}`
            }
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0">
            <VideoThumb url={activeItem.url} />
            <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-paper/90 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-ink ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {activeItem.room && (
          <span className="absolute top-3 left-3 label text-[0.6875rem] bg-paper/95 text-ink px-3 py-1.5 rounded-lg">
            {activeItem.room}
          </span>
        )}

        {/* Scrim + caller-supplied title block — only present on the
            property page, where the photo comes first and carries the
            title, eyebrow, and location directly on it. */}
        {overlay && (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,17,11,0.88)_0%,rgba(20,17,11,0.15)_45%,transparent_70%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 pointer-events-none">
              {overlay}
            </div>
          </>
        )}

        {/* Hover-only made sense when the thumbnail strip below already
            showed there was more to see. With showThumbnails off, this
            badge is the only sign of that, so it stays visible — a
            hover-only hint would never appear on a touch device at all. */}
        <div
          className={`absolute bottom-3 right-3 bg-ink/75 text-paper text-sm font-medium px-3 py-1.5 rounded-lg transition-opacity ${
            showThumbnails ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`}
        >
          {activeIndex + 1} / {visible.length} — Click to view
        </div>
        </button>

        {/* Arrows directly on the photo — useful in both modes, but the
            only way to move between photos at all when showThumbnails is
            off. Siblings of the photo's own button, not nested inside it
            (a button inside a button is invalid), so a click lands on
            whichever is on top under the cursor without needing to stop
            it from reaching the one underneath. */}
        {visible.length > 1 && (
          <>
            <IconButton
              label="Previous photo"
              tone="onDark"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </IconButton>
            <IconButton
              label="Next photo"
              tone="onDark"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </IconButton>
          </>
        )}
      </div>

      {showThumbnails && visible.length > 1 && (
        <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
          {visible.map((item, i) => (
            <button
              key={item.url + i}
              onClick={() => setActive(i)}
              className={`relative w-20 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex ? "border-brass" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={
                item.room ? `View ${item.room}` : `View ${item.type} ${i + 1} of ${title}`
              }
            >
              {item.type === "image" ? (
                <Image src={item.url} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <>
                  <VideoThumb url={item.url} />
                  <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[150] bg-ink/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
        >
          <IconButton
            label="Close gallery"
            tone="onDark"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </IconButton>

          <IconButton
            label="Previous"
            tone="onDark"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-3 sm:left-6 z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </IconButton>

          <div
            className="w-full max-w-4xl max-h-[80vh] px-14 sm:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.type === "image" ? (
              <div className="relative w-full aspect-[4/3] sm:aspect-video">
                <Image
                  src={activeItem.url}
                  alt={
                    activeItem.room
                      ? `${activeItem.room} — ${title}`
                      : `Photo ${activeIndex + 1} of ${title}`
                  }
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <VideoPlayer url={activeItem.url} className="w-full aspect-video rounded" />
            )}
            <p className="text-center text-paper/60 text-sm mt-4">
              {activeItem.room ? `${activeItem.room} — ` : ""}
              {activeIndex + 1} / {visible.length}
            </p>
          </div>

          <IconButton
            label="Next"
            tone="onDark"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-3 sm:right-6 z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </IconButton>
        </div>
      )}
    </div>
  );
}

function RoomChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border-[1.5px] transition-colors whitespace-nowrap ${
        active
          ? "bg-ink text-paper border-ink"
          : "bg-shell border-ink/15 text-ink-soft hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
