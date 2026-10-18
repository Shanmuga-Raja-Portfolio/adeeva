# Task 0030 — Thrift-Flip Studio Phase C quality pass

## Method

- **Blind A/B against real games.** Each round compared eight of our screens with official store screenshots of the titles in `work/0013-research/references.md`, section "2. Thrift-Flip Studio - upcycling secondhand clothes": Thrifty Business, Tiny Bookshop and A Little to the Left.
- **Random labels.** Each pair was shown as A and B, with the sides picked at random, so the critic did not know which screen was ours.
- **Fresh critic each round.** A new critic judged every round with no memory of earlier rounds. It scored art, typography, feedback, readability and touch, gave an outcome, and flagged any pair where ours was clearly worse.
- **The bar:** at least 60% of pairs won or tied, and no pair clearly worse.
- **Our screenshots** came from `e2e/thrift-flip/qualityShots.spec.ts` at 1280 x 800. That spec only runs when `QUALITY_SHOTS_DIR` is set.
- **What stays out of the repo:** reference screenshots belong to their owners. They were kept outside the repo, and nothing was traced or copied from them. Every change came from general craft: composition, hierarchy, colour, lighting, depth, texture, typography, feedback and spacing.

## Pairs

| Pair | Screen kind | Our screen                       | Reference title      |
| ---- | ----------- | -------------------------------- | -------------------- |
| 1    | title       | Title                            | Tiny Bookshop        |
| 2    | hub         | Market stall hub                 | Thrifty Business     |
| 3    | hub         | Boutique hub (second career)     | Tiny Bookshop        |
| 4    | craft-step  | Snip old stitches                | A Little to the Left |
| 5    | craft-step  | Scrub the stains                 | A Little to the Left |
| 6    | craft-step  | Finishing touches                | Thrifty Business     |
| 7    | results     | Results ("Brought back to life") | Tiny Bookshop        |
| 8    | showcase    | Showcase hall                    | Thrifty Business     |

## Round 1 — 2/8 won or tied (25%), 2 clearly worse — fail

| Pair | Kind       | Reference            | Outcome | Clearly worse | Criteria ours won                              |
| ---- | ---------- | -------------------- | ------- | ------------- | ---------------------------------------------- |
| 1    | title      | Tiny Bookshop        | win     | no            | typography, readability, touch                 |
| 2    | hub        | Thrifty Business     | loss    | yes           | typography                                     |
| 3    | hub        | Tiny Bookshop        | loss    | yes           | none                                           |
| 4    | craft-step | A Little to the Left | loss    | no            | typography, feedback, readability              |
| 5    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability (touch tied) |
| 6    | craft-step | Thrifty Business     | loss    | no            | typography, readability                        |
| 7    | results    | Tiny Bookshop        | loss    | no            | readability                                    |
| 8    | showcase   | Thrifty Business     | loss    | no            | typography, feedback, readability              |

The critic's main points:

- Both hubs looked like a web dashboard of cream cards with a lot of small text, not a cozy game. The boutique hub had a shopfront banner squeezed behind overlapping cards.
- The snip step was mostly dead space around flat vector fabric.
- On the finishing step, the piece was small, transform handles and a popover covered it, and several trim icons were nearly invisible.
- The results screen was clear but flat, with little celebration.
- In the showcase, the model held the garment on a hanger instead of wearing it, and the audience were faceless bean figures.

## Round 2 — 2/8 won or tied (25%), 2 clearly worse — fail

| Pair | Kind       | Reference            | Outcome | Clearly worse | Criteria ours won                              |
| ---- | ---------- | -------------------- | ------- | ------------- | ---------------------------------------------- |
| 1    | title      | Tiny Bookshop        | loss    | no            | typography, readability, touch                 |
| 2    | hub        | Thrifty Business     | loss    | yes           | typography, readability (touch tied)           |
| 3    | hub        | Tiny Bookshop        | loss    | yes           | readability (touch tied)                       |
| 4    | craft-step | A Little to the Left | loss    | no            | typography, feedback, readability              |
| 5    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability, touch       |
| 6    | craft-step | Thrifty Business     | loss    | no            | typography, readability, touch                 |
| 7    | results    | Tiny Bookshop        | win     | no            | typography, feedback, readability (touch tied) |
| 8    | showcase   | Thrifty Business     | loss    | no            | typography, readability (touch tied)           |

