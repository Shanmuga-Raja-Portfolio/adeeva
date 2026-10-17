import { useSvgId } from "../../../../ui/art/useSvgId";

interface ShowcaseHaloProps {
  readonly size: number;
  readonly glow: string;
}

export function ShowcaseHalo({ size, glow }: ShowcaseHaloProps) {
  const id = useSvgId("jb-halo");
  const r = size * 0.5;
  return (
    <g transform={`translate(0 ${-r})`} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-velvet`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#3d2a52" />
          <stop offset="0.75" stopColor="#24162f" />
          <stop offset="1" stopColor="#24162f" stopOpacity={0.9} />
        </radialGradient>
        <radialGradient id={`${id}-aura`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor={glow} stopOpacity={0.55} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * 1.25} fill={`url(#${id}-aura)`} />
      <circle r={r * 0.92} fill={`url(#${id}-velvet)`} stroke="#e8c27a" strokeWidth={4} />
      <circle
        r={r * 0.86}
        fill="none"
        stroke="#fff3c8"
        strokeOpacity={0.35}
        strokeWidth={1.5}
        strokeDasharray="2 6"
      />
    </g>
  );
}
