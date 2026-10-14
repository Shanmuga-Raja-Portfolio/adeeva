# Interior Studio — Game Design (id: `interior`)

A playable slice of the Maker Studio contract (`work/0003-studio/design.md`), at about a third of ADEEVA's depth. You rent the little loft above Hollin's Hardware on Marigold Row and become the street's room maker. Neighbours bring you a room and a wish. You pick and place furniture on a floor-plan grid, shop for paint, flooring and lights within a budget, paint the walls, lay the floor, light the room and style it with decor and soft fabrics. Then you reveal it to the client. Later a builder asks you to dress a show home for an open house. All names, text and art are original, and the studio safety promise applies on every screen.

## 1. Fantasy and audience

- **Fantasy:** "Nana Pearl's spare room was grey and empty. I made it into a reading nook with a sage wall and a lamp by the armchair, and she cried happy tears at the reveal." The fun is turning an empty box into a place that fits one particular person.
- **Ages 8–15+.** 8–11 play on Relaxed with Assist toggles on. They enjoy dragging a bunk bed into place, dipping and rolling paint, and hanging star garlands. 12–15+ play Standard or Challenging. They solve the floor plan for walking space, edge neatly around windows, light every spot with few lamps, and stretch a tight budget.
- **Reading level:** hints are one sentence of 12 words or fewer, at about Grade 3. Client lines are 1–2 short sentences. Every number comes with an icon (coin, clock, star, paint tin).
- **Why it is good for kids (without overclaiming):** it practises spatial planning on a grid, steady pointer control, choosing colours for a person rather than for yourself, and keeping to a budget and a deadline. It does **not** teach real decorating, DIY, electrics or interior design, and says so.
- **Parent page sentence (exact):** "This game does not teach real painting, DIY, ladder use or electrical work. Its rooms and sizes are made up."

**Kid-facing labels** (design terms on the left never appear on screen):

| Design term         | Label on screen         |
| ------------------- | ----------------------- |
| floor plan / layout | "Pick and place"        |
| flow, clearance     | "Walk-through space"    |
| cutting in          | "Edging"                |
| use cells / zones   | "Spots people use"      |
| lux                 | "Light" (0–3 sun icons) |
| fit score           | "Suits the brief"       |

## 2. Core loop and stages

**Career (only one):** _Junior Room Designer_ in "The Loft on Marigold Row". Start: 110 coins, reputation 0, weekly rent 90 (Challenging ×1.5 = 135; Relaxed 0), paid to Ms. Odette Vale, a retired stage-set painter who owns the building. Shift: "Stacking shelves at Hollin's Hardware" pays 30 coins for a whole untouched day, on every difficulty.

**Hub loop:** read the inbox (offers) → accept a makeover → run it → reveal → End Day. Rent is due at the end of every 7th day, exactly as ADEEVA's `weeklyBill`. Show homes are special offers inside the same loop (§3.7).

**`MakeoverRun.stage`** = `brief → plan → shop → paint → floor → light → style → reveal → done`

| #   | Stage  | Hours       | What happens                                                                                                                                                                                                                                                                                                           |
| --- | ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | brief  | 0           | Client card: room template, required tags, favoured and avoided colours, must-have items (`{item, count}`), light mood (warm, cool or any), budget, fee, deadline, minimum quality. The live checklist stays on screen afterwards (ADEEVA `checklist`).                                                                |
| 2   | plan   | 1           | **Pick and place** (§3.1): the catalogue cards are the tray. Drag furniture onto the blueprint grid; pick one wall paint (plus an optional feature-wall paint), one floor and up to 4 lights, at least one of which has a cell it can mount on in this room. The running total sits above the grid against the budget. |
| 3   | shop   | 1 per visit | Marigold Warehouse: one button buys everything on the plan that the leftover shelf does not already hold. Coins are checked atomically. The Decor Bin sells decor here and again at Style.                                                                                                                             |
| 4   | paint  | 2           | Edge and roll the two visible walls (§3.2). The first brush or roller stroke locks the room and takes the planned furniture, tins, floor packs and lights off the shelf exactly once.                                                                                                                                  |
| 5   | floor  | 2           | Lay the show strip of the floor (§3.3). The rest lays itself in the same pattern.                                                                                                                                                                                                                                      |
| 6   | light  | 1           | Furniture moves in to its planned spots automatically. Place the lights (§3.4).                                                                                                                                                                                                                                        |
| 7   | style  | 1           | Place decor, buying more from the Decor Bin, and pick the soft-fabric colour (§3.5).                                                                                                                                                                                                                                   |
| 8   | reveal | 0           | Before/after reveal with the client's reaction; evaluate the frozen run and commit the reward once per run id. Placed decor leaves the shelf here.                                                                                                                                                                     |

Going back follows ADEEVA's rule: plan and shop can be revisited until the first paint stroke lands; after that the room is locked. Each step's hours are charged once, when the step is first finished, except the warehouse, which costs 1 h every time you leave it forward; revisiting the plan is free. One makeover takes 8 h of a 10 h day.

**First makeover coach** (one-time, one hint per stage): plan "Place the must-haves first. Keep the door clear." · shop "Buy everything with a tick. Decor can wait." · paint "Brush along the tape, then roll the wall." · floor "Pick the piece that fits the pattern." · light "Light up the spots people use." · style "Add decor. Make it feel like them."

## 3. Hands-on mini-games

Pointer Events drive every mini-game (mouse and touch), and each one also has a keyboard path: tray buttons place a piece or light on the first free spot, focused pieces, lights and placed decor move with the arrow keys (R turns a piece, Delete removes and returns focus to the tray), a quick double tap on a tray card adds only one piece, floor pieces nudge with the arrows and press with Enter, the reveal handle is a slider, and the helpers cover edging and rolling. Every draggable item, handle and button is at least 44×44 px (turn and Show me buttons 48 px, the paint tray, Press button and reveal handle 56 px). Trace paths are drawn at least 12 px wide. Every screen fits the studio's minimum viewport of **768 × 600** CSS px. Scoring lives in core; the UI sends only poses, samples or stroke records, which core validates. Tolerances multiply as **base × trait × upgrade × difficulty**, with difficulty from ADEEVA `content/difficulty` `toleranceMultiplier` (Relaxed 1.3, Standard 1, Challenging 0.85) and Perfectionist ×1.2. **Assist caps a step at 0.8** (0.7 on Challenging), from the engine's `ASSIST_ACCURACY_CAP`. Helpers are switched on in Settings (Tidy up helper, Steady brush, Floor magnet, Show me lights).

### 3.1 Pick and place (grid placement; scored as walk-through space)

