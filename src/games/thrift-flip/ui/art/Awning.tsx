import { useSvgId } from "../../../../ui/art/useSvgId";

export interface AwningProps {
  readonly className?: string | undefined;
}

const SCALLOPED = `M0 0 H1200 V36 ${Array.from({ length: 40 }, (_, index) => {
  const x = 1200 - index * 30;
  return `Q${x - 15} 58 ${x - 30} 36`;
}).join(" ")} Z`;

export function Awning({ className }: AwningProps) {
  const id = useSvgId("awning");
  return (
    <svg
      className={className ? `tf-awning ${className}` : "tf-awning"}
      viewBox="0 0 1200 64"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={`${id}-stripes`} width={60} height={64} patternUnits="userSpaceOnUse">
          <rect width={30} height={64} fill="#f08a3c" />
          <rect x={30} width={30} height={64} fill="#fff4e2" />
        </pattern>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.25} />
          <stop offset="0.7" stopColor="#000000" stopOpacity={0} />
          <stop offset="1" stopColor="#5b3a1e" stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <path d={SCALLOPED} fill={`url(#${id}-stripes)`} />
      <path d={SCALLOPED} fill={`url(#${id}-shade)`} />
      <path d="M0 6 H1200" stroke="#b85a17" strokeOpacity={0.4} strokeWidth={3} />
    </svg>
  );
}
