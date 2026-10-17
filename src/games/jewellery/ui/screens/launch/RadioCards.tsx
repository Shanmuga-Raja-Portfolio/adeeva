import type { ReactNode } from "react";
import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";

export interface RadioCard<T extends string> {
  readonly value: T;
  readonly title: ReactNode;
  readonly sub?: ReactNode;
  readonly swatch?: string | undefined;
  readonly testId: string;
}

export interface RadioCardsProps<T extends string> {
  readonly label: string;
  readonly cards: readonly RadioCard<T>[];
  readonly value: T | null;
  readonly onChange: (value: T) => void;
  readonly wide?: boolean | undefined;
}

export function RadioCards<T extends string>({
  label,
  cards,
  value,
  onChange,
  wide = false,
}: RadioCardsProps<T>) {
  const roving = useRovingRadio(
    cards.map((card) => ({ value: card.value })),
    value,
    onChange,
  );
  return (
    <div
      className={wide ? "jb-radio-cards jb-radio-cards--wide" : "jb-radio-cards"}
      role="radiogroup"
      aria-label={label}
    >
      {cards.map((card, index) => (
        <button
          key={card.value}
          ref={roving.buttonRef(index)}
          type="button"
          role="radio"
          aria-checked={value === card.value}
          tabIndex={roving.tabIndex(index)}
          onKeyDown={(event) => roving.handleKey(event, index)}
          className="jb-radio-card"
          onClick={() => onChange(card.value)}
          data-testid={card.testId}
        >
          {card.swatch !== undefined ? (
            <span className="jb-radio-card__swatch" style={{ background: card.swatch }} />
          ) : null}
          <strong>{card.title}</strong>
          {card.sub !== undefined ? <span className="jb-muted">{card.sub}</span> : null}
        </button>
      ))}
    </div>
  );
}
