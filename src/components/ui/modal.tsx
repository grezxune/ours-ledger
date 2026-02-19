"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

/**
 * Reusable themed modal with overlay and keyboard-dismiss support.
 */
export function Modal({ open, title, children, onClose }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-foreground/45 p-4 sm:items-center"
      role="dialog"
    >
      <button aria-label="Close modal" className="absolute inset-0" onClick={onClose} type="button" />
      <div className="relative z-10 w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-xl max-h-[calc(100dvh-2rem)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl">{title}</h3>
          <Tooltip content="Close dialog">
            <button
              aria-label="Close dialog"
              className="inline-flex size-8 items-center justify-center rounded-md text-foreground/75 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden className="size-4" />
            </button>
          </Tooltip>
        </div>
        {children}
      </div>
    </div>
  );
}
