import type { ReactNode } from "react";
import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";
import "./choiceGrid.css";

interface Choice<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly content: ReactNode;
  readonly disabled?: boolean | undefined;
  readonly note?: string | undefined;
}

interface ChoiceGridProps<T extends string> {
  readonly label: string;
  readonly choices: readonly Choice<T>[];
  readonly value: T | null;
  readonly onChange: (value: T) => void;
  readonly className?: string | undefined;
}

export function ChoiceGrid<T extends string>({
  label,
  choices,
  value,
  onChange,
  className,
}: ChoiceGridProps<T>) {
  const roving = useRovingRadio(choices, value, onChange);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={className ? `jb-choices ${className}` : "jb-choices"}
    >
      {choices.map((choice, index) => {
        const checked = choice.value === value;
        return (
          <button
            key={choice.value}
            ref={roving.buttonRef(index)}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={choice.label}
            title={choice.note}
            tabIndex={roving.tabIndex(index)}
            disabled={choice.disabled === true}
            className="jb-choice"
            onClick={() => onChange(choice.value)}
            onKeyDown={(event) => roving.handleKey(event, index)}
          >
            {choice.content}
          </button>
        );
      })}
    </div>
  );
}
