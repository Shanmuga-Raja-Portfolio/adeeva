import {
  arrayOf,
  booleanParser,
  distinctBy,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  refined,
  stringParser,
} from "../../../engine/parse";
import { MAX_PLACED_SCALE, MIN_PLACED_SCALE } from "../../../engine/placedPose";
import { countParser, dayParser, pointParser, shareParser } from "../../../engine/stateParsers";
import { FINISH_IDS } from "../content/finish";
import { LAUNCH_THEME_IDS } from "../content/launchTheme";
import { LINE_NAME_IDS } from "../content/lineName";
import { SEASON_DAYS } from "../content/loftSeason";
import { BACKDROP_IDS } from "../content/lookbookBackdrop";
import { PROP_IDS } from "../content/lookbookProp";
import { METAL_IDS } from "../content/metal";
import { SHAPE_IDS } from "../content/partOption";
import { PRODUCT_IDS } from "../content/product";
import { STONE_IDS } from "../content/stone";
import { SHIMMER_LEVELS, STONE_TINTS } from "../content/stoneTint";
import { clientIdParser, jewelColourParser, jewelTagParser } from "./briefParser";
import type {
  CollectionBrief,
  CollectionPiece,
  CollectionState,
  GemPick,
  GemStone,
  LineHole,
  LineSheet,
  LookbookPage,
  LookbookState,
  PlacedProp,
  PotStone,
} from "./collectionState";
import { MAX_PROPS, PAGE_CANVAS } from "./lookbook";
import { TRAY_SIZE } from "./gemTray";
import { DRAWER_SIZE } from "./lineDrawer";
import { glazeParser, pieceLookParser } from "./pieceLookParser";
import { scoreParser, stallPieceParser } from "./resultParsers";

const pickShape = {
  stoneId: oneOf(STONE_IDS),
  tint: oneOf(STONE_TINTS),
  shimmer: oneOf(SHIMMER_LEVELS),
};

const gemPickParser = objectOf<GemPick>(pickShape);
const gemStoneParser = objectOf<GemStone>({ ...pickShape, price: countParser, sold: booleanParser });
const potStoneParser = objectOf<PotStone>({ ...pickShape, used: booleanParser });

export const lineBriefShapeParser = objectOf<CollectionBrief>({
  products: arrayOf(oneOf(PRODUCT_IDS)),
  motif: oneOf(SHAPE_IDS),
  metalId: oneOf(METAL_IDS),
  hero: nullable(oneOf(STONE_IDS)),
  accent: nullable(oneOf(STONE_IDS)),
  finish: oneOf(FINISH_IDS),
  glaze: glazeParser,
});

const lineBriefParser = refined(
  lineBriefShapeParser,
  (brief) =>
    brief.products.length >= 1 &&
    brief.products.length <= 5 &&
    new Set(brief.products).size === brief.products.length &&
    (brief.finish === "glaze") === (brief.glaze !== null),
  "a collection brief that fits together",
);

const holeParser = objectOf<LineHole>({
  runId: stringParser,
  points: arrayOf(pointParser(rangeParser(-1, 81))),
});
const lineSheetParser = objectOf<LineSheet>({ holes: arrayOf(holeParser) });

const pieceParser = refined(
  objectOf<CollectionPiece>({
    id: stringParser,
    look: pieceLookParser,
    quality: scoreParser,
    tags: arrayOf(jewelTagParser),
    colours: arrayOf(jewelColourParser),
    madeDay: dayParser,
    slot: integerRangeParser(0, 4),
    runId: stringParser,
    cutAccuracy: shareParser,
    motifCutAccuracy: nullable(shareParser),
    joinAccuracy: shareParser,
    setAccuracy: nullable(shareParser),
    polish: shareParser,
    carriesMotif: booleanParser,
    potStones: arrayOf(gemPickParser),
    sparkle: integerRangeParser(1, 3),
    spend: countParser,
    partArea: rangeParser(0, 100_000),
    sheetArea: rangeParser(0, 100_000),
    sweetSpot: integerRangeParser(0, 355),
  }),
  (piece) => piece.sweetSpot % 5 === 0,
  "a collection piece",
);

const propParser = objectOf<PlacedProp>({
  id: stringParser,
  propId: oneOf(PROP_IDS),
  x: rangeParser(0, PAGE_CANVAS.width),
  y: rangeParser(0, PAGE_CANVAS.height),
  rotation: rangeParser(0, 359),
  scale: rangeParser(MIN_PLACED_SCALE, MAX_PLACED_SCALE),
  layer: countParser,
});

const pageParser = objectOf<LookbookPage>({
  pieceId: stringParser,
  backdrop: oneOf(BACKDROP_IDS),
  props: refined(arrayOf(propParser), (props) => props.length <= MAX_PROPS, "up to three props"),
  lampAngle: nullable(integerRangeParser(0, 355)),
  light: nullable(shareParser),
  assisted: booleanParser,
});

const lookbookParser = objectOf<LookbookState>({ pages: arrayOf(pageParser), closed: booleanParser });

const collectionShapeParser = objectOf<CollectionState>({
  seasonStartDay: dayParser,
  seasonNumber: dayParser,
  themeId: nullable(oneOf(LAUNCH_THEME_IDS)),
  rested: booleanParser,
  carried: booleanParser,
  lineNameId: oneOf(LINE_NAME_IDS),
  brief: nullable(lineBriefParser),
  pieces: refined(
    distinctBy(arrayOf(pieceParser), (piece) => piece.id, "each piece once"),
    (pieces) => pieces.length <= 5,
    "a line of up to five pieces",
  ),
  gemTray: refined(arrayOf(gemStoneParser), (tray) => tray.length <= TRAY_SIZE, "one gem tray"),
  stonePot: arrayOf(potStoneParser),
  gemSpent: nullable(countParser),
  lineSheets: arrayOf(lineSheetParser),
  motifMaster: nullable(shareParser),
  lookbook: lookbookParser,
  drawer: refined(
    arrayOf(stallPieceParser),
    (drawer) => drawer.length <= DRAWER_SIZE,
    "a Line Drawer that fits",
  ),
  storyCorner: arrayOf(clientIdParser),
  graceSeason: countParser,
  nextPieceNumber: dayParser,
});

export const collectionParser = refined(
  collectionShapeParser,
  (collection) =>
    collection.graceSeason <= collection.seasonNumber &&
    collection.seasonStartDay >= 1 + (collection.seasonNumber - 1) * SEASON_DAYS,
  "a loft whose seasons fit its calendar",
);
