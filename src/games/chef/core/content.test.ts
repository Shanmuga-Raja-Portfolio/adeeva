import { describe, expect, it } from "vitest";
import { hasUniqueIds } from "../../../engine/uniqueIds";
import { CLIENTS } from "../content/client";
import { CUE_CARDS } from "../content/cueCard";
import { CUISINES, CUISINE_IDS } from "../content/cuisine";
import { DISHES } from "../content/dish";
import { INGREDIENTS } from "../content/ingredient";
import { MENTORS } from "../content/mentor";
import { PLATE_COMPONENTS } from "../content/plateComponent";
import { JARS } from "../content/seasoning";
import { STORY_BEATS } from "../content/storyBeat";
import { componentById, ingredientById } from "./catalog";
import { dishCost, fairPrice } from "./dishCost";
import { ghostLayout, plateComponentIds, scorePlate } from "./plate";
import { cuisineJars, minimumPointPinches } from "./taste";

const TABLE_COSTS: Readonly<Record<string, readonly [number, number]>> = {
  "spaghetti-al-pomodoro": [2, 6],
  minestrone: [2, 6],
  "gnocchi-al-pesto": [2.5, 8],
  "risotto-alla-zucca": [3, 9],
  "dal-tadka": [1.5, 5],
  "chana-masala": [2, 6],
  sambar: [2, 6],
  "vegetable-biryani": [2, 6],
  "miso-soup": [1.5, 5],
  onigiri: [2.5, 8],
  tamagoyaki: [1, 3],
  oyakodon: [3.5, 11],
  "guacamole-con-totopos": [2.5, 8],
  elote: [2.5, 8],
  "sopa-de-tortilla": [3, 9],
  "enchiladas-verdes": [4, 12],
  "omelette-aux-fines-herbes": [1.5, 5],
  ratatouille: [2, 6],
  "croque-monsieur": [3.5, 11],
  "gratin-dauphinois": [1.5, 5],
  "jollof-rice": [2, 6],
  kelewele: [1.5, 5],
  "red-red": [2.5, 8],
  "poulet-yassa": [2.5, 8],
};

describe("Six Kitchens content", () => {
  it("has 60 ingredients, 15 jars, 24 dishes, 6 mentors and 10 clients, all with unique ids", () => {
    expect(INGREDIENTS).toHaveLength(60);
    expect(JARS).toHaveLength(15);
    expect(DISHES).toHaveLength(24);
    expect(MENTORS).toHaveLength(6);
    expect(CLIENTS).toHaveLength(10);
    for (const list of [INGREDIENTS, JARS, DISHES, MENTORS, CLIENTS, PLATE_COMPONENTS, STORY_BEATS])
      expect(hasUniqueIds(list)).toBe(true);
  });

  it("recomputes every dish's cost and fair price from its ingredients", () => {
    for (const dish of DISHES) {
      for (const id of dish.ingredients) expect(() => ingredientById(id)).not.toThrow();
      expect([dishCost(dish), fairPrice(dish)], dish.id).toEqual(TABLE_COSTS[dish.id]);
    }
  });

  it("gives every cuisine four dishes with the same unlock spread and a mentor", () => {
    for (const cuisine of CUISINE_IDS) {
      const dishes = DISHES.filter((dish) => dish.cuisine === cuisine);
      expect(dishes.map((dish) => dish.unlock)).toEqual(["learner", "learner", "confident", "expert"]);
      expect(MENTORS.filter((mentor) => mentor.cuisine === cuisine)).toHaveLength(1);
    }
    for (const cuisine of CUISINES) expect(new Set(cuisine.jars).size).toBe(4);
  });

  it("weights every dish's steps to 100 and backs each step with its mini-game", () => {
    for (const dish of DISHES) {
      expect(
        dish.steps.reduce((sum, step) => sum + step.weight, 0),
        dish.id,
      ).toBe(100);
      const kinds = dish.steps.map((step) => step.kind);
      expect(kinds[kinds.length - 1]).toBe("plate");
      expect(kinds.includes("chop"), dish.id).toBe(dish.chop.length > 0);
      expect(kinds.includes("sizzle"), dish.id).toBe(dish.sizzle !== null);
      expect(kinds.includes("simmer"), dish.id).toBe(dish.simmer !== null);
      expect(kinds.includes("taste"), dish.id).toBe(dish.taste !== null);
      for (const item of dish.chop) expect(dish.ingredients, dish.id).toContain(item.ingredient);
    }
  });

  it("tastes chicken and egg dishes only after the protein is cooked", () => {
    for (const dish of DISHES.filter((entry) =>
      entry.ingredients.some((id) => id === "chicken" || id === "eggs"),
    )) {
      const kinds = dish.steps.map((step) => step.kind);
      if (!kinds.includes("taste")) continue;
      const cooked = Math.max(kinds.indexOf("sizzle"), kinds.indexOf("simmer"));
      expect(kinds.indexOf("taste"), dish.id).toBeGreaterThan(cooked);
    }
  });

  it("can balance every dish's taste in two to four pinches with its own cuisine's jars", () => {
    for (const dish of DISHES) {
      if (dish.taste === null) continue;
      const pinches = minimumPointPinches(dish.taste, cuisineJars(dish.cuisine));
      expect(pinches, dish.id).toBeGreaterThanOrEqual(2);
      expect(pinches, dish.id).toBeLessThanOrEqual(4);
      expect(dish.taste.savoury).toBeGreaterThanOrEqual(1);
    }
  });

  it("offers a ghost plate for every dish that scores full marks", () => {
    for (const dish of DISHES) {
      for (const id of plateComponentIds(dish)) expect(() => componentById(id)).not.toThrow();
      const result = scorePlate(
        dish,
        { components: ghostLayout(dish), plateColour: "white", wiped: true, assisted: false },
        1,
      );
      expect(result.accuracy, dish.id).toBe(1);
    }
  });

  it("never uses words the culture checklist rules out", () => {
    const text = JSON.stringify([DISHES, MENTORS, CLIENTS, STORY_BEATS, INGREDIENTS, CUE_CARDS]);
    expect(text).not.toMatch(
      /\b(exotic|ethnic|authentic|weird|spicy foreigners?|wine|beer|sake|mirin|healthy|guilt|light)\b/i,
    );
  });

  it("writes cue card tips that are kind or just unclear, never careless or rude", () => {
    for (const card of CUE_CARDS) {
      expect(new Set(card.tips.map((tip) => tip.text)).size, card.id).toBe(3);
      expect(
        card.tips.filter((tip) => tip.kind),
        card.id,
      ).toHaveLength(1);
    }
    expect(JSON.stringify(CUE_CARDS)).not.toMatch(/\b(bother|nobody|guess|whatever|walk away|at once)\b/i);
  });
});
