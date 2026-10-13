import { COLOURS, MATERIAL_IDS } from "../../../engine/palette";
import { STYLE_TAGS } from "../content/styleTag";
import { TRIM_IDS } from "../content/trim";
import { clientById, fabricById, partById, storyBeatById, themeById } from "./catalog";
import { oneOf, refined, stringParser, type Parser } from "../../../engine/parse";

function knownId(lookup: (id: string) => unknown, kind: string): Parser<string> {
  return refined(stringParser, (id) => lookup(id) !== undefined, `a known ${kind} id`);
}

export const fabricIdParser = knownId(fabricById, "fabric");
export const partIdParser = knownId(partById, "garment part");
export const clientIdParser = knownId(clientById, "client");
export const themeIdParser = knownId(themeById, "show theme");
export const storyBeatIdParser = knownId(storyBeatById, "story beat");
export const styleTagParser = oneOf(STYLE_TAGS);
export const colourIdParser = oneOf(COLOURS.map((colour) => colour.id));
export const materialIdParser = oneOf(MATERIAL_IDS);
export const trimIdParser = oneOf(TRIM_IDS);
