interface LanternBeamProps {
  readonly sweep: number;
  readonly glow: string;
}

export function LanternBeam({ sweep, glow }: LanternBeamProps) {
  if (sweep <= 0 || sweep >= 1) return null;
  const tipX = 180 + 840 * sweep;
  return (
    <path
      d={`M600 640 L${tipX - 90} 160 L${tipX + 90} 160 Z`}
      fill={glow}
      opacity={0.32 * Math.sin(Math.PI * sweep)}
      data-testid="lantern-beam"
    />
  );
}
