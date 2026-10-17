import { useSvgId } from "../../../../../ui/art/useSvgId";
import { colourById } from "../../../../../engine/palette";
import {
  hangingPieces,
  offersFor,
  rackHooks,
  recipeById,
  signById,
  type GameState,
  type OfferView,
  type RackPiece,
} from "../../../core";
import { BoutiqueBackdrop } from "../../art/BoutiqueBackdrop";
import { ChalkSign } from "../../art/ChalkSign";
import { DressForm } from "../../art/DressForm";
import { FabricCrate } from "../../art/FabricCrate";
import { pieceCloth } from "../../art/findCloth";
import { MarketCounter } from "../../art/MarketCounter";
import { MarketDog } from "../../art/MarketDog";
import { OwnStall, OwnStallDefs } from "../../art/OwnStall";
import { Passersby, type Walker } from "../../art/Passersby";
import { ProductPreview } from "../../art/ProductPreview";
import { SceneLight } from "../../art/SceneLight";
import { StallBackdrop } from "../../art/StallBackdrop";
import { WantBubble } from "../../art/WantBubble";
import { SceneFigure, type Spot } from "../../art/SceneFigure";

export interface HubSceneProps {
  readonly state: GameState;
  readonly className?: string | undefined;
}

const WIDTH = 900;
const HEIGHT = 540;
const SKY = 100;
const STALL_LEFT = 250;
const STALL_RIGHT = 650;
const RAIL_Y = 150;
const RAIL_SLOTS = [310, 395, 480, 565];
const WINDOW_SLOTS = [150, 262, 374];
const STACKS = ["#8fcfb2", "#f6d36b", "#e57a8f", "#7b7fd1", "#f08a3c"];

const STALL_VISITORS: readonly Spot[] = [
  { x: 724, feet: 428, size: 290, pose: "wave", lean: -3, flip: true, far: false },
  { x: 112, feet: 470, size: 316, pose: "point", lean: 3, flip: false, far: false },
  { x: 846, feet: 400, size: 228, pose: "chat", lean: 2, flip: true, far: true },
];

const SHOP_VISITORS: readonly Spot[] = [
  { x: 96, feet: 476, size: 316, pose: "point", lean: 2.5, flip: false, far: false },
  { x: 800, feet: 466, size: 300, pose: "chat", lean: -2.5, flip: true, far: false },
  { x: 688, feet: 404, size: 222, pose: "graceful", lean: 2, flip: true, far: true },
];

const STALL_WALKERS: readonly Walker[] = [
  { x: 214, y: 330, scale: 0.62, coat: "#9bb7a2", hair: "#3d2516", bag: "#e57a8f", facing: 1 },
  { x: 664, y: 336, scale: 0.58, coat: "#b7a8cf", hair: "#8c3a1e", bag: "#f6d36b", facing: -1 },
  { x: 760, y: 326, scale: 0.5, coat: "#d9a28b", hair: "#1b1416", bag: "#8fcfb2", facing: 1 },
];

const SHOP_WALKERS: readonly Walker[] = [
  { x: 40, y: 410, scale: 0.6, coat: "#7a8fb0", hair: "#6a4026", bag: "#f08a3c", facing: 1 },
  { x: 880, y: 404, scale: 0.56, coat: "#d9a28b", hair: "#1b1416", bag: "#8fcfb2", facing: -1 },
];

function wanted(view: OfferView) {
  return view.offer.brief.recipes[0] ?? null;
}

function Hanging({
  piece,
  x,
  y,
  size,
  filter,
}: {
  readonly piece: RackPiece;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly filter: string;
}) {
  return (
    <svg x={x - size / 2} y={y} width={size} height={size} filter={filter}>
      <ProductPreview
        design={piece.design}
        cloth={pieceCloth(piece.id, piece.cloth)}
        finishes={piece.finishes}
        title={recipeById(piece.recipeId).name}
      />
    </svg>
  );
}

function drapeOf(pieces: readonly RackPiece[]): string {
  const colour = pieces[0]?.colours[0];
  return colour === undefined ? "#7b7fd1" : colourById(colour).hex;
}

