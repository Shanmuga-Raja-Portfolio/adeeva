# Jewellery Bench — Game Design (id: `jewellery`)

A playable slice of the Maker Studio contract (`work/0003-studio/design.md`), at about a third of ADEEVA's depth. You rent a little workbench in the **Thimble Lane Arcade**, a covered row of craft stalls strung with lanterns. Mr. Osei, who runs the arcade and mends music boxes, hands you the key. Neighbours bring orders for rings, pendants, earrings and bracelets. For each order you design the piece, choose a metal and stones, plan the sheet, cut it out, join it, set the stones, polish it and deliver it in a gift box. Every delivered piece goes into your **Keepsake Case**, a gallery you can show off. On the seventh day of each week the arcade holds **Market Day**, when you set out a collection of up to three pieces on your stall tray. All names, text, numbers and art are original. The studio safety promise applies on every screen.

## 1. Fantasy and audience

- **Fantasy:** "I cut a crescent moon out of silver, set a moonstone in it, and Juniper wore it to her book reading." The fun is making something tiny, shiny and precise that someone treasures, and choosing the metal and stones that suit the person.
- **Ages 8–15+.**
  - 8–11 play on Relaxed with Assist toggles on. They enjoy picking stones from the tray, watching the lamp glow, pressing the little claws shut and polishing until the piece sparkles.
  - 12–15+ play Standard or Challenging. They cut clean star points, pulse the lamp to keep the glow in the zone, seat a teardrop stone at the right angle, and plan a cohesive Market Day collection around the week's theme.
- **Reading level:** hints are ≤ 12 words, at most 2 short sentences, at about Grade 3. Client lines are 1–2 short sentences. Every number has an icon (coin, clock, star, sheet, gem).
- **Why it is good for kids (without overclaiming):** it practises fine pointer control, patience with timing, spatial planning (fitting shapes on a sheet), colour matching and working to a budget and a deadline. It shows that careful work is rewarded. It does **not** teach real jewellery making, soldering or tool use, and says so. **Parent page sentences (exact):** "This game does not teach real jewellery making, soldering or tool use. Metals and stones are game items with no real prices or values."

**Kid-facing labels** (the design terms on the left never appear on screen; "solder", "torch", "flux", "pickle", "bezel", "carat" and "karat" are never shown):

| Design term                      | Label on screen                  |
| -------------------------------- | -------------------------------- |
| saw-pierce                       | "Cut out"                        |
| solder / soldering               | "Join" (with the Joining Lamp)   |
| prongs                           | "Claws"                          |
| bail                             | "Loop"                           |
| findings (ear clips, jump rings) | "Clips & rings"                  |
| sheet layout                     | "Plan your sheet"                |
| hardness                         | "Tough metal" (1–3 hammer icons) |
| shine level                      | "Sparkle" (1–3 ✦ glints)         |

## 2. Core loop and stages

**Career (only one):** _Arcade Bench Jeweller_ at "the Lantern Bench, Thimble Lane Arcade". Start: 100 coins, reputation 0, weekly rent 90 (Challenging ×1.5 = 135), paid to Mr. Osei. Shift: "Sorting beads at the Bead Barn" pays 30 coins for a whole untouched day, on every difficulty.

**Hub loop:** read the order tags (offers) → accept an order → run it → deliver → End Day. Between orders the player may make **stall pieces** for Market Day (§3.7). Rent is due at the end of every 7th day, exactly as ADEEVA's `weeklyBill`.

**`PieceRun.stage`** = `brief → design → supplies → plan → cut → join → set → polish → display → review → done`

| #   | Stage    | Hours                   | What happens                                                                                                                                                                                                               |
| --- | -------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | brief    | 0                       | Order tag: product, required tags, favoured and avoided colours, avoided metals, required extras, stone count, budget, fee, deadline, minimum quality. The live checklist stays on screen afterwards (ADEEVA `checklist`). |
| 2   | design   | 1                       | Pick the product's options (shape, band, accent), one metal and the stones. `PiecePreview` shows the piece on a velvet card.                                                                                               |
| 3   | supplies | 1 per visit             | Supply Cabinet: buy metal sheets and strips, stones, chains, cords and clips. Coins are checked atomically. Owned stock can be used instead.                                                                               |
| 4   | plan     | 0                       | Drag each part onto an owned sheet or strip of the chosen metal; rotate in 45° steps (ADEEVA `ROTATIONS`). In bounds and no overlaps. Unscored.                                                                            |
| 5   | cut      | 2                       | Cut each part along its outline (trace). Confirming a sheet consumes it once (idempotent, like ADEEVA `cutCommit`).                                                                                                        |
| 6   | join     | 1                       | Join each seam with the Joining Lamp (timing).                                                                                                                                                                             |
| 7   | set      | 1 per stone (0 if none) | Seat each stone and press its claws (precision).                                                                                                                                                                           |
| 8   | polish   | 1                       | Rub each part until it shines (coverage).                                                                                                                                                                                  |
| 9   | display  | 0                       | Pick a finish, thread a chain or cord, add charms. Not skill-scored.                                                                                                                                                       |
| 10  | review   | 0                       | Evaluate the frozen run; commit the reward once per run id; add the piece to the Keepsake Case.                                                                                                                            |

One order costs 6–8 h plus an optional 1 h supply visit, so it fits in a 10-hour day. Going back follows ADEEVA's rule: design, supplies and plan can be revisited until the first sheet is cut; after that the design is locked (`stageNavigation`/`canGoBack`).

**First order coach** (one hint per stage while the first order is underway, from Mr. Osei; a hub switch turns it off): design "Pick a shape, a metal and a stone." · supplies "Buy the items marked 'Fits your plan'." · plan "Drag each shape onto the metal sheet." · cut "Press on the line and follow it all the way round." · join "Hold the lamp button. Keep the glow in the gold zone." · set "Slide the stone into its seat, then press each claw." · polish "Rub the piece until every dull spot shines."

## 3. Hands-on mini-games

All input is Pointer Events (mouse and touch). Every control and drag handle is at least 44 px; the lamp, Assist, **Show me** and Restart buttons are 56 px. Scoring lives in core; the UI only animates and reports samples or counts. Each scored step has a **Restart** that clears only that step's unfinished item. Difficulty multipliers come from ADEEVA's `difficulty` content (Relaxed ×1.3, Standard ×1, Challenging ×0.85). Helpers are switched on per step (on the step itself or in Settings) and last for the session. Every Assist caps that step's accuracy at **0.8**, like ADEEVA's `ASSIST_CUT_ACCURACY` and `ASSIST_SEW_ACCURACY_CAP`, and the Settings copy says so plainly.

