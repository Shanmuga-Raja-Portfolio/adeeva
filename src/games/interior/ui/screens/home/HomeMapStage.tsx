import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { HOME_HINTS } from "../../../content/hints";
import type { PurposeId } from "../../../content/roomPurpose";
import {
  isMapComplete,
  mapFit,
  placePurposeIssue,
  plotById,
  plotSpaces,
  purposeById,
  roomById,
  type SpaceView,
} from "../../../core";
import type { HomeStageProps } from "./HomeScreen";

interface CardDrag {
  readonly purposeId: PurposeId;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
}

const MINI_CELL = 16;
const DRAG_START = 6;

function SpacePlan({ space }: { readonly space: SpaceView }) {
  const room = roomById(space.roomId);
  const width = room.cols * MINI_CELL;
  const height = room.rows * MINI_CELL;
  return (
    <svg viewBox={`-8 -8 ${width + 16} ${height + 16}`} className="is-space__plan" aria-hidden="true">
      <rect x={-8} y={-8} width={width + 16} height={height + 16} rx={8} fill="#3c6aa8" />
      {Array.from({ length: room.cols * room.rows }, (_, index) => (
        <rect
          key={index}
          x={(index % room.cols) * MINI_CELL + 1}
          y={Math.floor(index / room.cols) * MINI_CELL + 1}
          width={MINI_CELL - 2}
          height={MINI_CELL - 2}
          fill="#ffffff"
          opacity={0.12}
        />
      ))}
      <rect width={width} height={height} fill="none" stroke="#ffffff" strokeWidth={2.5} />
      {room.windows.map((window) =>
        window.wall === "back" ? (
          <rect
            key={`b${window.from}`}
            x={window.from * MINI_CELL + 2}
            y={-3}
            width={(window.to - window.from) * MINI_CELL - 4}
            height={6}
            fill="#bfe3f6"
          />
        ) : (
          <rect
            key={`s${window.from}`}
            x={-3}
            y={window.from * MINI_CELL + 2}
            width={6}
            height={(window.to - window.from) * MINI_CELL - 4}
            fill="#bfe3f6"
          />
        ),
      )}
      {room.roofWindow ? (
        <rect
          x={width / 2 - MINI_CELL}
          y={4}
          width={MINI_CELL * 2}
          height={MINI_CELL * 0.7}
          rx={3}
          fill="none"
          stroke="#bfe3f6"
          strokeWidth={2}
          strokeDasharray="3 2"
        />
      ) : null}
      <rect
        x={room.doorCol * MINI_CELL + 2}
        y={height - 3}
        width={MINI_CELL * 2 - 4}
        height={6}
        fill="#f6d77a"
      />
      {space.throughRow === null ? null : (
        <rect
          x={width - 3}
          y={space.throughRow * MINI_CELL + 2}
          width={6}
          height={MINI_CELL - 4}
          fill="#f6d77a"
        />
      )}
    </svg>
  );
}

function wishes(purposeId: PurposeId): string {
  const purpose = purposeById(purposeId);
  const parts = [`${purpose.minCells}+ squares`];
  if (purpose.windowWish > 0)
    parts.push(`${purpose.windowWish} ${purpose.windowWish === 1 ? "window" : "windows"}`);
  if (purpose.quiet) parts.push("quiet, at the back");
  return parts.join(" · ");
}

