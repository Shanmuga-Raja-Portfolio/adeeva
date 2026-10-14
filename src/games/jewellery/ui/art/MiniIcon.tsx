type MiniIconName = "gem" | "sheet" | "hammer" | "glint" | "lamp" | "saw";

interface MiniIconProps {
  readonly name: MiniIconName;
  readonly size?: number | undefined;
}

function glyph(name: MiniIconName) {
  switch (name) {
    case "gem":
      return (
        <g>
          <path d="M4 8 L8 3 L16 3 L20 8 L12 21 Z" fill="currentColor" fillOpacity={0.18} />
          <path d="M4 8 L8 3 L16 3 L20 8 L12 21 Z M4 8 L20 8 M8 3 L10 8 L12 21 M16 3 L14 8 L12 21" />
        </g>
      );
    case "sheet":
      return (
        <g>
          <rect x={4} y={5} width={16} height={14} rx={2} fill="currentColor" fillOpacity={0.18} />
          <path d="M7 9 L17 9 M7 12 L14 12 M7 15 L16 15" strokeOpacity={0.6} />
          <rect x={4} y={5} width={16} height={14} rx={2} />
        </g>
      );
    case "hammer":
      return (
        <g>
          <path d="M5 8 L13 4 L16 7 L8 11 Z" fill="currentColor" fillOpacity={0.3} />
          <path d="M5 8 L13 4 L16 7 L8 11 Z M11 9 L19 19" />
        </g>
      );
    case "glint":
      return <path d="M12 3 Q13 11 21 12 Q13 13 12 21 Q11 13 3 12 Q11 11 12 3 Z" fill="currentColor" />;
    case "lamp":
      return (
        <g>
          <path d="M6 13 Q12 3 18 13 Z" fill="currentColor" fillOpacity={0.3} />
          <path d="M6 13 Q12 3 18 13 Z M12 13 L12 19 M8 20 L16 20" />
        </g>
      );
    case "saw":
      return (
        <g>
          <path d="M4 7 L4 17 L20 17 M4 7 L20 7 L20 17" />
          <path d="M6 17 L7.5 14.5 L9 17 L10.5 14.5 L12 17 L13.5 14.5 L15 17 L16.5 14.5 L18 17" />
        </g>
      );
  }
}

export function MiniIcon({ name, size = 16 }: MiniIconProps) {
  return (
    <svg
      className="jb-mini-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyph(name)}
    </svg>
  );
}
