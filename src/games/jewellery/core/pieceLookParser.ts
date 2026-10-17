import {
  arrayOf,
  keyedRecordOf,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  refined,
  stringParser,
} from "../../../engine/parse";
import { MAX_PLACED_SCALE, MIN_PLACED_SCALE } from "../../../engine/placedPose";
import { countParser } from "../../../engine/stateParsers";
import { CHAIN_IDS, CHARM_IDS, MOTIF_CHARM } from "../content/extra";
import { FINISH_IDS } from "../content/finish";
import { GLAZE_COLOURS } from "../content/jewelColour";
import { METAL_IDS } from "../content/metal";
import { OPTION_IDS, OPTION_SLOTS, SHAPE_IDS, type OptionSlot } from "../content/partOption";
import { PRODUCT_IDS } from "../content/product";
import { STONE_IDS } from "../content/stone";
import { STONE_TINTS } from "../content/stoneTint";
import { DISPLAY_CANVAS } from "./displayChoice";
import type { PieceLook, PlacedCharm } from "./pieceLook";

const isOptionSlot = (key: string): key is OptionSlot => OPTION_SLOTS.some((slot) => slot === key);

export const optionsParser = keyedRecordOf(isOptionSlot, oneOf(OPTION_IDS));
export const glazeParser = nullable(oneOf(GLAZE_COLOURS));

const placedCharmShapeParser = objectOf<PlacedCharm>({
  id: stringParser,
  charmId: oneOf(CHARM_IDS),
  shape: nullable(oneOf(SHAPE_IDS)),
  x: rangeParser(0, DISPLAY_CANVAS.width),
  y: rangeParser(0, DISPLAY_CANVAS.height),
  rotation: rangeParser(0, 359),
  scale: rangeParser(MIN_PLACED_SCALE, MAX_PLACED_SCALE),
  layer: countParser,
});

export const placedCharmParser = refined(
  placedCharmShapeParser,
  (charm) => (charm.charmId === MOTIF_CHARM) === (charm.shape !== null),
  "a charm whose shape fits it",
);

export const pieceLookParser = objectOf<PieceLook>({
  productId: oneOf(PRODUCT_IDS),
  options: optionsParser,
  metalId: oneOf(METAL_IDS),
  stoneId: nullable(oneOf(STONE_IDS)),
  stoneTint: nullable(oneOf(STONE_TINTS)),
  finish: oneOf(FINISH_IDS),
  glaze: glazeParser,
  chain: nullable(oneOf(CHAIN_IDS)),
  cordColour: glazeParser,
  charms: arrayOf(placedCharmParser),
});