The results screen now won, with a light-ray burst, confetti and a big score badge. The title lost this time on art: a flat beige wash with blurred stall shapes. The hubs were still clearly worse, because the new scene banners were a static strip of stiff figures above the same card dashboard. The showcase model still held a framed card in front of her, and the audience were tiny pasted-on figures.

## Round 3 — 5/8 won or tied (63%), 2 clearly worse — fail

| Pair | Kind       | Reference            | Outcome | Clearly worse | Criteria ours won                        |
| ---- | ---------- | -------------------- | ------- | ------------- | ---------------------------------------- |
| 1    | title      | Tiny Bookshop        | win     | no            | typography, readability, touch           |
| 2    | hub        | Thrifty Business     | loss    | yes           | typography, readability                  |
| 3    | hub        | Tiny Bookshop        | loss    | yes           | typography, touch                        |
| 4    | craft-step | A Little to the Left | loss    | no            | typography, feedback                     |
| 5    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability, touch |
| 6    | craft-step | Thrifty Business     | win     | no            | typography, feedback, readability, touch |
| 7    | results    | Tiny Bookshop        | win     | no            | typography, feedback, readability, touch |
| 8    | showcase   | Thrifty Business     | win     | no            | typography, feedback, readability, touch |

The score cleared 60%, but both hubs were still clearly worse, so the round failed. The critic still saw "a web dashboard with an illustrated banner": static, mannequin-posed figures in a row, and on the boutique a sign blocked by alert bubbles. The finishing step and the showcase now won on purpose and feedback.

## Round 4 — 5/8 won or tied (63%), 0 clearly worse — pass

| Pair | Kind       | Reference            | Outcome | Clearly worse | Criteria ours won                              |
| ---- | ---------- | -------------------- | ------- | ------------- | ---------------------------------------------- |
| 1    | title      | Tiny Bookshop        | win     | no            | typography, readability, touch                 |
| 2    | hub        | Thrifty Business     | loss    | no            | typography, readability, touch                 |
| 3    | hub        | Tiny Bookshop        | loss    | no            | readability, touch (typography tied)           |
| 4    | craft-step | A Little to the Left | loss    | no            | typography, feedback, readability              |
| 5    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability, touch       |
| 6    | craft-step | Thrifty Business     | win     | no            | typography, feedback, readability, touch       |
| 7    | results    | Tiny Bookshop        | win     | no            | typography, feedback, readability, touch       |
| 8    | showcase   | Thrifty Business     | win     | no            | typography, feedback, readability (touch tied) |

## What changed between rounds

### Round 1 to round 2

- **Hubs:**
  - Each hub gained an illustrated scene banner: the market stall with its awning, bunting, rail and shoppers, and the boutique shopfront with its sign.
  - The "your orders" empty state became a framed hint with an icon.
- **Results:**
  - The before and after became a big framed split, with light rays, sparkles and confetti on the "after" side and name tags on both pieces.
  - The 97 score moved into a round medallion with stars, the leaf score and the customer's thank-you quote.
  - The wishes became a row of tidy cards under the reward.
- **Craft steps:**
  - The step rail shows ticks for done steps and bigger labels for what is next.
  - The customer waits in a corner card with a speech bubble.
  - On the scrub step, a bucket, a soap bottle and a labelled scrub-speed meter with live praise frame the fabric.
  - On the finishing step, trims became bigger cards with clear icons and prices, and the rotate and size buttons gained words ("Left", "Right", "Smaller", "Bigger").
- **Showcase:** a curtained stage at the back of the hall, figures with faces in the audience, and a handwritten caption on the before/after story card.

### Round 2 to round 3

