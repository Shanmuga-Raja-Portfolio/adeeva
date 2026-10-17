import { type CSSProperties, useMemo } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { colourById } from "../../../../../engine/palette";
import { useSettings } from "../../../../../studio/SettingsContext";
import { MUSIC_MOODS } from "../../../../../engine/musicMood";
import { easeOut, window01 } from "../../../../../ui/kit/easing";
import { ShowHud } from "../../../../adeeva/ui/screens/label/ShowHud";
import { ShowTitleCard } from "../../../../adeeva/ui/screens/label/ShowTitleCard";
import { StageFigures, type CarriedWalker } from "../../../../adeeva/ui/screens/label/StageFigures";
import { stageShot } from "../../../../adeeva/ui/screens/label/stageShot";
import { sceneLabel, type ShowMoment } from "../../../../../ui/show/showTimeline";
import { useShowPlayback } from "../../../../../ui/show/useShowPlayback";
import "../../../../../ui/show/show.css";
import "../../../../adeeva/ui/screens/label/runwayShow.css";
import type { SeasonDef } from "../../../content/season";
import { SWAP_NEIGHBOURS } from "../../../content/swapNeighbour";
import { recipeById, storyCardsFor, type RackPiece, type Showcase, type StoryCard } from "../../../core";
import { pieceCloth } from "../../art/findCloth";
import { HallBackdrop } from "../../art/HallBackdrop";
import { ProductPreview } from "../../art/ProductPreview";
import { StoryCardArt } from "./StoryCardArt";

export interface HallShowProps {
  readonly showcase: Showcase;
  readonly season: SeasonDef;
  readonly seasonNumber: number;
  readonly designerName: string;
  readonly designerLook: AvatarLook;
  readonly rollingRails: boolean;
  readonly onDone: () => void;
}

interface Volunteer {
  readonly piece: RackPiece;
  readonly look: AvatarLook;
  readonly card: StoryCard;
  readonly position: number;
  readonly role: string;
}

function roleOf(position: number, count: number): string {
  if (count === 1) return "The whole show";
  if (position === 0) return "Opener";
  if (position === count - 1) return "Closer";
  return "Middle";
}

const WORN_TOPS: readonly string[] = ["remade-top", "remade-pinafore", "garden-apron"];
const WORN_SKIRTS: readonly string[] = ["remade-skirt"];

function pieceArt(piece: RackPiece) {
  return (
    <ProductPreview
      design={piece.design}
      cloth={pieceCloth(piece.id, piece.cloth)}
      finishes={piece.finishes}
      title={recipeById(piece.recipeId).name}
      base={null}
    />
  );
}

function wornOrHeld(piece: RackPiece) {
  if (WORN_TOPS.includes(piece.recipeId))
    return (
      <svg x={44} y={84} width={312} height={312} viewBox="0 0 400 400">
        {pieceArt(piece)}
      </svg>
    );
  if (WORN_SKIRTS.includes(piece.recipeId))
    return (
      <svg x={20} y={190} width={360} height={360} viewBox="0 0 400 400">
        {pieceArt(piece)}
      </svg>
    );
  return (
    <svg x={86} y={206} width={250} height={250} viewBox="0 0 400 400">
      {pieceArt(piece)}
    </svg>
  );
}

function carriedArt(piece: RackPiece, rollingRails: boolean) {
  if (!rollingRails) return wornOrHeld(piece);
  const preview = (
    <svg x={60} y={190} width={280} height={280} viewBox="0 0 400 400">
      <ProductPreview
        design={piece.design}
        cloth={pieceCloth(piece.id, piece.cloth)}
        finishes={piece.finishes}
        title={recipeById(piece.recipeId).name}
      />
    </svg>
  );
  return (
    <g>
      <path
        d="M52 150 V700 M348 150 V700 M40 150 H360"
        stroke="#8a8f99"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path d="M40 700 H360" stroke="#6b5235" strokeWidth={12} strokeLinecap="round" />
      {[60, 340].map((x) => (
        <circle key={x} cx={x} cy={724} r={22} fill="#3a3a40" stroke="#c9a227" strokeWidth={5} />
      ))}
      {preview}
    </g>
  );
}

function Caption({
  moment,
  cast,
  banner,
}: {
  readonly moment: ShowMoment;
  readonly cast: readonly Volunteer[];
  readonly banner: string;
}) {
  const kind = moment.segment.kind;
  if (kind === "walk") {
    const walker = cast[moment.segment.walk];
    if (walker === undefined) return null;
    return (
      <div className="ad-show-caption" data-testid="show-caption">
        <span className="ad-show-caption__count">
          Piece {walker.position + 1} of {cast.length} · {walker.role}
        </span>
        <span className="ad-show-caption__title">{recipeById(walker.piece.recipeId).name}</span>
        <span className="ad-show-caption__detail">The hall claps for every piece</span>
      </div>
    );
  }
  if (kind === "finale")
    return (
      <div className="ad-show-caption ad-show-caption--centre" data-testid="show-caption">
        <span className="ad-show-caption__count">All together now</span>
        <span className="ad-show-caption__title">{banner}</span>
      </div>
    );
  if (kind === "bow")
    return (
      <div className="ad-show-caption ad-show-caption--centre" data-testid="show-caption">
        <span className="ad-show-caption__count">The maker takes a bow</span>
        <span className="ad-show-caption__title">Thank you, Larkspur!</span>
      </div>
    );
  return null;
}

