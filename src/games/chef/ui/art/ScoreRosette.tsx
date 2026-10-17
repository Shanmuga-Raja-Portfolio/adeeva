import { useSvgId } from "../../../../ui/art/useSvgId";

export interface ScoreRosetteProps {
  readonly stars: number;
  readonly className?: string | undefined;
}

const PETALS = 16;

function starPath(cx: number, cy: number, r: number): string {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2 - Math.PI / 2;
    const reach = index % 2 === 0 ? r : r * 0.45;
    return `${index === 0 ? "M" : "L"}${cx + Math.cos(angle) * reach} ${cy + Math.sin(angle) * reach}`;
  }).join(" ");
}

export function ScoreRosette({ stars, className }: ScoreRosetteProps) {
  const id = useSvgId("ck-rosette");
  const gold = stars >= 4;
  const face = gold ? "#f2a93b" : "#9aa6ac";
  const deep = gold ? "#c47f1a" : "#5f6c73";
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-face`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor={gold ? "#fff1c4" : "#f3f6f7"} />
          <stop offset="0.6" stopColor={face} />
          <stop offset="1" stopColor={deep} />
        </radialGradient>
      </defs>
      <path d="M40 70 L24 146 L42 132 L54 148 L60 76 Z" fill="#d9472b" />
      <path d="M80 70 L96 146 L78 132 L66 148 L60 76 Z" fill="#b8361e" />
      {Array.from({ length: PETALS }, (_, index) => {
        const angle = (index / PETALS) * 360;
        return (
          <ellipse
            key={index}
            cx={60}
            cy={22}
            rx={10}
            ry={16}
            fill={index % 2 === 0 ? "#d9472b" : "#f4efe4"}
            transform={`rotate(${angle} 60 58)`}
          />
        );
      })}
      <circle cx={62} cy={61} r={30} fill="#1f262a" opacity={0.25} />
      <circle cx={60} cy={58} r={30} fill={`url(#${id}-face)`} stroke={deep} strokeWidth={3} />
      <circle
        cx={60}
        cy={58}
        r={23}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.5}
        strokeDasharray="3 3"
        opacity={0.7}
      />
      <path d={starPath(60, 50, 13)} fill="#fffaf0" stroke={deep} strokeWidth={1.5} strokeLinejoin="round" />
      <text x={60} y={78} textAnchor="middle" className="ck-results__rosette-text">
        {stars} of 5
      </text>
    </svg>
  );
}
