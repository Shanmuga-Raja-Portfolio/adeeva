import type { GameState } from "./gameState";
import { settleLaunch } from "./cookbook";
import { settleNight } from "./restaurantSettle";
import type { ServiceRun } from "./service";
import type { ServiceScore } from "./serviceScore";
import { settleFestival } from "./truckDay";

export function settlePathService(state: GameState, service: ServiceRun, result: ServiceScore): GameState {
  switch (service.kind) {
    case "night":
      return settleNight(state, service, result);
    case "festival":
      return settleFestival(state, result);
    case "launch":
      return settleLaunch(state);
    case "shift":
    case "station-test":
      return state;
  }
}
