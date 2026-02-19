"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmIcon?: ReactNode;
  confirmVariant?: ButtonVariant;
  cancelLabel?: string;
  onClose: () => void;
  confirmFormAction?:
    | ((formData: FormData) => Promise<void>)
    | (() => Promise<void>);
  onConfirm?: () => void;
}

/**
 * Shared confirmation modal for destructive or irreversible actions.
 */
export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel,
  confirmIcon,
  confirmVariant = "danger",
  cancelLabel = "Cancel",
  onClose,
  confirmFormAction,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <Modal onClose={onClose} open={open} title={title}>
      <p className="text-sm text-foreground/80">{description}</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button ariaLabel={cancelLabel} onClick={onClose} type="button" variant="secondary">
          {cancelLabel}
        </Button>
        {confirmFormAction ? (
          <form action={confirmFormAction}>
            <Button
              ariaLabel={confirmLabel}
              startIcon={confirmIcon}
              type="submit"
              variant={confirmVariant}
            >
              {confirmLabel}
            </Button>
          </form>
        ) : (
          <Button
            ariaLabel={confirmLabel}
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            startIcon={confirmIcon}
            type="button"
            variant={confirmVariant}
          >
            {confirmLabel}
          </Button>
        )}
      </div>
    </Modal>
  );
}
