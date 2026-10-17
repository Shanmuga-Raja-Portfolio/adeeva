import type { AvatarLook } from "../../../../../engine/avatar";
import { MARIGOLD } from "../../../content/panelMember";
import { clientById, type BakeRun } from "../../../core";

export interface OrderFace {
  readonly look: AvatarLook | undefined;
  readonly name: string;
  readonly fair: boolean;
}

export function orderFace(run: BakeRun): OrderFace {
  const fair = run.purpose.kind === "showpiece";
  const client = run.brief === null ? undefined : clientById(run.brief.clientId);
  return {
    look: client?.look ?? (fair ? MARIGOLD.look : undefined),
    name: client?.name ?? (fair ? "The Larkspur Fair" : "A neighbour"),
    fair,
  };
}
