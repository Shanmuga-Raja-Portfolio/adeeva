import { useSvgId } from "../../../../ui/art/useSvgId";

export interface ClocheProps {
  readonly className?: string | undefined;
}

const GLINTS: readonly (readonly [number, number])[] = [
  [60, 92],
  [132, 70],
  [118, 128],
  [78, 132],
];

function glint(x: number, y: number): string {
  return `M${x} ${y - 6} L${x + 2} ${y - 2} L${x + 6} ${y} L${x + 2} ${y + 2} L${x} ${y + 6} L${x - 2} ${y + 2} L${x - 6} ${y} L${x - 2} ${y - 2} Z`;
}

export function Cloche({ className }: ClocheProps) {
  const id = useSvgId("cloche");
  return (
    <svg className={className} viewBox="0 0 200 170" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f4f7fb" stopOpacity={0.96} />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="0.7" stopColor="#e6edf6" stopOpacity={0.92} />
          <stop offset="1" stopColor="#d5dfec" stopOpacity={0.96} />
        </linearGradient>
        <radialGradient id={`${id}-shine`} cx="0.35" cy="0.3" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d="M14 160 Q10 40 100 30 Q190 40 186 160 Z"
        fill={`url(#${id}-glass)`}
        stroke="#c9a227"
        strokeWidth={3}
      />
      <path d="M14 160 Q10 40 100 30 Q190 40 186 160 Z" fill={`url(#${id}-shine)`} />
      <path d="M40 140 Q36 70 90 52" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d="M150 70 Q160 90 160 120" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" fill="none" />
      {GLINTS.map(([x, y]) => (
        <path key={`${x}-${y}`} d={glint(x, y)} fill="#f6d77a" />
      ))}
      <ellipse cx={100} cy={160} rx={88} ry={8} fill="none" stroke="#c9a227" strokeWidth={5} />
      <path d="M86 32 Q86 10 100 10 Q114 10 114 32" fill="#e2b93b" stroke="#a8841a" strokeWidth={3} />
      <circle cx={100} cy={10} r={7} fill="#e2b93b" stroke="#a8841a" strokeWidth={2} />
    </svg>
  );
}
