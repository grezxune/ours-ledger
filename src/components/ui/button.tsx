import {
  Children,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { Tooltip } from "@/components/ui/tooltip";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  iconOnly?: boolean;
  unstyled?: boolean;
  asChild?: boolean;
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
  unstyled = false,
  asChild = false,
  tooltip,
  ariaLabel,
  "aria-label": ariaLabelProp,
  ...props
}: ButtonProps) {
  const filledStyles = {
    primary: "bg-action-primary text-action-primary-foreground hover:bg-action-primary-hover",
    secondary: "bg-surface-muted text-foreground hover:bg-surface-muted/80",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const iconStyles = {
    primary: "text-accent hover:text-accent-strong",
    secondary: "text-foreground/75 hover:text-foreground",
    danger: "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
  };

  const content = (
    <>
      {startIcon ? <span aria-hidden>{startIcon}</span> : null}
      {children}
      {endIcon ? <span aria-hidden>{endIcon}</span> : null}
    </>
  );
  const buttonClass = [
    unstyled
      ? ""
      : iconOnly
        ? "inline-flex size-9 items-center justify-center rounded-md text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-45"
        : "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70",
    unstyled ? "" : iconOnly ? iconStyles[variant] : filledStyles[variant],
    className || "",
  ]
    .filter(Boolean)
    .join(" ");
  const label = ariaLabel || ariaLabelProp;

  const button = asChild
    ? (() => {
        const child = Children.only(children);
        if (!isValidElement(child)) {
          throw new Error("Button with asChild requires a single valid React element child.");
        }
        const element = child as ReactElement<{ className?: string; "aria-label"?: string }>;
        const nextProps: { className: string; "aria-label"?: string } & Record<string, unknown> = {
          ...props,
          className: [buttonClass, element.props.className || ""].join(" "),
        };
        const resolvedLabel = label || element.props["aria-label"];
        if (resolvedLabel) {
          nextProps["aria-label"] = resolvedLabel;
        }
        return cloneElement(element, nextProps);
      })()
    : (
        <button {...props} aria-label={label} className={buttonClass}>
          {content}
        </button>
      );

  if (!tooltip) {
    return button;
  }

  return <Tooltip content={tooltip}>{button}</Tooltip>;
}
