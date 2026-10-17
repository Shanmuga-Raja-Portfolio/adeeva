# Task 0028 — Patisserie Atelier Phase C quality pass

## Method

- **Blind A/B against real games.** Each round compared eight of our screens with official store screenshots of the titles in `work/0013-research/references.md`, section "3. Patisserie Atelier - cakes and pastry": Tiny Bakery, Lemon Cake and Cookie's Bakery.
- **Random labels.** Each pair was shown as A and B, with the sides picked at random, so the critic did not know which screen was ours.
- **Fresh critic each round.** A new critic judged every round with no memory of earlier rounds. It scored art, typography, feedback, readability and touch, gave an outcome, and flagged any pair where ours was clearly worse.
- **The bar:** at least 60% of pairs won or tied, and no pair clearly worse.
- **Our screenshots** came from `e2e/patisserie/qualityShots.spec.ts` at 1280 x 800. That spec only runs when `QUALITY_SHOTS_DIR` is set.
- **What stays out of the repo:** reference screenshots belong to their owners. They were kept outside the repo, and nothing was traced or copied from them. Every change came from general craft: composition, hierarchy, colour, lighting, depth, texture, typography, feedback and spacing.

## Pairs

| Pair | Screen kind | Our screen           | Reference title |
| ---- | ----------- | -------------------- | --------------- |
| 1    | title       | Title                | Tiny Bakery     |
| 2    | hub         | Bakery hub           | Tiny Bakery     |
| 3    | hub         | Comet Room salon hub | Lemon Cake      |
| 4    | craft-step  | Scoop & Weigh        | Lemon Cake      |
| 5    | craft-step  | Pipe the icing       | Cookie's Bakery |
| 6    | craft-step  | Toppings             | Tiny Bakery     |
| 7    | results     | Results              | Lemon Cake      |
| 8    | showcase    | Glasshouse showcase  | Cookie's Bakery |

## Round 1 — 4/8 won or tied (50%), 2 clearly worse — fail

| Pair | Kind       | Reference       | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bakery     | win     | no            | typography, readability, touch                |
| 2    | hub        | Tiny Bakery     | loss    | no            | typography, readability, touch                |
| 3    | hub        | Lemon Cake      | loss    | yes           | none                                          |
| 4    | craft-step | Lemon Cake      | loss    | yes           | typography, readability, touch                |
| 5    | craft-step | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |
| 6    | craft-step | Tiny Bakery     | loss    | no            | typography, readability                       |
| 7    | results    | Lemon Cake      | win     | no            | typography, readability, touch                |
| 8    | showcase   | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |

The critic's main points:

- Both hubs read as a web dashboard: dense cards, small text and a static, empty hero stage.
- The salon hub was a text-heavy list of tiers with almost no art.
- The weigh step was a tidy scale on its own, with no kitchen around it.
- The toppings tray was pale and washed out, and the cake stood on an empty beige gradient.

## Round 2 — 5/8 won or tied (63%), 1 clearly worse — fail

| Pair | Kind       | Reference       | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bakery     | win     | no            | typography, readability, touch                |
| 2    | hub        | Tiny Bakery     | loss    | no            | typography, readability, touch                |
| 3    | hub        | Lemon Cake      | loss    | yes           | typography                                    |
| 4    | craft-step | Lemon Cake      | loss    | no            | typography, readability, touch                |
| 5    | craft-step | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |
| 6    | craft-step | Tiny Bakery     | win     | no            | typography, feedback, readability             |
| 7    | results    | Lemon Cake      | win     | no            | typography, feedback, readability, touch      |
| 8    | showcase   | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |

Toppings turned into a win, and the weigh step was no longer clearly worse. The salon hub was still "a big flat lavender wall plus a text-panel stack". The weigh step "looks like a form app" and showed no visible pour.

## Round 3 — 6/8 won or tied (75%), 1 clearly worse — fail

| Pair | Kind       | Reference       | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bakery     | win     | no            | typography, readability, touch                |
| 2    | hub        | Tiny Bakery     | win     | no            | typography, readability, touch                |
| 3    | hub        | Lemon Cake      | loss    | yes           | typography, readability                       |
| 4    | craft-step | Lemon Cake      | loss    | no            | typography, readability, touch                |
| 5    | craft-step | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |
| 6    | craft-step | Tiny Bakery     | win     | no            | typography, feedback, readability, touch      |
| 7    | results    | Lemon Cake      | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |

