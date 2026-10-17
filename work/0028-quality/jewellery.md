# Task 0035 — Jewellery Bench Phase C quality pass

## Method

- **Blind A/B against real games.** Each round compared eight of our screens with official store screenshots of the titles in `work/0013-research/references.md`, section "5. Jewellery Bench - jewellery": LAPIDARY: Jewel Craft Simulator, Trinket Bag Maker and Potion Craft: Alchemist Simulator.
- **Random labels.** Each pair was shown as A and B, with the sides picked at random, so the critic did not know which screen was ours.
- **Fresh critic each round.** A new critic judged every round with no memory of earlier rounds. It scored art, typography, feedback, readability and touch, gave an outcome, and flagged any pair where ours was clearly worse.
- **The bar:** at least 85% of pairs won or tied, and no pair clearly worse.
- **Our screenshots** came from `e2e/jewellery/qualityShots.spec.ts` at 1280 x 800. That spec only runs when `QUALITY_SHOTS_DIR` is set.
- **What stays out of the repo:** reference screenshots belong to their owners. They were kept outside the repo, and nothing was traced or copied from them. Every change came from general craft: composition, hierarchy, colour, lighting, depth, texture, typography, feedback and spacing.

## Pairs

| Pair | Screen kind | Our screen                              | Reference title                   |
| ---- | ----------- | --------------------------------------- | --------------------------------- |
| 1    | title       | Title                                   | Trinket Bag Maker                 |
| 2    | hub         | Thimble Lane Arcade hub                 | Potion Craft: Alchemist Simulator |
| 3    | hub         | The Lantern Loft hub (second career)    | Potion Craft: Alchemist Simulator |
| 4    | craft-step  | Cut the shape under the loupe           | LAPIDARY: Jewel Craft Simulator   |
| 5    | craft-step  | Join the seam under the lamp            | Potion Craft: Alchemist Simulator |
| 6    | craft-step  | Set the stone                           | Trinket Bag Maker                 |
| 7    | results     | Results: the client opens the gift box  | LAPIDARY: Jewel Craft Simulator   |
| 8    | showcase    | Lantern Launch: the piece on the plinth | LAPIDARY: Jewel Craft Simulator   |

## Round 1 — 1/8 won or tied (13%), 4 clearly worse — fail

| Pair | Kind       | Reference                         | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Trinket Bag Maker                 | loss    | no            | typography, readability, touch                |
| 2    | hub        | Potion Craft: Alchemist Simulator | loss    | yes           | readability, touch                            |
| 3    | hub        | Potion Craft: Alchemist Simulator | loss    | yes           | readability, touch                            |
| 4    | craft-step | LAPIDARY: Jewel Craft Simulator   | loss    | no            | typography, feedback, readability, touch      |
| 5    | craft-step | Potion Craft: Alchemist Simulator | loss    | yes           | readability, touch                            |
| 6    | craft-step | Trinket Bag Maker                 | loss    | yes           | typography, readability                       |
| 7    | results    | LAPIDARY: Jewel Craft Simulator   | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | LAPIDARY: Jewel Craft Simulator   | loss    | no            | typography, readability, touch                |

The critic's main points:

- The title art was a flat, washed-out arcade behind a plain cream card. It read as a web menu rather than a game.
- Both hubs looked like a web dashboard of cream cards under a small banner, with a stiff standing character and generic market stalls.
- The cut step's play area was a huge flat yellow disc with a thin line and a tiny saw, with no sense of metal or jewellery.
- The joining lamp heated a flat grey slab with placeholder-like line strokes.
- The setting step was a teal circle with a ruby and four flat yellow claws, which read as a diagram. Its status also contradicted itself: "Yes!" and "Stone is set" while the panel said 0 of 1 set.
- The showcase piece was tiny and washed out in a pink glow, and a hard-edged spotlight wedge cut across the stage.
- Results won: a client quote, an open gift box, stars, a per-skill breakdown and a big Back button.

## Round 2 — 7/8 won or tied (88%), 0 clearly worse — pass

