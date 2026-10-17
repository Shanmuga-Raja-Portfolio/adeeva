import { Card } from "../../../../../ui/kit/Card";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { LaunchThemeId } from "../../../content/launchTheme";
import { seasonDayOf, type GameState } from "../../../core";
import type { PlayView } from "../../jewelleryRoute";
import { GarlandCard } from "./GarlandCard";
import { LineCard } from "./LineCard";
import { LineDrawerCard } from "./LineDrawerCard";
import { ThemeCard } from "./ThemeCard";
import "./loft.css";

export interface LoftPanelProps {
  readonly state: GameState;
  readonly onOpen: (view: PlayView) => void;
  readonly onPickTheme: (event: ClickLike, themeId: LaunchThemeId) => void;
  readonly onRest: (event: ClickLike) => void;
  readonly onStartPiece: (event: ClickLike, slot: number) => void;
}

function SeasonCard({ state }: { readonly state: GameState }) {
  const collection = state.collection;
  if (collection === null) return null;
  const waiting = seasonDayOf(collection, state.calendar.day) === null;
  return (
    <Card
      tone="sage"
      eyebrow={`Season ${collection.seasonNumber}`}
      title={waiting ? "The loft is getting ready" : "The line is resting"}
      className="jb-hub-card"
      data-testid="line-waiting"
    >
      <p className="jb-muted">
        {waiting
          ? `Season ${collection.seasonNumber} opens on day ${collection.seasonStartDay}, at the start of the week. Keep making orders until then!`
          : "No collection, Launch or Pop-up this season. Market Day still runs and the rent is bench rent only."}
      </p>
    </Card>
  );
}

export function LoftPanel({ state, onOpen, onPickTheme, onRest, onStartPiece }: LoftPanelProps) {
  const collection = state.collection;
  if (state.career !== "collection" || collection === null) return null;
  const waiting = seasonDayOf(collection, state.calendar.day) === null || collection.rested;
  return (
    <>
      {waiting ? (
        <SeasonCard state={state} />
      ) : collection.themeId === null ? (
        <ThemeCard state={state} collection={collection} onPick={onPickTheme} onRest={onRest} />
      ) : (
        <LineCard state={state} collection={collection} onOpen={onOpen} onStartPiece={onStartPiece} />
      )}
      <LineDrawerCard collection={collection} />
      <GarlandCard state={state} />
    </>
  );
}
