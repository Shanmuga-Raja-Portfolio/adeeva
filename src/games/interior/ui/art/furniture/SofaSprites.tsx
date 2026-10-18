import { darken, lighten, mixHex } from "../../../../../ui/art/colourMix";
import { Legs } from "./Legs";
import { INK, type Box } from "./spriteBox";

function Cushion({
  x,
  y,
  w,
  h,
  r,
  fill,
  line,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  fill: string;
  line: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={INK} strokeWidth={line} />
      <rect
        x={x + w * 0.08}
        y={y + h * 0.1}
        width={w * 0.84}
        height={h * 0.3}
        rx={r * 0.7}
        fill={lighten(fill, 0.26)}
        opacity={0.7}
      />
      <rect
        x={x + line}
        y={y + h * 0.72}
        width={w - line * 2}
        height={h * 0.2}
        rx={r * 0.5}
        fill={darken(fill, 0.18)}
        opacity={0.5}
      />
    </g>
  );
}

function Pillow({
  x,
  y,
  s,
  fill,
  tilt,
  line,
}: {
  x: number;
  y: number;
  s: number;
  fill: string;
  tilt: number;
  line: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <path
        d={`M${-s / 2} ${-s / 2} Q0 ${-s * 0.62} ${s / 2} ${-s / 2} Q${s * 0.6} 0 ${s / 2} ${s / 2} Q0 ${s * 0.6} ${-s / 2} ${s / 2} Q${-s * 0.62} 0 ${-s / 2} ${-s / 2} Z`}
        fill={fill}
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      <path
        d={`M${-s * 0.3} ${-s * 0.18} L${s * 0.3} ${-s * 0.18}`}
        stroke={lighten(fill, 0.4)}
        strokeWidth={s * 0.12}
        strokeLinecap="round"
        opacity={0.8}
      />
      <path
        d={`M${-s * 0.36} ${s * 0.14} L${s * 0.36} ${s * 0.14}`}
        stroke={darken(fill, 0.2)}
        strokeWidth={s * 0.08}
        strokeLinecap="round"
        opacity={0.6}
      />
    </g>
  );
}

export function Sofa({ w, u, soft, line }: Box) {
  const h = u * 1.05;
  const arm = u * 0.34;
  const seats = Math.max(2, Math.min(3, Math.round(w / (u * 0.95))));
  const inner = w - arm * 1.6;
  const seatW = inner / seats;
  const accent = mixHex(soft, "#f2b14a", 0.45);
  return (
    <g>
      <rect
        x={-w / 2 + arm * 0.5}
        y={-h}
        width={w - arm}
        height={h * 0.66}
        rx={u * 0.22}
        fill={darken(soft, 0.12)}
        stroke={INK}
        strokeWidth={line}
      />
      {Array.from({ length: seats }, (_, index) => (
        <Cushion
          key={`back${index}`}
          x={-inner / 2 + index * seatW + line}
          y={-h * 0.94}
          w={seatW - line * 2}
          h={h * 0.48}
          r={u * 0.14}
          fill={darken(soft, 0.04)}
          line={line * 0.7}
        />
      ))}
      <Pillow x={-inner / 2 + seatW * 0.42} y={-h * 0.6} s={u * 0.34} fill={accent} tilt={-12} line={line} />
      <Pillow
        x={inner / 2 - seatW * 0.42}
        y={-h * 0.6}
        s={u * 0.3}
        fill={lighten(soft, 0.45)}
        tilt={10}
        line={line}
      />
      {Array.from({ length: seats }, (_, index) => (
        <Cushion
          key={`seat${index}`}
          x={-inner / 2 + index * seatW}
          y={-h * 0.46}
          w={seatW}
          h={h * 0.26}
          r={u * 0.1}
          fill={lighten(soft, 0.12)}
          line={line * 0.8}
        />
      ))}
      <rect
        x={-w / 2 + arm * 0.6}
        y={-h * 0.22}
        width={w - arm * 1.2}
        height={h * 0.12}
        rx={u * 0.04}
        fill={darken(soft, 0.22)}
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      {[-1, 1].map((side) => (
        <g key={side}>
          <rect
            x={side < 0 ? -w / 2 : w / 2 - arm}
            y={-h * 0.62}
            width={arm}
            height={h * 0.52}
            rx={u * 0.15}
            fill={soft}
            stroke={INK}
            strokeWidth={line}
          />
          <rect
            x={(side < 0 ? -w / 2 : w / 2 - arm) + arm * 0.18}
            y={-h * 0.58}
            width={arm * 0.64}
            height={h * 0.1}
            rx={u * 0.05}
            fill={lighten(soft, 0.3)}
            opacity={0.8}
          />
          <rect
            x={(side < 0 ? -w / 2 : w / 2 - arm) + line}
            y={-h * 0.22}
            width={arm - line * 2}
            height={h * 0.1}
            rx={u * 0.04}
            fill={darken(soft, 0.2)}
            opacity={0.55}
          />
        </g>
      ))}
      <Legs w={w - arm * 0.6} h={h * 0.1} u={u} line={line} />
    </g>
  );
}

