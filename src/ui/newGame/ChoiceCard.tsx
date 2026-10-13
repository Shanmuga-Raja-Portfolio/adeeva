import type { ReactNode } from "react";
import { Icon } from "../kit/IconSet";

export interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  className?: string | undefined;
  children?: ReactNode;
}

export function ChoiceCard({ selected, onSelect, label, className, children }: ChoiceCardProps) {
  const classes = ["ad-choice", selected ? "ad-choice--selected" : "", className ?? ""]
    .filter((name) => name.length > 0)
    .join(" ");
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      className={classes}
      onClick={onSelect}
    >
      <span className="ad-choice__check" aria-hidden="true">
        <Icon name="check" size={16} />
      </span>
      {children}
    </button>
  );
}
