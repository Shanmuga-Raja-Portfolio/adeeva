import { useCallback, useState } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { canChooseRunway, seasonTheme, type Action, type GameState } from "../../../core";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { SetAsideDialog } from "../craft/SetAsideDialog";
import { CollectionBoard } from "./CollectionBoard";
import { RunwayPlanner } from "./RunwayPlanner";
import { RunwayShow } from "./RunwayShow";
import { ShowResults } from "./ShowResults";
import { themeAccentStyle } from "./themeAccent";
import "./label.css";

export interface LabelFlowProps {
  state: GameState;
  dispatch: (action: Action) => boolean;
  onExit: () => void;
  onOpenCraft: () => void;
}

type LabelView = "board" | "plan" | "show" | "results";

export function LabelFlow({ state, dispatch, onExit, onOpenCraft }: LabelFlowProps) {
  const toast = useToast();
  const season = state.season;
  const [view, setView] = useState<LabelView>(() => (season?.result != null ? "results" : "board"));
  const [settingAside, setSettingAside] = useState(false);
  const go = useCallback((next: LabelView) => {
    setView(next);
    window.scrollTo(0, 0);
  }, []);
  const toResults = useCallback(() => go("results"), [go]);

  if (season === null) {
    return (
      <main className="ad-label-empty">
        <Card eyebrow="Collection board" title="No season yet">
          <p>Your label has no show on the calendar right now.</p>
          <Button variant="secondary" onClick={onExit}>
            Back to studio
          </Button>
        </Card>
      </main>
    );
  }

  const theme = seasonTheme(season);
  const result = season.result;
  const runway = season.runway;
  const showing = (view === "show" || view === "results") && result !== null && runway !== null;
  const current: LabelView = showing ? view : view === "plan" && canChooseRunway(state).ok ? "plan" : "board";

  const design = (index: number) => {
    if (!dispatch({ type: "startLook", lookIndex: index })) return;
    toast(`Look ${index + 1} is on your cutting table.`);
    onOpenCraft();
  };

  const nextSeason = (themeId: string) => {
    if (!dispatch({ type: "startNextSeason", themeId })) return;
    go("board");
    toast("A new season begins. Fresh pages on the board!");
  };

  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "abandonRun" })) toast("The dress is set aside. Your work table is clear.", "info");
  };

  return (
    <div className="ad-label" style={themeAccentStyle(theme)} data-theme-id={theme.id}>
      {current === "board" ? (
        <CollectionBoard
          state={state}
          season={season}
          theme={theme}
          onExit={onExit}
          onDesign={design}
          onContinueLook={onOpenCraft}
          onSetAside={() => setSettingAside(true)}
          onPlan={() => go("plan")}
          onResults={() => go("results")}
          onReplay={() => go("show")}
        />
      ) : null}
      {current === "plan" ? (
        <RunwayPlanner
          state={state}
          season={season}
          theme={theme}
          dispatch={dispatch}
          onBack={() => go("board")}
          onStage={() => go("show")}
        />
      ) : null}
      {current === "show" && result !== null && runway !== null ? (
        <RunwayShow
          state={state}
          season={season}
          theme={theme}
          runway={runway}
          result={result}
          onDone={toResults}
        />
      ) : null}
      {current === "results" && result !== null ? (
        <ShowResults
          state={state}
          season={season}
          theme={theme}
          result={result}
          onBoard={() => go("board")}
          onReplay={() => go("show")}
          onExit={onExit}
          onNextSeason={nextSeason}
        />
      ) : null}
      <SetAsideDialog
        run={state.activeRun}
        open={settingAside}
        onConfirm={setAside}
        onClose={() => setSettingAside(false)}
      />
    </div>
  );
}
