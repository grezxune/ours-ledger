import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Tooltip } from "@/components/ui/tooltip";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  iconOnly?: boolean;
  tooltip?: string;
  ariaLabel?: string;
}

/**
 * Shared button component with small variant system.
 */
export function Button({
  children,
  variant = "primary",
  className,
  startIcon,
  endIcon,
  iconOnly = false,
  tooltip,
  ariaLabel,
  "aria-label": ariaLabelProp,
  ...props
}: ButtonProps) {
  const filledStyles = {
    primary: "bg-accent text-white hover:bg-accent-strong",
    secondary: "bg-surface-muted text-foreground hover:bg-surface-muted/80",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const iconStyles = {
    primary: "text-accent hover:text-accent-strong",
    secondary: "text-foreground/75 hover:text-foreground",
    danger: "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
  };

  const button = (
    <button
      {...props}
      aria-label={ariaLabel || ariaLabelProp}
      className={[
        iconOnly
          ? "inline-flex size-9 items-center justify-center rounded-md text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-45"
          : "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70",
        iconOnly ? iconStyles[variant] : filledStyles[variant],
        className || "",
      ].join(" ")}
    >
      {startIcon ? <span aria-hidden>{startIcon}</span> : null}
      {children}
      {endIcon ? <span aria-hidden>{endIcon}</span> : null}
    </button>
  );

  if (!tooltip) {
    return button;
  }

  return <Tooltip content={tooltip}>{button}</Tooltip>;
}
