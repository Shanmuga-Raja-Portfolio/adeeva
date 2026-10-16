import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { JointKindId } from "../content/jointKind";
import { isJointKindId } from "./catalog";
import type { GameState } from "./gameState";

export function chooseSetJoint(state: GameState, kind: JointKindId): GameState {
  if (!isJointKindId(kind)) return state;
  return updateActiveRun(state, "design", (run) => {
    const purpose = run.purpose;
    if (purpose.kind !== "set" || purpose.setJoint === kind) return null;
    return { ...run, purpose: { ...purpose, setJoint: kind } };
  });
}
