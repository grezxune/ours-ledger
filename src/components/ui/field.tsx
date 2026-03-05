import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { SelectField } from "@/components/ui/select-field";

type CornerStyle = "default" | "none";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelHidden?: boolean;
  cornerStyle?: CornerStyle;
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  labelHidden?: boolean;
  cornerStyle?: CornerStyle;
}

/**
 * Styled label + input pair.
 */
export function InputField({
  label,
  className,
  labelHidden = false,
  cornerStyle = "default",
  ...props
}: InputFieldProps) {
  const cornersClass = cornerStyle === "none" ? "rounded-none" : "rounded-xl";
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className={labelHidden ? "sr-only" : "font-medium"}>{label}</span>
      <input
        {...props}
        className={`${cornersClass} border border-line bg-surface px-3 py-2 text-sm outline-none ring-accent focus:ring-2 ${className || ""}`}
      />
    </label>
  );
}

/**
 * Styled label + textarea pair.
 */
export function TextareaField({
  label,
  className,
  labelHidden = false,
  cornerStyle = "default",
  ...props
}: TextareaFieldProps) {
  const cornersClass = cornerStyle === "none" ? "rounded-none" : "rounded-xl";
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className={labelHidden ? "sr-only" : "font-medium"}>{label}</span>
      <textarea
        {...props}
        className={`${cornersClass} border border-line bg-surface px-3 py-2 text-sm outline-none ring-accent focus:ring-2 ${className || ""}`}
      />
    </label>
  );
}

export { SelectField };
export { CheckboxField };
