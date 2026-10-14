import { darken, lighten, mixHex } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { MAX_SPOON_SPEED, STIR_CENTRE_SPEED } from "../../core";

export interface MixingBowlProps {
  readonly colour: string;
  readonly smooth: number;
  readonly spoon: number;
  readonly speed: number;
  readonly halfWidth: number;
  readonly centre?: number | undefined;
  readonly direction: 1 | -1;
  readonly splash: number;
  readonly title: string;
}

const CX = 200;
const CY = 200;
const GAUGE_R = 186;

function gaugeAngle(speed: number): number {
  return -60 + (120 * Math.min(MAX_SPOON_SPEED, Math.abs(speed))) / MAX_SPOON_SPEED;
}

function gaugePoint(angle: number, radius: number): [number, number] {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(radians), CY + radius * Math.sin(radians)];
}

function gaugeArc(from: number, to: number, radius: number): string {
  const [x1, y1] = gaugePoint(from, radius);
  const [x2, y2] = gaugePoint(to, radius);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${radius} ${radius} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export function MixingBowl({
  colour,
  smooth,
  spoon,
  speed,
  halfWidth,
  centre = STIR_CENTRE_SPEED,
  direction,
  splash,
  title,
}: MixingBowlProps) {
  const id = useSvgId("bowl");
  const streak = Math.max(0, 1 - smooth);
  const swirlTurn = (spoon * 180) / Math.PI;
  const spoonX = CX + 92 * Math.cos(spoon);
  const spoonY = CY + 92 * Math.sin(spoon);
  const inBand = Math.abs(Math.abs(speed) - centre) <= halfWidth;
  return (
    <svg viewBox="0 0 400 400" className="pa-bowl" role="img" aria-label={title}>
      <defs>
        <radialGradient id={`${id}-mix`} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor={lighten(colour, 0.3)} />
          <stop offset="1" stopColor={darken(colour, 0.08)} />
        </radialGradient>
        <radialGradient id={`${id}-rim`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.82" stopColor="#c7d3e6" />
          <stop offset="0.9" stopColor="#f4f7fb" />
          <stop offset="1" stopColor="#9fb0c8" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={170} fill={`url(#${id}-rim)`} />
      <circle cx={CX} cy={CY} r={148} fill={`url(#${id}-mix)`} />
      <g transform={`rotate(${swirlTurn * 0.6} ${CX} ${CY})`} opacity={streak} className="pa-bowl__streaks">
        <path
          d="M200 70 C290 90 320 190 250 250 C200 290 120 260 120 200"
          fill="none"
          stroke={mixHex(colour, "#ffffff", 0.55)}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d="M110 130 C140 90 210 110 220 160"
          fill="none"
          stroke={darken(colour, 0.3)}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d="M260 300 C220 330 150 320 130 280"
          fill="none"
          stroke={mixHex(colour, "#fff5d6", 0.6)}
          strokeWidth={12}
          strokeLinecap="round"
        />
        <circle cx={170} cy={230} r={14} fill={mixHex(colour, "#ffffff", 0.7)} />
        <circle cx={250} cy={160} r={10} fill={darken(colour, 0.25)} />
      </g>
      <ellipse
        cx={160}
        cy={140}
        rx={50}
        ry={18}
        fill="#ffffff"
        opacity={0.12 + 0.3 * smooth}
        transform="rotate(-25 160 140)"
      />
      <g
        transform={`translate(${spoonX} ${spoonY}) rotate(${(spoon * 180) / Math.PI + 90})`}
        className="pa-bowl__spoon"
      >
        <ellipse cx={0} cy={0} rx={18} ry={26} fill="#c99566" stroke="#8a5a3a" strokeWidth={2} />
        <rect
          x={-6}
          y={-150}
          width={12}
          height={130}
          rx={6}
          fill="#b98256"
          stroke="#8a5a3a"
          strokeWidth={2}
        />
      </g>
      <path
        d={gaugeArc(-60, 60, GAUGE_R)}
        stroke="#e8dccb"
        strokeWidth={14}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={gaugeArc(gaugeAngle(centre - halfWidth), gaugeAngle(centre + halfWidth), GAUGE_R)}
        stroke={inBand ? "#5fa046" : "#9ccb83"}
        strokeWidth={14}
        fill="none"
      />
      <circle
        cx={gaugePoint(gaugeAngle(speed), GAUGE_R)[0]}
        cy={gaugePoint(gaugeAngle(speed), GAUGE_R)[1]}
        r={11}
        fill={inBand ? "#3d7a2a" : "#d9573a"}
        stroke="#ffffff"
        strokeWidth={3}
      />
      <g transform={`translate(${CX} ${CY}) scale(${direction} 1)`} opacity={0.75}>
        <path
          d="M-40 -20 A45 45 0 0 1 40 -20"
          fill="none"
          stroke="#ffffff"
          strokeWidth={8}
          strokeLinecap="round"
        />
        <path d="M30 -38 L44 -16 L18 -12 Z" fill="#ffffff" />
      </g>
      {splash > 0 ? (
        <g opacity={splash} fill={colour}>
          <circle cx={350} cy={70} r={12} />
          <circle cx={372} cy={102} r={7} />
          <circle cx={40} cy={330} r={10} />
          <circle cx={64} cy={360} r={6} />
          <circle cx={330} cy={350} r={9} />
        </g>
      ) : null}
    </svg>
  );
}
