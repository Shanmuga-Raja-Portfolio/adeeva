import { SEAM_VIEW, SeamStrip } from "./SeamStrip";
import type { SeamStripProps } from "./SeamStrip";
import { SewingNeedle } from "./SewingNeedle";
import { useSvgId } from "./useSvgId";

export interface SewingStageProps extends SeamStripProps {
  running?: boolean | undefined;
  title?: string | undefined;
  className?: string | undefined;
}

export function SewingStage({
  running = false,
  title = "Sewing machine needle over the fabric seam",
  className,
  ...strip
}: SewingStageProps) {
  const id = useSvgId("sewing");
  const { width, height, centreX, needleY } = SEAM_VIEW;
  const guides = [40, 56, 72, 88];
  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      <defs>
        <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9e7ee" />
          <stop offset="0.5" stopColor="#cfccd6" />
          <stop offset="1" stopColor="#b4b0bd" />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.6" r="0.75">
          <stop offset="0.6" stopColor="#1c1220" stopOpacity={0} />
          <stop offset="1" stopColor="#1c1220" stopOpacity={0.28} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <rect width={width} height={height} rx={18} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width={width} height={height} fill="#f3eadf" />
        <rect
          x={20}
          y={needleY - 70}
          width={width - 40}
          height={140}
          rx={14}
          fill={`url(#${id}-plate)`}
          stroke="#9a96a3"
          strokeWidth={1}
        />
        {[-18, -6, 6, 18].map((dx) => (
          <rect
            key={dx}
            x={centreX + dx - 2}
            y={needleY - 22}
            width={4}
            height={30}
            rx={2}
            fill="#6f6b78"
            opacity={0.7}
          />
        ))}
        <g stroke="#8d8a94" strokeWidth={1}>
          {guides.map((offset) => (
            <line
              key={offset}
              x1={centreX + offset}
              y1={needleY - 64}
              x2={centreX + offset}
              y2={needleY + 64}
            />
          ))}
        </g>
        <circle cx={44} cy={needleY - 50} r={4} fill="#9a96a3" stroke="#6f6b78" />
        <circle cx={width - 44} cy={needleY + 50} r={4} fill="#9a96a3" stroke="#6f6b78" />
        <SeamStrip {...strip} />
        <SewingNeedle x={centreX} y={needleY} running={running} threadColour={strip.threadColour} />
        <rect width={width} height={height} fill={`url(#${id}-vignette)`} pointerEvents="none" />
      </g>
    </svg>
  );
}