The share passed, but the salon hub was still clearly worse: "a tidy 2D information page with a static paper-doll character, and the lower half is a scrolling panel of text rows". The bakery hub won narrowly, and the critic called its art "stiff paper-doll".

## Round 4 — 5/8 won or tied (63%), 1 clearly worse — fail

| Pair | Kind       | Reference       | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bakery     | win     | no            | typography, readability, touch                |
| 2    | hub        | Tiny Bakery     | loss    | no            | typography, readability, touch                |
| 3    | hub        | Lemon Cake      | loss    | yes           | none (touch tied)                             |
| 4    | craft-step | Lemon Cake      | loss    | no            | typography, readability, touch                |
| 5    | craft-step | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |
| 6    | craft-step | Tiny Bakery     | win     | no            | typography, feedback, readability, touch      |
| 7    | results    | Lemon Cake      | win     | no            | typography, feedback, readability, touch      |
| 8    | showcase   | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |

A new critic scored the bakery hub as a loss again: "a dense dashboard of cards with a small, static hero scene". The salon hub still showed "a stiff parlour picture and a wall of tier cards and status rows".

## Round 5 — 6/8 won or tied (75%), 1 clearly worse — fail

| Pair | Kind       | Reference       | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bakery     | win     | no            | typography, readability, touch                |
| 2    | hub        | Tiny Bakery     | win     | no            | typography, feedback, readability, touch      |
| 3    | hub        | Lemon Cake      | loss    | yes           | typography (touch tied)                       |
| 4    | craft-step | Lemon Cake      | loss    | no            | typography, readability, touch                |
| 5    | craft-step | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |
| 6    | craft-step | Tiny Bakery     | win     | no            | typography, feedback, readability, touch      |
| 7    | results    | Lemon Cake      | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Cookie's Bakery | win     | no            | art, typography, feedback, readability, touch |

## What changed between rounds

### Round 1 to round 2

- **Title:**
  - String lights run across the top.
  - Glass cake domes stand on the shelf.
  - Each save slot shows coins and reputation, with its own Load and New game buttons.
- **Bakery hub:**
  - The hero became a shop counter with a display case of macarons, a cake under glass, a flower vase and a street of houses outside the window.
  - The top bar chips are labelled Reputation and Buzz.
  - Settings became a real button.
- **Salon hub:**
  - The hero became a parlour with curtains, a night window, a tea table, a cake stand and a plant.
  - The season panel sits in front of a glasshouse.
- **Scoop & Weigh:** the scale stands on a wooden bench in front of a tiled wall with utensils and a jar shelf. The ingredient name, Pouring button and Keep button sit together in one card.
- **Pipe the icing:** the cake sits on a wooden table with a piping bag, an icing bowl, a tea towel and sprinkles. Two labelled bars show "How far you have piped" and "How neat it is".
- **Toppings:**
  - The cake stands in the same kitchen scene.
  - The tray tiles are bolder and say "None left" in words.
  - The footer cheers "Gorgeous! Let's box it up." beside a big Box it up button.
- **Results:** a light burst, confetti and sparkles rise behind the cake, which now sits in an open gift box with a bow.
- **Showcase:** the sparkles are bigger, each audience portrait shows a reaction badge, and the show progress bar is labelled.

### Round 2 to round 3

- **Bakery hub:**
  - A customer waits at the counter with a thought bubble that shows her order.
  - A bread basket and a cookie jar fill the counter.
- **Salon hub:**
  - The parlour was rebuilt with a glass cake cabinet, bunting, pendant lamps, two laid tea tables with chairs and a palm.
  - The glasshouse gained string lights.
  - The season vignette shows fuller blossom trees.
- **Scoop & Weigh:**
  - A flour bag tips a visible stream into the bowl.
  - The dial is labelled 70, 140, 200 and 280.
  - The readout reads "123 / 200 g".
- **Pipe the icing:** neatness became a five-star rating. The hint "Squeeze gently and follow the dots" sits between the Scrape and Keep buttons.
- **Toppings:** the tray shows the placed topping first, with "2 placed". The rotate and scale controls moved to a tall side rail.
- **Results:** the confetti is fuller, with curling ribbons, and each skill bar is marked "Super".
- **Showcase:** the audience became half-length figures behind a wooden rail, and the cake glows on a gold pedestal.

