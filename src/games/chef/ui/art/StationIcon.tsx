import type { StationId } from "../../content/station";

export function StationIcon({ station }: { readonly station: StationId }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={34}
      height={34}
      aria-hidden="true"
      focusable="false"
      className="ck-station-icon"
    >
      {station === "board" ? (
        <g>
          <rect x={6} y={14} width={36} height={24} rx={6} fill="#c98f4a" stroke="#7a5236" strokeWidth={2} />
          <circle cx={36} cy={18} r={2} fill="#7a5236" />
          <circle cx={20} cy={26} r={6} fill="#e0482f" />
          <path d="M26 22 V32 M30 22 V32" stroke="#7a5236" strokeWidth={2} strokeDasharray="2 2" />
        </g>
      ) : null}
      {station === "hob" ? (
        <g>
          <circle cx={20} cy={26} r={13} fill="#2e3a40" />
          <circle cx={20} cy={26} r={8} fill="#f2a93b" opacity={0.6} />
          <path d="M32 20 L44 12" stroke="#2e3a40" strokeWidth={5} strokeLinecap="round" />
        </g>
      ) : null}
      {station === "pot" ? (
        <g>
          <rect x={8} y={18} width={32} height={22} rx={5} fill="#aeb9bf" stroke="#5f6c73" strokeWidth={2} />
          <ellipse cx={24} cy={18} rx={16} ry={4} fill="#e0612a" />
          <path
            d="M18 12 q3 -4 0 -8 M28 12 q3 -4 0 -8"
            stroke="#ffffff"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : null}
      {station === "spice" ? (
        <g>
          <rect x={8} y={18} width={12} height={20} rx={3} fill="#f0b21e" />
          <rect x={22} y={14} width={12} height={24} rx={3} fill="#d9472b" />
          <rect x={36} y={20} width={8} height={18} rx={3} fill="#4f8a3c" />
          <rect x={8} y={14} width={12} height={5} rx={1} fill="#5f6c73" />
        </g>
      ) : null}
      {station === "pass" ? (
        <g>
          <path d="M10 34 Q10 16 24 15 Q38 16 38 34 Z" fill="#d9b23c" stroke="#8f6e10" strokeWidth={2} />
          <rect x={6} y={34} width={36} height={5} rx={2} fill="#5f6c73" />
          <circle cx={24} cy={12} r={3} fill="#5f6c73" />
        </g>
      ) : null}
    </svg>
  );
}
