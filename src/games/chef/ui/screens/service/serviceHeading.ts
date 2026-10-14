import { cuisineById, festivalById, type GameState, type ServiceRun } from "../../../core";
import { restaurantName } from "../path/restaurantName";

export interface ServiceHeading {
  readonly eyebrow: string;
  readonly title: string;
}

export function serviceHeading(state: GameState, service: ServiceRun): ServiceHeading {
  const counters = service.cuisines.map((cuisine) => cuisineById(cuisine).counter).join(" + ");
  const path = state.path;
  switch (service.kind) {
    case "station-test":
      return { eyebrow: "Station Test", title: counters };
    case "night":
      return { eyebrow: "Service Rush", title: restaurantName(state) };
    case "festival":
      return {
        eyebrow: "Hatch Rush",
        title:
          path?.kind === "truck" && path.today !== null
            ? festivalById(path.today.festivalId).name
            : "Clementine",
      };
    case "launch":
      return { eyebrow: "Book launch", title: "Tasting cups at the Larkspur Library" };
    case "shift":
      return { eyebrow: "Service Rush", title: counters.length === 0 ? "Hall dinner service" : counters };
  }
}
