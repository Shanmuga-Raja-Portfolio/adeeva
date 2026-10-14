import type { ReactNode } from "react";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";
import { BiscuitSetArt } from "./BiscuitSetArt";
import { BiscuitWreathArt } from "./BiscuitWreathArt";
import { CakeStand } from "./CakeStand";
import { CupcakeArt } from "./CupcakeArt";
import { LayerCakeArt } from "./LayerCakeArt";
import { PetitFoursArt } from "./PetitFoursArt";
import { SpiralRollArt } from "./SpiralRollArt";
import { TartArt } from "./TartArt";
import { TartletSetArt } from "./TartletSetArt";
import { ThreeTierArt } from "./ThreeTierArt";
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
    case "petit-fours":
      return <PetitFoursArt look={look} />;
    case "tartlet-set":
      return <TartletSetArt look={look} />;
    case "spiral-roll":
      return <SpiralRollArt look={look} />;
    case "biscuit-wreath":
      return <BiscuitWreathArt look={look} />;
    case "three-tier-cake":
      return <ThreeTierArt look={look} />;
  }
}

export interface BakePreviewProps {
  readonly look: BakeLook;
  readonly title: string | null;
  readonly className?: string | undefined;
  readonly selectedToppingId?: string | undefined;
  readonly plaque?: string | null | undefined;
  readonly children?: ReactNode;
}

function Plaque({ word }: { readonly word: string }) {
  const width = 26 + word.length * 15;
  return (
    <g transform="translate(292 352) rotate(-7)" aria-hidden="true">
      <rect x={-width / 2 - 3} y={-19} width={width + 6} height={38} rx={7} fill="#3b2018" />
      <rect x={-width / 2} y={-16} width={width} height={32} rx={5} fill="#5a3324" />
      <path d={`M${-width / 2 + 6} -12 H${width / 2 - 10}`} stroke="#a46f55" strokeWidth={2} opacity={0.6} />
      <text
        x={0}
        y={7}
        textAnchor="middle"
        fontSize={19}
        fontWeight={700}
        fontFamily="Georgia, serif"
        fill="#fff1cf"
        letterSpacing={1}
      >
        {word}
      </text>
    </g>
  );
}

export function BakePreview({
  look,
  title,
  className,
  selectedToppingId,
  plaque,
  children,
}: BakePreviewProps) {
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
      {plaque !== undefined && plaque !== null ? <Plaque word={plaque} /> : null}
      {children}
    </svg>
  );
}
