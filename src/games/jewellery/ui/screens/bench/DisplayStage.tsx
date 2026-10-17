import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { clampPose, poseOf, samePose, type PlacedPose } from "../../../../../engine/placedPose";
import { colourById } from "../../../../../engine/palette";
import { Button } from "../../../../../ui/kit/Button";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { Icon } from "../../../../../ui/kit/IconSet";
import { CHARM_IDS, type ChainId, type CharmId } from "../../../content/extra";
import { FINISHES, type FinishId } from "../../../content/finish";
import { HINTS } from "../../../content/hints";
import { GLAZE_COLOURS, type GlazeColour } from "../../../content/jewelColour";
import {
  availableCharms,
  CHARM_ROTATION_STEP,
  coloredHolder,
  DISPLAY_CANVAS,
  dullSpotsLeft,
  extraById,
  finishById,
  MAX_CHARM_SCALE,
  motifCharmShape,
  productById,
  runSource,
  type PlacedCharm,
} from "../../../core";
import { CharmArt } from "../../art/CharmArt";
import { charmTransform, PiecePreview } from "../../art/PiecePreview";
import { ChoiceGrid } from "./ChoiceGrid";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./display.css";

interface CharmDrag {
  readonly id: string;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly origin: PlacedPose;
  readonly pose: PlacedPose;
  readonly moved: boolean;
}

const MOVE_THRESHOLD = 6;
const NUDGE = 6;

function GlazePicker({
  value,
  onPick,
  label,
}: {
  value: GlazeColour | null;
  onPick: (colour: GlazeColour) => void;
  label: string;
}) {
  return (
    <ChoiceGrid<GlazeColour>
      label={label}
      className="jb-choices--swatches"
      value={value}
      onChange={onPick}
      choices={GLAZE_COLOURS.map((colour) => ({
        value: colour,
        label: colourById(colour).name,
        content: <span className="jb-swatch" style={{ background: colourById(colour).hex }} />,
      }))}
    />
  );
}

