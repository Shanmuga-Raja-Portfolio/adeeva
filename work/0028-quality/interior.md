# Task 0032 — Interior Studio Phase C quality pass

## Method

- **Blind A/B against real games.** Each round compared eight of our screens with official store screenshots of the titles in `work/0013-research/references.md`, section "6. Interior Studio - room makeovers and show homes": Unpacking, House Flipper 2 and Mini Cozy Room: Lo-Fi.
- **Random labels.** Each pair was shown as A and B, with the sides picked at random, so the critic did not know which screen was ours.
- **Fresh critic each round.** A new critic judged every round with no memory of earlier rounds. It scored art, typography, feedback, readability and touch, gave an outcome, and flagged any pair where ours was clearly worse.
- **The bar:** at least 60% of pairs won or tied, and no pair clearly worse.
- **Our screenshots** came from `e2e/interior/qualityShots.spec.ts` at 1280 x 800. That spec only runs when `QUALITY_SHOTS_DIR` is set.
- **What stays out of the repo:** reference screenshots belong to their owners. They were kept outside the repo, and nothing was traced or copied from them. Every change came from general craft: composition, hierarchy, colour, lighting, depth, texture, typography, feedback and spacing.

## Pairs

| Pair | Screen kind | Our screen                       | Reference title       |
| ---- | ----------- | -------------------------------- | --------------------- |
| 1    | title       | Title                            | Mini Cozy Room: Lo-Fi |
| 2    | hub         | Loft hub                         | Mini Cozy Room: Lo-Fi |
| 3    | hub         | Larkspur Close (second career)   | Unpacking             |
| 4    | craft-step  | Paint the walls                  | House Flipper 2       |
| 5    | craft-step  | Lay the floor                    | Unpacking             |
| 6    | craft-step  | Style the room                   | Mini Cozy Room: Lo-Fi |
| 7    | results     | Results ("Nana Pearl loves it!") | Unpacking             |
| 8    | showcase    | Open House showcase              | House Flipper 2       |

## Round 1 — 3/8 won or tied (38%), 4 clearly worse — fail

| Pair | Kind       | Reference             | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Mini Cozy Room: Lo-Fi | win     | no            | typography, readability, touch                |
| 2    | hub        | Mini Cozy Room: Lo-Fi | win     | no            | art, typography, feedback, readability, touch |
| 3    | hub        | Unpacking             | loss    | no            | typography, readability (touch tied)          |
| 4    | craft-step | House Flipper 2       | loss    | yes           | typography, readability, touch                |
| 5    | craft-step | Unpacking             | loss    | yes           | readability (typography tied)                 |
| 6    | craft-step | Mini Cozy Room: Lo-Fi | loss    | yes           | none (readability tied)                       |
| 7    | results    | Unpacking             | win     | no            | typography, readability, touch                |
| 8    | showcase   | House Flipper 2       | loss    | yes           | typography, readability, touch                |

The critic's main points:

- The paint step turned painting into flat orange rectangles and progress bars, with two big mustard tape slabs and a crude roller on a small wall.
- The floor step was a grey tray with four identical orange squares and a vague "Press" button: no texture, no wood grain and no room around it.
- The style step's room was sparse, the decor box held a single wall clock, and the swatches and brief took more space than the room.
- The second-career hub was over half empty cream space or a striped placeholder.
- The showcase room was flat and sparse, five stiff visitors were clumped in one spot, a speech bubble covered the sofa, and the previous panel bled in from the left.

## Round 2 — 4/8 won or tied (50%), 2 clearly worse — fail

| Pair | Kind       | Reference             | Outcome | Clearly worse | Criteria ours won                             |
| ---- | ---------- | --------------------- | ------- | ------------- | --------------------------------------------- |
| 1    | title      | Mini Cozy Room: Lo-Fi | win     | no            | typography, feedback, readability, touch      |
| 2    | hub        | Mini Cozy Room: Lo-Fi | win     | no            | art, typography, feedback, readability, touch |
| 3    | hub        | Unpacking             | loss    | no            | typography, feedback, readability, touch      |
| 4    | craft-step | House Flipper 2       | win     | no            | typography, readability, touch                |
| 5    | craft-step | Unpacking             | loss    | no            | typography, feedback, readability, touch      |
| 6    | craft-step | Mini Cozy Room: Lo-Fi | loss    | yes           | none (readability tied)                       |
| 7    | results    | Unpacking             | win     | no            | typography, readability, touch                |
| 8    | showcase   | House Flipper 2       | loss    | yes           | typography, feedback, readability, touch      |

The paint step now won: clear meters, a next-step list and a coaching tip, though its art was still called flat. The floor step was no longer clearly worse, but the critic saw "beige cork squares on beige". The style step and the showcase were still clearly worse: a sparse room with an oversized plant and glow blobs, and an open-house room that was nearly empty, with overexposed lights.

