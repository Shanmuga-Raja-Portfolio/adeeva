# Workshop & Wood — Game Design (id: `workshop`)

A playable slice of the Maker Studio contract (`work/0003-studio/design.md`), at about a third of ADEEVA's depth. You turn Uncle Bram's old garage into a small furniture workshop. Neighbours bring you commissions. For each one you design a piece from parts, pick a wood, lay the parts out on boards, then saw, join, sand and finish it, and deliver it. All names, text and art are original, and the studio safety promise applies on every screen.

## 1. Fantasy and audience

- **Fantasy:** "I drew a bookshelf, cut it from real-looking boards, tapped the joints together, and the librarian put it in the reading corner." The fun is making something solid with your own hands, and choosing the wood and finish that suit the person.
- **Ages 8–15+.**
  - 8–11 play on Relaxed with Assist toggles on. They enjoy the mallet taps, sanding the dust away, painting a toy chest coral and adding a name plaque.
  - 12–15+ play Standard or Challenging. They fit parts around knots, keep the long parts running with the grain, and pick tougher woods for pickier clients, which pay a fine-wood bonus (§5).
- **Reading level:** hints are one sentence of 12 words or fewer, at about Grade 3. Client lines are 1–2 short sentences. Every number comes with an icon (coin, clock, star, board).
- **Why it is good for kids (without overclaiming):** it practises steady pointer control, spatial planning (fitting parts on boards), and working to a budget and a deadline. It shows that careful work is rewarded. It does **not** teach real woodworking or tool use, and says so.
- **Parent page sentences (exact):** "This game does not teach real woodworking, tool use or finishing. It uses no real measurements or plans."

**Kid-facing labels** (the design terms on the left never appear on screen; in particular "tenon", "dowel", "grain" and "offcut" are never shown):

| Design term                | Label on screen                         |
| -------------------------- | --------------------------------------- |
| cutting list / layout      | "Plan your boards"                      |
| grain                      | "Wood lines"                            |
| tenon, dowel, finger joint | "Slot joint", "Peg joint", "Comb joint" |
| hardness                   | "Tough wood" (1–3 hammer icons, §4.1)   |
| offcut                     | "Spare piece"                           |
| hardware                   | "Knobs & extras"                        |

## 2. Core loop and stages

**Career (only one):** _Garage Workshop Maker_ in "the Garage on Larkspur Road". Start: 100 coins, reputation 0, weekly rent 100 (Challenging ×1.5 = 150), paid to Uncle Bram, who is kind but firm. Shift: "Sweeping at Pell's Timber Yard" pays 30 coins for a whole untouched day, on every difficulty.

**Hub loop:** read the pinned notes (offers) → accept a commission → run it → deliver → End Day. Rent is due at the end of every 7th day, exactly as ADEEVA's `weeklyBill`. There is no own-stock or show mode in this slice.

**`CommissionRun.stage`** = `brief → design → timber → layout → saw → join → sand → finish → review → done`

| #   | Stage  | Hours          | What happens                                                                                                                                                                                                                                                                                                             |
| --- | ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | brief  | 0              | Client note: allowed product(s), required tags, favoured and avoided colours, avoided woods, required extras, budget, fee, deadline, minimum quality. The live checklist stays on screen afterwards (ADEEVA `checklist`).                                                                                                |
| 2   | design | 1              | Pick one option per part slot the product has (§4.3) and one wood. `PiecePreview` shows the piece front-on.                                                                                                                                                                                                              |
| 3   | timber | 1 per visit    | Pell's Timber Yard: buy boards of the chosen wood (§4.1, §4.2) one by one or with **Buy what fits my plan**. The whole cart is checked against coins at once; the first purchase of a visit costs the trip hour. Owned boards and spare pieces can be used instead; leaving needs at least one board of the chosen wood. |
| 4   | layout | 0              | Drag each part onto an owned board of the chosen wood; rotate in 90° steps. Parts must stay in bounds, must not overlap each other, and must not cover a knot. An illegal drop is refused with the hint, so a part never rests in an illegal spot.                                                                       |
| 5   | saw    | 3              | Saw each part along its pencil line (trace). Each line is recorded once, the moment it is complete. A board is used up exactly once, as soon as every part on it is sawn, and a long board's spare end goes back on the rack.                                                                                            |
| 6   | join   | 3              | Fit each joint in a close-up by dragging and turning the part into place, then tap it home with the mallet.                                                                                                                                                                                                              |
| 7   | sand   | 1              | Sand each show surface along the wood lines.                                                                                                                                                                                                                                                                             |
| 8   | finish | 1 (+1 cushion) | Choose a finish and colour, place extras, and for seat pieces optionally sew a cushion seam (§3.5).                                                                                                                                                                                                                      |
| 9   | review | 0              | Evaluate the frozen run; commit the reward once per run id.                                                                                                                                                                                                                                                              |

Going back follows ADEEVA's rule: design, timber and layout can be revisited until the first saw line is recorded; after that the design is locked. Changing the product clears the part choices and the board plan; changing the wood clears the board plan. Total for one commission: 10 h with the timber trip (9 from boards already on the rack, 11 with a cushion, which carries the piece into a second day) of a 10 h day (11 with the Garage Skylight, which also adds its hour to the day it is bought, so a shift can still be worked that morning).

**First commission coach** (one-time, one hint per stage, shown until the first delivery and dismissible with **Got it**; the hub shows "A note is pinned to the door! Tap Accept." the same way):

- design: "Pick one choice for each part, then pick a wood."
- timber: "Buy the boards marked 'Fits your plan'."
- layout: "Drag each part onto a board. Keep off the knots."
- saw: "Press on the pencil line and follow it."
- join: "Slide the part onto its shadow, then tap the mallet."
- sand: "Rub along the wood lines until the dust is gone."
- finish: "Pick a finish, then add the extras on the note."

## 3. Hands-on mini-games

All input is Pointer Events (mouse and touch). Every control and drag handle is at least 44 px; mallet, Assist, **Show me** and Restart buttons are 56 px. Scoring lives in core; the UI only animates and reports samples. Each scored step has a **Restart** that clears only that step's unfinished item. Difficulty multipliers come from ADEEVA's `difficulty` content (Relaxed ×1.3, Standard ×1, Challenging ×0.85).

**Hardness factor** (shared by saw and join): `hard = 1 − 0.4 × wood.hardness` (pine 0.96, oak 0.76). Harder woods are pickier, like `materialBandMultiplier` in ADEEVA's `sewBand`.

### 3.1 Plan your boards (layout; scored through grain)

