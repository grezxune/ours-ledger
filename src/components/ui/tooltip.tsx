"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

const EDGE_PADDING = 8;
const OFFSET = 8;
const HIDDEN_POSITION = -10000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Viewport-aware tooltip that repositions to prevent edge clipping.
 */
export function Tooltip({ content, children }: TooltipProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({
    left: HIDDEN_POSITION,
    top: HIDDEN_POSITION,
  });

  useEffect(() => {
    if (!isVisible) return;

    function updatePosition() {
      const wrapperRect = wrapperRef.current?.getBoundingClientRect();
      const bubbleRect = bubbleRef.current?.getBoundingClientRect();
      if (!wrapperRect || !bubbleRect) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const centeredLeft = wrapperRect.left + wrapperRect.width / 2 - bubbleRect.width / 2;
      const maxLeft = Math.max(EDGE_PADDING, viewportWidth - bubbleRect.width - EDGE_PADDING);
      const left = clamp(centeredLeft, EDGE_PADDING, maxLeft);
      const spaceAbove = wrapperRect.top - EDGE_PADDING - OFFSET;
      const spaceBelow = viewportHeight - wrapperRect.bottom - EDGE_PADDING - OFFSET;
      const placeBelow = spaceBelow >= bubbleRect.height || spaceBelow > spaceAbove;
      const idealTop = placeBelow ? wrapperRect.bottom + OFFSET : wrapperRect.top - bubbleRect.height - OFFSET;
      const maxTop = Math.max(EDGE_PADDING, viewportHeight - bubbleRect.height - EDGE_PADDING);
      const top = clamp(idealTop, EDGE_PADDING, maxTop);
      setStyle({ left, top });
    }

    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isVisible]);

  function handleBlur(event: FocusEvent<HTMLSpanElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsVisible(false);
    }
  }

  return (
    <span
      className="inline-flex"
      onBlur={handleBlur}
      onFocus={() => setIsVisible(true)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      ref={wrapperRef}
    >
      {children}
      <span
        aria-hidden={!isVisible}
        className={[
          "pointer-events-none fixed z-50 max-w-[min(20rem,calc(100vw-1rem))] rounded-md border border-line bg-surface px-2 py-1 text-xs text-foreground shadow-sm transition-opacity",
          isVisible ? "opacity-100" : "opacity-0",
        ].join(" ")}
        ref={bubbleRef}
        role="tooltip"
        style={style}
      >
        {content}
      </span>
    </span>
  );
}
