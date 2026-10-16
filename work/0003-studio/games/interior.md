# Interior Studio — Game Design (id: `interior`)

A Maker Studio game (`work/0003-studio/design.md`). §1–§9 describe the playable slice; §10 grows it to ADEEVA's depth. You rent the little loft above Hollin's Hardware on Marigold Row and become the street's room maker. Neighbours bring you a room and a wish. You pick and place furniture on a floor-plan grid, shop for paint, flooring and lights within a budget, paint the walls, lay the floor, light the room and style it with decor and soft fabrics. Then you reveal it to the client. Later a builder asks you to dress a show home for an open house, and in the end hands you the keys to a whole new street of homes (§10). All names, text and art are original, and the studio safety promise applies on every screen.

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

**First career:** _Junior Room Designer_ (the second, Show-Home Designer, is in §10.1) in "The Loft on Marigold Row". Start: 110 coins, reputation 0, weekly rent 90 (Challenging ×1.5 = 135; Relaxed 0), paid to Ms. Odette Vale, a retired stage-set painter who owns the building. Shift: "Stacking shelves at Hollin's Hardware" pays 30 coins for a whole untouched day, on every difficulty.

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

From reputation 22 (about week 2), at most one Bellwind Homes offer appears per week, in the Room Designer career only; Show-Home Designers get whole homes instead (§10). Bellwind is drawn from the eligible pool like any client, so `core/offers.ts` adds a gentle catch-up: from reputation 22, Room Designer only, if no Bellwind offer has arrived this week by weekday 3 and none is pending or active, that day's roll draws Bellwind first (tested). Its required tags are the week's two hot tags, copied into the brief when the offer is made. The reveal's trend bonus uses the hot tags current at reveal, so a brief that crosses a week boundary may lose its trend matches. After a passing reveal (every reveal on Relaxed), an **Open House** plays below the results: 6 visitor avatars step from cell to cell along the walk-through path from the door, and three cards score the room:

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

**Engine (`src/engine`, per the studio contract):** `rng`, `rngDraw`; `dayHours`, `week`, `weekday`, `weekSettlement` (rent, trend week, first-week and bankrupt triggers); `standing`; `gigBoard` and `gigBoardState` (offers, accept, decline, expiry, lapses, trait-gated arrivals); `difficulty`; `story`, `beatBuzz` and `storyVoice`; `criterionJudge` and `score`; `reward` and `trendReward` (pass, soft fail and fail per difficulty, Charmer tip, Dreamer flair, trend matches); `trendMarket` over the 8 `RoomTag`s; `kindFeedback`; `saveEnvelope`, `parse` and `stateParsers`; `actionCheck`, `activeRunUpdate`, `paidShift`, `upgrades`, `placedPose`, `assistCap`, `earnedReputation`; `geometry/traceAccuracy`, `traceCoverage` and `traceTrack` for edging.

**Shared UI reused:** `ui/kit` (`Button`, `Card`, `Dialog`, `Meter`, `SegmentedControl`, `StarRating`, `StatChip`, `TagPill`, `ToggleSwitch`, `clientToSvg`, `useCountUp`, `useDispatchOnce`, `assistChoices`), `ui/newGame` (avatar, trait and difficulty steps), `ui/art` (`Avatar`, `colourMix`, `seedFromText`, `useSvgId`, `TileBackdrop` viewbox), and the studio's `useGameSession`, `slotStore`, `SettingsContext`, `ToastContext` and `ViewLoadBoundary`.

**Not reused:** each game stays in its own folder, so nothing is imported from ADEEVA or the other games. The coverage grid (rolling) and the pose fit (floor) live in this game's core because no other game shares them yet.

**`GameModule`:** id `interior`; title "Interior Studio"; tagline "Turn empty rooms into places people love."; ages "8–15+"; tileArt `InteriorTileArt`. Saves: `interior.save.1..3`, schema version 1 in the slice and 2 from §10.9, parsed by a versioned parser that also checks the run's stages, plan legality and recorded work fit together. `reputationOf` reads the raw save and counts the reputation earned (`earnedReputation`) without importing the core into the main chunk; from §10.1 it subtracts the start reputation of the career the save started as.

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

## 9. Out of scope (slice and depth)