export function Armchair({ w, u, soft, line }: Box) {
  const width = Math.min(w * 0.78, u * 1.45);
  const h = u * 1.3;
  const arm = width * 0.24;
  const inner = width - arm * 1.5;
  const accent = mixHex(soft, "#f2b14a", 0.45);
  const back = `M${-inner / 2 - arm * 0.15} ${-h * 0.3} L${-inner / 2 - arm * 0.15} ${-h * 0.78} Q${-inner / 2} ${-h * 1.02} 0 ${-h} Q${inner / 2} ${-h * 1.02} ${inner / 2 + arm * 0.15} ${-h * 0.78} L${inner / 2 + arm * 0.15} ${-h * 0.3} Z`;
  return (
    <g>
      <path d={back} fill={darken(soft, 0.08)} stroke={INK} strokeWidth={line} />
      <path
        d={`M${-inner * 0.36} ${-h * 0.82} Q0 ${-h * 0.92} ${inner * 0.36} ${-h * 0.82}`}
        fill="none"
        stroke={lighten(soft, 0.3)}
        strokeWidth={u * 0.07}
        strokeLinecap="round"
        opacity={0.75}
      />
      {[-0.22, 0.22].map((share) => (
        <circle key={share} cx={share * inner} cy={-h * 0.66} r={u * 0.025} fill={darken(soft, 0.35)} />
      ))}
      <circle cx={0} cy={-h * 0.74} r={u * 0.025} fill={darken(soft, 0.35)} />
      <Pillow x={0} y={-h * 0.5} s={u * 0.36} fill={accent} tilt={-6} line={line} />
      <Cushion
        x={-inner / 2}
        y={-h * 0.4}
        w={inner}
        h={h * 0.2}
        r={u * 0.09}
        fill={lighten(soft, 0.12)}
        line={line * 0.8}
      />
      <rect
        x={-width / 2 + arm * 0.4}
        y={-h * 0.21}
        width={width - arm * 0.8}
        height={h * 0.11}
        rx={u * 0.04}
        fill={darken(soft, 0.22)}
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      {[-1, 1].map((side) => {
        const x = side < 0 ? -width / 2 : width / 2 - arm;
        return (
          <g key={side}>
            <path
              d={`M${x} ${-h * 0.12} L${x} ${-h * 0.46} Q${x} ${-h * 0.6} ${x + arm / 2} ${-h * 0.6} Q${x + arm} ${-h * 0.6} ${x + arm} ${-h * 0.46} L${x + arm} ${-h * 0.12} Z`}
              fill={soft}
              stroke={INK}
              strokeWidth={line}
            />
            <ellipse
              cx={x + arm / 2}
              cy={-h * 0.5}
              rx={arm * 0.3}
              ry={h * 0.05}
              fill={lighten(soft, 0.32)}
              opacity={0.85}
            />
            <path
              d={`M${x + arm * 0.5} ${-h * 0.42} L${x + arm * 0.5} ${-h * 0.16}`}
              stroke={darken(soft, 0.16)}
              strokeWidth={line}
              opacity={0.6}
            />
          </g>
        );
      })}
      <Legs w={width - arm * 0.4} h={h * 0.1} u={u} line={line} />
    </g>
  );
}
