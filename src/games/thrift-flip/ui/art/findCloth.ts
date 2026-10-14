import type { Cloth } from "../../../../ui/art/cloth/Cloth";
import type { FindDef } from "../../content/find";
import type { PieceCloth } from "../../core";

export function findCloth(find: FindDef): Cloth & { readonly name: string } {
  return { id: find.id, name: find.name, colour: find.colour, material: find.material, print: find.print };
}

export function pieceCloth(id: string, cloth: PieceCloth): Cloth {
  return { id, colour: cloth.colour, material: cloth.material, print: cloth.print };
}
