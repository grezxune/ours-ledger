import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { SelectField } from "@/components/ui/select-field";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

/**
 * Styled label + input pair.
 */
export function InputField({ label, className, ...props }: InputFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        {...props}
        className={`rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none ring-accent focus:ring-2 ${className || ""}`}
      />
    </label>
  );
}

/**
 * Styled label + textarea pair.
 */
export function TextareaField({ label, className, ...props }: TextareaFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        {...props}
        className={`rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none ring-accent focus:ring-2 ${className || ""}`}
      />
    </label>
  );
}

export { SelectField };
