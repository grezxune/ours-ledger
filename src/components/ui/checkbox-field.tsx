import { Check } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  labelClassName?: string;
  indicatorClassName?: string;
  inputClassName?: string;
}

/**
 * Shared checkbox field with custom indicator styling and native form semantics.
 */
export function CheckboxField({
  label,
  className,
  labelClassName,
  indicatorClassName,
  inputClassName,
  disabled,
  ...props
}: CheckboxFieldProps) {
  const wrapperClassName = [
    "inline-flex items-center gap-2 text-sm font-medium text-foreground/90",
    disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");
  const indicatorClasses = [
    "flex size-4 shrink-0 items-center justify-center rounded border border-line bg-surface text-transparent transition",
    "peer-checked:border-accent peer-checked:bg-accent peer-checked:text-action-primary-foreground",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-disabled:opacity-70",
    indicatorClassName || "",
  ]
    .filter(Boolean)
    .join(" ");
  const labelClasses = ["text-foreground/90", labelClassName || ""].filter(Boolean).join(" ");

  return (
    <label className={wrapperClassName}>
      <input {...props} className={["peer sr-only", inputClassName || ""].filter(Boolean).join(" ")} disabled={disabled} type="checkbox" />
      <span aria-hidden className={indicatorClasses}>
        <Check className="size-3" />
      </span>
      <span className={labelClasses}>{label}</span>
    </label>
  );
}