## Round 3 — 6/8 won or tied (75%), 0 clearly worse — pass

| Pair | Kind       | Reference             | Outcome | Clearly worse | Criteria ours won                              |
| ---- | ---------- | --------------------- | ------- | ------------- | ---------------------------------------------- |
| 1    | title      | Mini Cozy Room: Lo-Fi | win     | no            | typography, readability, touch                 |
| 2    | hub        | Mini Cozy Room: Lo-Fi | win     | no            | art, typography, feedback, readability, touch  |
| 3    | hub        | Unpacking             | win     | no            | typography, feedback, readability, touch       |
| 4    | craft-step | House Flipper 2       | win     | no            | typography, readability, touch                 |
| 5    | craft-step | Unpacking             | win     | no            | typography, feedback, readability, touch       |
| 6    | craft-step | Mini Cozy Room: Lo-Fi | loss    | no            | typography, readability                        |
| 7    | results    | Unpacking             | win     | no            | typography, feedback, readability, touch       |
| 8    | showcase   | House Flipper 2       | loss    | no            | typography, feedback, readability (touch tied) |

## What changed between rounds

### Round 1 to round 2

- **Rooms everywhere:** a shared cutaway shell gives every room a thick front wall edge, so rooms read as solid boxes rather than flat diagrams. Windows gained curtains on a rail, and lamps gained a proper head shape.
- **Paint step:**
  - The two tape slabs were replaced by one big room view with the back wall, skirting and a dust sheet on the floor.
  - The roller became a real tool with a textured sleeve and a paint tray, and wet paint drips down from the edge of the fresh coat.
  - Splats and dry streaks became chips, and the step list gained a "To unlock Lay the floor" heading with a lock.
- **Floor step:**
  - The grey tray became a room floor with a hammer, a stack of spare pieces and a gold door strip.
  - Pieces gained a cork texture and sparkle when they land, and "Thunk! Next piece." became a proper toast.
  - The picker became "Pick the next piece" cards and the button became "Press it down".
- **Style step:** the decor box shows every piece with a "Placed" badge, the fabric swatches explain what they colour, and the selected-piece buttons sit together on one bar.
- **Second-career hub:** the empty room shows a bare cutaway with moving boxes and a paint tin under an "Empty and waiting" tag instead of a striped placeholder. The finished room has a "Ready for the Open House" bar, and a street card shows the house and the family it is for.
- **Title:** brighter room cards with more props, the save line as a chip on the Continue button, and Settings as a real button.
- **Results:** a light-ray burst and confetti behind the revealed room.
- **Showcase:** visitors spread out across the room in natural poses, waving and pointing, with hearts and sparkles over their heads. The speech bubble moved to the top so it covers nothing, and the previous panel no longer bleeds in.

### Round 2 to round 3

- **Room dressing:** every cutaway gained a door, wainscot panels, a radiator, plug sockets and wall-washing light blooms, so rooms feel lived in rather than staged.
- **Lighting:** lamp glows became soft blooms instead of bright blobs.
- **Paint step:** a hand now holds the roller, and a "Watch the wall" legend shows bare plaster, one streaky coat and two smooth coats.
- **Floor step:** each piece card shows its size (20 x 30, 40 x 30, 30 x 30), the door strip is labelled "Door strip · the way in", and the locked Press button says what to do first.
- **Style step:** the swatches are labelled with their colour names, and Turn, Smaller, Bigger and To front became icon buttons.
- **Title:** the save slots moved into a side panel beside the title card, so the save shows on screen without scrolling.
- **Hubs:**
  - The loft hub's paint pots sit in a "Today's paint pots" box that says how many hours are left, and Reputation and Buzz are named in the top bar.
  - Larkspur Close lost the duplicate purse counter, the purse card gained a coin badge, and the street card became a calm two-part card with the brief beside a full row of houses.
- **Results:** the score sits in a glowing badge with rays, and the long checklist folded into one "Client checklist · 7 of 7 met" line.
- **Showcase:** party bunting, balloons, a treats table and a "Welcome home" easel fill the room, and the room title moved into one banner under the scene.

## Final result

**Passed in round 3: 6/8 won or tied (75%), none clearly worse.**

Our screens won six pairs:

- the title
- both hubs
- the paint step
- the floor step
- results

## Remaining gap

