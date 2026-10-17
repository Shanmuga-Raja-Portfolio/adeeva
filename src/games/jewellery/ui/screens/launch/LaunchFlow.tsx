import { useEffect, useState } from "react";
import { lateShowPenalty } from "../../../../../engine/showDay";
import { useToast } from "../../../../../studio/ToastContext";
import { POPUP_VISITORS } from "../../../content/popupVisitor";
import {
  canStageLaunch,
  clientById,
  launchDayKind,
  launchStaged,
  launchThemeById,
  lineNameById,
  planIssue,
  type Action,
  type CollectionState,
  type GameState,
  type LaunchPlan,
} from "../../../core";
import type { PlayView } from "../../jewelleryRoute";
import { garlandLights } from "../loft/garlandLights";
import { LoftHeader } from "../loft/LoftHeader";
import { LanternLaunch } from "./LanternLaunch";
import { LaunchBoard } from "./LaunchBoard";
import { LaunchPlanner, type PlanDraft } from "./LaunchPlanner";
import { LaunchResults } from "./LaunchResults";
import "../loft/loft.css";
import "./launch.css";

export interface LaunchFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpen: (view: PlayView) => void;
  readonly onExit: () => void;
}

type LaunchStep = "board" | "planner" | "reveal" | "results";

function startingDraft(state: GameState, collection: CollectionState): PlanDraft {
  const theme = collection.themeId === null ? null : launchThemeById(collection.themeId);
  if (state.profile.difficulty === "relaxed" && theme !== null) {
    const order = [...collection.pieces].sort((a, b) => a.quality - b.quality).map((piece) => piece.id);
    return { order, lantern: theme.lantern, music: theme.music, card: theme.bestCard };
  }
  return { order: collection.pieces.map((piece) => piece.id), lantern: null, music: null, card: null };
}

function asPlan(draft: PlanDraft): LaunchPlan | null {
  if (draft.lantern === null || draft.music === null || draft.card === null) return null;
  return { order: draft.order, lantern: draft.lantern, music: draft.music, card: draft.card };
}

function FlowView({
  state,
  dispatch,
  onOpen,
  onExit,
  collection,
}: LaunchFlowProps & { readonly collection: CollectionState }) {
  const toast = useToast();
  const staged = launchStaged(state, collection);
  const [step, setStep] = useState<LaunchStep>(staged ? "results" : "board");
  const [draft, setDraft] = useState<PlanDraft>(() => startingDraft(state, collection));
  const [replay, setReplay] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);
  const launch = state.launch;
  const result = launch?.result ?? null;
  const themeId = staged && result !== null ? result.themeId : collection.themeId;
  if (launch === null || themeId === null) return null;
  const theme = launchThemeById(themeId);
  const plan = asPlan(draft);
  const check = plan === null ? null : canStageLaunch(state, plan);
  const stageIssue =
    plan === null
      ? draft.lantern === null
        ? "Pick a lantern colour."
        : draft.music === null
          ? "Pick the music."
          : "Pick a story card."
      : (planIssue(collection, plan) ?? (check !== null && !check.ok ? (check.reasons[0] ?? null) : null));
  const late = launchDayKind(state) === "late";
  const storyCorner = collection.storyCorner.flatMap((id) => {
    const person = clientById(id);
    return person === undefined ? [] : [{ name: person.name, look: person.look }];
  });
  const crowd = [
    ...POPUP_VISITORS.slice(0, 4).map((visitor) => ({ name: visitor.name, look: visitor.look })),
    ...storyCorner,
  ];
  const stage = () => {
    if (plan !== null && dispatch({ type: "stageLaunch", ...plan })) setStep("reveal");
  };
  const shown: LaunchStep = (step === "reveal" || step === "results") && result === null ? "board" : step;
  return (
    <main className="jb-launch ad-screen" data-testid="launch-flow" data-step={shown}>
      {shown === "board" || shown === "planner" ? (
        <LoftHeader
          state={state}
          eyebrow={lineNameById(collection.lineNameId).name}
          title="Lantern Night"
          onExit={onExit}
        />
      ) : null}
      {shown === "board" ? (
        <LaunchBoard state={state} collection={collection} theme={theme} onNext={() => setStep("planner")} />
      ) : null}
      {shown === "planner" ? (
        <LaunchPlanner
          collection={collection}
          theme={theme}
          draft={draft}
          relaxed={state.profile.difficulty === "relaxed"}
          latePenalty={late ? lateShowPenalty(true, state.profile.difficulty) : null}
          stageIssue={stageIssue}
          onDraft={setDraft}
          onBack={() => setStep("board")}
          onStage={stage}
        />
      ) : null}
      {shown === "reveal" && result !== null ? (
        <LanternLaunch
          result={result}
          collection={collection}
          theme={theme}
          garland={garlandLights(state)}
          crowd={crowd}
          skippable={replay}
          onDone={() => setStep("results")}
        />
      ) : null}
      {shown === "results" && result !== null ? (
        <LaunchResults
          result={result}
          storyCorner={storyCorner}
          garland={garlandLights(state)}
          spotOffer={launch.spotOffer}
          canReplay={result.plan.order.every((id) => collection.pieces.some((piece) => piece.id === id))}
          popupToday={late}
          onMoveSpot={() => {
            if (dispatch({ type: "moveSpot" })) toast("Next season your line moves to a bigger spot!");
          }}
          onReplay={() => {
            setReplay(true);
            setStep("reveal");
          }}
          onPopup={() => onOpen("popup")}
          onExit={onExit}
        />
      ) : null}
    </main>
  );
}

export function LaunchFlow(props: LaunchFlowProps) {
  const collection = props.state.collection;
  if (collection === null) return null;
  return <FlowView {...props} collection={collection} />;
}