export function DisplayStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<CharmDrag | null>(null);
  const product = productById(run.design.productId);
  const { display } = run;
  const svg = () => wrapRef.current?.querySelector("svg") ?? null;
  const charms: PlacedCharm[] = display.charms.map((charm) =>
    drag !== null && drag.id === charm.id ? { ...charm, ...drag.pose } : charm,
  );
  const source = { ...runSource(run), charms };
  const chosen = charms.find((charm) => charm.id === selected);
  const holder = product.holder;
  const ownedChains = (holder?.choices ?? []).filter(
    (id) => state.stock.extras[id] >= (holder?.count ?? 1) || display.chain === id,
  );
  const lineFinish = run.purpose.kind === "collection";
  const motifShape = motifCharmShape(state, run);

  const update = (charm: PlacedCharm, change: Partial<PlacedPose>) => {
    const pose = clampPose(DISPLAY_CANVAS, { ...poseOf(charm), ...change });
    const scale = Math.min(MAX_CHARM_SCALE, pose.scale);
    dispatch({
      type: "moveCharm",
      charmPieceId: charm.id,
      ...pose,
      scale,
      rotation: Math.round(pose.rotation / CHARM_ROTATION_STEP) * CHARM_ROTATION_STEP,
    });
  };

  const addCharm = (charmId: CharmId) => {
    const index = display.charms.length;
    const added = dispatch({
      type: "addCharm",
      charmId,
      x: 70 + (index % 4) * 34,
      y: 196 - Math.floor(index / 4) * 30,
    });
    if (added) setSelected(`charm-${display.nextCharmNumber}`);
  };

  const begin = (event: PointerEvent<SVGGElement>, charm: PlacedCharm) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const origin = poseOf(charm);
    setDrag({
      id: charm.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin,
      pose: origin,
      moved: false,
    });
  };
  const moveDrag = (event: PointerEvent<SVGGElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    const start = clientToSvg(svg(), drag.startX, drag.startY);
    const point = clientToSvg(svg(), event.clientX, event.clientY);
    if (start === null || point === null) return;
    const moved =
      drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > MOVE_THRESHOLD;
    setDrag({
      ...drag,
      moved,
      pose: clampPose(DISPLAY_CANVAS, {
        ...drag.origin,
        x: drag.origin.x + point.x - start.x,
        y: drag.origin.y + point.y - start.y,
      }),
    });
  };
  const endDrag = (event: PointerEvent<SVGGElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    setDrag(null);
    if (!drag.moved) {
      dispatch({ type: "removeCharm", charmPieceId: drag.id });
      setSelected(null);
      return;
    }
    setSelected(drag.id);
    if (!samePose(drag.pose, drag.origin))
      dispatch({ type: "moveCharm", charmPieceId: drag.id, ...drag.pose });
  };
  const charmKey = (event: KeyboardEvent<SVGGElement>, charm: PlacedCharm) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-NUDGE, 0],
      ArrowRight: [NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    };
    const delta = moves[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      setSelected(charm.id);
      update(charm, { x: charm.x + delta[0], y: charm.y + delta[1] });
    } else if (event.key === "Delete" || event.key === "Backspace" || event.key === "Enter") {
      event.preventDefault();
      dispatch({ type: "removeCharm", charmPieceId: charm.id });
      setSelected(null);
    }
  };

  return (
    <div className="jb-display">
      <div className="jb-display__layout">
        <div className="jb-display__stage" ref={wrapRef}>
          <PiecePreview
            source={source}
            title={`Your ${product.name}`}
            twinkle
            showCharms={false}
            className="jb-display__piece"
          >
            {charms
              .slice()
              .sort((a, b) => a.layer - b.layer)
              .map((charm) => (
                <g
                  key={charm.id}
                  transform={charmTransform(charm)}
                  className={charm.id === selected ? "jb-charm jb-charm--on" : "jb-charm"}
                  onPointerDown={(event) => begin(event, charm)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={() => setDrag(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${extraById(charm.charmId).name}. Arrow keys move it, Enter puts it back.`}
                  onKeyDown={(event) => charmKey(event, charm)}
                  data-testid={`placed-${charm.charmId}`}
                >
                  <circle r={22} fill="transparent" />
                  {charm.id === selected ? (
                    <circle r={20} fill="none" stroke="#e8a33d" strokeWidth={1.4} strokeDasharray="3 3" />
                  ) : null}
                  <CharmArt charmId={charm.charmId} shape={charm.shape} />
                </g>
              ))}
          </PiecePreview>
          {chosen !== undefined ? (
            <div className="jb-tools">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => update(chosen, { rotation: chosen.rotation - CHARM_ROTATION_STEP })}
                aria-label="Turn charm left"
              >
                ⟲
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => update(chosen, { rotation: chosen.rotation + CHARM_ROTATION_STEP })}
                aria-label="Turn charm right"
              >
                ⟳
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => update(chosen, { scale: Math.max(0.5, chosen.scale - 0.1) })}
                aria-label="Make charm smaller"
              >
                −
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => update(chosen, { scale: Math.min(MAX_CHARM_SCALE, chosen.scale + 0.1) })}
                aria-label="Make charm bigger"
              >
                +
              </Button>
            </div>
          ) : null}
          {dullSpotsLeft(run) ? <p className="jb-hint-line jb-hint-line--warn">{HINTS.dullSpots}</p> : null}
        </div>
        <div className="jb-display__controls">
          <section className="jb-design__group">
            <h3>Finish</h3>
            {lineFinish ? (
              <p className="jb-line-lock" data-testid="line-finish">
                <span className={`jb-finish-chip jb-finish-chip--${display.finish}`} />
                <span>
                  <strong>{finishById(display.finish).name}</strong> for the whole line. Every piece shares
                  it.
                </span>
              </p>
            ) : null}
            {lineFinish ? null : (
              <ChoiceGrid<FinishId>
                label="Finish"
                value={display.finish}
                onChange={(finish) =>
                  dispatch({
                    type: "chooseFinish",
                    finish,
                    glaze: finish === "glaze" ? (display.glaze ?? "sky") : null,
                  })
                }
                choices={FINISHES.map((finish) => ({
                  value: finish.id,
                  label: `${finish.name}, ${finish.price} coins`,
                  content: (
                    <>
                      <span className={`jb-finish-chip jb-finish-chip--${finish.id}`} />
                      <span className="jb-choice__name">{finish.name}</span>
                      <span className="jb-choice__sub">
                        <Icon name="coin" size={12} /> {finish.price}
                      </span>
                    </>
                  ),
                }))}
              />
            )}
            {display.finish === "glaze" && !lineFinish ? (
              <GlazePicker
                label="Glaze colour"
                value={display.glaze}
                onPick={(glaze) => dispatch({ type: "chooseFinish", finish: "glaze", glaze })}
              />
            ) : null}
          </section>
          {holder !== null ? (
            <section className="jb-design__group">
              <h3>{holder.choices.includes("bag-clip") ? "Bag clip" : "Chain or cord"}</h3>
              {holder.count > 1 ? (
                <p className="jb-hint">Uses {holder.count}: one for each half, so two friends can share.</p>
              ) : null}
              {ownedChains.length === 0 ? <p className="jb-hint">{HINTS.chainFirst}</p> : null}
              <ChoiceGrid<ChainId>
                label="Chain or cord"
                value={display.chain}
                onChange={(chain) =>
                  dispatch({
                    type: "chooseChain",
                    chain,
                    cordColour: coloredHolder(chain) ? (display.cordColour ?? "lavender") : null,
                  })
                }
                choices={ownedChains.map((id) => ({
                  value: id,
                  label: extraById(id).name,
                  content: (
                    <>
                      <span className={`jb-chain-chip jb-chain-chip--${id}`} />
                      <span className="jb-choice__name">{extraById(id).name}</span>
                    </>
                  ),
                }))}
              />
              {display.chain !== null && coloredHolder(display.chain) ? (
                <GlazePicker
                  label="Cord colour"
                  value={display.cordColour}
                  onPick={(cordColour) => dispatch({ type: "chooseChain", chain: display.chain, cordColour })}
                />
              ) : null}
            </section>
          ) : null}
          <section className="jb-design__group">
            <h3>Charms</h3>
            <div className="jb-charm-tray">
              {CHARM_IDS.map((id) => {
                const left = availableCharms(state, id);
                return (
                  <button
                    key={id}
                    type="button"
                    className="jb-charm-tile"
                    disabled={left <= 0}
                    onClick={() => addCharm(id)}
                    data-testid={`charm-${id}`}
                    aria-label={`Add ${extraById(id).name}, ${left} left`}
                  >
                    <svg viewBox="-20 -22 40 40" aria-hidden="true">
                      <CharmArt charmId={id} shape={motifShape} />
                    </svg>
                    <span>{extraById(id).name}</span>
                    <span className="jb-choice__sub">{left} left</span>
                  </button>
                );
              })}
            </div>
            <p className="jb-hint">Tap a charm to add it. Drag to move. Tap it again to put it back.</p>
            {run.purpose.kind === "collection" ? (
              <p className="jb-hint">The Motif Charm takes your line's motif: {motifShape}.</p>
            ) : null}
          </section>
        </div>
      </div>
      <StageFooter
        {...props}
        ready={
          run.purpose.kind === "stall"
            ? "Ready for the stall box!"
            : run.purpose.kind === "collection"
              ? "Ready to join the line!"
              : "Ready to wrap in a gift box!"
        }
      />
    </div>
  );
}
