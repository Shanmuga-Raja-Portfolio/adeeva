import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { spendHours } from "../../../engine/dayHours";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import type { Point } from "../../../engine/geometry/point";
import { isValidPose, normalisedRotation, type PlacedPose } from "../../../engine/placedPose";
import { BACKDROP_IDS, type BackdropId } from "../content/lookbookBackdrop";
import { PROPS, PROP_IDS, type PropId } from "../content/lookbookProp";
import type { LaunchThemeDef } from "../content/launchTheme";
import { launchThemeById } from "./catalog";
import { LOOKBOOK_HOURS } from "./collectionBoard";
import type { CollectionState, LookbookPage, PlacedProp } from "./collectionState";
import type { GameState } from "./gameState";
import { launchStaged } from "./launchStatus";
import { isLampAngle, lightBand, snappedLight } from "./lookbookLight";
import { lineSeason } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";

export const PAGE_CANVAS = { width: 240, height: 240 } as const;
export const PIECE_BOX = { x: 70, y: 60, width: 100, height: 120 } as const;
export const PROP_SIZE = 44;
export const MAX_PROPS = 3;
export const PROP_ROTATION_STEP = 15;

export interface PropChoice extends PlacedPose {
  readonly propId: PropId;
}

const PIECE_POLYGON: readonly Point[] = [
  [PIECE_BOX.x, PIECE_BOX.y],
  [PIECE_BOX.x + PIECE_BOX.width, PIECE_BOX.y],
  [PIECE_BOX.x + PIECE_BOX.width, PIECE_BOX.y + PIECE_BOX.height],
  [PIECE_BOX.x, PIECE_BOX.y + PIECE_BOX.height],
];

