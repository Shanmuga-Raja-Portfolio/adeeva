import { useState } from "react";
import type { FollowProgress } from "../../../../../engine/followRecord";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ChopRecord, GameState, QuickRecord, ServiceRun } from "../../../core";
import {
  cardFor,
  chopWindow,
  cuisineJars,
  dishById,
  ghostLayout,
  quickChopItems,
  quickTasteStart,
  QUICK_SIMMER_LAPS,
  simmerHalo,
  tasteRadius,
  toleranceFor,
} from "../../../core";
import { PlateArt } from "../../art/PlateArt";
import { quickPassInstruction } from "../../instructions/stageInstruction";
import { useKitchenSound } from "../../sound/SoundContext";
import { ChopBoard } from "../cook/ChopBoard";
import { SimmerPot } from "../cook/SimmerPot";
import { TasteCompass } from "../cook/TasteCompass";
import type { WaitingDish } from "./serviceView";

export interface QuickStationProps {
  readonly state: GameState;
  readonly service: ServiceRun;
  readonly dish: WaitingDish;
  readonly assisted: boolean;
  readonly reducedMotion: boolean;
  readonly onRecord: (record: QuickRecord) => void;
}

function serviceDishId(service: ServiceRun, dish: WaitingDish) {
  const entry = service.tickets[dish.ticketIndex]?.dishes[dish.slot.dishIndex];
  if (entry === undefined) throw new Error("Missing ticket dish");
  return entry.dishId;
}

export function QuickChop({ state, service, dish, assisted, reducedMotion, onRecord }: QuickStationProps) {
  const def = dishById(serviceDishId(service, dish));
  const items = quickChopItems(def.chop);
  const [records, setRecords] = useState<readonly ChopRecord[]>([]);
  const item = items[records.length];
  if (item === undefined) return null;
  return (
    <ChopBoard
      key={`${dish.key}-${records.length}`}
      item={item}
      difficulty={state.profile.difficulty}
      window={chopWindow(toleranceFor(state, "chop"))}
      assisted={assisted}
      reducedMotion={reducedMotion}
      onDone={(record) => {
        const next = [...records, record];
        setRecords(next);
        if (next.length === items.length) onRecord({ kind: "chop", items: next });
      }}
    />
  );
}

export function QuickSimmer({ state, service, dish, assisted, reducedMotion, onRecord }: QuickStationProps) {
  const def = dishById(serviceDishId(service, dish));
  if (def.simmer === null) return null;
  return (
    <SimmerPot
      key={dish.key}
      def={def.simmer}
      laps={QUICK_SIMMER_LAPS}
      halo={simmerHalo(toleranceFor(state, "simmer"), assisted)}
      colour={def.simmer.colour}
      assisted={assisted}
      reducedMotion={reducedMotion}
      stored={null}
      onStop={(follow: FollowProgress) => onRecord({ kind: "simmer", follow })}
    />
  );
}

export function QuickTaste({ state, service, dish, assisted, reducedMotion, onRecord }: QuickStationProps) {
  const def = dishById(serviceDishId(service, dish));
  const start = quickTasteStart(state, service.seed, dish.ticketIndex, dish.slot.dishIndex, def);
  if (def.taste === null || start === null) return null;
  return (
    <TasteCompass
      key={dish.key}
      def={def.taste}
      jars={cuisineJars(def.cuisine)}
      start={start.start}
      radius={tasteRadius(toleranceFor(state, "taste"))}
      helper={start.helper}
      assisted={assisted}
      reducedMotion={reducedMotion}
      onDone={(record) => onRecord({ kind: "taste", ...record })}
    />
  );
}

export function QuickPass({ state, service, dish, onRecord }: QuickStationProps) {
  const { play } = useKitchenSound();
  const def = dishById(serviceDishId(service, dish));
  const card = cardFor(state.platingCards, def.id);
  const [wiped, setWiped] = useState(false);
  return (
    <div className="ck-quick-pass" data-testid="quick-pass">
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {quickPassInstruction(wiped)}
      </p>
      <PlateArt
        colour={card?.plateColour ?? "white"}
        components={card?.components ?? ghostLayout(def)}
        title={`${def.name} for table ${dish.table}`}
        className="ck-quick-pass__plate"
      />
      <p className="ck-muted">
        {card === null
          ? "No plating card yet, so the ghost plate is used."
          : "Your plating card, plated just the same."}
      </p>
      <div className="ck-plate__actions">
        <button
          type="button"
          className="ck-big-button ck-big-button--cloth"
          disabled={wiped}
          onClick={() => {
            setWiped(true);
            play("sparkle");
          }}
          data-testid="quick-wipe"
        >
          Wipe rim
        </button>
        <button
          type="button"
          className="ck-big-button ck-big-button--go"
          onClick={() => {
            play("bell");
            onRecord({ kind: "plate", wiped });
          }}
          data-testid="quick-service"
        >
          <Icon name="sparkle" size={18} /> Service!
        </button>
      </div>
    </div>
  );
}