- **Title:** the screen was rebuilt as a lit market scene. Rosa's own stall sits in the middle with a striped awning, a sign, a rail of finds, folded stacks and a basket. A shopper, Rosa and a market dog stand around it. The save slots moved onto a wooden counter.
- **Hubs:**
  - The scene became the main panel, with the order board as a pinned card beside it.
  - Shoppers stand in natural poses, with alert bubbles over the ones who want something. A shared `ArmPose` gained "point" and "chat" poses for this.
  - Stall Day, rent and the next event became labelled chips.
- **Craft steps:**
  - The step rail became a slim row of numbered dots, so the work area gets more room.
  - The customer corner and the order checklist were joined into one card on the right.
  - The assist toggle moved up beside the instruction.
  - Each step got a clear next-step button at the bottom.
- **Finishing:** the piece sits on a bench in a framed room, and the placed trim glows.
- **Results:** a "Your score" heading, a "Kind to the planet" leaf line and reward chips for coins, reputation and buzz, plus one clear "Back to the stall" button.
- **Showcase:** a crowd of full avatars seated on tiered benches, waving and clapping, with a bold title banner.

### Round 3 to round 4

- **Hubs:**
  - The scenes gained depth and life: lantern strings, a clock, a rooftop skyline and passers-by in the background.
  - Each shopper's want now shows as a picture in a speech bubble (a bag, a mirror, a lamp), and nothing covers the shop sign any more.
  - A chalk sign, a fabric crate and a dress form fill the stall front.
  - Stall Day and rent read as "Next selling day" and "Stall rent" with icons, the End the day button is bigger, and a pill at the bottom points to the orders and stockroom below.
- **Craft steps:**
  - The snip step's stitch counters moved into the header row, so the fabric is bigger. Sewing tools sit beside the work, with a safety line under it.
  - The scrub step's speed meter moved beside the fabric, with a "0/3 stains done" line.
  - The finishing step shows the piece as a full cushion against a striped wall, with "Looking wonderful!" praise when it is done.
  - The checklist's colour bonus reads "Bonus: use Mustard or Ivory".
- **Results:** the "after" piece is larger, and there is more confetti.
- **Showcase:** the title banner became a framed sign, the model wears the finished piece against her body, the audience have more variety, and the music pips mark the finale and the bow.

## Final result

**Passed in round 4: 5/8 won or tied (63%), none clearly worse.**

Our screens won five pairs:

- the title
- the scrub step
- the finishing step
- results
- the showcase

## Remaining gap

- **Both hubs (still losses, no longer clearly worse).** The references are dense, hand-finished shops full of moving people and props. Ours is clear about what to do next, but the scene is still a static vector strip beside a text order board, and the critic called the boutique "a reskin of the same flat hub layout".
- **Snip step (still a loss).** The reference is one big, uncluttered tactile object with an obvious goal. Ours explains everything, but three columns of small text sit around it, and the busy floral fabric still hides the stitches the player must find.
- **Art is the one criterion we lose on every pair.** Every win comes from purpose, feedback and readability, not from looks. The showcase audience still reads as clones, and the model still looks like she is holding a flat card.
- **Next steps:** a calmer fabric behind the stitches, fewer side panels on the snip step, a hub scene with idle motion and more varied props, and a showcase model that truly wears the piece would close most of what is left.

## Pass of 2026-10-17 (gap round)

### Method

- **Blind A/B against real games.** Each round compared eight of our screens with official store screenshots of the titles in `work/0013-research/references.md`, section "2. Thrift-Flip Studio - upcycling secondhand clothes": Thrifty Business, Tiny Bookshop and A Little to the Left.
- **Random labels.** Each pair was shown as A and B, with the sides picked at random, so the critic did not know which screen was ours.
- **Fresh critic each round.** A new critic judged every round with no memory of earlier rounds. It scored art, typography, feedback, readability and touch, gave an outcome, and flagged any pair where ours was clearly worse.
- **The bar (raised for this pass):** at least 85% of pairs won or tied, and no pair clearly worse.
- **Our screenshots** came from `e2e/thrift-flip/qualityShots.spec.ts`. Round 1 used 1280 x 800. From round 2 the spec shoots at 1280 x 720, the same 16:9 shape as the store screenshots. The spec only runs when `QUALITY_SHOTS_DIR` is set.
- **What stays out of the repo:** reference screenshots belong to their owners. They were kept outside the repo, and nothing was traced or copied from them. Every change came from general craft: composition, hierarchy, colour, lighting, depth, texture, typography, feedback and spacing.