export function propPolygon(pose: PlacedPose): Point[] {
  const half = (PROP_SIZE * pose.scale) / 2;
  const angle = (normalisedRotation(pose.rotation) * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return (
    [
      [-half, -half],
      [half, -half],
      [half, half],
      [-half, half],
    ] as const
  ).map(([dx, dy]): Point => [pose.x + dx * cos - dy * sin, pose.y + dx * sin + dy * cos]);
}

export function propCoversPiece(pose: PlacedPose): boolean {
  return polygonsOverlap(propPolygon(pose), PIECE_POLYGON);
}

function propsFit(props: readonly PropChoice[]): boolean {
  return (
    props.length <= MAX_PROPS &&
    props.every(
      (prop) =>
        PROP_IDS.includes(prop.propId) &&
        isValidPose(PAGE_CANVAS, prop) &&
        normalisedRotation(prop.rotation) % PROP_ROTATION_STEP === 0 &&
        !propCoversPiece(prop),
    )
  );
}

export function lookbookCollection(state: GameState): CollectionState | null {
  const collection = lineSeason(state, state.calendar.day);
  if (collection === null || collection.brief === null || collection.lookbook.closed) return null;
  if (launchStaged(state, collection) || collection.pieces.length !== collection.brief.products.length)
    return null;
  return collection;
}

function withPage(collection: CollectionState, page: LookbookPage): CollectionState {
  const pages = collection.lookbook.pages.filter((entry) => entry.pieceId !== page.pieceId);
  const order = collection.pieces.map((piece) => piece.id);
  return {
    ...collection,
    lookbook: {
      ...collection.lookbook,
      pages: [...pages, page].sort((a, b) => order.indexOf(a.pieceId) - order.indexOf(b.pieceId)),
    },
  };
}

function placedProps(props: readonly PropChoice[]): PlacedProp[] {
  return props.map((prop, index) => ({
    id: `prop-${index + 1}`,
    propId: prop.propId,
    x: prop.x,
    y: prop.y,
    rotation: normalisedRotation(prop.rotation),
    scale: prop.scale,
    layer: prop.layer,
  }));
}

export function styleIssue(props: readonly PropChoice[]): string | null {
  if (props.length > MAX_PROPS) return `Up to ${MAX_PROPS} props on a page.`;
  return propsFit(props) ? null : "Props can't cover the piece.";
}

export function styleLookbookPage(
  state: GameState,
  pieceId: string,
  backdrop: BackdropId,
  props: readonly PropChoice[],
): GameState {
  const collection = lookbookCollection(state);
  if (collection === null || !BACKDROP_IDS.includes(backdrop) || styleIssue(props) !== null) return state;
  if (!collection.pieces.some((piece) => piece.id === pieceId)) return state;
  const before = collection.lookbook.pages.find((page) => page.pieceId === pieceId);
  const page: LookbookPage = {
    pieceId,
    backdrop,
    props: placedProps(props),
    lampAngle: before?.lampAngle ?? null,
    light: before?.light ?? null,
    assisted: before?.assisted ?? false,
  };
  if (before !== undefined && JSON.stringify(before) === JSON.stringify(page)) return state;
  return { ...state, collection: withPage(collection, page) };
}

export function styleEveryPage(state: GameState, fromPieceId: string): GameState {
  const collection = lookbookCollection(state);
  const from = collection?.lookbook.pages.find((page) => page.pieceId === fromPieceId);
  if (collection === null || from === undefined) return state;
  const others = collection.pieces.filter((piece) => piece.id !== fromPieceId);
  if (others.length === 0) return state;
  const styled = others.reduce((current, piece) => {
    const before = current.lookbook.pages.find((page) => page.pieceId === piece.id);
    return withPage(current, {
      pieceId: piece.id,
      backdrop: from.backdrop,
      props: from.props,
      lampAngle: before?.lampAngle ?? null,
      light: before?.light ?? null,
      assisted: before?.assisted ?? false,
    });
  }, collection);
  return { ...state, collection: styled };
}

export function snapLookbookPage(
  state: GameState,
  pieceId: string,
  lampAngle: number,
  assisted: boolean,
): GameState {
  const collection = lookbookCollection(state);
  if (collection === null || typeof assisted !== "boolean" || !isLampAngle(lampAngle)) return state;
  const piece = collection.pieces.find((entry) => entry.id === pieceId);
  const page = collection.lookbook.pages.find((entry) => entry.pieceId === pieceId);
  if (piece === undefined || page === undefined) return state;
  const sticky = page.assisted || assisted;
  const angle = assisted ? piece.sweetSpot : lampAngle;
  const light = snappedLight(angle, piece.sweetSpot, lightBand(state), sticky);
  if (page.lampAngle === angle && page.light === light && page.assisted === sticky) return state;
  return {
    ...state,
    collection: withPage(collection, { ...page, lampAngle: angle, light, assisted: sticky }),
  };
}

export function canCloseLookbook(state: GameState): ActionCheck {
  const collection = lookbookCollection(state);
  if (collection === null) return actionCheck(["Finish every piece in the line first."]);
  if (!collection.lookbook.pages.some((page) => page.light !== null))
    return actionCheck(["Snap at least one page."]);
  if (state.calendar.hoursLeft < LOOKBOOK_HOURS)
    return actionCheck(["The Lookbook takes 2 hours. End the day first."]);
  return actionCheck([]);
}

export function closeLookbook(state: GameState): GameState {
  const collection = lookbookCollection(state);
  if (collection === null || !canCloseLookbook(state).ok) return state;
  const spent = spendHours(state, LOOKBOOK_HOURS);
  if (spent === null) return state;
  const closed: GameState = {
    ...spent,
    collection: { ...collection, lookbook: { ...collection.lookbook, closed: true } },
  };
  return queueStoryTrigger(closed, "first-lookbook");
}

export function pageScore(page: LookbookPage | undefined, theme: LaunchThemeDef): number {
  if (page === undefined) return 0;
  const themed = page.props.filter((prop) =>
    PROPS.some((def) => def.id === prop.propId && def.tags.some((tag) => theme.tags.includes(tag))),
  ).length;
  const share = page.props.length === 0 ? 0 : themed / page.props.length;
  return (page.backdrop === theme.backdrop ? 50 : 0) + 50 * share;
}

export function oseiPage(collection: CollectionState): { backdrop: BackdropId; props: PropChoice[] } | null {
  if (collection.themeId === null) return null;
  const theme = launchThemeById(collection.themeId);
  const themed = PROPS.filter((prop) => prop.tags.some((tag) => theme.tags.includes(tag))).slice(0, 2);
  const spots: readonly (readonly [number, number])[] = [
    [36, 196],
    [204, 196],
  ];
  return {
    backdrop: theme.backdrop,
    props: themed.flatMap((prop, index) => {
      const spot = spots[index];
      return spot === undefined
        ? []
        : [{ propId: prop.id, x: spot[0], y: spot[1], rotation: 0, scale: 1, layer: index + 1 }];
    }),
  };
}
