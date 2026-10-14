import type { ReactNode } from "react";
import { PlacedLayer } from "../../../../ui/art/PlacedLayer";
import { FabricPattern, fabricFill } from "../../../../ui/art/cloth/FabricPattern";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { FINISH_CANVAS } from "../../core";
import { ExtraArt } from "./ExtraArt";
import type { PieceLook, SurfaceFill } from "./pieceLook";
import { CUSHION_SPOT, PieceShape } from "./pieceShapes";
import { woodLook } from "./woodLook";
import { WoodPattern } from "./WoodPattern";

interface PiecePreviewProps {
  readonly look: PieceLook;
  readonly title: string | null;
  readonly className?: string | undefined;
  readonly highlight?: string | null | undefined;
  readonly showExtras?: boolean | undefined;
  readonly threeQuarter?: boolean | undefined;
  readonly children?: ReactNode;
}

function fillDefs(id: string, fill: SurfaceFill, seed: number): ReactNode {
  if (fill.kind === "paint") return null;
  return <WoodPattern id={id} look={fill.look} seed={seed} tile={24} />;
}

function fillRef(id: string, fill: SurfaceFill): string {
  return fill.kind === "paint" ? fill.hex : `url(#${id})`;
}

export function PiecePreview({
  look,
  title,
  className,
  highlight = null,
  showExtras = true,
  threeQuarter = false,
  children,
}: PiecePreviewProps) {
  const id = useSvgId("ww-piece");
  const frameId = `${id}-frame`;
  const surfaceId = `${id}-surface`;
  const cushionId = `${id}-cushion`;
  const cushionSpot = CUSHION_SPOT[look.productId];
  const woodHex = look.woodId === null ? "#d9b98a" : woodLook(look.woodId).base;
  const kit = {
    frame: fillRef(frameId, look.frame),
    surface: fillRef(surfaceId, look.surface),
    edge: look.options.edge,
    legs: look.options.legs,
    accent: look.options.accent,
    highlight,
  };
  return (
    <svg
      className={className}
      viewBox={`0 0 ${FINISH_CANVAS.width} ${FINISH_CANVAS.height}`}
      role={title === null ? undefined : "img"}
      aria-label={title ?? undefined}
      aria-hidden={title === null ? true : undefined}
    >
      <defs>
        {fillDefs(frameId, look.frame, 11)}
        {fillDefs(surfaceId, look.surface, 23)}
        {look.cushion !== null ? <FabricPattern id={cushionId} fabric={look.cushion} tile={22} /> : null}
        <filter id={`${id}-shade`}>
          <feComponentTransfer>
            <feFuncR type="linear" slope={0.62} />
            <feFuncG type="linear" slope={0.6} />
            <feFuncB type="linear" slope={0.6} />
          </feComponentTransfer>
        </filter>
      </defs>
      <ellipse
        cx={threeQuarter ? 214 : 200}
        cy={270}
        rx={threeQuarter ? 170 : 150}
        ry={threeQuarter ? 16 : 10}
        fill="#2f2622"
        opacity={0.14}
      />
      {threeQuarter ? (
        <g transform="translate(16 -10)" filter={`url(#${id}-shade)`}>
          <PieceShape productId={look.productId} kit={kit} />
        </g>
      ) : null}
      <PieceShape productId={look.productId} kit={kit} />
      {look.cushion !== null && cushionSpot !== undefined ? (
        <g className="ww-piece__cushion">
          <rect
            x={cushionSpot.x}
            y={cushionSpot.y}
            width={cushionSpot.width}
            height={24}
            rx={12}
            fill={fabricFill(cushionId)}
            stroke="#2f2622"
            strokeWidth={2.5}
          />
          <path
            d={`M${cushionSpot.x + 14} ${cushionSpot.y + 12} H${cushionSpot.x + cushionSpot.width - 14}`}
            stroke="#2f2622"
            strokeOpacity={0.5}
            strokeDasharray="5 4"
          />
        </g>
      ) : null}
      {showExtras ? (
        <PlacedLayer
          items={look.extras}
          className="ww-piece__extras"
          render={(placed) => (
            <g
              transform={`translate(${placed.x} ${placed.y}) rotate(${placed.rotation}) scale(${placed.scale})`}
            >
              <ExtraArt extraId={placed.extraId} woodHex={woodHex} plaque={look.plaque} />
            </g>
          )}
        />
      ) : null}
      {children}
    </svg>
  );
}
