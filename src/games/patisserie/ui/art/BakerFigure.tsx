import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import { DOLL_VIEWBOX } from "../../../../ui/art/avatar/Croquis";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface BakerFigureProps {
  readonly look: AvatarLook;
  readonly name: string;
  readonly held: "cake" | "tea";
  readonly className?: string | undefined;
}

function HeldCake({ id }: { readonly id: string }) {
  return (
    <g transform="translate(200 326)">
      <defs>
        <linearGradient id={`${id}-sponge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6c9d4" />
          <stop offset="0.4" stopColor="#fde7ee" />
          <stop offset="1" stopColor="#e9a9bb" />
        </linearGradient>
        <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d8d2c8" />
          <stop offset="0.45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c9c0b2" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={6} rx={86} ry={14} fill="#3b2620" opacity={0.18} />
      <ellipse cx={0} cy={0} rx={84} ry={14} fill={`url(#${id}-plate)`} stroke="#b9ad9c" strokeWidth={1.6} />
      <ellipse cx={0} cy={-3} rx={64} ry={9} fill="#efe9df" />
      <path d="M-58 -6 V-58 Q0 -72 58 -58 V-6 Q0 6 -58 -6 Z" fill={`url(#${id}-sponge)`} />
      <path d="M-58 -32 Q0 -22 58 -32" fill="none" stroke="#c94f6d" strokeWidth={5} opacity={0.55} />
      <path d="M-58 -32 Q0 -22 58 -32" fill="none" stroke="#fff6ea" strokeWidth={2} opacity={0.8} />
      <ellipse cx={0} cy={-58} rx={58} ry={13} fill="#fff4f7" stroke="#e9a9bb" strokeWidth={1.4} />
      <path
        d="M-58 -58 Q-52 -46 -44 -56 Q-36 -44 -28 -54 Q-20 -42 -12 -52 Q-4 -40 4 -52 Q12 -42 20 -54 Q28 -44 36 -56 Q44 -46 52 -58 Q56 -52 58 -58"
        fill="#fff4f7"
        stroke="#e9a9bb"
        strokeWidth={1.2}
      />
      {[-34, -12, 12, 34].map((dx, index) => (
        <g key={dx} transform={`translate(${dx} ${-62 - (index % 2) * 4})`}>
          <path
            d="M-7 0 Q-8 -12 0 -13 Q8 -12 7 0 Q0 6 -7 0 Z"
            fill="#d9375a"
            stroke="#9c2440"
            strokeWidth={1}
          />
          <path d="M-4 -12 L0 -17 L4 -12" fill="#5f8a43" />
          <circle cx={-2} cy={-6} r={1.6} fill="#ffffff" opacity={0.7} />
        </g>
      ))}
      <path
        d="M-48 -52 Q-50 -30 -46 -12"
        stroke="#ffffff"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.5}
        fill="none"
      />
    </g>
  );
}

function HeldTea({ id }: { readonly id: string }) {
  return (
    <g transform="translate(200 326)">
      <defs>
        <linearGradient id={`${id}-tray`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9a06a" />
          <stop offset="0.45" stopColor="#f6e7b8" />
          <stop offset="1" stopColor="#a88a4c" />
        </linearGradient>
        <radialGradient id={`${id}-pot`} cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#d7ecf8" />
          <stop offset="0.6" stopColor="#9fd0ee" />
          <stop offset="1" stopColor="#5f9cc4" />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={6} rx={92} ry={14} fill="#3b2620" opacity={0.18} />
      <ellipse cx={0} cy={0} rx={90} ry={15} fill={`url(#${id}-tray)`} stroke="#8a6a2a" strokeWidth={1.6} />
      <ellipse cx={0} cy={-3} rx={78} ry={10} fill="#fbf1d2" opacity={0.7} />
      <path d="M8 -46 Q36 -50 34 -70" fill="none" stroke="#5f9cc4" strokeWidth={6} strokeLinecap="round" />
      <path
        d="M-34 -36 Q-52 -36 -48 -18"
        fill="none"
        stroke="#5f9cc4"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M-34 -4 Q-42 -56 0 -58 Q42 -56 34 -4 Z"
        fill={`url(#${id}-pot)`}
        stroke="#3e6f93"
        strokeWidth={1.4}
      />
      <path d="M-30 -24 Q0 -16 30 -24" fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.8} />
      <ellipse cx={0} cy={-58} rx={14} ry={4} fill="#d7ecf8" stroke="#3e6f93" strokeWidth={1.2} />
      <circle cx={0} cy={-64} r={4.5} fill="#c9a227" />
      <path
        d="M-20 -46 Q-24 -36 -18 -28"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.6}
        fill="none"
      />
      {[-62, 62].map((dx) => (
        <g key={dx} transform={`translate(${dx} -4)`}>
          <ellipse cx={0} cy={0} rx={16} ry={4.5} fill="#ffffff" stroke="#d8cbb6" strokeWidth={1.2} />
          <path
            d="M-10 -2 Q-10 -18 0 -18 Q10 -18 10 -2 Z"
            fill="#ffffff"
            stroke="#d8cbb6"
            strokeWidth={1.2}
          />
          <path d="M-10 -11 H10" stroke="#e9a9bb" strokeWidth={2.4} />
        </g>
      ))}
      <path
        className="pa-steam"
        d="M38 -78 Q30 -92 38 -104 Q46 -116 38 -130"
        fill="none"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.7}
      />
    </g>
  );
}

export function BakerFigure({ look, name, held, className }: BakerFigureProps) {
  const id = useSvgId("baker");
  return (
    <svg className={className} viewBox={DOLL_VIEWBOX} role="img" aria-label={name}>
      <AvatarFigure look={look} mood="delighted" pose="tray" />
      {held === "cake" ? <HeldCake id={id} /> : <HeldTea id={id} />}
    </svg>
  );
}
