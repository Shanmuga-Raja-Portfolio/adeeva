import { useRef, useState, type PointerEvent } from "react";
import { isInsideElement } from "../../../../../ui/kit/clientToSvg";
import type { IngredientId } from "../../../content/ingredient";
import { dishById, ingredientById } from "../../../core";
import { IngredientIcon } from "../../art/IngredientIcon";
import { useKitchenSound } from "../../sound/SoundContext";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import { miseInstruction } from "../../instructions/stageInstruction";

interface Carry {
  readonly id: IngredientId;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
  readonly startX: number;
  readonly startY: number;
}

export function MiseStage(props: StageProps) {
  const { run, dispatch } = props;
  const { play } = useKitchenSound();
  const dish = dishById(run.dishId);
  const bowlsRef = useRef<HTMLDivElement | null>(null);
  const shelfRef = useRef<HTMLDivElement | null>(null);
  const tiles = useRef(new Map<IngredientId, HTMLButtonElement>());
  const [carry, setCarry] = useState<Carry | null>(null);
  const waiting = dish.ingredients.filter((id) => !run.mise.includes(id));

  const place = (id: IngredientId) => {
    if (dispatch({ type: "placeIngredient", ingredientId: id })) play("pop");
  };

  const placeByKey = (id: IngredientId) => {
    const next = waiting.slice(waiting.indexOf(id) + 1)[0] ?? waiting.find((entry) => entry !== id);
    place(id);
    const target = next === undefined ? undefined : tiles.current.get(next);
    if (target === undefined) shelfRef.current?.focus();
    else target.focus();
  };

  const down = (event: PointerEvent<HTMLButtonElement>, id: IngredientId) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setCarry({
      id,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
    });
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (carry === null) return;
    const moved = carry.moved || Math.hypot(event.clientX - carry.startX, event.clientY - carry.startY) > 6;
    setCarry({ ...carry, x: event.clientX, y: event.clientY, moved });
  };
  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (carry === null) return;
    if (!carry.moved || isInsideElement(bowlsRef.current, event.clientX, event.clientY)) place(carry.id);
    setCarry(null);
  };

  return (
    <div className="ck-mise">
      <h2 className="ck-stage-title">Mise en place</h2>
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {miseInstruction(waiting.length)}
      </p>
      <div className="ck-mise__counter">
        <div
          className="ck-mise__shelf"
          role="group"
          aria-label="Ingredients to get ready"
          tabIndex={-1}
          ref={shelfRef}
        >
          {waiting.length === 0 ? <p className="ck-good">All ready!</p> : null}
          {waiting.length === 0
            ? null
            : dish.ingredients.map((id) =>
                run.mise.includes(id) ? (
                  <span key={id} className="ck-mise__tile ck-mise__tile--empty" aria-hidden="true" />
                ) : (
                  <button
                    key={id}
                    ref={(element) => {
                      if (element === null) tiles.current.delete(id);
                      else tiles.current.set(id, element);
                    }}
                    type="button"
                    className={
                      carry?.id === id && carry.moved
                        ? "ck-mise__tile ck-mise__tile--lifted"
                        : "ck-mise__tile"
                    }
                    onPointerDown={(event) => down(event, id)}
                    onPointerMove={move}
                    onPointerUp={up}
                    onPointerCancel={() => setCarry(null)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      placeByKey(id);
                    }}
                    style={
                      carry?.id === id && carry.moved
                        ? { transform: `translate(${carry.x - carry.startX}px, ${carry.y - carry.startY}px)` }
                        : undefined
                    }
                    data-testid={`tile-${id}`}
                  >
                    <IngredientIcon ingredientId={id} size={56} />
                    <span>{ingredientById(id).name}</span>
                  </button>
                ),
              )}
        </div>
        <div className="ck-mise__bowls" ref={bowlsRef} data-testid="mise-bowls">
          {dish.ingredients.map((id, index) => {
            const filled = run.mise[index];
            return (
              <div key={id} className={filled === undefined ? "ck-bowl" : "ck-bowl ck-bowl--full"}>
                <svg viewBox="0 0 100 70" className="ck-bowl__svg" aria-hidden="true">
                  <ellipse cx={50} cy={58} rx={40} ry={8} fill="#0d1215" opacity={0.25} />
                  <path
                    d="M8 24 Q12 62 50 62 Q88 62 92 24 Z"
                    fill="#dfe5e8"
                    stroke="#7d8a91"
                    strokeWidth={3}
                  />
                  <ellipse cx={50} cy={24} rx={42} ry={10} fill="#c9d1d5" stroke="#7d8a91" strokeWidth={3} />
                </svg>
                {filled !== undefined ? (
                  <span className="ck-bowl__food">
                    <IngredientIcon ingredientId={filled} size={52} title={ingredientById(filled).name} />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <StageFooter {...props}>
        {run.mise.length}/{dish.ingredients.length} ready
      </StageFooter>
    </div>
  );
}
