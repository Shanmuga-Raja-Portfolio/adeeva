import type { AvatarLook } from "../../../content/avatarOption";
import type { FinishedLook, LabelSeason } from "../../../core";
import type { AvatarDress } from "../../art/Avatar";
import { lookDress } from "./lookDress";
import { lookSilhouette, lookTitle } from "./lookTitle";
import { modelLook } from "./modelLook";
import { walkRole } from "./walkRole";

export interface ShowWalker {
  readonly position: number;
  readonly lookIndex: number;
  readonly look: FinishedLook;
  readonly dress: AvatarDress;
  readonly model: AvatarLook;
  readonly title: string;
  readonly silhouette: string;
  readonly role: string;
}

export function showCast(season: LabelSeason, order: readonly number[]): ShowWalker[] {
  return order.flatMap((lookIndex, position) => {
    const look = season.looks[lookIndex] ?? null;
    if (look === null) return [];
    return [
      {
        position,
        lookIndex,
        look,
        dress: lookDress(look),
        model: modelLook(look.runId, position),
        title: lookTitle(look),
        silhouette: lookSilhouette(look),
        role: walkRole(position, order.length),
      },
    ];
  });
}
