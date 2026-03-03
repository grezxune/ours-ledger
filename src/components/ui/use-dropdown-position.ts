"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

type DropdownPlacement = "up" | "down";

interface DropdownPositionState {
  placement: DropdownPlacement;
  maxHeight: number;
  top: number;
  left: number;
  width: number;
}

const EDGE_PADDING = 8;
const OFFSET = 4;
const FALLBACK_MAX_HEIGHT = 224;

/**
 * Pure calculator for dropdown placement/max-height decisions.
 */
export function calculateDropdownPosition(anchorTop: number, anchorBottom: number, viewportHeight: number, menuHeight: number) {
  const spaceAbove = Math.max(anchorTop - EDGE_PADDING - OFFSET, 0);
  const spaceBelow = Math.max(viewportHeight - anchorBottom - EDGE_PADDING - OFFSET, 0);
  const placement: DropdownPlacement = spaceBelow >= spaceAbove ? "down" : "up";
  const availableSpace = placement === "down" ? spaceBelow : spaceAbove;
  const minVisibleHeight = Math.min(96, availableSpace);
  const maxHeight = Math.max(minVisibleHeight, Math.min(menuHeight, availableSpace));
  return { placement, maxHeight };
}

/**
 * Computes dropdown placement and max height so listboxes stay inside viewport bounds.
 */
export function useDropdownPosition(
  isOpen: boolean,
  optionCount: number,
  anchorRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>,
) {
  const [state, setState] = useState<DropdownPositionState>({
    placement: "down",
    maxHeight: FALLBACK_MAX_HEIGHT,
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    function measure() {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      if (!anchorRect) return;

      const menuHeight = menuRef.current?.scrollHeight ?? FALLBACK_MAX_HEIGHT;
      const { placement, maxHeight } = calculateDropdownPosition(
        anchorRect.top,
        anchorRect.bottom,
        window.innerHeight,
        menuHeight,
      );
      const width = anchorRect.width;
      const left = Math.max(EDGE_PADDING, Math.min(anchorRect.left, window.innerWidth - EDGE_PADDING - width));
      const top =
        placement === "down"
          ? anchorRect.bottom + OFFSET
          : Math.max(EDGE_PADDING, anchorRect.top - OFFSET - maxHeight);

      setState({ placement, maxHeight, top, left, width });
    }

    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [anchorRef, isOpen, menuRef, optionCount]);

  return state;
}
