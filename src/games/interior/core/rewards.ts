import { settleTrendReward, type TrendReward } from "../../../engine/trendReward";
import type { RoomTag } from "../content/roomTag";
import type { GameState } from "./gameState";
import type { MakeoverRun } from "./makeoverRun";
import type { OpenHouse } from "./openHouse";
import type { Evaluation } from "./roomEvaluate";
import { surfaceColours } from "./roomColours";
import { roomSource } from "./roomSource";
import { roomTags } from "./roomTags";

export type Reward = TrendReward<RoomTag>;

const DREAMER_COLOURS = 4;
const REWARD_LABELS = { trend: "Street favourite", dreamer: "Big ideas" } as const;
const OPEN_HOUSE_LABEL = "Open House enquiries";

export function willPass(state: Pick<GameState, "profile">, evaluation: Evaluation): boolean {
  return evaluation.passed || state.profile.difficulty === "relaxed";
}

export function roomReward(
  state: Pick<GameState, "profile" | "trends">,
  run: MakeoverRun,
  evaluation: Evaluation,
  visit: OpenHouse | null,
): Reward {
  const source = roomSource(run);
  return settleTrendReward<RoomTag>({
    passed: evaluation.passed,
    score: evaluation.score,
    stars: evaluation.stars,
    fee: run.brief.fee,
    late: evaluation.criteria.some((criterion) => criterion.id === "deadline" && !criterion.passed),
    difficulty: state.profile.difficulty,
    trait: state.profile.trait,
    hotTags: state.trends.current,
    tags: roomTags(source),
    colourCount: surfaceColours(source).length,
    dreamerColours: DREAMER_COLOURS,
    labels: REWARD_LABELS,
    extraLines: visit === null || visit.coins === 0 ? [] : [{ label: OPEN_HOUSE_LABEL, amount: visit.coins }],
    extraBuzz: visit === null ? 0 : visit.buzz,
  });
}
