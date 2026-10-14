import { useEffect, useRef, useState } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useTickLoop } from "../../../../../ui/kit/useTickLoop";
import type { SizzleDef } from "../../../content/dish";
import type { SizzleRecord } from "../../../core";
import { sizzleInstruction } from "../../instructions/sizzleInstruction";
import { useKitchenSound } from "../../sound/SoundContext";
import { HeatDial } from "./HeatDial";
import {
  flipPiece,
  movePiece,
  panDone,
  panNeedsYou,
  panRecord,
  startPan,
  stepPan,
  takeOff,
  tossPan,
  type PanSim,
} from "./panSim";
import { SizzlePan } from "./SizzlePan";

export interface SizzleStationProps {
  readonly def: SizzleDef;
  readonly assisted: boolean;
  readonly reducedMotion: boolean;
  readonly onDone: (record: SizzleRecord) => void;
}

export function SizzleStation({ def, assisted, reducedMotion, onDone }: SizzleStationProps) {
  const { play } = useKitchenSound();
  const [heat, setHeat] = useState(assisted ? def.idealDots : 3);
  const [sim, setSim] = useState<PanSim | null>(null);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const simRef = useRef<PanSim | null>(null);
  const usedAssist = useRef(assisted);
  const sent = useRef(false);
  const wasReady = useRef(false);

  useEffect(() => {
    if (assisted) usedAssist.current = true;
  }, [assisted]);

  const update = (next: PanSim) => {
    simRef.current = next;
    setSim(next);
    if (panDone(next) && !sent.current) {
      sent.current = true;
      setDone(true);
      onDone(panRecord(next, usedAssist.current));
    }
  };

  useTickLoop(sim !== null && !paused && !done, (count) => {
    const current = simRef.current;
    if (current === null) return false;
    const next = stepPan(current, def, count);
    const ready = panNeedsYou(next, def);
    if (ready && !wasReady.current) play(assisted ? "bell" : "chime");
    wasReady.current = ready;
    update(next);
    return !panDone(next);
  });

  const act = (change: (current: PanSim) => PanSim, sound: "flip" | "pop") => {
    const current = simRef.current;
    if (current === null || paused) return;
    const next = change(current);
    if (next !== current) play(sound);
    update(next);
  };

  return (
    <div className="ck-sizzle" data-testid="sizzle-station">
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {sizzleInstruction({ def, sim, heat, assisted, paused })}
      </p>
      <div className="ck-sizzle__controls">
        <HeatDial
          value={assisted ? def.idealDots : heat}
          ideal={def.idealDots}
          locked={sim !== null || assisted}
          onChange={setHeat}
        />
        <span className="ck-sizzle__card">
          Dish card: <strong>{def.idealDots} dots</strong>
        </span>
      </div>
      {sim === null ? (
        <div className="ck-sizzle__start">
          <button
            type="button"
            className="ck-big-button"
            onClick={() => {
              play("pop");
              update(startPan(def, assisted ? def.idealDots : heat));
            }}
            data-testid="pan-start"
          >
            <Icon name="sparkle" size={22} /> Into the pan!
          </button>
        </div>
      ) : (
        <>
          <SizzlePan
            def={def}
            sim={sim}
            assisted={assisted}
            reducedMotion={reducedMotion}
            onFlip={(index) => act((current) => flipPiece(current, def, index), "flip")}
            onMove={(index, zone, x, y) => act((current) => movePiece(current, index, zone, x, y), "pop")}
            onOff={(index) => act((current) => takeOff(current, index), "pop")}
            onToss={() => act((current) => tossPan(current, def), "flip")}
          />
          <div className="ck-chop__controls">
            <button
              type="button"
              className="ck-pause"
              aria-pressed={paused}
              onClick={() => setPaused((value) => !value)}
              disabled={done}
            >
              {paused ? "Resume" : "Pause"}
            </button>
            <span className="ck-chop__count">
              {sim.pieces.filter((piece) => piece.off).length} of {sim.pieces.length} on Done
            </span>
          </div>
        </>
      )}
    </div>
  );
}
