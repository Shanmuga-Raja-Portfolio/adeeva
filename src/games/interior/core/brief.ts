import { sameList } from "../../../engine/sameList";
import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import type { ClientDef, MustHave } from "../content/client";
import { DECOR } from "../content/decor";
import { FLOORS } from "../content/floor";
import type { LightMood } from "../content/light";
import { PAINTS } from "../content/paint";
import type { RoomColour } from "../content/roomColour";
import type { RoomId } from "../content/roomTemplate";
import type { RoomTag } from "../content/roomTag";

const FAVOURED_COLOURS_PER_BRIEF = 2;

export interface Brief {
  readonly clientId: string;
  readonly roomId: RoomId;
  readonly showHome: boolean;
  readonly deadlineDay: number;
  readonly budget: number;
  readonly fee: number;
  readonly requiredTags: readonly RoomTag[];
  readonly favouredColours: readonly RoomColour[];
  readonly avoidColours: readonly RoomColour[];
  readonly mustHaves: readonly MustHave[];
  readonly mood: LightMood;
  readonly minQuality: number;
}

export interface BriefRoll {
  readonly day: number;
  readonly minQualityBonus: number;
  readonly hotTags: readonly RoomTag[];
}

function trendColours(hotTags: readonly RoomTag[]): RoomColour[] {
  const tagged = [
    ...PAINTS.map((paint) => ({ tags: paint.tags, colours: [paint.colour] })),
    ...FLOORS.map((floor) => ({ tags: floor.tags, colours: floor.colours })),
    ...DECOR.flatMap((item) => (item.colour === "soft" ? [] : [{ tags: item.tags, colours: [item.colour] }])),
  ];
  const colours = tagged
    .filter((entry) => entry.tags.some((tag) => hotTags.includes(tag)))
    .flatMap((entry) => entry.colours);
  return [...new Set(colours)];
}

export function rollClientBrief(client: ClientDef, roll: BriefRoll, rng: RngState): [Brief, RngState] {
  const template = client.brief;
  const [budget, afterBudget] = drawInt(rng, template.budget[0], template.budget[1]);
  const [fee, afterFee] = drawInt(afterBudget, template.fee[0], template.fee[1]);
  const [deadlineDays, afterDeadline] = drawInt(afterFee, template.deadlineDays[0], template.deadlineDays[1]);
  const pool = client.showHome ? trendColours(roll.hotTags) : template.favouredColours;
  const [favouredColours, afterColours] = drawDistinct(afterDeadline, pool, FAVOURED_COLOURS_PER_BRIEF);
  return [
    {
      clientId: client.id,
      roomId: template.roomId,
      showHome: client.showHome,
      deadlineDay: roll.day + deadlineDays,
      budget,
      fee,
      requiredTags: client.showHome ? [...roll.hotTags] : template.requiredTags,
      favouredColours,
      avoidColours: template.avoidColours,
      mustHaves: template.mustHaves,
      mood: template.mood,
      minQuality: template.minQuality + roll.minQualityBonus,
    },
    afterColours,
  ];
}

export function sameBrief(a: Brief, b: Brief): boolean {
  return (
    a.clientId === b.clientId &&
    a.roomId === b.roomId &&
    a.showHome === b.showHome &&
    a.deadlineDay === b.deadlineDay &&
    a.budget === b.budget &&
    a.fee === b.fee &&
    a.mood === b.mood &&
    a.minQuality === b.minQuality &&
    sameList(a.requiredTags, b.requiredTags) &&
    sameList(a.favouredColours, b.favouredColours) &&
    sameList(a.avoidColours, b.avoidColours) &&
    sameList(a.mustHaves, b.mustHaves, (x, y) => x.itemId === y.itemId && x.count === y.count)
  );
}
