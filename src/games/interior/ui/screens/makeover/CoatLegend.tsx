import { BARE_WALL } from "../../art/roomHex";

interface CoatLegendProps {
  readonly colour: string;
}

function Swatch({ fill, streaky }: { fill: string; streaky: boolean }) {
  return (
    <svg viewBox="0 0 40 28" width={40} height={28} aria-hidden="true">
      <rect width={40} height={28} rx={6} fill={streaky ? BARE_WALL : fill} />
      {streaky
        ? [3, 13, 21, 31].map((x, index) => (
            <rect key={x} x={x} width={index % 2 === 0 ? 7 : 5} height={28} fill={fill} opacity={0.75} />
          ))
        : null}
      <rect
        width={40}
        height={28}
        rx={6}
        fill="none"
        stroke="#3b2a33"
        strokeOpacity={0.3}
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function CoatLegend({ colour }: CoatLegendProps) {
  return (
    <div className="is-coat-legend" aria-label="How the wall looks as you paint">
      <span className="is-coat-legend__title">Watch the wall</span>
      <ul>
        <li>
          <Swatch fill={BARE_WALL} streaky={false} />
          <span>
            <strong>Bare</strong> plaster
          </span>
        </li>
        <li>
          <Swatch fill={colour} streaky />
          <span>
            <strong>One coat</strong> looks streaky
          </span>
        </li>
        <li>
          <Swatch fill={colour} streaky={false} />
          <span>
            <strong>Two coats</strong> are smooth
          </span>
        </li>
      </ul>
    </div>
  );
}
