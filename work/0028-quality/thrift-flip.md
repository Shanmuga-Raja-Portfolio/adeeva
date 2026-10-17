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
