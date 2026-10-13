import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { PartCategory } from "../../../content/garmentPart";
import type { GarmentSlot } from "../../../content/garmentSlot";
import { fabricById, requiredPieces, slotAssignmentIssue } from "../../../core";
import { DressPreview } from "../../art/DressPreview";
import { SlotHighlight } from "../../art/SlotHighlight";
import { slotAnchor, slotAtPoint } from "../../art/slotAnchor";
import { Icon } from "../../kit/IconSet";
import { clientToSvg } from "./clientToSvg";
import { designFabrics, designParts } from "../../art/designLook";
import { PieceThumb } from "./PieceThumb";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./assemble.css";

const SLOT_LABELS: Readonly<Record<GarmentSlot, string>> = {
  "bodice-front": "Bodice front",
  "bodice-back": "Bodice back",
  neckline: "Neckline",
  "sleeve-left": "Left sleeve",
  "sleeve-right": "Right sleeve",
  "skirt-front": "Skirt front",
  "skirt-back": "Skirt back",
};

interface PanelDrag {
  readonly pieceId: string;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
  readonly slot: GarmentSlot | null;
}

interface Feedback {
  readonly tone: "good" | "gentle";
  readonly text: string;
  readonly pieceId: string;
  readonly slot: GarmentSlot | null;
  readonly serial: number;
}

