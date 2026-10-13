import type { ShowThemeDef } from "../../../content/showTheme";
import { LOOKS_PER_SEASON, type GameState, type LabelSeason } from "../../../core";
import { BoardTopBar } from "./BoardTopBar";
import { CohesionCard } from "./CohesionCard";
import { LookSlot } from "./LookSlot";
import { RunwayCallout } from "./RunwayCallout";
import { SeasonHeader } from "./SeasonHeader";
import "./board.css";

export interface CollectionBoardProps {
  state: GameState;
  season: LabelSeason;
  theme: ShowThemeDef;
  onExit: () => void;
  onDesign: (index: number) => void;
  onContinueLook: () => void;
  onSetAside: () => void;
  onPlan: () => void;
  onResults: () => void;
  onReplay: () => void;
}

export function CollectionBoard({
  state,
  season,
  theme,
  onExit,
  onDesign,
  onContinueLook,
  onSetAside,
  onPlan,
  onResults,
  onReplay,
}: CollectionBoardProps) {
  return (
    <div className="ad-board ad-screen" data-testid="collection-board">
      <BoardTopBar state={state} title="Collection board" backLabel="Back to studio" onBack={onExit} />
      <main className="ad-board__main">
        <SeasonHeader state={state} season={season} theme={theme} />
        <div className="ad-board__grid">
          <section className="ad-board__looks" aria-label="Collection looks">
            {Array.from({ length: LOOKS_PER_SEASON }, (_, index) => (
              <LookSlot
                key={index}
                state={state}
                season={season}
                theme={theme}
                index={index}
                onDesign={onDesign}
                onContinue={onContinueLook}
                onSetAside={onSetAside}
              />
            ))}
          </section>
          <aside className="ad-board__side">
            <RunwayCallout
              state={state}
              season={season}
              onPlan={onPlan}
              onResults={onResults}
              onReplay={onReplay}
            />
            <CohesionCard season={season} theme={theme} />
          </aside>
        </div>
      </main>
    </div>
  );
}