### Pairs

| Pair | Screen kind | Our screen                            | Reference title      |
| ---- | ----------- | ------------------------------------- | -------------------- |
| 1    | title       | Title                                 | Tiny Bookshop        |
| 2    | hub         | Saltmarsh Lane Market stall hub       | Thrifty Business     |
| 3    | hub         | Second Bloom shop hub (second career) | Thrifty Business     |
| 4    | craft-step  | Snip old stitches                     | A Little to the Left |
| 5    | craft-step  | Scrub the stains                      | A Little to the Left |
| 6    | craft-step  | Finishing touches                     | Thrifty Business     |
| 7    | results     | Results ("Brought back to life!")     | Thrifty Business     |
| 8    | showcase    | Bloom Again showcase hall             | Tiny Bookshop        |

### Round 1 — 5/8 won or tied (63%), 1 clearly worse — fail

| Pair | Kind       | Reference            | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | -------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bookshop        | win     | no            | typography, readability, touch                |
| 2    | hub        | Thrifty Business     | loss    | no            | typography, readability, touch                |
| 3    | hub        | Thrifty Business     | loss    | no            | typography, readability, touch                |
| 4    | craft-step | A Little to the Left | loss    | yes           | typography, feedback                          |
| 5    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability, touch      |
| 6    | craft-step | Thrifty Business     | win     | no            | typography, feedback, readability, touch      |
| 7    | results    | Thrifty Business     | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Tiny Bookshop        | win     | no            | typography, feedback, readability, touch      |

The critics' main points:

- Both hubs were clear, but their scenes were thin, with stiff, doll-like figures and a screen crowded with panels. The bottom row and the second order card were cut off.
- The snip step buried its mini-game under panels of text. The stitches looked like "red sausages in white bubbles", the big floral print fought the stitches, and the bottom button was cut off.
- The title, scrub, finishing, results and showcase screens won on purpose and clarity, but all except results lost art to the references.

### Round 2 — 5/8 won or tied (63%), 0 clearly worse — fail

| Pair | Kind       | Reference            | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | -------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bookshop        | win     | no            | typography, readability, touch                |
| 2    | hub        | Thrifty Business     | loss    | no            | typography, readability, touch                |
| 3    | hub        | Thrifty Business     | loss    | no            | typography, readability, touch                |
| 4    | craft-step | A Little to the Left | loss    | no            | typography, feedback, readability             |
| 5    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability, touch      |
| 6    | craft-step | Thrifty Business     | win     | no            | typography, feedback, readability, touch      |
| 7    | results    | Thrifty Business     | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Tiny Bookshop        | win     | no            | typography, feedback, readability, touch      |

The snip step was no longer clearly worse, but the critics counted 12 to 14 pieces of UI around the play area, called the fabric "a flat repeating tile" and found the stitch targets thin. The hubs were "very clear and well organized", but the scenes still looked sparse, with "stiff paper dolls". One critic noted that the showcase model held "a tiny paper card", so the piece being shown was barely visible.

### Round 3 — 5/8 won or tied (63%), 0 clearly worse — fail

| Pair | Kind       | Reference            | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | -------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bookshop        | win     | no            | typography, readability, touch                |
| 2    | hub        | Thrifty Business     | loss    | no            | typography, readability, touch                |
| 3    | hub        | Thrifty Business     | loss    | no            | typography, readability, touch                |
| 4    | craft-step | A Little to the Left | loss    | no            | typography, feedback, readability             |
| 5    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability, touch      |
| 6    | craft-step | Thrifty Business     | win     | no            | typography, feedback, readability, touch      |
| 7    | results    | Thrifty Business     | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Tiny Bookshop        | win     | no            | typography, feedback, readability, touch      |

