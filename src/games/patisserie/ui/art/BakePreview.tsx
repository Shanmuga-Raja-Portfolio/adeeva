import type { ReactNode } from "react";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";
import { BiscuitSetArt } from "./BiscuitSetArt";
import { CakeStand } from "./CakeStand";
import { CupcakeArt } from "./CupcakeArt";
import { LayerCakeArt } from "./LayerCakeArt";
import { TartArt } from "./TartArt";
import { TierCakeArt } from "./TierCakeArt";
import { ToppingLayer } from "./ToppingLayer";

const CUPCAKE_SPOTS: [number, number, number][] = [
  [118, 214, 0.86],
  [200, 206, 0.86],
  [282, 214, 0.86],
  [112, 286, 1],
  [200, 296, 1],
  [288, 286, 1],
];

function CupcakeSet({ look }: { readonly look: BakeLook }) {
  return (
    <g>
      <CakeStand width={330} y={330} />
      {CUPCAKE_SPOTS.map(([x, y, scale], index) => (
        <CupcakeArt
          key={index}
          x={x}
          y={y}
          scale={scale * 1.25}
          sponge={spongeHex(look, 0)}
          icing={icingHex(look, index)}
          paper={index % 2 === 0 ? "#f4a259" : "#a9c98b"}
          pattern={look.pattern}
          iced={look.iced}
          filled={look.fillingColour}
        />
      ))}
    </g>
  );
}

function productArt(look: BakeLook): ReactNode {
  switch (look.productId) {
    case "cupcake-tray":
      return <CupcakeSet look={look} />;
    case "layer-cake":
      return <LayerCakeArt look={look} />;
    case "two-tier-cake":
      return <TierCakeArt look={look} />;
    case "fruit-tart":
      return <TartArt look={look} />;
    case "iced-biscuits":
      return <BiscuitSetArt look={look} />;
  }
}

export interface BakePreviewProps {
  readonly look: BakeLook;
  readonly title: string | null;
  readonly className?: string | undefined;
  readonly selectedToppingId?: string | undefined;
  readonly children?: ReactNode;
}

export function BakePreview({ look, title, className, selectedToppingId, children }: BakePreviewProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      role={title === null ? undefined : "img"}
      aria-label={title ?? undefined}
      aria-hidden={title === null ? true : undefined}
    >
      {productArt(look)}
      <ToppingLayer toppings={look.toppings} selectedId={selectedToppingId} />
      {children}
    </svg>
  );
}
