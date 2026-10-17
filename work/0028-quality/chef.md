# Task 0028 — Six Kitchens Phase C quality pass

## Method

- **Blind A/B against real games.** Each round compared eight of our screens with official store screenshots of the titles in `work/0013-research/references.md`, section "7. Six Kitchens - chef career, six cuisines, restaurant / food truck / TV": Venba, Cook, Serve, Delicious! 3?! and Good Pizza, Great Pizza.
- **Random labels.** Each pair was shown as A and B, with the sides picked at random, so the critic did not know which screen was ours.
- **Fresh critic each round.** A new critic judged every round with no memory of earlier rounds. It scored art, typography, feedback, readability and touch, gave an outcome, and flagged any pair where ours was clearly worse.
- **The bar:** at least 60% of pairs won or tied, and no pair clearly worse.
- **Our screenshots** came from `e2e/chef/qualityShots.spec.ts` at 1280 x 800. That spec only runs when `QUALITY_SHOTS_DIR` is set.
- **What stays out of the repo:** reference screenshots belong to their owners. They were kept outside the repo, and nothing was traced or copied from them. Every change came from general craft: composition, hierarchy, colour, lighting, depth, texture, typography, feedback and spacing.

## Pairs

| Pair | Screen kind | Our screen                            | Reference title             |
| ---- | ----------- | ------------------------------------- | --------------------------- |
| 1    | title       | Title                                 | Cook, Serve, Delicious! 3?! |
| 2    | hub         | Cookery Student hub (Larkspur school) | Good Pizza, Great Pizza     |
| 3    | hub         | The Harbour Table restaurant hub      | Good Pizza, Great Pizza     |
| 4    | craft-step  | The Board: chop the kelewele plantain | Venba                       |
| 5    | craft-step  | The Hob: sizzle the kelewele          | Venba                       |
| 6    | craft-step  | Plate It: dal tadka                   | Good Pizza, Great Pizza     |
| 7    | showcase    | The pass: dal tadka under the lamps   | Venba                       |
| 8    | results     | Results: "Chef Arjun Mehra is proud!" | Good Pizza, Great Pizza     |

## Round 1 — 2/8 won or tied (25%), 4 clearly worse — fail

| Pair | Kind       | Reference                   | Outcome | Clearly worse | Criteria ours won                        |
| ---- | ---------- | --------------------------- | ------- | ------------- | ---------------------------------------- |
| 1    | title      | Cook, Serve, Delicious! 3?! | win     | no            | art, typography, readability, touch      |
| 2    | hub        | Good Pizza, Great Pizza     | loss    | yes           | none                                     |
| 3    | hub        | Good Pizza, Great Pizza     | loss    | yes           | typography                               |
| 4    | craft-step | Venba                       | loss    | no            | typography, feedback, readability, touch |
| 5    | craft-step | Venba                       | loss    | yes           | typography, readability, touch           |
| 6    | craft-step | Good Pizza, Great Pizza     | loss    | no            | typography, feedback, readability        |
| 7    | showcase   | Venba                       | loss    | yes           | typography, readability, touch           |
| 8    | results    | Good Pizza, Great Pizza     | win     | no            | typography, feedback, readability, touch |

The critic's main points:

- Both hubs read as a dense dashboard of small cards with tiny caps labels, and content was cut off at the bottom.
- The chop step looked like a prototype: a banana that was one yellow capsule and a rectangle knife on a plain board.
- The sizzle step had a layout bug, overlapping orange rings in the pan and a large empty grey Done box.
- The pass showed a small flat bowl in a spotlight box, and the bell was cut off at the bottom.

## Round 2 — 3/8 won or tied (38%), 1 clearly worse — fail

