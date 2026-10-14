import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { FLOORS } from "../../../content/floor";
import { FURNITURE, type FurnitureId } from "../../../content/furniture";
import { LIGHTS, type LightId } from "../../../content/light";
import { PAINTS, type PaintId } from "../../../content/paint";
import { MAX_LIGHTS, type MakeoverRun } from "../../../core";
import { FurniturePreview } from "../../art/FurniturePreview";
import { roomHex } from "../../art/roomHex";
import type { DragHandlers } from "../../usePointerDrag";

interface PlanTrayProps {
  readonly run: MakeoverRun;
  readonly furnitureHandlers: (furnitureId: FurnitureId) => DragHandlers;
  readonly onPaint: (slot: "wall" | "feature", paintId: PaintId | null) => void;
  readonly onFloor: (floorId: (typeof FLOORS)[number]["id"]) => void;
  readonly onAddLight: (lightId: LightId) => void;
  readonly onRemoveLight: (index: number) => void;
}

function Suns({ strength }: { readonly strength: number }) {
  const count = strength >= 1.2 ? 3 : strength >= 1 ? 2 : 1;
  return (
    <span className="is-tray__suns" aria-label={`${count} of 3 suns`}>
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className={index < count ? "is-tray__sun is-tray__sun--on" : "is-tray__sun"} />
      ))}
    </span>
  );
}

export function trayCardId(furnitureId: FurnitureId): string {
  return `is-tray-card-${furnitureId}`;
}

export function PlanTray({
  run,
  furnitureHandlers,
  onPaint,
  onFloor,
  onAddLight,
  onRemoveLight,
}: PlanTrayProps) {
  const { plan, brief } = run;
  const mustHave = new Set(brief.mustHaves.map((need) => need.itemId));
  const soft = roomHex(run.softColour);
  return (
    <div className="is-tray">
      <section aria-labelledby="is-tray-furniture">
        <h3 id="is-tray-furniture" className="is-tray__heading">
          Furniture <span className="is-muted">drag onto the plan, or tap to add</span>
        </h3>
        <div className="is-tray__furniture">
          {FURNITURE.map((def) => (
            <button
              key={def.id}
              id={trayCardId(def.id)}
              type="button"
              className={mustHave.has(def.id) ? "is-tray__card is-tray__card--must" : "is-tray__card"}
              data-testid={`tray-${def.id}`}
              aria-label={`${def.name}, ${def.price} coins${mustHave.has(def.id) ? ", a must-have" : ""}`}
              {...furnitureHandlers(def.id)}
            >
              <FurniturePreview furnitureId={def.id} soft={soft} className="is-tray__symbol" />
              <span className="is-tray__name">{def.name}</span>
              <span className="is-tray__meta">
                <Icon name="coin" size={12} /> {def.price} · {def.width}×{def.depth}
                {def.tall ? " · tall" : ""}
              </span>
              {mustHave.has(def.id) ? <span className="is-tray__must">Must-have</span> : null}
            </button>
          ))}
        </div>
      </section>
      <section aria-labelledby="is-tray-walls">
        <h3 id="is-tray-walls" className="is-tray__heading">
          Wall paint
        </h3>
        <div className="is-tray__chips" role="radiogroup" aria-label="Wall paint">
          {PAINTS.map((paint) => (
            <button
              key={paint.id}
              type="button"
              role="radio"
              aria-checked={plan.wallPaint === paint.id}
              className="is-chip"
              onClick={() => onPaint("wall", paint.id)}
            >
              <span className="is-chip__swatch" style={{ background: roomHex(paint.colour) }} />
              <span className="is-chip__name">{paint.name}</span>
              <span className="is-chip__meta">
                <Icon name="coin" size={11} /> {paint.price} · {paint.tags.join(", ")}
              </span>
            </button>
          ))}
        </div>
        <h3 className="is-tray__heading">
          Feature wall <span className="is-muted">optional, on the back wall</span>
        </h3>
        <div
          className="is-tray__chips is-tray__chips--small"
          role="radiogroup"
          aria-label="Feature wall paint"
        >
          <button
            type="button"
            role="radio"
            aria-checked={plan.featurePaint === null}
            className="is-chip is-chip--none"
            onClick={() => onPaint("feature", null)}
          >
            <span className="is-chip__name">No feature wall</span>
          </button>
          {PAINTS.filter((paint) => paint.id !== plan.wallPaint).map((paint) => (
            <button
              key={paint.id}
              type="button"
              role="radio"
              aria-checked={plan.featurePaint === paint.id}
              aria-label={`Feature wall: ${paint.name}`}
              className="is-chip is-chip--mini"
              onClick={() => onPaint("feature", paint.id)}
            >
              <span className="is-chip__swatch" style={{ background: roomHex(paint.colour) }} />
            </button>
          ))}
        </div>
      </section>
      <section aria-labelledby="is-tray-floor">
        <h3 id="is-tray-floor" className="is-tray__heading">
          Floor
        </h3>
        <div className="is-tray__chips" role="radiogroup" aria-label="Floor">
          {FLOORS.map((floor) => (
            <button
              key={floor.id}
              type="button"
              role="radio"
              aria-checked={plan.floor === floor.id}
              className="is-chip"
              onClick={() => onFloor(floor.id)}
            >
              <span
                className={`is-chip__floor is-chip__floor--${floor.pattern}`}
                style={{ background: roomHex(floor.colours[0] ?? "ivory") }}
              />
              <span className="is-chip__name">{floor.name}</span>
              <span className="is-chip__meta">
                <Icon name="coin" size={11} /> {floor.pricePerPack} per 10 squares
              </span>
            </button>
          ))}
        </div>
      </section>
      <section aria-labelledby="is-tray-lights">
        <h3 id="is-tray-lights" className="is-tray__heading">
          Lights <span className="is-muted">up to {MAX_LIGHTS}</span>
        </h3>
        <div className="is-tray__lights">
          {LIGHTS.map((light) => (
            <button
              key={light.id}
              type="button"
              className="is-light-card"
              onClick={() => onAddLight(light.id)}
              disabled={plan.lights.length >= MAX_LIGHTS}
              aria-label={`Add ${light.name}, ${light.price} coins, ${light.warmth}`}
            >
              <span className="is-light-card__name">{light.name}</span>
              <Suns strength={light.strength} />
              <span className="is-chip__meta">
                <Icon name="coin" size={11} /> {light.price} · {light.warmth} · {light.mount}
              </span>
            </button>
          ))}
        </div>
        {plan.lights.length > 0 ? (
          <ul className="is-tray__chosen" aria-label="Chosen lights">
            {plan.lights.map((lightId, index) => (
              <li key={`${lightId}-${index}`}>
                <span>{LIGHTS.find((light) => light.id === lightId)?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveLight(index)}
                  aria-label={`Remove light ${index + 1}`}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
