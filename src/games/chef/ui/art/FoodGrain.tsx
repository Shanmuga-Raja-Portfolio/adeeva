import { channels } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface FoodGrainProps {
  readonly d: string;
  readonly seed: number;
  readonly frequency?: number | undefined;
  readonly dark?: string | undefined;
  readonly light?: string | undefined;
  readonly strength?: number | undefined;
}

function tint(hex: string, gain: number, cut: number): string {
  const [r, g, b] = channels(hex).map((value) => value / 255);
  return `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  ${gain} 0 0 0 ${-cut}`;
}

export function FoodGrain({
  d,
  seed,
  frequency = 0.09,
  dark = "#5a2a0a",
  light = "#fff2c8",
  strength = 1,
}: FoodGrainProps) {
  const id = useSvgId("ck-grain");
  return (
    <g pointerEvents="none">
      <defs>
        <filter id={`${id}-dark`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={3} seed={seed % 97} />
          <feColorMatrix values={tint(dark, 2.4 * strength, 1.05)} />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-light`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency * 2.4}
            numOctaves={2}
            seed={(seed + 41) % 97}
          />
          <feColorMatrix values={tint(light, 2.2 * strength, 1.1)} />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <path d={d} fill="#000000" filter={`url(#${id}-dark)`} opacity={0.4} />
      <path d={d} fill="#000000" filter={`url(#${id}-light)`} opacity={0.36} />
    </g>
  );
}
