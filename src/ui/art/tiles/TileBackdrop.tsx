import { darken, lighten } from "../colourMix";
import { useSvgId } from "../useSvgId";

export const TILE_VIEWBOX = "0 0 240 160";

export interface TileArtProps {
  readonly className?: string | undefined;
}

export interface TileBackdropProps {
  readonly tint: string;
  readonly floor: string;
}

export function TileBackdrop({ tint, floor }: TileBackdropProps) {
  const id = useSvgId("tile");
  return (
    <>
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.32" r="0.85">
          <stop offset="0" stopColor={lighten(tint, 0.72)} />
          <stop offset="0.6" stopColor={lighten(tint, 0.38)} />
          <stop offset="1" stopColor={tint} />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lighten(floor, 0.2)} />
          <stop offset="1" stopColor={darken(floor, 0.12)} />
        </linearGradient>
      </defs>
      <rect width={240} height={160} fill={`url(#${id}-glow)`} />
      <path d="M0 122 Q120 112 240 122 L240 160 L0 160 Z" fill={`url(#${id}-floor)`} />
      <path d="M0 122 Q120 112 240 122" stroke={darken(floor, 0.18)} strokeOpacity={0.35} fill="none" />
      <g fill="#ffffff" opacity={0.55}>
        <circle cx={34} cy={30} r={1.6} />
        <circle cx={206} cy={22} r={1.2} />
        <circle cx={186} cy={52} r={1.8} />
        <circle cx={52} cy={64} r={1.1} />
      </g>
    </>
  );
}
