import { useEffect, useRef, useState } from "react";
import type { Point } from "../../../../../../engine/geometry/point";
import { useToast } from "../../../../../../studio/ToastContext";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../../ui/kit/ToggleSwitch";
import { HINTS, SAFETY_LINE, SET_HINTS } from "../../../../content/hint";
import {
  ASSIST_CUT_ACCURACY,
  canSawLikeFirst,
  cutKey,
  designParts,
  firstPartId,
  fromBoard,
  isPartSawn,
  partCuts,
  runBoardById,
  toBoard,
  twinSawTolerance,
} from "../../../../core";
import { useAssist } from "../../../useAssist";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { SawBench } from "./SawBench";
import { ghostKey, rememberCut, tracedCut } from "./twinGhosts";
import "./saw.css";

export function SawStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const toast = useToast();
  const [rail, setRail] = useAssist("saw");
  const [chosen, setChosen] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [riding, setRiding] = useState(false);
  const [bench, setBench] = useState(0);
  const parts = designParts(run);
  const woodId = run.design.woodId;
  const open = parts.filter((part) => !isPartSawn(state, run, part));
  const part = parts.find((entry) => entry.id === chosen && !isPartSawn(state, run, entry)) ?? open[0];
  const placement = part === undefined ? undefined : run.placements[part.id];
  const board = placement === undefined ? undefined : runBoardById(state, run, placement.boardId);
  const cuts = part === undefined ? [] : partCuts(state, run, part);
  const doneCuts = cuts.map(
    (_, index) => part !== undefined && Object.hasOwn(run.cuts, cutKey(part.id, index)),
  );
  const cutIndex = doneCuts.findIndex((done) => !done);
  const tolerance = part === undefined || woodId === null ? 1 : (twinSawTolerance(state, run, part) ?? 1);
  const firstId = part === undefined ? null : firstPartId(run, part);
  const firstPart = firstId === null ? undefined : parts.find((entry) => entry.id === firstId);
  const firstPlacement = firstId === null ? undefined : run.placements[firstId];
  const firstSamples = firstId === null ? null : tracedCut(ghostKey(run.id, firstId, cutIndex));
  const ghost =
    part === undefined || placement === undefined || firstPart === undefined || firstPlacement === undefined
      ? null
      : (firstSamples?.map((point) =>
          toBoard(fromBoard(point, firstPart, firstPlacement), part, placement),
        ) ?? null);
  const echo = part !== undefined && canSawLikeFirst(state, run, part);

  const usedBoards = run.usedBoards.length;
  const spares = state.boards.filter((entry) => entry.spare).length;
  const seen = useRef({ usedBoards, spares });

  useEffect(() => {
    const before = seen.current;
    seen.current = { usedBoards, spares };
    if (spares > before.spares) toast("A spare piece went back on your rack!");
    else if (usedBoards > before.usedBoards) toast("That board is all used up. Sawdust everywhere!", "info");
  }, [usedBoards, spares, toast]);

  const complete = (samples: readonly Point[]) => {
    if (part === undefined) return;
    const changed = dispatch({ type: "sawCut", partId: part.id, cut: cutIndex, samples });
    if (changed) {
      rememberCut(ghostKey(run.id, part.id, cutIndex), samples);
      setBench((value) => value + 1);
    }
    setMessage(
      !changed
        ? HINTS.sawAgain
        : cutIndex + 1 < cuts.length
          ? "Clean cut! One more line on this part."
          : `${part.name} is cut out!`,
    );
  };

  const rideDone = () => {
    setRiding(false);
    if (part === undefined) return;
    if (dispatch({ type: "sawAssist", partId: part.id })) {
      setBench((value) => value + 1);
      setMessage(`${part.name} is cut out along the rail.`);
    }
  };

  return (
    <div className="ww-saw">
      <p className="ww-saw__safety" role="note">
        <Icon name="shield" size={18} /> {SAFETY_LINE}
      </p>
      <ul className="ww-saw__parts" aria-label="Parts to saw">
        {parts.map((entry) => {
          const done = isPartSawn(state, run, entry);
          return (
            <li key={entry.id}>
              <button
                type="button"
                className={[
                  "ww-saw__chip",
                  done ? "ww-saw__chip--done" : "",
                  entry.id === part?.id ? "ww-saw__chip--current" : "",
                ].join(" ")}
                onClick={() => setChosen(entry.id)}
                disabled={done}
                aria-pressed={entry.id === part?.id}
              >
                {done ? <Icon name="check" size={14} /> : null} {entry.name}
              </button>
            </li>
          );
        })}
      </ul>
      {part !== undefined && placement !== undefined && board !== undefined && cutIndex >= 0 ? (
        <div className="ww-saw__table ww-paper">
          <div className="ww-saw__head">
            <div>
              <span className="ad-eyebrow">
                Line {cutIndex + 1} of {cuts.length}
              </span>
              <h2 className="ww-saw__title">{part.name}</h2>
            </div>
            <div className="ww-assist">
              <ToggleSwitch
                label="Guide rail"
                description={`The saw rides a rail. Scores ${Math.round(ASSIST_CUT_ACCURACY * 100)}%.`}
                checked={rail}
                onChange={setRail}
              />
            </div>
          </div>
          <SawBench
            key={`${part.id}-${cutIndex}-${bench}`}
            part={part}
            placement={placement}
            board={board}
            cuts={cuts}
            doneCuts={doneCuts}
            cutIndex={cutIndex}
            tolerance={tolerance}
            rail={rail}
            riding={riding}
            ghost={ghost}
            onRideDone={rideDone}
            onComplete={complete}
            onPaused={(coverage) =>
              setMessage(coverage < 0 ? "Press on the pencil line to start." : HINTS.keepSawing)
            }
          />
          <div className="ww-saw__controls">
            <p className="ww-saw__message" role="status" aria-live="polite">
              {message ??
                (rail
                  ? "Tap the rail button and watch it go."
                  : firstId !== null
                    ? SET_HINTS.followFirst
                    : "Press on the green dot and follow the pencil line.")}
            </p>
            {echo ? (
              <Button
                variant="secondary"
                className="ww-big-button"
                icon="sparkle"
                onClick={() => {
                  if (dispatch({ type: "sawLikeFirst", partId: part.id })) {
                    setBench((value) => value + 1);
                    setMessage(`${part.name} is cut out, just like your first!`);
                  }
                }}
                data-testid="saw-like-first"
              >
                Saw it like my first
              </Button>
            ) : null}
            {rail ? (
              <Button
                className="ww-big-button"
                icon="sparkle"
                onClick={() => setRiding(true)}
                disabled={riding}
                data-testid="saw-rail"
              >
                Saw along the rail
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="ww-big-button"
                onClick={() => setBench((value) => value + 1)}
              >
                Restart this line
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="ww-saw__done ww-paper" role="status">
          <Icon name="check" size={20} /> Every part is cut out. Lovely clean edges!
        </p>
      )}
      <StageFooter {...props} ready="All parts cut. Time to put it together!" />
    </div>
  );
}