- **Input:** drag parts from a tray onto a top-down board; every owned board of the chosen wood is stacked on the bench, one under another. Each tray part has its own 48 px turn button; a part already on a board is turned with the 56 px **Turn** button (or R). A drop slightly over a board's edge is nudged back onto the board; a drop away from every board sends a placed part back to the tray. A green or red ghost shows whether the spot is legal while dragging. Keyboard: Enter on a tray part finds it a spot (as **Show me**), arrow keys nudge a placed part by 1 cm, R turns it and Delete returns it. Focus follows the part: onto the board after Enter, back to its tray item after Delete.
- **Rules:** rectangle bounds plus obstacle polygons, built on the engine's `placedPolygon`, `polygonBounds` and `polygonsOverlap`. Knots are obstacle circles (radius 2–4 cm, tested as 12-sided polygons), 1–3 per board on knotty woods and 0–1 on others, placed by the engine's seeded RNG from the board number and stored on the board when it is bought.
- **Knots never block the plan:** `boardKnots` rejects a knot draw that would touch any canonical spot (§4.2) of the product being made on that board size. It redraws up to 10 times, then drops that knot. The typical boards therefore always fit, and **Show me** can always finish the plan on them.
- **Show me** (Assist): places the next unplaced part (or the chosen one) at its canonical spot when that spot is free on the matching board, otherwise at the first legal spot scanning rotations 0, 180, 90 and 270. A part placed this way counts at most 0.9 for wood lines until the player drags it by hand.
- **Wood-lines score per part** (new `woodGrain`, same shape as ADEEVA `grainScore`): rotation 0/180 (long side along the wood lines) = 1.0. Rotation 90/270 = 0.85 if the part's aspect ratio is below 1.5, 0.7 if 1.5–2.5, and 0.5 if above 2.5 (legs and shelves "would snap"). The tray shows a small arrow on every part.
- **Spare pieces:** when a long board is used up, an unused end of 60 cm or more (full width, beyond the furthest part) comes back as a free short board of the same wood, keeping every knot that sits on that end, even one that crosses the cut.
- **Fun:** for 8-year-olds it is a shape puzzle with a clear ✓; for 15-year-olds it is an efficiency puzzle (fit around knots, keep legs along the lines, earn a spare piece).

### 3.2 Saw (trace)

- **Input:** the Saw shows one part at a time on its own board over two sawhorses, zoomed so `pxPerCm = clamp(fit, 6, 16)`; part chips pick which part to saw next. Press on the pencil line (a green dot marks the start) and drag along it; the saw sprite follows the pointer, a red trail shows the kerf and sawdust falls. Release to pause; press again to continue. A press away from the line is ignored with "Press on the pencil line to start." Each part's cut path is its shaped outline (rounded corners, arch, taper or splay, §4.3) with the longest run of edges that lie on the board's edge removed (core computes it) as an **open** path, plus any accent cut-out as a separate **closed** path and slats as three short open lines.
- **Scored:** the engine's `traceAccuracy(samples, path, tolerance, closed)` (whose `distanceToOutline` already takes `closed`), so an open saw line never scores against a closing segment that does not exist. A line counts as sawn when the samples cover at least 90% of the path's length (projected onto an open `traceTrack`) and include at least 1 sample per cm; the UI reports `getCoalescedEvents()` samples so fast drags still qualify, skips samples closer than 0.2 cm to the last one, thins a very long line evenly to the 20 000-sample limit (`fitSawSamples`), and records the line the moment it is complete. A refused line says "Hmm, that cut slipped. Try that line again." A part's saw score is the average of its lines. Otherwise: "Keep sawing to the end." **Restart this line** clears the unfinished samples.
- **Tolerance:** `BASE_CUT_TOLERANCE_CM (1.2, ADEEVA's value) × trait (Perfectionist 1.2) × Sturdy Sawhorses 1.15 × difficulty × hard`, the same multiplier pattern as ADEEVA's `cutTolerance`, in Workshop's own `tolerance` module (games never import each other). Pine on Relaxed ≈ 1.5 cm (≥ 9 px); oak on Challenging ≈ 0.78 cm (≥ 4.6 px at the smallest zoom).
- **Assist saw (Guide rail):** the rail is drawn along the line and **Saw along the rail** rides the saw over every open line of the part; each scores a flat 0.8 (`ASSIST_CUT_ACCURACY`).
- **Why it is fun:** straight lines are calm wins for young players; rounded corners, tapered legs and a star cut-out give older players a real steady-hand challenge.

### 3.3 Join (alignment, then mallet rhythm) — new

