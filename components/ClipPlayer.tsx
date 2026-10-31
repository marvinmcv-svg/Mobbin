"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Muted looping clip that plays only while mostly on screen and never under reduced motion;
 * the poster stays visible otherwise. No `autoplay` attribute: playback is driven here.
 */
export function ClipPlayer({
  src,
  poster,
  className,
  controls = false,
}: {
  src: string;
  poster: string;
  className?: string;
  controls?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.6 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      controls={controls}
      disablePictureInPicture
      disableRemotePlayback
      aria-label="Looping capture clip"
      className={className}
    />
  );
}
