import { LAUNCH_THEMES } from "../../../content/launchTheme";
import { awardById, type GameState } from "../../../core";
import type { GarlandLight } from "../../art/LanternGarland";

export function garlandLights(state: Pick<GameState, "launch">): GarlandLight[] {
  return LAUNCH_THEMES.map((theme) => {
    const award = state.launch?.garland[theme.id] ?? null;
    return {
      id: theme.id,
      label: award === null ? `${theme.name}: not lit yet` : `${theme.name}: ${awardById(award).name}`,
      hex: award === null ? null : awardById(award).colour,
    };
  });
}
