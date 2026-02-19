"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

type ActionMenuItemTone = "default" | "danger";
type ActionMenuAlign = "left" | "right";

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void | Promise<void>;
  tone?: ActionMenuItemTone;
  disabled?: boolean;
  closeOnSelect?: boolean;
}

interface ActionMenuProps {
  triggerAriaLabel: string;
  items: ActionMenuItem[];
  menuAriaLabel?: string;
  triggerIcon?: ReactNode;
  align?: ActionMenuAlign;
}

/**
 * Shared contextual action menu with configurable trigger and item behavior.
 */
export function ActionMenu({
  triggerAriaLabel,
  items,
  menuAriaLabel,
  triggerIcon,
  align = "right",
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <Button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        ariaLabel={triggerAriaLabel}
        iconOnly
        onClick={() => setIsOpen((open) => !open)}
        startIcon={triggerIcon || <MoreHorizontal className="size-4" />}
        type="button"
        variant="secondary"
      >
        <span className="sr-only">Open actions menu</span>
      </Button>
      {isOpen ? (
        <div
          aria-label={menuAriaLabel || triggerAriaLabel}
          className={[
            "absolute top-full z-30 mt-1 min-w-40 rounded-xl border border-line bg-surface p-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
          ].join(" ")}
          role="menu"
        >
          {items.map((item) => (
            <button
              className={[
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                item.tone === "danger"
                  ? "text-red-600 hover:bg-red-600/10 dark:text-red-400 dark:hover:bg-red-500/10"
                  : "text-foreground hover:bg-surface-muted",
                item.disabled ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
              disabled={item.disabled}
              key={item.id}
              onClick={async () => {
                const shouldClose = item.closeOnSelect ?? true;
                if (shouldClose) {
                  setIsOpen(false);
                }
                await item.onSelect();
              }}
              role="menuitem"
              type="button"
            >
              {item.icon ? <span aria-hidden>{item.icon}</span> : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
