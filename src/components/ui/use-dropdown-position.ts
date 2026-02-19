"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

type DropdownPlacement = "up" | "down";

interface DropdownPositionState {
  placement: DropdownPlacement;
  maxHeight: number;
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
  });

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    function measure() {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      if (!anchorRect) return;

      const menuHeight = menuRef.current?.scrollHeight ?? FALLBACK_MAX_HEIGHT;
      setState(calculateDropdownPosition(anchorRect.top, anchorRect.bottom, window.innerHeight, menuHeight));
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
