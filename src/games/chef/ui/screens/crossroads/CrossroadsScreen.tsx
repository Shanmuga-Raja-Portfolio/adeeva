import { useState } from "react";
import { weeklyRent } from "../../../../../engine/difficulty";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useFocusAfterRender } from "../../../../../ui/kit/useFocusAfterRender";
import { PATHS, type PathId } from "../../../content/path";
import { HALL_PEOPLE } from "../../../content/hallPeople";
import {
  choosePathIssues,
  pathById,
  pathStartCost,
  peekIssue,
  previewPath,
  type Action,
  type GameState,
} from "../../../core";
import { DoorArt } from "../../art/DoorArt";
import { PathHub } from "../path/PathHub";
import { ChoosePathDialog } from "./ChoosePathDialog";
import "./crossroads.css";

export interface CrossroadsScreenProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onBack: () => void;
  readonly onChosen: () => void;
}

const HOLLIS = HALL_PEOPLE.find((person) => person.id === "hollis");

function doorIssue(state: GameState, path: PathId): string | undefined {
  return choosePathIssues(state, path, path === "restaurant" ? "own-table" : null)[0];
}

function rentLine(state: GameState, path: PathId): string {
  const rent = weeklyRent(pathById(path).rent, state.profile.difficulty);
  const label = path === "truck" ? "Parking" : "Rent";
  return rent === 0 ? `No ${label.toLowerCase()} to pay on this difficulty` : `${label} ${rent} a week`;
}

export function CrossroadsScreen({ state, dispatch, onBack, onChosen }: CrossroadsScreenProps) {
  const [peeking, setPeeking] = useState<PathId | null>(null);
  const [choosing, setChoosing] = useState<PathId | null>(null);
  const focusAfter = useFocusAfterRender();

  const leavePeek = (path: PathId) => {
    dispatch({ type: "peekPath", path });
    setPeeking(null);
    focusAfter([`[data-testid="choose-${path}"]:not(:disabled)`, ".ck-crossroads h1"]);
  };

  if (peeking !== null)
    return (
      <PathHub
        state={previewPath(state, peeking)}
        dispatch={() => false}
        onOpen={() => undefined}
        onOpenSettings={() => undefined}
        onExitToTitle={() => undefined}
        peek={{ tour: pathById(peeking).tour, onBack: () => leavePeek(peeking) }}
      />
    );

  const peek = (path: PathId) => {
    if (peekIssue(state, path) !== null) return;
    setPeeking(path);
    focusAfter(['[data-testid="peek-back"]']);
  };

  return (
    <main className="ck-crossroads ad-screen" data-testid="crossroads">
      <header className="ck-crossroads__header">
        {HOLLIS === undefined ? null : (
          <Avatar look={HOLLIS.look} size={88} title="Hollis" frameColour="#fbe6c2" />
        )}
        <div>
          <span className="ad-eyebrow">Larkspur Market Hall</span>
          <h1 tabIndex={-1}>The Crossroads</h1>
          <p className="ck-crossroads__line">
            “Three doors, chef. Peek through each one once. When you choose, it's yours for this save.”
          </p>
        </div>
        <Button variant="secondary" icon="back" onClick={onBack} data-testid="crossroads-back">
          Back to the kitchen
        </Button>
      </header>
      <div className="ck-crossroads__doors">
        {PATHS.map((def) => {
          const cost = pathStartCost(state, def.id);
          const peeked = state.peeked.includes(def.id);
          const issue = doorIssue(state, def.id);
          return (
            <article
              key={def.id}
              className="ck-door"
              style={{ ["--ck-door" as string]: def.accent }}
              data-testid={`door-${def.id}`}
            >
              <DoorArt path={def.id} colour={def.accent} ajar={peeked} />
              <span className="ad-eyebrow">{def.door}</span>
              <h2>{def.name}</h2>
              <p className="ck-door__venue">{def.venue}</p>
              <p className="ck-muted">{def.goal}</p>
              <ul className="ck-door__facts">
                <li>
                  <Icon name="coin" size={16} /> Start: {cost} coins for {def.startKit}
                </li>
                <li>
                  <Icon name="home" size={16} /> {rentLine(state, def.id)}
                </li>
              </ul>
              <div className="ck-door__actions">
                <Button
                  variant="secondary"
                  icon="sparkle"
                  onClick={() => peek(def.id)}
                  disabledReason={peekIssue(state, def.id) ?? undefined}
                  data-testid={`peek-${def.id}`}
                >
                  {peeked ? "Peeked" : "Peek inside"}
                </Button>
                <Button
                  icon="star"
                  onClick={() => setChoosing(def.id)}
                  disabledReason={issue}
                  showReason
                  data-testid={`choose-${def.id}`}
                >
                  Choose this door
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      <ChoosePathDialog
        state={state}
        path={choosing}
        onClose={() => setChoosing(null)}
        onConfirm={(path, nameCard) => {
          if (dispatch({ type: "choosePath", path, nameCard })) onChosen();
        }}
      />
    </main>
  );
}
