import type { ReactNode } from "react";
import { PlacedLayer } from "../../../../ui/art/PlacedLayer";
import { FabricPattern, fabricFill } from "../../../../ui/art/cloth/FabricPattern";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { FINISH_CANVAS } from "../../core";
import { ExtraArt } from "./ExtraArt";
import type { PieceLook, SurfaceFill } from "./pieceLook";
import { CUSHION_SPOT, PieceShape } from "./pieceShapes";
import type { ShapeKit } from "./shapeKit";
import { woodLook } from "./woodLook";
import { WoodPattern } from "./WoodPattern";

interface PiecePreviewProps {
  readonly look: PieceLook;
  readonly title: string | null;
  readonly className?: string | undefined;
  readonly highlight?: string | null | undefined;
  readonly showExtras?: boolean | undefined;
  readonly threeQuarter?: boolean | undefined;
  readonly backdrop?: ReactNode;
  readonly children?: ReactNode;
}

function fillDefs(id: string, fill: SurfaceFill, seed: number): ReactNode {
  if (fill.kind === "paint") return null;
  return <WoodPattern id={id} look={fill.look} seed={seed} tile={24} />;
}

function fillRef(id: string, fill: SurfaceFill): string {
  return fill.kind === "paint" ? fill.hex : `url(#${id})`;
}

function LightDefs({ id }: { readonly id: string }) {
  return (
    <>
      <linearGradient id={`${id}-sheen-top`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffdf2" stopOpacity={0.5} />
        <stop offset="0.22" stopColor="#fffdf2" stopOpacity={0.14} />
        <stop offset="0.6" stopColor="#fffdf2" stopOpacity={0} />
        <stop offset="1" stopColor="#2f1d12" stopOpacity={0.26} />
      </linearGradient>
      <linearGradient id={`${id}-sheen-side`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fffdf2" stopOpacity={0.36} />
        <stop offset="0.3" stopColor="#fffdf2" stopOpacity={0.06} />
        <stop offset="0.7" stopColor="#2f1d12" stopOpacity={0.04} />
        <stop offset="1" stopColor="#2f1d12" stopOpacity={0.3} />
      </linearGradient>
      <pattern id={`${id}-sheen-brush`} patternUnits="userSpaceOnUse" width={60} height={9}>
        <path
          d="M0 2 H26 M30 2 H60 M8 6 H44 M50 6 H60"
          stroke="#ffffff"
          strokeOpacity={0.14}
          strokeWidth={1}
        />
        <path d="M14 4 H40 M0 8 H10" stroke="#2f2622" strokeOpacity={0.06} strokeWidth={1} />
      </pattern>
      <radialGradient id={`${id}-floor-shadow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#2f2622" stopOpacity={0.3} />
        <stop offset="0.6" stopColor="#2f2622" stopOpacity={0.12} />
        <stop offset="1" stopColor="#2f2622" stopOpacity={0} />
      </radialGradient>
    </>
  );
}

function lightKit(kit: ShapeKit, frame: string, surface: string): ShapeKit {
  return { ...kit, frame, surface, highlight: null };
}

export function PiecePreview({
  look,
  title,
  className,
  highlight = null,
  showExtras = true,
  threeQuarter = false,
  backdrop,
  children,
}: PiecePreviewProps) {
  const id = useSvgId("ww-piece");
  const frameId = `${id}-frame`;
  const surfaceId = `${id}-surface`;
  const cushionId = `${id}-cushion`;
  const cushionSpot = CUSHION_SPOT[look.productId];
  const woodHex = look.woodId === null ? "#d9b98a" : woodLook(look.woodId).base;
  const kit: ShapeKit = {
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
        <LightDefs id={id} />
        <filter id={`${id}-shade`}>
          <feComponentTransfer>
            <feFuncR type="linear" slope={0.62} />
            <feFuncG type="linear" slope={0.6} />
            <feFuncB type="linear" slope={0.6} />
          </feComponentTransfer>
        </filter>
      </defs>
      {backdrop}
      <ellipse
        cx={threeQuarter ? 214 : 200}
        cy={270}
        rx={threeQuarter ? 170 : 150}
        ry={threeQuarter ? 18 : 13}
        fill={`url(#${id}-floor-shadow)`}
      />
      {threeQuarter ? (
        <g transform="translate(16 -10)" filter={`url(#${id}-shade)`}>
          <PieceShape productId={look.productId} kit={kit} />
        </g>
      ) : null}
      <PieceShape productId={look.productId} kit={kit} />
      {look.frame.kind === "paint" || look.surface.kind === "paint" ? (
        <g className="ww-piece__sheen" aria-hidden="true">
          <PieceShape
            productId={look.productId}
            kit={lightKit(
              kit,
              look.frame.kind === "paint" ? `url(#${id}-sheen-brush)` : "none",
              look.surface.kind === "paint" ? `url(#${id}-sheen-brush)` : "none",
            )}
          />
        </g>
      ) : null}
      <g className="ww-piece__sheen" aria-hidden="true">
        <PieceShape
          productId={look.productId}
          kit={lightKit(kit, `url(#${id}-sheen-side)`, `url(#${id}-sheen-top)`)}
        />
      </g>
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
