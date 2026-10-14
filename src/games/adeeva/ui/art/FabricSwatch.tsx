import type { Cloth } from "../../../../ui/art/cloth/Cloth";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface FabricSwatchProps {
  fabric: Cloth & { readonly name: string };
  size?: number | undefined;
  selected?: boolean | undefined;
  locked?: boolean | undefined;
  decorative?: boolean | undefined;
  className?: string | undefined;
}

function pinkedEdge(): string {
  const points: string[] = ["M10 8", "L100 8", "L104 12"];
  let step = 0;
  for (let y = 16; y <= 108; y += 4) {
    points.push(`L${step % 2 === 0 ? 100 : 104} ${y}`);
    step += 1;
  }
  step = 0;
  for (let x = 100; x >= 8; x -= 4) {
    points.push(`L${x} ${step % 2 === 0 ? 106 : 110}`);
    step += 1;
  }
  points.push("L6 104", "L6 12", "Q 6 8 10 8 Z");
  return points.join(" ");
}

const edge = pinkedEdge();

export function FabricSwatch({
  fabric,
  size = 96,
  selected = false,
  locked = false,
  decorative = false,
  className,
}: FabricSwatchProps) {
  const id = useSvgId("swatch");
  const look = fabricLook(fabric);
  const patternId = `${id}-fabric`;
  return (
    <svg
      className={className ? `ad-fabric-swatch ${className}` : "ad-fabric-swatch"}
      width={size}
      height={size}
      viewBox="0 0 116 120"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `${fabric.name} swatch`}
      aria-hidden={decorative ? true : undefined}
    >
      <defs>
        <FabricPattern id={patternId} fabric={fabric} tile={20} />
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#3c2432" floodOpacity="0.22" />
        </filter>
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="1" stopColor={look.light} stopOpacity={1} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={edge} />
        </clipPath>
      </defs>
      {selected ? (
        <path d={edge} fill="none" stroke="#d0587e" strokeWidth={7} strokeLinejoin="round" opacity={0.85} />
      ) : null}
      <g filter={`url(#${id}-shadow)`}>
        <path d={edge} fill={fabricFill(patternId)} />
      </g>
      <g clipPath={`url(#${id}-clip)`}>
        <path d={edge} fill={fabricSheenFill(patternId)} />
        <path
          d="M6 96 C 30 88 58 100 104 86 L104 112 L6 112 Z"
          fill="#000000"
          opacity={look.material === "velvet" ? 0.22 : 0.08}
        />
        <path d="M14 30 C 40 22 70 30 98 18" fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.12} />
      </g>
      <rect
        x={13}
        y={15}
        width={82}
        height={84}
        rx={4}
        fill="none"
        stroke={look.stitch}
        strokeWidth={1.1}
        strokeDasharray="3.5 3"
        opacity={0.55}
      />
      <path d="M80 8 L100 8 Q 104 8 104 12 L104 28 Z" fill="#fbf6ef" />
      <path d="M80 8 L104 28 L84 28 Q 80 28 80 24 Z" fill={`url(#${id}-fold)`} />
      <path d="M80 8 L104 28" stroke="#3c2432" strokeOpacity={0.18} strokeWidth={1} />
      {locked ? (
        <g>
          <path d={edge} fill="#fbf6ef" opacity={0.55} />
          <circle cx={55} cy={58} r={16} fill="#fffdf9" stroke="#2b2230" strokeOpacity={0.2} />
          <rect x={47} y={56} width={16} height={12} rx={2.5} fill="#5b4f60" />
          <path d="M50.5 56 V52.5 a4.5 4.5 0 0 1 9 0 V56" fill="none" stroke="#5b4f60" strokeWidth={2.2} />
        </g>
      ) : null}
    </svg>
  );
}
