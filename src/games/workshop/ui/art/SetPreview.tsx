import { PiecePreview } from "./PiecePreview";
import type { PieceLook } from "./pieceLook";

export interface SetPreviewProps {
  readonly looks: readonly PieceLook[];
  readonly title: string;
  readonly className?: string | undefined;
  readonly threeQuarter?: boolean | undefined;
}

export function SetPreview({ looks, title, className, threeQuarter = false }: SetPreviewProps) {
  return (
    <div
      className={["ww-set-preview", className ?? ""].filter((name) => name.length > 0).join(" ")}
      role="img"
      aria-label={title}
      style={{ gridTemplateColumns: `repeat(${Math.max(1, looks.length)}, minmax(0, 1fr))` }}
    >
      {looks.map((look, index) => (
        <PiecePreview
          key={`${look.productId}-${index}`}
          look={look}
          title={null}
          threeQuarter={threeQuarter}
        />
      ))}
    </div>
  );
}
