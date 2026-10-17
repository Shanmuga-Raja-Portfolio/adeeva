import { describe, expect, it } from "vitest";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import { placedPolygon, polygonBounds } from "../../../engine/geometry/polygonPlacement";
import { hasUniqueIds } from "../../../engine/uniqueIds";
import { CAREERS } from "../content/career";
import { CLIENTS } from "../content/client";
import { CHAIN_IDS, CLIP_SET, EXTRAS } from "../content/extra";
import { GLAZE_COLOURS, JEWEL_COLOURS } from "../content/jewelColour";
import { LINE_HINTS } from "../content/hints";
import { AWARDS } from "../content/launchAward";
import { LAUNCH_THEMES } from "../content/launchTheme";
import { LANTERN_COLOURS } from "../content/lanternColour";
import { LINE_NAMES } from "../content/lineName";
import { LOFT_STORY_BEATS } from "../content/loftStoryBeat";
import { BACKDROPS } from "../content/lookbookBackdrop";
import { PROPS } from "../content/lookbookProp";
import { METALS } from "../content/metal";
import { OPTIONS, type OptionId, type OptionSlot } from "../content/partOption";
import { LAUNCH_PANELS } from "../content/panelMember";
import { POPUP_VISITORS } from "../content/popupVisitor";
import { PRICE_TAGS } from "../content/priceTag";
import { PRODUCTS, type ProductDef } from "../content/product";
import { STOCK_SIZES } from "../content/stockSize";
import { STONES, STONE_CUTS } from "../content/stone";
import { STONE_TINT_DEFS } from "../content/stoneTint";
import { UPGRADES } from "../content/upgrade";
import { clientById, stockSizeById } from "./catalog";
import { partOutline } from "./partGeometry";
import { eligibleClients } from "./offers";
import { stockPrice } from "./stock";
import { newTestGame } from "./testPlaythrough";