- **Style step (still a loss, no longer clearly worse).** The reference has a lively world behind a chunky item grid with price and owned badges. Ours is clean and readable, but the room itself is still sparse for a "make it feel like them" step, and two floor lamps still overlap.
- **Showcase (still a loss, no longer clearly worse).** The reference is a lush, warmly lit room full of plants, books and textiles. Ours now tells a story with visitors, hearts and party props, but the room under them is still thin and the figures are stiff.
- **Art is the one criterion we lose on almost every pair.** Every win comes from purpose, feedback and readability, not from looks. The critic still called the paint step "a flat diagram of a box room" and the floor art plain.
- **Floor step layout.** At 1280 x 800 the side column is tall enough that the step list scrolls below the fold.
- **Next steps:** denser props and textiles in styled rooms, a decor catalogue with more pieces to browse, more natural poses for visitors, and a shorter floor-step side column would close most of what is left.

## Gap round — 2026-10-17

### Method

- **Same blind A/B as before, with a higher bar.** Each round compared eight of our screens with official store screenshots of the titles in `work/0013-research/references.md`, section "6. Interior Studio - room makeovers and show homes": Unpacking, House Flipper 2 and Mini Cozy Room: Lo-Fi. The eight screen kinds are the same as in the first pass, but some pairs were matched with a different reference title (see the table below).
- **Random labels.** Each pair was shown as A and B, with the sides picked at random.
- **Fresh critics each round.** A new panel of three critics judged every round with no memory of earlier rounds. They scored art, typography, feedback, readability and touch, gave an outcome, and flagged any pair where ours was clearly worse.
- **The bar was raised:** at least 85% of pairs won or tied, and no pair clearly worse.
- **Our screenshots** came from `e2e/interior/qualityShots.spec.ts`. Round 1 used 1280 x 800. Round 2 used 1280 x 720, the same shape as the store screenshots.
- **What stays out of the repo:** the reference screenshots belong to their owners. They were kept outside the repo, and nothing was traced, copied or imitated. Every change came from general craft: composition, hierarchy, colour, lighting, depth, texture, typography, feedback and spacing.

| Pair | Screen kind | Our screen                     | Reference title       |
| ---- | ----------- | ------------------------------ | --------------------- |
| 1    | title       | Title                          | House Flipper 2       |
| 2    | hub         | Loft hub                       | Mini Cozy Room: Lo-Fi |
| 3    | hub         | Larkspur Close (second career) | Mini Cozy Room: Lo-Fi |
| 4    | craft-step  | Paint the walls                | House Flipper 2       |
| 5    | craft-step  | Lay the floor                  | Unpacking             |
| 6    | craft-step  | Style the room                 | Mini Cozy Room: Lo-Fi |
| 7    | results     | Results                        | House Flipper 2       |
| 8    | showcase    | Open House showcase            | Unpacking             |

### Round 1 — 6/8 won or tied (75%), 0 clearly worse — fail

| Pair | Kind       | Reference             | Outcome | Clearly worse | Criteria ours won                                 |
| ---- | ---------- | --------------------- | ------- | ------------- | ------------------------------------------------- |
| 1    | title      | House Flipper 2       | win     | no            | typography, feedback, readability, touch          |
| 2    | hub        | Mini Cozy Room: Lo-Fi | win     | no            | art, typography, feedback, readability, touch     |
| 3    | hub        | Mini Cozy Room: Lo-Fi | win     | no            | typography, feedback, readability (touch tied)    |
| 4    | craft-step | House Flipper 2       | win     | no            | typography, feedback, readability, touch          |
| 5    | craft-step | Unpacking             | loss    | no            | typography, feedback, readability, touch          |
| 6    | craft-step | Mini Cozy Room: Lo-Fi | win     | no            | typography, readability (feedback and touch tied) |
| 7    | results    | House Flipper 2       | win     | no            | typography, feedback, readability, touch          |
| 8    | showcase   | Unpacking             | loss    | no            | typography, readability (touch tied)              |

Nothing was clearly worse, but two pairs lost:

- **Floor step.** The critics said the play area was "a mostly empty grey slab with a few cork tiles". There was a lot of dead space under the floor, and the main button was greyed out. Two of the three critics picked the reference for its craft, even though ours explained the task better.
- **Showcase.** The critics called the visitors "stiff, mannequin-like" and the room under-furnished. They also disliked the harsh black bar across the top. The reference won feedback because its stars, hearts and exclamation stickers make the moment feel like a celebration.

The style step won narrowly. The critics liked its stepper, coach bubble and brief, but said its decor box offered only three items and that the swatches and toolbar were cut off at the bottom.

### Round 2 — 8/8 won or tied (100%), 0 clearly worse — pass

