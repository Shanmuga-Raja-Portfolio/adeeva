import type { ReactNode } from "react";
import { colourById } from "../../../../engine/palette";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { FairThemeDef, FairThemeId } from "../../content/fairTheme";

export interface ThemeVignetteProps {
  readonly theme: FairThemeDef;
  readonly className?: string | undefined;
}

type Scene = (palette: readonly string[]) => ReactNode;

function petals(colour: string): ReactNode {
  return [
    [40, 20],
    [90, 44],
    [150, 16],
    [210, 50],
    [260, 24],
    [300, 60],
  ].map(([x, y]) => (
    <ellipse
      key={`${x}-${y}`}
      cx={x}
      cy={y}
      rx={4}
      ry={2.4}
      fill={colour}
      transform={`rotate(30 ${x} ${y})`}
    />
  ));
}

const SCENES: Readonly<Record<FairThemeId, Scene>> = {
  "blossom-lane": ([blush = "#f2c4c9", lavender = "#b9a7dc", , sage = "#9cb59a"]) => (
    <g>
      <rect width={320} height={90} fill="#fdf2f4" />
      <path d="M0 90 Q160 50 320 90 Z" fill={sage} opacity={0.7} />
      <path d="M140 90 Q160 60 180 90 Z" fill="#efe6d2" />
      {[50, 270].map((x) => (
        <g key={x}>
          <rect x={x - 3} y={46} width={6} height={36} fill="#8e6a45" />
          <circle cx={x} cy={40} r={22} fill={blush} />
          <circle cx={x - 14} cy={48} r={14} fill={lavender} opacity={0.8} />
          <circle cx={x + 14} cy={46} r={15} fill={blush} />
        </g>
      ))}
      {petals(blush)}
    </g>
  ),
  "kite-day": ([sky = "#9fd0ee", mustard = "#d9a42b", coral = "#f07f63"]) => (
    <g>
      <rect width={320} height={90} fill={sky} opacity={0.6} />
      <path d="M0 90 Q100 56 200 74 T320 70 V90 Z" fill="#9cb59a" />
      <path d="M90 20 L110 40 L90 62 L70 40 Z" fill={mustard} stroke="#a8841a" />
      <path d="M90 62 Q100 74 86 84" stroke="#3b2620" fill="none" />
      <path d="M220 14 L238 30 L220 48 L202 30 Z" fill={coral} stroke="#b0503a" />
      <path d="M220 48 Q228 62 214 76" stroke="#3b2620" fill="none" />
      <circle cx={290} cy={18} r={10} fill="#fff6cf" />
    </g>
  ),
  "seaside-postcard": ([teal = "#2a8c91", sky = "#9fd0ee", coral = "#f07f63"]) => (
    <g>
      <rect width={320} height={90} fill={sky} opacity={0.7} />
      <rect y={46} width={320} height={22} fill={teal} />
      <path
        d="M0 50 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"
        stroke="#ffffff"
        fill="none"
        strokeWidth={2}
      />
      <rect y={66} width={320} height={24} fill="#f3dfb5" />
      <path d="M220 86 L236 60 L262 60 L248 86 Z" fill={coral} />
      <path d="M226 86 L242 60 M234 86 L250 60" stroke="#ffffff" strokeWidth={3} />
      <circle cx={60} cy={20} r={12} fill="#fff6cf" />
    </g>
  ),
  "midsummer-lanterns": ([navy = "#22305a", gold = "#c9a227", lavender = "#b9a7dc", plum = "#5e2a5a"]) => (
    <g>
      <rect width={320} height={90} fill={navy} />
      <path d="M0 18 Q80 34 160 18 T320 18" stroke="#e8dcc0" fill="none" />
      {[50, 120, 200, 270].map((x, index) => {
        const colour = [gold, lavender, gold, plum][index] ?? gold;
        return (
          <g key={x} transform={`translate(${x} 26)`}>
            <circle r={18} fill={colour} opacity={0.25} />
            <rect x={-10} y={-12} width={20} height={26} rx={9} fill={colour} />
            <path d="M-10 -2 H10 M-10 6 H10" stroke="#ffffff" opacity={0.4} />
          </g>
        );
      })}
      <path d="M0 90 Q160 62 320 90 Z" fill="#1a2444" />
    </g>
  ),
  "harvest-moon": ([mustard = "#d9a42b", plum = "#5e2a5a", gold = "#c9a227", ruby = "#9b1b30"]) => (
    <g>
      <rect width={320} height={90} fill={plum} opacity={0.85} />
      <circle cx={230} cy={34} r={24} fill={gold} />
      <circle cx={230} cy={34} r={30} fill={mustard} opacity={0.25} />
      <path d="M0 90 Q90 54 180 76 T320 66 V90 Z" fill="#6b4232" />
      <path d="M50 74 L70 56 L90 74 V88 H50 Z" fill={ruby} />
      <rect x={64} y={74} width={12} height={14} fill="#3b2620" />
    </g>
  ),
  "library-nook": ([emerald = "#1f7a55", navy = "#22305a", ivory = "#f4ecd8", gold = "#c9a227"]) => (
    <g>
      <rect width={320} height={90} fill="#6b4232" />
      {[8, 38, 68].map((y) => (
        <g key={y}>
          <rect x={0} y={y + 22} width={320} height={4} fill="#4a2c20" />
          {Array.from({ length: 22 }, (_, index) => (
            <rect
              key={index}
              x={6 + index * 14}
              y={y + (index % 3)}
              width={11}
              height={22 - (index % 3)}
              fill={[emerald, navy, ivory, gold][index % 4]}
            />
          ))}
        </g>
      ))}
    </g>
  ),
  "snow-globe": ([ivory = "#f4ecd8", sky = "#9fd0ee", lavender = "#b9a7dc", teal = "#2a8c91"]) => (
    <g>
      <rect width={320} height={90} fill={lavender} opacity={0.35} />
      <circle cx={160} cy={46} r={36} fill={sky} opacity={0.6} stroke="#ffffff" strokeWidth={3} />
      <path d="M140 66 V52 L152 42 L164 52 V66 Z" fill={ivory} />
      <path d="M166 66 L174 50 L182 66 Z" fill={teal} />
      <rect x={128} y={80} width={64} height={10} rx={3} fill="#8e6a45" />
      {[
        [40, 20],
        [80, 50],
        [250, 18],
        [290, 56],
        [150, 30],
        [176, 38],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill="#ffffff" />
      ))}
    </g>
  ),
  "comet-night": ([navy = "#22305a", gold = "#c9a227", , plum = "#5e2a5a"]) => (
    <g>
      <rect width={320} height={90} fill={navy} />
      <path d="M60 70 L250 18" stroke={gold} strokeWidth={6} strokeLinecap="round" opacity={0.35} />
      <path d="M120 54 L250 18" stroke="#fff6d8" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      <circle cx={252} cy={18} r={7} fill="#fff6d8" />
      {[
        [30, 20],
        [90, 14],
        [170, 70],
        [290, 50],
        [210, 76],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill="#fff6d8" />
      ))}
      <path d="M0 90 Q160 70 320 90 Z" fill={plum} />
    </g>
  ),
};

export function ThemeVignette({ theme, className }: ThemeVignetteProps) {
  const id = useSvgId("vignette");
  const palette = theme.palette.map((colour) => colourById(colour).hex);
  return (
    <svg className={className} viewBox="0 0 320 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect width={320} height={90} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>{SCENES[theme.id](palette)}</g>
    </svg>
  );
}
