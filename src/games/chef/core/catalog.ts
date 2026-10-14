import { memberOf, requireById } from "../../../engine/catalog";
import type { DifficultyDef, DifficultyId } from "../../../engine/difficulty";
import { AWARDS, type AwardDef, type AwardId } from "../content/award";
import { CHAPTERS, CHAPTER_IDS, type ChapterDef, type ChapterId } from "../content/chapter";
import { CRITICS, type CriticDef, type CriticId } from "../content/critic";
import { CUE_CARDS, type CueCardDef, type CueKind } from "../content/cueCard";
import { FESTIVALS, type FestivalDef, type FestivalId } from "../content/festival";
import { LETTERS, type LetterDef } from "../content/letter";
import { NAME_CARDS, type NameCardDef } from "../content/nameCard";
import { PATHS, PATH_IDS, type PathDef, type PathId } from "../content/path";
import { CLIENTS, type ClientDef } from "../content/client";
import { CUISINES, type CuisineDef, type CuisineId } from "../content/cuisine";
import { DISHES, DISH_IDS, type Dish, type DishId } from "../content/dish";
import { DIFFICULTIES } from "../content/difficulty";
import { INGREDIENTS, type IngredientDef, type IngredientId } from "../content/ingredient";
import { MENTORS, type MentorDef } from "../content/mentor";
import { PLATE_COMPONENTS, type ComponentId, type PlateComponentDef } from "../content/plateComponent";
import { RUNGS, TESTS, type RungDef, type RungId, type TestDef, type TestId } from "../content/career";
import { JARS, type JarDef, type JarId } from "../content/seasoning";
import { STAFF, type StaffDef } from "../content/staff";
import { STORY_BEATS, type StoryBeatDef } from "../content/storyBeat";
import { UPGRADE_IDS, UPGRADES, type UpgradeDef, type UpgradeId } from "../content/upgrade";

export const isDishId = memberOf(DISH_IDS);
export const isUpgradeId = memberOf(UPGRADE_IDS);
export const isPathId = memberOf(PATH_IDS);
export const isChapterId = memberOf(CHAPTER_IDS);

export function dishById(id: DishId): Dish {
  return requireById(DISHES, id, "dish");
}

export function ingredientById(id: IngredientId): IngredientDef {
  return requireById(INGREDIENTS, id, "ingredient");
}

export function jarById(id: JarId): JarDef {
  return requireById(JARS, id, "jar");
}

export function cuisineById(id: CuisineId): CuisineDef {
  return requireById(CUISINES, id, "cuisine");
}

export function mentorFor(cuisine: CuisineId): MentorDef {
  return requireById(MENTORS, cuisineById(cuisine).mentorId, "mentor");
}

export function componentById(id: ComponentId): PlateComponentDef {
  return requireById(PLATE_COMPONENTS, id, "plate component");
}

export function upgradeById(id: UpgradeId): UpgradeDef {
  return requireById(UPGRADES, id, "upgrade");
}

export function knownUpgrade(id: string): UpgradeDef | undefined {
  return isUpgradeId(id) ? upgradeById(id) : undefined;
}

export function rungById(id: RungId): RungDef {
  return requireById(RUNGS, id, "rung");
}

export function testById(id: TestId): TestDef {
  return requireById(TESTS, id, "test");
}

export function difficultyById(id: DifficultyId): DifficultyDef {
  return requireById(DIFFICULTIES, id, "difficulty");
}

export function clientById(id: string): ClientDef | undefined {
  return CLIENTS.find((client) => client.id === id);
}

export function staffById(id: string): StaffDef | undefined {
  return STAFF.find((member) => member.id === id);
}

export function storyBeatById(id: string): StoryBeatDef | undefined {
  return STORY_BEATS.find((beat) => beat.id === id);
}

export function dishesOf(cuisine: CuisineId): Dish[] {
  return DISHES.filter((dish) => dish.cuisine === cuisine);
}

export function lessonDish(cuisine: CuisineId): Dish {
  const first = dishesOf(cuisine).find((dish) => dish.unlock === "learner");
  if (first === undefined) throw new Error(`No lesson dish for ${cuisine}`);
  return first;
}

export function pathById(id: PathId): PathDef {
  return requireById(PATHS, id, "path");
}

export function festivalById(id: FestivalId): FestivalDef {
  return requireById(FESTIVALS, id, "festival");
}

export function criticById(id: CriticId): CriticDef {
  return requireById(CRITICS, id, "critic");
}

export function chapterById(id: ChapterId): ChapterDef {
  return requireById(CHAPTERS, id, "chapter");
}

export function cueCardById(id: CueKind): CueCardDef {
  return requireById(CUE_CARDS, id, "cue card");
}

export function nameCardById(id: string): NameCardDef | undefined {
  return NAME_CARDS.find((card) => card.id === id);
}

export function letterById(id: string): LetterDef | undefined {
  return LETTERS.find((letter) => letter.id === id);
}

export function awardById(id: AwardId): AwardDef {
  return requireById(AWARDS, id, "award");
}