| Pair | Kind       | Reference                   | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Cook, Serve, Delicious! 3?! | win     | no            | art, typography, feedback, readability, touch |
| 2    | hub        | Good Pizza, Great Pizza     | loss    | yes           | none                                          |
| 3    | hub        | Good Pizza, Great Pizza     | loss    | no            | typography                                    |
| 4    | craft-step | Venba                       | win     | no            | typography, feedback, readability, touch      |
| 5    | craft-step | Venba                       | loss    | no            | typography, feedback, readability, touch      |
| 6    | craft-step | Good Pizza, Great Pizza     | loss    | no            | typography                                    |
| 7    | showcase   | Venba                       | loss    | no            | typography, feedback, readability, touch      |
| 8    | results    | Good Pizza, Great Pizza     | win     | no            | art, typography, feedback, readability, touch |

The chop step turned into a win, and the sizzle step, restaurant hub and pass were no longer clearly worse. The student hub was still "a web dashboard with a dozen panels" whose art banner was "mostly covered by an overlay card". The plating step stacked seven UI zones beside "a fairly flat soup plate".

## Round 3 — 5/8 won or tied (63%), 1 clearly worse — fail

| Pair | Kind       | Reference                   | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Cook, Serve, Delicious! 3?! | win     | no            | art, typography, feedback, readability, touch |
| 2    | hub        | Good Pizza, Great Pizza     | loss    | yes           | none                                          |
| 3    | hub        | Good Pizza, Great Pizza     | loss    | no            | typography, readability                       |
| 4    | craft-step | Venba                       | win     | no            | typography, feedback, readability, touch      |
| 5    | craft-step | Venba                       | win     | no            | typography, feedback, readability, touch      |
| 6    | craft-step | Good Pizza, Great Pizza     | loss    | no            | typography, feedback                          |
| 7    | showcase   | Venba                       | win     | no            | typography, feedback, readability, touch      |
| 8    | results    | Good Pizza, Great Pizza     | win     | no            | typography, feedback, readability, touch      |

The share passed, but the student hub was still clearly worse: "a web dashboard of six text panels with small type", and its corridor of "flat coloured rectangle doors is stiff". The sizzle step and the pass both turned into wins.

## Round 4 — 6/8 won or tied (75%), 1 clearly worse — fail

| Pair | Kind       | Reference                   | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Cook, Serve, Delicious! 3?! | win     | no            | art, typography, feedback, readability, touch |
| 2    | hub        | Good Pizza, Great Pizza     | loss    | yes           | none                                          |
| 3    | hub        | Good Pizza, Great Pizza     | loss    | no            | typography                                    |
| 4    | craft-step | Venba                       | win     | no            | typography, feedback, readability, touch      |
| 5    | craft-step | Venba                       | win     | no            | typography, feedback, readability, touch      |
| 6    | craft-step | Good Pizza, Great Pizza     | win     | no            | typography, feedback, readability, touch      |
| 7    | showcase   | Venba                       | win     | no            | typography, feedback, readability, touch      |
| 8    | results    | Good Pizza, Great Pizza     | win     | no            | typography, feedback, readability, touch      |

The best round. Plating turned into a win. The student hub was still clearly worse: "a nice row of doors" under a stat bar, a header, a rent note, a class board, a next-rung panel and cut-off cards, "so it reads like a dashboard".

## Round 5 — 2/8 won or tied (25%), 1 clearly worse — fail

| Pair | Kind       | Reference                   | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Cook, Serve, Delicious! 3?! | win     | no            | art, typography, feedback, readability, touch |
| 2    | hub        | Good Pizza, Great Pizza     | loss    | no            | none (feedback tied)                          |
| 3    | hub        | Good Pizza, Great Pizza     | loss    | no            | typography (readability tied)                 |
| 4    | craft-step | Venba                       | win     | no            | typography, feedback, readability, touch      |
| 5    | craft-step | Venba                       | loss    | no            | typography, readability, touch                |
| 6    | craft-step | Good Pizza, Great Pizza     | loss    | no            | typography                                    |
| 7    | showcase   | Venba                       | loss    | no            | typography, feedback, readability, touch      |
| 8    | results    | Good Pizza, Great Pizza     | loss    | yes           | none                                          |

