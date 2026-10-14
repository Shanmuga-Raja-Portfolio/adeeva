import type { MetalLook } from "./metalLook";

interface MetalDefsProps {
  readonly id: string;
  readonly look: MetalLook;
}

export function metalFill(id: string): string {
  return `url(#${id}-metal)`;
}

export function sheenFill(id: string): string {
  return `url(#${id}-sheen)`;
}

export function MetalDefs({ id, look }: MetalDefsProps) {
  return (
    <defs>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={look.light} />
        <stop offset="0.45" stopColor={look.mid} />
        <stop offset="0.7" stopColor={look.light} stopOpacity={0.85} />
        <stop offset="1" stopColor={look.dark} />
      </linearGradient>
      <radialGradient id={`${id}-sheen`} cx="0.32" cy="0.25" r="0.6">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.75} />
        <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
      </radialGradient>
    </defs>
  );
}
