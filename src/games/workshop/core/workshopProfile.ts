import { objectOf, oneOf } from "../../../engine/parse";
import { profileShape } from "../../../engine/stateParsers";
import { CAREER_IDS } from "../content/career";
import type { Profile } from "./gameState";

export const workshopProfileParser = objectOf<Profile>({ ...profileShape, startedAs: oneOf(CAREER_IDS) });
