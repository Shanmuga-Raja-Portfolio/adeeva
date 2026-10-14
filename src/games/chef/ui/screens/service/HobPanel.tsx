import type { Dish } from "../../../content/dish";
import { quickSizzle } from "../../../core";
import { HeatDial } from "../cook/HeatDial";
import { flipPiece, movePiece, takeOff, tossPan, type PanSim } from "../cook/panSim";
import { SizzlePan } from "../cook/SizzlePan";
import { sizzleInstruction } from "../../instructions/sizzleInstruction";
import type { WaitingDish } from "./serviceView";

export interface HobPanProps {
  readonly dish: Dish;
  readonly sim: PanSim;
  readonly assisted: boolean;
  readonly reducedMotion: boolean;
  readonly onChange: (change: (sim: PanSim) => PanSim) => void;
}

export function HobPan({ dish, sim, assisted, reducedMotion, onChange }: HobPanProps) {
  const sizzle = dish.sizzle;
  if (sizzle === null) return null;
  const def = quickSizzle(sizzle);
  return (
    <div>
      <p className="ck-muted">{dish.name}</p>
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {sizzleInstruction({ def, sim, heat: sim.heat, assisted, paused: false })}
      </p>
      <SizzlePan
        def={def}
        sim={sim}
        assisted={assisted}
        reducedMotion={reducedMotion}
        onFlip={(index) => onChange((current) => flipPiece(current, def, index))}
        onMove={(index, zone, x, y) => onChange((current) => movePiece(current, index, zone, x, y))}
        onOff={(index) => onChange((current) => takeOff(current, index))}
        onToss={() => onChange((current) => tossPan(current, def))}
      />
    </div>
  );
}

export interface HobStartProps {
  readonly waiting: WaitingDish;
  readonly dish: Dish;
  readonly ideal: number;
  readonly heat: number;
  readonly assisted: boolean;
  readonly onHeat: (heat: number) => void;
  readonly onStart: () => void;
}

export function HobStart({ waiting, dish, ideal, heat, assisted, onHeat, onStart }: HobStartProps) {
  const sizzle = dish.sizzle;
  return (
    <div className="ck-service__hob-start">
      <p className="ck-muted">
        {dish.name} for table {waiting.table}
      </p>
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {sizzle === null
          ? null
          : sizzleInstruction({ def: sizzle, sim: null, heat, assisted, paused: false })}
      </p>
      <HeatDial value={assisted ? ideal : heat} ideal={ideal} locked={assisted} onChange={onHeat} />
      <button type="button" className="ck-big-button" onClick={onStart} data-testid="pan-start">
        Into the pan!
      </button>
    </div>
  );
}
