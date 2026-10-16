import { useState } from "react";
import { colourById } from "../../../../../../engine/palette";
import { FabricPattern, fabricFill } from "../../../../../../ui/art/cloth/FabricPattern";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../../ui/kit/TagPill";
import { ToggleSwitch } from "../../../../../../ui/kit/ToggleSwitch";
import { CUSHION_FABRICS } from "../../../../content/cushionFabric";
import { FINISHES, PAINT_COLOURS } from "../../../../content/finish";
import { HINTS } from "../../../../content/hint";
import {
  canSewCushion,
  cushionFabricById,
  extraTallies,
  isCushionSewn,
  runPieces,
  seamBand,
  seatPieces,
} from "../../../../core";
import { pieceLook } from "../../../art/pieceLook";
import { useAssist } from "../../../useAssist";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { PieceSwitcher } from "../set/PieceSwitcher";
import { CushionSeam } from "./CushionSeam";
import { ExtrasBoard } from "./ExtrasBoard";
import "./finish.css";

export function FinishStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const [seamHelper, setSeamHelper] = useAssist("seam");
  const [hint, setHint] = useState<string | null>(null);
  const [paint, setPaint] = useState(run.finish.paint ?? "sky");
  const [seamTries, setSeamTries] = useState(0);
  const [piece, setPiece] = useState(0);
  const pieces = runPieces(run);
  const seats = seatPieces(run).length;
  const look = pieceLook(run, piece);
  const woodId = run.design.woodId;
  const short = extraTallies(run).filter((tally) => tally.placed < tally.needed);
  const cushion = run.cushion;
  if (look === null || woodId === null) return <StageFooter {...props} />;

  const pickFinish = (finishId: (typeof FINISHES)[number]["id"], needsPaint: boolean) => {
    if (!dispatch({ type: "chooseFinish", finishId, paint: needsPaint ? paint : null }))
      setHint(run.finish.finishId === finishId ? null : "Not enough coins for that finish.");
  };

  const pickPaint = (colour: (typeof PAINT_COLOURS)[number]) => {
    setPaint(colour);
    const current = run.finish.finishId;
    if (current !== null && run.finish.paint !== null)
      dispatch({ type: "chooseFinish", finishId: current, paint: colour });
  };

  return (
    <div className="ww-finish">
      <PieceSwitcher pieces={pieces} value={piece} label="Piece to decorate" onChange={setPiece} />
      <ExtrasBoard
        key={piece}
        run={run}
        woodId={woodId}
        look={look}
        piece={piece}
        coins={state.coins}
        dispatch={dispatch}
        onHint={setHint}
      />
      <p className="ww-finish__hint" role="status" aria-live="polite">
        {hint ??
          (short.length > 0 && run.finish.finishId !== null
            ? HINTS.addExtras
            : "Drag extras onto the piece. Tap one to put it back.")}
      </p>
      <section className="ww-finish__panel ww-paper" aria-labelledby="ww-finish-title">
        <h2 id="ww-finish-title" className="ww-finish__title">
          Finish
          {pieces.length > 1 ? (
            <span className="ww-muted"> · one finish for all {pieces.length} pieces</span>
          ) : null}
        </h2>
        <div className="ww-finish__options" role="radiogroup" aria-label="Finish">
          {FINISHES.map((finish) => (
            <button
              key={finish.id}
              type="button"
              role="radio"
              aria-checked={run.finish.finishId === finish.id}
              className="ww-finish__option"
              onClick={() => pickFinish(finish.id, finish.needsPaint)}
              data-testid={`finish-${finish.id}`}
            >
              <span className={`ww-finish__swatch ww-finish__swatch--${finish.look}`} aria-hidden="true" />
              <strong>{finish.name}</strong>
              <span className="ww-muted">{finish.blurb}</span>
              <span className="ww-finish__meta">
                <span className="ww-coin-line">
                  <Icon name="coin" size={14} /> {finish.price * Math.max(1, pieces.length)}
                </span>
                {finish.tags.map((tag) => (
                  <TagPill key={tag} tone={run.brief.requiredTags.includes(tag) ? "sage" : "plain"}>
                    {tag}
                  </TagPill>
                ))}
              </span>
            </button>
          ))}
        </div>
        <div className="ww-finish__paints" role="radiogroup" aria-label="Paint colour">
          <span className="ww-finish__paint-label">Paint colour</span>
          {PAINT_COLOURS.map((colour) => (
            <button
              key={colour}
              type="button"
              role="radio"
              aria-checked={paint === colour}
              aria-label={colourById(colour).name}
              title={colourById(colour).name}
              className="ww-finish__paint"
              style={{ background: colourById(colour).hex }}
              onClick={() => pickPaint(colour)}
            />
          ))}
        </div>
      </section>
      {canSewCushion(run) ? (
        <section className="ww-finish__panel ww-paper ww-cushion" aria-labelledby="ww-cushion-title">
          <h2 id="ww-cushion-title" className="ww-finish__title">
            Cushion corner{" "}
            <span className="ww-muted">
              · optional, 1 hour{seats > 1 ? `, one fabric for all ${seats} seats` : ""}
            </span>
          </h2>
          <div className="ww-cushion__fabrics" role="radiogroup" aria-label="Cushion fabric">
            {CUSHION_FABRICS.map((fabric) => (
              <button
                key={fabric.id}
                type="button"
                role="radio"
                aria-checked={cushion?.fabricId === fabric.id}
                className="ww-cushion__fabric"
                onClick={() => dispatch({ type: "chooseCushion", fabricId: fabric.id })}
              >
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <defs>
                    <FabricPattern id={`ww-cushion-${fabric.id}`} fabric={fabric} tile={14} />
                  </defs>
                  <rect width={40} height={40} rx={8} fill={fabricFill(`ww-cushion-${fabric.id}`)} />
                </svg>
                <span>{fabric.name}</span>
                <span className="ww-coin-line">
                  <Icon name="coin" size={12} /> {fabric.price * Math.max(1, seats)}
                </span>
              </button>
            ))}
          </div>
          {cushion !== null ? (
            <>
              <div className="ww-cushion__head">
                <p className="ww-hint">
                  <Icon name="needle" size={16} />
                  {isCushionSewn(cushion)
                    ? "The cushion seam is sewn. So cosy!"
                    : "Hold on the fabric to sew. Steer the needle onto the chalk line."}
                </p>
                <div className="ww-assist">
                  <ToggleSwitch
                    label="Seam helper"
                    description="A wider line. Scores up to 80%."
                    checked={seamHelper}
                    onChange={setSeamHelper}
                  />
                </div>
              </div>
              <CushionSeam
                key={`${cushion.fabricId}-${seamTries}`}
                fabric={cushionFabricById(cushion.fabricId)}
                seam={cushion.seam}
                band={seamBand(state, seamHelper)}
                assisted={seamHelper}
                onRecord={(sample) => dispatch({ type: "recordSeam", ...sample })}
              />
              <div className="ww-cushion__actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (dispatch({ type: "resetSeam" })) setSeamTries((value) => value + 1);
                  }}
                  disabled={cushion.seam === null}
                >
                  Restart the seam
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: "chooseCushion", fabricId: null })}
                >
                  No cushion after all
                </Button>
              </div>
            </>
          ) : null}
        </section>
      ) : null}
      <StageFooter {...props} ready="Looking good! Let's check it over." />
    </div>
  );
}
