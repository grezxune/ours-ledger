"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { useDropdownPosition } from "@/components/ui/use-dropdown-position";
export interface SelectOption {
  label: string;
  value: string;
}
interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "defaultValue" | "multiple" | "size" | "value"> {
  label: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
}
function getInitialValue(options: SelectOption[], value?: string, defaultValue?: string) {
  if (value && options.some((option) => option.value === value)) {
    return value;
  }
  if (defaultValue && options.some((option) => option.value === defaultValue)) {
    return defaultValue;
  }
  return options[0]?.value ?? "";
}
/**
 * Styled label + custom select dropdown that keeps native form submission.
 */
export function SelectField({ label, options, className, value, defaultValue, disabled, onChange, ...props }: SelectFieldProps) {
  const buttonId = useId();
  const listboxId = `${buttonId}-listbox`;
  const nativeSelectRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const isControlled = typeof value === "string";
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState(() =>
    getInitialValue(options, value, typeof defaultValue === "string" ? defaultValue : undefined),
  );

  const selectedValue = useMemo(() => {
    if (isControlled) {
      return getInitialValue(options, value, typeof defaultValue === "string" ? defaultValue : undefined);
    }
    if (options.some((option) => option.value === internalValue)) {
      return internalValue;
    }
    return getInitialValue(options, undefined, typeof defaultValue === "string" ? defaultValue : undefined);
  }, [defaultValue, internalValue, isControlled, options, value]);
  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === selectedValue),
    [options, selectedValue],
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options[0];
  const nativeSelectValueProps = isControlled ? { value: selectedValue } : { defaultValue: selectedValue };
  const { placement, maxHeight } = useDropdownPosition(isOpen, options.length, containerRef, listboxRef);

  useEffect(() => {
    function onDocumentPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocumentPointerDown);
    return () => document.removeEventListener("mousedown", onDocumentPointerDown);
  }, []);

  useEffect(() => {
    if (!nativeSelectRef.current) return;
    if (nativeSelectRef.current.value !== selectedValue) {
      nativeSelectRef.current.value = selectedValue;
    }
  }, [selectedValue]);

  function commitValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    setIsOpen(false);
    setActiveIndex(-1);

    if (nativeSelectRef.current) {
      nativeSelectRef.current.value = nextValue;
      nativeSelectRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function handleNativeChange(event: ChangeEvent<HTMLSelectElement>) {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }
    onChange?.(event);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (options.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        return;
      }
      setActiveIndex((index) => {
        if (event.key === "ArrowDown") return (index + 1) % options.length;
        return index <= 0 ? options.length - 1 : index - 1;
      });
    }
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
    if ((event.key === "Enter" || event.key === " ") && isOpen && activeIndex >= 0) {
      event.preventDefault();
      commitValue(options[activeIndex].value);
    }
  }

  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <div
        className="relative"
        onBlur={(event) => !event.currentTarget.contains(event.relatedTarget as Node | null) && setIsOpen(false)}
        ref={containerRef}
      >
        <select
          {...props}
          {...nativeSelectValueProps}
          aria-hidden
          className="sr-only"
          disabled={disabled}
          onChange={handleNativeChange}
          ref={nativeSelectRef}
          tabIndex={-1}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`Select ${label}`}
          className={`w-full rounded-xl border border-line bg-surface px-3 py-2 pr-11 text-left text-sm outline-none ring-accent transition focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${className || ""}`}
          disabled={disabled || options.length === 0}
          id={buttonId}
          onClick={() => {
            setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
            setIsOpen((open) => !open);
          }}
          onKeyDown={handleTriggerKeyDown}
          type="button"
        >
          {selectedOption?.label || "Select an option"}
        </button>

        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-foreground/70" aria-hidden>
          <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
        </span>

        {isOpen ? (
          <ul
            className={[
              "absolute left-0 right-0 z-20 overflow-auto rounded-xl border border-line bg-surface p-1 shadow-lg",
              placement === "down" ? "top-[calc(100%+0.25rem)]" : "bottom-[calc(100%+0.25rem)]",
            ].join(" ")}
            id={listboxId}
            role="listbox"
            ref={listboxRef}
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {options.map((option, index) => (
              <li key={option.value}>
                <button
                  aria-selected={option.value === selectedValue}
                  aria-label={`Choose ${option.label}`}
                  className={`w-full rounded-lg px-2 py-2 text-left text-sm ${index === activeIndex ? "bg-foreground/10" : "hover:bg-foreground/5"}`}
                  onClick={() => commitValue(option.value)}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  type="button"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </label>
  );
}