function HallFrame({
  moment,
  cast,
  props,
  still,
  opacity,
  palette,
}: {
  readonly moment: ShowMoment;
  readonly cast: readonly Volunteer[];
  readonly props: HallShowProps;
  readonly still: boolean;
  readonly opacity: number;
  readonly palette: readonly string[];
}) {
  const kind = moment.segment.kind;
  const shot = stageShot(
    moment,
    cast,
    props.showcase.result.overall,
    still,
    (walker) => walker.piece.quality,
  );
  const sceneT = still ? 0.62 : moment.t;
  const walker = kind === "walk" ? (cast[moment.segment.walk] ?? null) : null;
  const cardShown =
    walker === null
      ? 0
      : still
        ? 1
        : easeOut(window01(moment.t, 0.32, 0.42)) * (1 - window01(moment.t, 0.7, 0.8));
  return (
    <div className="ad-show__frame" style={{ opacity }}>
      {kind === "title" ? (
        <ShowTitleCard
          t={moment.t}
          seasonNumber={props.seasonNumber}
          themeName={props.season.banner}
          venue="Larkspur Hall"
          designer={props.designerName}
          still={still}
        />
      ) : (
        <div className="ad-show__stage">
          <HallBackdrop
            banner={props.season.banner}
            palette={palette}
            light={props.showcase.plan.light}
            className="ad-show__runway"
          />
          <StageFigures
            shot={shot}
            sceneT={sceneT}
            designer={props.designerLook}
            hearts="#e57a8f"
            petalColours={palette}
            carry={(entry: Volunteer): CarriedWalker => ({
              look: entry.look,
              art: carriedArt(entry.piece, props.rollingRails),
            })}
          />
          <div className="ad-show__dark" style={{ opacity: shot.darkness }} />
        </div>
      )}
      {walker !== null && cardShown > 0 ? (
        <div
          className="tf-show-card"
          style={{ opacity: cardShown, transform: `translateY(${((1 - cardShown) * 16).toFixed(1)}px)` }}
          data-testid="show-story-card"
        >
          <StoryCardArt piece={walker.piece} card={walker.card} />
        </div>
      ) : null}
      <Caption moment={moment} cast={cast} banner={props.season.banner} />
    </div>
  );
}

export function HallShow(props: HallShowProps) {
  const { showcase, season, onDone } = props;
  const { reducedMotion } = useSettings();
  const cast = useMemo<Volunteer[]>(
    () =>
      showcase.pieces.map((piece, position) => {
        const cards = storyCardsFor(piece);
        const chosen = showcase.plan.cards[piece.id];
        return {
          piece,
          look: SWAP_NEIGHBOURS[(position * 3 + 1) % SWAP_NEIGHBOURS.length]?.look ?? props.designerLook,
          card: cards.find((card) => card.id === chosen) ??
            cards[cards.length - 1] ?? { id: "fresh", findId: null, line: "A fresh start" },
          position,
          role: roleOf(position, showcase.pieces.length),
        };
      }),
    [showcase, props.designerLook],
  );
  const { segments, elapsed, moment, frames } = useShowPlayback(cast.length, reducedMotion, onDone);
  const palette = season.palette.map((id) => colourById(id).hex);
  const moodName = MUSIC_MOODS.find((mood) => mood.id === showcase.plan.mood)?.name ?? "Music";

  const accent = colourById(season.palette[0] ?? "blush").hex;
  return (
    <div
      className="ad-show tf-show"
      role="region"
      aria-label={`${season.banner} showcase in Larkspur Hall`}
      data-testid="hall-show"
      data-scene={sceneLabel(moment.segment)}
      style={{ "--show-glow": accent, "--show-accent": accent } as CSSProperties}
    >
      <div className="ad-show__screen">
        {frames.map((frame) => (
          <HallFrame
            key={frame.moment.index}
            moment={frame.moment}
            cast={cast}
            props={props}
            still={reducedMotion}
            opacity={frame.opacity}
            palette={palette}
          />
        ))}
      </div>
      <ShowHud
        segments={segments}
        moment={moment}
        elapsed={elapsed}
        moodName={moodName}
        playing={!reducedMotion}
        skipLabel="Skip to the panels ›"
        skipTestId="skip-show"
        focusSkip
        onSkip={onDone}
      />
    </div>
  );
}
