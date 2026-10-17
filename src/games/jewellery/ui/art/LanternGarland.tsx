import { useSvgId } from "../../../../ui/art/useSvgId";
import { PaperLantern } from "./PaperLantern";

export interface GarlandLight {
  readonly id: string;
  readonly label: string;
  readonly hex: string | null;
}

interface LanternGarlandProps {
  readonly lights: readonly GarlandLight[];
  readonly width: number;
  readonly sag: number;
  readonly size: number;
  readonly x?: number | undefined;
  readonly y?: number | undefined;
  readonly highlight?: string | null | undefined;
}

export function LanternGarland({
  lights,
  width,
  sag,
  size,
  x = 0,
  y = 0,
  highlight = null,
}: LanternGarlandProps) {
  const id = useSvgId("jb-garland");
  const count = lights.length;
  const spot = (index: number) => {
    const t = (index + 0.5) / count;
    return { x: t * width, y: Math.sin(Math.PI * t) * sag };
  };
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe6a8" stopOpacity={0.7} />
          <stop offset="1" stopColor="#ffe6a8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d={`M0 ${-size * 0.3} Q${width / 2} ${sag * 2 - size * 0.3} ${width} ${-size * 0.3}`}
        fill="none"
        stroke="#2a1c30"
        strokeWidth={Math.max(1.5, size * 0.05)}
      />
      {lights.map((light, index) => {
        const at = spot(index);
        return (
          <g key={light.id} className={light.id === highlight ? "jb-garland__new" : undefined}>
            <title>{light.label}</title>
            <PaperLantern x={at.x} y={at.y + size * 0.55} size={size} hex={light.hex} glowId={`${id}-glow`} />
          </g>
        );
      })}
    </g>
  );
}