- **Close-ups:** each joint is played in one of 3 close-up templates (Peg, Slot, Comb) on a green mat measured in millimetres (160 × 108 mm, scaled to the screen), filled with the chosen wood's pattern. The product preview beside it highlights the part being fitted.
- **Start pose:** the moving part starts at a seeded offset of 25–40 mm and 12–25° from the target, never already inside tolerance.
- **Input:** drag the moving part (body ≥ 44 px) and turn it about its seating point with a round handle on its far end (or ±1° buttons, 48 px, hold to repeat; arrow keys slide and Q/E turn when the part has focus). A dashed ghost shows the target. When it is close, a light turns green and the 64 px **Mallet** button lights up. **Start this joint again** resets the unfinished fit; a seated joint can be redone with **Redo** until the stage is complete.
- **Core computes** offset `d` (mm, distance between the moving part's anchor and the target anchor) and angle error `a` (degrees) from the reported final pose `{x, y, angle}`; the UI never reports a score.
- **Tolerances:** `dTol = base × mult`, `aTol = base × mult`, with bases Peg 5 mm / 6°, Slot 4 mm / 5°, Comb 3 mm / 4°, and `mult = trait 1.2 × Clamp Rack 1.15 × difficulty × hard`. Peg in pine on Standard ≈ 4.8 mm (29 px); Comb in oak on Challenging ≈ 1.94 mm (11.6 px). Splayed legs set the Slot target angle to 8°.
- **Mallet allowed** only when `(d/dTol)² + (a/aTol)² ≤ 1`; otherwise the button explains "Nudge it a little closer."
- **Mallet rhythm:** seating takes Peg 2 taps, Slot 3, Comb 4 ("tock" and a little wobble each). A shrinking ring shows the moment to tap; a tap inside the ring's window is good. A miss only costs a moment, never the joint. With `prefers-reduced-motion` the ring is static and every tap counts as good.
- **Formula:** `jointAccuracy = clamp(1 − 0.5·(d/dTol)² − 0.5·(a/aTol)², 0, 1) × (0.9 + 0.1 × goodTaps / taps)`. The square makes "nearly right" feel generous (half-way off on both = 0.75), and the worst joint the mallet accepts still scores 0.45–0.5.
- **Record validation** (like `recordSeam`): finite numbers, `d ≥ 0`, `a ≥ 0`, `(d/dTol)² + (a/aTol)² ≤ 1`, whole-number `0 ≤ goodTaps ≤ taps = required taps`, one record per joint id per run, and a joint can be un-tapped and redone until the stage is complete.
- **Assist join (Magnet helper):** the part sits exactly on the ghost, ready for the mallet; the joint counts at most 0.7 (`ASSIST_JOIN_ACCURACY_CAP = 0.7`).
- **Why it is fun:** the snap and mallet beat feel physical for an 8-year-old; for a 15-year-old, comb joints in oak at Challenging are a genuine precision test.

### 3.4 Sand

- **Input:** rub the surface with the sanding block by dragging back and forth over a 320 × 160 unit surface. The surface is a grid of 8 × 4 cells; dust clears and the wood brightens as cells get passes. Keyboard: up and down pick a row, left and right rub along it (one stroke per key press; a held key does not repeat). While the pointer stays down, each finished stroke is handed to core at its reversal (`settleDrag`), so a long rub never piles up into one oversized drag. **Start this surface again** clears that surface. A surface counts as sanded when every cell has a pass and smoothness is at least 75%.
- **Stroke definition (core):** a stroke ends on pointer-up or on a direction reversal (the dot product of successive 10 px segments < 0). Its angle is the angle from the stroke's start point to its end point. Strokes shorter than 30 px are ignored.
- **Stroke rules:** a stroke adds one pass to each cell it crosses (capped at 3). It is "along the lines" if its angle to the wood lines is within `25° × trait 1.2 × difficulty`; otherwise it still adds passes but leaves a faint scratch.
- **Formula:** `smooth = Σ min(passes, 3) ÷ (3 × 32)`, `crossShare = across strokes ÷ all strokes`, `sandScore = smooth × (1 − 0.5 × crossShare)`. Each piece has 1–2 show surfaces (§4.2); the stage score is their average.
- **Record validation:** the UI reports the raw drag path in surface units and core splits and scores the strokes; whole-number passes per cell (0–3), `across ≤ strokes`, strokes only grow, and at most 400 strokes per surface: a rub that would pass the limit keeps the strokes that fit, and a worn-out surface says "That's lots of rubbing! Tap Start this surface again."
- **Assist sand:** strokes snap to the wood lines; the surface counts at most 0.7.
- **Why it is fun:** it is satisfying and quick for young players (about 15 seconds a surface); older players learn to go with the lines to avoid scratches.

### 3.5 Finish (creative, not skill-scored)

- Pick one finish (§4.4); chalk paint and two-tone also take one of 8 paint colours. The preview recolours instantly.
- Drag extras from the tin onto the front view (Enter on a tin item drops it on the piece), then move them by dragging; the last moved extra can be turned in 15° steps, scaled 0.5–2 and sent back, using the engine's `PlacedPose` rules and the shared `PlacedLayer`. Tapping a placed extra returns it to the tin. Coins are paid when a finish or extra is chosen and given back when it is changed or returned. The name plaque shows the client's last name ("Teodor", "Milo").
- **Cushion (seat pieces only, optional, +1 h):** choose one of 6 fabrics matching ADEEVA's (`sage-linen` 14, `sky-gingham` 11, `blush-floral` 12, `mustard-dot` 11, `ivory-cotton` 9, `navy-stripe-linen` 15 coins: half a metre at ADEEVA's prices), drawn with the shared `FabricPattern`, then sew one seam in the **Cushion corner**: hold on the fabric to feed it under the needle (about 8 seconds) and steer the needle onto the wavy chalk line. Scoring uses the engine's `recordFollow` and `followAccuracy` (inside ticks ÷ ticks), with a band of `0.12 × trait × difficulty`; the **Seam helper** widens it ×1.6 and caps the seam at 0.8. **Restart the seam** clears it; Space starts and stops sewing and arrow keys steer. The cushion adds the `cosy` tag and its fabric colour; its seam accuracy joins the sand term (§5).

### 3.6 Hint lines (all ≤ 12 words)

| when                                | line                                             |
| ----------------------------------- | ------------------------------------------------ |
| part turned across the wood lines   | "Turn it so the wood lines run long."            |
| part dropped on a knot              | "That spot has a knot. Try somewhere else."      |
| saw released before 90% coverage    | "Keep sawing to the end."                        |
| mallet tapped outside the gate      | "Nudge it a little closer."                      |
| more than a third of strokes across | "Sand along the wood lines for a smooth finish." |
| required extras missing at Finish   | "Add the extras on the note."                    |
| avoided wood picked at Design       | "This wood is on the 'please avoid' list."       |

## 4. Content catalog

### 4.1 Woods (12)

Price is for one long board. Hardness is 0–1. Knotty woods roll 1–3 knots per board; others roll 0–1. `tone` counts as a colour when the finish shows the wood. **Hammers** ("Tough wood"): 1 for hardness < 0.3, 2 for 0.3–0.5, 3 for > 0.5.

| id     | name   | price | hardness | hammers | knotty | tone       | tags             | unlock rep |
| ------ | ------ | ----- | -------- | ------- | ------ | ---------- | ---------------- | ---------- |
| pine   | Pine   | 6     | 0.10     | 1       | yes    | honey-wood | rustic, natural  | 0          |
| spruce | Spruce | 6     | 0.10     | 1       | no     | pale-wood  | natural, cosy    | 0          |
| poplar | Poplar | 7     | 0.20     | 1       | no     | pale-wood  | modern           | 0          |
| cedar  | Cedar  | 8     | 0.15     | 1       | yes    | red-wood   | rustic, cosy     | 0          |
| larch  | Larch  | 8     | 0.30     | 2       | yes    | honey-wood | rustic, sturdy   | 0          |
| birch  | Birch  | 9     | 0.40     | 2       | no     | pale-wood  | modern, natural  | 3          |
| beech  | Beech  | 10    | 0.50     | 2       | no     | pale-wood  | sturdy, classic  | 5          |
| ash    | Ash    | 11    | 0.50     | 2       | no     | pale-wood  | sturdy, modern   | 8          |
| maple  | Maple  | 12    | 0.60     | 3       | no     | pale-wood  | classic, modern  | 10         |
| cherry | Cherry | 13    | 0.50     | 2       | no     | red-wood   | elegant, cosy    | 12         |
| oak    | Oak    | 14    | 0.60     | 3       | no     | honey-wood | classic, sturdy  | 12         |
| walnut | Walnut | 20    | 0.55     | 3       | no     | dark-wood  | elegant, classic | 15         |

