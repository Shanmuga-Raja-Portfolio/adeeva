import { useState } from "react";
import type { RunwayLightId } from "../../../content/runwayLight";
import type { MusicMoodId } from "../../../../../engine/musicMood";
import type { ShowThemeDef } from "../../../content/showTheme";
import { canStageRunway, type Action, type GameState, type LabelSeason } from "../../../core";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { BoardTopBar } from "./BoardTopBar";
import { LightPicker } from "./LightPicker";
import { MoodPicker } from "./MoodPicker";
import { showCast } from "./showCast";
import { StagePreview } from "./StagePreview";
import { strongestLooks } from "./strongestLooks";
import { WalkOrder } from "./WalkOrder";
import "./planner.css";

export interface RunwayPlannerProps {
  state: GameState;
  season: LabelSeason;
  theme: ShowThemeDef;
  dispatch: (action: Action) => boolean;
  onBack: () => void;
  onStage: () => void;
}

export function RunwayPlanner({ state, season, theme, dispatch, onBack, onStage }: RunwayPlannerProps) {
  const { reducedMotion } = useSettings();
  const [order, setOrder] = useState<number[]>(() => [...(season.runway?.order ?? [0, 1, 2])]);
  const [mood, setMood] = useState<MusicMoodId | null>(season.runway?.mood ?? null);
  const [light, setLight] = useState<RunwayLightId | null>(season.runway?.light ?? null);
  const strongest = strongestLooks(season);
  const allEqual = strongest.length === season.looks.length;
  const cast = showCast(season, order);
  const closer = order[order.length - 1] ?? 0;
  const opener = season.looks[order[0] ?? 0]?.evaluation.score ?? 0;
  const middle = season.looks[order[1] ?? 0]?.evaluation.score ?? 0;
  const stageCheck = canStageRunway(state);

  const commit = (nextOrder: number[], nextMood: MusicMoodId | null, nextLight: RunwayLightId | null) => {
    if (nextMood === null || nextLight === null) return;
    dispatch({ type: "chooseRunway", order: nextOrder, mood: nextMood, light: nextLight });
  };

  const changeOrder = (next: number[]) => {
    setOrder(next);
    commit(next, mood, light);
  };

  const changeMood = (next: MusicMoodId) => {
    setMood(next);
    commit(order, next, light);
  };

  const changeLight = (next: RunwayLightId) => {
    setLight(next);
    commit(order, mood, next);
  };

  const stage = () => {
    if (dispatch({ type: "stageRunway" })) onStage();
  };

  const reason =
    mood === null && light === null
      ? "Pick the music and the lights first."
      : mood === null
        ? "Pick the music first."
        : light === null
          ? "Pick the lights first."
          : stageCheck.reasons[0];

  return (
    <div className="ad-planner ad-screen" data-testid="runway-planner">
      <BoardTopBar state={state} title="Runway planner" backLabel="Collection board" onBack={onBack} />
      <main className="ad-planner__main">
        <header className="ad-planner__intro">
          <span className="ad-planner__eyebrow">
            {theme.name} · {season.venue}
          </span>
          <h1>Plan the runway</h1>
          <p>
            Every show tells a story. Choose who walks first, what the room hears and how the stage glows.
          </p>
        </header>
        <div className="ad-planner__layout">
          <div className="ad-planner__preview">
            <StagePreview
              cast={cast}
              light={light}
              mood={mood}
              venue={season.venue}
              reducedMotion={reducedMotion}
            />
          </div>
          <div className="ad-planner__controls">
            <section className="ad-planner__block" aria-labelledby="walk-title">
              <h2 id="walk-title">Walk order</h2>
              <p className="ad-planner__help">
                Drag a look to a new spot, tap two looks to swap them, or use the arrows.
              </p>
              <WalkOrder
                season={season}
                order={order}
                strongest={allEqual ? [] : strongest}
                onChange={changeOrder}
              />
              <ul className="ad-planner__tips">
                <li className={strongest.includes(closer) ? "is-met" : ""}>
                  {allEqual
                    ? "All three looks are equally strong, so the show ends on a high whichever closes."
                    : strongest.includes(closer)
                      ? "Your strongest look closes the show. The room will remember it."
                      : `Shows end on a high: Look ${(strongest[0] ?? 0) + 1} is your strongest and would make a stunning closer.`}
                </li>
                <li className={opener >= middle ? "is-met" : ""}>
                  {opener >= middle
                    ? "A confident opener sets the tone."
                    : "Open with more confidence than the middle walk."}
                </li>
              </ul>
            </section>
            <section className="ad-planner__block" aria-labelledby="music-title">
              <h2 id="music-title">Music</h2>
              <MoodPicker theme={theme} value={mood} onChange={changeMood} />
            </section>
            <section className="ad-planner__block" aria-labelledby="light-title">
              <h2 id="light-title">Lighting</h2>
              <LightPicker value={light} onChange={changeLight} />
            </section>
            <div className="ad-planner__go">
              <Button size="lg" icon="sparkle" block disabledReason={reason} showReason onClick={stage}>
                Raise the curtain
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
