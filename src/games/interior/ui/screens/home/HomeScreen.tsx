import { useEffect, useRef, useState } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import {
  currentBeat,
  homeStoryById,
  openHouseAlert,
  plotById,
  purseLeft,
  type Action,
  type GameState,
  type OpenHouseAlert,
  type Project,
  type ProjectStage,
} from "../../../core";
import { daySummary } from "../hub/daySummary";
import { DayTransition } from "../hub/DayTransition";
import { OpenHouseDayDialog } from "../larkspur/OpenHouseDayDialog";
import { OpenHouseDue } from "../larkspur/OpenHouseDue";
import { StoryOverlay } from "../story/StoryOverlay";
import { HomeMapStage } from "./HomeMapStage";
import { HomeRooms } from "./HomeRooms";
import { OpenHousePlanner } from "./OpenHousePlanner";
import { PaletteBoard } from "./PaletteBoard";
import "../hub/hub.css";
import "../makeover/makeover.css";
import "../makeover/plan.css";
import "./home.css";

export interface HomeScreenProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
  readonly onOpenRoom: () => void;
  readonly onOpenOpenHouse: () => void;
  readonly onOpenSettings: () => void;
}

export interface HomeStageProps {
  readonly state: GameState;
  readonly project: Project;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpenRoom: () => void;
  readonly onOpenOpenHouse: () => void;
  readonly onEndDay: () => void;
}

const STEPS: readonly {
  readonly id: string;
  readonly label: string;
  readonly stages: readonly ProjectStage[];
}[] = [
  { id: "map", label: "Who lives where", stages: ["map"] },
  { id: "palette", label: "One palette", stages: ["palette"] },
  { id: "rooms", label: "Make the rooms", stages: ["rooms"] },
  { id: "open", label: "Open House", stages: ["planner", "show", "done"] },
];

const TITLES: Readonly<Record<ProjectStage, string>> = {
  map: "Who lives where?",
  palette: "One home palette",
  rooms: "Make every room",
  planner: "Plan the Open House",
  show: "Open the doors",
  done: "Open House done",
};

function StageView(props: HomeStageProps) {
  switch (props.project.stage) {
    case "map":
      return <HomeMapStage {...props} />;
    case "palette":
      return <PaletteBoard {...props} />;
    case "rooms":
      return <HomeRooms {...props} />;
    case "planner":
    case "show":
    case "done":
      return <OpenHousePlanner {...props} />;
  }
}

export function HomeScreen({
  state,
  dispatch,
  onExit,
  onOpenRoom,
  onOpenOpenHouse,
  onOpenSettings,
}: HomeScreenProps) {
  const [ending, setEnding] = useState<GameState | null>(null);
  const [confirming, setConfirming] = useState<OpenHouseAlert | null>(null);
  const shownStage = useRef<ProjectStage | null>(null);
  const project = state.larkspur?.project ?? null;
  const stage = project?.stage ?? null;
  useEffect(() => {
    if (stage === null || shownStage.current === stage) return;
    shownStage.current = stage;
    window.scrollTo({ top: 0 });
    focusHeading();
  }, [stage]);
  if (project === null) return null;
  const plot = plotById(project.plotId);
  const story = homeStoryById(project.storyId);
  const stepIndex = STEPS.findIndex((step) => step.stages.includes(project.stage));
  const beat = ending === null ? currentBeat(state) : null;
  const alert = openHouseAlert(project, state.calendar.day);
  const endDay = () => {
    setConfirming(null);
    const from = state;
    if (dispatch({ type: "endDay" })) setEnding(from);
  };
  const askEndDay = () => (alert === null ? endDay() : setConfirming(alert));
  return (
    <main className="is-home ad-screen" data-testid="home-screen" data-stage={project.stage}>
      <div className="is-home__content" inert={ending !== null || beat !== null}>
        <header className="is-makeover-header is-home__header">
          <Button variant="ghost" icon="back" onClick={onExit} data-testid="home-back">
            Back to the loft
          </Button>
          <div className="is-makeover-header__title">
            <span className="ad-eyebrow">
              No. {plot.number} Larkspur Close · {story.name}
            </span>
            <h1>{TITLES[project.stage]}</h1>
          </div>
          <div className="is-makeover-header__stats">
            <StatChip kind="day" value={state.calendar.day} />
            <span data-testid="home-hours">
              <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
            </span>
            <span data-testid="home-coins">
              <StatChip kind="coins" value={state.coins} />
            </span>
            <span className="is-purse-chip" data-testid="home-purse">
              Purse {purseLeft(project)}
            </span>
            <Button variant="ghost" size="sm" onClick={onOpenSettings}>
              Settings
            </Button>
          </div>
        </header>
        <nav className="is-rail is-home__rail" aria-label="Home steps">
          <ol>
            {STEPS.map((step, index) => (
              <li
                key={step.id}
                className={`is-rail__step is-rail__step--${index === stepIndex ? "current" : index < stepIndex ? "done" : "upcoming"}`}
              >
                <span className="is-rail__button" aria-current={index === stepIndex ? "step" : undefined}>
                  <span className="is-rail__dot" aria-hidden="true">
                    {index < stepIndex ? <Icon name="check" size={14} /> : index + 1}
                  </span>
                  <span className="is-rail__label">{step.label}</span>
                </span>
              </li>
            ))}
          </ol>
          <span className="is-home__due">
            <OpenHouseDue project={project} day={state.calendar.day} />
          </span>
        </nav>
        <StageView
          state={state}
          project={project}
          dispatch={dispatch}
          onOpenRoom={onOpenRoom}
          onOpenOpenHouse={onOpenOpenHouse}
          onEndDay={askEndDay}
        />
      </div>
      {ending !== null ? (
        <DayTransition
          summary={daySummary(ending, state, "rest")}
          onDone={() => setEnding(null)}
          doneLabel="Back to the home"
        />
      ) : null}
      {beat !== null ? <StoryOverlay state={state} dispatch={dispatch} /> : null}
      <OpenHouseDayDialog
        alert={confirming}
        relaxed={state.profile.difficulty === "relaxed"}
        onConfirm={endDay}
        onClose={() => setConfirming(null)}
      />
    </main>
  );
}
