import { Pincushion, Spool } from "./SewingNotions";

export const MACHINE_SIDE = 150;

export interface MachineLayerProps {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly centreX: number;
  readonly needleY: number;
}

export interface MachineArmProps extends MachineLayerProps {
  readonly running: boolean;
}

export interface MachineBaseProps extends MachineLayerProps {
  readonly threadColour: string;
}

const PILLAR_X = 330;
const ARM_BOTTOM = 42;

export function MachineDefs({ id }: { readonly id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e2c09a" />
        <stop offset="1" stopColor="#bf9268" />
      </linearGradient>
      <linearGradient id={`${id}-bed`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d8efe6" />
        <stop offset="0.25" stopColor="#b5ddd0" />
        <stop offset="1" stopColor="#86c0ad" />
      </linearGradient>
      <linearGradient id={`${id}-enamel-side`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#e3f4ee" />
        <stop offset="0.35" stopColor="#b2dccd" />
        <stop offset="1" stopColor="#6fa995" />
      </linearGradient>
      <linearGradient id={`${id}-arm`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9fd0bf" />
        <stop offset="0.55" stopColor="#c9eadf" />
        <stop offset="1" stopColor="#7fb7a4" />
      </linearGradient>
      <linearGradient id={`${id}-chrome`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.45" stopColor="#d4d2da" />
        <stop offset="1" stopColor="#8e8a98" />
      </linearGradient>
      <radialGradient id={`${id}-wheel`} cx="0.4" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#f6d7e1" />
        <stop offset="0.7" stopColor="#d0587e" />
        <stop offset="1" stopColor="#8f2f52" />
      </radialGradient>
      <radialGradient id={`${id}-gloss`} cx="0.3" cy="0.1" r="0.6">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.7} />
        <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
      </radialGradient>
      <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff6d8" stopOpacity={0.55} />
        <stop offset="1" stopColor="#fff6d8" stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export function MachineBase({ id, width, height, centreX, needleY, threadColour }: MachineBaseProps) {
  const left = -MACHINE_SIDE;
  const full = width + MACHINE_SIDE * 2;
  return (
    <g className="ad-machine-base">
      <rect x={left} y={0} width={full} height={height} fill={`url(#${id}-wood)`} />
      {[36, 88, 150, 232, 300, 362].map((y, index) => (
        <path
          key={y}
          d={`M${left} ${y} C${left + 140} ${y + (index % 2 === 0 ? 8 : -6)} ${left + 360} ${y - 6} ${left + full} ${y + 4}`}
          stroke="#8a5f3e"
          strokeWidth={1}
          fill="none"
          opacity={0.18}
        />
      ))}
      <rect x={left + 26} y={104} width={full - 40} height={height} rx={34} fill="#1c1220" opacity={0.16} />
      <rect
        x={left + 20}
        y={94}
        width={full - 40}
        height={height}
        rx={34}
        fill={`url(#${id}-bed)`}
        stroke="#5f9a87"
        strokeWidth={1.4}
      />
      <rect x={left + 20} y={94} width={full - 40} height={height} rx={34} fill={`url(#${id}-gloss)`} />
      <rect
        x={left + 27}
        y={101}
        width={full - 54}
        height={height}
        rx={28}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.35}
        strokeWidth={1.2}
      />
      <path
        d={`M${left + 52} 98 L${left + full - 52} 98`}
        stroke="#ffffff"
        strokeOpacity={0.8}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <g fill="none" stroke="#c9a227" strokeWidth={1.6} opacity={0.85}>
        <path d="M-118 140 C-96 124 -70 128 -62 146 C-56 160 -74 170 -84 160 C-92 150 -80 140 -72 148" />
        <path d="M-118 140 C-104 168 -96 196 -110 226" />
        <path d="M-112 236 C-96 250 -76 250 -66 238" />
      </g>
      <Spool x={-58} y={180} colour={threadColour} />
      <path
        d={`M-58 175 C-50 120 ${centreX - 120} 70 ${centreX - 46} 40`}
        stroke={threadColour}
        strokeWidth={1.3}
        fill="none"
        opacity={0.75}
      />
      <Pincushion x={-80} y={322} />
      <rect
        x={20}
        y={needleY - 70}
        width={width - 40}
        height={140}
        rx={14}
        fill={`url(#${id}-chrome)`}
        stroke="#8e8a98"
        strokeWidth={1}
      />
      <rect
        x={centreX + 60}
        y={needleY + 28}
        width={56}
        height={34}
        rx={8}
        fill="#e6e4ec"
        stroke="#9a96a3"
        strokeWidth={0.8}
      />
      <circle cx={centreX + 106} cy={needleY + 45} r={3} fill="#9a96a3" />
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
        {[40, 56, 72, 88].map((offset) => (
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
    </g>
  );
}

export function MachineArm({ id, width, height, centreX, running }: MachineArmProps) {
  const right = width + MACHINE_SIDE;
  const wheelY = 104;
  return (
    <g className="ad-machine-arm" pointerEvents="none">
      <path
        d={`M${centreX - 40} ${ARM_BOTTOM + 10} L${PILLAR_X + 10} ${ARM_BOTTOM + 10} L${PILLAR_X + 10} 310 L${right} 316 L${right} 0 Z`}
        fill="#1c1220"
        opacity={0.12}
      />
      <path
        d={`M${centreX} 0 L${right} 0 L${right} 300 C${right - 30} 314 ${PILLAR_X + 10} 314 ${PILLAR_X - 6} 300 L${PILLAR_X - 6} ${ARM_BOTTOM + 26} C${PILLAR_X - 6} ${ARM_BOTTOM + 8} ${PILLAR_X - 20} ${ARM_BOTTOM} ${PILLAR_X - 40} ${ARM_BOTTOM} L${centreX} ${ARM_BOTTOM} Z`}
        fill={`url(#${id}-enamel-side)`}
        stroke="#5f9a87"
        strokeWidth={1.4}
      />
      <rect x={centreX} y={0} width={PILLAR_X - centreX} height={ARM_BOTTOM} fill={`url(#${id}-arm)`} />
      <path
        d={`M${centreX} 14 L${PILLAR_X + 8} 14 C${PILLAR_X + 30} 14 ${PILLAR_X + 34} 30 ${PILLAR_X + 34} 50 L${PILLAR_X + 34} 280`}
        fill="none"
        stroke="#c9a227"
        strokeWidth={2}
      />
      <path
        d={`M${centreX} 20 L${PILLAR_X + 4} 20 C${PILLAR_X + 24} 20 ${PILLAR_X + 28} 34 ${PILLAR_X + 28} 52 L${PILLAR_X + 28} 280`}
        fill="none"
        stroke="#c9a227"
        strokeWidth={0.8}
        opacity={0.8}
      />
      <path
        d={`M${centreX + 20} 6 L${PILLAR_X - 10} 6`}
        stroke="#ffffff"
        strokeOpacity={0.6}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <g transform={`translate(${(centreX + PILLAR_X) / 2 + 20} 28)`}>
        <ellipse rx={30} ry={9} fill="#c9a227" />
        <ellipse rx={27} ry={7} fill="#fff1c2" />
        <path d="M-18 0 C-10 -6 -4 6 4 0 C10 -5 14 3 18 0" stroke="#a37d12" strokeWidth={1.4} fill="none" />
      </g>
      <path
        d={`M${PILLAR_X + 2} 70 L${PILLAR_X + 2} 290`}
        stroke="#ffffff"
        strokeOpacity={0.55}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <g transform={`translate(${PILLAR_X + 70} 190)`}>
        <circle r={22} fill={`url(#${id}-chrome)`} stroke="#6f6b78" strokeWidth={1} />
        <circle r={16} fill="#fffaf2" />
        {[-60, -30, 0, 30, 60].map((angle) => (
          <path
            key={angle}
            d="M0 -15 L0 -11"
            transform={`rotate(${angle})`}
            stroke="#5a5664"
            strokeWidth={1.4}
          />
        ))}
        <path d="M0 0 L7 -9" stroke="#d0587e" strokeWidth={2.4} strokeLinecap="round" />
        <circle r={2.6} fill="#5a5664" />
      </g>
      <g transform={`translate(${right - 4} ${wheelY})`}>
        <circle r={50} fill="#1c1220" opacity={0.14} transform="translate(-6 6)" />
        <circle r={48} fill={`url(#${id}-wheel)`} stroke="#8f2f52" strokeWidth={1.4} />
        <circle r={36} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2} />
        <g
          className={
            running ? "ad-machine-arm__wheel ad-machine-arm__wheel--running" : "ad-machine-arm__wheel"
          }
        >
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <path
              key={angle}
              d="M0 -10 L0 -34"
              transform={`rotate(${angle})`}
              stroke="#fbe3eb"
              strokeWidth={5}
              strokeLinecap="round"
            />
          ))}
        </g>
        <circle r={10} fill={`url(#${id}-chrome)`} stroke="#6f6b78" strokeWidth={1} />
      </g>
      <polygon
        points={`${centreX - 26},${ARM_BOTTOM + 8} ${centreX + 26},${ARM_BOTTOM + 8} ${centreX + 96},${height - 70} ${centreX - 96},${height - 70}`}
        fill={`url(#${id}-beam)`}
        opacity={0.55}
      />
    </g>
  );
}