- A third career (estate stager, set designer, shop fitter); walls you move, doors you add, kitchens and bathrooms (water, appliances), wallpaper patterns, stairs and gardens you plant.
- Curtains and sewing, free-angle 3D views, per-rotation cutaway art, free camera fly-throughs, real time-of-day lighting, and furniture you build yourself (that is Workshop & Wood's job).
- More than one home project at a time, more than 3 crew, crew who can be told off, rated or let go in anger, and any crew job beyond paint, floor and light.
- House prices, sales, mortgages, rents for the homes, "investment" or "flipping" language, and any home valued in money.
- Printable plans, photo import, real product catalogues, and any online sharing or leaderboards.

## 10. Depth: Show-Home Development

Phase B (`work/0003-studio/roadmap.md`) grows Interior Studio to ADEEVA's depth. ADEEVA runs Student → Label, with 3-look collections and an animated runway. Here the **Junior Room Designer** becomes a **Show-Home Designer**. Ms. Achebe of Bellwind Homes hands over the keys to **Larkspur Close**, a new street of six finished-but-empty homes. For each home you plan a whole home, not one room: several rooms that share one palette and flow from the front door to the last room. You source everything from Bellwind's **project purse**, hire a small grown-up crew to take on paint, floor and light jobs, and end each project with an **Open House**. This is an animated walk-through of the finished home, with four warm panels of neighbours. Nobody is ranked, sent home or timed against a rival, and the homes are never priced or sold. Everything in §1–§9 still applies unless this section changes it.

All new clients, furniture, paints, floors, lights and decor (§10.7) are open in **both** careers through their reputation gates, so a Room Designer meets new content in week 2. Only projects, crew, the Open House and the new upgrades belong to the Show-Home career.

### 10.1 Careers, unlock and "start here"

`content/career.ts` becomes `CAREERS` (`CAREER_IDS = ["loft", "development"]`); the slice's `CAREER` is the `loft` entry, unchanged.

| id          | on screen          | base                                         | start coins | start rep | weekly rent (Standard)                                          | shift (any difficulty)              |
| ----------- | ------------------ | -------------------------------------------- | ----------- | --------- | --------------------------------------------------------------- | ----------------------------------- |
| loft        | Room Designer      | The Loft on Marigold Row                     | 110         | 0         | 90 (135 Challenging)                                            | "Stacking shelves at Hollin's", 30  |
| development | Show-Home Designer | the loft plus the Site Cabin, Larkspur Close | 380         | 34        | 140 while a project is open, else 90 (210 / 135 on Challenging) | "Sweeping up at the site cabin", 45 |

- **Unlock (same save):** `larkspurOfferReady` needs career `loft`, **reputation ≥ 34**, **makeovers delivered ≥ 14**, **at least 1 passed Bellwind show home** (a log entry with an Open House), and `is-larkspur-offer` not yet seen. It is checked after each reveal and at End Day. When it passes it queues the trigger `larkspur-offer`. A decent Standard player gets there at the start of week 3 (days 15–19): about +3 reputation and 6 makeovers a week, with Bellwind arriving in week 2 at the latest on weekday 3 thanks to §3.7's catch-up draw, so the show-home requirement never waits on luck. That is the same pace as ADEEVA's Student Showcase (reputation 40, 8 gigs) and Patisserie's parlour key.
- **Story beat `is-larkspur-offer`:** Ms. Achebe walks you down a new street of six front doors. This is the game's first story choice, using Patisserie's `storyChoice` pattern (typed effect `open-larkspur`). **"Take the keys"** dispatches `openLarkspur`. **"Not yet"** sets the flag `larkspur-later`, and the hub then keeps a **Larkspur Close** card with the same button (`canOpenLarkspur`), so the offer can never be missed.
- **`openLarkspur`:** sets `career: "development"` and keeps coins, reputation, buzz, stock, upgrades, loft decor, log, active makeovers and any open run. It creates `larkspur` (§10.9) at plot 1 and plays `is-larkspur-keys`. Bellwind single-room offers stop rolling; one already pinned stays and can be finished. It is illegal when already `development` or below the thresholds, and then returns the same state reference.
- **"Start here" (older players):** New Game gains a **Career** step between Trait and Difficulty, using the shared `ui/newGame/CareerStep` with `careerFacts` cards. **Room Designer** ("Start small: one room, one neighbour at a time. Great for first-timers.") is preselected. **Show-Home Designer** ("For designers who know the loft: whole homes, a crew and Open Houses. Suggested 12+.") is a suggestion, never a gate. A Show-Home start gets 380 coins, reputation 34, the Long-Reach Brush and Floor Spacer Kit, "Ms. Vale's housewarming shelf" (1 tin each of Chalk White, Sea Glass and Morning Sky, and 1 paper pendant), the guide on for home steps only, and the intro beat `is-larkspur-intro` in place of `is-keys`.
- **Studio reputation:** `profile.startedAs: CareerId` is set at New Game and never changes. It is read by an Interior profile parser (`interiorProfile`) built on the shared `ProfileBase`. `module.reputationOf` switches from `traitGatedReputation` to `earnedReputation(..., (profile) => startOf(profile.startedAs))`, like Patisserie. A missing `startedAs` (v1 saves) counts as `loft` (start 0). Taking the keys never changes earned studio reputation.

### 10.2 How play changes

- **Projects:** the hub's Larkspur tab shows the street: six plots, the current plot glowing, the Key Wall (§10.5) and the crew board. **Start a project** (`startProject {storyId}`) is legal when no project is open and the plot is ready. It offers two home stories (a seeded draw from §10.6) and the player picks one. Bellwind pays **half the design fee** on signing. Project days count from `project.startDay` (any day, not only a week start): **Open House day** is `startDay + 12`. Staging is legal from `startDay + 7` (once every room is ready) to `startDay + 13`, and `startDay + 13` is late (−10, except on Relaxed). An early Open House gives younger players the moment sooner and gives the crew order a real pace goal, but changes no money: the project stays open, and rent stays 140, until `startDay + 12`, and the next project starts no earlier than `startDay + 13`.
- **Rent follows the project:** a settlement while a project is open charges 140 (Site Cabin plus loft); otherwise 90. A quiet fortnight between projects is therefore always cheaper and needs no special action.
- **Makeovers keep coming.** All 16 clients (§10.7) still send letters. A home room and a makeover never run at once: opening a home room while a makeover run is open is refused with "Finish or set aside your makeover first."
- **Project stages:** `map → palette → rooms → planner → show → done`. **Plan the home** (map and palette together) costs 1 h. Each room is a `MakeoverRun` with `purpose: { kind: "home-room", roomIndex }` and the stages `brief (purpose card) → plan → shop → paint → floor → light → style → ready`, using §2's hours; the reveal slider is saved for the Open House. **Back to the home** (`closeHomeRoom`) stores the room in `project.rooms[i]` with all its work, and `openHomeRoom {roomIndex}` resumes it. "Ready" is the construction rule (§5) and costs 0 h. An open home room lives in `activeRun`, like any makeover.
- **Home-room brief** (`core/homeRoom.ts`, `homeRoomBrief(plot, purpose, story, purse)`), so every `MakeoverRun` field stays defined: `clientId` is the constant `"bellwind"` with `showHome: false`; `requiredTags` = [the purpose's tag]; `favouredColours` = 2 colours drawn from the story palette; `avoidColours` = []; `budget` = the purse left; `fee` = 0; `minQuality` = 0; `deadlineDay` = `startDay + 13`; and `gigId` = `home-<plotId>-<roomIndex>`. `reveal` and `rewards` are never called on a home room, and the `lapseOverdueState(run => run.gigId)` callback returns `null` for home rooms, so no gig ever lapses because of one.
- **Project purse (sourcing):** shopping for a home room at the **Larkspur Supply Yard** (the warehouse screen, recoloured) spends from `project.purse`, never from coins. Crew wages come out of it too. The leftover shelf is still free. Spending is checked atomically. When the purse is short, **Top up the purse** moves coins in steps of 10; it is an atomic choice and never automatic. On Relaxed, Ms. Achebe tops it up by the shortfall for free ("Bellwind added a little"). A room's budget criterion becomes "within the purse". Purse-bought pieces go on Bellwind's own project shelf, which only that home's rooms can use (together with the player's leftover shelf); whatever is left on it goes back to Bellwind when the doors open, so the purse can never be turned into the player's stock. Unspent top-ups come back with the Open House pay, and Top up is refused at the Supply Yard while the purse already covers the plan.
- **Hub additions:** the Larkspur street strip, the project card (days to Open House, purse, rooms ready), the crew board, the Key Wall and the Site Cabin decor.

### 10.3 Crew (small, grown-up, kind)

Crew members are adults Bellwind recommends. You may have **2** hired at once (3 with Crew Walkie-Talkies). Hiring and finishing working together are free, and legal only while no crew job is assigned today; a crew member with a job today cannot be finished. So the cap really is 2 (or 3) jobs a day. Wages are paid per job from the purse.

| id     | name          | speciality  | paint | floor | light | wage per job |
| ------ | ------------- | ----------- | ----- | ----- | ----- | ------------ |
| rosa   | Rosa Mendes   | painter     | 0.80  | 0.64  | 0.66  | 14           |
| tobi   | Tobi Adeyemi  | floor layer | 0.64  | 0.80  | 0.66  | 14           |
| hana   | Hana Kowalska | lighting    | 0.66  | 0.64  | 0.82  | 13           |
| marcus | Marcus Reid   | all-rounder | 0.72  | 0.72  | 0.72  | 12           |

- **Assign** (`assignCrew {crewId, roomIndex, job}`): legal when the crew member is hired and free today, the job is that room's next hands-on step (paint, then floor, then light; the player may do any of them by hand instead), the room's plan is bought, the room is not open, and the purse covers the wage, which is paid at once. Each crew member does **one job a day**. It finishes at **End Day** ("Rosa painted the Snug."), and the first crew job locks the room exactly as a first paint stroke does.
- **Crew work is deterministic:** `crewSkill = min(0.86, base + 0.01 × min(6, jobsDone[job]) + 0.03 with the Tool Trailer − 0.04 on Challenging)`. A paint job writes every edge path and roll at that accuracy; a floor job lays all 6 pieces at it; a light job hangs the room's planned lights by Show me placement, with the light score capped at it. Records carry `byCrew: true` and never count as "assisted". A specialist on their own job starts at 0.80 and anyone off their speciality at 0.64–0.72, while a decent hand is ≈ 0.88–0.90. The crew buys time, not quality: a home with crew on every job, uncoached, scores at least 3 overall below the same home done by hand (tested), so matching jobs to specialists matters and the hero room is worth doing yourself.
- **Show the crew how** (`coachCrew {job, record}`; 1 h, or 0 h with the Sample Board; once per job kind per project): a short demo in the real mini-game. Paint is one 54 cm tape and a 4 × 2 roll patch; floor is 3 pieces of the room's floor; light is a 4 × 3 sample corner with 2 spots and 1 lamp. `demo` is scored by the usual rules, with the usual Assist cap. For the rest of the project, crew on that job work at `max(crewSkill, min(0.88, 0.4·crewSkill + 0.6·demo))`, so a good demo lifts a specialist to about a decent hand, never past it.
- **Fun at 8 and at 15:** at 8, a friendly crew card that paints the room overnight. At 15: match each job to the right specialist, coach them, and decide which room is worth your own hands.

### 10.4 Mini-game twists (plan, paint, floor, light and style in fresh ways)

| twist          | on screen               | reuses                       | rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------- | ----------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home-map`     | "Who lives where?"      | Pick and place tray and drop | The home's empty **spaces** take the home's **purpose cards** (§10.6). Spaces show as "Space 1", "Space 2" and "Space 3" with their shape, size in cells, windows and a front or back side, never their template names. Drag a card, or tap a card then a space; on keyboard use Enter and the arrows. A space with fewer cells than the purpose minimum refuses the card ("That space is too small for a Main Bedroom."; illegal → same reference). `mapFit` per room = 0.25 (it fits, which a legal placement always does) + 0.375 (window wish met, or no wish) + 0.375 (quiet wish met: quiet purposes want a back space; always met for the others). A roof window counts as a window. Map = the mean over the purpose rooms; the entrance hall is fixed and does not count. "Ms. Achebe's map" (the best fit) is one tap on every difficulty and is pre-filled on Relaxed. |
| `home-palette` | "One home palette"      | paint and floor chips        | Pick 3 paints and 1 hall floor as the home palette (paints only on plot 1, which has no hall); the story card's 4 colours are marked. Rooms may use any paint, but palette chips sit first in the tray with a ribbon.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `through-door` | "Path to the next door" | walk-through                 | Each space except the last has a **through door** on its right wall at a set row. Its cell is kept clear like the door swing (a hard rule: "Keep a path to the next door."). It counts as "reached" when the walk from the room's door reaches it. Footprints show the path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `two-tone`     | "Two-tone wall"         | edging and dip-and-roll      | Optional on the back wall only, in place of a feature wall: `plan.lowerPaint` and `plan.featurePaint` cannot both be set (illegal → same reference). The lower paint is a second tin bought with the plan, and its tags and colour count in `roomSource`, fit and colours. The mid-wall tape is a third open edge path on the back wall, scored as §3.2. Coverage rows 0–2 take the top paint and rows 3–4 the bottom paint. There are two trays; tapping one loads the roller and sets the run's `rollerZone` (`"top"` or `"bottom"`), so `RollRecord.passes` stays a count per cell. A pass in the wrong zone **adds no pass** and adds 1 **smudge**, which counts like a splat: `roll = coverage × max(0.7, 1 − 0.05·(splats + smudges)) × dry factor`. It counts as a feature wall for Wow and Colour flow.                                                                  |
| `threshold`    | "Where floors meet"     | floor pick and press         | When the room's floor differs from the hall floor **and both share a pattern** (boards, tiles or checker), pieces 1–3 of the 6-piece close-up use the hall floor's colour in the room's pattern geometry and pieces 4–6 use the room's floor. The tray mixes both, and a wrong-floor pick says "That piece belongs to the other floor." Otherwise there is no threshold. Scoring is unchanged. Plots with no entrance hall (plot 1) skip the hall floor chip and the threshold.                                                                                                                                                                                                                                                                                                                                                                                                  |
| `glow-path`    | "Light the way"         | light placement and lux      | The cells on the shortest walk from the room's door to its through door are a **path**. A path cell with ≥ 1 sun (lux ≥ 0.30) glows. The room's light score is unchanged; the path share feeds the Light panel.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `story-pieces` | "Story pieces"          | style and Decor Bin          | The home story names 2 story pieces (§10.6). A room "tells the story" when a story piece is placed in it **and** one of its surfaces (wall, feature, lower or floor) is a story-palette colour. Visitors notice them in the show.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

### 10.5 The Open House (the event moment, like ADEEVA's runway)

1. **Planner** (`planOpenHouse {plan}`, one action): the **tour order** of the rooms after the hall ("Save your favourite room for last"); the **music**, one of ADEEVA's 4 runway moods, each with a word (dreamy-strings "dreamy", beach-pop "sunny", synth-pulse "lively", classic-jazz "mellow"); and the **time** (`morning` "fresh", `afternoon` "golden", `evening` "cosy"). Radio groups use `useRovingRadio`. The story card shows its two mood words, so choosing is a reading puzzle. "Ms. Achebe suggests…" fills in the matching music and time and puts the best room last; one tap confirms. As with Assist (§3), a suggestion is capped on Standard and Challenging: a Home map taken from Ms. Achebe counts at most 80, and a Welcome or Tour taken from her counts at most 70. On Relaxed they stay uncapped and pre-filled. Reading the story card yourself is what lifts these parts at 15.
2. **Show** (`stageOpenHouse`, 2 h; legal as in §10.2): the Bellwind sign turns to "Open House" and the front door swings open on the title card ("Open House at No. 3 Larkspur Close"). Six visitor avatars (the studio `Avatar`; adults and family groups) walk the home, drawn as a row of connected dollhouse cutaways (`HomeStrip`), while the camera pans room to room in tour order. In each room the visitors step along the walk path cell by cell, the lights warm up for the chosen time of day, the glow path lights underfoot, and each story piece sparkles with a speech bubble ("A shell jar! Someone loves the sea."). The last room gets the reveal-slider moment (the visitors cover their eyes, then a whole-home before/after), with petals and clapping. Then the four panel cards flip up and count up. It takes ≈ 30 s for 4 rooms, and **Skip** appears after the first room. With reduced motion, crossfaded stills with captions replace the animation (ADEEVA's `STILL_MS`), with the same timing and Skip.
3. **Panels** (each 0–100, from the engine's `panel()`). Members are adult neighbours and are never called judges.

| panel (members)                                                                                         | parts (weight)                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Flow**: the Walking Club (Mr. Ferdinand Oyelaran, retired postman; Ms. Gwen Abernathy, dance teacher) | Walk-through 0.5 = 100 × mean room flow; Through-ways 0.3 = 100 × through doors reached ÷ through doors; Home map 0.2 = 100 × map fit                                                                                                                                                                                                    |
| **Light**: the Lamp Room (Mrs. Inês Carvalho, lamp-shop owner; Mr. Sol Brightwater, star-gazing club)   | Spots 0.6 = 100 × mean room light score (capped as in §3.4); Glow path 0.2 = 100 × glowing path cells ÷ path cells; Mood 0.2 = 100 × mean moodMatch                                                                                                                                                                                      |
| **Comfort**: the Kettle Club (Grandad Teo Marsh; Ms. Priya Sood, community-centre organiser)            | Finish 0.5 = 100 × mean over rooms of (0.5·paint + 0.5·floor); Cosy 0.3 = 100 × share of rooms with the `cosy` or `calm` tag; Colour flow 0.2 = 100 × (0.5 × share of rooms whose wall paint is in the palette + 0.5 × share of neighbouring spaces, in map order, that share ≥ 1 surface colour; with no hall, the palette paints only) |
| **Story**: the Story Table (Ms. Odette Vale; Mr. Kwame Boateng, librarian)                              | Story pieces 0.4 = 100 × share of rooms telling the story; Home tags 0.2 = 100 × share of the story's 2 tags in the home's tags; Welcome 0.2 = engine `stagingScore(bestMusic, bestTime)`; Tour 0.2 = engine `closerStrength` of room qualities in tour order                                                                            |

4. **Overall** = engine `overallScore(panels, lateShowPenalty)`. **Keys** come from fixed bands, never from placings: Welcome Key (< 55, "Thank you for opening your doors!"), Copper Key (55–69), Silver Key (70–84), Gold Key (85–94) and Larkspur Star (95+). Verdict words: Delighted ≥ 85, Loved it ≥ 70, Enjoyed it ≥ 55, Warmly welcomed below that. **Open House Notes** gives one kind line per panel (praising its strongest part) plus one "Next time, try…" tip from the engine's `qualityTip`.
5. **Rewards (`openHousePrize`):** the second half of the fee, `round(0.5 × fee × (0.8 + 0.4 × overall ÷ 100))`, or `round(0.5 × fee × max(1, 0.8 + 0.4 × overall ÷ 100))` on Relaxed, so Relaxed always pays at least the full fee; **visitor notes**, `clamp(floor((overall − 55) ÷ 5), 0, 8) × (8 + 2 × plot)` coins; **careful sourcing**, `min(round(0.5 × purse left), round(0.15 × purse))`; reputation from the engine's `showReputation` (gentle setbacks: 0, or −1 on Challenging); and buzz `round(overall ÷ 10)`. The key goes to `larkspur.keyWall[plot]` if it beats the one already there.
6. **Street progress:** the bar is overall ≥ **60** on Standard (≥ 65 on Challenging; any score on Relaxed). Below the bar, Bellwind offers "the sister home next door": the same plot with a new story. At or above the bar with this plot's key at Silver or better, the next plot opens (on Relaxed the player taps **"Move to the next plot?"**, so nobody is pushed into four-room homes). At or above the bar with a key below Silver, Ms. Achebe asks on any difficulty **"Stay for the sister home next door?"** or **"Move to the next plot"**, so a Copper never locks a hook away for weeks. There is no step back. After plot 6, **Larkspur Close, phase two** cycles the plots again; phase two and every later cycle use fees ×1.1, never compounding.
7. **Missed Open House:** if a project is not staged by the end of `startDay + 13`, the next morning stages it with Ms. Achebe's plan ("We opened the doors for you."). Bellwind's crew finish any unfinished paint, floor or light step at 0.6. A room that was never planned gets a tidy layout of its must-haves at 0.6, with no story piece. The −10 late penalty and the 0.6 work lower the score, and the key still hangs.
8. **Key Wall and finale:** the cabin has a board with one hook per plot. `is-street-of-homes` plays once all 6 hooks hold Silver or better and at least one Gold has been won; a decent player gets there in about 12–14 weeks. Gold on all 6 is an optional collection (`is-every-gold`). Play continues afterwards.

### 10.6 Plots, purposes and home stories

| plot | id             | name            | spaces (template, side; hall first)                                    | purposes to place     | purse | fee | typical spend + crew |
| ---- | -------------- | --------------- | ---------------------------------------------------------------------- | --------------------- | ----- | --- | -------------------- |
| 1    | garden-flat    | The Garden Flat | snug (back), main-bedroom (front)                                      | living, kids          | 150   | 330 | 107 + 28             |
| 2    | corner-cottage | Corner Cottage  | entry-hall, living-room (front), main-bedroom (back)                   | living, kids          | 240   | 340 | 162 + 56             |
| 3    | blue-door      | The Blue Door   | entry-hall, quiet-study (front), dining-room (back)                    | dining, study         | 205   | 350 | 130 + 56             |
| 4    | twin-gables    | Twin Gables     | entry-hall, living-room (front), main-bedroom (back), kids-room (back) | living, bedroom, kids | 330   | 400 | 215 + 84             |
| 5    | willow-house   | Willow House    | entry-hall, dining-room (front), kids-room (back), garden-room (back)  | dining, play, garden  | 295   | 410 | 183 + 84             |
| 6    | larkspur-end   | Larkspur End    | entry-hall, show-lounge (front), main-bedroom (back), snug (back)      | living, bedroom, snug | 345   | 460 | 219 + 84             |

**Rule:** `purse ≥ 1.1 × (typical spend + 14 × 2 × (rooms − 1))`, where rooms counts the hall and 14 is the suggested specialists' wage, rounded up to a multiple of 5 (test `everyHomeTypicalSpendFits`); the Relaxed purse is ×1.2. Typical spend is for Ms. Achebe's map, counted per room as its must-have furniture, one 6-coin tin, Oak Boards for the room, two 5-coin lights and a 3-coin story piece. Each space except the last has a through door, with its row set in content.

**Every map is a choice** (except plot 1, the forced tutorial: only the larger space holds a Living Room). Plot 2: the Living Room fits either space, so putting the Little Bedroom at the front is legal but scores 0.8125 against 1.0. Plot 3: the Dining Room and the Study can swap between two 30-cell spaces; the best map puts the Study in the quiet back space, whatever it looks like. Plot 4: the Living Room and Main Bedroom can swap (1.0 against 0.875). Plot 5: the Garden Room wants the space with three windows, though the Dining Room also fits it (1.0 against 0.875). Plot 6: as plot 4, with the Snug in the small back space. Tests check that:

- `everyPlotMapIsAChoice`: plots 2–6 each have at least 2 legal maps, a unique best map, and best − second ≥ 0.1;
- `everyPurposeFitsItsLegalSpaces`: for every purpose and every space it may legally take, `tidyLayout` places the must-haves plus the through doors with flow ≥ 0.9;
- Ms. Achebe's map is the best map, with fit ≥ 0.85;
- the tidy layout keeps every through door reached;
- the typical lights light every spot in the purpose's mood.

**Purposes** (`roomPurpose`; the hall is fixed). The purpose sets each room's brief (must-haves, tag, mood); colours come from the story.

| id      | name           | min cells | window wish | quiet | must-haves                    | tag     | mood |
| ------- | -------------- | --------- | ----------- | ----- | ----------------------------- | ------- | ---- |
| hall    | Entrance Hall  | —         | —           | —     | console-table 1, hall-bench 1 | classic | warm |
| living  | Living Room    | 35        | 1 window    | no    | sofa 1, armchair 1            | cosy    | warm |
| bedroom | Main Bedroom   | 30        | 1 window    | yes   | double-bed 1, bedside-table 2 | calm    | warm |
| kids    | Little Bedroom | 20        | 1 window    | yes   | single-bed 1, toy-box 1       | playful | any  |
| study   | Study          | 20        | —           | yes   | desk 1, desk-chair 1          | modern  | cool |
| dining  | Dining Room    | 30        | 1 window    | no    | dining-set 1                  | natural | warm |
| snug    | Snug           | 20        | —           | yes   | armchair 1, bookcase 1        | cosy    | warm |
| play    | Playroom       | 25        | 1 window    | no    | play-tent 1, bean-bag 1       | playful | any  |
| garden  | Garden Room    | 30        | 2 windows   | no    | daybed 1, plant-stand 1       | natural | any  |

Home rooms have no minimum-quality gate. The room card shows a "Ready for visitors" mark of 70 (+6 on Challenging) as guidance only.

**Home stories** (`homeStory`, 8; each story's mood words are its music word and its time word)

| id              | on screen                        | tags            | palette                        | story pieces                | best music     | best time |
| --------------- | -------------------------------- | --------------- | ------------------------------ | --------------------------- | -------------- | --------- |
| seaside-days    | A family who loves the seaside   | calm, natural   | sky, teal, ivory, coral        | shell-jar, boat-print       | beach-pop      | morning   |
| garden-growers  | Neighbours who grow everything   | natural, bright | sage, emerald, mustard, ivory  | herb-pots, potted-fern      | classic-jazz   | morning   |
| music-makers    | A home full of music             | classic, bold   | navy, gold, ruby, ivory        | record-frame, wall-clock    | synth-pulse    | evening   |
| book-lovers     | Readers in every room            | cosy, classic   | ruby, sage, ivory, honey-wood  | book-stack, framed-print    | dreamy-strings | evening   |
| young-explorers | Explorers big and small          | playful, bold   | mustard, coral, teal, navy     | map-poster, paper-bunting   | beach-pop      | afternoon |
| star-gazers     | Star gazers                      | cosy, bold      | navy, lavender, gold, charcoal | planet-mobile, star-garland | dreamy-strings | evening   |
| quiet-makers    | Makers who love calm             | calm, modern    | charcoal, sage, ivory, coral   | clay-vase, woven-basket     | classic-jazz   | morning   |
| get-togethers   | A family who loves get-togethers | playful, bright | coral, mustard, sky, blush     | cushion-pile, round-rug     | synth-pulse    | afternoon |

### 10.7 Content, about twice the slice

| kind           | slice | added | total | added ids                                                                                                                                              |
| -------------- | ----- | ----- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| room templates | 8     | 8     | 16    | entry-hall, snug, kids-room, home-office, dining-room, loft-studio, garden-room, main-bedroom                                                          |
| paints         | 8     | 8     | 16    | rose-quartz, rosehip, ruby-velvet, fern-gully, plum-dusk, storm-cloud, golden-hour, blackboard                                                         |
| floors         | 7     | 7     | 14    | cherry-boards, whitewash-boards, slate-tiles, meadow-carpet, sunny-tiles, mosaic-teal, blue-check                                                      |
| furniture      | 12    | 12    | 24    | double-bed, bedside-table, chest-of-drawers, dining-set, sideboard, console-table, hall-bench, bean-bag, play-tent, plant-stand, upright-piano, daybed |
| lights         | 6     | 6     | 12    | lantern-pendant, track-spots, table-lamp, globe-lamp, picture-light, starry-nightlight                                                                 |
| decor          | 8     | 8     | 16    | shell-jar, boat-print, herb-pots, record-frame, book-stack, map-poster, clay-vase, planet-mobile                                                       |
| clients        | 8     | 8     | 16    | castellanos, grandpa-amos, ms-nakamura, supper-club, ms-farrow, bea-and-rufus, solenne (Trendsetter), the-hollins (Charmer)                            |
| upgrades       | 4     | 4     | 8     | sample-board, crew-radio, tool-trailer, supply-account                                                                                                 |
| loft decor     | 3     | 3     | 6     | street-map (50), key-hooks (90), cabin-bunting (40)                                                                                                    |
| story beats    | 9     | 17    | 26    | the story table below                                                                                                                                  |
| new kinds      | —     | 37    | 37    | 2 careers, 6 plots, 9 purposes, 8 home stories, 4 crew, 5 keys, 3 tour times                                                                           |

Each line below gives, per id, the same columns as the matching §4 table, in that order.

- **Room templates** (name, grid, door column, windows): entry-hall Entrance Hall 4×6 (24), 1, side 2–3 · snug Snug 5×4 (20), 3, back 1–2 · kids-room Little Bedroom 5×5 (25), 3, back 1–2 · home-office Home Office 5×5 (25), 3, side 1–2 · dining-room Dining Room 6×5 (30), 4, back 1–4 · loft-studio Loft Studio 6×5 (30), 4, roof window · garden-room Garden Room 7×5 (35), 5, back 1–2 and 4–5, side 1–2 · main-bedroom Main Bedroom 7×6 (42), 5, back 2–4. Window frames follow §3.2.
- **Paints** (name, colour, price, tags): rose-quartz Rose Quartz, blush, 6, calm + cosy · rosehip Rosehip, rose, 6, playful + bold · ruby-velvet Ruby Velvet, ruby, 7, bold + classic · fern-gully Fern Gully, emerald, 7, natural + bold · plum-dusk Plum Dusk, plum, 7, cosy + bold · storm-cloud Storm Cloud, charcoal, 6, modern + calm · golden-hour Golden Hour, gold, 6, bright + cosy · blackboard Blackboard, black, 7, modern + playful (a chalk wall for playrooms).
- **Floors** (name, pattern, colour, per 10 cells, tags): cherry-boards Cherry Boards, boards, red-wood, 5, classic + cosy · whitewash-boards Whitewashed Boards, boards, ivory, 4, calm + bright · slate-tiles Slate Tiles, tiles, charcoal, 5, modern + calm · meadow-carpet Meadow Carpet Tiles, tiles, sage, 3, cosy + natural · sunny-tiles Sunny Tiles, tiles, mustard, 4, bright + playful · mosaic-teal Teal Mosaic, tiles, teal, 5, bold + modern · blue-check Blue Checker, checker, sky + ivory, 4, playful + calm.
- **Furniture** (name, W×D, tall, use cells, price, tags, colour): double-bed Double Bed, 3×4, no, one long side (4), 16, cosy + classic, soft · bedside-table Bedside Table, 1×1, no, 1 free neighbour, 3, classic, honey-wood · chest-of-drawers Chest of Drawers, 2×1, no, front (2), 7, classic + natural, pale-wood · dining-set Table for Four, 3×2, no, both long sides (6), 14, natural + classic, honey-wood · sideboard Sideboard, 3×1, no, front (3), 9, modern + classic, dark-wood · console-table Hall Table, 2×1, no, front (2), 6, classic, dark-wood · hall-bench Hall Bench with Hooks, 2×1, no, front (2), 6, natural + cosy, pale-wood · bean-bag Bean Bag, 1×1, no, front (1), 4, playful + cosy, soft · play-tent Play Tent, 2×2, no, front (2), 8, playful, soft · plant-stand Tall Plant Stand, 1×1, yes, 1 free neighbour, 4, natural, emerald · upright-piano Upright Piano, 3×1, yes, front (3), 15, classic + calm, dark-wood · daybed Daybed, 2×4, no (allowed under a window), one long side (4), 13, cosy + natural, soft. The bedside table, chest, sideboard and hall table hold a lamp; spots (§3.4) gain the double bed, table for four, daybed, piano, play tent, hall bench and bean bag.
- **Lights** (name, price, strength, radius, warmth, mount, tags, colour): lantern-pendant Paper Lantern Pendant (an electric glow), 5, 1.1, 3, warm, ceiling, cosy + natural, ivory · track-spots Track Spotlights, 6, 1.4, 2, cool, ceiling, modern + bold, charcoal · table-lamp Table Lamp, 3, 1.1, 3, warm, desk or table, classic + cosy, gold · globe-lamp Globe Floor Lamp, 5, 1.2, 3, cool, free floor cell, bright + modern, sky · picture-light Picture Light, 3, 1.0, 2, warm, wall edge, classic, gold · starry-nightlight Starry Night Light, 3, 0.7, 4, cool, desk or table, playful + calm, lavender. "Desk or table" now means any piece that holds a lamp.
- **Decor** (name, price, tags, colour, hangs on): shell-jar Shell Jar, 2, calm + natural, ivory, floor · boat-print Sailing Boat Print, 3, calm + classic, sky, wall · herb-pots Herb Pots, 3, natural + bright, emerald, floor · record-frame Framed Records, 3, classic + bold, charcoal, wall · book-stack Book Stack, 2, cosy + classic, ruby, floor · map-poster Treasure Map Poster, 2, playful + bold, mustard, wall · clay-vase Clay Vase, 3, natural + modern, coral, floor · planet-mobile Planet Mobile, 3, playful + bold, navy, wall.

**Clients** (rolled as in §4.6 and open in both careers. Typical spend is at Standard prices with every spot lit, and every lowest budget is ≥ typical + 4.)

| id            | client                                                 | gate / min rep   | room         | required tags    | favoured                 | avoid    | must-haves                                        | mood | budget | fee     | days | min Q | typical |
| ------------- | ------------------------------------------------------ | ---------------- | ------------ | ---------------- | ------------------------ | -------- | ------------------------------------------------- | ---- | ------ | ------- | ---- | ----- | ------- |
| castellanos   | Lucía and Mateo Castellano, new on Marigold Row        | — / 14           | entry-hall   | bright, natural  | mustard, emerald, ivory  | charcoal | hall-bench 1, plant-stand 1                       | warm | 38–48  | 70–85   | 3–5  | 66    | 33      |
| grandpa-amos  | Grandpa Amos, who plays piano every evening            | — / 16           | snug         | classic, cosy    | ruby, gold, honey-wood   | sky      | upright-piano 1, armchair 1                       | warm | 50–62  | 85–100  | 4–6  | 68    | 44      |
| ms-nakamura   | Ms. Nakamura, for Hiro (age 9)                         | — / 18           | kids-room    | playful, bold    | mustard, navy, teal      | —        | single-bed 1, play-tent 1, bean-bag 1             | any  | 54–66  | 85–105  | 4–6  | 68    | 49      |
| supper-club   | The Thursday Supper Club                               | — / 20           | dining-room  | classic, natural | ruby, ivory, honey-wood  | black    | dining-set 1, sideboard 1                         | warm | 60–74  | 95–115  | 5–7  | 70    | 51      |
| ms-farrow     | Ms. Farrow, who works from home                        | — / 24           | home-office  | modern, calm     | charcoal, sage, sky      | ruby     | desk 1, bookcase 1, plant-stand 1                 | cool | 52–64  | 95–115  | 5–7  | 72    | 47      |
| bea-and-rufus | Bea and Rufus, retired gardeners                       | — / 28           | garden-room  | natural, bright  | sage, emerald, mustard   | navy     | daybed 1, potted-fern 2, herb-pots 1              | any  | 64–78  | 105–125 | 5–7  | 72    | 55      |
| solenne       | Solenne, window dresser at the arcade                  | Trendsetter / 18 | loft-studio  | the 2 hot tags   | 2 drawn as Bellwind's    | —        | daybed 1, framed-print 2                          | any  | 60–74  | 110–130 | 5–7  | 74    | 54      |
| the-hollins   | Mr. and Mrs. Hollin, from the hardware shop downstairs | Charmer / 14     | main-bedroom | cosy, classic    | blush, honey-wood, ivory | —        | double-bed 1, bedside-table 2, chest-of-drawers 1 | warm | 70–86  | 110–130 | 5–7  | 70    | 66      |

Solenne uses Bellwind's trend brief through a content flag, `trendBrief`, so `Brief` keeps its shape. Request, delighted and near-miss lines are ≤ 2 sentences each. Grandpa Amos, for example: "A cosy corner for my piano and my tea." / "Every note sounds warmer in here." / "Lovely. The lamp could reach the keys better."

**Upgrades** (Show-Home career only; name, price, min rep, effect): sample-board Sample Board, 120, 34, Show the crew how takes 0 h · crew-radio Crew Walkie-Talkies, 160, 36, a third crew member · tool-trailer Tool Trailer, 180, 40, crew skill +0.03 · supply-account Larkspur Supply Account, 200, 44, crew wages −2 per job.

**Story beats** (beats with **You** lines get the 4 `byTrait` variants, in the §4.8 voices). The 17 new beats live in `content/larkspurStoryBeat.ts`, following Thrift-Flip's `boutiqueStoryBeat.ts`, so `content/storyBeat.ts` (253 lines for 9 beats) stays well under 700. Larkspur is the studio's shared town name (Chef's Larkspur Market Hall and Cookery School); Larkspur Close is a new street in it, a deliberate shared-world nod.

| id                                                      | trigger                                   | lines (short)                                                                                                                      |
| ------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| is-larkspur-offer                                       | larkspur-offer                            | **Ms. Achebe:** "Six new homes, all empty and waiting." / "Will you make them feel like home?" / choice: Take the keys · Not yet   |
| is-larkspur-intro                                       | intro-development                         | **Ms. Vale:** "The loft's still yours, and now a whole street." / **You:** (byTrait)                                               |
| is-larkspur-keys                                        | Larkspur opened                           | **Narrator:** Six front doors, six key tags, one site cabin. / **You:** (byTrait)                                                  |
| is-first-plot                                           | first project started                     | **Ms. Achebe:** "Start at the front door. Every room leads to the next."                                                           |
| is-crew-hello                                           | first crew hired                          | **The first crew member hired:** "Point me at a wall. I'll make you proud."                                                        |
| is-first-coaching                                       | first Show the crew how                   | **Crew member:** "Oh, like that! I'll do it your way."                                                                             |
| is-first-open-house                                     | first Open House done                     | **Narrator:** The door swings open and the street walks in. / **You:** (byTrait)                                                   |
| is-gold-key                                             | first Gold Key or better                  | **Mr. Oyelaran:** "I've walked every street in town. That home just works."                                                        |
| is-plot-four                                            | Twin Gables reached                       | **Ms. Achebe:** "Four rooms now. Your crew will be busy."                                                                          |
| is-vale-visits                                          | third project started                     | **Ms. Vale:** "I painted sets for forty years. Yours are homes people live in."                                                    |
| is-street-end                                           | Larkspur End reached                      | **Ms. Achebe:** "The last house on the Close. Make it sing."                                                                       |
| is-street-of-homes                                      | Silver or better on all 6, and a Gold     | **Narrator:** Every porch light on Larkspur Close is glowing. / **Ms. Achebe:** "You made a street into a neighbourhood."          |
| is-every-gold                                           | Gold or better on all 6 hooks             | **Ms. Vale:** "Six gold keys. I'm hanging them by the loft door."                                                                  |
| is-doors-opened                                         | missed Open House auto-staged             | **Ms. Achebe:** "We opened the doors for you. Visitors still came to look around."                                                 |
| is-sister-home                                          | sister home started                       | **Ms. Achebe:** "The home next door needs you too. Same size, new story."                                                          |
| is-trait-trendsetter-solenne / is-trait-charmer-hollins | Solenne / the Hollins first send a letter | **Solenne:** "You always know what's next. Help me show it." · **Mrs. Hollin:** "You've had biscuits with us for weeks. Our turn." |

**New hint lines** (each ≤ 12 words): home map "Big rooms for big furniture. Quiet rooms at the back." · palette "Pick three paints that feel like one home." · through door blocked "Keep a path to the next door." · two-tone "Dip the right tray for each half." · map too small "That space is too small for a Main Bedroom." · threshold "Hall floor first, then the room's floor." · glow path "Light the way from door to door." · story pieces "Put a story piece in every room." · crew board "Crew jobs finish overnight. Paint, then floor, then light." · coaching "Show the crew how. They'll copy your best work." · planner "Choose the tour. Save your favourite room for last."

### 10.8 Economy sanity checks (Standard unless noted)

- **Baseline:** a decent Room Designer fortnight at reputation 34 is ≈ 12 makeovers × +50, plus a Bellwind show home each week (≈ +137 in place of a +50), minus 180 rent: **≈ +600**.
- **Project hours:** plan the home 1; the hero room by hand 8; each other room 4 (plan, shop, light, style, with crew on paint and floor); Open House 2. Plot 1 takes ≈ 15 h and plot 6 ≈ 23 h, so a project uses 1.5–2.5 of its 14 days.
- **A decent project on plot 2** (room flow 0.95, through-ways 0.5 of 2 through doors, map 1.0; mean room light 0.90, glow 0.6, mood 0.9; Rosa and Tobi on paint and floor in 2 of 3 rooms, so finish ≈ 0.80; 1 of 3 rooms cosy, colour flow 0.75; story pieces in 2 of 3 rooms, 1 of 2 story tags, right music but wrong time, tour 85): Flow ≈ 47.5 + 15 + 20 = 82.5 → 83; Light ≈ 54 + 12 + 18 = 84; Comfort ≈ 40 + 10 + 15 = 65; Story ≈ 26.7 + 10 + 16 + 17 = 70. **Overall ≈ 76: a Silver Key**, and the next plot opens. Ms. Achebe's map and plan with Assist everywhere, at the suggestion caps ≈ 72 (Silver); careless about the story and tour ≈ 60 (Copper: the stay-or-move choice); the same home with crew on every job, uncoached, ≈ 3–4 lower than by hand; mastery ≈ 92 (Gold).
- **Project pay at overall 76** (crew wages come from the purse, not coins): plot 1 = 165 signing + 182 second half + notes 4 × 10 + sourcing 7 (purse 150 − 108 − 28 leaves 14) ≈ **394**; plot 6 = 230 + 254 + 4 × 20 + sourcing 17 (345 − 228 − 84 leaves 33) ≈ **581**.
- **Show-Home fortnight:** ≈ 10 makeovers × +55 = +550, plus the project (+394 to +581), minus 280 rent: **≈ +664 to +851**. That is 1.1× the loft fortnight on plot 1 and 1.4× on plot 6: taking the keys is a step up from the first plot, and it grows along the street.
- **Upgrades:** the four new ones (660 in all) fill about the first two projects; the Site Cabin decor (180) comes after.
- **Pass rate (makeovers), 75–90%:** the decent Standard bot draws step accuracies from the seeded RNG (flow 0.95 ± 0.04, paint 0.88 ± 0.06, floor 0.90 ± 0.06, light from its own Show me placement minus 0–0.15, fit 0.78) and slips (misses a tag or must-have) **11%** of the time. With decent quality (≈ 90) clearing every minimum (55–84; the new ones 66–74), the expected rate is **≈ 85–88%**. Minimums are read from `content/client.ts`. Tuning order if the simulation falls outside 75–90%: (1) the slip rate stays fixed; (2) the 4 highest minimums move ±2 at a time. Home rooms have no pass gate. The bot spreads its edging and floor offsets (0.3–2.8 cm and 0.5–3.5 cm) so some rooms land below their minimum, and the simulation checks each difficulty: Standard 75–90%, Challenging 75–85% and below Standard, Relaxed at least Standard, with some misses on quality in both Standard and Challenging.
- **No bankruptcy spiral:** a struggling fortnight (5 passes × +45, 5 soft fails × −20, an Open House on plot 1 at overall 55 paying 165 + 168 + sourcing 7) is 125 + 340 − 280 = **+185**. With no makeovers at all it is 340 − 280 + 2 shifts × 45 = **+150**. Rent drops to 90 with no project open, and the shift is always there. The purse belongs to Bellwind, so a costly room can never take coins below 0 unless the player chooses Top up.
- **Relaxed is always recoverable:** rent is ×0, every makeover passes, the purse is ×1.2 and Bellwind tops it up, the Open House pays at least its full fee (§10.5), and the shift is always open.
- **Challenging:** rent 210 (135 with no project), minimums +6, Assist cap 0.7, crew −0.04, next plot at 65. A decent player passes ≈ 75–85% of makeovers (≈ 81% in the simulation) and nets ≈ +300 to +490 a fortnight. A bad fortnight that goes below 0 plays the existing `is-quiet-week` beat; there is no game over.

### 10.9 Save migration (schema 1 → 2)

- `SCHEMA_VERSION = 2`. A new `core/saveMigrations.ts` exports `SAVE_MIGRATIONS = { 1: addDevelopmentFields }`, passed to `parseSaveWith` as in ADEEVA, Patisserie and Thrift-Flip.
- `addDevelopmentFields(raw)` is pure and returns a new object. It adds:
  - `career: "loft"` and `larkspur: null`;
  - `profile.startedAs: "loft"`;
  - zero stock counts for the 12 new furniture pieces, 8 paints, 7 floors, 6 lights and 8 decor items;
  - when `activeRun` is not null: `purpose: { kind: "makeover" }`, `plan.lowerPaint: null` (two-tone), `rollerZone: "top"`, `smudges: 0` on every roll record, and an explicit `byCrew: false` on every edge, roll and floor record (the v2 parser requires it rather than defaulting it).
- Everything else is kept as it is: calendar, gigs and their briefs, `showHomeWeek`, the log with its Open Houses, story, trends and RNG. An open makeover continues exactly, and `Brief` does not change shape.
- Once created, `larkspur` holds `plot` and `phase`; `project` (`startDay`, `plotId`, `storyId`, `stage`, `map`, `palette`, `purse`, `spent`, `rooms: MakeoverRun[]`, today's `crewJobs`, `coached: Record<job, number>`, `plan`, `result`; each stored room is a `MakeoverRun` with its `homeRoomBrief`); `crew` (`hired`, and `jobsDone` per crew member and job); `keyWall: Record<PlotId, KeyId | null>`; and `history` (plot, story, overall, key, panels and day for each Open House).
- The v2 parser rejects a `development` save with no `larkspur`, and a `loft` save that has one. It checks that each home room's work fits its stages, using the slice's `runConsistency`. Unknown, v3 and damaged saves are reported, never reset. `earnedReputation` accepts version ≤ 2, so `reputationOf` reads both versions.
- A v1 player who already meets the thresholds sees `is-larkspur-offer` after their next reveal or End Day. The migration never queues anything, and nothing is granted silently.

### 10.10 Safety notes for the street, the crew and the Open House

- **Homes are not money.** No price, sale, "sold" sign, mortgage, rent for the homes, value, auction, profit, flipping or investment appears anywhere. The Bellwind sign reads "Open House" and then "Welcome home". The homes go to "families on Bellwind's list", who are never shown judging. Small homes are never lesser.
- **A kind showcase, not TV.** These words never appear: judge, winner, loser, elimination, round, vote, ranking, "makeover show", host and camera crew. Every Open House gets a key from fixed bands. Panels praise first and give one "Next time, try…" tip. They talk about the home, never about anyone's body, age or worth. Low scores read "Warmly welcomed".
- **Crew are grown-ups, treated well.** They hold the tools. Every crew job is shown as a finished result and a happy card, never as a person on a ladder, scaffold or roof. Wages are fair and paid per job. There is no bossing, blame or "fired": the button is "Finish working together" (on any day they have no job), and they can come back any time. Crew never get hurt, tired or upset. The Paint screen keeps its line, "Real painting and ladders need a grown-up. Ask an adult first." The coaching screens add "Real building sites are only for grown-ups with the right gear."
- **No building-site hazards.** The homes are finished buildings and "the builders have gone home". No wires, sockets, power tools, dust or hard-hat dangers are shown, and lights stay decorations (§8).
- **Visitors are safe and public.** The Open House is busy and public, in daylight or early evening. Children appear only with their families, and no adult asks the player to meet in private. Visitors comment only on the rooms.
- **Defaults for 8-year-olds:** the map, the palette and the Planner all open on "Ms. Achebe suggests…", which one tap confirms. The crew board suggests "Rosa paints, Tobi floors".
- **Names:** before shipping, check that "Larkspur Close", "Bellwind Homes" and the new client, crew and panel names are not real businesses or public figures.

### 10.11 Build and test plan

- **Reuse first; extend without breaking anything:**
  - Engine: `panelScore` (`panel`, `subScore`, `overallScore`), `showOrder.closerStrength`, `showDay` (`lateShowPenalty`, `stagingScore`, `showReputation`), `qualityTip`, `rngDraw`, `storyVoice`, `earnedReputation` and `weekSettlement`.
  - Shared UI: `ui/newGame/CareerStep`, `careerDraft` and `careerFacts`; `ui/kit/PanelCard`, `useShowClock`, `easing` and `useRovingRadio`; `ui/art/PetalFall`.
  - ADEEVA's show pieces, used the way Thrift-Flip uses them: `useShowPlayback`, `ShowTitleCard`, `ShowHud`, `showTimeline` and `RUNWAY_MOODS`. Patisserie's `storyChoice` pattern is ported to this game's story queue.
  - The game's own core, extended: `walkThrough` gains extra target cells for through doors, and `tidyLayout` blocks them like the door swing; `paintRoll` gains an optional two-zone mask and smudges (the single-paint path is unchanged); `floorLay` takes a candidate list with two floors; `lighting` and `lightPlacement` gain path cells, and crew placement reuses `showMeLight`; `warehouse` gains a spend source (coins or purse). `decorPlacement`, `roomQuality`, `roomEvaluate` and the Open House walker are reused as they are.
  - The slice's `openHouse` keeps its saved shape; the home panels use the engine's `PanelScore`.
- **New content files:** `roomPurpose`, `homeStory`, `plot`, `crew`, `openHouseKey`, `panelMember`, `tourTime` and `larkspurStoryBeat`. `career` becomes `CAREERS`, and the catalogue files gain the §10.7 ids. The slice's `core/offers.ts` gains the Bellwind catch-up draw (§3.7).
- **New core files:** `larkspurOffer`, `openLarkspur`, `larkspur` (types), `project`, `projectCalendar`, `homeMap`, `homePalette`, `homeRoom`, `purse`, `crewBoard`, `crewJob`, `crewSkill`, `coachCrew`, `throughDoor`, `twoTone`, `threshold`, `glowPath`, `storyPieces`, `openHousePlan`, `homePanels`, `homeOpenHouse`, `openHousePrize`, `plotProgress`, `keyWall`, `interiorProfile` and `saveMigrations`. A new `reduceLarkspur.ts` is called from `reduce.ts` (123 lines today), so every file stays ≤ 700 lines.
- **New UI:** the Career step cards; `LarkspurTab` (street strip, project card, crew board, Key Wall); `HomeMapStage`, `PaletteBoard` and `HomeRooms` (room list and crew assignment); `CoachStage`, reusing `EdgeStrip`, `RollWall`, the floor tray and the light grid; `OpenHousePlanner`, `OpenHouseShow` (`LarkspurBackdrop`, `HomeStrip` built from `RoomCutaway`, visitor walkers) and `OpenHouseResults` with `PanelCard`; `KeyArt`; and sprites and symbols for the new furniture, lights and decor. `FurnitureSprite.tsx` (614 lines) is first split into one file per family (beds, seats, tables, storage, play). All of it works with mouse, touch and keyboard, uses targets ≥ 44 px and follows reduced motion.
- **Build order:** D1 step 1 commits the v1 fixtures, written by the slice's serializer at HEAD before any type changes; then careers, the migration, the Bellwind catch-up, the unlock, "start here" and `startedAs` → D2 content ×2 in both careers, with tidy-layout, lighting and spend tests → D3 projects, map, palette, purse, home rooms and through doors → D4 crew, coaching, glow path and story pieces, then `two-tone` and `threshold` last so those two polish twists can slip on their own (the crew, Open House and Key Wall carry the depth) → D5 planner, show, panels, keys, street progress and the finale → D6 simulation tuning, e2e and polish.
- **Unit tests:**
  - The unlock at 33/34 reputation, 13/14 makeovers and 0/1 show homes; "Not yet" keeps the card.
  - `startedAs` and studio reputation (a missing value counts as loft).
  - Rent of 140 or 90 as projects open and close.
  - The Bellwind catch-up: from reputation 22, Room Designer only, no Bellwind offer this week by weekday 3 and none pending or active draws Bellwind first; not before weekday 3, not below 22, never for Show-Home Designers.
  - The staging window (from `startDay + 7` once every room is Ready), rent held at 140 to `startDay + 12`, the next start no earlier than `startDay + 13`, the late rule and the auto-staged Open House.
  - `homeRoomBrief` fields and `gigId`; the lapse callback returns `null` for home rooms; reveal and rewards never run on one.
  - Map fit, the roof window, the hall left out of the mean, and Ms. Achebe's map; a purpose dropped on a too-small space is illegal and returns the same reference; through doors as hard cells and as walk targets.
  - The suggestion caps (Home map 80, Welcome and Tour 70) on Standard and Challenging, uncapped on Relaxed.
  - Purse spend, top-up and the Relaxed top-up. Crew assignment legality (job order, open room, purse, one job a day), crew skill growth and the 0.86 cap, and the coaching maths with its 0.88 cap. Hire and Finish are illegal while any crew job is assigned today, and a crew member with a job today cannot be finished (same reference). A home with crew on every job, uncoached, scores at least 3 overall below the same home done by hand.
  - Two-tone: a wrong-zone pass adds no pass and 1 smudge, `rollerZone` switching, the lower tin in source and fit, lower and feature paint never both set, and the mid-wall tape on the back wall only. Threshold only when both floors share a pattern, never on plot 1; glow-path cells; story-piece detection with the palette-surface rule.
  - Every panel formula, key band edges, `openHousePrize`, the Relaxed second-half floor, plot advance per difficulty and Relaxed's choice, the stay-or-move choice for a passing key below Silver (both answers), sister homes, phase-two fees ×1.1 without compounding, and the finale rules.
  - Every new action is illegal in the wrong state and returns the same reference.
  - Content: unique ids; flow ≥ 0.9 for every client's tidy set; typical lights lighting every spot in the brief's mood; typical spend + 4 ≤ the lowest budget; `everyHomeTypicalSpendFits`, `everyPlotMapIsAChoice` and `everyPurposeFitsItsLegalSpaces`; hints ≤ 12 words and client lines ≤ 2 sentences.
  - Migration: committed v1 fixtures (fresh; mid-makeover at paint with splats; a Bellwind run at style; at the threshold; 4 offers with 3 active gigs) load with `byCrew: false`, `rollerZone: "top"` and `smudges: 0` where they apply, keep their data, continue to a reveal and End Day, and get the offer when eligible. The threshold fixture with an open Bellwind run at style takes the keys, finishes that run to its reveal and Open House, and then starts plot 1. A deep-frozen fixture proves the input is never mutated, and v3 and damaged saves are rejected.
- **Simulation (`depthEconomy.test.ts`, seeded, 5 seeds):**
  - The decent Room Designer bot gets the offer on days 15–24 and passes 75–90% of makeovers.
  - A decent Show-Home fortnight on plot 1 earns ≥ 0.95 × the bot's loft fortnight and reaches Silver.
  - A struggling Standard fortnight stays ≥ 0.
  - A Relaxed run never takes coins below 0, never soft-locks and replays identically.
- **e2e** (`MAKER_PORT`; at 1280×800, 820×1180 and the 768×600 minimum; zero network requests):
  - `interior/larkspurUnlock.spec.ts`: a committed v1 save at the threshold loads, reveals, sees the offer, takes the keys and starts plot 1.
  - `interior/homeProject.spec.ts`: start here as a Show-Home Designer. Make the map by drag and by keyboard, pick the palette, and play the hero room by hand with a two-tone wall and a threshold floor. Hire, coach and assign crew; End Day; save, reload and continue.
  - `interior/openHouse.spec.ts`: from a prepared Open House save, use the Planner by keyboard. Play the show in motion and in reduced motion, use Skip, and see the key on the Key Wall.
- **Checks:** `MAKER_PORT=5192 pnpm lint`, `pnpm typecheck`, `pnpm test` (twice) and `pnpm e2e` all pass. There is no `Math.random` or `Date` in core or content, no comments and no file over 700 lines. Every process for the worktree is stopped afterwards.

### 10.12 Implementation notes (as built)

Where the build differs from, or adds detail to, §10.1–§10.11:

- **Numbers.** Purses for Corner Cottage and The Blue Door rose to 240 and 205 so every plot meets the purse rule with the typical spend counted as described in §10.6 (107, 162, 130, 215, 183 and 219). The new clients' typical spends are castellanos 33, grandpa-amos 44, ms-nakamura 49, supper-club 51, ms-farrow 47, bea-and-rufus 55, solenne 54 and the-hollins 66 (each still ≥ 4 below the lowest budget).
- **Save fields.** The project purse is stored as `purse` (Bellwind's allocation), `added` (top-ups, including Relaxed's free ones) and `spent` (shopping and wages); purse left = purse + added − spent, and careful sourcing uses the allocation. The Open House first pays back unspent top-ups (at most `added`, at most the purse left), then careful sourcing on what remains. `project.shelf` holds Bellwind's purse-bought goods. Ms. Achebe's map and plan are recognised by comparing them with her suggestion, never by a flag sent from the screen; the palette keeps no suggestion flag. The save check refuses crew jobs for unhired crew, duplicate crew jobs, a job that is not the room's next step, a tour that does not match the map, an open project on another plot and a Key Wall that disagrees with the history. A crew light job stores its skill as the run's `lightCrew` cap, which the v1 → v2 migration also adds (`lightCrew: null`). A crew roll stores full coverage with `byCrew: true` and scores coverage × that wall's crew edge accuracy.
- **Stages.** A project moves to `planner` by itself when the last room is made ready; `planOpenHouse` moves it to `show`, and the plan can be updated until the doors open. Home rooms use the run's `reveal` stage as "Ready" (the Ready screen shows the quality against the ready mark, the through door, the glow path, the story check and the palette check).
- **Coaching.** The paint demo is one 54 cm tape (no roll patch). The light demo is a 4 × 3 sample corner with two bean bags and a Paper Lantern Pendant. Coaching is available while the rooms are being made.
- **Missed Open House.** If the map or palette was never finished, Bellwind uses Ms. Achebe's; any room never planned gets a tidy layout of its must-haves, the first palette paint, the hall floor (or Oak Boards) and a Paper Pendant, all done at 0.6 with no story piece. A room the player planned uses its goods from Bellwind's shelf and then the leftover shelf, and only Ms. Achebe's "we opened the doors" story plays; the first Open House story waits for one the player opens.
- **Bellwind catch-up.** The catch-up day rolls Bellwind on its own first, then the usual roll with one fewer offer.
- **Reuse.** As Thrift-Flip does, Interior reuses ADEEVA's `RUNWAY_MOODS`, `showTimeline`, `useShowPlayback`, `MusicChip` and `show.css` (the lint allow-list gains `interior: ["adeeva"]`); the Open House has its own title card (a front door swinging open), HUD (Skip appears after the first room) and `HomeStrip`. Visitors are full-figure avatars walking the door-to-next-door path; a story piece pops a speech bubble with the story's own line.
- **Simulation bot.** The decent Room Designer bot starts a makeover only on a fresh morning (one a day), which gives the §10.8 pace; the pass-rate bound is checked over all five seeds together. It only starts a makeover it can pay for (otherwise it works a shift), drops a desk lamp with its desk when it slips, and never hides a failed playthrough. In a home it uses Ms. Achebe's map, its own tour plan with the right music but the wrong time, a story piece in about two rooms of three, and the same spread craft offsets, which lands its Open Houses at about 82–93. The Show-Home fortnight is checked against the loft fortnight on Standard (each seed) and on Challenging (all seeds together).
- **Tests as built.** Unit: `larkspurUnlock`, `homeMap`, `homeProject`, `crew`, `homeTwists`, `openHouseScoring`, `depthRules` (every new action illegal in the wrong state, determinism, catch-up), `saveMigration` and `depthEconomy`. e2e: `larkspurUnlock.spec.ts` (v1 save at the threshold → offer → take the keys → map by drag and keyboard → palette → hero room by hand with a two-tone wall → second room with hired, coached crew → planner by keyboard → Open House → results → save and reload), `openHouse.spec.ts` (planner by keyboard, show in motion and reduced motion, Skip, Key Wall) and `homeTwists.spec.ts` (threshold floor, too-small space, paint and floor coaching).