### Round 3 to round 4

- **Title:**
  - The shop sign and awning were removed, so the title card stands alone in a warm lit room.
  - The navy cake on the left became a pink one.
  - The subtitle names Crumb & Comet.
- **Salon hub:**
  - The tiers became three side-by-side cards, each with a green "On the shelf · quality 99" bar.
  - Salon Day and Fair Day became large countdown badges.
  - The baker stands with a hand on her hip.
- **Scoop & Weigh:**
  - A purple banner across the top reads "Pouring… stop near 200 g".
  - The Pouring button runs across the bottom of the scene.
  - The flour bag stands on the bench with its name above it.
  - The eggs say "Tap to crack!".
- **Toppings:** empty toppings collapse into one "All used up" group, which leaves room for what matters.
- **Step rail:** finished steps shrink to ticks joined by a line, so the current step stands out.
- **Bakery hub:** the baker gestures with a raised arm.
- **Results:** the checklist became a two-column grid of ticks, and the skills sit in a two-by-two grid.
- **Showcase:** the audience are full figures with raised arms, and the caption reads "Show · part 5 of 13".
- **Hub top bar:** Settings became a round gear icon.

### Round 4 to round 5

- **Title:** Settings became a full button to match New Game. Empty save slots use bigger serif text.
- **Salon hub:**
  - Three seated customers fill the tea tables.
  - Each tier card has a green "On the shelf" header with the quality and colour chips for each shade.
  - The salon bookings list starts below the cards.
- **Bakery hub:** the customer at the counter holds flowers. The light from the window is softer.
- **Scoop & Weigh:** the order card carries the client's note, pinned below the checklist. The safety line became a quiet chip.
- **Pipe the icing:** the progress bar and the neatness stars sit in a header strip above the table, under the instruction "Squeeze gently and follow the dots."
- **Toppings:**
  - The cake gained a pearl swag.
  - The tools sit in a small floating card.
  - The tray says how many more toppings wait in the pantry.
- **Results:** a hearts strip shows "7 of 7 wishes", above the line "Every wish on the order, granted."
- **Showcase:** the cake gained pearl swags, and a smooth progress bar replaced the segmented one.
- **Core and tests:** the checklist label reads "Within budget" instead of "Ingredients". The scripted playthrough places toppings on the bigger cake top. A new `weighBanner` rule picks the weigh banner text, and `weighBanner.test.ts` covers it.

## Final result

**Not passed. The best rounds reached 6/8 won or tied (75%), but one pair was still clearly worse in every round.**

| Round | Won or tied | Clearly worse | Pass |
| ----- | ----------- | ------------- | ---- |
| 1     | 4/8 (50%)   | 2             | no   |
| 2     | 5/8 (63%)   | 1             | no   |
| 3     | 6/8 (75%)   | 1             | no   |
| 4     | 5/8 (63%)   | 1             | no   |
| 5     | 6/8 (75%)   | 1             | no   |

Our screens won six pairs in the final round:

- the title
- the bakery hub
- piping
- toppings
- results
- the showcase

## Remaining gap

- **Salon hub (clearly worse in all five rounds).** The reference is a busy, lit café: many customers at numbered tables, a pet and a mascot, and a hotbar of large item tiles. Ours has a richer parlour picture now, but the lower two-thirds of the screen is still status cards and text. Every critic called it a dashboard. Closing this needs a different layout, not more polish: the tiers and bookings should live inside the parlour scene, for example as cakes on the cabinet shelves and customers at the tables, with the text cut to short labels.
- **Scoop & Weigh (lost all five rounds).** The reference kitchen has fire, an urgent "burning" alert and ingredient slots that tick off. Ours teaches the task better: a target band, a pour banner and big buttons. It still feels calm and static. It needs motion and stakes, such as a pour stream that grows, flour dust, a wobbling needle and a visible row of ingredients that fill as they are weighed.
- **Bakery hub (won 2 of 5).** It flips with the critic. It wins on purpose and clarity, but loses on art against a lit 3D diorama: the cards below the hero are still dense.
- **Art.** Our art wins only on piping, results and the showcase, against the flat pixel and upgrade-tree references. Against the 3D titles (Tiny Bakery, Lemon Cake), we win on clarity, not on looks.
