import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import {
  buyLineGems,
  collectionTestGame,
  confirmBoard,
  pickFirstTheme,
  playWholeLine,
} from "./linePlaythrough";
import { oseiPage, pageScore, PIECE_BOX, propCoversPiece } from "./lookbook";
import { angleDelta, lightBand, pageLight } from "./lookbookLight";
import { launchThemeById } from "./catalog";
import { reduce } from "./reduce";
import { newTestGame } from "./testPlaythrough";

function finishedLine(overrides = {}): GameState {
  return playWholeLine(buyLineGems(confirmBoard(pickFirstTheme(collectionTestGame(overrides)))));
}

describe("Lookbook light", () => {
  it("is 1 at the sweet spot, falls off as (Δ ÷ band)² and is 0 past the band edge", () => {
    expect(pageLight(120, 120, 30)).toBe(1);
    expect(pageLight(135, 120, 30)).toBeCloseTo(0.75);
    expect(pageLight(150, 120, 30)).toBe(0);
    expect(pageLight(5, 355, 30)).toBeCloseTo(1 - (10 / 30) ** 2);
    expect(angleDelta(350, 10)).toBe(20);
  });

  it("widens the band for Perfectionists, the Light Box and Relaxed", () => {
    const profile = newTestGame().profile;
    expect(lightBand({ profile, upgrades: [] })).toBe(30);
    expect(
      lightBand({ profile: { ...profile, trait: "perfectionist" }, upgrades: ["light-box"] }),
    ).toBeCloseTo(43.2);
    expect(lightBand({ profile: { ...profile, difficulty: "relaxed" }, upgrades: [] })).toBeCloseTo(39);
  });
});

describe("the Lookbook", () => {
  it("opens once every piece is finished and refuses props that cover the piece", () => {
    const line = finishedLine();
    const piece = line.collection?.pieces[0];
    if (piece === undefined) throw new Error("no piece");
    const centre = {
      propId: "teacup" as const,
      x: PIECE_BOX.x + 50,
      y: PIECE_BOX.y + 60,
      rotation: 0,
      scale: 1,
      layer: 1,
    };
    expect(propCoversPiece(centre)).toBe(true);
    expect(
      reduce(line, { type: "styleLookbookPage", pieceId: piece.id, backdrop: "linen", props: [centre] }),
    ).toBe(line);
    const corner = { ...centre, x: 30, y: 210 };
    const styled = reduce(line, {
      type: "styleLookbookPage",
      pieceId: piece.id,
      backdrop: "linen",
      props: [corner],
    });
    expect(styled.collection?.lookbook.pages[0]?.props).toHaveLength(1);
    const four = [corner, { ...corner, x: 210 }, { ...corner, y: 30 }, { ...corner, x: 210, y: 30 }];
    expect(
      reduce(line, { type: "styleLookbookPage", pieceId: piece.id, backdrop: "linen", props: four }),
    ).toBe(line);
  });

  it("copies the styling to every page, leaving only the lamp", () => {
    const line = finishedLine();
    const pieces = line.collection?.pieces ?? [];
    const first = pieces[0];
    if (first === undefined) throw new Error("no piece");
    const prop = { propId: "sea-shell" as const, x: 30, y: 210, rotation: 15, scale: 1, layer: 1 };
    const styled = reduce(line, {
      type: "styleLookbookPage",
      pieceId: first.id,
      backdrop: "slate",
      props: [prop],
    });
    const every = reduce(styled, { type: "styleEveryPage", fromPieceId: first.id });
    const pages = every.collection?.lookbook.pages ?? [];
    expect(pages).toHaveLength(pieces.length);
    expect(
      pages.every((page) => page.backdrop === "slate" && page.props.length === 1 && page.light === null),
    ).toBe(true);
  });

  it("snaps in 5° steps, caps Osei's lamp at 0.8 and closes in 2 hours", () => {
    const line = finishedLine();
    const piece = line.collection?.pieces[0];
    const collection = line.collection;
    if (piece === undefined || collection === null) throw new Error("no piece");
    const page = oseiPage(collection);
    if (page === null) throw new Error("no page");
    const styled = reduce(line, {
      type: "styleLookbookPage",
      pieceId: piece.id,
      backdrop: page.backdrop,
      props: page.props,
    });
    expect(
      reduce(styled, { type: "snapLookbookPage", pieceId: piece.id, lampAngle: 7, assisted: false }),
    ).toBe(styled);
    const exact = reduce(styled, {
      type: "snapLookbookPage",
      pieceId: piece.id,
      lampAngle: piece.sweetSpot,
      assisted: false,
    });
    expect(exact.collection?.lookbook.pages[0]?.light).toBe(1);
    const helped = reduce(styled, {
      type: "snapLookbookPage",
      pieceId: piece.id,
      lampAngle: 0,
      assisted: true,
    });
    expect(helped.collection?.lookbook.pages[0]?.light).toBe(0.8);
    expect(helped.collection?.lookbook.pages[0]?.lampAngle).toBe(piece.sweetSpot);
    const resnapped = reduce(helped, {
      type: "snapLookbookPage",
      pieceId: piece.id,
      lampAngle: piece.sweetSpot,
      assisted: false,
    });
    expect(resnapped).toBe(helped);
    const restyled = reduce(helped, {
      type: "styleLookbookPage",
      pieceId: piece.id,
      backdrop: page.backdrop,
      props: [],
    });
    const again = reduce(restyled, {
      type: "snapLookbookPage",
      pieceId: piece.id,
      lampAngle: (piece.sweetSpot + 15) % 360,
      assisted: false,
    });
    expect(again.collection?.lookbook.pages[0]?.assisted).toBe(true);
    expect(again.collection?.lookbook.pages[0]?.light).toBeLessThan(0.8);
    expect(reduce(styled, { type: "closeLookbook" })).toBe(styled);
    const closed = reduce(exact, { type: "closeLookbook" });
    expect(closed.collection?.lookbook.closed).toBe(true);
    expect(closed.calendar.hoursLeft).toBe(exact.calendar.hoursLeft - 2);
    expect(
      reduce(closed, { type: "snapLookbookPage", pieceId: piece.id, lampAngle: 0, assisted: false }),
    ).toBe(closed);
  });

  it("scores styling as 50 for the theme's backdrop plus 50 × the share of themed props", () => {
    const theme = launchThemeById("first-blossom");
    const base = { pieceId: "a", lampAngle: null, light: null, assisted: false };
    const shell = {
      id: "prop-1",
      propId: "sea-shell" as const,
      x: 30,
      y: 210,
      rotation: 0,
      scale: 1,
      layer: 1,
    };
    const teacup = { ...shell, id: "prop-2", propId: "teacup" as const };
    expect(pageScore({ ...base, backdrop: "linen", props: [shell, teacup] }, theme)).toBe(75);
    expect(pageScore({ ...base, backdrop: "slate", props: [] }, theme)).toBe(0);
    expect(pageScore(undefined, theme)).toBe(0);
  });
});
