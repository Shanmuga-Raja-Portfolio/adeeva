import { useRef, useState, type PointerEvent } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { fillIssue, needsFilling, productById, slotAssignmentIssue } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { bakeLook, spongeHex } from "../../art/bakeLook";
import { CakeStand } from "../../art/CakeStand";
import { LevelIt, useLevelOffsets } from "./LevelIt";
import { PantryDialog } from "./PantryDialog";
import { pieceHeight, slotLeft, slotShape, StackPieceArt } from "./StackPieceArt";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./stack.css";

interface Drag {
  readonly pieceId: string;
  readonly pointerId: number;
  readonly x: number;
  readonly y: number;
}

export function StackStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [pantryOpen, setPantryOpen] = useState(false);
  const levels = useLevelOffsets();
  const slotRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const look = bakeLook(run.design, [], false);
  if (run.design.productId === null || look === null) return null;
  const product = productById(run.design.productId);
  const placed = new Set(Object.values(run.stack));
  const pieces = product.stackPieces;
  const tiers = product.id === "three-tier-cake";
  const fillReason = needsFilling(run) && !run.filled ? fillIssue(state, run) : null;

  const place = (slot: string, pieceId: string) => {
    const issue = slotAssignmentIssue(run, slot, pieceId);
    if (issue !== null) {
      toast(issue, "info");
      return;
    }
    dispatch({ type: "assignStack", slot, pieceId });
    setSelected(null);
  };

  const dropAt = (clientX: number, clientY: number, pieceId: string) => {
    const hit = Object.entries(slotRefs.current).find(([, element]) => {
      if (element === null) return false;
      const rect = element.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    });
    if (hit !== undefined) place(hit[0], pieceId);
  };

  const down = (event: PointerEvent<HTMLButtonElement>, pieceId: string) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(pieceId);
    setDrag({ pieceId, pointerId: event.pointerId, x: event.clientX, y: event.clientY });
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    setDrag({ ...drag, x: event.clientX, y: event.clientY });
  };
  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    setDrag(null);
    dropAt(event.clientX, event.clientY, drag.pieceId);
  };

  return (
    <div className="pa-stack">
      <div className="pa-stack__layout">
        <div className="pa-stack__stand">
          {pieces.length === 0 ? (
            <BakePreview look={look} title={`${product.name} on the stand`} className="pa-stack__art" />
          ) : (
            <svg viewBox="0 0 400 400" className="pa-stack__art" role="img" aria-label="Cake stand">
              <CakeStand width={260} y={316} />
              {product.stackSlots.map((slot) => {
                const shape = slotShape(product.id, slot.id);
                const pieceId = run.stack[slot.id];
                const piece = pieces.find((entry) => entry.id === pieceId);
                if (piece === undefined)
                  return (
                    <rect
                      key={slot.id}
                      x={slotLeft(product.id, slot.id)}
                      y={shape.top - 10}
                      width={shape.width}
                      height={shape.height + 10}
                      rx={14}
                      fill="#fffaf0"
                      fillOpacity={0.5}
                      stroke="#4b5aa6"
                      strokeWidth={3}
                      strokeDasharray="10 8"
                    />
                  );
                return (
                  <g key={slot.id} className="pa-stack__placed">
                    <StackPieceArt
                      productId={product.id}
                      piece={piece}
                      sponge={spongeHex(look, piece.batch)}
                      fillingColour={run.filled ? look.fillingColour : null}
                      top={shape.top + (shape.height - pieceHeight(product.id, piece))}
                      cx={200 + (tiers ? levels.offset(slot.id) : 0)}
                    />
                  </g>
                );
              })}
              {tiers && levels.allLevel(run.stack) ? (
                <path d="M200 110 V320" stroke="#5fa046" strokeWidth={3} className="pa-stack__level" />
              ) : tiers ? (
                <path
                  d="M200 110 V320"
                  stroke="#4b5aa6"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  opacity={0.6}
                />
              ) : null}
            </svg>
          )}
          {product.stackSlots.map((slot) => {
            const shape = slotShape(product.id, slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                ref={(element) => {
                  slotRefs.current[slot.id] = element;
                }}
                className="pa-stack__slot"
                style={{
                  left: `${(slotLeft(product.id, slot.id) / 400) * 100}%`,
                  top: `${((shape.top - 10) / 400) * 100}%`,
                  width: `${(shape.width / 400) * 100}%`,
                  height: `${((shape.height + 10) / 400) * 100}%`,
                }}
                onClick={() => {
                  if (selected !== null) place(slot.id, selected);
                }}
                aria-label={`Place on the ${slot.name}`}
                data-testid={`slot-${slot.id}`}
              />
            );
          })}
        </div>
        <aside className="pa-stack__side pa-doily">
          {pieces.length > 0 ? (
            <>
              <h2>Cooled and ready</h2>
              <p className="pa-muted">Drag each one onto the stand, or tap it and then tap its spot.</p>
              <div className="pa-stack__pieces">
                {pieces.map((piece) => {
                  const done = placed.has(piece.id);
                  return (
                    <button
                      key={piece.id}
                      type="button"
                      className={
                        selected === piece.id
                          ? "pa-stack__piece pa-stack__piece--selected"
                          : "pa-stack__piece"
                      }
                      disabled={done}
                      aria-pressed={selected === piece.id}
                      onPointerDown={(event) => down(event, piece.id)}
                      onPointerMove={move}
                      onPointerUp={up}
                      onPointerCancel={() => setDrag(null)}
                      onClick={(event) => {
                        if (event.detail === 0) setSelected(piece.id);
                      }}
                      data-testid={`piece-${piece.id}`}
                    >
                      <svg viewBox="70 -20 260 120" aria-hidden="true">
                        <StackPieceArt
                          productId={product.id}
                          piece={piece}
                          sponge={spongeHex(look, piece.batch)}
                          fillingColour={null}
                          top={product.id === "biscuit-wreath" ? -45 : 10}
                        />
                      </svg>
                      <span>{done ? `${piece.name} placed` : piece.name}</span>
                    </button>
                  );
                })}
              </div>
              {tiers ? <LevelIt stack={run.stack} levels={levels} /> : null}
            </>
          ) : (
            <>
              <h2>{product.name}</h2>
              <p className="pa-muted">These place themselves on the stand. Nothing to stack!</p>
            </>
          )}
          {needsFilling(run) ? (
            run.filled ? (
              <p className="pa-stack__filled">
                <Icon name="check" size={16} /> Filling in!
              </p>
            ) : (
              <Button
                size="lg"
                block
                onClick={(event) => once(event, { type: "fill" })}
                disabledReason={fillReason ?? undefined}
                showReason
                data-testid="fill"
              >
                Fill
              </Button>
            )
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => setPantryOpen(true)}>
            Quick pantry trip
          </Button>
        </aside>
      </div>
      {drag !== null ? (
        <div
          className="pa-drag-ghost"
          style={{ transform: `translate(${drag.x - 50}px, ${drag.y - 30}px)` }}
          aria-hidden="true"
        >
          <span />
        </div>
      ) : null}
      <PantryDialog
        open={pantryOpen}
        onClose={() => setPantryOpen(false)}
        state={state}
        run={run}
        dispatch={dispatch}
      />
      <StageFooter {...props} ready="Stacked and filled. Time to pipe!" />
    </div>
  );
}