**Hardness factor** (cut only): `hard = 1 − metal.hardness` (copper 0.80, silver 0.75, brass and gold 0.70, bronze and rose gold 0.65), the same shape as `materialBandMultiplier` in ADEEVA's `sewBand`. Each hammer icon is a real step in difficulty.

### 3.1 Plan your sheet (unscored)

- **Input:** drag shapes from a tray onto a top-down sheet drawn at 4 px per mm; tap the 48 px turn button to rotate 45°. Earring pairs are mirrored pairs (ADEEVA `mirrorPair`), so both pieces appear in the tray.
- **Rules:** ADEEVA's placement checks (`placedPolygon`, `polygonBounds`, `polygonsOverlap`, generalised `piecePlacementIssues`). There is no grain, so rotation is free and unscored.
- **Show me:** places every remaining part in the product's canonical layout (§4.3). No penalty, because the step is unscored. **Fun:** a quick shape puzzle with a clear ✓ before the hands-on steps.

### 3.2 Cut out (trace, with turns)

- **Input:** one part at a time in a round loupe window, zoomed so `pxPerMm = clamp(fit, 5, 20)`. Press on the outline and drag along it; a small saw sprite follows and bright shavings fall. Release to pause, press again to continue. Accent windows (a star or dots inside a pendant) are separate closed outlines.
- **Turn at the dot:** sharp corners (star points, crescent tips, the points of a heart or raindrop) carry a small corner dot. The saw stops at a dot; the player releases and presses again to cut on in the new direction. Core trims each stroke once it has reached a dot other than the one it started on: samples up to and around that dot count, samples after it leaves the dot do not. A dot's reach is 0.35 × the smallest gap between the outline's dots, clamped to 0.5–1.5 mm. Hint: "Turn at the dot."
- **Scored:** ADEEVA's `traceAccuracy(samples, outline, tolerance)` over `distanceToOutline` (closed outlines). A part counts as cut when samples cover at least 90% of the outline length (bins along the outline within twice the scoring tolerance) and include at least 1 sample per mm of outline; the UI reports `getCoalescedEvents()` samples grouped by stroke and sends the part once it is complete. Otherwise: "Keep cutting all the way round." Only the first cut of a run takes the planned sheets out of stock.
- **Tolerance:** `cutToleranceMm = BASE_PIERCE_TOLERANCE_MM (0.8) × trait (Perfectionist 1.2) × Steady Bench Peg 1.15 × difficulty × hard`, a pure function of its multipliers, like ADEEVA's `cutTolerance`. The UI reports `pxPerMm` in the cut record (validated 5–20). Core scores with `tolMm = max(cutToleranceMm, 8 ÷ pxPerMm)`, so the tolerance never drops below 8 px on screen. Copper on Relaxed ≈ 0.83 mm; silver on Challenging ≈ 0.51 mm (10 px at the largest zoom).
- **Assist cut:** the saw follows a guide rail and turns at the dots by itself; the part scores a flat 0.8. **Why it is fun:** a circle is a calm win for an 8-year-old; ten star points, each a stop-and-turn, plus a crescent's inner curve, are a real steady-hand test at 15.

### 3.3 Join (timing) — new

- **Input:** the piece sits on a stone tile under the **Joining Lamp**, a warm glowing lamp (no flame is ever drawn). Hold the 56 px **Warm** button and a warmth bar rises; release and it cools. A gold **zone** is marked on the bar. While warmth stays in the zone, a silver line of "join" runs along the seam; when it reaches the end, the seam is joined with a soft chime.
- **Core rules** (deterministic, 60 ticks a second): holding adds `metal.warmRate` per second (copper 0.35, brass 0.38, bronze 0.38, silver 0.45, rose-gold 0.40, gold 0.40). Releasing removes **0.30** per second; warmth stays in 0–1. The zone starts at 0.70 and is `0.15 × trait 1.2 × Gentle Lamp 1.15 × difficulty` wide (Standard 0.15, Relaxed 0.195, Challenging 0.1275). The seam needs **240** in-zone ticks (**300** for a ring seam). That is about 4 s of glow, or 3–5 warm-and-cool pulses. Above the zone the glow turns orange and the hint says "Too warm! Let it cool."
- **Scored:** counting starts at the first tick inside the zone. `joinAccuracy = clamp(1 − 1.5 × overTicks ÷ (insideTicks + overTicks), 0, 1)`. Ticks below the zone are recorded but only cost time. On Standard, copper crosses the zone in 0.43 s rising and 0.5 s cooling. A quick release just as the glow nears the top of the zone scores about 0.85–0.95; releasing 200 ms late overshoots by about 0.07 and the glow then spends another quarter-second cooling back through the top, so a sloppy rhythm lands near 0.5. Relaxed's wider zone absorbs most of that overshoot, and fast silver on Challenging is the hardest rhythm.
- **Record validation** (the `recordSeam` pattern, kept in `core/joiningLamp`): `{jointId, ticks, insideTicks, overTicks, assisted}`, whole numbers, `insideTicks + overTicks ≤ ticks`, counts only grow, at most **3600** ticks per joint, a finished joint (240 or 300 glowing ticks) never changes, and the record is written on release, on completion, when the steady lamp is switched and on unmount. **Restart** clears an unfinished joint.
- **Assist join** ("Steady lamp"): the lamp holds warmth at the zone's centre by itself; the joint counts at most 0.8. **Reduced motion:** no flicker; the bar and zone only.
- **Why it is fun:** pulsing a button to hold a glow is tactile and readable at 8 (wide zone, slow copper); at 15, fast-warming silver in a Challenging zone needs a real rhythm across several pulses.

### 3.4 Set the stone (precision) — new

