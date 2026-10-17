# Task 0034 — Workshop & Wood Phase C quality pass

## Pass of 2026-10-17

### Method

- **Blind A/B against real games.** Each round compared eight of our screens with official store screenshots of the titles in `work/0013-research/references.md`, section "4. Workshop & Wood - furniture making": Little Big Workshop, Master Of Pottery and The Lilliput Workshop.
- **Random labels.** Each pair was shown as A and B, with the sides picked at random, so the critic did not know which screen was ours.
- **Fresh critic each round.** A new critic judged every round with no memory of earlier rounds. It scored art, typography, feedback, readability and touch, gave an outcome, and flagged any pair where ours was clearly worse.
- **The bar:** at least 85% of pairs won or tied, and no pair clearly worse.
- **Our screenshots** came from `e2e/workshop/qualityShots.spec.ts` at 1280 x 800. That spec only runs when `QUALITY_SHOTS_DIR` is set.
- **What stays out of the repo:** reference screenshots belong to their owners. They were kept outside the repo, and nothing was traced or copied from them. Every change came from general craft: composition, hierarchy, colour, lighting, depth, texture, typography, feedback and spacing.

### Pairs

| Pair | Screen kind | Our screen                   | Reference title       |
| ---- | ----------- | ---------------------------- | --------------------- |
| 1    | title       | Title                        | Little Big Workshop   |
| 2    | hub         | Garage workshop hub          | Little Big Workshop   |
| 3    | hub         | Showroom hub (second career) | Master Of Pottery     |
| 4    | craft-step  | Saw the parts                | Little Big Workshop   |
| 5    | craft-step  | Sand the board               | Master Of Pottery     |
| 6    | craft-step  | Finish: paint and extras     | The Lilliput Workshop |
| 7    | results     | Results                      | Master Of Pottery     |
| 8    | showcase    | Craft fair booth reveal      | Master Of Pottery     |

### Round 1 — 3/8 won or tied (38%), 0 clearly worse — fail

| Pair | Kind       | Reference             | Outcome | Clearly worse | Criteria ours won                        |
| ---- | ---------- | --------------------- | ------- | ------------- | ---------------------------------------- |
| 1    | title      | Little Big Workshop   | win     | no            | typography, readability, touch           |
| 2    | hub        | Little Big Workshop   | loss    | no            | typography, readability, touch           |
| 3    | hub        | Master Of Pottery     | loss    | no            | readability (typography tied)            |
| 4    | craft-step | Little Big Workshop   | win     | no            | typography, readability, touch           |
| 5    | craft-step | Master Of Pottery     | loss    | no            | typography, readability (touch tied)     |
| 6    | craft-step | The Lilliput Workshop | loss    | no            | typography, readability, touch           |
| 7    | results    | Master Of Pottery     | win     | no            | typography, feedback, readability, touch |
| 8    | showcase   | Master Of Pottery     | loss    | no            | typography, feedback, readability, touch |

The critic's main points:

- The garage hub read like a dashboard: clear and legible, but the scene was static and the important panels fell below the fold.
- The showroom hub repeated the hub template, with one stiffly posed pair of characters, a large text card on top and the floor sets below the fold.
- The sanding board was a flat tiled rectangle and the sander was a red block.
- The finish step's bench was a flat green sticker shape, the decals floated at odd scale and the extras grid was cut off.
- At the fair, the showcased furniture was small and pushed to the edges of an empty dirt stage, so the work itself did not feel celebrated.

### Round 2 — 8/8 won or tied (100%), 0 clearly worse — pass

| Pair | Kind       | Reference             | Outcome | Clearly worse | Criteria ours won                              |
| ---- | ---------- | --------------------- | ------- | ------------- | ---------------------------------------------- |
| 1    | title      | Little Big Workshop   | win     | no            | typography, feedback, readability, touch       |
| 2    | hub        | Little Big Workshop   | win     | no            | typography, readability, touch                 |
| 3    | hub        | Master Of Pottery     | win     | no            | typography, readability, touch                 |
| 4    | craft-step | Little Big Workshop   | win     | no            | art, typography, feedback, readability, touch  |
| 5    | craft-step | Master Of Pottery     | win     | no            | typography, feedback, readability (touch tied) |
| 6    | craft-step | The Lilliput Workshop | win     | no            | typography, readability, touch                 |
| 7    | results    | Master Of Pottery     | win     | no            | typography, feedback, readability, touch       |
| 8    | showcase   | Master Of Pottery     | win     | no            | typography, feedback, readability, touch       |

### What changed between rounds

- **Hubs became places, not dashboards.**
  - The garage hub is now one big lit scene: you and Ren stand in the workshop in aprons, the piece on the bench sits between you, and a wall clock shows the hour of the day.
  - The garage gained a tool shelf, boards leaning on the wall, wood shavings with a broom, a sleepy cat on a rug, and a neighbour waving with her dog through the open door.
  - Offers became "Notes on the door", pinned at slight angles, and the current job became an "On the workbench" ticket with a clip. Hours left show as a row of pips.
  - The showroom hub shows the floor sets large, each with a name plaque, under hanging lamps with pools of light, framed pictures and wall panelling. You and Ren stand at either side.
- **Shared lighting.** A warm light pool, soft rays, floating dust motes and a gentle vignette give the garage and showroom depth. The motes stop when motion is reduced.
- **Saw step:** the board scales to fit the screen, the saw is bigger, and the trestle legs became proper A-frames.
- **Sand step:**
  - The flat tiled board became a lit board with a bench edge and shadow.
  - Dust now builds up as soft, blurred drifts with specks, and smooth patches sparkle when they are done.
  - The red block became a real sanding block with a handle, a sandpaper base and whoosh lines, and the grain arrow points both ways.
- **All craft steps:** a "Your piece so far" corner shows step X of Y, a sketch of the piece, progress dots and a coaching tip.
- **Finish step:** the piece now sits in a sunny painted corner with a window, a shelf, a dust sheet and an open paint tin in the chosen colour. The extras board says "Drag one onto your piece", prices show a coin, and Turn, Smaller and Bigger buttons carry words, not only symbols.
- **Results:** the score panel and checklist sit beside the delivery scene, a light burst glows behind the delivered piece, the client cheers, and confetti lands on the floor.
- **Fair showcase:** a proper wooden stage with bunting skirt and spotlight pools replaces the empty dirt, the piece gets a glowing halo and a nameplate, a full-size cheering crowd fills the front, a far crowd fills the back, and a scene label such as "Scene N of M · Lift the sheet" tells the player where they are.
- **Title:** save slots are tidier, with the day line under the name and stats and buttons on one footer row.

### Final result

**Passed in round 2: 8/8 won or tied (100%), none clearly worse.**

### Remaining gap

- **Art is still the criterion we lose on almost every pair.** In round 2 only the saw step won on art. Every other win came from purpose, feedback, readability and large touch targets.
- **Hubs:** the critic still called the garage hub cluttered with some clipped panels, and the showroom scene sparse and flat next to a lit 3D gallery.
- **Sand step:** clear and lively, but the art is cruder than a lit pottery wheel in a garden.
- **Finish step:** the art is still flat and the extras grid still feels fiddly.
- **Results:** some of the lines on the results screen contradict each other, so the wording needs a check.
- **Showcase:** the crowd and the overall composition are weak, even though the screen is festive and clear.
- **Next steps:** softer shading and more texture on the bench and room art, a less crowded garage hub, a fuller showroom, bigger extras tiles, consistent results wording, and a more natural fair crowd would close most of what is left.