- **Board sizes:** short 60 × 20 cm (price × 0.55), long 120 × 20 cm (× 1), wide panel 90 × 40 cm (× 1.6). Prices are rounded; the Timber Rack upgrade takes 10% off.
- **Tags** (`WoodTag`, 8): `classic, rustic, modern, playful, elegant, cosy, sturdy, natural`. The neutral tag is `natural`, like ADEEVA's `classic`.
- **Colours:** ADEEVA's 16 `colour` entries, plus 4 wood tones (`pale-wood`, `honey-wood`, `red-wood`, `dark-wood`).

### 4.2 Products (7 templates)

Parts are rectangles in cm, W × H, with W running along the wood lines, reshaped by the design options (§4.3). The canonical layout is the one knots must never block (§3.1); every product fits its typical boards with room left for knots. Cost is the typical board spend in pine.

| id            | name              | parts (W×H)                                                  | slots              | joints          | show surfaces | seat | canonical layout                                                               | pine cost |
| ------------- | ----------------- | ------------------------------------------------------------ | ------------------ | --------------- | ------------- | ---- | ------------------------------------------------------------------------------ | --------- |
| birdhouse     | Garden Birdhouse  | roof ×2 18×14, side ×2 14×12, gable ×2 16×14, floor 12×12    | edge, accent       | Peg ×4          | roof          | no   | 1 long (108 of 120 cm used)                                                    | 6         |
| step-stool    | Little Step Stool | top 30×25, side ×2 30×25, step 35×15, rail 35×8              | edge, accent       | Slot ×4         | top           | no   | panel: top + 2 sides; long: step + rail                                        | 16        |
| plant-stand   | Plant Stand       | top 25×18, shelf 25×18, leg ×4 70×6                          | edge, legs         | Slot ×4, Peg ×2 | top           | no   | short: top + shelf; long 1: 3 legs side by side; long 2: 1 leg                 | 15        |
| bookshelf     | Wall Bookshelf    | side ×2 55×18, shelf ×3 50×18                                | edge, accent       | Peg ×6          | side ×2       | no   | long 1: 2 sides; long 2: 2 shelves; long 3: 1 shelf (70 cm left = spare piece) | 18        |
| toy-chest     | Toy Chest         | front 50×30, back 50×30, end ×2 30×30, base 36×28, lid 50×30 | edge, accent       | Comb ×4, Peg ×2 | front, lid    | no   | panel 1: front + end; panel 2: back + end; panel 3: lid + base                 | 30        |
| bedside-table | Bedside Table     | top 45×35, leg ×4 65×6, rail ×2 40×8                         | edge, legs, accent | Slot ×4, Peg ×2 | top           | no   | panel: top; long 1: 3 legs; long 2: leg + 2 rails                              | 22        |
| window-bench  | Window Bench      | seat 85×35, leg ×4 42×12, rail ×2 80×8                       | edge, legs         | Slot ×6         | seat          | yes  | panel: seat; long 1 and 2: 2 legs each; long 3: 2 rails                        | 28        |

Toy Chest needs 2 Brass Hinges: the product's own extra need is merged with the brief's (the larger count wins), so the hinges show on the checklist and in the extras tin, count for the **Extras** criterion and are paid like any extra, inside the budget.

Shaped parts: the `edge` option reshapes the product's panels (birdhouse front and back, stool top and sides, plant-stand top and shelf, bookshelf sides, toy-chest front and lid, bedside top, bench seat); the `legs` option reshapes legs; the `accent` option cuts into one accent part (birdhouse front, stool left side, bookshelf left side, toy-chest front, bedside front rail).

### 4.3 Part options (design stage; one per slot the product lists)

The `legs` slot only exists on products that list it; Splayed legs set the Slot joint target angle to 8°.

| slot   | id            | name            | tags            | effect on sawing                 |
| ------ | ------------- | --------------- | --------------- | -------------------------------- |
| edge   | square-edge   | Square edges    | classic, sturdy | straight lines only              |
| edge   | rounded-edge  | Rounded corners | cosy, playful   | 4 corner arcs (r = 4 cm)         |
| edge   | arched-edge   | Gentle arch     | elegant         | one long arc on the top or front |
| legs   | straight-legs | Straight legs   | sturdy          | straight                         |
| legs   | tapered-legs  | Tapered legs    | modern, elegant | trapezoid, 2 long slanted cuts   |
| legs   | splayed-legs  | Splayed legs    | rustic, playful | angled ends; Slot joints at 8°   |
| accent | no-accent     | Plain           | classic         | none                             |
| accent | star-cutout   | Star cut-out    | playful         | 10-point closed path             |
| accent | leaf-cutout   | Leaf cut-out    | natural         | closed curve                     |
| accent | slats         | Slatted panel   | modern          | 3 extra straight cuts            |

### 4.4 Finishes and extras

| finish id   | name           | price | tags          | colour shown                                                  |
| ----------- | -------------- | ----- | ------------- | ------------------------------------------------------------- |
| clear-oil   | Clear Oil      | 4     | natural       | wood tone                                                     |
| beeswax     | Beeswax Polish | 5     | cosy, classic | wood tone                                                     |
| whitewash   | Whitewash      | 5     | rustic        | ivory + wood tone                                             |
| deep-stain  | Deep Stain     | 6     | elegant       | dark-wood                                                     |
| chalk-paint | Chalk Paint    | 6     | playful       | one of sky, coral, sage, mustard, lavender, teal, navy, blush |
| two-tone    | Two-Tone       | 8     | modern        | a paint colour + wood tone                                    |

