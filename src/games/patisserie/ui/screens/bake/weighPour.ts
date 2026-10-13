import { pourCap, pourFlow, settleGrams } from "../../../core";

export interface PourState {
  readonly grams: number;
  readonly holding: boolean;
  readonly heldSeconds: number;
  readonly settleLeft: number;
  readonly settleRate: number;
  readonly actions: number;
  readonly emptied: boolean;
  readonly helped: boolean;
}

export interface PourSetup {
  readonly target: number;
  readonly stock: number;
  readonly pourDifficulty: number;
  readonly assisted: boolean;
}

export const FRESH_POUR: PourState = {
  grams: 0,
  holding: false,
  heldSeconds: 0,
  settleLeft: 0,
  settleRate: 0,
  actions: 0,
  emptied: false,
  helped: false,
};

export function startPour(pour: PourState): PourState {
  if (pour.holding) return pour;
  return { ...pour, holding: true, heldSeconds: 0, actions: pour.actions + 1 };
}

export function releasePour(pour: PourState, setup: PourSetup): PourState {
  if (!pour.holding) return pour;
  const flow = pourFlow(setup.target, pour.heldSeconds);
  return {
    ...pour,
    holding: false,
    settleLeft: pour.settleLeft + settleGrams(flow, setup.pourDifficulty),
    settleRate: flow,
  };
}

export function pourTick(pour: PourState, setup: PourSetup, seconds: number): PourState {
  const cap = pourCap(setup.target, setup.stock);
  if (pour.holding) {
    const flow = pourFlow(setup.target, pour.heldSeconds);
    const grams = Math.min(cap, pour.grams + flow * seconds);
    const next = { ...pour, grams, heldSeconds: pour.heldSeconds + seconds };
    const emptied = grams >= cap && cap < 3 * setup.target;
    if (emptied) return { ...releasePour(next, setup), emptied: true, settleLeft: 0 };
    if (setup.assisted && grams + settleGrams(flow, setup.pourDifficulty) >= setup.target)
      return releasePour(next, setup);
    return next;
  }
  if (pour.settleLeft <= 0) return pour;
  const step = Math.min(pour.settleLeft, Math.max(pour.settleRate, 1) * seconds);
  return { ...pour, grams: Math.min(cap, pour.grams + step), settleLeft: pour.settleLeft - step };
}

export function settled(pour: PourState): boolean {
  return !pour.holding && pour.settleLeft <= 0;
}
