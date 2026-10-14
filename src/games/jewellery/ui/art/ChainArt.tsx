import { darken, lighten } from "../../../../ui/art/colourMix";
import type { ChainId } from "../../content/extra";
import type { MetalLook } from "./metalLook";

interface ChainArtProps {
  readonly chain: ChainId;
  readonly d: string;
  readonly metal: MetalLook;
  readonly cordHex: string;
  readonly scale?: number | undefined;
}

export function ChainArt({ chain, d, metal, cordHex, scale = 1 }: ChainArtProps) {
  if (chain === "silk-cord")
    return (
      <g fill="none" strokeLinecap="round">
        <path d={d} stroke={darken(cordHex, 0.3)} strokeWidth={4.2 * scale} />
        <path d={d} stroke={cordHex} strokeWidth={3 * scale} />
        <path
          d={d}
          stroke={lighten(cordHex, 0.55)}
          strokeWidth={0.9 * scale}
          strokeOpacity={0.8}
          transform="translate(-0.6 -0.8)"
        />
      </g>
    );
  if (chain === "rope-chain")
    return (
      <g fill="none" strokeLinecap="round">
        <path d={d} stroke={metal.dark} strokeWidth={4.6 * scale} />
        <path d={d} stroke={metal.mid} strokeWidth={3.4 * scale} />
        <path
          d={d}
          stroke={metal.light}
          strokeWidth={3.4 * scale}
          strokeDasharray={`${1.6 * scale} ${2.2 * scale}`}
        />
      </g>
    );
  return (
    <g fill="none" strokeLinecap="round">
      <path
        d={d}
        stroke={metal.dark}
        strokeWidth={2.4 * scale}
        strokeDasharray={`${3 * scale} ${1.2 * scale}`}
      />
      <path
        d={d}
        stroke={metal.light}
        strokeWidth={1.1 * scale}
        strokeDasharray={`${3 * scale} ${1.2 * scale}`}
      />
    </g>
  );
}
