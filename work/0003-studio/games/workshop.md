# Workshop & Wood — Game Design (id: `workshop`)

A game in the Maker Studio contract (`work/0003-studio/design.md`). §1–§8 describe the garage slice as built; §10 grows it to ADEEVA's depth with a second career (the Furniture Showroom) and the Larkspur Craft Fair. You turn Uncle Bram's old garage into a small furniture workshop. Neighbours bring you commissions. For each one you design a piece from parts, pick a wood, lay the parts out on boards, then saw, join, sand and finish it, and deliver it. All names, text and art are original, and the studio safety promise applies on every screen.

## 1. Fantasy and audience

- **Fantasy:** "I drew a bookshelf, cut it from real-looking boards, tapped the joints together, and the librarian put it in the reading corner." The fun is making something solid with your own hands, and choosing the wood and finish that suit the person.
- **Ages 8–15+.**
  - 8–11 play on Relaxed with Assist toggles on. They enjoy the mallet taps, sanding the dust away, painting a toy chest coral and adding a name plaque.
  - 12–15+ play Standard or Challenging. They fit parts around knots, keep the long parts running with the grain, and pick tougher woods for pickier clients, which pay a fine-wood bonus (§5).
- **Reading level:** hints are one sentence of 12 words or fewer, at about Grade 3. Client lines are 1–2 short sentences. Every number comes with an icon (coin, clock, star, board).
- **Why it is good for kids (without overclaiming):** it practises steady pointer control, spatial planning (fitting parts on boards), and working to a budget and a deadline. It shows that careful work is rewarded. It does **not** teach real woodworking or tool use, and says so.
- **Parent page sentences (exact):** "This game does not teach real woodworking, tool use or finishing. It uses no real measurements or plans."

**Kid-facing labels** (the design terms on the left never appear on screen; in particular "tenon", "dowel", "grain", "offcut", "bevel" and "kerf" are never shown):

| Design term                | Label on screen                         |
| -------------------------- | --------------------------------------- |
| cutting list / layout      | "Plan your boards"                      |
| grain                      | "Wood lines"                            |
| tenon, dowel, finger joint | "Slot joint", "Peg joint", "Comb joint" |
| hardness                   | "Tough wood" (1–3 hammer icons, §4.1)   |
| offcut                     | "Spare piece"                           |
| hardware                   | "Knobs & extras"                        |

## 2. Core loop and stages

**First career:** _Garage Workshop Maker_ (the second, _Showroom Maker_, is in §10) in "the Garage on Larkspur Road". Start: 100 coins, reputation 0, weekly rent 100 (Challenging ×1.5 = 150), paid to Uncle Bram, who is kind but firm. Shift: "Sweeping at Pell's Timber Yard" pays 30 coins for a whole untouched day, on every difficulty.

**Hub loop:** read the pinned notes (offers) → accept a commission → run it → deliver → End Day. Rent is due at the end of every 7th day, exactly as ADEEVA's `weeklyBill`. The garage has no own-stock or show mode; the showroom adds both (§10).

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

## 9. Out of scope (slice and depth)

- A third career (restoration studio, carpentry school), more than one apprentice, staff, any online shop, and selling at the Fair itself.
- Cabinets with drawers, bunk or loft beds, high chairs, cots, outdoor play sets and anything to climb; turning or carving mini-games; mixing woods in one piece or one set; upholstery beyond one cushion seam.
- Rival makers who are scored, ranked or shown losing; entry fees, prize money in real currency and leaderboards.
- A street map of delivered pieces, damage over time, broken pieces, returns, weather and wood movement.
- Real measurements, printable plans, photo import, and any online sharing.

## 10. Depth: Furniture Showroom and Larkspur Craft Fair

Phase B (`work/0003-studio/roadmap.md`) grows Workshop & Wood to ADEEVA's depth. ADEEVA grows Student → Label, with 3-look collections and a runway. Here the **Garage Workshop Maker** grows into a **Showroom Maker** in the same save. Uncle Bram's empty bicycle shop next door becomes **the Larkspur Road Showroom**. There you design **matched sets** (one wood, one finish, one style across every piece), take on **Ren**, an apprentice who handles simple steps, and each season bring one set to the **Larkspur Craft Fair** on the village green, where a booth reveal is cheered by four warm panels. Nobody is sent home, ranked against other makers or timed against a rival. Everything in §1–§9 still applies unless this section changes it.

All new woods, products, options, finishes, extras and clients in §10.8 are open in **both** careers by their reputation gates, so a garage player meets new content in weeks 2–3. Set runs, the floor, Open House, Ren, the Fair and the showroom upgrades belong to the showroom career.

### 10.1 Careers, unlock and "start here"

`content/career.ts` becomes a list, `CAREER_IDS = ["garage", "showroom"]`; `GameState.career` is new.

| id         | on screen             | place                                 | start coins | start rep | weekly rent (Std; Challenging)         | shift (any difficulty)                      |
| ---------- | --------------------- | ------------------------------------- | ----------- | --------- | -------------------------------------- | ------------------------------------------- |
| `garage`   | Garage Workshop Maker | the Garage on Larkspur Road           | 100         | 0         | 100; 150                               | "Sweeping at Pell's Timber Yard", 30        |
| `showroom` | Showroom Maker        | the Larkspur Road Showroom, next door | 360         | 30        | 160; 240, label "Garage and shop rent" | "Stacking boards at Pell's Timber Yard", 45 |

