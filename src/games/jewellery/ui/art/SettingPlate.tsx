import { mixHex } from "../../../../ui/art/colourMix";
import type { MetalLook } from "./metalLook";

interface SettingPlateProps {
  readonly id: string;
  readonly radius: number;
  readonly metal: MetalLook;
  readonly view: number;
  readonly target: number;
}

const MILGRAIN = 40;

export function SettingPlate({ id, radius, metal, view, target }: SettingPlateProps) {
  const plate = view * 0.8;
  const cup = radius * 1.22;
  const deep = mixHex(metal.dark, "#1c1220", 0.55);
  return (
    <g aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-plate`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor={metal.light} />
          <stop offset="0.42" stopColor={metal.mid} />
          <stop offset="0.8" stopColor={metal.dark} />
          <stop offset="1" stopColor={metal.mid} />
        </radialGradient>
        <radialGradient id={`${id}-cup`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={deep} />
          <stop offset="0.68" stopColor={metal.dark} />
          <stop offset="0.84" stopColor={metal.mid} />
          <stop offset="0.93" stopColor={metal.light} />
          <stop offset="1" stopColor={metal.line} />
        </radialGradient>
        <radialGradient id={`${id}-target`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd27a" stopOpacity={0.05} />
          <stop offset="0.75" stopColor="#ffd27a" stopOpacity={0.32} />
          <stop offset="1" stopColor="#ffd27a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-prong`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={metal.dark} />
          <stop offset="0.32" stopColor={metal.light} />
          <stop offset="0.62" stopColor={metal.mid} />
          <stop offset="1" stopColor={metal.dark} />
        </linearGradient>
      </defs>
      <circle cy={0.9} r={plate + 0.4} fill="#0c1a20" opacity={0.45} />
      <circle cx={0} cy={-plate - 1.2} r={1.8} fill="none" stroke={metal.line} strokeWidth={1.3} />
      <circle cx={0} cy={-plate - 1.2} r={1.8} fill="none" stroke={metal.mid} strokeWidth={0.8} />
      <circle r={plate} fill={`url(#${id}-plate)`} stroke={metal.line} strokeWidth={0.25} />
      <circle r={plate * 0.94} fill="none" stroke={metal.light} strokeOpacity={0.55} strokeWidth={0.3} />
      <g fill={metal.dark} opacity={0.5}>
        {Array.from({ length: MILGRAIN }, (_, index) => {
          const angle = (index / MILGRAIN) * Math.PI * 2;
          return (
            <circle
              key={index}
              cx={Math.cos(angle) * plate * 0.86}
              cy={Math.sin(angle) * plate * 0.86}
              r={0.2}
            />
          );
        })}
      </g>
      <path
        d={`M${-plate * 0.62} ${-plate * 0.5} A${plate * 0.8} ${plate * 0.8} 0 0 1 ${plate * 0.2} ${-plate * 0.8}`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.55}
        strokeWidth={0.45}
        strokeLinecap="round"
      />
      <circle cy={0.35} r={cup + 0.3} fill="#1c1220" opacity={0.35} />
      <circle r={cup} fill={`url(#${id}-cup)`} />
      <circle r={cup * 0.97} fill="none" stroke={metal.light} strokeOpacity={0.6} strokeWidth={0.18} />
      <circle r={target} fill={`url(#${id}-target)`} />
    </g>
  );
}
