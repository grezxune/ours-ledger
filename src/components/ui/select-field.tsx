"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, CirclePlus } from "lucide-react";
import { useDropdownPosition } from "@/components/ui/use-dropdown-position";
export interface SelectOption {
  label: string;
  value: string;
}
type CornerStyle = "default" | "none";
interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "defaultValue" | "multiple" | "size" | "value"> {
  label: string;
  labelHidden?: boolean;
  cornerStyle?: CornerStyle;
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

const ADD_OPTION_VALUE_PREFIX = "__add_";
const TYPEAHEAD_RESET_MS = 500;

/**
 * Detects add-new call-to-action options rendered inside shared select dropdowns.
 */
export function isAddSelectActionOption(option: SelectOption): boolean {
  return option.value.startsWith(ADD_OPTION_VALUE_PREFIX) || /^add\b/i.test(option.label.trim());
}

/**
 * Finds the first option whose label starts with the query from startIndex and wraps once.
 */
export function findTypeaheadMatch(options: SelectOption[], query: string, startIndex = 0): number {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery || options.length === 0) {
    return -1;
  }
  const ordered = [
    ...options.slice(Math.max(0, startIndex)),
    ...options.slice(0, Math.max(0, startIndex)),
  ];
  const matchOffset = ordered.findIndex((option) =>
    option.label.trim().toLowerCase().startsWith(normalizedQuery),
  );
  if (matchOffset === -1) {
    return -1;
  }
  return (Math.max(0, startIndex) + matchOffset) % options.length;
}
/**
 * Styled label + custom select dropdown that keeps native form submission.
 */
export function SelectField({
  label,
  labelHidden = false,
  cornerStyle = "default",
  options,
  className,
  value,
  defaultValue,
  disabled,
  onChange,
  ...props
}: SelectFieldProps) {
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
  const typeaheadBufferRef = useRef("");
  const typeaheadLastAtRef = useRef(0);
  const typeaheadResetTimerRef = useRef<number | null>(null);

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
  const firstAddOptionIndex = useMemo(
    () => options.findIndex((option) => isAddSelectActionOption(option)),
    [options],
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options[0];
  const cornersClass = cornerStyle === "none" ? "rounded-none" : "rounded-xl";
  const nativeSelectValueProps = isControlled ? { value: selectedValue } : { defaultValue: selectedValue };
  const { maxHeight, top, left, width } = useDropdownPosition(isOpen, options.length, containerRef, listboxRef);

  useEffect(() => {
    function onDocumentPointerDown(event: MouseEvent) {
      const targetNode = event.target as Node;
      if (containerRef.current?.contains(targetNode)) return;
      if (listboxRef.current?.contains(targetNode)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", onDocumentPointerDown);
    return () => document.removeEventListener("mousedown", onDocumentPointerDown);
  }, []);

  useEffect(
    () => () => {
      if (typeaheadResetTimerRef.current !== null) {
        window.clearTimeout(typeaheadResetTimerRef.current);
      }
    },
    [],
  );

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

  function handleTypeahead(key: string) {
    const now = Date.now();
    const buffer =
      now - typeaheadLastAtRef.current > TYPEAHEAD_RESET_MS
        ? key.toLowerCase()
        : `${typeaheadBufferRef.current}${key.toLowerCase()}`;
    typeaheadBufferRef.current = buffer;
    typeaheadLastAtRef.current = now;
    if (typeaheadResetTimerRef.current !== null) {
      window.clearTimeout(typeaheadResetTimerRef.current);
    }
    typeaheadResetTimerRef.current = window.setTimeout(() => {
      typeaheadBufferRef.current = "";
      typeaheadLastAtRef.current = 0;
      typeaheadResetTimerRef.current = null;
    }, TYPEAHEAD_RESET_MS);

    const startIndex = selectedIndex >= 0 ? selectedIndex + 1 : 0;
    const matchedIndex = findTypeaheadMatch(options, buffer, startIndex);
    if (matchedIndex === -1) {
      return;
    }

    setActiveIndex(matchedIndex);
    commitValue(options[matchedIndex].value);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (options.length === 0) return;
    if (!event.metaKey && !event.ctrlKey && !event.altKey && event.key.length === 1 && /\S/.test(event.key)) {
      event.preventDefault();
      handleTypeahead(event.key);
      return;
    }
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
      <span className={labelHidden ? "sr-only" : "font-medium"}>{label}</span>
      <div className="relative" ref={containerRef}>
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
          className={`flex w-full items-center justify-start overflow-hidden ${cornersClass} border border-line bg-surface px-3 py-2 pr-11 text-left text-sm outline-none ring-accent transition focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${className || ""}`}
          disabled={disabled || options.length === 0}
          id={buttonId}
          onClick={() => {
            setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
            setIsOpen((open) => !open);
          }}
          onKeyDown={handleTriggerKeyDown}
          title={selectedOption?.label || "Select an option"}
          type="button"
        >
          <span className="min-w-0 flex-1 truncate">{selectedOption?.label || "Select an option"}</span>
        </button>

        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-foreground/70" aria-hidden>
          <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
        </span>

        {isOpen && typeof document !== "undefined"
          ? createPortal(
              <ul
                className="fixed z-[120] overflow-auto rounded-xl border border-line bg-surface p-1 shadow-lg"
                id={listboxId}
                role="listbox"
                ref={listboxRef}
                style={{
                  maxHeight: `${maxHeight}px`,
                  top: `${top}px`,
                  left: `${left}px`,
                  width: `${width}px`,
                }}
              >
                {options.map((option, index) => (
                  <li
                    className={
                      isAddSelectActionOption(option) && index === firstAddOptionIndex && firstAddOptionIndex > 0
                        ? "mt-1 border-t border-line/70 pt-2"
                        : ""
                    }
                    key={option.value}
                  >
                    <button
                      aria-selected={option.value === selectedValue}
                      aria-label={`Choose ${option.label}`}
                      className={`w-full overflow-hidden rounded-lg px-2 py-2 text-left text-sm ${isAddSelectActionOption(option) ? "font-medium text-accent" : ""} ${index === activeIndex ? "bg-foreground/10" : "hover:bg-foreground/5"}`}
                      onClick={() => commitValue(option.value)}
                      onMouseEnter={() => setActiveIndex(index)}
                      role="option"
                      title={option.label}
                      type="button"
                    >
                      {isAddSelectActionOption(option) ? (
                        <span className="inline-flex w-full min-w-0 items-center gap-2">
                          <CirclePlus aria-hidden className="size-4" />
                          <span className="truncate">{option.label}</span>
                        </span>
                      ) : (
                        <span className="block truncate">{option.label}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>,
              document.body,
            )
          : null}
      </div>
    </label>
  );
}
