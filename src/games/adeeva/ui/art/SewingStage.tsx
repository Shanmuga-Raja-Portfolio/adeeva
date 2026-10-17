import { SEAM_VIEW, SeamStrip, seamThread, type SeamStripProps } from "./SeamStrip";
import { MACHINE_SIDE, MachineArm, MachineBase, MachineDefs } from "./SewingMachineBody";
import { SewingNeedle } from "./SewingNeedle";
import { useSvgId } from "../../../../ui/art/useSvgId";

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
  const left = -MACHINE_SIDE;
  const full = width + MACHINE_SIDE * 2;
  const layer = { id, width, height, centreX, needleY };
  const thread = seamThread(strip.fabric, strip.threadColour);
  return (
    <svg className={className} viewBox={`${left} 0 ${full} ${height}`} role="img" aria-label={title}>
      <MachineDefs id={id} />
      <defs>
        <linearGradient id={`${id}-enamel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6f5ef" />
          <stop offset="0.6" stopColor="#b2dccd" />
          <stop offset="1" stopColor="#7fb7a4" />
        </linearGradient>
        <linearGradient id={`${id}-head-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1220" stopOpacity={0.3} />
          <stop offset="1" stopColor="#1c1220" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.6" r="0.75">
          <stop offset="0.62" stopColor="#1c1220" stopOpacity={0} />
          <stop offset="1" stopColor="#1c1220" stopOpacity={0.3} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <rect x={left} width={full} height={height} rx={18} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <MachineBase {...layer} threadColour={thread} />
        <SeamStrip {...strip} />
        <rect x={left} width={full} height={70} fill={`url(#${id}-head-shade)`} pointerEvents="none" />
        <MachineArm {...layer} running={running} />
        <SewingNeedle x={centreX} y={needleY} running={running} threadColour={thread} />
        <g pointerEvents="none">
          <path
            d={`M${centreX - 58} 0 L${centreX + 58} 0 L${centreX + 50} 38 C${centreX + 48} 46 ${centreX + 40} 50 ${centreX + 30} 50 L${centreX - 30} 50 C${centreX - 40} 50 ${centreX - 48} 46 ${centreX - 50} 38 Z`}
            fill={`url(#${id}-enamel)`}
            stroke="#5f9a87"
            strokeWidth={1.2}
          />
          <path
            d={`M${centreX - 44} 10 C${centreX - 26} 28 ${centreX + 26} 28 ${centreX + 44} 10`}
            fill="none"
            stroke="#c9a227"
            strokeWidth={1.6}
          />
          <circle cx={centreX} cy={24} r={3.4} fill="#c9a227" />
          <circle cx={centreX - 30} cy={18} r={2} fill="#c9a227" />
          <circle cx={centreX + 30} cy={18} r={2} fill="#c9a227" />
          <path
            d={`M${centreX - 22} 45 L${centreX + 22} 45`}
            stroke="#fff6dc"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.95}
          />
        </g>
        <rect x={left} width={full} height={height} fill={`url(#${id}-vignette)`} pointerEvents="none" />
      </g>
    </svg>
  );
}