- **Seat:** the stone (≥ 48 px) starts at a seeded offset of 3–5 mm and, for non-round cuts, 15–30° turned, never already inside tolerance. Drag it into the seat; turn it with a 48 px handle (or ±1° buttons, 48 px, hold to repeat). A ghost outline shows the target. The seat sits in a round loupe about 32 mm across (roughly 12–16 px per mm, depending on the screen). Each piece uses one stone type; clip earrings take two of the same stone, and a piece's stones leave stock when the first one is set.
- **Seat gate:** `dTol = 0.8 mm × mult`, `aTol = 8° × mult` (round stones skip the angle). **Press claws** lights up only when `(d/dTol)² + (a/aTol)² ≤ 1`; otherwise "Nudge it a little closer."
- **Claws:** round, oval and square stones have 4 claws; teardrops have 3. Each claw is a 48 px handle that slides from open (`t = 0`) toward the stone (`t = 1`). The snug mark is at `t = 0.8` with a band of `±0.07 × mult`. `clawScore = 1` inside the band, else `max(0, 1 − (|t − 0.8| − band) ÷ 0.15)`. Pressing past the stone shows a little bend; it is never destroyed.
- **Formula:** `seatFit = clamp(1 − 0.5·(d/dTol)² − 0.5·(a/aTol)², 0, 1)` via `engine/poseFit`, `setAccuracy = 0.5 × seatFit + 0.5 × average(clawScore)`. `mult = trait 1.2 × Magnifier Stand 1.15 × difficulty`. On Standard, `dTol` is 9.6 px and the claw band is 0.07 of a 120 px slide (≈ ±8 px).
- **Record validation:** finite numbers, `d ≥ 0`, `a ≥ 0`, the gate holds, `0 ≤ t ≤ 1.2` per claw, the claw count matches the cut, one record per stone per run; a stone can be lifted and redone until the stage is complete.
- **Assist set** ("Gentle tweezers"): the stone snaps into the seat and the claws close to the snug mark; the stone counts at most 0.8.
- **Why it is fun:** sliding a sparkly stone home and clicking claws shut is satisfying at any age; teardrops at an angle with tight claw bands reward a careful 15-year-old.

### 3.5 Polish (coverage)

- **Input:** rub the piece with a 64 px polishing cloth. The piece's silhouette is masked onto a 6 × 6 grid (12–36 live cells). Strokes shorter than 20 px are ignored; a stroke adds one pass to every live cell it crosses, capped at 3. A continuous rub is sent as a new stroke every 90 screen pixels, so rubbing back and forth builds up passes. Cells shine after 2 passes, with a small glint. Thin parts such as ring bands are shown stretched in the polishing loupe so every cell is easy to reach.
- **Formula:** `polishScore = Σ min(passes, 2) ÷ (2 × liveCells)`, averaged over the piece's parts. A part counts as **polished** when ≥ 60% of its live cells shine. About 10–15 seconds a part.
- **Validation:** whole-number passes 0–3 per cell, strokes only grow, at most 400 strokes per part.
- **Assist polish** ("Buffing wheel"): fills the grid by itself; counts at most 0.8. **Core note:** the 6 × 6 grid lives in `core/polish` (silhouette mask from 3 × 3 sub-samples per cell, live when 3 or more are inside).
- **Why it is fun:** quick, calm and visibly rewarding for young players; older players chase the last dull corner of a star.

### 3.6 Display (creative, not skill-scored)

- Pick one finish (§4.4); Colour Glaze also takes one of 8 colours. The preview recolours instantly. Thread a chain or cord on pendants and bracelets. Pendants and bracelets cannot leave Display without a chain or cord (`stageReadiness`). Drag charms onto the piece, then move, rotate (15° steps) and scale them (0.5–1.5), reusing ADEEVA's `Decoration` pose and limits through Patisserie's generic `PlacedLayer`. Tapping a placed charm returns it to stock.

### 3.7 Market Day (weekly collection)

