export interface ParlourTableProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly cloth: string;
  readonly clothShade: string;
  readonly teapot: string;
  readonly reserved?: boolean | undefined;
}

function TentCard() {
  return (
    <g transform="translate(8 12)">
      <ellipse cx={0} cy={2} rx={24} ry={4} fill="#3b2620" opacity={0.16} />
      <path d="M-20 0 L-15 -30 H15 L20 0 Z" fill="#f4e6cf" />
      <path d="M-19 0 L-14 -29 H14 L19 0 Z" fill="#fffaf0" stroke="#c9a227" strokeWidth={1.6} />
      <path
        d="M0 -8 C-8 -13 -7 -21 -3 -21 C-1.5 -21 0 -19.5 0 -18 C0 -19.5 1.5 -21 3 -21 C7 -21 8 -13 0 -8 Z"
        fill="#e07a9b"
      />
      <path d="M-9 -4 H9" stroke="#8c4a6a" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
    </g>
  );
}

function Chair({ side }: { readonly side: 1 | -1 }) {
  return (
    <g transform={`translate(${side * 128} 30) scale(${-side} 1)`}>
      <path
        d="M-6 -86 Q-30 -88 -30 -50 V40"
        fill="none"
        stroke="#7a4f33"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path d="M-26 -60 Q-16 -76 -6 -60" fill="none" stroke="#7a4f33" strokeWidth={4} />
      <path
        d="M-30 0 H22 L18 40 M-24 0 L-30 40"
        fill="none"
        stroke="#7a4f33"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <ellipse cx={-4} cy={-2} rx={30} ry={8} fill="#d58aa5" stroke="#a95377" strokeWidth={2} />
      <ellipse cx={-10} cy={-5} rx={12} ry={3} fill="#f3b6cb" opacity={0.7} />
    </g>
  );
}

export function ParlourTable({
  x,
  y,
  scale,
  cloth,
  clothShade,
  teapot,
  reserved = false,
}: ParlourTableProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={82} rx={150} ry={16} fill="#3b2620" opacity={0.18} />
      <Chair side={-1} />
      <Chair side={1} />
      <path d="M-104 0 Q-114 50 -96 78 H96 Q114 50 104 0 Z" fill={cloth} />
      <path d="M-30 4 Q-34 50 -26 78 H26 Q34 50 30 4 Z" fill="#ffffff" opacity={0.18} />
      <path d="M40 4 Q48 50 40 78 H96 Q114 50 104 0 Z" fill={clothShade} opacity={0.55} />
      <path
        d="M-96 78 Q-84 70 -72 78 Q-60 70 -48 78 Q-36 70 -24 78 Q-12 70 0 78 Q12 70 24 78 Q36 70 48 78 Q60 70 72 78 Q84 70 96 78"
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
        opacity={0.7}
      />
      <ellipse cx={0} cy={0} rx={106} ry={20} fill="#fffaf2" stroke="#e8dccb" strokeWidth={2} />
      <ellipse cx={-30} cy={-4} rx={44} ry={6} fill="#ffffff" opacity={0.7} />
      <g transform="translate(-30 -8)">
        <path d="M0 0 V-92" stroke="#c9a227" strokeWidth={3} />
        <ellipse cx={0} cy={2} rx={36} ry={6} fill="#3b2620" opacity={0.12} />
        <ellipse cx={0} cy={0} rx={34} ry={6} fill="#f1ebe0" stroke="#c9a227" strokeWidth={1.6} />
        <ellipse cx={0} cy={-40} rx={26} ry={5} fill="#f1ebe0" stroke="#c9a227" strokeWidth={1.6} />
        <ellipse cx={0} cy={-76} rx={18} ry={4} fill="#f1ebe0" stroke="#c9a227" strokeWidth={1.6} />
        {[-20, -7, 6, 19].map((dx, index) => (
          <g key={dx}>
            <rect
              x={dx - 5}
              y={-13}
              width={10}
              height={10}
              rx={2}
              fill={index % 2 === 0 ? "#f2c4c9" : "#b9a7dc"}
            />
            <rect x={dx - 5} y={-13} width={10} height={3} rx={1.5} fill="#ffffff" opacity={0.8} />
          </g>
        ))}
        {[-14, 0, 14].map((dx) => (
          <g key={dx}>
            <ellipse cx={dx} cy={-47} rx={6.5} ry={5} fill="#e9c27f" stroke="#a9772f" strokeWidth={0.8} />
            <ellipse cx={dx - 2} cy={-49} rx={2.4} ry={1.4} fill="#fff4d8" opacity={0.8} />
          </g>
        ))}
        {[-8, 8].map((dx) => (
          <g key={dx}>
            <circle cx={dx} cy={-83} r={6} fill="#b9a7dc" stroke="#8f78c2" strokeWidth={0.8} />
            <circle cx={dx - 2} cy={-85} r={2} fill="#ffffff" opacity={0.7} />
          </g>
        ))}
        <circle cx={0} cy={-96} r={4} fill="#c9a227" />
      </g>
      <g transform="translate(46 -12)">
        <ellipse cx={0} cy={10} rx={24} ry={4} fill="#3b2620" opacity={0.14} />
        <path
          d="M-18 8 Q-24 -16 0 -18 Q24 -16 18 8 Z"
          fill={teapot}
          stroke="#3b2620"
          strokeOpacity={0.25}
          strokeWidth={1.6}
        />
        <path
          d="M-12 -8 Q-14 -14 -6 -15"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.6}
        />
        <path d="M18 -6 Q34 -8 30 -22" fill="none" stroke={teapot} strokeWidth={3.4} strokeLinecap="round" />
        <path d="M-18 -4 Q-30 -2 -28 6" fill="none" stroke={teapot} strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={0} cy={-18} rx={8} ry={3} fill="#ffffff" opacity={0.6} />
        <circle cx={0} cy={-23} r={3} fill="#c9a227" />
        <path
          d="M30 -28 Q26 -40 32 -48 Q38 -56 32 -66"
          fill="none"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.55}
        />
      </g>
      {[-82, 84].map((dx) => (
        <g key={dx} transform={`translate(${dx} 4)`}>
          <ellipse cx={0} cy={0} rx={15} ry={4} fill="#ffffff" stroke="#e0d4c2" strokeWidth={1.2} />
          <path d="M-8 -2 Q-8 -14 0 -14 Q8 -14 8 -2 Z" fill="#ffffff" stroke="#e0d4c2" strokeWidth={1.2} />
          <path d="M-8 -9 H8" stroke="#f2c4c9" strokeWidth={2} />
        </g>
      ))}
      {reserved ? <TentCard /> : null}
    </g>
  );
}
