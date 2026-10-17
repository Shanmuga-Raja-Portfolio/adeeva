# Task 0028 — ADEEVA Phase C quality pass

## Method

- **Blind A/B against real games.** Each round compared eight of our screens with official store screenshots of the titles in `work/0013-research/references.md`, section "1. ADEEVA - fashion design career + runway shows": Tailor Simulator, Historical Fashion Dress Up and Candy's Closet.
- **Random labels.** Each pair was shown as A and B, with the sides picked at random, so the critic did not know which screen was ours.
- **Fresh critic each round.** A new critic judged every round with no memory of earlier rounds. It scored art, typography, feedback, readability and touch, gave an outcome, and flagged any pair where ours was clearly worse.
- **The bar:** at least 60% of pairs won or tied, and no pair clearly worse.
- **Our screenshots** came from `e2e/adeeva/qualityShots.spec.ts` at 1280 x 800. That spec only runs when `QUALITY_SHOTS_DIR` is set.
- **What stays out of the repo:** reference screenshots belong to their owners. They were kept outside the repo, and nothing was traced or copied from them. Every change came from general craft: composition, hierarchy, colour, lighting, depth, texture, typography, feedback and spacing.

## Pairs

| Pair | Screen kind | Our screen    | Reference title             |
| ---- | ----------- | ------------- | --------------------------- |
| 1    | title       | Title         | Historical Fashion Dress Up |
| 2    | hub         | Bedroom hub   | Tailor Simulator            |
| 3    | hub         | Label hub     | Tailor Simulator            |
| 4    | craft-step  | Sketch        | Historical Fashion Dress Up |
| 5    | craft-step  | Cutting table | Historical Fashion Dress Up |
| 6    | craft-step  | Sewing        | Historical Fashion Dress Up |
| 7    | results     | Results       | Candy's Closet              |
| 8    | showcase    | Runway show   | Tailor Simulator            |

## Round 1 — 4/8 won or tied (50%), 3 clearly worse — fail

| Pair | Kind       | Reference                   | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Historical Fashion Dress Up | loss    | yes           | typography, readability                       |
| 2    | hub        | Tailor Simulator            | win     | no            | typography, feedback, readability, touch      |
| 3    | hub        | Tailor Simulator            | win     | no            | typography, readability, touch                |
| 4    | craft-step | Historical Fashion Dress Up | loss    | yes           | typography, readability                       |
| 5    | craft-step | Historical Fashion Dress Up | loss    | no            | typography, feedback, readability             |
| 6    | craft-step | Historical Fashion Dress Up | loss    | yes           | none                                          |
| 7    | results    | Candy's Closet              | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Tailor Simulator            | win     | no            | typography, feedback, readability, touch      |

The critic's main points:

- The title backdrop was washed out under a heavy white veil.
- The sketch thumbnails were nearly identical, and the preview figure was flat.
- The sewing screen was a heavy pink panel with a bare needle diagram, an unreadable Restart button and six "Not started" rows that read like a to-do list.

## Round 2 — 3/8 won or tied (38%), 2 clearly worse — fail

| Pair | Kind       | Reference                   | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Historical Fashion Dress Up | loss    | no            | typography, readability, touch                |
| 2    | hub        | Tailor Simulator            | win     | no            | typography, feedback, readability, touch      |
| 3    | hub        | Tailor Simulator            | loss    | no            | typography, readability, touch                |
| 4    | craft-step | Historical Fashion Dress Up | loss    | yes           | typography                                    |
| 5    | craft-step | Historical Fashion Dress Up | loss    | no            | typography, feedback                          |
| 6    | craft-step | Historical Fashion Dress Up | loss    | yes           | feedback                                      |
| 7    | results    | Candy's Closet              | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Tailor Simulator            | win     | no            | typography, feedback, readability, touch      |

The title was no longer clearly worse, but it still sat under a white haze. The critic still saw the sketch board as a text-heavy form with a stiff doll. It still saw the sewing machine as a crude grey diagram on empty beige, with two competing percentages. The label hub lost on appeal this time: the same flat dashboard with a tiny, stiff avatar.

## Round 3 — 4/8 won or tied (50%), 0 clearly worse — fail

| Pair | Kind       | Reference                   | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Historical Fashion Dress Up | loss    | no            | typography, readability, touch                |
| 2    | hub        | Tailor Simulator            | win     | no            | typography, feedback, readability, touch      |
| 3    | hub        | Tailor Simulator            | win     | no            | typography, feedback, readability, touch      |
| 4    | craft-step | Historical Fashion Dress Up | loss    | no            | typography, readability                       |
| 5    | craft-step | Historical Fashion Dress Up | loss    | no            | typography, feedback, readability             |
| 6    | craft-step | Historical Fashion Dress Up | loss    | no            | feedback, readability (typography tied)       |
| 7    | results    | Candy's Closet              | win     | no            | art, typography, feedback, readability, touch |
| 8    | showcase   | Tailor Simulator            | win     | no            | typography, feedback, readability, touch      |

