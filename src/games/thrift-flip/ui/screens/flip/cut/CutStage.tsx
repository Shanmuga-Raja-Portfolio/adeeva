import { useState } from "react";
import { useSettings } from "../../../../../../studio/SettingsContext";
import type { Cloth } from "../../../../../../ui/art/cloth/Cloth";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../../ui/kit/useDispatchOnce";
import { AssistSwitch } from "../../../../../adeeva/ui/screens/craft/AssistSwitch";
import { PieceThumb } from "../../../../../adeeva/ui/screens/craft/PieceThumb";
import { TraceMat } from "../../../../../adeeva/ui/screens/craft/TraceMat";
import "../../../../../adeeva/ui/screens/craft/trace.css";
import { HINTS } from "../../../../content/hint";
import {
  ASSIST_CUT_ACCURACY,
  canCommitCut,
  cutTolerance,
  findById,
  flipPieces,
  panelUnder,
  piecePolygon,
  runBoard,
} from "../../../../core";
import { findCloth } from "../../../art/findCloth";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import "./cut.css";

export function CutStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { settings, reducedMotion, updateSettings } = useSettings();
  const once = useDispatchOnce(state, dispatch);
  const traced = run.cutTraces;
  const [chosen, setChosen] = useState<string | null>(null);
  const pieces = flipPieces(run.design);
  const board = runBoard(run);
  const clothFor = (pieceId: string): Cloth | undefined => {
    const piece = pieces.find((entry) => entry.id === pieceId);
    const placement = run.placements[pieceId];
    if (piece === undefined || placement === undefined) return undefined;
    const panel = panelUnder(board, piecePolygon(piece, placement));
    return panel === null ? undefined : findCloth(findById(panel.findId));
  };
  const nextUntraced = pieces.find((piece) => traced[piece.id] === undefined);
  const currentId = chosen ?? (settings.assistCut ? null : (nextUntraced?.id ?? null));
  const current = pieces.find((piece) => piece.id === currentId);
  const placement = current === undefined ? undefined : run.placements[current.id];
  const complete = settings.assistCut || pieces.every((piece) => traced[piece.id] !== undefined);
  const check = canCommitCut(state);

  if (run.cutDone) {
    return (
      <div className="tf-cut">
        <div className="tf-cut__done">
          <header>
            <Icon name="check" size={20} />
            <strong>Snip, snip! Every piece is cut.</strong>
          </header>
          <ul>
            {pieces.map((piece) => (
              <li key={piece.id}>
                <PieceThumb
                  piece={piece}
                  fabric={clothFor(piece.id)}
                  rotation={run.placements[piece.id]?.rotation ?? 0}
                  size={72}
                  cut
                />
                <span>{piece.name}</span>
                <strong>{Math.round((run.cutAccuracy[piece.id] ?? 0) * 100)}% clean</strong>
              </li>
            ))}
          </ul>
        </div>
        <StageFooter {...props} hint="Pieces cut! Off to the sewing machine." />
      </div>
    );
  }

  return (
    <div className="tf-cut">
      <div className="tf-cut__mat">
        {current !== undefined && placement !== undefined ? (
          <TraceMat
            key={current.id}
            piece={current}
            fabric={clothFor(current.id)}
            placement={placement}
            toleranceCm={cutTolerance(state)}
            reducedMotion={reducedMotion}
            onKeep={(_accuracy, samples) => {
              dispatch({ type: "traceCut", pieceId: current.id, samples });
              setChosen(null);
            }}
          />
        ) : (
          <div className="tf-cut__ready">
            <Icon name="scissors" size={40} />
            <h3>{complete ? "Ready to cut" : "Choose a piece to trace"}</h3>
            <p className="ad-muted">
              {settings.assistCut
                ? `Assist cut snips untraced pieces at a steady ${Math.round(ASSIST_CUT_ACCURACY * 100)}%.`
                : HINTS.cut}
            </p>
          </div>
        )}
      </div>
      <div className="tf-cut__side">
        <ul className="tf-cut__list">
          {pieces.map((piece) => {
            const mine = traced[piece.id];
            return (
              <li key={piece.id}>
                <button
                  type="button"
                  className={piece.id === currentId ? "tf-cut-item tf-cut-item--current" : "tf-cut-item"}
                  onClick={() => setChosen(piece.id)}
                  aria-label={`${mine === undefined ? "Trace" : "Retrace"} ${piece.name}`}
                >
                  <PieceThumb
                    piece={piece}
                    fabric={clothFor(piece.id)}
                    rotation={run.placements[piece.id]?.rotation ?? 0}
                    size={44}
                    cut={mine !== undefined}
                  />
                  <span>{piece.name}</span>
                  <strong>
                    {mine !== undefined
                      ? `${Math.round(mine * 100)}%`
                      : settings.assistCut
                        ? `${Math.round(ASSIST_CUT_ACCURACY * 100)}% assist`
                        : "To trace"}
                  </strong>
                </button>
              </li>
            );
          })}
        </ul>
        <AssistSwitch
          label="Assist cut"
          detail={`Skip tracing: untraced pieces are cut at a steady ${Math.round(ASSIST_CUT_ACCURACY * 100)}%.`}
          checked={settings.assistCut}
          onChange={(assistCut) => updateSettings({ assistCut })}
        />
        {check.ok ? null : <p className="tf-layout__issues">{check.reasons[0]}</p>}
        <Button
          size="lg"
          block
          icon="scissors"
          onClick={(event) => once(event, { type: "commitCut", assisted: settings.assistCut })}
          disabledReason={
            complete
              ? check.ok
                ? undefined
                : check.reasons[0]
              : "Trace every piece, or switch on Assist cut."
          }
          data-testid="commit-cut"
        >
          Cut the pieces
        </Button>
        <p className="tf-safety">{HINTS.tools}</p>
      </div>
      <StageFooter {...props} hint="Pieces cut! Off to the sewing machine." />
    </div>
  );
}
