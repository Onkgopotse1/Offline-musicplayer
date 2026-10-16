import { useEffect, useId, useRef, useState } from "react";

export const MEDIA_SORT_OPTIONS = [
  { value: "date", label: "Date Modified" },
  { value: "az", label: "A-Z" },
  { value: "artist", label: "Artist" },
  { value: "album", label: "Album" },
  { value: "year", label: "Release Year" },
];

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, MEDIA_SORT_OPTIONS.findIndex(option => option.value === value)),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selectedIndex = Math.max(0, MEDIA_SORT_OPTIONS.findIndex(option => option.value === value));
  const selectedOption = MEDIA_SORT_OPTIONS[selectedIndex];

  useEffect(() => {
    if (!isOpen) return;

    listboxRef.current?.focus();
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isOpen]);

  const close = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const selectOption = (index: number) => {
    const option = MEDIA_SORT_OPTIONS[index];
    if (!option) return;
    onChange(option.value);
    close(true);
  };

  const handleListboxKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % MEDIA_SORT_OPTIONS.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(index => (index - 1 + MEDIA_SORT_OPTIONS.length) % MEDIA_SORT_OPTIONS.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(MEDIA_SORT_OPTIONS.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(activeIndex);
    } else if (event.key === "Escape" || event.key === "Tab") {
      close(event.key === "Escape");
    }
  };

  return (
    <div className="sort-dropdown" ref={rootRef}>
      <button
        aria-label={`Sort by: ${selectedOption.label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className="sort-dropdown-trigger"
        onClick={() => {
          setActiveIndex(selectedIndex);
          setIsOpen(open => !open);
        }}
        ref={triggerRef}
        type="button"
      >
        <span>{selectedOption.label}</span>
        <span className="sort-dropdown-chevron" aria-hidden="true" />
      </button>
      {isOpen && (
        <ul
          aria-activedescendant={`${listboxId}-option-${activeIndex}`}
          aria-label="Sort by"
          className="sort-dropdown-list"
          id={listboxId}
          onKeyDown={handleListboxKeyDown}
          ref={listboxRef}
          role="listbox"
          tabIndex={0}
        >
          {MEDIA_SORT_OPTIONS.map((option, index) => (
            <li
              aria-selected={option.value === value}
              className={`sort-dropdown-option${index === activeIndex ? " is-active" : ""}`}
              id={`${listboxId}-option-${index}`}
              key={option.value}
              onClick={() => selectOption(index)}
              onMouseMove={() => setActiveIndex(index)}
              role="option"
            >
              <span>{option.label}</span>
              {option.value === value && <span className="sort-dropdown-check" aria-hidden="true">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}