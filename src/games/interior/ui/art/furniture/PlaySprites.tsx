import { darken, lighten } from "../../../../../ui/art/colourMix";
import { INK, type Box } from "./spriteBox";

export function ToyBox({ w, u, fill, line }: Box) {
  const h = u * 0.6;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={u * 0.08}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 - u * 0.04}
        y={-h - u * 0.1}
        width={w + u * 0.08}
        height={u * 0.16}
        rx={u * 0.06}
        fill={darken(fill, 0.12)}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M0 ${-h * 0.75} l${u * 0.06} ${u * 0.12} l${u * 0.13} ${u * 0.02} l${-u * 0.1} ${u * 0.09} l${u * 0.03} ${u * 0.13} l${-u * 0.12} ${-u * 0.07} l${-u * 0.12} ${u * 0.07} l${u * 0.03} ${-u * 0.13} l${-u * 0.1} ${-u * 0.09} l${u * 0.13} ${-u * 0.02} Z`}
        fill="#f6d77a"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <circle
        cx={-w * 0.32}
        cy={-h - u * 0.2}
        r={u * 0.1}
        fill="#9fd0ee"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
    </g>
  );
}

export function PlayTent({ w, u, fill, soft, line }: Box) {
  const h = u * 1.5;
  return (
    <g>
      <path
        d={`M${-w / 2} 0 L0 ${-h} L${w / 2} 0 Z`}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
        strokeLinejoin="round"
      />
      <path
        d={`M${-w * 0.2} 0 L0 ${-h * 0.6} L${w * 0.2} 0 Z`}
        fill={darken(soft, 0.3)}
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      <path
        d={`M${-w * 0.36} ${-h * 0.25} L${-w * 0.08} ${-h * 0.78}`}
        stroke={lighten(soft, 0.45)}
        strokeWidth={line * 1.6}
        strokeLinecap="round"
      />
      <path d={`M0 ${-h} l0 ${-u * 0.36}`} stroke={INK} strokeWidth={line} />
      <path
        d={`M0 ${-h - u * 0.36} l${u * 0.28} ${u * 0.09} l${-u * 0.28} ${u * 0.09} Z`}
        fill={fill}
        stroke={INK}
        strokeWidth={line * 0.6}
      />
      {[-0.22, 0, 0.22].map((share) => (
        <circle key={share} cx={share * w} cy={-h * 0.2} r={u * 0.035} fill="#f6d77a" />
      ))}
    </g>
  );
}

export function PlantStand({ w, u, fill, line }: Box) {
  const h = u * 1.3;
  const width = Math.min(w, u * 0.7);
  const leaf = darken(fill, 0.3);
  return (
    <g>
      <path
        d={`M${-width * 0.3} 0 L${-width * 0.18} ${-h} M${width * 0.3} 0 L${width * 0.18} ${-h}`}
        stroke={darken("#c8914f", 0.25)}
        strokeWidth={line * 1.6}
        strokeLinecap="round"
      />
      <rect
        x={-width * 0.32}
        y={-h - u * 0.05}
        width={width * 0.64}
        height={u * 0.08}
        rx={u * 0.03}
        fill="#c8914f"
        stroke={INK}
        strokeWidth={line * 0.7}
      />
      <path
        d={`M${-width * 0.24} ${-h - u * 0.05} L${-width * 0.18} ${-h - u * 0.34} L${width * 0.18} ${-h - u * 0.34} L${width * 0.24} ${-h - u * 0.05} Z`}
        fill="#c8664a"
        stroke={INK}
        strokeWidth={line * 0.7}
      />
      <g fill={fill} stroke={leaf} strokeWidth={line * 0.6}>
        <path
          d={`M0 ${-h - u * 0.34} C${-u * 0.42} ${-h - u * 0.5} ${-u * 0.46} ${-h - u * 0.82} ${-u * 0.36} ${-h - u * 0.96} C${-u * 0.2} ${-h - u * 0.7} ${-u * 0.08} ${-h - u * 0.5} 0 ${-h - u * 0.34} Z`}
        />
        <path
          d={`M0 ${-h - u * 0.34} C${u * 0.4} ${-h - u * 0.48} ${u * 0.48} ${-h - u * 0.8} ${u * 0.4} ${-h - u * 0.96} C${u * 0.22} ${-h - u * 0.72} ${u * 0.08} ${-h - u * 0.5} 0 ${-h - u * 0.34} Z`}
        />
        <path
          d={`M0 ${-h - u * 0.34} C${-u * 0.08} ${-h - u * 0.7} ${-u * 0.02} ${-h - u * 1} ${u * 0.08} ${-h - u * 1.14} C${u * 0.16} ${-h - u * 0.9} ${u * 0.1} ${-h - u * 0.6} 0 ${-h - u * 0.34} Z`}
        />
      </g>
    </g>
  );
}

export function UprightPiano({ w, u, fill, line }: Box) {
  const h = u * 1.7;
  const keys = Math.max(10, Math.round(w / (u * 0.12)));
  const keyWidth = (w - u * 0.12) / keys;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h * 0.95}
        rx={u * 0.08}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 - u * 0.06}
        y={-h - u * 0.06}
        width={w + u * 0.12}
        height={u * 0.14}
        rx={u * 0.04}
        fill={darken(fill, 0.15)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + u * 0.14}
        y={-h + u * 0.18}
        width={w - u * 0.28}
        height={h * 0.34}
        rx={u * 0.05}
        fill={lighten(fill, 0.12)}
        stroke={darken(fill, 0.3)}
        strokeWidth={line * 0.6}
      />
      <rect
        x={-w / 2 + u * 0.06}
        y={-h * 0.5}
        width={w - u * 0.12}
        height={u * 0.2}
        fill="#fffaf2"
        stroke={INK}
        strokeWidth={line * 0.7}
      />
      {Array.from({ length: keys }, (_, index) =>
        index % 7 === 2 || index % 7 === 6 ? null : (
          <rect
            key={index}
            x={-w / 2 + u * 0.06 + (index + 0.65) * keyWidth}
            y={-h * 0.5}
            width={keyWidth * 0.6}
            height={u * 0.12}
            fill={INK}
          />
        ),
      )}
      <path
        d={`M${-w * 0.2} ${-h + u * 0.3} q${u * 0.1} ${-u * 0.12} ${u * 0.2} 0 M${w * 0.1} ${-h + u * 0.36} l0 ${-u * 0.14} l${u * 0.12} ${-u * 0.04} l0 ${u * 0.14}`}
        fill="none"
        stroke="#fff4c2"
        strokeWidth={line * 0.8}
        strokeLinecap="round"
      />
      <path
        d={`M${-w / 2 + u * 0.12} ${-h * 0.05} l0 ${h * 0.05} M${w / 2 - u * 0.12} ${-h * 0.05} l0 ${h * 0.05}`}
        stroke={INK}
        strokeWidth={line * 1.6}
      />
    </g>
  );
}