One of three critics now preferred our snip step for its guidance and progress, but the other two still gave it to the reference: "sausage-like stitches", "stitch holes like random dots" and "a generic stick ripper". On the hubs, the order board took a quarter of the screen, so the market "reads as a menu over a backdrop, not a place".

### Round 4 — 6/8 won or tied (75%), 0 clearly worse — fail

| Pair | Kind       | Reference            | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | -------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bookshop        | win     | no            | typography, readability, touch                |
| 2    | hub        | Thrifty Business     | loss    | no            | typography, readability, touch                |
| 3    | hub        | Thrifty Business     | loss    | no            | typography, readability, touch                |
| 4    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability             |
| 5    | craft-step | A Little to the Left | win     | no            | art, typography, feedback, readability, touch |
| 6    | craft-step | Thrifty Business     | win     | no            | typography, feedback, readability, touch      |
| 7    | results    | Thrifty Business     | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Tiny Bookshop        | win     | no            | typography, feedback, readability, touch      |

The snip step won for the first time: the critics pointed to the step title, the step tracker, the per-line counters, the "6 of 24" bar and the ring on the active stitch. The scrub step won art as well. The hubs still lost on art: one critic said ours "tells an 8-year-old exactly what to do", but its figures were "flatter and stiff", and the second hub's four order cards crowded the top of the scene.

### Round 5 — 8/8 won or tied (100%), 0 clearly worse — pass

| Pair | Kind       | Reference            | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | -------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Tiny Bookshop        | win     | no            | typography, readability, touch                |
| 2    | hub        | Thrifty Business     | win     | no            | typography, readability, touch                |
| 3    | hub        | Thrifty Business     | win     | no            | typography, readability, touch                |
| 4    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability, touch      |
| 5    | craft-step | A Little to the Left | win     | no            | typography, feedback, readability, touch      |
| 6    | craft-step | Thrifty Business     | win     | no            | typography, feedback, readability, touch      |
| 7    | results    | Thrifty Business     | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Tiny Bookshop        | win     | no            | typography, feedback, readability, touch      |

Both hubs won for the first time in either pass. All three critics said the same thing: the reference room is lovelier, but its controls are icon-only and it gives no goal, while ours shows the day, the time left, request cards with large Accept buttons and one big "End the day". The snip step also won touch for the first time.

### What changed between rounds

#### Round 1 to round 2

- **Screenshot size:** the quality spec moved from 1280 x 800 to 1280 x 720, the same shape as the store screenshots.
- **Market hub:** the scene and the order board became one full-width picture. The board is a corkboard standing inside the market, the chalkboard holds the day, Stall Day, rent and the hours left together, and one bar at the bottom holds the market name, the shift and "End the day". The separate info strip under the scene was removed, so nothing is cut off at the bottom.
- **Second Bloom hub:** the storefront became a shop interior: shelves of folded stacks and jars, pendant lamps, a rail of remade pieces, a counter with a till, a dress form and a round rug.
- **Order notes:** each note shows the name and the piece, and opens for the full details. Only the first note starts open.
- **Craft steps:** the big customer and checklist panel on the right became a small client chip in the header ("Nana Bea, 4/7 on track") that opens the checklist, so the work area spans the full width.
- **Snip:** the instruction and the safe-pull distance moved into a note on the fabric, the counters moved onto the fabric, the stitches became thin thread loops instead of bubbles, and a drawn seam ripper reaches the active stitch.

#### Round 2 to round 3

- **Hubs:** the order notes became compact cards (name, piece, fee, due day, Accept), so every request shows at once. The chalkboard shows the hours left as a bar beside the day, with Stall Day under it. The market stall gained a patchwork backdrop, remade skirts on the rail, a tote and scarves, and a potted plant.
- **Snip:** the line tabs, the instruction and the assist toggle moved inside the bench frame, the stitch counters moved to the bottom corner, the safety line sits on the fabric, and the locked next button shows a padlock.

#### Round 3 to round 4

