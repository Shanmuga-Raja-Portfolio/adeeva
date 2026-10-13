import type { FinishedLook } from "../../../core";
import type { AvatarDress } from "../../art/avatarDress";
import { designFabrics, designParts } from "../../art/designLook";

export function lookDress(look: FinishedLook): AvatarDress {
  const { design } = look.snapshot;
  return { parts: designParts(design), fabrics: designFabrics(design), trims: look.snapshot.decorations };
}