| Pair | Kind       | Reference                         | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Trinket Bag Maker                 | win     | no            | typography, feedback, readability, touch      |
| 2    | hub        | Potion Craft: Alchemist Simulator | win     | no            | typography, readability, touch                |
| 3    | hub        | Potion Craft: Alchemist Simulator | loss    | no            | typography, readability, touch                |
| 4    | craft-step | LAPIDARY: Jewel Craft Simulator   | win     | no            | art, typography, feedback, readability, touch |
| 5    | craft-step | Potion Craft: Alchemist Simulator | win     | no            | typography, feedback, readability, touch      |
| 6    | craft-step | Trinket Bag Maker                 | win     | no            | typography, feedback, readability             |
| 7    | results    | LAPIDARY: Jewel Craft Simulator   | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | LAPIDARY: Jewel Craft Simulator   | win     | no            | typography, feedback, readability, touch      |

## What changed between rounds

- **Title:** the wordmark, three hero pieces and the menu now sit in one hero column, with the save slots in a side panel so the save shows without scrolling. Continue is the big glowing button and Settings became a real button with a gear. The backdrop became a lit night market: rooftops with warm windows, arched arcade bays, bunting and lantern pools of light.
- **Arcade backdrop:** new market stalls with scalloped awnings, wood counters and bead goods give the arcade a sense of place instead of a blurred strip.
- **Hubs:**
  - A jeweller's bench with a lamp, tools and bead trays now stands in the hero banner, so the character works at something instead of standing stiffly.
  - The hours beads gained a plain "hours left" count beside them, such as "6 of 8 hours left".
  - The shift button only shows when a shift is possible; otherwise a short "mornings only" note explains it.
  - The loft's round window gained a crescent moon, and the loft title became the shorter "The Lantern Loft".
- **Every bench step:** the step now sits on one framed work station, and the meters became gold and teal bars with a big number, instead of two small text figures.
- **Cut step:** the flat disc became a brushed metal sheet on a wooden block, the cut-out shows as a soft pale fill, and the saw is nearly twice the size with a proper frame and handle.
- **Join step:** the grey slab became a warming block with a brick face, glowing holes and an ember glow that turns orange when it is too hot. The seam's leading point became a bright star spark, and the gold zone carries a "Gold" tag on the gauge.
- **Set step:** the teal circle became a metal setting plate with a milgrain edge and a deep cup for the stone, and the claws became shaded prongs with drop shadows. Gold target dots show where each claw goes. The status now reads "Stone: Seated / Loose" and "Claws snug", and the finish button says "Finish setting" with a visible reason while it is locked, so the screen no longer contradicts itself.
- **Results:** ribbon confetti falls over the scene for a happy client, the gift box gained a satin ribbon, a bow and shading, and the praise list moved under the scene with bigger sparkles.
- **Showcase:** the piece is shown much larger on a velvet halo with a soft aura in the lantern colour. The spotlight became a soft, blurred beam that fades upward, and the sparkle moved off the piece so it no longer washes it out.

## Final result

**Passed in round 2: 7/8 won or tied (88%), none clearly worse.**

Our screens won seven pairs:

- the title
- the arcade hub
- the cut step
- the join step
- the set step
- results
- the showcase

## Remaining gap

- **Lantern Loft hub (still a loss, no longer clearly worse).** The reference's alchemy lab is a rich, glowing illustrated set piece. Ours is clearer, with bigger buttons and plain stats, but the loft scene is flat, its lanterns look like grey placeholders, and banners and panels cover most of it. It reuses the same character and desk as the arcade hub, and the screen stacks four horizontal bands.
- **Art is still the criterion we lose most.** Only the cut step and results won on art. Every other win came from clear goals, live meters, celebration and readable type. The critics still called the hubs a dashboard laid over a backdrop, with the lower cards cut off at the fold, and the join step a dark box inside a wood panel inside a cream page.
- **Set step touch.** The critic preferred the reference's big drag-and-drop charms for touch. Our claw controls work, but the step is wordier than it needs to be for a simple action.
- **Showcase piece size.** The piece is bigger now, but the critics still noted it is small within the stage.
- **Next steps:** a fuller illustrated loft with lit lanterns and props instead of stacked bands, a hub layout that keeps the order cards above the fold, fewer nested frames around the lamp scene, and shorter set-step text would close most of what is left.
