import type { UpgradeId } from "../../content/upgrade";

export function ToolIcon({ tool }: { readonly tool: UpgradeId }) {
  return (
    <svg viewBox="0 0 48 48" width={40} height={40} aria-hidden="true" focusable="false">
      {tool === "knife-roll" ? (
        <g>
          <rect x={6} y={14} width={36} height={22} rx={5} fill="#7a5236" />
          <path d="M6 22 H42" stroke="#553620" strokeWidth={2} />
          {[12, 20, 28, 36].map((x) => (
            <rect key={x} x={x - 2} y={8} width={4} height={14} rx={2} fill="#2e3a40" />
          ))}
          <path d="M42 26 L46 30" stroke="#c9a77a" strokeWidth={3} strokeLinecap="round" />
        </g>
      ) : null}
      {tool === "heavy-pan" ? (
        <g>
          <circle cx={20} cy={26} r={14} fill="#2e3a40" />
          <circle cx={20} cy={26} r={10} fill="#56636a" />
          <path d="M33 22 L46 14" stroke="#2e3a40" strokeWidth={5} strokeLinecap="round" />
        </g>
      ) : null}
      {tool === "long-ladle" ? (
        <g>
          <path d="M38 6 L18 30" stroke="#aeb9bf" strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={14} cy={34} rx={10} ry={7} fill="#aeb9bf" stroke="#5f6c73" strokeWidth={2} />
          <ellipse cx={14} cy={33} rx={6} ry={3} fill="#f2a93b" />
        </g>
      ) : null}
      {tool === "spice-tin" ? (
        <g>
          <circle cx={24} cy={26} r={16} fill="#aeb9bf" stroke="#5f6c73" strokeWidth={2} />
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const angle = (index / 6) * Math.PI * 2;
            const colours = ["#f0b21e", "#d9472b", "#8a5a34", "#4f8a3c", "#e9862a", "#f4ecdc"];
            return (
              <circle
                key={index}
                cx={24 + Math.cos(angle) * 9}
                cy={26 + Math.sin(angle) * 9}
                r={4}
                fill={colours[index]}
              />
            );
          })}
        </g>
      ) : null}
      {tool === "plating-spoons" ? (
        <g>
          <path d="M14 42 L26 14" stroke="#aeb9bf" strokeWidth={3} strokeLinecap="round" />
          <ellipse
            cx={27}
            cy={11}
            rx={5}
            ry={8}
            transform="rotate(22 27 11)"
            fill="#c9d1d5"
            stroke="#5f6c73"
            strokeWidth={1.5}
          />
          <path d="M24 42 L36 14" stroke="#aeb9bf" strokeWidth={3} strokeLinecap="round" />
          <ellipse
            cx={37}
            cy={11}
            rx={4}
            ry={7}
            transform="rotate(22 37 11)"
            fill="#c9d1d5"
            stroke="#5f6c73"
            strokeWidth={1.5}
          />
        </g>
      ) : null}
    </svg>
  );
}