| extra id     | name                                  | price | tags             | colour    |
| ------------ | ------------------------------------- | ----- | ---------------- | --------- |
| brass-knob   | Brass Knob                            | 4     | elegant, classic | gold      |
| wood-knob    | Wooden Knob                           | 2     | cosy, natural    | wood tone |
| leather-pull | Leather Pull                          | 3     | rustic           | —         |
| coat-hook    | Iron Hook                             | 3     | sturdy           | charcoal  |
| brass-hinge  | Brass Hinge                           | 3     | classic          | gold      |
| name-plaque  | Name Plaque (shows the client's name) | 5     | cosy, playful    | ivory     |
| star-stencil | Star Stencil                          | 2     | playful          | gold      |
| leaf-carving | Carved Leaf                           | 4     | natural, rustic  | —         |

### 4.5 Clients (8; 2 trait-gated)

Briefs are varied by seeded RNG like ADEEVA's `rollClientBrief` (budget, fee, deadline, 2 favoured colours).

| id             | name, relation                                         | gate / min rep    | products                    | required tags    | favoured colours            | avoid              | required extras                | budget | fee     | days | min Q |
| -------------- | ------------------------------------------------------ | ----------------- | --------------------------- | ---------------- | --------------------------- | ------------------ | ------------------------------ | ------ | ------- | ---- | ----- |
| grandpa-teodor | Grandpa Teodor, who feeds every bird on the street     | — / 0             | birdhouse                   | natural          | honey-wood, sage, sky       | navy               | —                              | 20–30  | 35–45   | 3–5  | 55    |
| cousin-milo    | Aunt Noor, for Cousin Milo (age 6), owner of many toys | — / 0             | toy-chest                   | playful          | coral, sky, mustard         | dark-wood          | name-plaque ×1                 | 50–65  | 55–70   | 4–6  | 55    |
| mrs-adaeze     | Mrs. Adaeze, neighbour with the jungle balcony         | — / 0             | plant-stand                 | natural, cosy    | honey-wood, sage, teal      | black              | —                              | 25–35  | 45–60   | 4–6  | 58    |
| ms-ingrid      | Ms. Ingrid, children's librarian                       | — / 4             | bookshelf                   | classic, sturdy  | pale-wood, honey-wood, navy | coral              | wood-knob ×2 (as shelf pegs)   | 30–45  | 60–80   | 5–7  | 65    |
| rosalind       | Rosalind, who runs the Corner Cup café                 | — / 8             | window-bench                | cosy             | blush, sage, honey-wood     | charcoal           | — (a cushion counts as `cosy`) | 50–70  | 75–95   | 5–7  | 68    |
| mr-desmond     | Mr. Desmond, retired ferry captain                     | — / 12            | bedside-table               | elegant          | red-wood, dark-wood, gold   | pale-wood          | brass-knob ×1                  | 45–70  | 90–110  | 5–7  | 72    |
| luna           | Luna, who paints murals on garden walls                | Dreamer / 6       | step-stool, plant-stand     | playful, elegant | lavender, navy, gold        | —                  | star-stencil ×2                | 30–45  | 85–105  | 5–7  | 65    |
| mr-lindqvist   | Mr. Lindqvist, clock repairer two doors down           | Perfectionist / 8 | toy-chest (as a tool chest) | classic          | dark-wood, honey-wood       | wood: pine, spruce | brass-hinge ×2, brass-knob ×1  | 70–95  | 100–120 | 5–7  | 82    |

Milo's lines are his own; Aunt Noor pays and picks it up.

| client         | request                                                        | delighted                                                              | nearMiss                                                |
| -------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| grandpa-teodor | The robins need a new home. Nothing fancy, just honest wood.   | Look, a robin is already peeking in! Wonderful.                        | A fine little house. The birds won't mind a wobble.     |
| cousin-milo    | I need a chest for my dinosaurs. A bright one with my name!    | My name! It's the best box in the world!                               | I love it! The lid is a tiny bit wiggly.                |
| mrs-adaeze     | My ferns want to be taller. Could you make them a stand?       | My plants look like they're on a stage. Thank you!                     | It holds them nicely. A few rough spots, but I'm happy. |
| ms-ingrid      | Picture books need a strong shelf. Classic and sturdy, please. | The reading corner finally feels finished. Marvellous.                 | It's very kind. One shelf sits a little crooked.        |
| rosalind       | My window seat needs a bench. Warm and comfy, please.          | Customers keep asking to sit there. It's perfect.                      | It's lovely! A couple of joints could be snugger.       |
| mr-desmond     | A bedside table, please. Something with a bit of polish.       | Shipshape and handsome. I'm very pleased.                              | Good work. The top could be a touch smoother.           |
| luna           | I want a stool that looks like it fell from the night sky.     | It looks like a piece of the night sky. I'm painting it into my mural! | Almost magic! Maybe a few more stars next time.         |
| mr-lindqvist   | I need a chest for my small tools. Every joint must be true.   | Tight as a good clock. I could not have done better.                   | Good effort. Patience makes joints tighter.             |

**Day 1:** the only offer is `grandpa-teodor` (birdhouse, 1 long board, 4 Peg joints). From day 2 the normal pool applies.

Each client has an original avatar look and a delivery scene (§6). The name plaque shows the last word of the client's name.

### 4.6 Upgrades and garage decor

Upgrades (4; one-time; reputation-gated; mirror ADEEVA's four):

| id               | name             | price | min rep | effect                    |
| ---------------- | ---------------- | ----- | ------- | ------------------------- |
| sturdy-sawhorses | Sturdy Sawhorses | 140   | 3       | saw tolerance ×1.15       |
| clamp-rack       | Clamp Rack       | 160   | 5       | join tolerance ×1.15      |
| timber-rack      | Timber Rack      | 150   | 8       | 10% off boards            |
| skylight         | Garage Skylight  | 220   | 12      | +1 working hour every day |

Garage decor (one-time, fixed price, display only, no gameplay effect, no randomness): `pegboard-tools` Tool Outlines (40), `door-paint` Painted Garage Door, one of the 8 paint colours (80), `bench-lamp` Bench Lamp (120).

### 4.7 Story beats (8; player lines voiced by trait, as in ADEEVA's `storyVoice`)

| id                | trigger                | title                 | gist (2–5 lines)                                                                                             |
| ----------------- | ---------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| ww-key            | intro                  | Sawdust and Sunlight  | Uncle Bram hands you the garage key: "Goggles on, ideas out." Your first note is already pinned to the door. |
| ww-first-delivery | first-delivery         | First Coat            | You watch your first piece leave the garage. Bram: "Now it's part of someone's home."                        |
| ww-first-week     | first-week             | Rent and Rafters      | Bram collects the rent with a mug of cocoa and points out the upgrade catalogue.                             |
| ww-dreamer        | trait-dreamer          | Blueprints at Bedtime | You sketch a stool shaped like a crescent moon; Luna's note arrives. Queued when Luna's offer arrives.       |
| ww-perfectionist  | trait-perfectionist    | A Hair's Width        | Mr. Lindqvist shows you a clock gear and asks if your joints are that true. Queued when his offer arrives.   |
| ww-trendsetter    | trait-trendsetter      | Window Shopping       | On a walk you notice what the neighbourhood is starting to like. Queued when the first week ends.            |
| ww-charmer        | trait-charmer          | Tea on the Workbench  | Neighbours drop by to chat; one tells three friends (+2 buzz when seen). Queued after the first delivery.    |
| ww-lean-week      | bankrupt (Challenging) | A Lean Week           | Bram: "Every maker has a lean week. Pell's yard needs a sweeper." Points to the shift. No game over.         |

## 5. Evaluation, rewards and economy

**Quality** (0–100): `100 × (0.25·saw + 0.35·join + 0.15·sand + 0.15·grain + 0.10·woodFit)`.

- saw, join, grain: averages over parts or joints; an unsawn part or unseated joint counts 0, like ADEEVA's `dressQuality`.
- sand: average over show surfaces, plus the cushion seam (if sewn) as one more item.
- woodFit: 1 if the wood's tags include `natural` or meet a required tag, and the wood is not avoided; otherwise 0 (ADEEVA's `materialFits`).

**Criteria** (ADEEVA ids and weights; `trims` is labelled **Extras**):

| Criterion    | Weight | Pass rule                                                                                  |
| ------------ | ------ | ------------------------------------------------------------------------------------------ |
| construction | 3      | All parts sawn, all joints seated, all surfaces sanded. Mandatory.                         |
| quality      | 2      | Quality ≥ brief minimum (+6 on Challenging, ADEEVA `minQualityBonus`).                     |
| style        | 2      | Every required tag appears in the piece's tags (parts ∪ wood ∪ finish ∪ extras ∪ cushion). |
| colours      | 1      | No avoided colour. +2 per favoured colour used, up to +4.                                  |
| extras       | 1      | Required extra counts met.                                                                 |
| budget       | 1      | Spend on boards, finish, extras and cushion fabric ≤ budget.                               |
| deadline     | 1      | Delivered by the deadline day.                                                             |

**Score** = `clamp(round(0.3·passMix + 0.7·quality + colourBonus), 0, 100)`, so Assist and careful play separate. Stars use ADEEVA's `starsForScore` (90/75/55/35). The **pass gate** is construction, style, extras and quality, as in ADEEVA. Feedback lines reuse ADEEVA's `kindFeedback` tone, with one new line for extras: "So close! The brief asked for a few more knobs or extras."

**Results kid summary:** one line per skill and wish in kid words above the stars: Sawing, Joints, Sanding, Wood lines (great / good / keep practising at 0.85 and 0.65), then Style, Colours, Extras, Budget and Delivery, e.g. "Wood lines: great!", "Joints: snug!", "Extras: 1 more extra needed", "Budget: 2 coins over".

**Rewards** (ADEEVA's `rewards` rules and constants, plus one Workshop rule):

- **Pass:** `fee × (0.8 + 0.4·score/100)` + trait lines; reputation `1 + round(2·score/100)`; buzz `1 + stars + 3 per trend match`.
- **Fine wood:** on a pass, a "Fine wood bonus" line of +15% of the fee per hammer above 1 (2 hammers +15%, 3 hammers +30%). A 3-hammer wood also gives +1 reputation. Workshop composes its reward with the engine's `settleTrendReward` over `WoodTag`s, with its own labels ("Neighbourhood favourite", "Big ideas") and the fine wood line passed as an extra line.
- **Standard soft fail:** 40% of the fee, reputation −1 (0 for Charmer), and kind feedback from the failed criteria.
- **Relaxed:** every run counts as a pass; stars still reflect quality. Rent ×0.
- **Challenging:** minimum quality +6; a fail pays 0 with reputation −3; late delivery costs 50% of the fee; rent ×1.5 (150).

**Traits** (game-flavoured perk text; ADEEVA mechanics):

| Trait         | Perk text                                                           | Mechanic                                                               |
| ------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Dreamer       | "Big ideas: +15% fee when a piece shows 3 or more colours."         | +15% fee for 3+ colours (paint, wood tone, extras, cushion), as ADEEVA |
| Perfectionist | "Steady hands: sawing, joining and sanding are 20% more forgiving." | ×1.2 on saw tolerance, `dTol`, `aTol` and the sanding angle            |
| Trendsetter   | "You spot what neighbours like before they do."                     | Next week's hot tags shown early; +10% fee per trend match             |
| Charmer       | "Everyone stays for tea: a 10% tip on every happy delivery."        | 10% tip; a near miss never costs reputation                            |

**Trends:** the engine's `trendMarket` takes the tag pool as a parameter, so Workshop rolls `HOT_TAGS_PER_WEEK` (2) distinct `WoodTag`s a week with `rollTrendState(seed, WOOD_TAGS)` and advances them at the week's end with the rent through the engine's `settleWeek`. The hub chalkboard reads "Folks love: rustic, playful." and shows next week's pair to Trendsetters.

**Economy:** a 10 h day (11 with the Garage Skylight); start 100 coins; rent 100 (Challenging 150) at the end of each 7th day; shift 30. Offers from `offerCountForBuzz` (1–3 a day, 4 pending, 2-day lifetime); active gigs capped by `MAX_ACTIVE_GIGS`. Hours, not offers, are the limit: one commission takes about a day (10 h), so a week holds 7 (about 8 with the Skylight and boards already on the rack).

**Sanity checks (Standard):**

- **Day 1:** Grandpa Teodor: 1 long pine board (6) + Clear Oil (4) = 10, within a budget of 20–30. Fee ≈ 40, pay ≈ 40 × (0.8 + 0.4 × 0.94) ≈ 47, net ≈ +37.
- **Net per commission in pine:** Teodor +37, Milo +26, Adaeze +42, Ingrid +55, Rosalind +54, Desmond (pine + Deep Stain + knob = 32) +85.
- **Week 1:** offers run 1 a day until buzz reaches 34 (about day 6, at ≈ 6 buzz per pass), so the cap is 7 commissions. Reputation climbs ≈ 3 per pass: Ms. Ingrid (4) unlocks on day 3, Rosalind (8) on day 3–4, Mr. Desmond (12) on day 5. Average net ≈ +45, so week-1 end ≈ 100 + 315 − 100 ≈ 315 coins, reputation ≈ 18–21. Upgrades (670 in all) absorb weeks 2–4; decor (240) is the sink after that.
- **Flawless scripted check:** a bot that scores ≈ 100 on every piece, always builds the cheapest piece that meets the brief and never buys anything delivers 1 / 7 / 14 / 21 pieces by the end of day 1 / week 1 / 2 / 3. On Standard it holds ≈ 400 coins at the start of day 8, ≈ 750 on day 15 and ≈ 1100 on day 22 (Challenging ≈ 350 / 650 / 930). So flawless play can buy the four upgrades during week 2, and the decent player above reaches them in weeks 2–4.
- **Struggling Standard week:** 3 passes (+105), 3 soft fails (≈ 0 net each), 1 shift (+30) → 100 + 105 + 0 + 30 − 100 = 135. Solvent.
- **Struggling Challenging week** (fails pay 0 and lose ≈ 20 in materials each): 100 + 105 − 60 + 30 − 150 = 25. Still above 0; a worse week triggers A Lean Week.
- **Decent player** (saw 0.88, join 0.90, sand 0.90, grain 0.95, woodFit 1): quality ≈ 91 → score 94–98, 5★. Weak run (0.70, 0.65, 0.70, 0.80, 1): quality ≈ 73. Oak at Standard narrows saw and join by 0.76, which costs a decent player about 3–4 quality (≈ 87–88).
- **Pass rate:** the decent player clears every quality minimum (55–82), so fails come from missed tags or extras, a late delivery, or a rough day; expected pass rate ≈ 80–90%. Mr. Lindqvist (82, Challenging 88; no pine or spruce; comb joints) is the real precision test.
- **Assist everywhere:** saw 0.8, join 0.7, sand 0.7, grain 0.9 (Show me), woodFit 1 → quality = 0.2 + 0.245 + 0.105 + 0.135 + 0.1 = 0.785 → 79. Score = round(30 + 55.3 + 4) = 89 → 4★. Only a perfect hand layout (grain 1.0, quality 80) plus 2 favoured colours reaches 90 (5★). Assist passes every Standard minimum except Mr. Lindqvist.
- **Budget pressure and fine wood:** for Mr. Desmond, pine + Deep Stain (32) is cheapest and already gives `elegant` and `dark-wood`. Cherry (1 panel 21 + 2 long 26 + knob 4 + oil 4 = 55) fails a low budget roll of 45–54 but earns +15% fee; walnut (32 + 40 + 8 = 80) breaks every roll. For Mr. Lindqvist, oak (3 panels 66 + hinges 6 + knob 4 + oil 4 = 80) earns +30% fee and +1 reputation but needs a budget roll of 80+; birch (56) is the safe choice. Tougher wood is a real trade, not a trap.

## 6. Screens and art direction

**Screens:**

- **Title** (studio-wide; a cedar birdhouse and a coral toy chest flank the measuring-tape card on wide screens) → **New Game** (name and avatar pre-filled from the studio profile, then trait and difficulty; starting writes them back to the profile) → **Sawdust and Sunlight**.
- **Workshop Hub:** the garage scene with the maker in apron and goggles, a day card with the week strip, hours as pencil ticks (crossed out as they are spent) and the rent note, End Day and Shift; below it the pegboard "Notes on the door" (offers as tilted pinned notes), jobs, the board rack, the trends chalkboard, upgrades and decor. The top bar holds the stats, Settings and Save & exit; Back to studio is on the title screen.
- **Design:** product cards, part option chips, wood swatches with hammer icons for toughness, and `PiecePreview` front-on.
- **Timber Yard:** the three board sizes of the chosen wood with price, size, tough-wood icons, a "Fits your plan" badge with how many are still needed, a cart stepper, **Buy cart** and **Buy what fits my plan**, and the owned boards of that wood.
- **Plan your boards:** a top-down view of the boards with wood lines and knots, a part tray, turn buttons, the Show me button, a ✓ or ↻ badge and a wood-line arrow per part, and a status line with the latest hint.
- **Saw:** one part on sawhorses, zoomed, with a pencil line, the saw sprite and sawdust. **Join:** one of 3 joint close-ups (Peg, Slot, Comb) with the ghost outline, the mallet ring and button, and the small product preview highlighting the current joint. **Sand:** a close-up of the surface with the dust grid and a smoothness meter. **Finish:** the preview, finish swatches and paint pots, the extras tin, and (seats only) the cushion corner with its fabric strip, needle and chalk line. **Review:** the piece in 3/4 view, the build counts and the checklist, then **Deliver it**.
- **Results:** the piece in 3/4 view in its new home beside the client, confetti on a happy delivery, the kid summary, a count-up score with stars, reward lines and totals, the criteria list and the skill meters. 4 `DeliveryScene` backdrops: **Garden** (Teodor, Adaeze, Luna), **Bedroom** (Milo, Desmond), **Café** (Rosalind), **Library** (Ingrid; and Lindqvist's shop counter, shown with a library-style shelf).

**Art direction (distinct from ADEEVA, same tokens):**

- **Palette:** ADEEVA's ink, cream, shadow, radius and focus tokens, plus a game accent set in `games/workshop/ui/theme.css`: timber `#c58a4a`, pegboard `#d9b98a`, slate blue `#4a6378`, forest `#3f6b4f`, safety yellow `#f2c230` (used only for the mallet and the goggles).
- **Shapes:** chunky flat shapes with 2 px ink outlines, rounded 6 px corners; front-on views while building, a flat 3/4 view only on Results. Daylight comes in through the open garage door.
- **Motifs:** pencil marks and a carpenter's-pencil cursor; a measuring-tape border on panels; pinned paper notes; chalkboard numbers.
- **Fonts:** display `"Rockwell", "Roboto Slab", Georgia, serif` as installed system fonts only (as ADEEVA); body `system-ui`. Nothing is downloaded (§7 test).
- **Original SVG scenes and parts:** `GarageBackdrop` (open roll-up door onto the street, pegboard with tools, workbench, plant; the three decor items paint the door, outline the tools and hang a lamp); `WoodPattern` and `BoardArt` (wood lines as an SVG `<pattern>` of seamless seeded waves using the shared `seededUnit`, knots as ringed ellipses, a colour per wood); `SawSprite`; `SawdustBurst`; `MalletArt` and `MalletRing`; `JointCloseUp` (fixed, moving and ghost pieces for Peg, Slot and Comb); the sanding surface with its dust pattern; `PiecePreview` (one parametric front-on drawing per product, re-shaped by the part options, filled with wood or paint, with extras on the shared `PlacedLayer` and the cushion in its fabric; its 3/4 mode adds a shaded depth copy); `ExtraArt` (8 icons); `HammerIcons`; `WorkshopTileArt`; and 4 `DeliveryScene` backdrops.
- **Avatar:** `WorkshopAvatar` draws the shared `AvatarFigure` with a canvas apron and safety goggles on top, as a cosmetic overlay, in the hub scene.
- Motion respects `prefers-reduced-motion` and the studio's Reduce motion setting: no sawdust or confetti, the guide rail and score count finish at once, the mallet ring is static (every tap counts as good), and other animations collapse to a fade.

## 7. Reuse map

Games never import each other (ESLint), so ADEEVA's textile modules are not reused directly; Workshop uses the shared engine and UI and keeps its own small versions of the rest.

**Engine (`src/engine`):** `rng` and `rngDraw` (knots, joint start poses, briefs, trends); `dayHours`, `week`, `weekday`; `standing` (`applyStanding`, `decayBuzz`); `gigBoard` and `gigBoardState` (offers, accept, decline, expiry, lapses, trait arrival); `difficulty`; `story` and `storyVoice` over Workshop's `StoryTrigger` union; `score` (`judgedScore` with `0.3 / 0.7 / 2 / 4`, `starsForScore`, `gatePassed`); `reward` (`settleReward`); `trendMarket` constants; `kindFeedback` (colours, budget, deadline); `upgrades`; `paidShift`; `followRecord` (cushion seam); `placedPose` (extras); `geometry` (`placedPolygon`, `polygonBounds`, `polygonsOverlap`, `traceAccuracy` with `closed`, `traceTrack`, `traceCoverage`, `ASSIST_CUT_ACCURACY`); `saveEnvelope`, `parse` and `stateParsers` (`trendStateParserOf`); `earnedReputation`; `actionCheck`; `recordWithout`; `weekSettlement` (`settleWeek`); `trendReward` (`settleTrendReward`). To share them instead of copying them, `trendMarket`, `weekSettlement`, `trendReward` and `stateParsers` were made generic over the tag type and take the tag pool as a parameter; ADEEVA, Patisserie and Thrift Flip pass `STYLE_TAGS` and behave as before.

**UI (`src/ui`, `src/studio`):** all of `ui/kit` used here (`Button`, `Card`, `Dialog`, `Icon`, `Meter`, `StarRating`, `StatChip`, `TagPill`, `ToggleSwitch`, `clientToSvg`, `useDispatchOnce`, `useElementSize`, `useTickLoop`, `useCountUp`, and two new hooks: `useArmedAfter`, which keeps the results exit from catching the second click of a double-click on Deliver, and `useFocusAfterRender`, which hands keyboard focus to the next part or joint); `ui/art` (`AvatarFigure`, `Avatar`, `PlacedLayer`, `FabricPattern`, `seededUnit`, `colourMix`, `useSvgId`, `TileBackdrop`); `ui/newGame` (stepper, avatar, trait and difficulty steps, `profileDraft`); and the studio's `useGameSession`, `createSlotStore`, `slotSummary`, `lookAllowed`, settings, toasts and `ViewLoadBoundary`.

**Workshop's own versions:** `tolerance` (ADEEVA's 1.2 cm cut base, ×1.2 Perfectionist, 0.12 seam band and ×1.6 assist), `woodGrain` (the shape of ADEEVA's `grainScore`), `cushion` (the shape of ADEEVA's seam line), the six cushion fabrics, `useAssist`, and the screens' kit (coach bubble, set-aside dialog, story overlay, title, settings).

**New code (`src/games/workshop`):**

- `content/`: `woodTag`, `woodTone`, `shade`, `wood` (with hammers), `boardSize`, `product` (parts, roles, slots, joints, show surfaces, accent part, canonical layout, extra needs), `partOption`, `jointKind`, `finish`, `extra`, `cushionFabric`, `client` (with looks and delivery scenes), `upgrade`, `decor`, `storyBeat`, `career`, `trait`, `difficulty`, `hint`, `runStage`.
- `core/`: `boardKnots`; `timberYard`; `boardLayout` (placement checks, Show me); `woodGrain`; `sawPath` (shaped outlines, open outline minus board edges, cut-outs and slats) and `sawRecord` (coverage and sample checks, guide rail, board use and spare pieces); `joint`; `sanding`; `finishChoice`; `cushion`; `design`; `requiredExtras`; `pieceParts`, `pieceTags`, `pieceColours`, `pieceQuality`, `pieceEvaluate`, `kidSummary`, `kindFeedback`, `criterion`, `fineWood`, `rewards`, `runSpend`, `checklist`; `commissionRun`, `runLifecycle`, `stageReadiness`, `stageNavigation`, `hourCost`, `delivery`, `calendar`, `offers`, `storyQueue`, `decorShop`, `upgradeShop` (the Skylight's same-day hour), `newGame`, `reduce`, `gameState`, `save` with `runParser`, `resultParsers`, `gameStateParser` and `runConsistency`; `testPlaythrough`. `reputationOf.ts` sits beside `module.ts` and reads only the raw save.
- `ui/`: the title, new game, settings, story, hub, and the build flow (brief, design, timber, layout, saw, join, sand, finish, review, results) with the art in §6.
- Tests: a unit test per rule (determinism, every mini-game score, knots never blocking any canonical layout, the open-path saw score, stroke splitting on reversal, the spare-piece rule, the joint formula and gate at the tolerance edges, each difficulty's reward path, each trait perk, trait-gated clients, illegal actions returning the same state, save round trips and damaged saves, the timber trip hour, the calendar, the cushion and a full scripted order), content tests (hints ≤ 12 words, client lines ≤ 2 sentences, no grown-up woodworking words), an offline test (no font loading or network code under `src/games/workshop`), and `e2e/workshop/order.spec.ts` (a Day-1 birdhouse by hand on desktop and tablet, save and continue, studio round trip) and `e2e/workshop/bench.spec.ts` (a window bench with a hand-sewn cushion, a rejected knot placement, and the saw, join and sand close-ups).

## 8. Safety notes for this theme

- **No real tool instructions.** The saw, mallet and sanding block are game tools. There are no power tools anywhere in the game. The Saw screen always shows "Real saws are sharp. Ask an adult before using tools.", and the hub footer repeats it beside "Sizes here are game numbers, not real plans." There are no technique tips, measurements or "how to" steps that could be followed at a real bench.
- **No finishing chemistry.** Oils, waxes, stains and paints are colours and tags only. There are no product names, solvent or ventilation advice, mixing, or drying times.
- **Goggles as a norm, not a lesson.** The avatar always wears goggles and an apron in the workshop; nothing on screen claims they make real tool use safe.
- **No real plans.** Part sizes are game numbers. There is no printable cutting list, and nothing suggests a piece built from these numbers would be safe to stand on, sit on or climb. Results never show anyone standing on the stool, climbing a shelf, or inside the toy chest.
- **No bodies, no appearance talk.** Clients comment on the piece, never on themselves or others. No one is scored on looks.
- **Neutral, kind clients.** Avoided colours or woods are personal or practical ("it shows sawdust"), never "for girls" or "for boys". Cousin Milo is shown with Aunt Noor, who pays and collects; he is never asked to use tools.
- **Wood is respected.** Woods are fictional catalogue entries with no claims about real forests, sourcing or sustainability.
- **Randomness is free.** Knots, offers and brief variations come from the seeded RNG; nothing can be rerolled or bought with money. Decor is fixed-price and cosmetic. There are no ads, no chat and no network.

## 9. Out of scope for this slice

- A second career (a furniture shop, restoration studio or carpentry school), a hired apprentice, and any show or market mode.
- More products (chairs, beds, cabinets with drawers, outdoor play sets), turning or carving mini-games, mixing woods in one piece, and upholstery beyond one cushion seam.
- Trait-gated clients for Trendsetter and Charmer (each has a story beat only).
- A street map of delivered pieces, damage over time, broken pieces, returns, weather and wood movement.
- Real measurements, printable plans, photo import, and any online sharing or leaderboards.
