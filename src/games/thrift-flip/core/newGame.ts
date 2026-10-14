import { zeroCounts } from "../../../engine/count";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { STYLE_TAGS } from "../../../engine/styleTag";
import { rollTrendState } from "../../../engine/trendMarket";
import { TRIM_IDS } from "../../adeeva/content/trim";
import { BOUTIQUE_START_FINDS, CAREER_IDS, SCRAP_TIN, type CareerId } from "../content/career";
import { SHOP_SIGNS } from "../content/shopSign";
import { EMPTY_WINDOW } from "./boutique";
import { careerById, fabricById, findById } from "./catalog";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { rollRail } from "./marketRail";
import { rollOffers } from "./offers";
import { rollOwnedFind } from "./ownedFind";
import { addScraps, type ScrapSource } from "./scrap";
import { firstSeason } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";

export interface NewGameSettings extends ProfileSettings {
  readonly career: CareerId;
}

export function newGameIssues(settings: NewGameSettings): string[] {
  const issues = profileIssues(settings);
  return CAREER_IDS.includes(settings.career) ? issues : [...issues, "Choose where to start."];
}

function scrapTin(): ScrapSource[] {
  return SCRAP_TIN.flatMap((fabricId) => {
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

function boutiqueStart(state: GameState): GameState {
  let rng = state.rng;
  let number = state.next.find;
  const finds = BOUTIQUE_START_FINDS.map((entry) => {
    const [owned, after] = rollOwnedFind(
      `find-${number}`,
      entry.findId,
      entry.grade,
      findById(entry.findId).price,
      rng,
    );
    rng = after;
    number += 1;
    return owned;
  });
  const sign = SHOP_SIGNS[0];
  if (sign === undefined) return state;
  return {
    ...state,
    rng,
    stock: { ...state.stock, finds },
    next: { ...state.next, find: number },
    boutique: {
      signId: sign.id,
      openedDay: state.calendar.day,
      season: firstSeason(state.calendar.day),
      window: EMPTY_WINDOW,
      props: [],
      rosettes: [],
    },
  };
}

export function createGame(settings: NewGameSettings): GameState {
  const [trends, rng] = rollTrendState(settings.seed | 0, STYLE_TAGS);
  const tin = addScraps([], scrapTin(), 1);
  const career = careerById(settings.career);
  const base: GameState = {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: settings.name.trim(),
      look: settings.look,
      trait: settings.trait,
      difficulty: settings.difficulty,
      career: career.id,
    },
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS, marketOpen: false },
    coins: career.startCoins,
    reputation: career.startReputation,
    buzz: 0,
    trends,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    story: { seen: [], flags: [], queue: [] },
    rail: [],
    stock: {
      finds: [],
      savedTrims: zeroCounts(TRIM_IDS),
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
    keptInUse: 0,
    boutique: null,
    next: { run: 1, find: 1, scrap: tin.nextNumber, piece: 1 },
    rng,
  };
  if (career.id === "stall") return rollRail(rollOffers(queueStoryTrigger(base, "intro")));
  const started = queueStoryTrigger(queueStoryTrigger(boutiqueStart(base), "intro-boutique"), "season-start");
  return rollRail(rollOffers(started));
}
