import { useState, type KeyboardEvent } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";

const LEVEL_SLOTS = [
  { slot: "on-big", name: "Middle tier", start: 16 },
  { slot: "on-middle", name: "Small tier", start: -12 },
] as const;

const NUDGE = 4;

export interface LevelOffsets {
  readonly offset: (slot: string) => number;
  readonly nudge: (slot: string, step: number) => void;
  readonly allLevel: (stack: Readonly<Record<string, string>>) => boolean;
}

export function useLevelOffsets(): LevelOffsets {
  const [offsets, setOffsets] = useState<Readonly<Record<string, number>>>(() =>
    Object.fromEntries(LEVEL_SLOTS.map((entry) => [entry.slot, entry.start])),
  );
  return {
    offset: (slot) => offsets[slot] ?? 0,
    nudge: (slot, step) => setOffsets((current) => ({ ...current, [slot]: (current[slot] ?? 0) + step })),
    allLevel: (stack) =>
      LEVEL_SLOTS.every((entry) => stack[entry.slot] !== undefined && (offsets[entry.slot] ?? 0) === 0),
  };
}

export interface LevelItProps {
  readonly stack: Readonly<Record<string, string>>;
  readonly levels: LevelOffsets;
}

export function LevelIt({ stack, levels }: LevelItProps) {
  const placed = LEVEL_SLOTS.filter((entry) => stack[entry.slot] !== undefined);
  if (placed.length === 0) return null;
  const keyNudge = (event: KeyboardEvent<HTMLDivElement>, slot: string) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    levels.nudge(slot, event.key === "ArrowLeft" ? -NUDGE : NUDGE);
  };
  return (
    <div className="pa-level" data-testid="level-it">
      <h3>Level it</h3>
      <p className="pa-hint">Nudge the tier until the line glows.</p>
      {placed.map((entry) => {
        const offset = levels.offset(entry.slot);
        return (
          <div
            key={entry.slot}
            className={offset === 0 ? "pa-level__row pa-level__row--level" : "pa-level__row"}
            tabIndex={0}
            role="group"
            aria-label={`${entry.name}: ${offset === 0 ? "level" : "a little off centre"}. Arrow keys nudge it.`}
            onKeyDown={(event) => keyNudge(event, entry.slot)}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={() => levels.nudge(entry.slot, -NUDGE)}
              aria-label={`Nudge the ${entry.name.toLowerCase()} left`}
            >
              <Icon name="back" size={14} />
            </Button>
            <span>{offset === 0 ? `${entry.name} is level!` : entry.name}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => levels.nudge(entry.slot, NUDGE)}
              aria-label={`Nudge the ${entry.name.toLowerCase()} right`}
              className="pa-level__right"
            >
              <Icon name="back" size={14} />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