- **Input:** a top-down blueprint, 1 cell = 50 cm, drawn at 57–87 px per cell (small rooms are scaled up, so every cell is a ≥ 44 px target). Rows run from the back wall (row 0) to the front, where the door sits. Drag a piece from the catalogue tray (or tap it to drop it on the first free spot); it snaps to whole cells with its centre under the pointer. Tap a placed piece to select it, then use the 48 px Turn button to rotate 90° (it slides back inside the room if needed). Drag it off the plan, or use Back to tray, to remove it.
- **Hard rules** (a piece that breaks one shows a dashed red outline with a reason and cannot be dropped), checked as integer cell sets: every cell inside the room; no cell shared with another piece; no cell in the door swing (a 2×2 cell square inside the door); a **tall** piece on no cell touching a window. The Attic's roof window blocks no wall cells, so tall pieces are allowed anywhere there. The desk chair is a tuck-in piece: it never blocks the walk or a use spot, so it can sit on a desk's or table's use cells.
- **Use cells:** each piece lists the cells people stand or sit in to use it (a bed's long side, a sofa's front row, a desk's front). They rotate with the piece.
- **Score (core `walkThrough`):** the walk is a 4-neighbour BFS over free cells starting from the 4 door-swing cells (walkable, not placeable); desk chairs count as free. `reach` = average over pieces of (use cells that are free and reached by the walk) ÷ (that piece's use cells); the coffee table has no use cells, and its 1 free neighbour must be reached. With no pieces placed, `reach = 1`; every template's brief includes at least one must-have furniture piece. `roomy` = `clamp(freeShare ÷ target, 0, 1)` with `target = 0.40 ÷ difficulty multiplier` (Relaxed 0.31, Standard 0.40, Challenging 0.47). `flow = 0.75·reach + 0.25·roomy`.
- **Footprints:** a reachable spot shows a green footprint; a blocked spot shows a red footprint with a white ✕ and a dashed outline.
- **Assist "Tidy up":** adds any missing must-have furniture, then arranges every chosen piece with the core's `tidyLayout` search (largest pieces first, each at the legal pose with the best walk-through, then the most wall contact; chairs prefer a desk's front); flow counts at most the Assist cap. If any piece would not fit, or the set would pass 12 pieces, Tidy up changes nothing and says why, so it never drops a piece the player chose.
- **Why it is fun:** for an 8-year-old it is a chunky shape puzzle with footprints; for a 15-year-old it is a real space puzzle (fit a bunk bed, desk and toy box into 30 cells and still walk to all of them).

### 3.2 Paint (edging trace, then dip-and-roll)

Two visible walls (back and side, as in a dollhouse cutaway) are painted; the other walls follow. A feature wall uses the second paint on the back wall.

- **Wall paths:** each visible wall has the ceiling tape (**open**) plus, if that wall has a window, the window frame (**closed**); otherwise a skirting tape (**open**). A wall with two windows shows one frame. Per template: Reading Nook, Shared Bedroom, First Flat, Café Corner and Show Home Lounge put the frame on the back wall (side: ceiling + skirting); Front Room has a frame on both walls; Quiet Study's frame is on the side wall (back: ceiling + skirting); the Attic's roof window sits in the slope above the back wall, so the back wall carries ceiling tape + frame and the side wall ceiling + skirting.
- **Edging:** each path gets its own close-up strip at 6 px per cm: a tape is a 54 cm line in a 60 × 20 cm strip (360 px wide); a window frame is a closed 40 × 30 cm rectangle in a 52 × 42 cm strip. Press and drag the brush along the tape, in as many strokes as you like; a meter shows how much of the tape is covered. Scored on a smooth curve: each sample scores `1 − 0.5·(d/tol)²` within the tolerance and 0 outside it, using the engine's `distanceToOutline`, and the edge is the average. A path counts as done when the samples cover ≥ 90% of its length (engine `visitedBins`) with ≥ 1 sample per cm (the Workshop saw rule, `getCoalescedEvents()` samples); a path can be brushed again until the stage is left.
- **Edge tolerance:** `BASE_CUT_TOLERANCE_CM (1.2, ADEEVA's constant) × trait 1.2 × Long-Reach Brush 1.15 × difficulty`, as a pure function in the shape of ADEEVA's `cutTolerance`. Standard ≈ 1.2 cm (7.2 px), Relaxed ≈ 1.56 cm (9.4 px), Challenging ≈ 1.02 cm (6.1 px).
- **Rolling:** the wall is an 8 × 5 coverage grid of 64 px cells (512 × 320 px) where each cell counts up to 2 passes ("two coats"). Cells under a window are not paintable. Drag the 72 px roller; a stroke crosses a cell when the cell centre is within 36 px of a stroke segment.
  - **Paint load:** the roller holds 12 cell-passes. Tap the 56 px tray to reload (its own `reloadRoller` action; the dip animation lasts 0.4 s). A stroke adds one pass to each crossed cell in order until the load runs out; a stroke that starts on an empty roller adds no passes, shows a dry streak and counts as a dry stroke. A stroke faster than `splatSpeed = 1600 px/s × trait × difficulty` flicks a splat (a cream dot that stays where the stroke ended).
  - **Records and score:** the UI sends each stroke as `{points, durationMs}` in wall pixels; core validates it (2–2000 finite points, `50 ≤ durationMs ≤ 600000`, length ≥ 30 px, at most 300 strokes per wall), works out the crossed paintable cells itself and stores the wall's passes per cell, splat points and dry-stroke count. `coverage = Σ min(passes, 2) ÷ (2 × paintableCells)`; `roll = coverage × max(0.7, 1 − 0.05·splats) × (1 − 0.1·min(3, dryStrokes))`. A wall counts as rolled when 90% of its paintable cells have at least one coat.
- **Wall score** = `0.5·edge + 0.5·roll` (edge is the average of the wall's paths). `paint` = average of the two walls.
- **Assist paint:** the brush rides the tape and the roller auto-fills, each at the Assist cap.
- **Why it is fun:** rolling colour over grey is instant joy for young players, and dip-and-roll gives it a rhythm; clean edges around a window with no splats or dry streaks is a steady-hand test for older ones. With `prefers-reduced-motion` splats appear without a flick animation.

### 3.3 Lay the floor (pattern pick, then alignment)

- **Close-up:** 6 show pieces by the door, at 4 px per cm, in the floor's pattern: boards are three 15 cm rows of a 120 cm strip (full 60 cm boards, with the middle row starting on a 30 cm half board); tiles and checker tiles are a 3 × 2 grid of 30 cm squares, checker squares alternating dark and light. A ghost outline shows each target and the next one glows. The rest of the floor lays itself in the same pattern ("Your helper copies your pattern").
- **Pick:** each turn the tray shows 3 candidate pieces (≥ 56 px), shuffled from the run seed: the right one, one of the wrong length and, for checker floors, one of the wrong colour (otherwise a second wrong length). Only the right piece can be dropped; a wrong pick wobbles and shows "That piece doesn't match the pattern." Wrong picks cost nothing but time.
- **Place:** drag the right piece onto its ghost and release (or tap it and nudge it with the arrow keys), then tap the 56 px **Press** button ("Thunk!"). Core computes the offset `d` (cm) between the piece's top-left corner and the ghost's from the reported pose; the UI never reports a score.
- **Tolerance:** `dTol = 2.5 cm × trait 1.2 × Floor Spacer Kit 1.15 × difficulty`: Standard 2.5 cm (10 px), Relaxed 3.25 cm (13 px), Challenging 2.1 cm (8.5 px). A release with `d > 1.5·dTol` slides back: "Line it up with the shadow."
- **Formula:** `pieceAccuracy = clamp(1 − 0.4·(d/dTol)², 0, 1)`: dead on 1.0, at `dTol` 0.6, at the gate 0.1. `floor` = average of the 6 pieces; an unlaid piece counts 0. The pose → offset → score rule lives in the game's `floorLay`.
- **Record validation:** finite `d ≥ 0`, `d ≤ 1.5·dTol`, the right candidate key, one record per piece, and the piece index no further than the next unlaid piece (a laid piece can be laid again until the stage is complete).
- **Assist floor:** the right piece glows and a magnet snaps it exactly; each counts at most the Assist cap. Core treats any drop exactly on the shadow as helped. A tapped piece starts 6.5 cm right and 3.5 cm down and nudges 1 cm per arrow key, so the keyboard reaches about 0.7 cm.
- **Why it is fun:** spotting the half board at a row start is real thinking for 8-year-olds; checker tiles show every wobble to older ones.

### 3.4 Light it (placement puzzle)

- **Input:** furniture is now in place on the plan. Drag the chosen lights (up to 4) onto cells; while dragging, every cell that light can mount on is outlined: pendants on any cell, floor lamps on cells that are neither furniture, a use cell nor in the door swing, desk lamps on a desk or table, string lights and sconces on wall-edge cells (the back row and both side columns, outside the door swing). Two lights never share a cell. Tapping a hung light takes it down. A glow overlay on the plan, and a twilight cutaway of the room beside it, show the light.
- **Core light model (`lighting`):** `lux(cell) = Σ strength × max(0, 1 − distance ÷ radius)` (distance between cell centres, in cells). A **spot** is the use cells of each bed, desk, sofa, armchair, table, window seat and bookcase. A spot is **lit** when its mean lux ≥ 0.6, compared in integer hundredths (`round(100·lux)`) to avoid float edge cases. Sun icons: 0 below 0.30, 1 from 0.30, 2 from 0.60 (lit), 3 from 1.00.
- **Examples (§4.4 numbers):** a clip lamp on a desk gives its 2 front cells 0.80 and 0.64 (lit). A pendant over the middle of a bed's side gives 0.67, 1.0, 0.67, 0.33 (lit); one row off, 0.49 (unlit). An arc lamp or sconce in line one cell beyond a 2-cell spot gives 0.87 and 0.43 (lit); diagonal, 0.51 (unlit). String lights alone give 0.40, so they need a partner light.
- **Score:** `light = 0.8 × litSpots ÷ spots + 0.2 × moodMatch`, where `moodMatch` is the share of placed lights whose warmth matches the brief's mood (1 when the mood is "any").
- **Assist "Show me":** places the next light from the chosen set at the mount cell that lights the most unlit spots; ties go to the cell that brings unlit spots closest to lit (capped at 0.60), then to the lowest cell index; light counts at most the Assist cap.
- **Why it is fun:** watching dark corners glow is magic at 8; at 15, lighting 5 spots with 3 lamps in the right mood is a real puzzle. Not a dexterity test, so trait and difficulty do not change it.

### 3.5 Style (creative, not skill-scored)

- Drag decor (§4.5) from the decor box onto the cutaway view (or tap it to drop it in a sensible spot: wall pieces on the back wall, floor pieces on the floor). Tap a placed piece to select it, then Turn (15° steps), Smaller or Bigger (0.5–2), To front, or Back to the box; dragging it out of the room also puts it back. Poses use the engine's `placedPose` rules on a 640 × 420 canvas.
- **Soft fabrics:** soft pieces (bed covers, sofa, armchair, window seat, cushions, round rug) share one of 8 fabric colours, chosen at no cost: sky, coral, sage, mustard, lavender, teal, navy, blush.
- **Decor Bin:** the Style screen (and the warehouse) has a Decor Bin that sells §4.5 decor at warehouse prices. Each purchase is an atomic coin check, takes no hours and counts toward the run's spend. Decor already on the shelf is used first, and placed decor leaves the shelf at the reveal.
- **Curtains are not in this slice.** The studio keeps each game in its own folder, so ADEEVA's sewing machine cannot be borrowed here.

### 3.6 Reveal

The client stands with their hands over their eyes ("No peeking!"). The player drags a 56 px handle across a before/after slider (grey room → finished room); once it is almost all the way across, **Open your eyes!** reveals the room. The client's avatar then reacts with a delighted face (4–5 stars), a smile (a pass) or a thoughtful look (shared `Avatar` moods), says their `delighted` or `nearMiss` line, and the results card follows with falling confetti. With reduced motion the slider still works and confetti becomes a single fade.

### 3.7 Show homes (open house)

From reputation 22 (about week 2), at most one Bellwind Homes offer appears per week. Its required tags are the week's two hot tags, copied into the brief when the offer is made. The reveal's trend bonus uses the hot tags current at reveal, so a brief that crosses a week boundary may lose its trend matches. After a passing reveal (every reveal on Relaxed), an **Open House** plays below the results: 6 visitor avatars step from cell to cell along the walk-through path from the door, and three cards score the room:

- **Comfort** = `100 × (0.6 × litSpots ÷ spots + 0.4 × min(1, |tags ∩ {cosy, calm}| ÷ 2))`.
- **Flow** = `100 × flow`.
- **Wow** = 30 for a feature wall + 15 per distinct decor item carrying a brief tag (up to 45) + 25 × moodMatch.
- **Open House score** = the rounded average. **Enquiries** = `clamp(floor((score − 60) ÷ 5), 0, 5)`, each worth 12 coins, plus buzz `+round(score ÷ 10)`. Enquiry coins join the reward as an "Open House enquiries" line and the buzz joins the reward's buzz. A one-line visitor quote is chosen from score bands (90, 75, 60, below). Visitors comment only on the room.

### 3.8 Hint lines (all ≤ 12 words)

| when                               | line                                                            |
| ---------------------------------- | --------------------------------------------------------------- |
| piece dropped on the door swing    | "Keep the door clear so it can open."                           |
| tall piece by a window             | "Tall things block the window light. Try a wall."               |
| piece outside the room             | "That piece needs to fit inside the room."                      |
| two pieces on one spot             | "Two pieces can't share a spot."                                |
| light on a cell it cannot mount on | "That light can't go there. Check its mount."                   |
| a use spot is blocked              | "Someone needs space to use this. Look for crossed footprints." |
| roller stroke too fast             | "Slow and steady stops the splats."                             |
| roller stroke on an empty roller   | "Dip the roller when it runs dry."                              |
| edging released before 90%         | "Keep brushing to the end of the tape."                         |
| wrong floor piece picked           | "That piece doesn't match the pattern."                         |
| floor piece released past the gate | "Line it up with the shadow."                                   |
| a spot is still dark               | "This cosy spot needs a little more light."                     |
| must-haves missing at Style        | "Check the brief. Something is still missing."                  |
| plan is over budget                | "That's over budget. Try a cheaper floor or paint."             |

## 4. Content catalog

**Room tags** (`RoomTag`, 8): `cosy, calm, bright, playful, modern, classic, natural, bold`. The neutral tag is `classic`, like ADEEVA's. **Colours:** ADEEVA's 16 `colour` entries plus Workshop's 4 wood tones (`pale-wood`, `honey-wood`, `red-wood`, `dark-wood`).

### 4.1 Room templates (8)

Grid cells are 50 cm. Each template has a door on the front wall (its 2 × 2 swing starts at the door column in the front two rows), windows given as cell spans along the back wall or the left side wall, and the walls that show a window frame when painting. Unit tests check that the core `tidyLayout` fits every client's typical set with flow ≥ 0.9, and that the same layout plus the client's typical lights placed by Show me lights every spot in the brief's mood.

| id             | name             | grid (cells) | door column | windows (cell spans)                | used by       |
| -------------- | ---------------- | ------------ | ----------- | ----------------------------------- | ------------- |
| reading-nook   | Reading Nook     | 5×4 (20)     | 3           | back 1–2                            | nana-pearl    |
| shared-bedroom | Shared Bedroom   | 6×5 (30)     | 4           | back 2–3                            | okafor-twins  |
| first-flat     | First Flat       | 7×6 (42)     | 5           | back 1–2 and 4–5                    | jun           |
| living-room    | Front Room       | 8×6 (48)     | 6           | back 3–4, side 2–3                  | mrs-halloran  |
| cafe-corner    | Café Corner      | 7×5 (35)     | 5           | back 1–2 and 4–5 (shopfront)        | bluebell-cafe |
| attic-room     | Attic Bedroom    | 6×5 (30)     | 4           | 1 roof window (above the back wall) | orla          |
| quiet-study    | Quiet Study      | 6×5 (30)     | 4           | side 1–2                            | dr-faraday    |
| show-lounge    | Show Home Lounge | 9×7 (63)     | 7           | back 1–2 and 6–7                    | bellwind      |

### 4.2 Materials: paints (8) and floors (7)

A paint tin covers one room (the feature wall is a second tin). Floors cost `ceil(cells ÷ 10) × price per 10 cells`. The Trade Card upgrade takes 1 coin off every item (each tin, floor pack, piece, light and decor) at the warehouse and the Decor Bin, so one basket always costs the same as the same items bought separately.

| paint id     | name         | colour   | price | tags            |
| ------------ | ------------ | -------- | ----- | --------------- |
| chalk-white  | Chalk White  | ivory    | 5     | classic, calm   |
| sea-glass    | Sea Glass    | sage     | 5     | calm, natural   |
| morning-sky  | Morning Sky  | sky      | 5     | bright, calm    |
| peach-sorbet | Peach Sorbet | coral    | 6     | playful, bright |
| sunflower    | Sunflower    | mustard  | 6     | bright, playful |
| lilac-mist   | Lilac Mist   | lavender | 6     | calm, playful   |
| deep-lagoon  | Deep Lagoon  | teal     | 7     | bold, modern    |
| midnight-ink | Midnight Ink | navy     | 7     | bold, classic   |

| floor id      | name               | pattern | colour        | per 10 cells | tags             |
| ------------- | ------------------ | ------- | ------------- | ------------ | ---------------- |
| pine-boards   | Pine Boards        | boards  | pale-wood     | 2            | natural, cosy    |
| oak-boards    | Oak Boards         | boards  | honey-wood    | 4            | classic, natural |
| walnut-boards | Walnut Boards      | boards  | dark-wood     | 5            | classic, bold    |
| cork-tiles    | Cork Tiles         | tiles   | honey-wood    | 3            | calm, natural    |
| cloud-carpet  | Cloud Carpet Tiles | tiles   | sky           | 3            | cosy, calm       |
| terracotta    | Terracotta Tiles   | tiles   | coral         | 4            | bright, natural  |
| checkerboard  | Checkerboard Tiles | checker | black + ivory | 4            | bold, playful    |

### 4.3 Furniture (12 templates)

Footprint is W×D in cells at rotation 0. **Use cells** are listed relative to the front.

| id           | name          | W×D | tall                        | use cells              | price | tags            | colour        |
| ------------ | ------------- | --- | --------------------------- | ---------------------- | ----- | --------------- | ------------- |
| single-bed   | Single Bed    | 2×4 | no                          | one long side (4)      | 12    | cosy            | soft (chosen) |
| bunk-bed     | Bunk Bed      | 2×4 | yes                         | one long side (4)      | 18    | playful         | pale-wood     |
| desk         | Writing Desk  | 2×1 | no                          | front (2)              | 8     | modern, classic | pale-wood     |
| desk-chair   | Desk Chair    | 1×1 | no                          | — (tucks in)           | 3     | modern          | charcoal      |
| wardrobe     | Wardrobe      | 3×1 | yes                         | front (3)              | 10    | classic         | honey-wood    |
| bookcase     | Bookcase      | 2×1 | yes                         | front (2)              | 7     | classic         | honey-wood    |
| sofa         | Sofa          | 4×2 | no                          | front row (4)          | 16    | cosy            | soft          |
| armchair     | Armchair      | 2×2 | no                          | front (2)              | 9     | cosy, classic   | soft          |
| coffee-table | Coffee Table  | 2×1 | no                          | — (1 free neighbour)   | 5     | modern          | dark-wood     |
| dining-table | Table for Two | 2×2 | no                          | two opposite sides (4) | 10    | natural         | honey-wood    |
| toy-box      | Toy Box       | 2×1 | no                          | front (2)              | 4     | playful         | coral         |
| window-seat  | Window Seat   | 3×1 | no (allowed under a window) | front (3)              | 8     | cosy            | soft          |

### 4.4 Lights (6)

| id             | name                  | price | strength | radius | warmth | mount                           | tags           | colour |
| -------------- | --------------------- | ----- | -------- | ------ | ------ | ------------------------------- | -------------- | ------ |
| paper-pendant  | Paper Pendant         | 5     | 1.0      | 3      | warm   | ceiling (any cell)              | calm           | ivory  |
| arc-lamp       | Arc Floor Lamp        | 4     | 1.3      | 3      | warm   | free floor cell, not a use cell | cosy           | gold   |
| clip-lamp      | Clip Desk Lamp        | 2     | 1.2      | 3      | cool   | desk or table                   | modern         | teal   |
| firefly-string | Firefly String Lights | 3     | 0.8      | 3      | warm   | wall edge                       | playful        | gold   |
| brass-sconce   | Brass Wall Light      | 4     | 1.3      | 3      | warm   | wall edge                       | classic        | gold   |
| dome-pendant   | Glass Dome Pendant    | 5     | 1.0      | 3      | cool   | ceiling (any cell)              | modern, bright | sky    |

### 4.5 Decor (8; style stage)

| id            | name          | price | tags            | colour     | hangs on |
| ------------- | ------------- | ----- | --------------- | ---------- | -------- |
| cushion-pile  | Cushion Pile  | 2     | cosy            | soft       | floor    |
| potted-fern   | Potted Fern   | 3     | natural         | emerald    | floor    |
| framed-print  | Framed Print  | 3     | classic         | navy       | wall     |
| woven-basket  | Woven Basket  | 2     | natural, cosy   | honey-wood | floor    |
| round-rug     | Round Rug     | 4     | cosy            | soft       | floor    |
| star-garland  | Star Garland  | 2     | playful, bold   | gold       | wall     |
| paper-bunting | Paper Bunting | 2     | playful, bright | coral      | wall     |
| wall-clock    | Wall Clock    | 3     | classic, calm   | charcoal   | wall     |

### 4.6 Clients (8; 2 trait-gated)

Briefs are varied by seeded RNG like ADEEVA's `rollClientBrief` (budget, fee, deadline, 2 of the 3 favoured colours). Bellwind's favoured colours are 2 drawn from the colours of every paint, floor and decor item that carries one of the hot tags. "Typical spend" is a sensible plan at Standard prices that includes enough lights to light every spot. **Rule:** every brief's lowest budget ≥ typical spend + 4 (test `everyClientTypicalSpendFits`), and each mood brief can reach `moodMatch = 1` with every spot lit (test).

| id            | client                                    | gate / min rep     | room           | required tags           | favoured                            | avoid          | must-haves                                     | mood | budget  | fee     | days | min Q | typical spend |
| ------------- | ----------------------------------------- | ------------------ | -------------- | ----------------------- | ----------------------------------- | -------------- | ---------------------------------------------- | ---- | ------- | ------- | ---- | ----- | ------------- |
| nana-pearl    | Nana Pearl, who reads three books a week  | — / 0              | reading-nook   | cosy                    | sage, ivory, honey-wood             | black          | armchair 1, bookcase 1                         | warm | 40–50   | 50–60   | 3–5  | 55    | 36            |
| okafor-twins  | Mr. Okafor, for twins Kit and Bea (age 7) | — / 0              | shared-bedroom | playful                 | mustard, sky, coral                 | charcoal       | bunk-bed 1, toy-box 1                          | any  | 60–74   | 70–85   | 4–6  | 58    | 56            |
| jun           | Jun, moving into a first flat             | — / 3              | first-flat     | modern                  | sky, teal, pale-wood                | mustard        | single-bed 1, desk 1                           | cool | 60–74   | 75–90   | 4–6  | 60    | 55            |
| orla          | Orla, a puppet maker                      | Dreamer / 6        | attic-room     | bold, playful           | navy, gold, lavender                | —              | single-bed 1, star-garland 2, firefly-string 1 | warm | 67–80   | 90–110  | 5–7  | 65    | 63            |
| mrs-halloran  | Mrs. Halloran, retired music teacher      | — / 8              | living-room    | classic, calm           | ivory, navy, honey-wood             | coral          | sofa 1, armchair 1, bookcase 1                 | warm | 80–98   | 95–115  | 5–7  | 65    | 75            |
| dr-faraday    | Dr. Imogen Faraday, museum archivist      | Perfectionist / 10 | quiet-study    | calm, classic           | sage, ivory, honey-wood             | mustard, coral | bookcase 2, desk 1                             | any  | 60–76   | 105–125 | 5–7  | 84    | 56            |
| bluebell-cafe | Ivy and Tomas, Bluebell Café              | — / 12             | cafe-corner    | bright, natural         | mustard, emerald, coral             | navy           | dining-table 2, potted-fern 2                  | warm | 68–85   | 95–115  | 5–7  | 66    | 58            |
| bellwind      | Ms. Delphine Achebe, Bellwind Homes       | — / 22             | show-lounge    | the 2 hot tags at offer | 3 drawn from the trend tags' paints | —              | sofa 1, armchair 1, framed-print 1             | any  | 118–140 | 140–170 | 6–7  | 70    | 113           |

**Typical spends:** Nana Pearl 36 = armchair 9 + bookcase 7 + Chalk White 5 + cork 6 + arc lamp 4 + paper pendant 5; Twins 56 = bunk 18 + toy box 4 + desk 8 + Sunflower 6 + pine 6 + string 3 + pendant 5 + clip 2 + arc 4; Jun 55 = single bed 12 + desk 8 + desk chair 3 + wardrobe 10 + Morning Sky 5 + pine 10 + dome pendant 5 + clip 2 (both cool); Orla 63 = single bed 12 + desk 8 + Midnight Ink 7 + Lilac Mist 6 + checkerboard 12 + string 3 + pendant 5 + sconce 4 + two garlands 4 + bunting 2; Mrs. Halloran 75 = sofa 16 + armchair 9 + bookcase 7 + coffee table 5 + Chalk White 5 + oak 20 + pendant 5 + arc 4 + sconce 4; Dr. Faraday 56 = two bookcases 14 + desk 8 + desk chair 3 + Sea Glass 5 + oak 12 + dome pendant 5 + clip 2 + sconce 4 + wall clock 3; Bluebell 58 = two tables 20 + two ferns 6 + Sunflower 6 + terracotta 16 + two pendants 10; Show home 113 = sofa 16, armchair 9, coffee table 5, bookcase 7, table 10, two tins 12 (Chalk White and Deep Lagoon), oak 28, four lights 17 (pendant, two arcs, sconce), three decor 9 (framed print, potted fern, wall clock). Kit and Bea's lines are their own; their dad pays and books.

| client        | request                                                       | delighted                                             | nearMiss                                             |
| ------------- | ------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| nana-pearl    | I need a cosy corner for reading. Somewhere soft and warm.    | Oh my. I may never leave this chair again.            | It's lovely, dear. The lamp could be a touch closer. |
| okafor-twins  | We want a room for two explorers! Bunk beds, please!          | Top bunk is mine! No, mine! It's the best room ever!  | We love it! Can the toy box be easier to reach?      |
| jun           | My first flat. Clean and modern, with a proper desk.          | It finally feels like my place. Thank you!            | Really nice. It's a bit tight to walk around.        |
| orla          | I dream under a sky full of stars. Can my room do that?       | It's a night sky indoors. My puppets will love it!    | Almost magic! It needs a little more sparkle.        |
| mrs-halloran  | A calm front room for tea and old records.                    | It feels like a quiet song. Beautiful work.           | Very pleasant. One wall looks a little patchy.       |
| dr-faraday    | A study as calm as an archive. Everything just so.            | Precise, quiet and kind to the eyes. Exemplary.       | Thank you. A few edges could be crisper.             |
| bluebell-cafe | Our corner needs sunshine and plants. Bright, please!         | Customers keep choosing that corner first. Wonderful! | It's cheerful! A couple of tables feel cramped.      |
| bellwind      | Our show home opens soon. Make it what people love right now. | Visitors are queueing at the door. Splendid!          | Good work. We'll tidy a few details before opening.  |

**Day 1:** the first offer is always `nana-pearl` (20 cells, 2 must-haves). From day 2 the normal pool applies.

### 4.7 Upgrades and loft decor

Upgrades (4; one-time; reputation-gated; bought from the upgrade catalogue in the loft):

| id               | name                 | price | min rep | effect                                                               |
| ---------------- | -------------------- | ----- | ------- | -------------------------------------------------------------------- |
| long-reach-brush | Long-Reach Brush     | 140   | 3       | edging tolerance ×1.15                                               |
| spacer-kit       | Floor Spacer Kit     | 150   | 5       | floor tolerance ×1.15                                                |
| trade-card       | Warehouse Trade Card | 160   | 8       | Every item at Marigold Warehouse and the Decor Bin costs 1 coin less |
| little-van       | Little Blue Van      | 220   | 12      | +1 working hour every day                                            |

Loft decor (fixed price, display only, no gameplay effect, no randomness): `swatch-wall` Swatch Wall (40), `loft-plant` Big Monstera (80), `neon-sign` Studio Sign with the player's studio name (120).

### 4.8 Story beats (9; player lines voiced by trait, as in ADEEVA's `storyVoice`)

| id               | trigger                | title                    | gist (2–5 lines)                                                                                                                 |
| ---------------- | ---------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| is-keys          | intro                  | Keys to the Loft         | Ms. Vale hands over a key on a paintbrush keyring: "Every room has a story. Find it." Nana Pearl's note is already in the inbox. |
| is-first-reveal  | first-delivery         | The Big Reveal           | Your first client opens their eyes. Ms. Vale: "That face is why we do this."                                                     |
| is-first-week    | first-week             | Rent and Rollers         | Ms. Vale collects rent and points to the upgrade catalogue on the warehouse counter.                                             |
| is-dreamer       | trait-dreamer          | A Ceiling Full of Stars  | You doodle a bedroom under a night sky; next morning Orla's letter arrives.                                                      |
| is-perfectionist | trait-perfectionist    | Straight as a Plumb Line | Dr. Faraday visits the hardware shop and asks who painted such crisp edges.                                                      |
| is-trendsetter   | trait-trendsetter      | Window Displays          | Walking Marigold Row, you spot what people are starting to love; next week's tags pin to the inbox.                              |
| is-charmer       | trait-charmer          | The Open Door            | Neighbours pop up for biscuits and tell their friends (+2 buzz once).                                                            |
| is-show-home     | first-show-home        | Bellwind Calling         | Ms. Achebe phones: a show home, an open house, and "make it what people love this week."                                         |
| is-quiet-week    | bankrupt (Challenging) | A Quiet Week             | Ms. Vale: "Every studio has a quiet week. Hollin's needs a shelf stacker." Points to the shift. No game over.                    |

Trait beats are queued when the trait-gated client's letter arrives (Dreamer: Orla; Perfectionist: Dr. Faraday), after the first week (Trendsetter) and after the first reveal (Charmer, +2 buzz once).

## 5. Evaluation, rewards and economy

**Quality** (0–100): `round(100 × (0.25·flow + 0.25·paint + 0.20·floor + 0.20·light + 0.10·fit))`.

- flow, paint, floor, light as in §3; an unfinished wall, path or floor piece counts 0, like ADEEVA's `dressQuality`.
- fit = the share of chosen furniture pieces, paints and the floor whose tags include `classic` or a required tag and that use no avoided colour (soft pieces use the chosen fabric colour).

**Criteria** (ADEEVA ids and weights; `trims` is labelled **Must-haves**):

| Criterion                 | Weight | Pass rule                                                                                                               |
| ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| construction ("Finished") | 3      | Both walls edged and rolled, all 6 floor pieces laid, every planned piece moved in, at least 1 light placed. Mandatory. |
| quality                   | 2      | Quality ≥ brief minimum (+6 on Challenging, ADEEVA `minQualityBonus`).                                                  |
| style                     | 2      | Every required tag appears in the room's tags (furniture ∪ paints ∪ floor ∪ placed lights ∪ placed decor).              |
| colours                   | 1      | No avoided colour. +2 per favoured colour used, up to +4.                                                               |
| trims ("Must-haves")      | 1      | Required item counts placed.                                                                                            |
| budget                    | 1      | Coins spent at the warehouse and the Decor Bin during this run ≤ budget (leftovers from the shelf are free).            |
| deadline                  | 1      | Revealed by the deadline day.                                                                                           |

**Score** = `clamp(round(0.3·passMix + 0.7·quality + colourBonus), 0, 100)`, the same per-game `evaluate` parameters as Workshop (0.3 / 0.7 / 2 / 4). Stars use ADEEVA's `starsForScore` (90/75/55/35). The **pass gate** is construction, style, must-haves and quality, as in ADEEVA. Feedback reuses ADEEVA's `kindFeedback` tone, with one new line: "So close! The brief asked for one more must-have."

**Results kid summary:** "Walk-through: roomy!", "Walls: crisp!", "Floor: snug!", "Light: 4 of 5 spots", "Must-haves: all there!", "Budget: on target!". A low line gets a gentle "next time" tip and a heart instead of a sparkle (for example "Light: 4 of 5 spots. Next time, hang a lamp nearer the dim ones").

**Rewards** (ADEEVA's `rewards` rules and constants):

- **Pass:** `fee × (0.8 + 0.4·score/100)` + trait lines; reputation `1 + round(2·score/100)`; buzz `1 + stars + 3 per trend match`; a trend match adds +10% of the fee. Show homes add Open House enquiries (§3.7).
- **Standard soft fail:** 40% of the fee, reputation −1 (0 for Charmer), kind feedback from the failed criteria. No open house.
- **Relaxed:** every run counts as a pass; stars still reflect quality. Rent ×0.
- **Challenging:** min quality +6; Assist cap 0.7; a fail pays 0 with reputation −3; late reveal costs 50% of the fee; rent ×1.5 (135).

**Traits** (game-flavoured perk text over ADEEVA's mechanics):

| Trait         | Perk text                                                          | Mechanic                                                                                                                                               |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dreamer       | "Big ideas: +15% fee for colourful or bold rooms."                 | +15% fee (engine `dreamerFlair`) when the walls, floor and soft fabrics together use 4+ distinct colours, or the room has the `bold` tag; unlocks Orla |
| Perfectionist | "Steady hands: edging, rolling and floors are 20% more forgiving." | ×1.2 on edge tolerance, `splatSpeed` and floor `dTol`; unlocks Dr. Faraday                                                                             |
| Trendsetter   | "You spot what the street will love next week."                    | Next week's hot tags shown early (so the next show home's tags too); +10% fee per trend match                                                          |
| Charmer       | "Biscuits and chats: a 10% tip on every happy reveal."             | Charmer tip; a near miss never costs reputation                                                                                                        |

**Trends:** the engine's `trendMarket`, given the 8 `RoomTag`s, draws 2 hot tags a week, shown on the hub's mood board as "The street loves: bright, natural."

**Economy:** 10 h day; start 110 coins; rent 90 (Challenging 135) at the end of each 7th day; shift 30. Offers from `offerCountForBuzz` (1–3 a day, 4 pending, 2-day lifetime); active makeovers capped by `MAX_ACTIVE_GIGS`. One makeover is 8–9 h, so a week holds at most 7.

**Sanity checks (Standard; decent play unless stated):**

- **Day 1:** Nana Pearl spend 36 of 110 coins, budget 40–50 (4+ coins left for a cushion or basket at Style). Pay ≈ 55 × 1.18 ≈ 65, net ≈ +29.
- **Net per makeover** (typical spend, score ≈ 95, fee midpoint): Nana Pearl +29, twins +35, Jun +42, Mrs. Halloran +49, Orla +55 (+15 Dreamer), Bluebell +66, Dr. Faraday +80. Bellwind ≈ 155 × 1.18 = 183, + 31 for two trend matches (revealed in the offer's week), − 113 ≈ **+101**, plus up to 60 in enquiries (Trendsetter a further +31).
- **Week 1:** buzz goes +6 a pass and −2 a day, so it stays well under 34 and offers stay at 1 a day: ≈ 6 makeovers. Reputation ≈ +3 a pass: Jun (3) opens day 2, Orla (6) day 3, Mrs. Halloran (8) day 4, Dr. Faraday (10) and Bluebell (12) day 5. Week-1 end ≈ 110 + 6 × 45 − 90 ≈ 290 coins, reputation ≈ 18, so Bellwind (22) and show homes arrive in week 2 as a mid-game reward. Upgrades (670 in all) fill weeks 2–4; loft decor (240) after.
- **Struggling Standard week:** 3 passes (+120), 3 soft fails (0.4 × 75 − 50 materials ≈ −20 each), 1 shift → 110 + 120 − 60 + 30 − 90 = 110. Solvent.
- **Struggling Challenging week:** 4 passes (+160), 2 fails (≈ −50 each), 1 shift → 110 + 160 − 100 + 30 − 135 = 65. A worse week dips below 0 and triggers A Quiet Week.
- **Decent player** (flow 0.95, paint 0.88, floor 0.90, light 1.0, fit 0.8; typical sets score fit 0.75–0.8): quality ≈ 92 → score ≈ 94–98, 5★. **Weak run** (0.80, 0.70, 0.65, 0.75, fit 0.67): quality ≈ 72, which passes every minimum up to 70.
- **Pass rate:** the decent player clears every minimum (55–84), so fails come from a missed tag or must-have, a late reveal or a rough day: expected ≈ 80–90%.
- **Assist everywhere** (0.8 on flow, paint, floor and light, fit 1): quality 82 → score 30 + 57.4 = 87 (4★); two favoured colours lift it to 91 (5★). Assist passes every Standard minimum except Dr. Faraday's (84). On Challenging the 0.7 cap gives quality 73, which passes Nana Pearl, the twins, Jun, Orla, Mrs. Halloran and Bluebell (61–72 with +6) but not Bellwind (76) or Dr. Faraday (90), so 15+ players must play by hand there.
- **Budget pressure:** oak instead of pine adds 10–14 coins in big rooms and gives `classic`; walnut over oak (+7 in the show home) adds `bold`. Nicer choices are real trades, not traps.

## 6. Screens and art direction

**Screens:**

- **Title** (studio-wide) → **New Game** (avatar pre-filled from the studio profile, then trait and difficulty) → **Keys to the Loft**. **Loft Hub:** a sunny loft with a big table. Calendar, hours (10 paint-dot ticks), coins, reputation, buzz, the trend mood board, the inbox of client letters (offers), active makeovers, owned leftovers, upgrades and loft decor, End Day, Shift, Save, Back to Studio.
- **Pick and place:** the blueprint grid with door swing and window marks; a catalogue tray of furniture cards (each with its front sprite, size, price and a Must-have badge), paint chips for the walls and the feature wall, floor sample chips and light cards with sun icons; the Turn and Back to tray buttons, Tidy up, the running plan total against the budget, walk-through space as a percentage, and green or crossed red footprints.
- **Marigold Warehouse:** shelves of tins, stacks of floor samples, furniture on pallets and a decor bin, each with a price and an "On your plan" tick.
- **Paint:** a small cutaway that fills in as each wall is finished, a Back wall / Side wall switch, the edging strips with coverage meters, and the 512 × 320 rolling wall (streaky first coat, solid second coat, sheen and sparkles when done) with the paint tray, load gauge and splat and dry-streak counts. **Floor:** the close-up strip with ghost pieces, the 3-piece tray and the Press button. **Light:** the plan with glow overlays and sun badges, plus a twilight cutaway preview. **Style:** the cutaway with the decor box, soft-fabric swatches and the Decor Bin.
- **Reveal and Results:** the before/after slider (drag the handle, or tap anywhere on the track), the client's reaction, then the kid summary, criteria, stars and reward lines; each screen moves focus to its heading. **Open House:** visitors walking the path and the three panel cards, with Back to the loft below them. The makeover header has its own Settings button, so the helpers are always one tap away.

**Art direction (distinct from ADEEVA, same tokens):**

- **Palette:** ADEEVA's ink, cream, shadow, radius and focus tokens, plus `games/interior/ui/theme.css`: blueprint blue `#3c6aa8`, plan-paper `#eef3f8`, plaster pink `#e9c7b8`, terracotta `#c8664a`, olive `#7d8a4a`, sunbeam `#f6d77a` (light glows only).
- **Shapes and views:** the plan is a clean blueprint (white lines on blue paper, furniture as rounded rectangles with simple symbols that turn with the piece); footprints never rely on colour alone (blocked ones carry a white ✕ and dashed outline). The room is a **dollhouse cutaway** in an oblique projection on a 640 × 420 canvas: with the back wall at row 0, a floor point (col, row) draws at `x = ox + cell·col − shift·row`, `y = oy + depth·row` (cell 56, shift 16, depth 24 and wall height 150, all scaled to fit the room), so the back wall is face-on and the left wall slants toward the viewer. Furniture is drawn back-to-front by its front row, with a soft footprint shadow on the floor. Each piece has one front-view sprite and no per-rotation cutaway art (rotated pieces show their front sprite). Flat shapes, ink outlines and rounded corners; sunlight falls in shafts from the back windows.
- **Motifs:** tape-measure borders, paint-chip cards, blue masking tape, footprint markers, folded letter offers.
- **Fonts:** display `"Futura", "Century Gothic", "Trebuchet MS", sans-serif` as installed system fonts only; body `system-ui`. Nothing is downloaded.
- **Original SVG art:** `InteriorTileArt` (studio tile: a blueprint corner, a freshly rolled stripe, a lamp glow and an armchair); `LoftBackdrop` (arched windows over Marigold Row, the drawing table, swatch fan, and the 3 loft decor overlays); `Wordmark`; `BlueprintGrid` (door swing arc, window marks) with `FootprintMark`; `FurnitureSymbol` (12 plan symbols) and `FurnitureSprite` (12 front sprites, recoloured by fabric colour or wood tone); `RoomCutaway` with `CutawayFloor` (boards with seeded grain from the shared `seededUnit`, tiles, carpet tiles, checker) and window sunbeams; `LightFixture` (6) with radial glows; `DecorArt` (8); `DesignerAvatar` (the shared avatar in a paint-flecked apron with a pencil behind the ear); `Confetti`; the reveal slider and the Open House walkers.
- **Avatar:** in the loft the shared avatar wears a paint-flecked apron and a pencil behind the ear, as a cosmetic overlay (`DesignerAvatar`).
- Motion respects `prefers-reduced-motion`: splats, glows and confetti become single fades; visitors step cell to cell without tweening.

## 7. Reuse map and module

**`GameModule`:** id `interior`; title "Interior Studio"; tagline "Turn empty rooms into places people love."; ages "8–15+"; tileArt `InteriorTile`. Saves: `interior.save.1..3`, envelope version 1. `reputationOf(save) = save.state.reputation`.

**Engine (`src/engine`, per the studio contract):** `rng`, `rngDraw`; `dayHours`, `week`, `weekday`, `weekSettlement` (rent, trend week, first-week and bankrupt triggers); `standing`; `gigBoard` and `gigBoardState` (offers, accept, decline, expiry, lapses, trait-gated arrivals); `difficulty`; `story`, `beatBuzz` and `storyVoice`; `criterionJudge` and `score`; `reward` and `trendReward` (pass, soft fail and fail per difficulty, Charmer tip, Dreamer flair, trend matches); `trendMarket` over the 8 `RoomTag`s; `kindFeedback`; `saveEnvelope`, `parse` and `stateParsers`; `actionCheck`, `activeRunUpdate`, `paidShift`, `upgrades`, `placedPose`, `assistCap`, `earnedReputation`; `geometry/traceAccuracy`, `traceCoverage` and `traceTrack` for edging.

**Shared UI reused:** `ui/kit` (`Button`, `Card`, `Dialog`, `Meter`, `SegmentedControl`, `StarRating`, `StatChip`, `TagPill`, `ToggleSwitch`, `clientToSvg`, `useCountUp`, `useDispatchOnce`, `assistChoices`), `ui/newGame` (avatar, trait and difficulty steps), `ui/art` (`Avatar`, `colourMix`, `seedFromText`, `useSvgId`, `TileBackdrop` viewbox), and the studio's `useGameSession`, `slotStore`, `SettingsContext`, `ToastContext` and `ViewLoadBoundary`.

**Not reused:** each game stays in its own folder, so nothing is imported from ADEEVA or the other games. The coverage grid (rolling) and the pose fit (floor) live in this game's core because no other game shares them yet.

**`GameModule`:** id `interior`; title "Interior Studio"; tagline "Turn empty rooms into places people love."; ages "8–15+"; tileArt `InteriorTileArt`. Saves: `interior.save.1..3`, envelope version 1, parsed by a versioned parser that also checks the run's stages, plan legality and recorded work fit together. `reputationOf` reads the raw save and counts the reputation earned (`earnedReputation`), without importing the core into the main chunk.

**Code (`src/games/interior`):**

- `content/`: `roomTag`, `roomColour`, `softColour`, `roomTemplate`, `paint`, `floor`, `furniture`, `light`, `decor`, `client`, `upgrade`, `loftDecor`, `storyBeat`, `career`, `difficulty`, `trait`, `hints`.
- `core/`: `floorPlan`, `walkThrough`, `tidyLayout`, `planChoice`, `stock`, `warehouse`, `paintWork`, `paintEdge`, `paintRoll`, `paintScore`, `floorLay`, `lighting`, `lightPlacement`, `decorPlacement`, `roomSource`, `roomTags`, `roomColours`, `roomFit`, `mustHaves`, `roomQuality`, `construction`, `criterion`, `kindFeedback`, `roomEvaluate`, `openHouse`, `rewards`, `reveal`, `kidSummary`, `checklist`, `skillTolerance`, `makeoverRun`, `runStage`, `runLifecycle`, `stageNavigation`, `stageReadiness`, `hourCost`, `brief`, `offers`, `calendar`, `storyQueue`, `guide`, `loftShop`, `newGame`, `gameState`, `action`, `reduce`, `save` with `gameStateParser`, `briefParser`, `runParser`, `resultParsers` and `runConsistency`, and `testPlaythrough` for tests.
- `ui/`: title, new game, story, settings, Loft Hub, and the makeover flow (brief, Pick and place, warehouse, paint, floor, light, style, reveal, results with the Open House), plus the art in §6.
- Tests: a unit test per rule, including flow on blocked and unreachable use cells and with no pieces; every client's tidy layout reaching flow ≥ 0.9; tidy layout plus typical lights via Show me lighting every spot in the brief's mood; `typicalSpend` matching and fitting every lowest budget with 4 spare; lux at the 0.30/0.60/1.00 boundaries; dry strokes and reloads; splat speed at the edge; wrong floor picks rejected; `d` at the gate; Open House enquiries clamping; each difficulty's reward path; each trait perk; trait-gated clients; illegal actions returning the same state; save round trips and damaged saves; determinism; a full scripted makeover. Also a test that every hint is ≤ 12 words and every client line ≤ 2 sentences, and a test that no `@font-face`, font `url(` or network fetch exists under `src/games/interior`. End-to-end: `e2e/interior/makeover.spec.ts` (a Day-1 reading nook made by hand and revealed, then saved, reloaded and continued; a rejected door-swing placement) `e2e/interior/showHome.spec.ts` (a Bellwind show home styled by keyboard, revealed and played through the Open House; plan focus, double taps and Settings from the makeover) and `e2e/interior/studio.spec.ts` (home → game with the studio avatar pre-filled → back home).

## 8. Safety notes for this theme

- **No real DIY instructions.** Brushes, rollers and floor pieces are game tools. There are no techniques, measurements, product names, fumes, drying times or "how to" steps, and no ladders are shown. The Paint screen always shows: "Real painting and ladders need a grown-up. Ask an adult first."
- **No electrics.** Lights are placed decorations; nothing is wired, plugged or switched at a socket, and no screen shows cables, sockets or bulbs being changed.
- **No real plans.** Grid sizes are game numbers. There is no printable plan, and nothing suggests a real room can be built or furnished from them. Kids are never shown climbing furniture; the top bunk always has its rail.
- **No bodies, no appearance talk.** Clients and visitors comment on the room, never on themselves or others. Avatars react with expressions only; no person is scored. Footprints, sun icons and pass/fail marks pair colour with a shape or icon.
- **No home-value or wealth judgement.** Budgets are "what the client wants to spend"; small rooms and small budgets are never lesser. No room is called messy, poor or ugly; "before" rooms are simply empty and grey.
- **Neutral, kind briefs.** Colours and tags come from the person's tastes ("Kit loves sunshine yellow"), never "for girls" or "for boys", and no avoided colour hints at a gender rule. The twins choose together; their dad books and pays.
- **Privacy.** No photo import of real rooms, no camera, no sharing. Everything is drawn in SVG and saved only on the device.
- **Randomness is free.** Briefs, trends and offers come from the seeded RNG; nothing can be rerolled or bought with money. Loft decor is fixed-price and cosmetic. No ads, no chat, no network.

## 9. Out of scope for this slice

- A second career (estate stager, set designer, shop fitter), hiring a helper, multi-room homes, walls you move, doors you add, kitchens and bathrooms (water, appliances), wallpaper patterns, and stairs.
- Curtains and sewing, trait-gated clients for Trendsetter and Charmer (story beats only), more than one show home a week, free-angle 3D views, per-rotation cutaway art, camera walk-throughs, lighting by time of day, and furniture you build yourself (that is Workshop & Wood's job).
- Printable plans, photo import, real product catalogues, and any online sharing or leaderboards.
