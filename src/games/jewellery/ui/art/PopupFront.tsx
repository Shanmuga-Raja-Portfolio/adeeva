import type { ReactNode } from "react";
import { useSvgId } from "../../../../ui/art/useSvgId";

interface PopupFrontProps {
  readonly lineName: string;
  readonly lantern: string;
  readonly children?: ReactNode;
}

export function PopupFront({ lineName, lantern, children }: PopupFrontProps) {
  const id = useSvgId("jb-popup");
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b2a4f" />
          <stop offset="1" stopColor="#2f1832" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3dc" />
          <stop offset="1" stopColor="#f3d9b0" />
        </linearGradient>
      </defs>
      <rect width={1200} height={520} fill={`url(#${id}-wall)`} />
      <path d="M60 0 L60 520 M1140 0 L1140 520" stroke="#2a1c30" strokeWidth={30} />
      <rect x={130} y={36} width={940} height={64} rx={10} fill="#1f4e5a" stroke="#e8c27a" strokeWidth={4} />
      <text
        x={600}
        y={80}
        textAnchor="middle"
        fill="#ffe2a6"
        fontSize={34}
        fontFamily="Georgia, serif"
        fontWeight={700}
      >
        {lineName}
      </text>
      <path
        d={`M110 110 ${Array.from({ length: 12 }, (_, index) => `L${150 + index * 80} 110 Q${190 + index * 80} 150 ${230 + index * 80} 110`).join(" ")} L1090 110 L1090 100 L110 100 Z`}
        fill={lantern}
        opacity={0.9}
      />
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={index}
          d={`M${150 + index * 80} 110 Q${190 + index * 80} 150 ${230 + index * 80} 110`}
          fill="none"
          stroke="#2a1c30"
          strokeWidth={2}
          opacity={0.4}
        />
      ))}
      <rect
        x={150}
        y={150}
        width={900}
        height={300}
        rx={12}
        fill={`url(#${id}-glass)`}
        stroke="#7a5236"
        strokeWidth={12}
      />
      <path d="M170 170 L330 170 L250 430 L170 430 Z" fill="#ffffff" opacity={0.25} />
      {children}
      <rect x={140} y={440} width={920} height={30} rx={6} fill="#7a5236" />
      <rect x={0} y={470} width={1200} height={50} fill="#3e2716" />
    </g>
  );
}
