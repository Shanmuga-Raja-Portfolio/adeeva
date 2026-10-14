import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { STYLE_TAGS } from "../../../engine/styleTag";
import { rollTrendState } from "../../../engine/trendMarket";
import { TRIM_IDS, type TrimId } from "../../adeeva/content/trim";
import { CAREER } from "../content/career";
import { fabricById } from "./catalog";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { rollRail } from "./marketRail";
import { rollOffers } from "./offers";
import { addScraps, type ScrapSource } from "./scrap";
import { queueStoryTrigger } from "./storyQueue";

export type NewGameSettings = ProfileSettings;

export function newGameIssues(settings: NewGameSettings): string[] {
  return profileIssues(settings);
}

function scrapTin(): ScrapSource[] {
  return CAREER.scrapTin.flatMap((fabricId) => {
    const fabric = fabricById(fabricId);
    if (fabric === undefined) return [];
    return [
      {
        name: `${fabric.name} scrap`,
        colour: fabric.colour,
        print: fabric.print,
        material: fabric.material,
        tags: fabric.tags,
      },
    ];
  });
}

export function createGame(settings: NewGameSettings): GameState {
  const [trends, rng] = rollTrendState(settings.seed | 0, STYLE_TAGS);
  const tin = addScraps([], scrapTin(), 1);
  const base: GameState = {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: settings.name.trim(),
      look: settings.look,
      trait: settings.trait,
      difficulty: settings.difficulty,
    },
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS, marketOpen: false },
    coins: CAREER.startCoins,
    reputation: CAREER.startReputation,
    buzz: 0,
    trends,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    story: { seen: [], flags: [], queue: [] },
    rail: [],
    stock: {
      finds: [],
      savedTrims: Object.fromEntries(TRIM_IDS.map((id) => [id, 0])) as Record<TrimId, number>,
      scraps: tin.scraps,
    },
    upgrades: [],
    activeRun: null,
    rack: [],
    stall: null,
    log: [],
    flipsFinished: 0,
    gigsDelivered: 0,
    fairSales: 0,
    next: { run: 1, find: 1, scrap: tin.nextNumber, piece: 1 },
    rng,
  };
  return rollRail(rollOffers(queueStoryTrigger(base, "intro")));
}
