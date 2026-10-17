import type { ReactNode } from "react";
import { PlacedLayer } from "../../../../ui/art/PlacedLayer";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { DISPLAY_CANVAS, productById, type PieceSource, type PlacedCharm } from "../../core";
import { BadgeArt } from "./BadgeArt";
import { BagCharmArt } from "./BagCharmArt";
import { BangleArt } from "./BangleArt";
import { BraceletArt } from "./BraceletArt";
import { CharmArt } from "./CharmArt";
import { EarringArt } from "./EarringArt";
import { HalvesArt } from "./HalvesArt";
import { MetalDefs, metalFill, sheenFill } from "./MetalDefs";
import { metalLook } from "./metalLook";
import { PendantArt } from "./PendantArt";
import type { PieceArtProps } from "./pieceArtProps";
import { RingArt } from "./RingArt";
import { SlideArt } from "./SlideArt";
import { VelvetCard } from "./VelvetCard";

export interface PiecePreviewProps {
  readonly source: PieceSource;
  readonly title: string | null;
  readonly className?: string | undefined;
  readonly twinkle?: boolean | undefined;
  readonly velvet?: boolean | undefined;
  readonly showCharms?: boolean | undefined;
  readonly children?: ReactNode;
}

function KindArt(props: PieceArtProps) {
  const product = productById(props.source.productId);
  switch (product.kind) {
    case "ring":
      return <RingArt {...props} />;
    case "pendant":
      return product.id === "friendship-halves" ? <HalvesArt {...props} /> : <PendantArt {...props} />;
    case "earrings":
      return <EarringArt {...props} />;
    case "bracelet":
      return product.id === "bangle" ? <BangleArt {...props} /> : <BraceletArt {...props} />;
    case "badge":
      return <BadgeArt {...props} />;
    case "charm":
      return <BagCharmArt {...props} />;
    case "slide":
      return <SlideArt {...props} />;
  }
}

export function charmTransform(charm: PlacedCharm): string {
  return `translate(${charm.x} ${charm.y}) rotate(${charm.rotation}) scale(${charm.scale})`;
}

export function PiecePreview({
  source,
  title,
  className,
  twinkle = false,
  velvet = true,
  showCharms = true,
  children,
}: PiecePreviewProps) {
  const id = useSvgId("jb-piece");
  const metal = metalLook(source.metalId, source.finish);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${DISPLAY_CANVAS.width} ${DISPLAY_CANVAS.height}`}
      role={title === null ? undefined : "img"}
      aria-label={title ?? undefined}
      aria-hidden={title === null ? true : undefined}
    >
      <MetalDefs id={id} look={metal} />
      <clipPath id={`${id}-card`}>
        <rect x={4} y={4} width={232} height={232} rx={22} />
      </clipPath>
      {velvet ? <VelvetCard /> : null}
      <g clipPath={velvet ? `url(#${id}-card)` : undefined}>
        <KindArt source={source} metal={metal} fill={metalFill(id)} sheen={sheenFill(id)} twinkle={twinkle} />
      </g>
      {showCharms ? (
        <PlacedLayer
          items={source.charms}
          className="jb-piece__charms"
          render={(charm) => (
            <g transform={charmTransform(charm)}>
              <CharmArt charmId={charm.charmId} shape={charm.shape} />
            </g>
          )}
        />
      ) : null}
      {children}
    </svg>
  );
}
