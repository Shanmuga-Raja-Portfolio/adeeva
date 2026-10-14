import { type KeyboardEvent, useRef } from "react";

interface RovingOption<T extends string> {
  readonly value: T;
  readonly disabled?: boolean | undefined;
}

interface RovingRadio {
  readonly buttonRef: (index: number) => (element: HTMLButtonElement | null) => void;
  readonly handleKey: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
  readonly tabIndex: (index: number) => 0 | -1;
}

export function useRovingRadio<T extends string>(
  options: readonly RovingOption<T>[],
  value: T | null,
  onChange: (value: T) => void,
): RovingRadio {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, step: number) => {
    const count = options.length;
    for (let offset = 1; offset <= count; offset += 1) {
      const index = (from + step * offset + count * count) % count;
      const option = options[index];
      if (option !== undefined && option.disabled !== true) {
        onChange(option.value);
        buttons.current[index]?.focus();
        return;
      }
    }
  };

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      move(index, 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      move(index, -1);
    }
  };

  const anyChecked = options.some((option) => option.value === value);

  return {
    buttonRef: (index) => (element) => {
      buttons.current[index] = element;
    },
    handleKey,
    tabIndex: (index) => (options[index]?.value === value || (!anyChecked && index === 0) ? 0 : -1),
  };
}
