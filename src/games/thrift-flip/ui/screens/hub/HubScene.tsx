import { memo } from "react";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import type { AvatarLook } from "../../../../../engine/avatar";
import { colourById } from "../../../../../engine/palette";
import {
  findById,
  hangingPieces,
  offersFor,
  rackHooks,
  recipeById,
  type GameState,
  type OfferView,
  type OwnedFind,
  type RackPiece,
} from "../../../core";
import { BoutiqueRoom } from "../../art/BoutiqueRoom";
import { DressForm } from "../../art/DressForm";
import { FabricCrate } from "../../art/FabricCrate";
import { FindArt } from "../../art/FindArt";
import { pieceCloth } from "../../art/findCloth";
import { GarmentRail } from "../../art/GarmentRail";
import { MarketCounter } from "../../art/MarketCounter";
import { MarketDog } from "../../art/MarketDog";
import { OwnStall, OwnStallDefs } from "../../art/OwnStall";
import { Passersby, type Walker } from "../../art/Passersby";
import { ProductPreview } from "../../art/ProductPreview";
import { SceneLight } from "../../art/SceneLight";
import { ScrapBundle } from "../../art/ScrapBundle";
import { ShopCat } from "../../art/ShopCat";
import { ShopCounter } from "../../art/ShopCounter";
import { StallBackdrop } from "../../art/StallBackdrop";
import { StallDressing, StallDressingDefs } from "../../art/StallDressing";
import { WantBubble } from "../../art/WantBubble";
import { SceneFigure, type Spot } from "../../art/SceneFigure";

export interface HubSceneProps {
  readonly state: GameState;
  readonly className?: string | undefined;
}

const WIDTH = 1240;
const HEIGHT = 600;
const LIFT = 54;
const STALL_LEFT = 356;
const STALL_RIGHT = 782;
const RAIL_Y = 150;
const RAIL_SLOTS = [424, 514, 604, 694];
const SHOP_FLOOR = 400;
const SHOP_RAIL = { x: 262, y: 300, width: 262, height: 164, slots: 5 };
const STACKS = ["#8fcfb2", "#f6d36b", "#e57a8f", "#7b7fd1", "#f08a3c"];
const RIBBONS = ["#e57a8f", "#f6d36b", "#7b7fd1", "#8fcfb2"];
const FILLERS = ["#e57a8f", "#8fcfb2", "#f6d36b", "#b9a7dc", "#f0a27a"];

const STALL_VISITORS: readonly Spot[] = [
  {
    x: 206,
    feet: 486,
    size: 316,
    pose: "carry",
    lean: 2.5,
    flip: false,
    far: false,
    build: 1.12,
    bag: "#e57a8f",
    tilt: -5,
  },
  {
    x: 846,
    feet: 474,
    size: 306,
    pose: "browse",
    lean: -2.5,
    flip: true,
    far: false,
    build: 1.1,
    tilt: 6,
    mood: "thinking",
  },
  { x: 86, feet: 392, size: 214, pose: "wave", lean: 2, flip: false, far: true, build: 1.14, tilt: 5 },
];

const SHOP_VISITORS: readonly Spot[] = [
  {
    x: 176,
    feet: 520,
    size: 316,
    pose: "carry-right",
    lean: 2.5,
    flip: false,
    far: false,
    build: 1.12,
    bag: "#7b7fd1",
    tilt: -5,
  },
  {
    x: 662,
    feet: 492,
    size: 296,
    pose: "carry",
    lean: 2.5,
    flip: false,
    far: false,
    build: 1.1,
    bag: "#f08a3c",
    tilt: 6,
    mood: "delighted",
  },
  {
    x: 470,
    feet: 410,
    size: 210,
    pose: "browse",
    lean: -2,
    flip: false,
    talk: "left",
    far: true,
    build: 1.14,
    tilt: 6,
    mood: "thinking",
  },
];

const STALL_BROWSER: Spot = {
  x: 296,
  feet: 404,
  size: 212,
  pose: "browse",
  lean: -2,
  flip: true,
  far: true,
  build: 1.12,
  tilt: 7,
  mood: "thinking",
  accessory: "round-glasses",
};

const BROWSER_LOOK: AvatarLook = {
  skinTone: "honey",
  hairStyle: "short-bob",
  hairColour: "ocean-teal",
  outfit: "dungarees",
};

const STALL_WALKERS: readonly Walker[] = [
  { x: 290, y: 414, scale: 0.5, coat: "#9bb7a2", hair: "#3d2516", bag: "#e57a8f", facing: 1 },
  { x: 940, y: 408, scale: 0.46, coat: "#b7a8cf", hair: "#8c3a1e", bag: "#f6d36b", facing: -1 },
  { x: 1060, y: 414, scale: 0.44, coat: "#d9a28b", hair: "#1b1416", bag: "#8fcfb2", facing: 1 },
];

function wanted(view: OfferView) {
  return view.offer.brief.recipes[0] ?? null;
}