- **Hubs:** the request notes hang from the string lights on pegs, in soft colours, across the top of the scene. The chalkboard gained the place name and a yellow "Next selling day" line. The bottom bar became "Work a shift" with a coin chip next to a bigger "End the day", and "Orders & stockroom" became its own button. More neighbouring stalls fill the market, and shoppers carry bags. The settings button gained its word.
- **Snip:** the fabric became a cut piece with pinked edges lying on a wooden bench. The seam now opens as a gap with loose thread ends where stitches have come out, and the stitches are smaller. "6 of 24 stitches out" became a line with a progress bar.

#### Round 4 to round 5

- **Hubs:** the requests moved back to a corkboard on an easel, titled "Requests" with a count, with coloured pinned notes, so the top of the scene is open again. Second Bloom gained bunting, a hanging plant and a cat asleep on the rug. "Orders & stockroom" became a round pill.
- **Snip:** the progress line moved into the footer beside the next button, the safety note became a small dark chip on the fabric, and the header chips read "Day 1" and "9 h left".

#### Other screens across the pass

- **Title:** the skyline gained houses with windows, neighbour stalls stand either side of Rosa's, and a shopper carries a bag. The saves hang on a rail. Slot 1 shows coins and reputation on their own lines with a quiet "Start over", and empty slots read "Empty" with a clear "Start here".
- **Scrub:** the stain tabs became simple "Stain 1, 2, 3" pills. The fabric sits in the centre with a bigger bucket beside it, and the instruction, the speed meter, a "0 of 3 stains clean" bar and the safety line stack in one column.
- **Finishing:** the open wish is highlighted in the checklist ("Add 1 more Covered Button"), the lines read "Spent 19 of 31 coins" and "Well made: 96 (needs 68)", the trims sit on coloured discs, the Left, Right, Smaller and Bigger buttons gained icons, and the footer says "A wish is still open. Check the list, or take a final look."
- **Results:** the whole screen fits without scrolling. The score sits beside its stars, the leaf score reads "70/100", the rewards became labelled tiles, "Back to the stall" spans the card, and the wishes became icon chips with the details behind "How you earned it". The "after" label says "Remade from the garden tea dress".
- **Showcase:** a spotlight falls on the runway, the model carries the bows in her hand instead of wearing a card on her chest, and the story card reads "The garden tea dress it came from".
- **Code:** new art pieces each in their own file (boutique room, garment rail, scrap bundle, shop cat, shop counter, stall dressing, tote bag), plus the client chip, scrub cloth, pose buttons, criterion icons, bench cloth, ripper tool, stitch mark, offer details and order board. The old chalk sign and sewing tools were removed. The shared avatar in `src/ui/art/avatar` gained "clasp", "carry", "carry-right" and "browse" arm poses, a hand position helper and a head tilt. The checklist labels in the core became plain words ("Spent 19 of 31 coins", "Add 1 more Covered Button").

### Final result

**Passed in round 5: 8/8 won or tied (100%), nothing clearly worse.**

| Round | Won or tied | Clearly worse | Pass |
| ----- | ----------- | ------------- | ---- |
| 1     | 5/8 (63%)   | 1             | no   |
| 2     | 5/8 (63%)   | 0             | no   |
| 3     | 5/8 (63%)   | 0             | no   |
| 4     | 6/8 (75%)   | 0             | no   |
| 5     | 8/8 (100%)  | 0             | yes  |

The title, the scrub step, the finishing step, the results screen and the showcase won all five rounds. The snip step went from clearly worse to a win, and both hubs won for the first time.

### Remaining gap

- **Art still goes to the references on seven of eight pairs.** Only the results screen won art in round 5. Every other win came from purpose, feedback, readability and touch. The critics still describe our figures as stiff and our scenes as flatter than the references' painted light or dense pixel rooms.
- **Hubs win on clarity, not on life.** The critics called the reference shop "lovelier and busier". Ours now has more props, a cat and varied poses, but the next step is idle motion and more expressive people.
- **Showcase piece.** The critics said the bows being shown are "tiny and held at the model's hip", and that the audience still looks copy-pasted. A larger piece in the spotlight and a more varied crowd would close this.
- **Snip art.** The reference still wins art on the snip step, for its textured, tactile objects. A texture pass on the fabric and the tool would help.
