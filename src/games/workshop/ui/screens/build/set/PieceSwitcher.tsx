import { useRovingRadio } from "../../../../../../ui/kit/useRovingRadio";
import type { RunPiece } from "../../../../core";

export interface PieceSwitcherProps {
  readonly pieces: readonly RunPiece[];
  readonly value: number;
  readonly label: string;
  readonly onChange: (piece: number) => void;
}

export function PieceSwitcher({ pieces, value, label, onChange }: PieceSwitcherProps) {
  const roving = useRovingRadio(
    pieces.map((piece) => ({ value: String(piece.index) })),
    String(value),
    (next) => onChange(Number(next)),
  );
  if (pieces.length < 2) return null;
  return (
    <div className="ww-pieces" role="radiogroup" aria-label={label}>
      {pieces.map((piece, at) => (
        <button
          key={piece.index}
          ref={roving.buttonRef(at)}
          type="button"
          role="radio"
          aria-checked={piece.index === value}
          tabIndex={roving.tabIndex(at)}
          onKeyDown={(event) => roving.handleKey(event, at)}
          className="ww-pieces__chip"
          onClick={() => onChange(piece.index)}
          data-testid={`piece-${piece.index}`}
        >
          {piece.name}
        </button>
      ))}
    </div>
  );
}