| Pair | Kind       | Reference             | Outcome | Clearly worse | Criteria ours won                              |
| ---- | ---------- | --------------------- | ------- | ------------- | ---------------------------------------------- |
| 1    | title      | House Flipper 2       | win     | no            | typography, feedback, readability, touch       |
| 2    | hub        | Mini Cozy Room: Lo-Fi | win     | no            | art, typography, feedback, readability, touch  |
| 3    | hub        | Mini Cozy Room: Lo-Fi | win     | no            | typography, feedback, readability, touch       |
| 4    | craft-step | House Flipper 2       | win     | no            | typography, readability, touch                 |
| 5    | craft-step | Unpacking             | win     | no            | typography, feedback, readability, touch       |
| 6    | craft-step | Mini Cozy Room: Lo-Fi | win     | no            | typography, feedback, readability, touch       |
| 7    | results    | House Flipper 2       | win     | no            | typography, feedback, readability, touch       |
| 8    | showcase   | Unpacking             | win     | no            | typography, readability, touch (feedback tied) |

All the pairs that were weak in round 1 now won:

- **Floor step.** All three critics now picked ours. They pointed to the glowing drop spot, the piece picker, the "Thunk! Next piece." toast, the sparkles and the big "Press it down" button.
- **Style step.** It won every criterion except art. The critics named the "Drag onto a glowing spot" prompt, the dashed target rings, the Placed and Must-have badges, the Turn, Smaller and Bigger buttons and the fabric palette.
- **Showcase.** It won on story. Visitors react with heart and exclamation bubbles, and the room has bunting and balloons. The "Room 2 of 2 · The grand finale" caption, the progress pips and the Skip button make the moment easy to follow.

### What changed between rounds

- **Screenshots** moved to 1280 x 720, the same shape as the store screenshots.
- **Makeover layout:** the stage rail and the coach bubble now share one row, so the room and its controls sit higher and nothing is cut off at the bottom. The "To unlock" list became a row of short chips.
- **Floor step:**
  - The flat grey board became a furnished room seen from above: a window with curtains, a bookcase, a picture, an armchair under a dust sheet, a tape measure and an open box of spare pieces.
  - The next spot glows, and a burst plays when a piece lands.
  - The piece cards sit in one "Next piece" row. The Press button is a dashed outline until a piece is on its spot, so it no longer looks greyed out and broken.
  - The hint moved under the floor as one short line.
- **Style step:**
  - The decor box became a full shelf of pieces, each with its price. It shows Placed and Must-have badges and says "Drag onto a glowing spot".
  - Dashed rings on the walls and floor show where each piece can go.
  - The brief folded into a short card above the shelf that lists only what is still to do. When everything is met, it says "Everything on the brief is on track!"
  - The fabric swatches became one row, with the chosen colour named.
  - Finished rooms gained a woven rug, cushions and new sofa art. Two floor lamps that stand side by side now face away from each other instead of overlapping.
- **Showcase:**
  - The visitors were redrawn as one shared townsfolk figure (`src/ui/art/avatar/Townsfolk.tsx`), with relaxed poses such as cheering, holding a mug, taking a photo and pointing.
  - Big hand-drawn heart and exclamation bubbles pop over their heads.
  - Fairy lights and a large rug fill the room. The street behind is no longer blurred.
  - The harsh black top bar became a soft tint, with clearer progress pips and softer music and Skip chips.
- **Results:** the finished room is staged with the same rug and cushions. The confetti has more pieces, in strips, rounds, stars and ribbons.
- **Paint step:** the arm holding the roller has a rolled-up sleeve and shading, and the wet drips are smaller and softer.
- **Hubs and title:**
  - The loft hub's beams and mood-board pins have more depth, and the shift button says "earn" with a coin icon.
  - Larkspur Close has bolder step chips and a clearer top-up button that says how many of your coins it adds to the purse.
  - The title's empty save slot is shorter and has a sparkle Start here button, and the title backdrop is warmer.

### Final result

**Passed in round 2: 8/8 won or tied (100%), none clearly worse.**

Our screens won all eight pairs:

- the title
- both hubs
- the paint step
- the floor step
- the style step
- results
- the Open House showcase

### Remaining gap

- **Art is still the criterion we lose most.** In round 2 we won art only on the loft hub. Every other win came from clarity, feedback, readability and touch. The critics still called the reference art "far more charming and better crafted".
- **Paint step.** The critics said the painted wall is flat and "reads like striped wallpaper", while the reference's paint strokes look wet and tactile.
- **Floor step.** One critic found too many instructions at once: the coach tip, the toast, the locked-button reason, the door-strip line and the Floor magnet hint. The hammer floats, and the cork texture is still plain.
- **Second-career hub.** The critics called it busy and said it reads like a text-heavy web dashboard next to the reference's charming dioramas.
- **Next steps:** give fresh paint a wet sheen and roller texture, show one floor instruction at a time, and give the Larkspur Close room cards more of the diorama feel that the loft hub already has.
