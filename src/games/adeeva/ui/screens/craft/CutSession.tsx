import { useState } from "react";
import type { FabricDef } from "../../../content/fabric";
import {
  ASSIST_CUT_ACCURACY,
  canCommitCut,
  cutTolerance,
  requiredPieces,
  type Action,
  type DressRun,
  type GameState,
} from "../../../core";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { PieceThumb } from "./PieceThumb";
import { TraceMat } from "./TraceMat";

export interface CutSessionProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly fabricId: string;
  readonly fabric: FabricDef | undefined;
  readonly dispatch: (action: Action) => boolean;
  readonly assistCut: boolean;
  readonly reducedMotion: boolean;
  readonly onBackToLayout: () => void;
}

export function CutSession({
  state,
  run,
  fabricId,
  fabric,
  dispatch,
  assistCut,
  reducedMotion,
  onBackToLayout,
}: CutSessionProps) {
  const once = useDispatchOnce(state, dispatch);
  const [traced, setTraced] = useState<Readonly<Record<string, number>>>({});
  const [chosen, setChosen] = useState<string | null>(null);
  const entries = requiredPieces(run.design).filter((entry) => entry.fabricId === fabricId);
  const accuracyFor = (pieceId: string) => traced[pieceId] ?? (assistCut ? ASSIST_CUT_ACCURACY : undefined);
  const nextUntraced = entries.find((entry) => traced[entry.piece.id] === undefined);
  const currentId = chosen ?? (assistCut ? null : (nextUntraced?.piece.id ?? null));
  const current = entries.find((entry) => entry.piece.id === currentId);
  const placement = current !== undefined ? run.placements[current.piece.id] : undefined;
  const accuracies: Record<string, number> = {};
  for (const entry of entries) {
    const value = accuracyFor(entry.piece.id);
    if (value !== undefined) accuracies[entry.piece.id] = value;
  }
  const complete = entries.every((entry) => accuracies[entry.piece.id] !== undefined);
  const check = canCommitCut(state, fabricId);
  const tolerance = cutTolerance(state);
  const assisted = entries.filter((entry) => traced[entry.piece.id] === undefined).length;

  return (
    <div className="ad-cut-session">
      <div className="ad-cut-session__mat">
        {current !== undefined && placement !== undefined ? (
          <TraceMat
            key={current.piece.id}
            piece={current.piece}
            fabric={fabric}
            placement={placement}
            toleranceCm={tolerance}
            reducedMotion={reducedMotion}
            onKeep={(accuracy) => {
              setTraced((existing) => ({ ...existing, [current.piece.id]: accuracy }));
              setChosen(null);
            }}
          />
        ) : (
          <div className="ad-cut-ready">
            <span className="ad-cut-ready__icon" aria-hidden="true">
              <Icon name="scissors" size={40} />
            </span>
            <h3>{complete ? "Every outline is traced" : "Choose a piece to trace"}</h3>
            <p className="ad-muted">
              {assistCut && assisted > 0
                ? `Assist cut will snip ${assisted === entries.length ? "every piece" : `the other ${assisted}`} at a steady ${Math.round(ASSIST_CUT_ACCURACY * 100)}%. You can still trace any piece yourself.`
                : "Cutting uses the fabric under your layout. It cannot be undone, so check you are happy."}
            </p>
          </div>
        )}
      </div>
      <div className="ad-cut-session__side">
        <ul className="ad-cut-list">
          {entries.map((entry) => {
            const value = accuracyFor(entry.piece.id);
            const mine = traced[entry.piece.id] !== undefined;
            return (
              <li key={entry.piece.id}>
                <button
                  type="button"
                  className={
                    entry.piece.id === currentId ? "ad-cut-item ad-cut-item--current" : "ad-cut-item"
                  }
                  onClick={() => setChosen(entry.piece.id)}
                  aria-label={`${mine ? "Retrace" : "Trace"} ${entry.piece.name}`}
                >
                  <PieceThumb
                    piece={entry.piece}
                    fabric={fabric}
                    rotation={run.placements[entry.piece.id]?.rotation ?? 0}
                    size={44}
                    cut={mine}
                  />
                  <span className="ad-cut-item__name">{entry.piece.name}</span>
                  <span
                    className={mine ? "ad-cut-item__score ad-cut-item__score--mine" : "ad-cut-item__score"}
                  >
                    {value === undefined ? "To trace" : `${Math.round(value * 100)}%${mine ? "" : " assist"}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {check.ok ? null : <p className="ad-layout-issues">{check.reasons[0]}</p>}
        <Button
          size="lg"
          block
          icon="scissors"
          onClick={(event) => once(event, { type: "commitCut", fabricId, accuracies })}
          disabledReason={
            !complete
              ? "Trace every piece first, or switch on Assist cut."
              : check.ok
                ? undefined
                : check.reasons[0]
          }
          data-testid="commit-cut"
        >
          Cut the fabric
        </Button>
        <Button variant="ghost" block onClick={onBackToLayout}>
          Back to the layout
        </Button>
      </div>
    </div>
  );
}