export function AssembleStage(props: StageProps) {
  const { run, dispatch } = props;
  const dollRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDragState] = useState<PanelDrag | null>(null);
  const dragRef = useRef<PanelDrag | null>(null);
  const setDrag = (next: PanelDrag | null) => {
    dragRef.current = next;
    setDragState(next);
  };
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const entries = requiredPieces(run.design);
  const placed = new Set(Object.values(run.assembly).filter((id): id is string => id !== null));
  const slots = [...new Set(entries.map((entry) => entry.piece.slot))];
  const shownCategories = new Set<PartCategory>(
    entries.filter((entry) => placed.has(entry.piece.id)).map((entry) => entry.category),
  );
  const parts = designParts(run.design, (category) => shownCategories.has(category));

  useEffect(() => {
    if (feedback === null) return;
    const handle = window.setTimeout(() => setFeedback(null), 3600);
    return () => window.clearTimeout(handle);
  }, [feedback]);

  const svg = () => dollRef.current?.querySelector("svg") ?? null;

  const tryAssign = (pieceId: string, slot: GarmentSlot) => {
    const issue = slotAssignmentIssue(run, slot, pieceId);
    const name = entries.find((entry) => entry.piece.id === pieceId)?.piece.name ?? "Panel";
    const serial = (feedback?.serial ?? 0) + 1;
    if (issue !== null) {
      setFeedback({ tone: "gentle", text: issue, pieceId, slot, serial });
      return;
    }
    dispatch({ type: "assignSlot", slot, pieceId });
    setSelected(null);
    setFeedback({ tone: "good", text: `${name} pinned in place.`, pieceId, slot, serial });
  };

  const down = (event: PointerEvent<HTMLButtonElement>, pieceId: string) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      pieceId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      slot: null,
    });
  };

  const dragAt = (current: PanelDrag, event: PointerEvent<HTMLButtonElement>): PanelDrag => {
    const point = clientToSvg(svg(), event.clientX, event.clientY);
    const moved =
      current.moved || Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 8;
    const hit = point === null ? undefined : slotAtPoint(point.x, point.y);
    const slot = hit !== undefined && slots.includes(hit) ? hit : null;
    return { ...current, x: event.clientX, y: event.clientY, moved, slot };
  };

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    setDrag(dragAt(current, event));
  };

  const up = (event: PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const final = dragAt(current, event);
    setDrag(null);
    if (!final.moved) {
      setSelected((chosen) => (chosen === final.pieceId ? null : final.pieceId));
      return;
    }
    if (final.slot !== null) tryAssign(final.pieceId, final.slot);
  };

  const dragEntry = entries.find((entry) => entry.piece.id === drag?.pieceId);
  const hoverIssue =
    drag !== null && drag.slot !== null ? slotAssignmentIssue(run, drag.slot, drag.pieceId) : null;
  const waiting = entries.filter((entry) => !placed.has(entry.piece.id));

  return (
    <div className="ad-assemble-stage">
      <div className="ad-assemble-stage__tray">
        <header>
          <strong>Cut panels</strong>
          <span className="ad-muted">
            {waiting.length > 0
              ? "Drag each panel to its spot on the form, or tap a panel then a spot."
              : "Every panel is pinned."}
          </span>
        </header>
        <ul className="ad-panel-tray">
          {entries.map((entry) => {
            const onForm = placed.has(entry.piece.id);
            const shaking = feedback?.tone === "gentle" && feedback.pieceId === entry.piece.id;
            const classes = [
              "ad-panel-card",
              onForm ? "ad-panel-card--placed" : "",
              selected === entry.piece.id ? "ad-panel-card--selected" : "",
              drag?.pieceId === entry.piece.id && drag.moved ? "ad-panel-card--lifted" : "",
              shaking ? "ad-panel-card--shake" : "",
            ].join(" ");
            return (
              <li key={shaking ? `${entry.piece.id}-${feedback.serial}` : entry.piece.id}>
                <button
                  type="button"
                  className={classes}
                  disabled={onForm}
                  data-panel={entry.piece.id}
                  onPointerDown={(event) => down(event, entry.piece.id)}
                  onPointerMove={move}
                  onPointerUp={up}
                  onPointerCancel={() => setDrag(null)}
                  onClick={(event) => {
                    if (event.detail === 0)
                      setSelected((chosen) => (chosen === entry.piece.id ? null : entry.piece.id));
                  }}
                  aria-pressed={selected === entry.piece.id}
                >
                  <PieceThumb
                    piece={entry.piece}
                    fabric={entry.fabricId === null ? undefined : fabricById(entry.fabricId)}
                    rotation={run.placements[entry.piece.id]?.rotation ?? 0}
                    size={64}
                    cut
                  />
                  <span className="ad-panel-card__name">{entry.piece.name}</span>
                  <span className="ad-panel-card__state">
                    {onForm ? (
                      <>
                        <Icon name="check" size={14} /> On the form
                      </>
                    ) : (
                      "Ready"
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p
          className={
            feedback === null
              ? "ad-assemble-feedback"
              : `ad-assemble-feedback ad-assemble-feedback--${feedback.tone}`
          }
          role="status"
        >
          {feedback?.text ?? (selected !== null ? "Now tap the spot on the form where it belongs." : "")}
        </p>
      </div>
      <div className="ad-assemble-stage__form" ref={dollRef}>
        <DressPreview parts={parts} fabrics={designFabrics(run.design)} title="Dress form with pinned panels">
          {slots.map((slot) => {
            const rect = slotAnchor(slot);
            const filled = run.assembly[slot] !== null;
            const back = slot === "bodice-back" || slot === "skirt-back";
            const pinnable = selected !== null && !filled;
            return (
              <g
                key={slot}
                className={filled ? "ad-slot-zone ad-slot-zone--filled" : "ad-slot-zone"}
                data-slot={slot}
                tabIndex={pinnable ? 0 : undefined}
                role={pinnable ? "button" : undefined}
                aria-label={pinnable ? `Pin to the ${SLOT_LABELS[slot].toLowerCase()}` : undefined}
                onPointerUp={() => {
                  if (selected !== null && drag === null) tryAssign(selected, slot);
                }}
                onKeyDown={(event) => {
                  if (selected === null || (event.key !== "Enter" && event.key !== " ")) return;
                  event.preventDefault();
                  tryAssign(selected, slot);
                }}
              >
                <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx={11} />
                {!filled ? (
                  <text
                    x={rect.x + rect.width / 2}
                    y={rect.y + rect.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {back ? `${SLOT_LABELS[slot]} ↺` : SLOT_LABELS[slot]}
                  </text>
                ) : (
                  <g transform={`translate(${rect.x + rect.width - 10} ${rect.y + 10})`}>
                    <circle r={9} />
                    <path d="M-4 0 L-1 3 L4 -3" />
                  </g>
                )}
              </g>
            );
          })}
          {slots
            .filter((slot) => run.assembly[slot] === null && selected !== null)
            .map((slot) => (
              <SlotHighlight key={`hint-${slot}`} slot={slot} tone="rose" />
            ))}
          {drag !== null && drag.slot !== null ? (
            <SlotHighlight slot={drag.slot} tone={hoverIssue === null ? "sage" : "danger"} />
          ) : null}
          {feedback?.tone === "gentle" && feedback.slot !== null ? (
            <SlotHighlight key={`miss-${feedback.serial}`} slot={feedback.slot} tone="danger" />
          ) : null}
        </DressPreview>
        <p className="ad-assemble-stage__legend ad-muted">
          ↺ marks a back piece: it sits behind the front on the real dress.
        </p>
      </div>
      {drag !== null && drag.moved && dragEntry !== undefined ? (
        <div
          className="ad-panel-ghost"
          style={{ transform: `translate(${drag.x - 40}px, ${drag.y - 40}px)` }}
          aria-hidden="true"
        >
          <PieceThumb
            piece={dragEntry.piece}
            fabric={dragEntry.fabricId === null ? undefined : fabricById(dragEntry.fabricId)}
            size={80}
            cut
          />
          {drag.slot !== null ? (
            <span
              className={
                hoverIssue === null ? "ad-panel-ghost__tag" : "ad-panel-ghost__tag ad-panel-ghost__tag--miss"
              }
            >
              {SLOT_LABELS[drag.slot]}
            </span>
          ) : null}
        </div>
      ) : null}
      <StageFooter {...props} hint="The dress is pinned together. Time to sew!" />
    </div>
  );
}
