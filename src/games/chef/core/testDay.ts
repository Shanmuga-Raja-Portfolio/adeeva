import type { DishId } from "../content/dish";
import type { TestRunKind } from "./dishRun";

export interface TestDay {
  readonly test: TestRunKind;
  readonly day: number;
  readonly dishIds: readonly DishId[];
  readonly qualities: readonly number[];
}

export const TEST_DISHES = 3;
