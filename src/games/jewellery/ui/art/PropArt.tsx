import type { ReactElement } from "react";
import type { PropId } from "../../content/lookbookProp";

interface PropArtProps {
  readonly propId: PropId;
  readonly size?: number | undefined;
}

function Shell() {
  return (
    <g>
      <path
        d="M0 -16 C14 -16 20 -4 18 8 L0 18 L-18 8 C-20 -4 -14 -16 0 -16 Z"
        fill="#f6d3cc"
        stroke="#b5776b"
        strokeWidth={1.4}
      />
      <path
        d="M0 17 L0 -14 M0 17 L-9 -11 M0 17 L9 -11 M0 17 L-16 2 M0 17 L16 2"
        stroke="#b5776b"
        strokeWidth={1}
        fill="none"
      />
      <path d="M-6 18 L6 18 L4 22 L-4 22 Z" fill="#e8b4aa" stroke="#b5776b" strokeWidth={1} />
    </g>
  );
}

function Flower() {
  return (
    <g>
      <path d="M0 4 C-2 10 -1 16 2 21" stroke="#5f8a5a" strokeWidth={1.8} fill="none" />
      <path d="M1 14 C6 10 11 11 12 13 C8 16 4 16 1 14 Z" fill="#7fae78" />
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx={0}
          cy={-8}
          rx={5}
          ry={8}
          fill="#f4a9c0"
          stroke="#c46a8a"
          strokeWidth={0.9}
          transform={`rotate(${angle} 0 0) translate(0 -1)`}
        />
      ))}
      <circle r={4.5} fill="#f6d27a" stroke="#c9a227" strokeWidth={0.9} />
    </g>
  );
}

function Teacup() {
  return (
    <g>
      <ellipse cx={0} cy={14} rx={18} ry={4} fill="#d9e9ea" stroke="#5f8a8f" strokeWidth={1.2} />
      <path
        d="M-13 -6 L13 -6 C13 8 8 13 0 13 C-8 13 -13 8 -13 -6 Z"
        fill="#fffbf4"
        stroke="#5f8a8f"
        strokeWidth={1.4}
      />
      <path d="M13 -2 C21 -2 21 8 12 8" fill="none" stroke="#5f8a8f" strokeWidth={2} />
      <ellipse cx={0} cy={-6} rx={13} ry={3} fill="#c47a4a" stroke="#5f8a8f" strokeWidth={1} />
      <path d="M-9 2 Q0 6 9 2" fill="none" stroke="#3fa9a6" strokeWidth={1.4} />
      <path
        d="M-3 -12 Q0 -16 -2 -20 M4 -12 Q7 -16 5 -20"
        fill="none"
        stroke="#c7ccd4"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </g>
  );
}

function Storybook() {
  return (
    <g>
      <path
        d="M-19 -12 L0 -8 L19 -12 L19 14 L0 18 L-19 14 Z"
        fill="#4b2a4f"
        stroke="#2f1832"
        strokeWidth={1.4}
      />
      <path d="M-17 -10 L0 -6 L0 15 L-17 11 Z" fill="#fff6e2" />
      <path d="M17 -10 L0 -6 L0 15 L17 11 Z" fill="#fbefcf" />
      <path d="M-13 -3 L-4 -1 M-13 2 L-4 4 M-13 7 L-6 8.5" stroke="#b9a7dc" strokeWidth={1} />
      <path
        d="M8 -2 l1.5 3.2 l3.4 0.4 l-2.5 2.3 l0.7 3.3 l-3.1 -1.7 l-3.1 1.7 l0.7 -3.3 l-2.5 -2.3 l3.4 -0.4 Z"
        fill="#f2c230"
      />
    </g>
  );
}

function RibbonSpool() {
  return (
    <g>
      <rect x={-15} y={-14} width={30} height={6} rx={2} fill="#c9a36a" stroke="#7a5236" strokeWidth={1.2} />
      <rect x={-15} y={10} width={30} height={6} rx={2} fill="#c9a36a" stroke="#7a5236" strokeWidth={1.2} />
      <rect x={-11} y={-8} width={22} height={18} fill="#e8789c" stroke="#a84a6a" strokeWidth={1.2} />
      <path d="M-11 -3 L11 -3 M-11 2 L11 2 M-11 7 L11 7" stroke="#f6b4c8" strokeWidth={1} />
      <path d="M11 4 C18 6 20 14 15 20" fill="none" stroke="#e8789c" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function Pebble() {
  return (
    <g>
      <path
        d="M-18 4 C-18 -8 -6 -14 6 -12 C16 -10 20 -2 18 6 C16 14 4 16 -6 15 C-14 14 -18 10 -18 4 Z"
        fill="#8f9aa6"
        stroke="#55606b"
        strokeWidth={1.4}
      />
      <path
        d="M-10 -6 C-4 -10 4 -10 8 -8"
        fill="none"
        stroke="#c7d0d8"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <path d="M-14 6 Q-2 2 14 8" fill="none" stroke="#e9eef2" strokeWidth={1.2} opacity={0.7} />
    </g>
  );
}

function PaperStar() {
  return (
    <g>
      <path
        d="M0 -19 L5.6 -6.4 L19 -5.8 L8.6 3 L12 16 L0 9 L-12 16 L-8.6 3 L-19 -5.8 L-5.6 -6.4 Z"
        fill="#f6d27a"
        stroke="#b8741c"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d="M0 -19 L0 9 M-19 -5.8 L8.6 3 M19 -5.8 L-8.6 3" stroke="#d9a63a" strokeWidth={0.8} />
    </g>
  );
}

function Marble() {
  return (
    <g>
      <circle r={15} fill="#9fd0ee" stroke="#3f7fa8" strokeWidth={1.4} />
      <path
        d="M-10 4 C-4 -8 6 8 11 -4"
        fill="none"
        stroke="#f07f63"
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <path
        d="M-8 -6 C-2 0 4 -10 10 2"
        fill="none"
        stroke="#f6d27a"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <ellipse cx={-5} cy={-7} rx={4} ry={2.6} fill="#ffffff" opacity={0.85} />
    </g>
  );
}

const ART: Readonly<Record<PropId, () => ReactElement>> = {
  "sea-shell": Shell,
  "pressed-flower": Flower,
  teacup: Teacup,
  storybook: Storybook,
  "ribbon-spool": RibbonSpool,
  "river-pebble": Pebble,
  "paper-star": PaperStar,
  "glass-marble": Marble,
};

export function PropArt({ propId, size = 44 }: PropArtProps) {
  const Draw = ART[propId];
  return (
    <g transform={`scale(${size / 44})`}>
      <ellipse cx={0} cy={19} rx={16} ry={3.5} fill="#000000" opacity={0.18} />
      <Draw />
    </g>
  );
}
