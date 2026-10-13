import { type KeyboardEvent, useRef } from "react";
import { Icon, type IconName } from "./IconSet";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string | undefined;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, step: number) => {
    const count = options.length;
    for (let offset = 1; offset <= count; offset += 1) {
      const index = (from + step * offset + count * count) % count;
      const option = options[index];
      if (option && !option.disabled) {
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

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={className ? `ad-segmented ${className}` : "ad-segmented"}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (!anyChecked && index === 0) ? 0 : -1}
            disabled={option.disabled === true}
            className="ad-segmented__option"
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKey(event, index)}
          >
            {option.icon ? <Icon name={option.icon} size={16} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
