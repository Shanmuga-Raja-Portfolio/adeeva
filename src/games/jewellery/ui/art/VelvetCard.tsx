import { useSvgId } from "../../../../ui/art/useSvgId";

interface VelvetCardProps {
  readonly tone?: string | undefined;
}

export function VelvetCard({ tone = "#1f4e5a" }: VelvetCardProps) {
  const id = useSvgId("jb-velvet");
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-nap`} cx="0.4" cy="0.3" r="0.85">
          <stop offset="0" stopColor={tone} stopOpacity={0.55} />
          <stop offset="0.65" stopColor={tone} />
          <stop offset="1" stopColor="#0c1f25" />
        </radialGradient>
        <pattern id={`${id}-weave`} width={6} height={6} patternUnits="userSpaceOnUse">
          <path d="M0 6 L6 0" stroke="#ffffff" strokeOpacity={0.05} strokeWidth={1} />
        </pattern>
      </defs>
      <rect x={4} y={4} width={232} height={232} rx={22} fill={tone} />
      <rect x={4} y={4} width={232} height={232} rx={22} fill={`url(#${id}-nap)`} />
      <rect x={4} y={4} width={232} height={232} rx={22} fill={`url(#${id}-weave)`} />
      <rect
        x={12}
        y={12}
        width={216}
        height={216}
        rx={16}
        fill="none"
        stroke="#e8a33d"
        strokeOpacity={0.35}
        strokeWidth={1.2}
        strokeDasharray="2 4"
      />
    </g>
  );
}