No screen was clearly worse any more, but the three craft steps still lost on art and touch. The critic called the sketch board "a dense spreadsheet of small cards", said the machine art was flat, and said the busy floral fabric clashed with it.

## Round 4 — 6/8 won or tied (75%), 0 clearly worse — pass

| Pair | Kind       | Reference                   | Outcome | Clearly worse | Criteria ours won                              |
| ---- | ---------- | --------------------------- | ------- | ------------- | ---------------------------------------------- |
| 1    | title      | Historical Fashion Dress Up | loss    | no            | typography (feedback tied)                     |
| 2    | hub        | Tailor Simulator            | win     | no            | typography, feedback, readability, touch       |
| 3    | hub        | Tailor Simulator            | win     | no            | typography, readability, touch                 |
| 4    | craft-step | Historical Fashion Dress Up | loss    | no            | typography, readability, touch (feedback tied) |
| 5    | craft-step | Historical Fashion Dress Up | win     | no            | typography, feedback, readability, touch       |
| 6    | craft-step | Historical Fashion Dress Up | win     | no            | typography, feedback, readability, touch       |
| 7    | results    | Candy's Closet              | win     | no            | art, typography, feedback, readability, touch  |
| 8    | showcase   | Tailor Simulator            | win     | no            | typography, feedback, readability, touch       |

## What changed between rounds

### Round 1 to round 2

- **Title:**
  - The heavy white veil is gone, so the atelier shows through with curtains, windows, a thread wall and dress forms.
  - The save slots became framed cards.
  - Settings became a real button with an icon.
- **Sewing:**
  - The seam list shows "Sewing now" on the active seam, and the other seams show a plain marker instead of six "Not started" labels.
  - The Restart button is readable.
  - A labelled "Seam progress" bar sits under the fabric.
- **Sketch board:**
  - Options are grouped into labelled rows for bodice, neckline, sleeves and skirt.
  - The preview figure stands on a lit floor disc inside a framed card.
- **Shared and runway:** avatar face and icon touch-ups, a runway walker and show caption polish, and the music chip.

### Round 2 to round 3

- **Title:**
  - The screen was rebuilt as a lit studio scene with the designer standing beside a dress form.
  - The menu moved into one framed panel on the right, with Continue, New Game, Settings and the save slots grouped together.
  - A shared `ArmPose` gives the avatar a natural pose instead of straight arms.
- **Sketch board:**
  - The cards became wider, with the garment picture next to its name and style words.
  - The preview figure stands in a striped fitting room, and its pose is relaxed.
  - The client brief moved into a chip strip across the top.
- **Sewing:**
  - A full illustrated sewing machine replaced the bare needle diagram: a mint body, a hand wheel, a dial, a thread spool and a pin cushion.
  - There is now one feedback number, "Neat stitches" with a short phrase, beside a slow-to-fast speed gauge, instead of two competing percentages.
  - Upcoming seams are numbered.
- **Hub:** gig cards and the theme colours were tidied up.

### Round 3 to round 4

- **Sewing:**
  - The machine sits inside a framed wooden work surface.
  - The fabric pattern is softer, so it no longer fights the machine art.
  - The client brief is a chip strip across the top, which frees the full width for the machine.
  - The progress line reads "How much of the seam is sewn".
- **Sketch board:**
  - The thumbnails show each part on its own on a dress form, instead of repeating near-identical full dresses.
  - The brief chips only list what is still to do.
  - Card text is bigger.
- **Title:** folded fabric stacks replaced the thread jars, the designer gestures toward the dress, and empty save slots read "An empty rail".
- **Hub:** a garment rack and a pinboard fill the bedroom hero.
- **Results:** the results stage was refreshed.
- **Dress forms:** a new `FormGown` gives the gowns on the title, hub and runway dress forms a proper skirt, sash and trim.
- **Cutting:** the cutting table art and layout were updated.
- **Runway:** the stage, audience and caption art were updated.

## Final result

**Passed in round 4: 6/8 won or tied (75%), none clearly worse.**

Our screens won six pairs:

- both hubs
- cutting
- sewing
- results
- the runway show

## Remaining gap

- **Title (still a loss).** The reference uses painterly, hand-finished character portraits in framed cards. Our flat vector figure is clean, but it is stiffer and less rich.
- **Sketch (still a loss).** The reference puts one large, detailed gown in a furnished room, so the dress itself feels like the reward. Ours is clearer about goals, but it is still a grid of fairly similar pink cards beside a simpler avatar.
- **Art is the one criterion we still lose almost everywhere.** We win it only on the results screen. The hubs win on purpose and clarity, not on looks.
- **Next steps:** a richer, more expressive avatar (pose, fabric shading, hair) and a more furnished fitting room on the sketch step would close most of what is left.