export function HomeMapStage({ state, project, dispatch }: HomeStageProps) {
  const once = useDispatchOnce(state, dispatch);
  const plot = plotById(project.plotId);
  const spaces = plotSpaces(plot);
  const [picked, setPicked] = useState<PurposeId | null>(null);
  const [hint, setHint] = useState<string>(HOME_HINTS.homeMap);
  const [drag, setDrag] = useState<CardDrag | null>(null);
  const spaceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const complete = isMapComplete(plot, project.map);
  const fit = mapFit(plot, project.map.spaces);

  const place = (purposeId: PurposeId, spaceIndex: number) => {
    const issue = placePurposeIssue(project, purposeId, spaceIndex);
    if (issue !== null) {
      setHint(issue);
      return;
    }
    if (dispatch({ type: "placePurpose", purposeId, spaceIndex })) {
      setHint(`${purposeById(purposeId).name} goes in Space ${spaceIndex + 1}.`);
      setPicked(null);
    }
  };

  const down = (event: PointerEvent<HTMLButtonElement>, purposeId: PurposeId) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      purposeId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    });
  };

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null) return;
    const moved =
      drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > DRAG_START;
    setDrag({ ...drag, x: event.clientX, y: event.clientY, moved });
  };

  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null) return;
    const finished = drag;
    setDrag(null);
    if (!finished.moved) {
      setPicked(picked === finished.purposeId ? null : finished.purposeId);
      return;
    }
    const target = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find((element) => element instanceof HTMLElement && element.dataset["space"] !== undefined);
    const index = target instanceof HTMLElement ? Number(target.dataset["space"]) : NaN;
    if (Number.isInteger(index)) place(finished.purposeId, index);
  };

  const spaceKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    spaceRefs.current[(index + step + spaces.length) % spaces.length]?.focus();
  };

  const placedIn = (purposeId: PurposeId) => project.map.spaces.indexOf(purposeId);

  return (
    <div className="is-map">
      <p className="is-home__hint" role="status" aria-live="polite" data-testid="map-hint">
        <Icon name="sparkle" size={16} /> {hint}
      </p>
      <div className="is-map__layout">
        <section className="is-map__cards" aria-labelledby="is-map-cards">
          <h2 id="is-map-cards" className="is-tray__heading">
            Who lives here? <span className="is-muted">drag a card, or tap it then a space</span>
          </h2>
          <div className="is-map__card-list">
            {plot.purposes.map((purposeId) => {
              const purpose = purposeById(purposeId);
              const where = placedIn(purposeId);
              return (
                <button
                  key={purposeId}
                  type="button"
                  className={[
                    "is-purpose-card",
                    picked === purposeId ? "is-purpose-card--picked" : "",
                    where >= 0 ? "is-purpose-card--placed" : "",
                  ]
                    .filter((name) => name.length > 0)
                    .join(" ")}
                  aria-pressed={picked === purposeId}
                  onPointerDown={(event) => down(event, purposeId)}
                  onPointerMove={move}
                  onPointerUp={up}
                  onPointerCancel={() => setDrag(null)}
                  onClick={(event) => {
                    if (event.detail === 0) setPicked(picked === purposeId ? null : purposeId);
                  }}
                  data-testid={`purpose-${purposeId}`}
                >
                  <span className="is-purpose-card__name">{purpose.name}</span>
                  <span className="is-purpose-card__wish">{wishes(purposeId)}</span>
                  <span className="is-purpose-card__where">
                    {where >= 0 ? `In Space ${where + 1}` : "Not placed yet"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="is-map__fit">
            <Meter
              label="How well the home fits"
              value={Math.round(fit * 100)}
              tone="sage"
              valueText={`${Math.round(fit * 100)}%`}
            />
          </div>
          {project.map.fromAchebe && state.profile.difficulty !== "relaxed" ? (
            <p className="is-muted" data-testid="achebe-map-cap">
              {HOME_HINTS.achebeMap}
            </p>
          ) : null}
          <div className="is-map__actions">
            <Button
              variant="secondary"
              icon="sparkle"
              onClick={(event) => {
                if (once(event, { type: "useAchebeMap" })) setHint("Ms. Achebe suggests this map.");
              }}
              data-testid="achebe-map"
            >
              Ms. Achebe suggests…
            </Button>
            <Button
              size="lg"
              disabledReason={complete ? undefined : "Place every room card first."}
              showReason
              onClick={(event) => once(event, { type: "confirmMap" })}
              data-testid="confirm-map"
            >
              That's the map
            </Button>
          </div>
        </section>
        <section className="is-map__house" aria-labelledby="is-map-house">
          <h2 id="is-map-house" className="is-tray__heading">
            {plot.name} <span className="is-muted">front door on the left, back garden at the top</span>
          </h2>
          <div className="is-map__spaces">
            {spaces.map((space, index) => {
              const assigned = project.map.spaces[index] ?? null;
              return (
                <button
                  key={space.index}
                  ref={(element) => {
                    spaceRefs.current[index] = element;
                  }}
                  type="button"
                  data-space={index}
                  className={[
                    "is-space",
                    `is-space--${space.side}`,
                    space.hall ? "is-space--hall" : "",
                    assigned !== null && !space.hall ? "is-space--filled" : "",
                    drag !== null && drag.moved ? "is-space--target" : "",
                  ]
                    .filter((name) => name.length > 0)
                    .join(" ")}
                  aria-label={`Space ${index + 1}, ${space.side}, ${space.cells} squares, ${space.windows} ${space.windows === 1 ? "window" : "windows"}${assigned === null ? ", empty" : `, ${purposeById(assigned).name}`}`}
                  onClick={() => {
                    if (picked !== null) place(picked, index);
                    else if (space.hall) setHint("The hall always stays the hall.");
                    else if (assigned !== null) dispatch({ type: "clearSpace", spaceIndex: index });
                  }}
                  onKeyDown={(event) => spaceKeys(event, index)}
                  data-testid={`space-${index}`}
                >
                  <span className="is-space__name">
                    {space.hall ? "Entrance Hall" : `Space ${index + 1}`}
                  </span>
                  <SpacePlan space={space} />
                  <span className="is-space__facts">
                    <span className={`is-space__side is-space__side--${space.side}`}>
                      {space.side === "front" ? "Front" : "Back"}
                    </span>
                    <span>{space.cells} squares</span>
                    <span>
                      {space.windows} {space.windows === 1 ? "window" : "windows"}
                    </span>
                  </span>
                  <span className="is-space__who">
                    {assigned === null ? "Drop a room here" : purposeById(assigned).name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
      {drag !== null && drag.moved ? (
        <div className="is-home__ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {purposeById(drag.purposeId).name}
        </div>
      ) : null}
    </div>
  );
}