- **Unlock (same save):** while `career === "garage"`, `showroomOfferReady` runs after each delivery and at End Day. It passes when reputation ≥ **45**, beat `ww-showroom-offer` is not yet seen, and the trigger `showroom-offer` is not already queued (as Patisserie's `salonOfferReady`); `delivered` ≥ **14** stays only as a guard, since reputation 45 already needs 15+ deliveries. When it passes it queues `showroom-offer`.
- **Pacing:** offers run about one a day, so a player delivers about one piece a day. Each delivery gives +3 reputation on a pass and −1 on a Standard fail. A decent Standard player gets the offer on days 18–22 (late week 3), matching ADEEVA's Student Showcase and Patisserie's parlour key.

| player                     | reputation per delivery | offer lands |
| -------------------------- | ----------------------- | ----------- |
| pass rate 95%              | 2.8                     | day 17      |
| pass rate 88%              | 2.5                     | day 19      |
| pass rate 80%              | 2.2                     | day 22      |
| pass rate 70%              | 1.8                     | days 26–27  |
| Relaxed                    | —                       | ≈ day 16    |
| Challenging (75%, fail −3) | 1.5                     | days 28–34  |

- **Story beat `ww-showroom-offer`:** Bram jingles a second key. Choices use the typed story effect (`StoryBeat<StoryTrigger, "open-showroom">`, as ADEEVA and Thrift-Flip). **"Open the showroom"** dispatches `openShowroom`. **"Not yet"** sets the flag `showroom-later`, and the hub keeps a "Bram's old shop" card with the same Open button (`canOpenShowroom`), so the offer never expires.
- **`openShowroom`:** sets `career: "showroom"` and keeps coins, reputation, buzz, boards, upgrades, decor, log, active gigs and any run on the bench. It adds **Bram's Spare Board Pile** (2 long pine, 1 wide pine panel, 2 long beech; ≈ 42 coins of boards) and opens Season 1 on the next week start (`showroom.seasonStartDay`). The showroom rent applies from the first settlement on or after that day, so the week in progress still pays 100. Before `seasonStartDay` sets may be built, but there is no Open House. Illegal (same state reference) when already `showroom` or below the thresholds.
- **"Start here" (older players):** New Game gains a **Career** step between Trait and Difficulty using the shared `ui/newGame/CareerStep` with `careerDraft` and `careerFacts`. Cards: "Garage Workshop (start here if you're new)" and "Furniture Showroom (for makers who know the bench; suggested 12+)". The suggestion is a label, never a gate; Garage is preselected. A showroom start gets 360 coins, reputation 30, Bram's Spare Board Pile plus 2 more long pine, `seasonStartDay = 1`, and the intro beat `ww-intro-showroom` in place of `ww-key`. The first-commission coach starts off, and the first hub shows a one-time **"Want a quick bench tour?"** toggle that turns it back on.
- **Studio reputation:** `profile.startedAs` is fixed at New Game. `module.ts` switches from `fixedStartReputation` to `earnedReputation(..., (profile) => startOf(profile.startedAs))`, as ADEEVA's `careerReputation`; a missing `startedAs` (v1 save) means a start of 0. Opening the showroom never changes earned studio reputation.
- **Rest the shop:** on season day 1 the theme card (§10.7) also offers **"Rest the shop this season"** (`restShowroom`): rent 100, no Fair entry, no Open House sales, Ren's wage paused. Floor sets and rosettes are kept; the choice resets next season.

### 10.2 How play changes

A **season** is 14 days anchored at `seasonStartDay` (always a week start; `seasonDay = day − seasonStartDay + 1`), never at global week parity. Seasons cycle Spring → Summer → Autumn → Winter.

| Season day | What happens                                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–6, 8–12  | Working days: commissions and set runs; Ren takes jobs                                                                                                                                                                                                                  |
| 7          | Working day; at End Day **Open House** sells one floor set (below), then rent and Ren's wage                                                                                                                                                                            |
| 13         | **Fair Day**: the bench stays open until the Fair is staged (§10.6); staging uses the rest of the day. With no eligible set, it is an ordinary working day. Eligible sets are those made since the previous Fair Day, so Season 1 also takes sets made before it starts |
| 14         | Working day; staging here is late (−10 except Relaxed; costs 4 h); End Day: Open House, rent, next season                                                                                                                                                               |

- **Commissions keep coming** from all 16 clients (§10.8). Offers, the gig cap of 3 and buzz rules are the engine's. A commission due on Fair Day is due the next day instead.
- **Bench:** still one run at a time, and still one run type. `CommissionRun` gains `purpose: {kind: "commission"} | {kind: "set", setId, templateId, setJoint}`, the pattern of Patisserie's `BakeRun.purpose`. A set run's `brief` comes from Workshop's own `fairBrief(theme, booth)` (the same idea as Patisserie's, never imported), its `gigId` is `null` (the field widens to `string | null`), and its `design` holds the shared wood and slot choices with `productId: null`; the pieces come from the template.
- **Set part ids** are namespaced `"<pieceIndex>:<partId>"`. `pieceParts(run)` returns one flat part list, so placements, cuts, joints and sanding stay keyed by part id, and layout, saw, join and sand work unchanged. Per-piece quality groups the records by the prefix. `PlacedExtra` gains `piece: number`.
- **Matched cushions:** `cushion` stays one field. One fabric and one seam cover every seat in the set, +1 h in total.
- **Setting aside:** a commission follows the existing rule. A set run can be set aside only before its first saw line is recorded; after that `setAside` is refused (same reference) with "Finish the set first." Sets never touch `log` or `delivered`.
- **Showroom floor:** 2 bays (3 with the Hand Cart). Every finished set stands in a bay. `startSet` is refused while every bay is full: "The floor is full. Open House is on day 7."
- **Open House** (End Day of season days 7 and 14, 0 h): **at most one** floor set marked **For sale** goes home with a family for its set price (§10.3), +3 buzz. The player picks it on the floor; the oldest is the default. Other For-sale sets wait their turn and never spoil. The season's **Fair pick** is "Saved for the Fair" until the Fair is staged or skipped. A set marked **Keep on show** never sells and gives +2 buzz per Open House. With nothing For sale the card reads "A quiet Open House. Visitors loved the smell of fresh wood." and pays 0, with no penalty.
- **Hub additions:** a Season ribbon (season, theme, booth, days to Fair Day), the showroom floor scene, Ren's card, the Fair Board and the Rosette Rail (§10.7).

### 10.3 Matched sets (the set run)

`startSet {templateId}` (any working day, a free floor bay, an empty bench) opens a run with a set purpose and stages `design → timber → layout → saw → join → sand → finish → review`. The checklist reads "Ready for the Fair" against the season theme and booth (§10.6), as guidance only.

| id              | name            | pieces                                       | count | booths | pine boards | hours (with Ren) |
| --------------- | --------------- | -------------------------------------------- | ----- | ------ | ----------- | ---------------- |
| reading-corner  | Reading Corner  | bookshelf, footstool                         | 2     | 1–2    | 31          | 12 (10)          |
| hallway-welcome | Hallway Welcome | coat-rack, footstool                         | 2     | 1–2    | 25          | 12 (10)          |
| cottage-bedroom | Cottage Bedroom | cottage-bed, bedside-table                   | 2     | 1–2    | 60          | 12 (10)          |
| breakfast-nook  | Breakfast Nook  | breakfast-table, dining-chair ×2             | 3     | 2–4    | 54          | 15 (13)          |
| garden-corner   | Garden Corner   | window-bench, planter-box ×2                 | 3     | 2–4    | 52          | 15 (13)          |
| playroom        | Playroom Pals   | toy-chest, step-stool, bookshelf             | 3     | 2–4    | 64          | 16 (14)          |
| family-table    | Family Table    | breakfast-table, dining-chair ×3             | 4     | 4      | 70          | 18 (16)          |
| guest-room      | Guest Room      | cottage-bed, bedside-table ×2, wall-cupboard | 4     | 4      | 104         | 19 (17)          |

- **Hours:** design 1 + timber 1 (Ren 0) + per piece saw 2 and join 2 (a **twin**, a repeat of a product already in the set, saws in 1) + sand 1 (Ren 0) + finish 1, +1 for matched cushions. A set spans 1–2 days.
- **Matchable pairs:** each template lists `matchablePairs` in content, the most show-surface pairs a legal layout can put on shared boards (§10.4). The bed's headboard and footboard each fill a wide panel alone, so the Cottage Bedroom has 0.
- **Matched by design (`setStyle`):** one wood, one finish (and paint), and one choice per slot (edge, legs, accent) applied to every piece that has that slot. The design preview shows the whole set side by side. Changing the wood clears the board plan, as §2.
- **Set joint:** each product marks its **show joints** in content (`JointDef.show`: the ones a visitor can see; leg joints never are). At design the player picks one **set joint**, Peg, Slot or Comb, and every show joint in the set uses it. Other joints keep their own kind.
- **Piece quality** is §5's formula per piece (woodFit against the theme tags or `natural`); **set quality** is the mean piece quality. Set spend = boards + finish price × pieces + extras + fabrics.
- **Set price** = `round(Σ showPrice × (0.6 + 0.6 × setQuality ÷ 100) × fineWood × harmony × rosette)`: fineWood = 1 + 0.15 per hammer above 1; harmony = 1.1 when the set's Harmony Table score (§10.6, computable without a Fair) is ≥ 80; rosette = 1.1 only for the set that won a Silver Rosette or better, whose floor price is recomputed when the Fair settles. `showPrice` per product is in §10.8.

### 10.4 Mini-game twists (the existing games, used in fresh ways)

