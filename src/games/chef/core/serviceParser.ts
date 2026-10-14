import {
  arrayOf,
  booleanParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  refined,
  stringParser,
} from "../../../engine/parse";
import { countParser, nonNegativeParser, rngParser, shareParser } from "../../../engine/stateParsers";
import { STATIONS } from "../content/station";
import { dishById } from "./catalog";
import { cuisineIdParser, dishIdParser } from "./runParser";
import {
  SERVICE_KINDS,
  SERVICE_STEP_BY,
  type ServiceDish,
  type ServicePlan,
  type ServiceRun,
  type ServiceStaff,
  type ServiceStep,
  type ServiceTicket,
  type Special,
} from "./service";

const timeParser = nullable(nonNegativeParser);

const stepParser = objectOf<ServiceStep>({
  accuracy: shareParser,
  by: oneOf(SERVICE_STEP_BY),
  assisted: booleanParser,
});

const serviceDishParser = refined(
  objectOf<ServiceDish>({
    dishId: dishIdParser,
    steps: arrayOf(nullable(stepParser)),
    readyAt: timeParser,
    doneAt: timeParser,
  }),
  (dish) => dish.steps.length === dishById(dish.dishId).steps.length,
  "a ticket dish with every step",
);

const ticketParser = objectOf<ServiceTicket>({
  id: stringParser,
  table: integerRangeParser(1, 99),
  arrival: nonNegativeParser,
  railAt: timeParser,
  sentAt: timeParser,
  dishes: arrayOf(serviceDishParser),
  team: booleanParser,
});

const staffParser = objectOf<ServiceStaff>({
  staffId: stringParser,
  station: nullable(oneOf(STATIONS)),
  freeAt: nonNegativeParser,
});

export const specialParser = objectOf<Special>({ dishId: dishIdParser, price: countParser });

const planParser = objectOf<ServicePlan>({
  railSize: integerRangeParser(1, 6),
  tickets: integerRangeParser(1, 20),
  targetSeconds: countParser,
  minimum: integerRangeParser(0, 100),
  bonusFee: countParser,
  wage: countParser,
  lengthSeconds: countParser,
  maxDishesPerTicket: integerRangeParser(1, 3),
});

export const serviceRunParser = objectOf<ServiceRun>({
  id: stringParser,
  kind: oneOf(SERVICE_KINDS),
  cuisines: arrayOf(cuisineIdParser),
  plan: planParser,
  tickets: arrayOf(ticketParser),
  staff: arrayOf(staffParser),
  special: nullable(specialParser),
  lastAt: rangeParser(0, Number.MAX_SAFE_INTEGER),
  openSince: nonNegativeParser,
  seed: rngParser,
});
