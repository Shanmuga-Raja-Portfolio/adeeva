import type { PartOptionId } from "../../content/partOption";

export interface ShapeKit {
  readonly frame: string;
  readonly surface: string;
  readonly edge: PartOptionId | undefined;
  readonly legs: PartOptionId | undefined;
  readonly accent: PartOptionId | undefined;
  readonly highlight: string | null;
}

export const OUTLINE = "#2f2622";
const GLOW = "#f2c230";
export const HOLE = "#3b2a20";

export function stroke(kit: ShapeKit, partIds: readonly string[]) {
  const lit = kit.highlight !== null && partIds.includes(kit.highlight);
  return {
    stroke: lit ? GLOW : OUTLINE,
    strokeWidth: lit ? 5 : 2.5,
    strokeLinejoin: "round" as const,
    className: lit ? "ww-piece__lit" : undefined,
  };
}

export function panelPath(
  x: number,
  y: number,
  w: number,
  h: number,
  edge: PartOptionId | undefined,
): string {
  if (edge === "rounded-edge") {
    const r = Math.min(12, w / 4, h / 4);
    return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  }
  if (edge === "arched-edge") {
    const rise = Math.min(14, h * 0.3);
    return `M${x} ${y + rise} Q${x + w / 2} ${y - rise} ${x + w} ${y + rise} V${y + h} H${x} Z`;
  }
  if (edge === "clipped-corners") {
    const c = Math.min(10, w / 5, h / 4);
    return `M${x + c} ${y} H${x + w - c} L${x + w} ${y + c} V${y + h - c} L${x + w - c} ${y + h} H${x + c} L${x} ${y + h - c} V${y + c} Z`;
  }
  if (edge === "scallop-edge") {
    const bumps = 5;
    const step = w / bumps;
    const rise = Math.min(8, h * 0.4);
    const top = Array.from(
      { length: bumps },
      (_, index) => `Q${x + step * index + step / 2} ${y - rise} ${x + step * (index + 1)} ${y + rise / 3}`,
    ).join(" ");
    return `M${x} ${y + rise / 3} ${top} V${y + h} H${x} Z`;
  }
  return `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
}

function heartPath(cx: number, cy: number, size: number): string {
  return `M${cx} ${cy + size} C${cx - size * 1.4} ${cy + size * 0.1} ${cx - size * 1.1} ${cy - size} ${cx} ${cy - size * 0.35} C${cx + size * 1.1} ${cy - size} ${cx + size * 1.4} ${cy + size * 0.1} ${cx} ${cy + size} Z`;
}

function moonPath(cx: number, cy: number, size: number): string {
  return `M${cx + size * 0.3} ${cy - size} A${size} ${size} 0 1 0 ${cx + size * 0.3} ${cy + size} A${size * 0.78} ${size * 0.78} 0 1 1 ${cx + size * 0.3} ${cy - size} Z`;
}

function starPath(cx: number, cy: number, r: number): string {
  const points = Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? r : r * 0.45;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return `${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`;
  });
  return `M${points.join(" L")} Z`;
}

export function Accent({ kit, cx, cy, size }: { kit: ShapeKit; cx: number; cy: number; size: number }) {
  if (kit.accent === "star-cutout")
    return <path d={starPath(cx, cy, size)} fill={HOLE} stroke={OUTLINE} strokeWidth={1.5} />;
  if (kit.accent === "leaf-cutout")
    return (
      <g fill={HOLE} stroke={OUTLINE} strokeWidth={1.5}>
        <path
          d={`M${cx - size} ${cy} Q${cx} ${cy - size} ${cx + size} ${cy} Q${cx} ${cy + size} ${cx - size} ${cy} Z`}
        />
        <path d={`M${cx - size * 0.8} ${cy} L${cx + size * 0.8} ${cy}`} stroke="#6b4d3a" strokeWidth={1} />
      </g>
    );
  if (kit.accent === "heart-cutout")
    return <path d={heartPath(cx, cy, size)} fill={HOLE} stroke={OUTLINE} strokeWidth={1.5} />;
  if (kit.accent === "moon-cutout")
    return <path d={moonPath(cx, cy, size)} fill={HOLE} stroke={OUTLINE} strokeWidth={1.5} />;
  if (kit.accent === "slats")
    return (
      <g stroke={HOLE} strokeWidth={3} strokeLinecap="round">
        {[-1, 0, 1].map((step) => (
          <line
            key={step}
            x1={cx + step * size * 0.8}
            y1={cy - size}
            x2={cx + step * size * 0.8}
            y2={cy + size}
          />
        ))}
      </g>
    );
  return null;
}

export function Leg({
  kit,
  id,
  x,
  top,
  bottom,
  width,
  side,
}: {
  kit: ShapeKit;
  id: string;
  x: number;
  top: number;
  bottom: number;
  width: number;
  side: -1 | 1;
}) {
  const props = stroke(kit, [id]);
  if (kit.legs === "tapered-legs") {
    const narrow = width * 0.28;
    const d = `M${x} ${top} H${x + width} L${x + width - narrow} ${bottom} H${x + narrow} Z`;
    return <path d={d} fill={kit.frame} {...props} />;
  }
  if (kit.legs === "splayed-legs") {
    const lean = side * (bottom - top) * 0.14;
    const d = `M${x} ${top} H${x + width} L${x + width + lean} ${bottom} H${x + lean} Z`;
    return <path d={d} fill={kit.frame} {...props} />;
  }
  if (kit.legs === "block-legs") {
    const notch = Math.min(width * 0.45, 7);
    const outer = side < 0 ? x : x + width;
    const inner = side < 0 ? x + notch : x + width - notch;
    const d =
      side < 0
        ? `M${x} ${top} H${x + width} V${bottom} H${inner} V${bottom - notch} H${outer} Z`
        : `M${x} ${top} H${x + width} V${bottom - notch} H${inner} V${bottom} H${x} Z`;
    return <path d={d} fill={kit.frame} {...props} />;
  }
  if (kit.legs === "sled-legs") {
    const reach = width * 1.4;
    const foot = Math.min(10, (bottom - top) * 0.12);
    const d = `M${x} ${top} H${x + width} V${bottom - foot} Q${x + width + reach} ${bottom - foot} ${x + width + reach * 0.6} ${bottom} H${x - reach * 0.6} Q${x - reach} ${bottom - foot} ${x} ${bottom - foot} Z`;
    return <path d={d} fill={kit.frame} {...props} />;
  }
  return <rect x={x} y={top} width={width} height={bottom - top} fill={kit.frame} {...props} />;
}