The student hub was no longer clearly worse for the first time. This critic weighed art far more heavily than the earlier ones: the sizzle step, plating and the pass, which won in round 4 on clarity, all lost on art.

**A label slip on pair 8.** The critic's written reason says the results screen ("a hero plate with a rosette, a star score, a mentor quote, reasons for the score, earned rewards in coloured pills and a single large CTA") is the real results screen and the oven shot "communicates no outcome, reward or next step". Our results screen was image B, not A, so the critic's own reasoning favours ours while the scored verdict went to the reference. The table keeps the score as recorded. Read by the critic's reasoning, round 5 would be 3/8 (38%) with nothing clearly worse, which still fails the 60% bar.

## What changed between rounds

### Round 1 to round 2

- **Title:** the card became two columns, with the wordmark, a big Continue button and New Game and Settings on the left, and three plated dishes on a round wooden board with a checked cloth on the right. The save slots moved below as "Your saves".
- **Student hub:** a dark card floated over the hero, and the doors of the mentor kitchens showed each kitchen's dish.
- **Restaurant hub:** the week's money became a green bar for money in and a red bar for money out, and the guest notes became sticky notes.
- **Chop:** the board sits on a kitchen counter in front of a tiled wall, with a bowl of chopped pieces beside it. The knife became a cleaver with a handle, and a row of cut pips counts the cuts.
- **Sizzle:**
  - The layout bug was fixed.
  - The heat became a tall ladder with a "best" tag on the right setting.
  - The pan sits on a dark hob, with a "Rim cooks slower" label.
  - The Done tray became a rack of dashed slots.
- **Plating:** the plate sits on a wooden table with a fork and a napkin. Garnish cards tick when placed, the plate colours are labelled, and Wipe rim and Plate it sit together.
- **Pass:** the plate fills the pass under hanging heat lamps with light cones, order tickets and sparkles, beside a big "Service!" bell.
- **Results:** sparkles around the plate, a framed star score and coloured reward chips for coins, reputation and buzz.

### Round 2 to round 3

- **Title:** "SIX" sits on a red badge above "Kitchens". Each save slot shows coins and reputation, with its own Load and New game buttons.
- **Student hub:** the overlay card was removed. The text sits on the left, and a corridor of six mentor doors with name plates fills the right.
- **Restaurant hub:** the overlay card was removed. A harbour window at sunset with boats, hanging lamps and "Awards to win" chips fill the hero. The end-of-night note sits in its own card with a "Tonight's report" button.
- **Chop:** the instruction runs across the top. The helper and the safety note moved into the side panel, and the plantain gained spots.
- **Sizzle:** burner flames sit under the heat ladder, and a "Nice work so far" chip shows the chop score.
- **Plating:** the checklist became a column of ticks. The plate colours moved under the plate.
- **Pass:** the order tickets name their tables, and the bell moved into a card on the right.
- **Results:** the rewards sit under a "You earned" header. The first reason reads "Nothing was skipped."

### Round 3 to round 4

- **Title:** the save slots sit on a wooden shelf, and each empty slot shows a clean apron on a hook.
- **Student hub:** the hero became a full-width hallway with an arched door in each mentor's colour, bunting, name tags and a "Today" tag on the next lesson's door. The Class board and the Next rung panel moved to the right.
- **Restaurant hub:**
  - The hero became the dining room: laid tables, a "Tonight" chalkboard menu and the harbour window.
  - The right panel shows a hanging "Closed" sign when service is over, with "All done here. Tap End the day when you're ready to rest."
- **Chop:** a red knife line with arrow ends marks where to cut.
- **Sizzle:** the pieces are drawn as golden cubes, and the Done rack slots are numbered 1 to 5.
- **Plating:** Wipe rim became a chip on the plate, and a big green "Plate it" runs under the checklist.
- **Pass:** the plate sits on a larger glow of rays, and the line reads "Your plate glows under the lamp. Ring the bell when ready!"
- **Results:** the fee and the tip became small chips above the rewards.