function PieceArt({ piece, size }: { readonly piece: RackPiece; readonly size: number }) {
  return (
    <svg x={-size / 2} y={0} width={size} height={size}>
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

function stockStacks(state: GameState): readonly string[] {
  const colours = state.stock.finds.map((owned) => colourById(findById(owned.findId).colour).hex);
  return [...colours, ...STACKS].slice(0, STACKS.length);
}

function StallBack({ id }: { readonly id: string }) {
  return (
    <>
      <StallBackdrop view="20 90 1240 600" crowd={false} />
      <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-depth)`} />
      <Passersby walkers={STALL_WALKERS} />
      <ellipse cx={550} cy={484} rx={440} ry={74} fill={`url(#${id}-pool)`} />
      <path d="M342 460 L770 460 L690 518 L240 518 Z" fill={`url(#${id}-cast)`} />
    </>
  );
}

function StockArt({ owned }: { readonly owned: OwnedFind }) {
  return (
    <svg x={-50} y={-6} width={100} height={125} overflow="visible">
      <FindArt find={findById(owned.findId)} grade={owned.grade} size={100} />
    </svg>
  );
}

function KraftTag({ tilt }: { readonly tilt: number }) {
  return (
    <g transform={`translate(30 34) rotate(${tilt})`}>
      <path d="M0 -12 V0" stroke="#a07a52" strokeWidth={1.4} />
      <path d="M-10 0 L10 0 L10 22 L0 29 L-10 22 Z" fill="#e8d0a6" stroke="#a07a52" strokeWidth={1.6} />
      <circle cx={0} cy={6} r={2.2} fill="#fff8ec" stroke="#a07a52" strokeWidth={1} />
      <path d="M-5 14 H5 M-4 19 H4" stroke="#b85a17" strokeWidth={1.8} />
    </g>
  );
}

function StallFront({ id, state }: { readonly id: string; readonly state: GameState }) {
  const pieces = hangingPieces(state).slice(0, RAIL_SLOTS.length);
  const hooks = Math.min(rackHooks(state), RAIL_SLOTS.length);
  const stock = state.stock.finds.slice(0, Math.max(0, RAIL_SLOTS.length - pieces.length));
  const filled = pieces.length + stock.length;
  const scraps = state.stock.scraps.slice(0, Math.max(0, RAIL_SLOTS.length - filled));
  const used = filled + scraps.length;
  return (
    <g transform={`translate(0 ${LIFT})`}>
      <OwnStall
        id={id}
        sign={`${state.profile.name}'s Flips`}
        left={STALL_LEFT}
        right={STALL_RIGHT}
        floor={404}
        rail={RAIL_Y}
        bareHooks={RAIL_SLOTS.slice(used, Math.max(hooks, used))}
      />
      <StallDressing id={id} left={STALL_LEFT} right={STALL_RIGHT} top={58} rail={RAIL_Y} floor={404} />
      {pieces.map((piece, index) => (
        <g key={piece.id} transform={`translate(${RAIL_SLOTS[index] ?? 0} ${RAIL_Y - 30})`}>
          <ellipse cx={4} cy={104} rx={34} ry={6} fill="#3b2a1c" opacity={0.14} />
          <PieceArt piece={piece} size={118} />
        </g>
      ))}
      {stock.map((owned, index) => (
        <g key={owned.id} transform={`translate(${RAIL_SLOTS[pieces.length + index] ?? 0} ${RAIL_Y - 14})`}>
          <StockArt owned={owned} />
          <KraftTag tilt={index % 2 === 0 ? -9 : 7} />
        </g>
      ))}
      {scraps.map((scrap, index) => (
        <g key={scrap.id} transform={`translate(${RAIL_SLOTS[filled + index] ?? 0} ${RAIL_Y + 14})`}>
          <ScrapBundle
            cloth={{ id: scrap.id, colour: scrap.colour, material: scrap.material, print: scrap.print }}
            ribbon={RIBBONS[index % RIBBONS.length] ?? "#e57a8f"}
            tilt={index % 2 === 0 ? -4 : 5}
          />
        </g>
      ))}
      <SceneFigure
        look={state.profile.look}
        spot={{
          x: 712,
          feet: 404,
          size: 312,
          pose: "present",
          lean: 2,
          flip: true,
          far: false,
          build: 1.08,
          tilt: -5,
          mood: "delighted",
        }}
        name={state.profile.name}
        delay={600}
      />
      <MarketCounter
        x={STALL_LEFT + 8}
        y={318}
        width={STALL_RIGHT - STALL_LEFT - 16}
        cloth="#8fcfb2"
        stacks={stockStacks(state)}
      />
      <FabricCrate x={430} y={476} scale={0.42} folds={stockStacks(state)} roll="#7b7fd1" />
      <MarketDog x={600} y={448} scale={0.68} />
    </g>
  );
}

function ShopBack({ state }: { readonly state: GameState }) {
  return (
    <>
      <BoutiqueRoom width={WIDTH} height={HEIGHT} floorY={SHOP_FLOOR} />
      <DressForm x={78} y={238} scale={0.92} drape={drapeOf(hangingPieces(state))} trim="#c9a227" />
    </>
  );
}

function ShopFront({ id, state }: { readonly id: string; readonly state: GameState }) {
  const pieces = hangingPieces(state).slice(0, SHOP_RAIL.slots);
  return (
    <>
      <GarmentRail
        {...SHOP_RAIL}
        pieces={pieces.map((piece) => ({ key: piece.id, art: <PieceArt piece={piece} size={96} /> }))}
        fillers={FILLERS}
      />
      <SceneFigure
        look={state.profile.look}
        spot={{
          x: 762,
          feet: 420,
          size: 276,
          pose: "present",
          lean: -2,
          flip: true,
          far: false,
          build: 1.06,
          tilt: -5,
          mood: "delighted",
        }}
        name={state.profile.name}
        delay={600}
      />
      <ShopCounter x={640} y={372} width={210} />
      <ShopCat x={430} y={548} scale={0.62} coat="#e39a52" />
      <ellipse cx={WIDTH / 2} cy={HEIGHT} rx={WIDTH * 0.7} ry={120} fill={`url(#${id}-floorshade)`} />
    </>
  );
}

function Scene({ state, className }: HubSceneProps) {
  const id = useSvgId("hub-scene");
  const stall = state.boutique === null;
  const visitors = offersFor(state).slice(0, 3);
  const spots = stall ? STALL_VISITORS : SHOP_VISITORS;
  const crowd = visitors.flatMap((view, index) => {
    const spot = spots[index];
    return spot === undefined ? [] : [{ view, spot, index }];
  });
  const byDepth = [...crowd].sort((a, b) => a.spot.feet - b.spot.feet);
  const lift = stall ? LIFT : 0;
  return (
    <svg
      className={className ? `tf-scene ${className}` : "tf-scene"}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMinYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <OwnStallDefs id={id} />
        <StallDressingDefs id={id} />
        <radialGradient id={`${id}-vignette`} cx="0.36" cy="0.42" r="0.85">
          <stop offset="0.55" stopColor="#2a1b10" stopOpacity={0} />
          <stop offset="1" stopColor="#2a1b10" stopOpacity={0.5} />
        </radialGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1c8" stopOpacity={0.6} />
          <stop offset="1" stopColor="#fff1c8" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a30" stopOpacity={0} />
          <stop offset="0.55" stopColor="#8a5a30" stopOpacity={0.06} />
          <stop offset="0.75" stopColor="#8a5a30" stopOpacity={0.02} />
          <stop offset="1" stopColor="#5b3a1e" stopOpacity={0.22} />
        </linearGradient>
        <linearGradient id={`${id}-cast`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a1c" stopOpacity={0.24} />
          <stop offset="1" stopColor="#3b2a1c" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-floorshade`} cx="0.5" cy="1" r="0.5">
          <stop offset="0" stopColor="#2a1b10" stopOpacity={0.4} />
          <stop offset="1" stopColor="#2a1b10" stopOpacity={0} />
        </radialGradient>
      </defs>
      {stall ? <StallBack id={id} /> : <ShopBack state={state} />}
      <g transform={`translate(0 ${lift})`}>
        {stall ? (
          <>
            <SceneFigure look={BROWSER_LOOK} spot={STALL_BROWSER} name="A shopper" delay={1500} />
            <WantBubble
              x={STALL_BROWSER.x - 52}
              y={STALL_BROWSER.feet - STALL_BROWSER.size * 0.78}
              recipeId={null}
              tail="right"
              scale={0.5}
              delay={700}
              badge={false}
            />
          </>
        ) : null}
        {byDepth
          .filter(({ spot }) => spot.far)
          .map(({ view, spot, index }) => (
            <SceneFigure
              key={view.offer.id}
              look={view.client.look}
              spot={spot}
              name={view.client.name}
              delay={index * 900}
            />
          ))}
      </g>
      {stall ? <StallFront id={id} state={state} /> : <ShopFront id={id} state={state} />}
      <g transform={`translate(0 ${lift})`}>
        {byDepth
          .filter(({ spot }) => !spot.far)
          .map(({ view, spot, index }) => (
            <SceneFigure
              key={view.offer.id}
              look={view.client.look}
              spot={spot}
              name={view.client.name}
              delay={index * 900}
            />
          ))}
        {crowd.map(({ view, spot, index }) => {
          const right = spot.talk === undefined ? spot.x > 600 : spot.talk === "left";
          return (
            <WantBubble
              key={view.offer.id}
              x={spot.x + (right ? -spot.size * 0.26 : spot.size * 0.26)}
              y={spot.feet - spot.size * 0.7}
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

export const HubScene = memo(Scene);