function words(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

function optionSets(product: ProductDef): Partial<Record<OptionSlot, OptionId>>[] {
  return product.slots.reduce<Partial<Record<OptionSlot, OptionId>>[]>(
    (sets, slot) =>
      sets.flatMap((set) =>
        OPTIONS.filter((option) => option.slot === slot).map((option) => ({ ...set, [slot]: option.id })),
      ),
    [{}],
  );
}

describe("depth catalogs", () => {
  it("have unique ids", () => {
    for (const list of [
      CAREERS,
      LAUNCH_THEMES,
      LANTERN_COLOURS,
      LINE_NAMES,
      BACKDROPS,
      PROPS,
      PRICE_TAGS,
      AWARDS,
      POPUP_VISITORS,
      STONE_TINT_DEFS,
      LAUNCH_PANELS,
    ])
      expect(hasUniqueIds(list)).toBe(true);
    expect(hasUniqueIds([...CLIENTS, ...POPUP_VISITORS])).toBe(true);
  });

  it("double the slice: 10 metals, 16 stones, 14 products, 20 options, 7 finishes, 12 extras, 8 upgrades", () => {
    expect(METALS).toHaveLength(10);
    expect(STONES).toHaveLength(16);
    expect(PRODUCTS).toHaveLength(14);
    expect(OPTIONS).toHaveLength(20);
    expect(EXTRAS).toHaveLength(12);
    expect(UPGRADES).toHaveLength(8);
    expect(LOFT_STORY_BEATS).toHaveLength(21);
    expect(LAUNCH_THEMES.flatMap((theme) => theme.cards)).toHaveLength(24);
  });

  it("fits every canonical layout for every product with every option and stone cut", () => {
    for (const product of PRODUCTS)
      for (const options of optionSets(product))
        for (const cut of STONE_CUTS) {
          const placed = product.parts.map((part) => {
            const placement = product.canonical[part.key];
            if (placement === undefined) throw new Error(`${product.id} ${part.key} has no layout`);
            return {
              size: placement.size,
              polygon: placedPolygon(partOutline(part, { options, cut }), placement),
            };
          });
          for (const [index, entry] of placed.entries()) {
            const sheet = stockSizeById(entry.size);
            const bounds = polygonBounds(entry.polygon);
            const label = `${product.id} ${JSON.stringify(options)} ${cut}`;
            expect(bounds.minX, label).toBeGreaterThanOrEqual(-0.01);
            expect(bounds.minY, label).toBeGreaterThanOrEqual(-0.01);
            expect(bounds.maxX, label).toBeLessThanOrEqual(sheet.width + 0.01);
            expect(bounds.maxY, label).toBeLessThanOrEqual(sheet.height + 0.01);
            for (const other of placed.slice(index + 1))
              if (other.size === entry.size)
                expect(polygonsOverlap(entry.polygon, other.polygon), label).toBe(false);
          }
        }
  });

  it("lets every theme palette and client colour be made from metals, glazes, cords, stones, charms or a finish", () => {
    const makeable = new Set<string>([
      ...METALS.map((metal) => metal.tone),
      ...GLAZE_COLOURS,
      ...STONES.map((stone) => stone.colour),
      ...EXTRAS.flatMap((extra) =>
        extra.colour === "metal" || extra.colour === "cord" ? [] : [extra.colour],
      ),
      "charcoal",
      "gold",
    ]);
    for (const theme of LAUNCH_THEMES)
      for (const colour of theme.palette) expect(makeable.has(colour), `${theme.id} ${colour}`).toBe(true);
    for (const client of CLIENTS)
      for (const colour of client.brief.favouredColours)
        expect(makeable.has(colour), `${client.id} ${colour}`).toBe(true);
    for (const colour of makeable) expect(JEWEL_COLOURS.some((entry) => entry.id === colour)).toBe(true);
  });

  it("gives every client a lowest budget above the cheapest build of their piece", () => {
    for (const client of CLIENTS) {
      const product = PRODUCTS.find((entry) => entry.id === client.brief.productId);
      if (product === undefined) throw new Error(client.id);
      const sizes = [...new Set(Object.values(product.canonical).map((placement) => placement.size))];
      const metal = Math.min(
        ...METALS.filter(
          (entry) =>
            !client.brief.avoidMetals.includes(entry.id) && entry.minReputation <= client.minReputation,
        ).map((entry) => sizes.reduce((sum, size) => sum + stockPrice(entry.id, size), 0)),
      );
      const stone =
        product.seats.length *
        Math.min(
          ...STONES.filter((entry) => entry.minReputation <= client.minReputation).map(
            (entry) => entry.price,
          ),
        );
      const holder =
        product.holder === null
          ? 0
          : product.holder.count *
            Math.min(
              ...product.holder.choices.map((id) => EXTRAS.find((extra) => extra.id === id)?.price ?? 99),
            );
      const extras = client.brief.requiredExtras.reduce(
        (sum, need) => sum + need.count * (EXTRAS.find((extra) => extra.id === need.extraId)?.price ?? 0),
        0,
      );
      const cheapest = metal + stone + holder + product.clipSets * CLIP_SET.price + extras;
      expect(client.brief.budget[0], client.id).toBeGreaterThanOrEqual(cheapest + 4);
    }
  });

  it("resolves every Pop-up visitor by clientById and never puts one in the offer roll", () => {
    const state = { ...newTestGame(), reputation: 60, calendar: { day: 9, hoursLeft: 10 } };
    const pool = eligibleClients(state).map((client) => client.id);
    for (const visitor of POPUP_VISITORS) {
      expect(clientById(visitor.id)?.name).toBe(visitor.name);
      expect(pool).not.toContain(visitor.id);
      expect(CLIENTS.some((client) => client.id === visitor.id)).toBe(false);
    }
  });

  it("opens new clients only from reputation 14, so early seeded draws do not move", () => {
    const slice = new Set([
      "gran-mina",
      "dev",
      "kiko",
      "aunt-lucia",
      "ms-saoirse",
      "juniper",
      "mr-okonkwo",
      "mr-farouk",
    ]);
    for (const client of CLIENTS.filter((entry) => !slice.has(entry.id)))
      expect(client.minReputation, client.id).toBeGreaterThanOrEqual(14);
  });

  it("gives every product a stall base and a line base, and each theme a best card", () => {
    for (const product of PRODUCTS) {
      expect(product.stallBase).toBeGreaterThan(0);
      expect(product.lineBase).toBeGreaterThan(product.stallBase);
    }
    for (const theme of LAUNCH_THEMES) expect(theme.cards[theme.bestCard]).toBeDefined();
    expect(STOCK_SIZES.map((size) => size.id)).toEqual(["sheet", "strip", "wide"]);
    expect(CHAIN_IDS).toContain("bag-clip");
  });

  it("keeps new hint lines short and avoids grown-up jewellery, luck and contest words", () => {
    for (const line of Object.values(LINE_HINTS)) expect(words(line), line).toBeLessThanOrEqual(12);
    const text = JSON.stringify([
      LOFT_STORY_BEATS,
      LAUNCH_THEMES,
      AWARDS,
      POPUP_VISITORS,
      CLIENTS,
      LAUNCH_PANELS,
      UPGRADES,
      LINE_HINTS,
      PROPS,
      CAREERS,
    ]).toLowerCase();
    for (const word of [
      "carat",
      "clarity",
      "grade",
      "solder",
      "luck",
      "judge",
      "winner",
      "loser",
      "eliminat",
      "countdown",
      "discount",
      "limited",
      "flame",
      "candle",
      "firework",
    ])
      expect(text.includes(word), word).toBe(false);
  });
});