export function HubScene({ state, className }: HubSceneProps) {
  const id = useSvgId("hub-scene");
  const boutique = state.boutique;
  const visitors = offersFor(state).slice(0, 3);
  const all = hangingPieces(state);
  const player = state.profile;
  const stall = boutique === null;
  const pieces = all.slice(0, stall ? RAIL_SLOTS.length : WINDOW_SLOTS.length);
  const hooks = Math.min(rackHooks(state), RAIL_SLOTS.length);
  const spots = stall ? STALL_VISITORS : SHOP_VISITORS;
  const crowd = visitors.flatMap((view, index) => {
    const spot = spots[index];
    return spot === undefined ? [] : [{ view, spot, index }];
  });
  const byDepth = [...crowd].sort((a, b) => a.spot.feet - b.spot.feet);
  return (
    <svg
      className={className ? `tf-scene ${className}` : "tf-scene"}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <OwnStallDefs id={id} />
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.45" r="0.78">
          <stop offset="0.62" stopColor="#3b2a1c" stopOpacity={0} />
          <stop offset="1" stopColor="#3b2a1c" stopOpacity={0.36} />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe4a8" stopOpacity={0.75} />
          <stop offset="1" stopColor="#ffe4a8" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6e2" stopOpacity={0.5} />
          <stop offset="0.7" stopColor="#fff6e2" stopOpacity={0.12} />
          <stop offset="1" stopColor="#fff6e2" stopOpacity={0} />
        </linearGradient>
        <filter id={`${id}-near`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={1.3} />
        </filter>
      </defs>
      {stall ? (
        <StallBackdrop view="190 50 900 540" />
      ) : (
        <BoutiqueBackdrop
          view="150 60 1000 600"
          signName={signById(boutique.signId).name}
          windowColours={[]}
        />
      )}
      <rect width={WIDTH} height={HEIGHT * 0.66} fill={`url(#${id}-haze)`} />
      <Passersby walkers={stall ? STALL_WALKERS : SHOP_WALKERS} />
      <g transform={`translate(0 ${SKY})`}>
        {stall ? (
          <>
            <OwnStall
              id={id}
              sign={`${player.name}'s Flips`}
              left={STALL_LEFT}
              right={STALL_RIGHT}
              floor={404}
              rail={RAIL_Y}
              bareHooks={RAIL_SLOTS.slice(pieces.length, Math.max(hooks, pieces.length))}
            />
            {pieces.map((piece, index) => (
              <Hanging
                key={piece.id}
                piece={piece}
                x={RAIL_SLOTS[index] ?? 0}
                y={RAIL_Y - 30}
                size={118}
                filter={`url(#${id}-soft)`}
              />
            ))}
            <SceneFigure
              look={player.look}
              spot={{ x: 590, feet: 404, size: 300, pose: "present", lean: -1.5, flip: false, far: false }}
              name={player.name}
              delay={600}
            />
            <MarketCounter
              x={STALL_LEFT + 8}
              y={318}
              width={STALL_RIGHT - STALL_LEFT - 16}
              cloth="#8fcfb2"
              stacks={STACKS}
            />
            <DressForm x={210} y={196} scale={0.86} drape={drapeOf(pieces)} trim="#f6d36b" />
            <ChalkSign x={318} y={430} scale={0.74} lines={["Fresh flips!", "Loved again", "fair prices"]} />
            <MarketDog x={480} y={432} scale={0.66} />
          </>
        ) : (
          <>
            <ellipse cx={262} cy={310} rx={230} ry={70} fill={`url(#${id}-glow)`} />
            {pieces.map((piece, index) => (
              <Hanging
                key={piece.id}
                piece={piece}
                x={WINDOW_SLOTS[index] ?? 0}
                y={270}
                size={112}
                filter={`url(#${id}-soft)`}
              />
            ))}
            <SceneFigure
              look={player.look}
              spot={{ x: 560, feet: 446, size: 262, pose: "present", lean: -1.5, flip: false, far: false }}
              name={player.name}
              delay={600}
            />
          </>
        )}
        {byDepth.map(({ view, spot, index }) => (
          <SceneFigure
            key={view.offer.id}
            look={view.client.look}
            spot={spot}
            name={view.client.name}
            delay={index * 900}
          />
        ))}
        <g filter={`url(#${id}-near)`}>
          {stall ? (
            <FabricCrate
              x={40}
              y={440}
              scale={0.8}
              folds={["#e57a8f", "#f6d36b", "#8fcfb2"]}
              roll="#7b7fd1"
            />
          ) : (
            <FabricCrate
              x={862}
              y={440}
              scale={0.8}
              folds={["#7b7fd1", "#fff4e2", "#e57a8f"]}
              roll="#f6d36b"
            />
          )}
        </g>
        {crowd.map(({ view, spot, index }) => {
          const right = spot.x > WIDTH / 2;
          return (
            <WantBubble
              key={view.offer.id}
              x={spot.x + (right ? -spot.size * 0.25 : spot.size * 0.25)}
              y={spot.feet - spot.size * 0.9}
              recipeId={wanted(view)}
              tail={right ? "right" : "left"}
              scale={spot.far ? 0.72 : 0.86}
              delay={index * 400}
            />
          );
        })}
      </g>
      <SceneLight id={id} width={WIDTH} height={HEIGHT} warmth={stall ? "#ffe9b8" : "#fff1d6"} />
      <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
