import { useRef, useState, type PointerEvent } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import type { StackPieceDef } from "../../../content/product";
import { fillIssue, needsFilling, productById, slotAssignmentIssue } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { bakeLook, spongeHex } from "../../art/bakeLook";
import { CakeBody } from "../../art/CakeBody";
import { CakeStand } from "../../art/CakeStand";
import { PantryDialog } from "./PantryDialog";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./stack.css";

interface Drag {
  readonly pieceId: string;
  readonly pointerId: number;
  readonly x: number;
  readonly y: number;
}

const SLOT_SHAPES: Readonly<
  Record<string, { readonly top: number; readonly width: number; readonly height: number }>
> = {
  stand: { top: 236, width: 210, height: 70 },
  "on-top": { top: 168, width: 150, height: 66 },
};

export function StackStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [pantryOpen, setPantryOpen] = useState(false);
  const slotRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const look = bakeLook(run.design, [], false);
  if (run.design.productId === null || look === null) return null;
  const product = productById(run.design.productId);
  const placed = new Set(Object.values(run.stack));
  const pieces = product.stackPieces;
  const two = product.id === "two-tier-cake";
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

  const pieceShape = (piece: StackPieceDef) => {
    const big = piece.slot === "stand";
    const width = two ? (big ? 210 : 140) : 200;
    return { width, height: two ? (big ? 70 : 66) : 58, sponge: spongeHex(look, piece.batch) };
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
                const shape = SLOT_SHAPES[slot.id] ?? { top: 200, width: 180, height: 60 };
                const pieceId = run.stack[slot.id];
                const piece = pieces.find((entry) => entry.id === pieceId);
                if (piece === undefined)
                  return (
                    <rect
                      key={slot.id}
                      x={200 - shape.width / 2}
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
                const size = pieceShape(piece);
                return (
                  <g key={slot.id} className="pa-stack__placed">
                    <CakeBody
                      cx={200}
                      top={shape.top + (shape.height - size.height)}
                      width={size.width}
                      height={size.height}
                      sponge={size.sponge}
                      coat={null}
                      fillingColour={run.filled ? look.fillingColour : null}
                      layered={false}
                    />
                  </g>
                );
              })}
              {run.filled && look.fillingColour !== null ? (
                <ellipse
                  cx={200}
                  cy={two ? 236 : 230}
                  rx={two ? 70 : 100}
                  ry={10}
                  fill={look.fillingColour}
                  className="pa-stack__filling"
                />
              ) : null}
            </svg>
          )}
          {product.stackSlots.map((slot) => {
            const shape = SLOT_SHAPES[slot.id] ?? { top: 200, width: 180, height: 60 };
            return (
              <button
                key={slot.id}
                type="button"
                ref={(element) => {
                  slotRefs.current[slot.id] = element;
                }}
                className="pa-stack__slot"
                style={{
                  left: `${((200 - shape.width / 2) / 400) * 100}%`,
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
                  const size = pieceShape(piece);
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
                        <CakeBody
                          cx={200}
                          top={10}
                          width={size.width}
                          height={size.height}
                          sponge={size.sponge}
                          coat={null}
                          fillingColour={null}
                          layered={false}
                        />
                        {piece.id === "dome-layer" ? (
                          <path d="M110 12 Q200 -26 290 12" fill={size.sponge} />
                        ) : null}
                      </svg>
                      <span>{done ? `${piece.name} placed` : piece.name}</span>
                    </button>
                  );
                })}
              </div>
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