- **Stall pieces:** from the hub, "Make a stall piece" runs `design → supplies → plan → cut → join → polish → display → done` for a Stacking Ring, Shape Pendant or Drop Earrings, with no stone: design 1 + cut 1 + join 1 + polish 1 = **4 h** (plus 1 h for a Supply Cabinet visit). Display ends with **Put it in the stall box**, which pays the finish, uses the chain, charms and clips and adds the piece to the box. Its quality uses the no-stone weights and the stall metalFit rule (§5). Up to 6 finished pieces wait in the stall box. **Theme:** each week the seeded RNG picks one of 3 market themes (§4.7), shown on the hub from day 1. It never repeats two weeks running.
- **Stall tray (day 7 only, 3 h, before End Day):** place 1–3 pieces in the left, centre and right slots, choose a tray cloth (teal, plum, ivory or sage velvet) and a sign (3 preset lines). An empty slot counts as quality 0 in `avgQuality` and adds no colours. Shoppers stroll past (silhouettes, never scored).
- **Shopper score** (0–100): `round(0.45 × avgQuality + 30 × themeShare + 20 × cohesion + 5 × centreBonus)`. `avgQuality` is over the 3 slots. `themeShare` is the share of the 3 slots holding a piece with ≥ 1 theme tag **and** ≥ 1 theme palette colour (metal tone, glaze, cord or charm). `cohesion` is ADEEVA's `paletteCohesion` over the pieces' colours; `centreBonus` is 1 when the centre piece has the highest quality (ADEEVA's "strongest look closes" rule).
- **Sales:** up to 3 pieces sell at ≥ 75, 2 at ≥ 55, 1 at ≥ 35 (highest quality first; Relaxed always sells at least 1). Each sold piece earns `base × (0.6 + 0.6 × score ÷ 100)` (bases: ring 22, pendant 30, drop earrings 30). Trait lines apply (§5). Unsold pieces go back to the stall box; every piece shown enters the Keepsake Case. Reputation +1 at ≥ 75; buzz `+round(score ÷ 10)`.

### 3.8 Hint lines (≤ 12 words, at most 2 short sentences)

| when                                       | line                                        |
| ------------------------------------------ | ------------------------------------------- |
| cut released before 90% coverage           | "Keep cutting all the way round."           |
| saw reaches a corner dot                   | "Turn at the dot."                          |
| shape dropped off the sheet or overlapping | "It needs its own space on the sheet."      |
| warmth above the zone                      | "Too warm! Let it cool."                    |
| lamp released too long                     | "Warm it a little more."                    |
| Press claws tapped outside the gate        | "Nudge it a little closer."                 |
| claw pressed past the stone                | "Gently! That claw bent a little."          |
| dull cells left at Display                 | "A few spots still need polishing."         |
| no chain or cord at Display                | "Add a chain or cord first."                |
| avoided metal picked at Design             | "This metal is on the 'please avoid' list." |

## 4. Content catalog

### 4.1 Metals (6)

Prices are for one small sheet (40 × 40 mm). A strip (80 × 10 mm) costs × 0.7 and a wide sheet (80 × 40 mm) × 1.8, rounded. Hammers ("Tough metal") show hardness. **Sparkle** (✦ glints) drives the fine-metal bonus (§5).

| id        | name      | price | hardness | hammers | warmRate | tone      | sparkle | tags             | unlock rep |
| --------- | --------- | ----- | -------- | ------- | -------- | --------- | ------- | ---------------- | ---------- |
| copper    | Copper    | 4     | 0.20     | 1       | 0.35     | copper    | 1       | nature, playful  | 0          |
| brass     | Brass     | 5     | 0.30     | 2       | 0.38     | gold      | 1       | bold, classic    | 0          |
| silver    | Silver    | 12    | 0.25     | 1       | 0.45     | silver    | 2       | classic, elegant | 0          |
| bronze    | Bronze    | 6     | 0.35     | 3       | 0.38     | bronze    | 1       | nature, classic  | 3          |
| rose-gold | Rose Gold | 18    | 0.35     | 3       | 0.40     | rose-gold | 3       | dainty, elegant  | 20         |
| gold      | Gold      | 24    | 0.30     | 2       | 0.40     | gold      | 3       | elegant, bold    | 30         |

- **Tags** (`JewelTag`, 8): `classic, dainty, bold, playful, elegant, nature, sparkly, dreamy`. The neutral tag is `classic`, like ADEEVA's.
- **Colours:** ADEEVA's 16 `colour` entries plus 4 metal tones (`silver #c7ccd4`, `copper #c47a4a`, `bronze #a0773e`, `rose-gold #d9a08b`); brass and gold use ADEEVA's `gold`.

### 4.2 Stones (8)

Stones are game items; none has a real value. Cut sets the claw count (§3.4).

| id        | name      | price | colour   | cut      | tags             | unlock rep |
| --------- | --------- | ----- | -------- | -------- | ---------------- | ---------- |
| sky-glass | Sky Glass | 2     | sky      | round    | playful          | 0          |
| sea-glass | Sea Glass | 3     | sage     | oval     | nature, dreamy   | 0          |
| garnet    | Garnet    | 6     | ruby     | round    | classic, elegant | 0          |
| citrine   | Citrine   | 5     | mustard  | square   | bold, sparkly    | 6          |
| peridot   | Peridot   | 5     | emerald  | teardrop | nature, sparkly  | 6          |
| onyx      | Onyx      | 5     | black    | square   | bold, classic    | 10         |
| amethyst  | Amethyst  | 6     | lavender | oval     | dreamy, elegant  | 14         |
| moonstone | Moonstone | 7     | ivory    | teardrop | dreamy, dainty   | 14         |

### 4.3 Products (7 templates)

Parts are in mm, W × H. The canonical layout is what Show me uses; every product fits its typical stock.

| id             | name           | parts                                  | option slots  | joints             | stones | needs           | canonical stock   | copper cost       |
| -------------- | -------------- | -------------------------------------- | ------------- | ------------------ | ------ | --------------- | ----------------- | ----------------- |
| stack-ring     | Stacking Ring  | band 56×3                              | band          | ring seam ×1       | 0      | —               | 1 strip           | 3                 |
| stone-ring     | Stone Ring     | band 56×4, seat 10×10                  | band          | ring seam, seat ×1 | 1      | —               | 1 strip + 1 sheet | 7 + stone         |
| shape-pendant  | Shape Pendant  | plate 26×26, loop 10×4                 | shape, accent | loop ×1            | 0      | chain or cord   | 1 sheet           | 4 + chain         |
| stone-pendant  | Stone Pendant  | plate 22×22, seat 10×10, loop 10×4     | shape         | seat, loop         | 1      | chain or cord   | 1 sheet           | 4 + stone + chain |
| clip-pair      | Clip Earrings  | 2 × face 10×10 (mirrored), 2 seats 6×6 | shape         | clip ×2            | 2      | clips (2 coins) | 1 sheet           | 6 + stones        |
| drop-pair      | Drop Earrings  | 2 × drop 12×24 (mirrored)              | shape         | clip loop ×2       | 0      | clips (2 coins) | 1 sheet           | 6                 |
| charm-bracelet | Charm Bracelet | 3 × charm 12×12                        | shape         | jump ring ×3       | 0      | chain or cord   | 1 sheet           | 4 + chain         |

Product tags: rings `classic`, pendants `elegant`, clips `dainty`, drops `elegant`, bracelet `playful`. All earrings are clip-on.

### 4.4 Options, finishes and extras

| slot   | id            | name          | tags             | effect on cutting                    |
| ------ | ------------- | ------------- | ---------------- | ------------------------------------ |
| shape  | circle        | Circle        | classic          | one smooth curve                     |
| shape  | heart         | Heart         | playful          | 2 curves, 1 corner dot               |
| shape  | leaf          | Leaf          | nature           | 2 long curves                        |
| shape  | raindrop      | Raindrop      | dainty, elegant  | 1 curve, 1 corner dot                |
| shape  | crescent      | Crescent Moon | dreamy           | outer and inner curve, 2 corner dots |
| shape  | star          | Star          | sparkly, playful | 10 straight edges, 10 corner dots    |
| band   | smooth-band   | Smooth Band   | classic          | straight strip                       |
| band   | wavy-band     | Wavy Edge     | playful          | wavy long edges                      |
| band   | hammered-band | Hammered Band | bold, nature     | straight strip; dimpled art          |
| accent | plain         | Plain         | classic          | none                                 |
| accent | star-window   | Star Window   | dreamy           | small closed star                    |
| accent | dot-row       | Dot Row       | dainty           | 3 small closed circles               |

| finish id  | name         | price | tags    | colour shown                                                               |
| ---------- | ------------ | ----- | ------- | -------------------------------------------------------------------------- |
| high-shine | High Shine   | 0     | sparkly | metal tone                                                                 |
| satin      | Soft Satin   | 2     | elegant | metal tone, matte                                                          |
| antique    | Shadowed     | 3     | classic | metal tone + charcoal in the lines                                         |
| glaze      | Colour Glaze | 4     | playful | metal tone + one of sky, coral, sage, mustard, lavender, teal, navy, blush |

| extra id   | name            | price | tags    | colour                     |
| ---------- | --------------- | ----- | ------- | -------------------------- |
| fine-chain | Fine Chain      | 4     | dainty  | metal tone                 |
| rope-chain | Rope Chain      | 6     | bold    | metal tone                 |
| silk-cord  | Silk Cord       | 3     | nature  | one of the 8 glaze colours |
| star-charm | Tiny Star Charm | 2     | sparkly | gold                       |
| leaf-charm | Tiny Leaf Charm | 2     | nature  | sage                       |
| pearl-drop | Pearl Drop      | 3     | elegant | ivory                      |

### 4.5 Clients (8; 2 trait-gated)

Briefs are varied by seeded RNG like ADEEVA's brief roll (budget, fee, deadline, 2 favoured colours). Kiko's lines are her own; her dad pays and collects.

| id         | name, relation                                     | gate / min rep     | product        | required tags                                                    | favoured                 | avoid                 | required extras | budget | fee     | days | min Q |
| ---------- | -------------------------------------------------- | ------------------ | -------------- | ---------------------------------------------------------------- | ------------------------ | --------------------- | --------------- | ------ | ------- | ---- | ----- |
| gran-mina  | Gran Mina, who keeps every button in a biscuit tin | — / 0              | stone-pendant  | classic                                                          | ruby, ivory, gold        | black                 | —               | 20–30  | 35–45   | 3–5  | 55    |
| dev        | Dev, who skates past the arcade every morning      | — / 0              | stack-ring     | bold                                                             | charcoal, copper, bronze | blush                 | —               | 10–20  | 35–45   | 3–5  | 55    |
| kiko       | Kiko (turning nine), with her dad, Mr. Tanabe      | — / 0              | charm-bracelet | playful                                                          | sky, coral, lavender     | charcoal              | star-charm ×1   | 15–25  | 40–50   | 4–6  | 55    |
| aunt-lucia | Aunt Lucía, opening a flower shop                  | — / 3              | shape-pendant  | nature                                                           | sage, emerald, copper    | gold                  | silk-cord ×1    | 15–25  | 45–60   | 4–6  | 60    |
| ms-saoirse | Ms. Saoirse, the school music teacher              | — / 6              | drop-pair      | elegant, dainty                                                  | silver, teal, navy       | coral                 | —               | 20–35  | 55–70   | 4–6  | 62    |
| juniper    | Juniper, who writes stories about the moon         | Dreamer / 10       | stone-pendant  | dreamy (crescent, star window, sea glass, amethyst or moonstone) | lavender, navy, silver   | —                     | star-charm ×2   | 30–45  | 85–100  | 5–7  | 65    |
| mr-okonkwo | Mr. Okonkwo, retired postman, for his anniversary  | — / 14             | stone-ring     | elegant                                                          | ruby, gold, ivory        | black                 | —               | 35–50  | 70–90   | 5–7  | 68    |
| mr-farouk  | Mr. Farouk, who repairs telescopes                 | Perfectionist / 24 | stone-ring     | classic, elegant                                                 | silver, black, gold      | metals: copper, brass | —               | 50–70  | 100–120 | 5–7  | 84    |

| client     | request                                                      | delighted                                               | nearMiss                                      |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------- | --------------------------------------------- |
| gran-mina  | A little pendant, please. Something I can wear every Sunday. | It's perfect. I'm wearing it to tea right now.          | Lovely, dear. One little claw looks shy.      |
| dev        | I want a ring that looks tough. Bold, not shiny-shiny.       | That's so cool. My whole crew wants one now.            | It's good! The edge is a bit rough.           |
| kiko       | Can I have a bracelet with charms? It's my birthday!         | It jingles! It's the best present ever!                 | I love it! One charm is a tiny bit wobbly.    |
| aunt-lucia | Something leafy for my new shop. I'll wear it every day.     | It looks like it grew in my window box. Thank you!      | Very sweet. A few spots could shine more.     |
| ms-saoirse | Earrings for the spring concert, please. Graceful and light. | They'll sparkle under the stage lights. Wonderful.      | They're pretty! One is a little uneven.       |
| mr-okonkwo | Forty years married. A ring with a red stone, please.        | She cried happy tears. Thank you, truly.                | She loves it. The stone sits a touch crooked. |
| juniper    | Make me something that belongs to the night sky.             | It's like holding the moon. I'll write it into a story! | Almost magic! Maybe a few more stars.         |
| mr-farouk  | A ring as true as a good lens. Every line exact.             | Flawless alignment. I couldn't have done better myself. | Good effort. Precision comes with patience.   |

**Day 1:** the first offer is always `gran-mina` (stone pendant: cut, join, set and polish all appear). From day 2 the normal pool applies.

### 4.6 Upgrades and stall decor

Upgrades (4; one-time; reputation-gated; mirror ADEEVA's four):

| id          | name              | price | min rep | effect                                 |
| ----------- | ----------------- | ----- | ------- | -------------------------------------- |
| steady-peg  | Steady Bench Peg  | 140   | 6       | cut tolerance ×1.15                    |
| gentle-lamp | Gentle Lamp       | 150   | 12      | join zone ×1.15                        |
| magnifier   | Magnifier Stand   | 160   | 18      | set `dTol`, `aTol` and claw band ×1.15 |
| comfy-stool | Comfy Bench Stool | 220   | 26      | +1 working hour every day              |

Stall decor (one-time, fixed price, display only, no gameplay effect, no randomness): `lantern-string` Lantern String (40), `mirror-easel` Little Mirror Easel (80, reflects the tray only), `velvet-awning` Velvet Awning in one of the 4 cloth colours (120).

### 4.7 Market themes (3)

`spring-fair` Spring Fair (nature, playful; sage, coral, sky, emerald) · `lantern-night` Lantern Night (dreamy, sparkly; navy, lavender, gold, ivory) · `harbour-day` Harbour Day (classic, bold; navy, teal, silver, charcoal). The palette tints the hub theme card and is scored by `themeShare`. Every palette is reachable from day 1: Spring Fair through a sage, coral or sky glaze or cord; Lantern Night through a navy or lavender glaze or brass's gold tone; Harbour Day through a navy or teal glaze, silver or the Shadowed charcoal.

### 4.8 Story beats (8; player lines voiced by trait, as in ADEEVA's `storyVoice`)

Trait beats arrive for the matching trait only: Dreamer when Juniper's tag arrives or when a design first shows Dreamer flair, Perfectionist when Mr. Farouk's tag arrives, Trendsetter at the end of week 1, and Charmer after the first delivery.

| id                | trigger                | title            | gist (2–5 lines)                                                                                         |
| ----------------- | ---------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| jb-key            | intro                  | Lanterns On      | Mr. Osei unlocks the bench: "Steady hands, big ideas." Gran Mina's order tag is already pinned up.       |
| jb-first-delivery | first-delivery         | The Little Box   | You tie the ribbon on your first gift box. Osei: "Now it's part of someone's story."                     |
| jb-first-market   | first-market-day       | Market Morning   | The arcade fills with lanterns and shoppers. Osei collects the rent and points to the upgrade catalogue. |
| jb-dreamer        | trait-dreamer          | Moon in a Teacup | You sketch a crescent pendant at midnight; a note from Juniper arrives next morning.                     |
| jb-perfectionist  | trait-perfectionist    | True as a Lens   | Mr. Farouk shows you a telescope lens and asks if your claws can be that exact.                          |
| jb-trendsetter    | trait-trendsetter      | Window Glints    | Walking the arcade, you notice what shoppers love; next week's tags appear on the hub chalkboard.        |
| jb-charmer        | trait-charmer          | Tea at the Stall | Stallholders stop to chat; one tells three friends about you (+2 buzz once).                             |
| jb-lean-week      | bankrupt (Challenging) | A Quiet Week     | Osei: "Every maker has a quiet week. The Bead Barn needs a sorter." Points to the shift. No game over.   |

## 5. Evaluation, rewards and economy

**Quality** (0–100): `100 × (0.30·cut + 0.25·join + 0.25·set + 0.10·polish + 0.10·metalFit)`. For a piece with no stones the weights are divided by their sum without `set` (cut 0.40, join 0.333, polish 0.133, metalFit 0.133).

- cut, join, set, polish: averages over parts, joints or stones; an uncut part, unjoined seam or unset stone counts 0, like ADEEVA's `dressQuality`.
- metalFit: 1 if the metal's tags include `classic` or meet a required tag, and the metal is not avoided; otherwise 0 (ADEEVA's `materialFits`). Stall pieces: metalFit = 1 when the metal's tags include `classic` or a tag of this week's theme.

**Criteria** (ADEEVA ids and weights; `trims` is labelled **Extras**):

| Criterion    | Weight | Pass rule                                                                                                            |
| ------------ | ------ | -------------------------------------------------------------------------------------------------------------------- |
| construction | 3      | All parts cut, all seams joined, all stones set, and every part polished (≥ 60% of its live cells shine). Mandatory. |
| quality      | 2      | Quality ≥ brief minimum (+6 on Challenging, ADEEVA `minQualityBonus`).                                               |
| style        | 2      | Every required tag appears in the piece's tags (product ∪ options ∪ metal ∪ stones ∪ finish ∪ extras).               |
| colours      | 1      | No avoided colour (metal tone, stones, glaze, cord, charms). +2 per favoured colour used, up to +4.                  |
| extras       | 1      | Required extra counts met.                                                                                           |
| budget       | 1      | Spend on metal, stones, clips, finish and extras ≤ budget.                                                           |
| deadline     | 1      | Delivered by the deadline day.                                                                                       |

**Score** = `clamp(round(0.3·passMix + 0.7·quality + colourBonus), 0, 100)`, the same `evaluate` parameters as Workshop. Stars use ADEEVA's `starsForScore` (90/75/55/35). The **pass gate** is construction, style, extras and quality, as in ADEEVA. Feedback reuses ADEEVA's `kindFeedback` tone, with one new line for extras: "So close! The order asked for a few more charms or extras."

**Results kid summary:** one line per criterion above the stars, e.g. "Cut out: crisp!", "Joins: smooth!", "Stones: snug!", "Extras: 1 more charm needed".

**Keepsake Case:** each delivered order and each piece shown on Market Day appends `{day, source (clientId or themeId), productId, optionIds, metalId, stoneIds, finish, glazeColour, extras, charms (poses), stars, line}` to the save; the newest 30 are kept. The hub's Keepsake Case draws each entry with `PiecePreview` and `PlacedLayer` on a velvet card, with the client's delighted or nearMiss line and stars (Market pieces show the theme name and shopper score). It stores no pictures and never leaves the device.

**Rewards** (ADEEVA's `rewards` rules and constants, plus one Jewellery rule):

- **Pass:** `fee × (0.8 + 0.4·score/100)` + trait lines; reputation `1 + round(2·score/100)`; buzz `1 + stars + 3 per trend match`.
- **Fine metal:** on a pass, +15% of the fee per sparkle above 1 (silver +15%, rose gold and gold +30%). A 3-sparkle metal also gives +1 reputation.
- **Standard soft fail:** 40% of the fee, reputation −1 (0 for Charmer), and kind feedback from the failed criteria.
- **Relaxed:** every run counts as a pass; stars still reflect quality. Rent ×0.
- **Challenging:** minimum quality +6; a fail pays 0 with reputation −3; late delivery costs 50% of the fee; rent ×1.5 (135).

**Traits** (game-flavoured perk text; ADEEVA mechanics):

| Trait         | Perk text                                                                      | Mechanic                                                                           |
| ------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Dreamer       | "Starry ideas: +15% fee when a piece shows 3 colours or feels dreamy or bold." | ADEEVA's Dreamer rule; also on Market Day sales when the tray shows 3+ colours     |
| Perfectionist | "Steady hands: cutting, joining and setting are 20% more forgiving."           | ×1.2 on cut tolerance, join zone, `dTol`, `aTol` and claw band                     |
| Trendsetter   | "You spot what the arcade loves before anyone else."                           | Next week's hot tags shown early; +10% fee per trend match (orders and Market Day) |
| Charmer       | "Shoppers linger at your stall: a 10% tip on every happy sale."                | 10% tip on passes and Market Day sales; a near miss never costs reputation         |

**Trends:** the engine's `trendMarket`, given the 8 `JewelTag`s, draws 2 hot tags a week, shown on the hub chalkboard as "Shoppers love: sparkly, nature."

**Materials and spend:** sheets leave stock with the first cut, stones with the first stone set, and the chain or cord, charms and clips on delivery (or when a stall piece goes in the box). The finish price is paid at the same moment. Budget compares the piece's own materials and finish with the brief, so leftover stock from earlier visits costs nothing extra.

**Economy:** a 10 h day; start 100 coins; rent 90 (Challenging 135) at the end of each 7th day; shift 30. Offers from `offerCountForBuzz` (1–3 a day; 1 a day through week 1, while buzz is under 34), pending and lifetime rules as ADEEVA; active orders capped by `MAX_ACTIVE_GIGS` (3).

**Sanity checks (Standard):**

- **Day 1:** Gran Mina: brass sheet 5 + garnet 6 + fine chain 4 = 15 (brass shows the favoured `gold`, and garnet the favoured `ruby`: colour bonus +4), leaving 85. Pay ≈ 47, net ≈ +32.
- **Net per order, cheapest fitting metal:** Gran Mina +32, Dev (brass strip 4 + Shadowed 3 = 7; Shadowed adds the favoured charcoal) +40, Kiko (copper sheet 4 + chain 4 + star charm 2) +42, Aunt Lucía (copper sheet 4 + cord 3) +54, Ms. Saoirse (silver 12 + clips 2, +15% fine metal) +69, Mr. Okonkwo (brass strip 4 + sheet 5 + garnet 6) +79, Juniper (silver 12 + sea glass 3 + chain 4 + 2 charms 4 = 23, crescent for `dreamy`, +15%) +99 before trait lines.
- **Market Day (Spring Fair):** 3 copper stall pieces with a sage, coral or sky glaze or cord cost ≈ 24 and 15 h across days 6–7. At avg quality 88, theme share 1, cohesion 0.6, centre bonus: score ≈ 40 + 30 + 12 + 5 = 87 → all 3 sell for ≈ 92, net ≈ +68, about +45 per day of work, close to an order. It rewards planning without replacing orders.
- **Week 1:** 5 orders from the rep-≤ 6 clients (avg net ≈ +48) + Market Day (+68) − rent 90 → 100 + 240 + 68 − 90 ≈ 318 coins; reputation ≈ 16: rose gold, gold and Mr. Farouk arrive in weeks 2–3. Upgrades (670) absorb weeks 2–4; decor (240) after that.
- **Struggling Standard week:** 3 passes (+105), 2 soft fails (≈ +5 each), 1 shift (+30), no Market Day → 100 + 105 + 10 + 30 − 90 = 155. Solvent.
- **Struggling Challenging week:** 3 passes (+105), 2 fails (−15 materials each), 1 shift (+30) → 100 + 105 − 30 + 30 − 135 = 70. Still above 0; a worse week triggers A Quiet Week.
- **Decent player** (cut 0.88, join 0.90, set 0.88, polish 0.95, metalFit 1): quality = 26.4 + 22.5 + 22 + 9.5 + 10 = 90 → score 93–97, 5★. Weak run (0.70, 0.65, 0.70, 0.80, 1): quality ≈ 73 → score ≈ 81–85, still passes up to Mr. Okonkwo's 68.
- **Pass rate:** the decent player clears every minimum (55–84), so fails come from a missed tag or extra, a late delivery or a rough day; expected pass rate ≈ 80–90%. Mr. Farouk (84, Challenging 90; no copper or brass; a stone ring with 2 joins and claws) is the real precision test.
- **Assist everywhere:** every skill term 0.8, metalFit 1 → quality 82 → score 87 (4★), 89 with 1 favoured colour, 91 (5★) with 2, the same generosity as ADEEVA. Assist passes every Standard minimum except Mr. Farouk.
- **Fine metal trade:** for Mr. Okonkwo, gold (strip 17 + sheet 24 + garnet 6 = 47) earns +30% fee and +1 reputation but needs a budget roll of 47+; brass (15) is the safe choice. For Mr. Farouk, silver (8 + 12 + 6 = 26) is safe; gold (47) fits every roll once unlocked at rep 30.

## 6. Screens and art direction

**Studio tile:** `title "Jewellery Bench"`, `tagline "Cut, join and set tiny treasures."`, `ages "8–15+"`, `tileArt JewelleryTile` (a loupe over a crescent pendant).

**Screens:**

- **Title** (studio-wide) → **New Game** (avatar pre-filled from the studio profile, then trait and difficulty) → **Lanterns On**.
- **Bench Hub:** the stall front under lanterns: a corkboard of order tags (offers), a calendar as a row of 7 little drawers (Market Day drawer gold), hours as 10 beads on a thread, coins, reputation, buzz, the trends chalkboard, this week's market theme card, active orders, the stall box (finished stall pieces), stock drawers, upgrades and decor, Keepsake Case (a glass-topped case of velvet cards; tap one to see it large with its line and stars), End Day, Shift, Save, and Back to Studio.
- **Design:** product cards, shape and band chips, metal swatches with hammer icons and ✦ sparkle glints, a stone tray, and `PiecePreview` on a velvet card.
- **Supply Cabinet:** wooden drawers of sheets and strips, stone trays, a chain rail, with prices and a "Fits your plan" badge.
- **Plan your sheet**, **Cut out**, **Join**, **Set**, **Polish** and **Display** (§3), each framed in a round brass loupe window over the bench.
- **Results:** the piece in an open gift box on a table in the client's world, the kid summary, the criteria list, stars and reward lines. 4 `DeliveryScene` backdrops: **Kitchen table** (Gran Mina, Kiko), **Shop counter** (Aunt Lucía, Mr. Farouk, Dev), **Concert hall foyer** (Ms. Saoirse, Mr. Okonkwo), **Night garden** (Juniper).
- **Market Day:** the stall with the 3-slot velvet tray, cloth and sign pickers, shoppers strolling as soft silhouettes, then a coin tally and the shopper score.

**Art direction (distinct from ADEEVA, same tokens):**

- **Palette:** ADEEVA's ink, cream, shadow, radius and focus tokens, plus a game accent set in `games/jewellery/ui/theme.css`: velvet teal `#1f4e5a`, velvet plum `#4b2a4f`, lantern amber `#e8a33d`, bench walnut `#7a5236`, and the metal tones (§4.1).
- **Shapes:** fine 1.5 px ink outlines and small, precise forms; metal drawn with two-stop gradients and a single 4-point glint; stones as faceted polygons with 3 tints of their colour. Dusk light from lanterns makes the hub warm against the cool teal velvet.
- **Motifs:** the round loupe frame, a dotted "measuring" ring around panels, ribboned gift boxes, lantern strings and order tags on twine.
- **Fonts:** display `"Didot", "Bodoni MT", Georgia, serif` as installed system fonts only (as ADEEVA); body `system-ui`. Nothing is downloaded.
- **Original SVG scenes and parts:** `JewelleryTile`; `ArcadeBackdrop` (stall front, lanterns, neighbour stalls in silhouette); `BenchBackdrop` (bench peg, tool roll, lamp); `MetalSheetArt` (tone gradient, faint brushed lines); `StoneArt` (4 cuts × 8 colours, parametric); `SawSprite`; `Shavings`; `CornerDot`; `JoiningLamp` with `WarmthBar` and `JoinLine`; `ClawHandle`; `PolishGrid`; `PiecePreview` (one parametric drawing per product, shaped by the options); `ChainArt`; `CharmArt` (3); `GiftBox`; `KeepsakeCase`; `StallTray`; 3 decor overlays; 4 `DeliveryScene` backdrops.
- **Avatar:** the shared `Avatar` wears an apron and a loupe headband in bench scenes, as a cosmetic overlay. Jewellery is never shown on the avatar or on any client; it sits on cards, trays and in boxes. Motion respects `prefers-reduced-motion`: shavings and glints become a single fade, the lamp does not flicker, shoppers stand still.

## 7. Reuse map

**Engine (`src/engine`, per the studio contract):** `rng`, `rngDraw`; `week`, `dayHours`, the calendar `endDay` skeleton, `weeklyBill` and the shift; `standing` (coins, reputation, buzz); offers (`offerCountForBuzz`, `clientIsEligible`, the roll skeleton, `MAX_ACTIVE_GIGS`); difficulty rules; `storyQueue` and `storyVoice` over a per-game trigger union (adds `first-market-day`); the `criterion` shape, `starsForScore`, the parameterised `evaluate` (0.3 / 0.7 / 2 / 4, as Workshop) and `kindFeedback` tone; `rewards` per difficulty; `trendMarket` (tag list as a parameter); `traceAccuracy` and `distanceToOutline` (closed outlines); `polygonOverlap`, `triangulate`; save envelope and migrations; `actionCheck`; `checklist`. **Saves:** `jewellery.save.1..3`.

**ADEEVA modules reused (via `src/engine/textile/` and `src/engine/`, where Thrift-Flip, Patisserie and Workshop moved them):**

- Core: `piecePolygon` (`placedPolygon`, `polygonBounds`), the generalised `piecePlacementIssues`, `rotation` (`ROTATIONS`, 45° steps), the `mirrorPair` rule from `garmentPart`/`requiredPieces`, the `cutCommit` idempotency pattern (sheet commits), `cutTolerance` as a pure multiplier function (`BASE_PIERCE_TOLERANCE_MM`), `ASSIST_CUT_ACCURACY`, the `recordSeam` validation as `recordFollow` (join counts), the `seamAccuracy` cap pattern (`ASSIST_SEW_ACCURACY_CAP`), `materialFits` (as `metalFit`), `decoration` pose and limits via `PlacedLayer` (charms), `paletteCohesion` (Market Day; moves to `src/engine/` as its second user), the runway "strongest closes" rule from `runwayScore` (centre bonus), `stageNavigation`, `stageReadiness`, `hourCost` and `delivery` as patterns.
- Content: `colour`, `difficulty`, `trait` (names only).
- UI: the hold-and-tick loop of `SewingStage` as Patisserie's `useTickLoop` (Joining Lamp), `TrimLayer` as `PlacedLayer`, `Avatar`, `ColourSwatch`, `seedFromText`, and all of `ui/kit` (`Button`, `Card`, `Dialog`, `Meter`, `SegmentedControl`, `StarRating`, `StatChip`, `TagPill`, `ToastStack`, `ToggleSwitch`).

**Shared with the other new games:** `trendMarket`, `trendReward` and `weekSettlement` take an optional tag list (Jewellery passes its 8 `JewelTag`s; the other games keep ADEEVA's style tags), `stateParsers.tagTrendStateParser` parses any tag list, and `paletteCohesion` lives in `src/engine/` with ADEEVA re-exporting it. The seat fit (`core/stoneSetting`), the polish grid (`core/polish`) and the join counts (`core/joiningLamp`) stay in the game until a second game needs the same rule. The Keepsake Case follows the pattern of Patisserie's Bake Book.

**New code (`src/games/jewellery`):**

- `content/`: `jewelTag`, `metal`, `stone`, `stockSize`, `product`, `partOption`, `finish`, `extra`, `client`, `upgrade`, `decor`, `marketTheme`, `storyBeat`, `career`, `hints`.
- `core/`: `sheetPlan` (placement adapter, Show me); `cutRecord` (coverage and sample checks, `pxPerMm` floor, corner-dot stroke trimming); `joiningLamp` (`warmthStep`, zone, flow, `joinAccuracy`, record validation); `stoneSetting` (start pose, seat gate via `poseFit`, claws, `setAccuracy`, validation); `polish` (mask, adapter onto `coverageGrid`, polished threshold); `displayChoice`; `pieceTags`, `pieceQuality`, `pieceEvaluate`, `fineMetal`; `stallBox`, `marketDay` (theme roll, theme share, shopper score, sales); `keepsakeCase`; `pieceRun`, `reduce`, `gameState`, `save`, `reputationOf`.
- `ui/`: Bench Hub, Design, Supply Cabinet, Plan, Cut out, Join, Set, Polish, Display, Results, Keepsake Case and Market Day screens, and the art in §6.
- `module.ts`; a unit test per core file (warmth steps and zone edges per difficulty, `joinAccuracy` with overheat, the 240/300 tick seams, the `pxPerMm` tolerance floor, corner-dot trimming, claw band edges, seat gate, no-stone weight split, the 60% polished rule, theme share with palette colours, empty tray slots, shopper score and sales thresholds, theme never repeating, Keepsake Case keeping the newest 30); a test that every hint is ≤ 12 words and ≤ 2 sentences and every client line ≤ 2 sentences; a lint test that no `@font-face`, `url(` font or network fetch exists under `src/games/jewellery`; and `e2e/jewellery/` specs covering a full Day-1 Gran Mina order made by hand (real drag, traces, lamp pulses, stone and claw drags and rubbing) through to the Keepsake Case and a save, reload and continue; a Market Day with 3 stall pieces and a save and reload in the middle of a join; and home → Jewellery Bench → back with the studio avatar pre-filled.

## 8. Safety notes for this theme

- **No real soldering or heat guidance.** The Joining Lamp is a fictional glowing lamp; no flame, torch, gas, flux, pickle or temperature is ever named or drawn. Warmth is a 0–1 bar, never degrees. The only real-world line, shown once on the Join and Cut screens: "Real jewellery tools get hot and sharp. Ask an adult first."
- **No real tool or chemical instructions.** No technique tips, measurements to copy, gauges, saw-blade sizes, polishing compounds, cleaning liquids or "how to make this at home" steps. The Shadowed finish is a colour, not a process. Cut shows bright shavings, never dust.
- **No real value talk.** Metals and stones have small game prices only. No carat, karat, hallmark, purity, "real vs fake", investment or price-per-gram language. Fine metals earn a game bonus, never a "worth more" message.
- **No bodies, no appearance talk.** Jewellery is never shown on a person, ear or hand. All earrings are clip-on; there is no ear piercing anywhere, and nothing suggests anyone should get pierced. Clients talk about the piece, never about how they or others look. Market Day scores the tray, never the shoppers.
- **No skin or health claims.** No mention of allergies, nickel, "hypoallergenic", birthstones as luck or healing, or stone "powers".
- **Small parts stay in the game.** No printable templates; Results never shows a small child holding loose stones or charms. Kiko's bracelet is collected by her dad.
- **Neutral, kind clients.** Avoided colours or metals are personal ("it reminds me of rust"), never "for girls" or "for boys". Dev's and Kiko's orders show jewellery for everyone, and the studio tile's tagline is gender-neutral.
- **Randomness is free.** Offers, brief variations, start poses and market themes come from the seeded RNG; nothing can be rerolled or bought with money. Decor is fixed-price and cosmetic. The Keepsake Case stays in the local save. No ads, no chat, no network.

## 9. Out of scope for this slice

- A second career (boutique, repair counter or school), a hired apprentice, Market Day commissions, and trait-gated clients for Trendsetter and Charmer (story beats only).
- More products (bangles, brooches, lockets, cufflinks), wire-wrapping, beading, casting, engraving, enamelling as a process, rim (bezel) settings, and mixed metals in one piece.
- Resizing, repairs, returns, wear over time, stone breakage, jewellery on the avatar, photo import, image export or printing of Keepsake cards, printable designs, and any online sharing or leaderboards. If the build runs long, cut the stall decor (3 overlays) and the tray sign first.
