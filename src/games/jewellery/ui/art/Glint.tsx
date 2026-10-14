interface GlintProps {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly twinkle?: boolean | undefined;
  readonly delay?: number | undefined;
}

export function Glint({ x, y, size, twinkle = false, delay = 0 }: GlintProps) {
  const s = size;
  const w = size * 0.22;
  return (
    <path
      className={twinkle ? "jb-twinkle" : undefined}
      style={twinkle ? { animationDelay: `${delay}s` } : undefined}
      d={`M${x} ${y - s} Q${x + w} ${y - w} ${x + s} ${y} Q${x + w} ${y + w} ${x} ${y + s} Q${x - w} ${y + w} ${x - s} ${y} Q${x - w} ${y - w} ${x} ${y - s} Z`}
      fill="#ffffff"
      opacity={0.95}
    />
  );
}
