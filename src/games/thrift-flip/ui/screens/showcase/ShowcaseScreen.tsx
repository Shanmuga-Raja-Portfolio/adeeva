import { useState } from "react";
import { seasonTheme, type Action, type GameState } from "../../../core";
import { HallShow } from "./HallShow";
import { ShowcasePlanner } from "./ShowcasePlanner";
import { ShowcaseResults } from "./ShowcaseResults";
import "./showcase.css";

export interface ShowcaseScreenProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

type Phase = "plan" | "show" | "results";

export function ShowcaseScreen({ state, dispatch, onExit }: ShowcaseScreenProps) {
  const boutique = state.boutique;
  const season = seasonTheme(state);
  const [phase, setPhase] = useState<Phase>(() => (boutique?.season.showcase === null ? "plan" : "results"));
  if (boutique === null || season === null) return null;
  const showcase = boutique.season.showcase;
  if (showcase === null || phase === "plan")
    return (
      <ShowcasePlanner
        state={state}
        season={season}
        dispatch={dispatch}
        onStaged={() => setPhase("show")}
        onExit={onExit}
      />
    );
  if (phase === "show")
    return (
      <HallShow
        showcase={showcase}
        season={season}
        seasonNumber={boutique.season.number}
        designerName={state.profile.name}
        designerLook={state.profile.look}
        rollingRails={state.upgrades.includes("rolling-rails")}
        onDone={() => setPhase("results")}
      />
    );
  return (
    <ShowcaseResults showcase={showcase} season={season} onReplay={() => setPhase("show")} onExit={onExit} />
  );
}
