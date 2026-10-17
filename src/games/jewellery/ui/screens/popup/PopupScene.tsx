import { restX } from "../../../../../ui/show/revealSteps";
import { priceTagById, type CollectionPiece } from "../../../core";
import type { PriceTagId } from "../../../content/priceTag";
import { HeartPot } from "../../art/HeartPot";
import { PiecePreview } from "../../art/PiecePreview";
import { PopupFront } from "../../art/PopupFront";
import { StandArt } from "../../art/StandArt";

export interface SceneRow {
  readonly piece: CollectionPiece;
  readonly hearts: number;
  readonly tag: PriceTagId;
}

export interface PopupSceneProps {
  readonly rows: readonly SceneRow[];
  readonly plinth: string;
  readonly lineName: string;
  readonly lantern: string;
  readonly shownHearts?: readonly number[] | undefined;
  readonly walkers?: number | undefined;
  readonly label: string;
}

const STAND_Y = 420;

export function PopupScene({
  rows,
  plinth,
  lineName,
  lantern,
  shownHearts,
  walkers = -1,
  label,
}: PopupSceneProps) {
  const count = rows.length;
  return (
    <svg
      className="jb-popup__scene"
      viewBox="0 0 1200 600"
      role="img"
      aria-label={label}
      data-testid="popup-scene"
    >
      <PopupFront lineName={lineName} lantern={lantern}>
        {rows.map((row, index) => {
          const x = 150 + (restX(index, count) / 100) * 900;
          const onPlinth = row.piece.id === plinth;
          return (
            <StandArt key={row.piece.id} x={x} y={STAND_Y} plinth={onPlinth}>
              <svg x={-80} y={-150} width={160} height={150} overflow="visible">
                <PiecePreview source={row.piece.look} title={null} velvet={false} twinkle />
              </svg>
            </StandArt>
          );
        })}
      </PopupFront>
      {rows.map((row, index) => {
        const x = 150 + (restX(index, count) / 100) * 900;
        return (
          <HeartPot
            key={row.piece.id}
            x={x}
            y={548}
            hearts={shownHearts?.[index] ?? row.hearts}
            need={priceTagById(row.tag).hearts}
          />
        );
      })}
      {walkers >= 0
        ? [0, 1, 2, 3].map((index) => {
            const x = ((walkers * 1.3 + index * 0.28) % 1.2) * 1300 - 100;
            return (
              <g key={index} transform={`translate(${x} 500)`} opacity={0.8} aria-hidden="true">
                <circle cx={0} cy={-120} r={22} fill="#2a1c30" />
                <path d="M-30 0 L-24 -90 Q0 -110 24 -90 L30 0 Z" fill="#2a1c30" />
                <path d="M18 -70 L40 -40" stroke="#2a1c30" strokeWidth={8} strokeLinecap="round" />
                <path
                  d="M40 -40 C34 -48 40 -54 46 -48 C52 -54 58 -48 52 -40 L46 -34 Z"
                  fill="#e8789c"
                  transform={`translate(0 ${Math.sin(walkers * 30 + index) * 6})`}
                />
              </g>
            );
          })
        : null}
    </svg>
  );
}
