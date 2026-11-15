"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Measures the rendered width of a wrapper so charts can draw in real pixel
 * units (viewBox 1:1). That keeps type, strokes and rounded ends undistorted -
 * a stretched viewBox would squash the labels at narrow widths.
 *
 * Starts at 0 and the caller renders nothing until a width arrives: drawing at
 * a guessed width can overflow the container, toggle a scrollbar, and set off a
 * measure/resize feedback loop.
 */
export function useElementWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = (next: number) => {
      const rounded = Math.floor(next);
      setWidth((current) => (Math.abs(current - rounded) > 0.5 ? rounded : current));
    };

    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next) update(next);
    });

    observer.observe(node);
    update(node.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return { ref, width } as const;
}