| Twist                      | Reuses                        | What is new                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Plan the whole set**     | Plan your boards (§3.1)       | Every part of every piece goes onto the set's boards, grouped by piece in the tray. A **board filmstrip** shows one board large and every board as a thumbnail to switch to (tap, or ← / →); on the keyboard a picked part goes to another board with **Move to board ▸**. **Matched faces** = achieved pairs ÷ `template.matchablePairs`, capped at 1; a pair is two show-surface parts of different pieces on one board (two chair seats side by side on one panel). Show me never matches faces. Set runs add the Assist **Plan the rest**: it places every unplaced part legally, each capped at 0.9 for wood lines, and never matches faces. |
| **Saw the twin**           | Saw (§3.2)                    | A twin's lines show the first piece's cut as a faint ghost to follow. The ghost lives in UI session state only: it is never saved and is gone after a reload. Scoring is unchanged; the twin takes 1 h instead of 2. A twin also offers **Saw it like my first**: each line records the first piece's matching line accuracy − 0.05, with no tracing. Matching Jigs widen the twin's tolerance ×1.15.                                                                                                                                                                                                                                             |
| **Matching joints**        | Join (§3.3)                   | Show joints use the set joint's close-up; the first one seated is pinned beside the mat as "your first joint" to compare. Comb earns the most Set joint points (§10.6) and has the tightest gate.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Even shine**             | Sand (§3.4)                   | All show surfaces of the set in one stage; a **shine bar** shows each piece's smoothness side by side. **Evenness** = `clamp(100 − 2 × (max − min piece quality), 0, 100)`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **One finish, set extras** | Finish (§3.5)                 | One finish for the set; extras are placed per piece. **Matching hardware** = share of placed extra kinds that appear on every piece × 100, leaving out each product's own required extras (`needs`, such as the wall cupboard's hinges and the coat rack's hooks); 70 ("simple and calm") with no other extras.                                                                                                                                                                                                                                                                                                                                   |
| **Arrange the floor**      | `boardLayout` placement rules | A top-down shop floor (300 × 200) with one rug per bay: drag each piece's footprint, in bounds, no overlap, turned in 90° steps, keyboard as §3.1. A set wholly on its own rug gives +2 buzz at Open House. 0 h; otherwise unscored.                                                                                                                                                                                                                                                                                                                                                                                                              |

### 10.5 Ren, the apprentice

