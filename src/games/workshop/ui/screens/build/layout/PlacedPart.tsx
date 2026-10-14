import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";
import type { PartDef } from "../../../../content/product";
import { isAlongGrain, placementGrain, type PartPlacement } from "../../../../core";
import { footprint, type BoardSlot } from "./layoutGeometry";

interface PlacedPartProps {
  readonly part: PartDef;
  readonly placement: PartPlacement;
  readonly slot: BoardSlot;
  readonly selected: boolean;
  readonly lifted: boolean;
  readonly hasIssue: boolean;
  readonly onPointerDown: (event: PointerEvent<SVGGElement>) => void;
  readonly onKeyDown: (event: KeyboardEvent<SVGGElement>) => void;
  readonly onFocus: (event: FocusEvent<SVGGElement>) => void;
}

export function PlacedPart({
  part,
  placement,
  slot,
  selected,
  lifted,
  hasIssue,
  onPointerDown,
  onKeyDown,
  onFocus,
}: PlacedPartProps) {
  const size = footprint(part, placement.rotation);
  const along = isAlongGrain(placement.rotation);
  const x = slot.x + placement.x;
  const y = slot.y + placement.y;
  const reach = Math.min(6, (along ? size.width : size.height) / 3);
  const cx = x + size.width / 2;
  const cy = y + size.height / 2;
  const classes = [
    "ww-layout__part",
    selected ? "ww-layout__part--selected" : "",
    lifted ? "ww-layout__part--lifted" : "",
    hasIssue ? "ww-layout__part--issue" : "",
    along ? "" : "ww-layout__part--across",
  ]
    .filter((name) => name.length > 0)
    .join(" ");
  return (
    <g
      className={classes}
      data-part-id={part.id}
      tabIndex={0}
      role="button"
      aria-label={`${part.name}${along ? "" : ", turned across the wood lines"}. Arrow keys move it, R turns it, Delete puts it back.`}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    >
      <rect x={x - 1.5} y={y - 1.5} width={size.width + 3} height={size.height + 3} fill="transparent" />
      <rect x={x} y={y} width={size.width} height={size.height} rx={0.6} className="ww-layout__part-body" />
      <path
        d={
          along
            ? `M${cx - reach} ${cy} H${cx + reach} M${cx + reach - 1.6} ${cy - 1.2} L${cx + reach} ${cy} L${cx + reach - 1.6} ${cy + 1.2}`
            : `M${cx} ${cy - reach} V${cy + reach} M${cx - 1.2} ${cy + reach - 1.6} L${cx} ${cy + reach} L${cx + 1.2} ${cy + reach - 1.6}`
        }
        className="ww-layout__arrow"
      />
      {size.width >= 13 && size.height >= 6 ? (
        <text x={x + 1.2} y={y + 3.6} className="ww-layout__label">
          {part.name}
        </text>
      ) : null}
      <g
        transform={`translate(${x + size.width - 2.6} ${y + size.height - 2.6})`}
        className="ww-layout__badge"
      >
        <circle r={2} />
        <text y={0.8} textAnchor="middle">
          {along ? "✓" : "↻"}
        </text>
      </g>
      <title>{`${part.name}: wood lines ${Math.round(placementGrain(part, placement) * 100)}%`}</title>
    </g>
  );
}