### Round 4 to round 5

- **Title:** the logo sits beside a larger wordmark.
- **Student hub:** the actions moved into the header, and the hallway fills the width under ceiling lamps, with the student standing in it.
- **Restaurant hub:** the dining room fills the width, with a wooden wall, lamps, the restaurant's name in the window and tables in perspective. The awards moved into the right panel under the Closed sign.
- **Chop:** the board sits on a wooden counter front, and a "next" tag marks the next cut.
- **Plating:** Wipe rim moved into the checklist, and the garnish spots on the plate show as dashed rings.
- **Pass:** a stack of clean plates and chutney bowls sit on the counter. The tickets use larger handwriting.
- **Results:** the plate sits on a wooden charger with a "5 of 5" rosette. Cuisine mastery became its own green chip, and the fee and tip sit in the "You earned" header.

### Across the rounds

- **New art, each in its own file:** the title spread, the school corridor and its mentor doors, the chef's knife and chopped pile, the hob flame and pan pieces, the plating table, the pass scene, plate sparkles, the score rosette, the closed sign, the coin jar, the chalk pot, the apron hook, and bowls with sauce swirls for the hero dishes.
- **New UI pieces:** a `StatUnit` that gives the top-bar and dish-header chips a unit, such as "93 coins" and "6 h left"; a dish side panel that holds the ticket, step scores and the helper card; and a shared awards list for the restaurant hero and the tonight card. The sizzle, plating, pass and hub hero styles moved into their own stylesheets.
- **Core and tests:** the helper hint reads "Stuck? Switch it on." `cookUntil` in the scripted playthrough stops a dish at any stage, so the quality spec can photograph each step. The screenshot settle waits for every count-up number to reach its target.

## Final result

**Not passed. The best round reached 6/8 won or tied (75%), but one pair was clearly worse in every round.**

| Round | Won or tied | Clearly worse | Pass |
| ----- | ----------- | ------------- | ---- |
| 1     | 2/8 (25%)   | 4             | no   |
| 2     | 3/8 (38%)   | 1             | no   |
| 3     | 5/8 (63%)   | 1             | no   |
| 4     | 6/8 (75%)   | 1             | no   |
| 5     | 2/8 (25%)   | 1             | no   |

The title won all five rounds and the chop step won the last four. The results screen won rounds 1 to 4.

## Remaining gap

- **Student hub (clearly worse in rounds 1 to 4, a loss in round 5).** The reference is one hand-drawn scene with one line of dialogue in big type and two huge answer buttons. Ours is a scene plus a stat bar, a header, a rent note, a class board and a next-rung panel. Every critic called it a dashboard. Closing this needs a different layout, not more polish: one character, one line and one or two big choices, with the class board and stats behind a button.
- **Restaurant hub (lost all five rounds).** The reference is a tactile station of ingredient bins. Ours is clearer about what to do, but it is still a scene beside text panels, and the scene art is flat vector. The tonight actions should live in the room itself, for example as the pass, the menu board and the door.
- **Art.** Ours won art only on the title and, once, on results. Against Venba's grainy, lit, textured food and Good Pizza, Great Pizza's hand-drawn bins, our smooth vector plates, pans and boards lose every time. The craft steps and the pass win when the critic weighs clarity and lose when it weighs looks, which is why round 5 fell from 6/8 to 2/8. The next step is a shared art pass: texture and grain, warmer lighting, hand-drawn line and bigger food in frame.
- **Plating (won once in five).** It is clear but busy: garnish cards, a tool bar, a checklist, plate colours, a ticket and a helper all share one screen. It needs fewer zones and bigger drag sources.
- **Critic variance.** Round 5's verdict on the results screen contradicts the critic's own reasoning (see above). Even so, the bar was not met in any round.