- **Who:** Ren Calloway, 19, from the evening woodwork club, introduced by Bram in `ww-ren-hello` at the first showroom season start. Ren is an adult, cheerful and learning; nobody scolds anyone.
- **Hire:** **Take Ren on** on Ren's card. The wage is 40 a week (× rent multiplier: Relaxed 0, Challenging 60), following ADEEVA's `assistantHired` and `assistantPaidThroughDay`: taking Ren on pays the current week's wage unless `paidThroughDay` already covers today (refused when coins are short), and each weekly settlement with Ren hired pays the next week ahead as a money line (engine `weekSettlement` and `weekMoneyLines`). **Give Ren the week off** stops the wage from the next settlement; Ren can be taken on again at any time, so a week off just before rent day saves nothing. Ren rests with the shop too: no hire and no jobs in a rested season. Showroom career only.
- **Jobs** (a 56 px **Hand this to Ren** button on the stage card, for commissions and sets; at most **2 a day**, 3 with Ren's Own Bench; none once the Fair is staged):

| job              | stage  | effect                                                                                                    |
| ---------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| Fetch the boards | timber | Ren buys "what fits my plan" with the player's coins; the trip hour is 0                                  |
| Sand it          | sand   | every surface records Ren's accuracy; stage hours 0                                                       |
| Peg joints       | join   | every Peg joint is seated at Ren's accuracy; join hours −1, never below 0; with Ren's Own Bench, Slot too |

- **Records:** `SandRecord` = the hand record | `{byApprentice: true, accuracy}`. Ren's `JointRecord` = `{offsetMm: 0, angleDeg: 0, goodTaps: taps, accuracy, byApprentice: true}`; the parser and the join action accept a record with `byApprentice` only when it was written by `apprenticeJob`. Ren's records are not Assist and are never capped further.
- **Skill:** level = `1 + floor(jobsDone ÷ 8)`, up to 3; Ren's accuracy is 0.74 / 0.80 / 0.86, fixed, never random. Ren never saws, designs, finishes or does Comb joints ("Ren is still learning those").
- **Cost:** for a decent player (≈ 0.90), Ren's sanding costs ≈ 2.4 quality at level 1. On an all-Peg piece (birdhouse, bookshelf) Ren's pegs cost ≈ 5–6 quality at level 1 (0.35 × 0.16) and ≈ 1.4 at level 3. An 8-year-old on Assist (0.70) gains a little. Ren is a time-for-quality trade, never a trap.
- **Art:** Ren is drawn with the studio `AvatarFigure` in apron and goggles; a handed job plays a 2 s scene (dust puff, mallet tock) that reduced motion turns into a fade.

### 10.6 The Larkspur Craft Fair (the event moment, like ADEEVA's runway)

1. **Fair Board** (like ADEEVA's `CollectionBoard`): the theme card (2 tags, a 4-colour palette, 2 mood words) and one slot for a set finished this season that fits the booth. It opens on **"Bram's pick"**: the set with the most theme tags, then the highest quality, ties to the newer set. A set finished on Fair Day can be picked the same day. With no such set by the end of day 14 the Fair is skipped with `ww-fair-skipped`; nothing is lost.
2. **Planner** (`stageFair {plan}`, one action; `useRovingRadio` groups): the **reveal order** of the pieces ("Save your favourite for last"), a **backdrop** (`linen-drape` "calm", `bunting` "cheerful", `lantern-string` "cosy", electric lights) and **music** (`fiddle-folk` "lively", `acoustic-guitar` "warm", `wind-chimes` "gentle", `brass-band` "bright"), plus a **maker's note** card ("From one board", "Made with Ren", "For Larkspur homes"), flavour only. On Relaxed it opens on "Hattie suggests…" (the theme's best backdrop and music, the best piece last), confirmed with one tap. On Standard and Challenging Hattie names the backdrop only; the player matches the music to the theme's mood word and chooses the order.
3. **The reveal** (Fair Day; day 14 is late): a booth on the green under a striped canopy, bunting swaying. Two volunteer neighbours (studio `Avatar`) wheel each piece in on a padded trolley under a dust sheet; the player lifts the sheet with a tap, Enter or Space, or it lifts by itself after 3 s. Each lift gives a wood-shine sparkle, and the volunteers dress the piece as it would stand at home: a teapot on the table, books on the shelf, basil in the planter, a quilt on the bed (nobody sits on anything). At the last lift one Story Wall client says one delighted line, falling leaves come down (`PetalFall` with a leaf shape) and visitors gather to clap. Then four panel cards flip up and count. Total ≈ 30 s; **Skip** after the first lift. Reduced motion shows crossfaded stills with captions and the same taps (ADEEVA's `STILL_MS`).
4. **Panels** (each 0–100 through the engine's `panel()` and `subScore`; every member is an adult neighbour; no one is called a judge):

| panel (members)                                                                                              | parts (weight)                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Craft Bench** (Uncle Bram; Mr. Pell of the timber yard; Hattie Rowe, chair maker and Fair organiser)       | Craft 0.5 = set quality · Joints 0.2 = mean joint accuracy × 100 · Set joint 0.1 = Peg 60 / Slot 80 / Comb 100 · Fine wood 0.2 = 60 / 80 / 100 for 1 / 2 / 3 hammers                                                     |
| **Comfort Corner** (Rosalind of the Corner Cup; Grandma Esi)                                                 | Smooth to touch 0.4 = mean sand score × 100 · Cosy touches 0.3 = share of seat pieces with a cushion (no seats: share of pieces tagged `cosy`) · Solid look 0.3 = share of pieces tagged `sturdy` or in a 2+ hammer wood |
| **Harmony Table** (Luna, mural painter; Ms. Ingrid, librarian)                                               | Matched faces 0.3 · Evenness 0.3 · Palette 0.2 = share of the set's colours in the theme palette · Matching hardware 0.2 (all §10.4). With `matchablePairs` 0, Matched faces is left out and Evenness weighs 0.6         |
| **Story Wall** (three past clients drawn each season: adults, or a family pair such as "Milo and Aunt Noor") | Theme 0.4 = share of theme tags in the set's tags · Booth setting 0.3 = engine `stagingScore` (music 70/20 + backdrop 30/10) · Reveal 0.3 = engine `closerStrength` over piece qualities in reveal order                 |

"Comfort" means inviting and smooth to the touch: no panel member sits, stands or climbs on a piece.

5. **Overall** = engine `overallScore` (mean of the 4 panels) − `lateShowPenalty`. **Rosettes** come from fixed bands, never placings: Maker's Ribbon (< 55, "The green clapped for every piece!"), Ribbon of Merit (55–69), Silver Rosette (70–84), Gold Rosette (85–94), Oak Leaf Rosette (95+). Verdict words: Delighted ≥ 85, Loved it ≥ 70, Enjoyed it ≥ 55, Warmly cheered below.
6. **Rewards (`fairPrize`):** coins `25 + 10 × booth + 3 × max(0, overall − 50)`; reputation from the engine's `showReputation` with `GENTLE_SHOW_SETBACKS` (below 50: 0, or −1 on Challenging); buzz `round(overall ÷ 10)`. **Fair Notes** give one praise line per panel from its best part and one "Next time, try…" tip from the engine's `weakestTip` and `qualityTipLine` on the weakest part. The rosette goes to `fair.rosettesBySet[setId]` and, if better, `fair.rosetteRail[themeId]`. The set returns to the floor For sale at its recomputed price.
7. **Booths (progression):** the next booth opens when overall ≥ **60** (≥ 65 on Challenging). On Relaxed it moves up only when the player taps **"Move to a bigger booth?"** on the results. There is no step back.

| booth | name         | set sizes | Ready for the Fair (Std; +6 Challenging) | extra             |
| ----- | ------------ | --------- | ---------------------------------------- | ----------------- |
| 1     | Corner Stall | 2         | 72                                       | —                 |
| 2     | Green Pitch  | 2–3       | 74                                       | —                 |
| 3     | Big Canopy   | 3         | 76                                       | `ww-booth-canopy` |
| 4     | Oak Pavilion | 3–4       | 78                                       | Rosette Rail goal |

"Ready for the Fair" is a checklist mark only; the booth card says "Ready or not, the green is glad to see you."

### 10.7 Fair themes and the Rosette Rail

On season day 1 one card offers the season's 2 themes (ADEEVA's `NextSeasonPicker` pattern) and Rest the shop (§10.1); Trendsetter sees next season's pair early. A theme's two mood words name its best backdrop and music. Every palette colour comes from a wood tone, paint, finish, extra or cushion fabric.

| id              | season | name            | tags             | palette                              | mood words       | best backdrop  | best music      |
| --------------- | ------ | --------------- | ---------------- | ------------------------------------ | ---------------- | -------------- | --------------- |
| orchard-picnic  | Spring | Orchard Picnic  | rustic, natural  | honey-wood, sage, mustard, ivory     | cheerful, lively | bunting        | fiddle-folk     |
| kite-festival   | Spring | Kite Festival   | playful, modern  | sky, coral, mustard, pale-wood       | cheerful, bright | bunting        | brass-band      |
| seaside-cabin   | Summer | Seaside Cabin   | natural, cosy    | pale-wood, sky, teal, ivory          | calm, gentle     | linen-drape    | wind-chimes     |
| little-loft     | Summer | Little Loft     | modern, classic  | pale-wood, charcoal, teal, ivory     | calm, bright     | linen-drape    | brass-band      |
| harvest-barn    | Autumn | Harvest Barn    | rustic, sturdy   | honey-wood, red-wood, mustard, coral | cosy, lively     | lantern-string | fiddle-folk     |
| quiet-library   | Autumn | Quiet Library   | classic, elegant | red-wood, navy, ivory, gold          | calm, warm       | linen-drape    | acoustic-guitar |
| snowy-lodge     | Winter | Snowy Lodge     | cosy, sturdy     | dark-wood, ivory, navy, sage         | cosy, gentle     | lantern-string | wind-chimes     |
| lantern-evening | Winter | Lantern Evening | elegant, cosy    | dark-wood, lavender, gold, blush     | cosy, warm       | lantern-string | acoustic-guitar |

**Rosette Rail:** a rail over the showroom counter with one hook per theme, showing the best rosette won there. The finale beat `ww-rosette-rail` plays once each of the 4 seasons has a Silver Rosette or better on one of its hooks and a Gold has been won (at least 4 seasons; about 4–6 for a decent player). Gold or better on all 8 hooks plays `ww-every-hook-gold`. Play continues afterwards.

### 10.8 Content, about twice the slice

| kind         | slice | added | total | added ids                                                                                                                       |
| ------------ | ----- | ----- | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| woods        | 12    | 8     | 20    | alder, linden, sycamore, elm, chestnut, apple, pear, hickory                                                                    |
| products     | 7     | 7     | 14    | dining-chair, breakfast-table, cottage-bed, footstool, planter-box, coat-rack, wall-cupboard                                    |
| part options | 10    | 6     | 16    | clipped-corners, scallop-edge, block-legs, sled-legs, heart-cutout, moon-cutout                                                 |
| finishes     | 6     | 4     | 10    | milk-paint, limed-wax, colour-wash, midnight-stain                                                                              |
| extras       | 8     | 8     | 16    | cup-handle, ceramic-knob, rope-handle, brass-corners, little-wheels, heart-carving, moon-stencil, bird-carving                  |
| clients      | 8     | 8     | 16    | nana-pearl, coach-farrah, the-okonkwos, grandma-esi (Charmer), mr-haruto, kit-and-zara (Trendsetter), dr-amara, mrs-bellweather |
| upgrades     | 4     | 4     | 8     | matching-jigs, hand-cart, ren-bench, booth-awning                                                                               |
| decor        | 3     | 3     | 6     | shop-sign (one of 8 paints, 60), window-ferns (50), rocking-horse (display only, 120)                                           |
| story beats  | 8     | 19    | 27    | table below                                                                                                                     |
| new kinds    | —     | 33    | 33    | 2 careers, 8 set templates, 8 Fair themes, 4 booths, 3 backdrops, 4 music, 3 maker's notes, 1 apprentice                        |

**Woods** (§4.1 columns: price, hardness, hammers, knotty, tone, tags, unlock rep): alder 7, 0.25, 1, no, red-wood, rustic/natural, 14 · linden 7, 0.15, 1, no, pale-wood, playful/natural, 16 · sycamore 10, 0.45, 2, no, pale-wood, modern/classic, 18 · elm 11, 0.45, 2, yes, honey-wood, rustic/sturdy, 20 · chestnut 12, 0.45, 2, no, honey-wood, classic/cosy, 24 · apple 14, 0.6, 3, yes, red-wood, playful/cosy, 28 · pear 16, 0.55, 3, no, red-wood, elegant/cosy, 32 · hickory 15, 0.65, 3, no, honey-wood, sturdy/rustic, 34.

**Products** (parts W×H cm; canonical layouts leave room for knots, §3.1. `showPrice` of slice products: birdhouse 25, step-stool 40, plant-stand 40, bookshelf 55, toy-chest 60, bedside-table 60, window-bench 70.)

| id              | parts (W×H)                                                            | slots              | joints (★ show)           | show surfaces        | seat | canonical layout                                                       | pine | showPrice |
| --------------- | ---------------------------------------------------------------------- | ------------------ | ------------------------- | -------------------- | ---- | ---------------------------------------------------------------------- | ---- | --------- |
| dining-chair    | seat 40×36, back 38×14, leg ×4 44×5, rail ×2 36×6                      | edge, legs, accent | Slot ×4, Peg ×2 ★ (back)  | seat, back           | yes  | panel: seat + back; long: 4 legs in 2 rows + 2 rails                   | 16   | 50        |
| breakfast-table | top 84×38, leg ×4 70×6, rail ×2 45×8                                   | edge, legs         | Slot ×4, Peg ×2 ★ (rails) | top                  | no   | panel: top; long 1: 3 legs; long 2: leg + 2 rails                      | 22   | 80        |
| cottage-bed     | headboard 84×38, footboard 84×28, side rail ×2 110×9, slat ×3 80×8     | edge, accent       | Comb ×4 ★, Peg ×3         | headboard, footboard | no   | panel 1: headboard; panel 2: footboard; long 1: rails; long 2–3: slats | 38   | 90        |
| footstool       | top 36×26, leg ×4 22×5                                                 | edge, legs         | Slot ×4                   | top                  | yes  | panel: top; short: 4 legs                                              | 13   | 35        |
| planter-box     | side ×2 50×18, end ×2 18×18, base 46×16                                | edge, accent       | Comb ×4 ★                 | side ×2              | no   | long 1: 2 sides; long 2: base + 2 ends                                 | 12   | 35        |
| coat-rack       | back 80×14, bracket ×2 14×12, shelf 80×12; needs coat-hook ×3          | edge, accent       | Peg ×2, Slot ×2 ★ (shelf) | back                 | no   | long 1: back + 2 brackets; long 2: shelf                               | 12   | 40        |
| wall-cupboard   | side ×2 48×16, top 40×16, base 40×16, door 44×36; needs brass-hinge ×2 | edge, accent       | Comb ×4 ★                 | door                 | no   | long 1: 2 sides; long 2: top + base; panel: door                       | 22   | 60        |

Slice show joints: bookshelf Peg ×6, toy-chest Comb ×4, bedside-table Peg ×2 (rails), window-bench Slot ×2 (rails); the rest have none. The cottage bed is a low single bed, always shown made up with a quilt and empty.

**Part options:** every option reshapes inside the part's rectangle, so no part list, joint list or canonical layout changes. `clipped-corners` Clipped corners (modern, classic; 4 short straight corner cuts) · `scallop-edge` Scalloped edge (playful, cosy; 5 shallow arcs) · `block-legs` Block legs (sturdy, modern; straight, with a square foot notch) · `sled-legs` Sled legs (rustic, modern; a curved runner foot on each leg) · `heart-cutout` Heart cut-out (cosy, playful; closed curve) · `moon-cutout` Moon cut-out (elegant, playful; closed crescent).

**Finishes:** `milk-paint` Milk Paint 6 (rustic, playful; one of the 8 paints, softened) · `limed-wax` Limed Wax 6 (natural, rustic; ivory + wood tone) · `colour-wash` Colour Wash 7 (cosy, playful; a paint + wood tone) · `midnight-stain` Midnight Stain 7 (elegant, modern; charcoal).

**Extras:** `cup-handle` Cup Handle 4 (classic, modern; charcoal) · `ceramic-knob` Painted Knob 3 (playful, cosy; sky) · `rope-handle` Rope Handle 3 (rustic, natural) · `brass-corners` Brass Corners 5 (elegant, sturdy; gold) · `little-wheels` Little Wheels 4 (playful, sturdy; charcoal; `allowedOn` excludes every seat or step product: step-stool, footstool, dining-chair, window-bench) · `heart-carving` Carved Heart 4 (cosy, playful) · `moon-stencil` Moon Stencil 2 (elegant, playful; gold) · `bird-carving` Carved Bird 4 (natural, playful).

**Clients** (rolled as §4.5; the cheapest valid pine build of each client's dearest product fits the lowest budget roll with 2–7 coins to spare: Pearl 16, Farrah 30, Okonkwos 27, Esi 32, Haruto 34, Kit and Zara 29, Amara 36, Bellweather 43. New clients enter the draw pool only at reputation ≥ 14 through `freeClients`, so early seeded draws do not move.)

| id              | who                                                | gate / min rep   | products                        | required tags   | favoured colours          | avoid    | required extras | budget | fee     | days | min Q |
| --------------- | -------------------------------------------------- | ---------------- | ------------------------------- | --------------- | ------------------------- | -------- | --------------- | ------ | ------- | ---- | ----- |
| nana-pearl      | Nana Pearl, who grows herbs on her balcony         | — / 14           | planter-box                     | natural         | sage, honey-wood, mustard | charcoal | —               | 20–30  | 55–70   | 4–6  | 70    |
| coach-farrah    | Coach Farrah, junior football club                 | — / 16           | coat-rack                       | sturdy, playful | sky, mustard, coral       | —        | name-plaque ×1  | 32–45  | 70–85   | 4–6  | 72    |
| the-okonkwos    | The Okonkwo family, new to the corner house        | — / 20           | breakfast-table, dining-chair   | cosy, sturdy    | honey-wood, sage, ivory   | black    | —               | 30–45  | 80–100  | 5–7  | 74    |
| grandma-esi     | Grandma Esi, who cooks Sunday lunch for the street | Charmer / 16     | breakfast-table                 | cosy, classic   | mustard, coral, red-wood  | —        | name-plaque ×1  | 35–50  | 90–110  | 5–7  | 74    |
| mr-haruto       | Mr. Haruto, who mends old bicycles                 | — / 24           | footstool, wall-cupboard        | modern, classic | teal, charcoal, pale-wood | coral    | wood-knob ×1    | 40–55  | 85–105  | 5–7  | 76    |
| kit-and-zara    | Kit and Zara, who make the Larkspur zine           | Trendsetter / 20 | coat-rack, footstool, bookshelf | modern, playful | coral, teal, mustard      | —        | star-stencil ×2 | 32–45  | 95–115  | 4–6  | 76    |
| dr-amara        | Dr. Amara, the village vet                         | — / 28           | wall-cupboard                   | classic, sturdy | navy, ivory, red-wood     | lavender | brass-knob ×1   | 40–55  | 95–115  | 5–7  | 78    |
| mrs-bellweather | Mrs. Bellweather, who runs the hilltop guesthouse  | — / 32           | cottage-bed                     | cosy, classic   | blush, ivory, honey-wood  | black    | —               | 50–70  | 130–160 | 6–8  | 80    |

| client          | request                                                    | delighted                                            |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| nana-pearl      | My basil wants a proper home. A wooden box, please.        | The basil looks proud. So do I!                      |
| coach-farrah    | Muddy coats everywhere! Our club needs a strong coat rack. | Every coat on a hook. The team cheered!              |
| the-okonkwos    | Our new kitchen is empty. Could you make us a table?       | Our first breakfast at home. It feels like ours now. |
| grandma-esi     | Sunday lunch needs a table. Warm and welcoming, please.    | Everyone fits, and everyone's smiling. Wonderful.    |
| mr-haruto       | Something neat for my workshop. Simple lines, please.      | Neat as a well-tuned bell. Thank you.                |
| kit-and-zara    | Our zine needs something bold. Surprise us!                | It's going on our next cover!                        |
| dr-amara        | A cupboard for leads and treats. Sturdy, please.           | The puppies sniffed it and approved. Perfect.        |
| mrs-bellweather | My guest room needs a bed. Cosy and classic, please.       | Guests will sleep like logs. Charming work.          |

Near-miss lines follow the §4.5 tone in content. Delivery scenes reuse the 4 backdrops: Garden (Pearl, Farrah), Café (Esi, the Okonkwos), Bedroom (Bellweather), Library (Haruto, Amara, Kit and Zara).

**Upgrades** (showroom only, gated by Fair progress, since every showroom player is already past reputation 45; 690 coins in all)

| id            | name                 | price | opens               | effect                                     |
| ------------- | -------------------- | ----- | ------------------- | ------------------------------------------ |
| matching-jigs | Matching Jigs        | 160   | booth 1             | twin saw tolerance ×1.15, twin joints ×1.1 |
| hand-cart     | Showroom Hand Cart   | 180   | booth 2             | +1 bay (build ahead or Keep on show)       |
| ren-bench     | Ren's Own Bench      | 200   | Ren reaches level 2 | Ren takes 3 jobs a day, and Slot joints    |
| booth-awning  | Striped Booth Awning | 150   | booth 3             | Story Wall +5 (capped at 100)              |

**Story beats** (player lines voiced by trait as §4.7)

| id                  | trigger                          | lines (short)                                                                                                |
| ------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| ww-showroom-offer   | showroom-offer                   | **Bram:** "The old bicycle shop next door is empty. Fancy a showroom?" / choice: Open the showroom · Not yet |
| ww-intro-showroom   | intro-showroom                   | **Bram:** "Garage for making, shop for showing. Both yours." / **You:** (byTrait)                            |
| ww-showroom-open    | showroom-opened                  | **Narrator:** Dust sheets off; the bell over the door rings. / **You:** (byTrait)                            |
| ww-ren-hello        | first showroom season start      | **Bram:** "This is Ren. Keen as mustard." / **Ren:** "I can fetch boards and sand. I'll learn the rest."     |
| ww-first-set        | first set started                | **Bram:** "A set is one idea, told a few times. Same wood, same finish."                                     |
| ww-first-open-house | first Open House                 | **Narrator:** Visitors run their hands along your work. / **You:** (byTrait)                                 |
| ww-fair-invite      | first Fair season                | **Hattie Rowe:** "One booth, one set, and tea all day. Every maker gets a rosette."                          |
| ww-first-fair       | first Fair done                  | **Narrator:** The dust sheet lifts and the green claps. / **You:** (byTrait)                                 |
| ww-gold-rosette     | first Gold Rosette or better     | **Mr. Pell:** "Boards from my yard never looked so fine."                                                    |
| ww-booth-canopy     | booth 3 reached                  | **Hattie:** "The Big Canopy! Room for a whole family's table."                                               |
| ww-booth-pavilion   | booth 4 reached                  | **Bram:** "The Oak Pavilion. I showed a rocking chair here, long ago."                                       |
| ww-ren-level-2      | Ren reaches level 2              | **Ren:** "I can sand with my eyes nearly closed. Nearly."                                                    |
| ww-ren-level-3      | Ren reaches level 3              | **Ren:** "Peg joints snug as anything. Thanks for showing me."                                               |
| ww-fair-skipped     | Fair skipped                     | **Hattie:** "We kept your pitch warm. See you next season!"                                                  |
| ww-tight-season     | shop grace used (Standard)       | **Bram:** "Lean fortnight? I'll cover the shop half of the rent this once."                                  |
| ww-rosette-rail     | Silver+ in all 4 seasons, a Gold | **Narrator:** Rosettes hang along the whole rail. / **Bram:** "Proudest garage on Larkspur Road."            |
| ww-every-hook-gold  | Gold or better on all 8 hooks    | **Bram:** "Gold on every hook. I'm telling the whole street."                                                |
| ww-trait-kit-zara   | Kit and Zara first pin an offer  | **Kit:** "Our zine wants the boldest piece on Larkspur Road."                                                |
| ww-trait-esi        | Grandma Esi first pins an offer  | **Grandma Esi:** "A table big enough for the whole street's stories."                                        |

**Hint lines (≤ 12 words):** "Fit matching faces on one board for a set." · "Follow your first cut to make a matching twin." · "Pick one joint for every piece you can see." · "Sand each piece the same for an even shine." · "Put each set on its own rug." · "Hand a simple job to Ren. Two a day." · "Pick a set you finished this season." · "Choose a backdrop, some music, and who comes last."

### 10.9 Economy sanity checks (Standard unless noted)

- **Garage baseline at reputation 45+:** open clients average a fee of ≈ 95. A pass pays ≈ 1.18 × fee ≈ 112 for ≈ 30 of boards and finish (net ≈ +82); a soft fail pays ≈ 38 − 30 = +8. At an 85% pass rate a 10 h commission nets ≈ +71. With the Garage Skylight's 11 h days a fortnight is 154 h ≈ 15.4 commissions ≈ +1093, minus rent 200 ≈ **+893**.
- **Showroom fortnight (decent, Ren hired, one Breakfast Nook at booth 2):** 13 working days × 11 h = 143 h, plus ≈ 20 h of Ren's jobs, minus the set's 13 h ≈ 150 h ≈ 14.8 commissions ≈ +1050. The Nook in pine costs ≈ 66 (54 boards + oil × 3) and, after a Silver Rosette, sells for `180 × 1.128 × 1.1 × 1.1 ≈ 246`: +180. The Fair (overall ≈ 80) pays 25 + 20 + 90 = 135. Rent −320, Ren −80. **≈ +965 ≈ 1.08 × garage**; without Ren ≈ +904 (≈ 1.0 ×). Bench hours on Fair Day before staging add a little; rosettes, Fair reputation (+7) and buzz are the rest of the reward.
- **Sets against commissions:** per hour a set beats a commission (at quality 88 with harmony and rosette, × 1.365 in all: Cottage Bedroom ≈ +137 for 10 h, Guest Room ≈ +243 for 17 h, a commission ≈ +71 for 10 h), and sets carry no brief, fail or deadline. So the floor caps them: one set goes home per Open House, two a fortnight. A fortnight with the best set at each Open House and commissions in the other hours lands at Guest Room ×2 ≈ 1.32 ×, Cottage Bedroom ×2 ≈ 1.26 ×, the Nook ≈ 1.08 ×. The set-max bot must stay ≤ 1.3 ×; if it lands above, D6 lowers the wall cupboard's `showPrice` 5 at a time. The Hand Cart adds a bay for building ahead or Keep on show, never a third sale.
- **Fine wood in a set:** hickory makes the Nook's boards ≈ 135 (2.5 ×) but its price × 1.3 (≈ 264 before harmony and rosette, against 203 in pine), lifts Fine wood from 60 to 100 (+8 Craft Bench), and narrows saw and join to 0.74. A trade, not a trap.
- **Decent panels** (set quality 88, joints 0.88, Slot set joint, pine, sand 0.88, one of two chairs cushioned, matched faces 0.67, piece spread 4, palette 0.75, matching hardware, one theme tag, Hattie's backdrop with the music matched by mood word, best piece last): Craft ≈ 44 + 18 + 8 + 12 = 82; Comfort ≈ 35 + 15 + 30 = 80; Harmony ≈ 20 + 28 + 15 + 20 = 83; Story ≈ 20 + 30 + 27 = 77. **Overall ≈ 80: Silver Rosette**, and the booth advances.
- **Other players:** full Assist (quality 79, joints 0.7, Show me and Plan the rest so matched faces 0) ≈ 72 (Silver, advances). A careless set (off theme and palette, no matched faces or cushions, wrong backdrop and music) ≈ 58 (Merit, stays). Mastery (quality 93, Comb, both theme tags, faces 1.0, every seat cushioned) ≈ 95 (Oak Leaf in reach).
- **Pass rate target 75–90%:** decent quality is ≈ 88 ± 4.5 (pine ≈ 91, 3-hammer woods ≈ 87). By minimum quality a decent piece passes ≈ 99% up to 78, 96% at 80 and 91% at 82 (Lindqvist); tag, extra or deadline slips cost ≈ 8%. Over the 16-client pool that is **≈ 84%**. A Ren-sanded piece (−2.4) still clears every minimum up to 78; a Ren-pegged birdhouse or bookshelf (−5.6 at level 1) still clears Grandpa Teodor (55) and Ms. Ingrid (65). Minimums are read from `content/client.ts`, never from this doc; if the simulation lands outside 75–90%, the minimum quality of the 4 highest new clients moves ±2 at a time.
- **No bankruptcy spiral:** the weekly costs are rent 160 + Ren 40 = 200, and 6 shifts pay 270. A week of all soft fails (7 × 8 = 56) loses ≈ 144, but Ren's week off, **Rest the shop** (rent 100) and shifts turn it round: 3 shifts (135) + 4 soft fails (32) − 100 = +67. **Shop grace** (Standard, once per season): if coins after rent would go below 0, Bram covers 60 and `ww-tight-season` plays. Floor sets never spoil and wait for the next Open House.
- **Relaxed is always recoverable:** rent and wage are ×0, every commission passes, the shift pays 45 and every Fair pays at least 35 coins and a ribbon. Coins never fall at a week's end.
- **Challenging:** rent 240, Ren 60, minimums +6, a fail pays 0 and costs −3 reputation, booths need 65. 6 shifts (270) cover the rent with Ren on a week off, and the existing A Lean Week beat points there. A decent player passes ≈ 75–80%.
- **Unlock pacing:** decent Standard on days 18–22; ≈ 70% pass on days 26–27; Relaxed ≈ day 16; Challenging ≈ days 28–34 (§10.1).

### 10.10 Save migration (schema 1 → 2)

- `SCHEMA_VERSION = 2`. A new `core/saveMigrations.ts` exports `SAVE_MIGRATIONS = { 1: addShowroomFields }` (the empty map leaves `save.ts`), passed to the engine's `parseSaveWith` as ADEEVA, Patisserie and Thrift-Flip do.
- `addShowroomFields(raw)` is pure and returns a new object. It adds `career: "garage"`, `showroom: null`, `fair: null`, `apprentice: null` and `profile.startedAs: "garage"`. When `activeRun` is not null it adds `purpose: {kind: "commission"}` and `piece: 0` to each placed extra; part ids, `gigId`, `brief`, `design`, `cushion` and every hand-made joint and sand record stay as they are (a record without `byApprentice` is hand work). Calendar, gigs, briefs, boards with their knots, upgrades, decor, log, `delivered`, story (`seen`, `flags`, `queue`), trends and RNG are kept, so an in-progress commission continues exactly. Wood, product, option, finish and extra id unions are widened, never narrowed.
- v2 shapes: `showroom = {seasonStartDay, seasonNumber, themeId, rested, floor: FloorSet[], graceSeason, nextSetNumber}`, where a `FloorSet` is `{setId, templateId, madeDay, pieces, quality, harmony, price, forSale, rug}`; `fair = {booth, pickSetId, results, rosetteRail: Record<FairThemeId, RosetteId | null>, rosettesBySet}`; `apprentice = {hired, paidThroughDay, jobsDone, jobsToday}`. The parser rejects a showroom save with `showroom: null`, a garage save that has one, a set-purpose run in a garage save, and a `byApprentice` record without a hired apprentice.
- `earnedReputation` accepts version ≤ 2, so `reputationOf` reads both. An eligible v1 player sees `ww-showroom-offer` after their next delivery or End Day; the migration itself never queues a beat or grants anything.
- **Fixtures** (committed v1 saves captured from the current build): fresh on day 1; mid-commission at join with 2 joints seated and a cushion chosen; mid-finish with placed extras that carry no `piece` field; at the threshold (reputation 45, 14 delivered, 3 active gigs); and a full rack with spare pieces, all upgrades and decor. Each loads, continues to a delivery and End Day, and saves as v2; the threshold one gets the offer and opens the showroom. A deep-frozen fixture proves the input is never mutated. v3 and damaged saves are reported, never reset.
- **Slice stays still:** every slice-era seeded test passes unchanged, since new clients only join the draw at reputation ≥ 14.

### 10.11 Safety notes for the showroom and the Fair

- **Kind fair, not a TV format.** On screen it is a "Craft Fair" with "panels" of named neighbours. Never shown: judge, elimination, rounds, winner, loser, challenge, "going home", countdowns, rivals or rankings. Neighbouring stalls are scenery and never scored. Every set gets a rosette from fixed bands; lines praise first and the one tip starts "Next time, try…".
- **No real technique.** Twin sawing, set joints and even shine are game rules with game numbers. There are no power tools anywhere, and Ren never uses one. The §8 Saw line and hub footer stay, and Ren's card adds "Ren's jobs are game jobs. Real tools need a grown-up." "Bevel" and "kerf" join the words never shown, beside "tenon", "dowel", "grain" and "offcut".
- **Nothing to climb or test.** No one sits, stands, lies on or climbs any piece on screen, at the Fair or in the showroom; the reveal dresses pieces with objects only. "Comfort" is about looking inviting and feeling smooth. The cottage bed is a low single bed shown made up and empty, never raised and with no ladder. Little Wheels never go on a seat or step piece. No piece claims to be safe for real use.
- **Fair work, told kindly.** Ren is an adult on a fair wage who is never scolded, rushed or blamed; "Give Ren the week off" is a friendly pause and the word "fire" never appears. Rent and grace come from Bram, with no eviction or debt words.
- **Adults stay public.** The Fair is a busy village green; no adult asks the player to meet privately or keep a secret. Children appear only beside their family.
- **Finishes stay colours.** New finishes are names, colours and tags only, with no chemistry, drying or ventilation talk. Lights are electric strings; nothing has a flame.
- **Randomness is free; coins only.** Themes, visitors and briefs come from the seeded RNG; nothing can be bought or rerolled. There is no entry fee, no real money and no online sharing. Before shipping, check that "Larkspur Craft Fair", "Larkspur Road Showroom" and the new client names are not real trading or event names.

### 10.12 Build and test plan

- **Reuse first; extend without breaking anything:** `ui/newGame/CareerStep`, `careerDraft` and `careerFacts`; the engine's `panelScore` (`panel`, `subScore`, `overallScore`), `showOrder` (`closerStrength`), `showDay` (`stagingScore`, `lateShowPenalty`, `showReputation`, `GENTLE_SHOW_SETBACKS`), `qualityTip` (`weakestTip`, `qualityTipLine`), `weekSettlement` and `weekMoneyLines` (rent and wage lines), `parseSaveWith`, `earnedReputation`, story choices with typed effects and `rngDraw`. `BoothReveal` is built like Patisserie's `FairShowcase`, from `ui/kit` (`useShowClock`, `PanelCard`, `easing`, `useRovingRadio`, `useArmedAfter`) and `ui/art` (`PetalFall` with a new optional `shape` prop whose default keeps petals, `AvatarFigure`, `PlacedLayer`). Workshop touches no other game and imports none; ADEEVA's show files stay where they are (roadmap task 1 owns them). Workshop's own `boardLayout`, `sawRecord`, `joint`, `sanding`, `finishChoice`, `pieceParts`, `pieceQuality` and `pieceEvaluate` take set inputs without changing any commission result.
- **New content files** (one concept each): `career` (becomes `CAREERS`), `setTemplate` (with `matchablePairs`), `fairTheme`, `fairBooth`, `boothBackdrop`, `fairMusic`, `makersNote`, `panelMember` and `apprentice`; the catalogue files gain their ids, `JointDef.show`, `showPrice` and `ExtraDef.allowedOn`.
- **New core files:** `showroomOffer` (unlock check and `openShowroom`), `showroomStart`, `seasonCalendar`, `restShowroom`, `shopGrace`, `runPurpose` (the purpose union and `startSet`), `setPartId` (namespacing and piece grouping), `setStyle`, `setJoint`, `matchedFaces`, `planTheRest`, `twinSaw`, `setEvenness`, `matchingHardware`, `setQuality`, `setPrice`, `showroomFloor`, `floorArrange`, `openHouse`, `apprentice` (hire, week off, wage), `apprenticeJob`, `fairBrief`, `fairPick`, `fairPlan`, `fairPanels`, `fairPrize`, `fairSeason` (theme pick, skip, booth step), `rosetteRail`, `showroomUpgrades`, `workshopProfile` and `saveMigrations`. `reduce.ts` (98 lines) sends the new cases to `reduceShowroom.ts` and `reduceFair.ts`, so every file stays ≤ 700 lines.
- **New UI:** the career cards and the bench-tour toggle; `SetDesign` (side-by-side set preview, set joint chips); the grouped layout tray, the board filmstrip with **Move to board ▸**, **Plan the rest**, and the piece switcher on the saw, join and sand stages; the twin ghost cut line and **Saw it like my first**; the shine bar; `ShowroomFloor` (arrange, For sale, Keep on show, and the Open House pick); `RenCard` and the hand-off scene; `FairBoard`, `FairPlanner`, `BoothReveal` (`GreenBackdrop`, `PaddedTrolley`, `DustSheet`, the home-dressing props) and `FairResults`; `RosetteRail` with `RosetteArt`; `ShowroomBackdrop`; and `PiecePreview` drawings for the 7 new products and 6 options. All work with mouse, touch and keyboard, controls are ≥ 44 px, and reduced motion is respected.
- **Build order:** D1 careers, migration, unlock and start here; D2 content ×2 in both careers; D3 set runs (purpose, namespaced parts, matched cushions) and the set twists; D4 the floor, Open House and Ren; D5 Fair season, board, planner, reveal, panels, rosettes and the rail; D6 simulation tuning and e2e.
- **Unit tests:** unlock at 44/45 reputation, the 13/14 delivered guard, no second queue while `showroom-offer` waits, and "Not yet" keeps the card; `startedAs` and studio reputation (missing → 0); rent timing around `seasonStartDay`, no Open House before it, Rest the shop and shop grace; the season calendar when the shop opens in an odd and an even week, Fair Day as a working day before staging and with no eligible set, and the Fair Day deadline shift; set hours, twins, Saw it like my first, matched cushions, `setStyle` per slot and the set joint on show joints only; namespaced part ids through layout, saw, join and sand, per-piece quality, and `setAside` refused after the first saw line; sets never touching `log` or `delivered`; matched faces (including `matchablePairs` 0), Plan the rest (≤ 0.9, no matched faces), evenness, matching hardware without `needs`, and set price at their edges with the rosette on its own set only; the full-floor refusal, one Open House sale with the oldest as default, Saved for the Fair and Keep on show; Ren's daily limit, levels, accuracies, records, hour savings (never below 0) and refusals (saw, Comb, after staging, garage career), and a Ren-pegged decent piece clearing Teodor and Ingrid; every panel formula, rosette band edges, `fairPrize`, booth advance per difficulty, the Relaxed choice and planner defaults per difficulty, late staging, the skipped Fair and the finale rules; upgrade gates by booth and Ren's level; every new action returns the same reference when illegal; the five migration fixtures.
- **Content tests:** unique ids; every canonical layout fits with knots, for every product with every part option it allows; each template's `matchablePairs` is reached by a legal layout; every theme palette and client colour can be made from a wood tone, paint, finish, extra or fabric; Little Wheels never allowed on a seat or step product; hint lines ≤ 12 words; client lines ≤ 2 sentences; budgets above the cheapest valid build; and no grown-up woodworking words on screen, with "bevel" and "kerf" added to the list.
- **Simulation (`depthEconomy.test.ts`, seeded, 5 seeds):** a decent garage bot gets the offer between day 15 and day 28 and passes 75–90% of its orders; a decent showroom fortnight earns between 1.0 × and 1.3 × the same bot's garage fortnight; a set-max bot (the best set every Open House) stays ≤ 1.3 × the garage bot; a struggling Standard bot using shifts and Rest the shop never ends two fortnights running below 0; a Relaxed showroom never takes coins below 0 and replays identically.
- **e2e** (`MAKER_PORT=5193`, 1280×800 and 820×1180, zero network requests): `e2e/workshop/showroomUnlock.spec.ts` (a committed v1 save at the threshold delivers, gets the offer, opens the showroom, saves and reloads); `e2e/workshop/matchedSet.spec.ts` (start here as Showroom Maker, take Ren on, build a Reading Corner by hand with matched faces by drag and by keyboard with the filmstrip and Move to board, hand the sanding to Ren, arrange the floor; at 820×1180 a Guest Room plan finishes with Plan the rest); `e2e/workshop/craftFair.spec.ts` (a prepared Fair Day save: Bram's pick, the planner, the reveal in motion and in reduced motion with a keyboard lift, skip, the rosette on the rail, an Open House sale, save and continue).
- **Checks:** `MAKER_PORT=5193 pnpm lint`, `pnpm typecheck`, `pnpm test` (twice) and `pnpm e2e` pass, with no `Math.random` or `Date` in core or content, no comments, no file over 700 lines, and every process started for the task stopped at the end.

### 10.13 As built (where the implementation differs)

- **Plan the whole set:** instead of a board filmstrip with **Move to board ▸**, a bench with more than four boards lays them out in two columns, the tray is grouped by piece, and Enter on a tray part finds it a spot (as **Show me**); arrow keys then move it by hand. **Plan the rest** is as specified. Matched faces count, per board, the distinct pieces whose show faces were placed by hand, minus one, summed over boards (`matchedPairs`), capped by `matchablePairs`; a content test finds a legal layout reaching every template's value.
- **Arrange the floor:** a finished set arrives already laid out on its own rug (`autoSpots`), so the +2 buzz is kept unless the player moves a piece off it. The floor is 300 × 200 with fixed rugs; buying the Hand Cart re-lays every set onto the three narrower rugs. Arrange is drag or keyboard (arrows nudge 2, R turns).
- **Records:** `JointRecord.byApprentice` is always present (the migration writes `false`), and `SandRecord` gains `renAccuracy: number | null` instead of a union. Each run keeps `renJobs`; a Ren record can't be reset by the player (it would undo the hour Ren saved).
- **Spending:** a set's brief has budget 0 and the checklist shows "Set cost so far" instead of a budget line; the finish is paid once per piece and the cushion fabric once per seat. Bram's Spare Board Pile is knot-free and free (cost 0, marked as spare pieces).
- **Open House:** buzz is +3 for a sale, +2 per set kept on show and +2 per set wholly on its own rug. The day transition names the set that went home.
- **Fair state:** `fair = {booth, pickSetId, visitors, result, boothOffer, rosetteRail, rosettesBySet}` holds this season's result only; the reveal's closing line is a Fair line from one of the season's visitors.
- **Unlock:** "Not yet" sets `showroom-later` and the hub's "Bram's old shop" card dispatches `openShowroom`. The offer beat can't be dismissed without a choice.
- **Tests:** unlock pacing is checked by a scripted garage bot (`garageBot.ts`, 3 Standard seeds land on days 18–28; Relaxed 16). The fortnight economy comparison (`depthEconomy.test.ts`) was not built. The v1 fixtures are `fresh`, `midJoin`, `midFinish`, `threshold` and `fullRack`. The e2e coverage is `e2e/workshop/showroomJourney.spec.ts` (the v1 threshold save to a Fair rosette, saved and continued) and `e2e/workshop/showroomScreens.spec.ts` (every new screen at 1280×800 and 820×1180, the reveal in reduced motion with keyboard lifts, the floor by keyboard).
