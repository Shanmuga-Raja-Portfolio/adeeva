# Jewellery Bench — Game Design (id: `jewellery`)

Built first as a playable slice of the Maker Studio contract (`work/0003-studio/design.md`) at about a third of ADEEVA's depth; §10 grows it to ADEEVA's depth with a second career, **Collection Designer**, and the **Lantern Night Launch**. You rent a little workbench in the **Thimble Lane Arcade**, a covered row of craft stalls strung with lanterns. Mr. Osei, who runs the arcade and mends music boxes, hands you the key. Neighbours bring orders for rings, pendants, earrings and bracelets. For each order you design the piece, choose a metal and stones, plan the sheet, cut it out, join it, set the stones, polish it and deliver it in a gift box. Every delivered piece goes into your **Keepsake Case**, a gallery you can show off. On the seventh day of each week the arcade holds **Market Day**, when you set out a collection of up to three pieces on your stall tray. All names, text, numbers and art are original. The studio safety promise applies on every screen.

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

- **Input:** the piece sits on a stone tile under the **Joining Lamp**, a warm glowing lamp (no flame is ever drawn). Hold the 56 px **Warm** button and a warmth bar rises; release and it cools. A gold **zone** is marked on the bar. While warmth stays in the zone, a silver line of "join" runs along the seam; when it reaches the end, the seam is joined with a little chime of light (there is no sound).
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

## 9. Out of scope (slice and depth)

- A third career (repair counter, jewellery school), staff or an apprentice, an online shop, and selling at the Lantern Night Launch itself.
- Lockets, cufflinks, tiaras, anklets and toe rings; wire-wrapping, beading, casting, engraving, enamelling as a process, rim (bezel) settings, and mixed metals in one piece or one collection.
- Resizing, repairs, returns, wear over time, stone breakage, jewellery on the avatar or on any person, photo import, image export or printing of Keepsake or Lookbook cards, printable designs, and any online sharing or leaderboards.
- Rival makers who are scored, ranked or shown losing; entry fees; haggling; real prices or values.
- If the build runs long, cut in this order: the stall and loft decor, then the tray sign, then Even shine, then the Twin Lamp (§10.4), which is cheap and goes last.

## 10. Depth: Collection Launch

Phase B (`work/0003-studio/roadmap.md`) grows Jewellery Bench to ADEEVA's depth. ADEEVA grows Student → Label, with 3-look collections and a runway. Here the **Arcade Bench Jeweller** grows into a **Collection Designer** in the same save. Mr. Osei's old music-box workshop above the arcade gate becomes **the Lantern Loft**. Each season you design a themed **collection** of 3–5 matching pieces (one motif, one metal, one stone palette), source its stones at **Pebble & Prism** on a collection budget, style and light the pieces for a **Lookbook**, reveal the collection at the **Lantern Night Launch** on the arcade's lantern-lit stage, and sell it the next day at your **Pop-up Window**. Four warm panels of neighbours cheer each launch. Nobody is sent home, ranked against other makers or timed against a rival. Everything in §1–§9 still applies unless this section changes it.

All new metals, stones, products, options, finishes, extras and clients in §10.8 are open in **both** careers by their reputation gates, so a bench player meets new content in weeks 2–3. Collection runs, the Gem Market, the Lookbook, the Launch, the Pop-up, the Twin Lamp and the loft upgrades belong to the collection career.

### 10.1 Careers, unlock and "start here"

`content/career.ts` becomes a list, `CAREER_IDS = ["bench", "collection"]`; `GameState.career` is new.

| id           | on screen             | place                                  | start coins | start rep | weekly rent (Std; Challenging)        | shift (any difficulty)                  |
| ------------ | --------------------- | -------------------------------------- | ----------- | --------- | ------------------------------------- | --------------------------------------- |
| `bench`      | Arcade Bench Jeweller | the Lantern Bench, Thimble Lane Arcade | 100         | 0         | 90; 135                               | "Sorting beads at the Bead Barn", 30    |
| `collection` | Collection Designer   | the Lantern Loft, above the arcade     | 380         | 30        | 130; 195, label "Bench and loft rent" | "Threading lanterns for the arcade", 45 |

- **Unlock (same save):** while `career === "bench"`, `loftOfferReady` runs after each delivery, after Market Day and at End Day. It passes when reputation ≥ **45** and `ordersDelivered` ≥ **14** (no Market Day condition, as Workshop keeps only a delivered guard, so a player who never runs a stall gets there too), beat `jb-loft-offer` is not seen and `loft-offer` is not already queued. It then queues `loft-offer`.
- **Pacing:** a pass gives `1 + round(2·score/100)` = 3 reputation for a decent piece, +1 for a 3-sparkle metal, +1 for a Market Day at 75+, and −1 for a Standard soft fail. Week 1 has one offer a day (≈ 13.6 reputation for a decent player); from week 2 buzz gives 2–3 offers a day and about 7.9 deliveries (≈ 21 reputation) fit in a week.

| player                     | reputation per delivery | offer lands |
| -------------------------- | ----------------------- | ----------- |
| pass rate 95%              | 2.9                     | days 17–18  |
| pass rate 88%              | 2.6                     | days 19–20  |
| pass rate 80%              | 2.2                     | days 22–23  |
| pass rate 70%              | 1.8                     | days 26–28  |
| Relaxed                    | 3.0                     | days 16–17  |
| Challenging (75%, fail −3) | 1.5                     | days 29–34  |

- **Story beat `jb-loft-offer`:** Mr. Osei leads you up the spiral stair. Choices use the typed story effect (`StoryBeatDef = StoryBeat<StoryTrigger, "open-loft">`, widened from `never`, as ADEEVA and Workshop do). **"Launch my own collection"** dispatches `openLoft`. **"Not yet"** sets the flag `loft-later`, and the hub keeps a "The Lantern Loft" card with the same button (`canOpenLoft`), so the offer never expires. The beat can't be dismissed without a choice.
- **`openLoft {lineNameId}`:** sets `career: "collection"` and keeps coins, reputation, buzz, stock, upgrades, decor, Keepsake Case, stall box, log, active gigs and any run on the bench. The player picks a **line name** from 8 presets (§10.8; never free text). It adds **Osei's Starter Drawer** (1 silver wide sheet, 2 fine chains; ≈ 30 coins) and opens Season 1 on the next week start (`collection.seasonStartDay`). The loft rent applies from the first settlement on or after that day, so the week in progress still pays 90. Illegal (same state reference) when already `collection`, below the thresholds or with an unknown name.
- **"Start here" (older players):** New Game gains a **Career** step between Trait and Difficulty using the shared `ui/newGame/CareerStep` with `careerDraft` and `careerFacts`. Cards: "Lantern Bench (start here if you're new)" and "Your Own Collection (for jewellers who know the bench; suggested 12+)". The suggestion is a label, never a gate; Lantern Bench is preselected. A collection start gets 380 coins, reputation 30, the slice starter stock plus Osei's Starter Drawer, a line name, `seasonStartDay = 1`, and the intro beat `jb-intro-loft` in place of `jb-key`. Day 1 is still Gran Mina's order. The first-order coach starts off; the first hub shows a one-time **"Want a quick bench tour?"** toggle that turns it on.
- **Studio reputation:** `profile.startedAs` is fixed at New Game. `module.ts` switches from `traitGatedReputation` to `earnedReputation(raw, SCHEMA_VERSION, startOf)`, where `startOf` keeps the trait check and returns 30 for `collection` and 0 for `bench` or a missing `startedAs` (v1 saves). Opening the loft never changes earned studio reputation.
- **Rest the line:** on season day 1 the theme card (§10.7) also offers **"Rest the line this season"** (`restLine`): rent 90, no collection, Launch or Pop-up. Market Day still runs on both week ends. The choice resets next season.

### 10.2 How play changes

A **season** is 14 days anchored at `collection.seasonStartDay` (always a week start), never at global week parity. The clock is the engine's `seasonClock` (`seasonDay(start, day, 14)`, `nextSeasonStart`), lifted from Workshop (§10.12). Seasons cycle Spring → Summer → Autumn → Winter.

| Season day | What happens                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1          | Theme card (pick 1 of 2, or Rest the line); the **Collection Board** opens (1 h, can be confirmed until day 10); **Pebble & Prism** sets up its tray (days 1–10)   |
| 1–12       | Working days: orders, collection pieces, stall pieces; the **Lookbook** (2 h) once every collection piece is finished                                              |
| 7          | Market Day (§3.7), then rent                                                                                                                                       |
| 13         | **Lantern Night**: the bench stays open until the Launch is staged (§10.5); staging uses the rest of the day                                                       |
| 14         | **Pop-up Day** (§10.6, 3 h) in place of Market Day; staging the Launch here is late (−10 except Relaxed; costs 4 h, before the Pop-up). End Day: rent, next season |

- **Orders keep coming** from all 16 clients (§10.8), with the engine's offers, the gig cap of 3 and the buzz rules. An order due on Lantern Night is due the next day instead.
- **Bench:** still one run at a time. `RunPurpose` gains `{kind: "collection", slot}` and `RunKind` widens to match. A collection run's `brief` comes from `collectionBrief(theme, spot, difficulty)`: required tags are the theme's 2 (any 1 passes), favoured colours are its palette and the minimum quality is the spot's "Ready for Lantern Night" mark (§10.5) plus the difficulty bonus. It has **no budget or deadline criteria**; the checklist shows "Line cost so far" in their place, as Workshop's collection pieces do. It is guidance only and never stops a piece reaching the Launch.
- **Stages:** `design → supplies → plan → cut → join → set → polish → display → review`, as an order without `brief`. Design is **0 h** and pre-filled from the Collection Board: only the product's band or accent pick is left. A piece costs 4–6 h (plus 1 h per supply visit). Review evaluates the piece with `pieceEvaluate`, pays nothing and moves it into the collection as a `CollectionPiece`.
- **Setting aside:** a collection run can be set aside with `abandonRun` before its first cut, like an order; after that `abandonRun` is refused (same reference) with "Finish this piece first." Collection runs never touch `log` or `ordersDelivered`.
- **Line Drawer:** unsold collection pieces from earlier seasons wait here (up to 8). They are `StallPiece`-shaped and sell by their product's `stallBase` (§10.8), so they can go on a Market Day tray or the Pop-up's Little shelf. When a ninth piece arrives, the oldest is sold from the Little shelf at its Gentle price ("A visitor took your oldest piece home!"); its Keepsake card stays, so no piece is ever deleted.
- **Lantern Night with pieces still on the bench:** the Launch runs with every finished piece if at least **2** are finished (Relaxed: at least 1). Unfinished collection runs keep their work and move to next season's line: its Collection Board opens with their slots filled and their motif and metal fixed, and the theme card still offers the two new themes. On day 14, End Day is refused while the Launch can still be staged ("The lanterns are waiting for your line.").
- **Skipped Launch:** only when fewer pieces are ready by the end of day 14 is the Launch skipped with `jb-launch-skipped`. Nothing is lost: the brief, finished pieces, stone pot, line sheets and Lookbook **carry over** to next season with the same theme (no theme card), and the spot stays.
- **Hub additions:** a Season ribbon ("Season 2 · Midsummer Stars · Fountain Steps · 6 days to Lantern Night"), the Collection Board card, Kemi's Pebble & Prism stall, the collection tray (finished pieces side by side), the Line Drawer, the Lookbook album, the Pop-up Window and the Lantern Garland (§10.7).

### 10.3 The Collection Board (design for a whole line)

`confirmCollection {brief}` (one action, 1 h, season days 1–10, refused once the brief is set) fixes the season's `CollectionBrief`:

- **Size and products:** as many slots as the spot allows (§10.5), each a different product from the 14 (§10.8), with at least 2 kinds among ring, pendant, earrings, bracelet, badge, charm and slide ("A line, not a pile.").
- **Motif:** one of the 10 shapes. It becomes the `shape` option of every product with a shape slot and the top of a Motif Ring. Bangles and hair slides carry it through a **Motif Charm** at Display; Stacking and Stone Rings can't, so they lower Motif share. A piece **carries the motif** when its shape is the motif or it holds a Motif Charm.
- **Metal:** one metal open at the player's reputation, used by every piece. **Stones:** a hero stone (any piece with 1 seat) and an optional accent stone (pairs), or none. **Finish:** one finish (and glaze colour) for the whole line, paid per piece.
- **Preview:** every piece side by side on a velvet tray with a live **Harmony meter** (motif share and palette cohesion). On Relaxed the board opens on "Osei suggests…": a theme-tagged motif, a metal and stones whose colours sit in the theme palette, and products for the spot, confirmed with one tap. Standard and Challenging open blank with Osei's motif tip only.
- **Checklist:** "Ready for Lantern Night" against the theme and spot, as guidance only; "Line cost so far"; and "About N h of bench work · M working hours left before Lantern Night", shown amber when N > M. While line sheets hold parts it adds "Line sheets are cleared after Lantern Night."

### 10.4 Mini-game twists (the existing games, used in fresh ways)

| Twist                   | Reuses                              | What is new                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gem Market**          | Stone tray, `StoneArt`, loupe, drag | Kemi's 4 × 4 velvet tray of 16 seeded stones (`gemTray`), only of the board's hero and accent types (never decoys). Each has a **tint** (pale, true, deep) and 1–3 **Shimmer** ◇; price = stone price × 1 / 1.4 / 1.8 by shimmer, rounded. Drag (or tap then tap, or arrows and Enter) the stones the line needs into the **Line Pot**; a budget meter blocks going over the stone budget (seats on the board × 8 / 9 / 10 / 11 by spot), and the market can't be left until the pot covers every seat ("One more stone for the line!"). Press and hold (or Space) to see a stone large in the loupe, which names its tint in a word and a pattern (pale ○, true ◐, deep ●) and its shimmer on every difficulty. A Settings toggle **Tint labels** (on at the start on Relaxed) shows them on the tray, with no cap. The seeded tray always holds enough stones of one tint at 1 shimmer for every seat, within budget. 1 h, once a season, after the board is confirmed. |
| **Line sheet**          | Plan your sheet (§3.1)              | Collection pieces may plan onto a **line sheet**: a wide sheet of the line's metal kept in `collection.lineSheets`. Parts cut by earlier pieces stay on it as holes, so each new piece is planned around the gaps. The wide sheet leaves stock with the first cut on it. **Sheet use** = the line's part area ÷ the area of every sheet or strip its runs consumed, a line sheet counting once (engine `polygonArea`), so a line with no line sheet is measured against its own stock. Show me fills the gaps first, then opens a new sheet. Line sheets are cleared after the Launch.                                                                                                                                                                                                                                                                                                                                                                                    |
| **Motif master**        | Cut out (§3.2)                      | The season's first cut motif part is the **motif master**: its accuracy chip and a faint gold outline show on every later motif cut as guidance (UI only; scoring unchanged). **Every motif crisp** = `clamp(100 − 250 × max(0, 0.90 − weakest motif-part cut accuracy), 0, 100)`; an assisted motif cut counts 0.8 (→ 75).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Twin Lamp**           | Join (§3.3), `joiningLamp`          | For pair products (clip-pair, drop-pair, stone-drops, friendship-halves) the Join stage offers **Join both**: one Warm button, one warmth bar, two gold zones starting at 0.70 and 0.76, so they overlap by `width − 0.06` (Standard 0.09, Relaxed 0.135, Challenging 0.0675). The twin records share one tick counter that starts at the first tick inside either zone (equal `ticks`, both `twin: true`); each seam's inside and over counts use its own zone, and each is scored by `joinAccuracy` as usual. **Twin glow:** both seams finish within 90 ticks of each other, and the pair's Join stage then costs **0 h** ("Two seams, one glow: an hour saved!"). No glow means two ordinary joins, with no penalty. Optional, on every pair run in the collection career.                                                                                                                                                                                            |
| **Pot pick**            | Set the stone (§3.4)                | Collection seats take stones only from the Line Pot: tap the stone to set (its tint shows in word and pattern); pairs take two of one type. Seat, claws and scoring are unchanged. **Stone match** = share of the line's set stones whose tint is the most common tint of their type. After the Launch, unused pot stones return to stock as plain stones.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Even shine**          | Polish (§3.5)                       | A shine bar on the Polish stage shows every finished piece's polish score side by side; the Lookbook glint grows with polish (art only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **One finish, a motif** | Display (§3.6), `PlacedLayer`       | The finish is the line's and can't change. The new **Motif Charm** (2 coins) stores its shape: in a collection it is the line's motif, and on a bench order it takes the piece's own shape, or the circle when the piece has none. On a collection bangle, hair slide or bracelet it makes the piece carry the motif.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Lookbook**            | `PlacedLayer`, `seatFit` angle term | A photo card per finished piece (2 h for the whole book, before the Launch). Pick a **backdrop** card (4), drag up to 3 **props** (8) with the charm pose rules; a prop may not overlap the piece (`polygonsOverlap`). Then **light** it: drag the little lamp round a ring (or ← / → in 5° steps) and press the 56 px **Snap**. `light = clamp(1 − (Δ ÷ band)², 0, 1)`, Δ the angle to a seeded sweet spot, `band = 30° × trait (Perfectionist 1.2) × Light Box 1.2 × difficulty`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

- **Lookbook details:** the glint swells as Δ shrinks, so an 8-year-old finds the sparkle by watching it and a 15-year-old chases the exact centre on a narrow Challenging band. Re-snapping is allowed until the book is closed. **"Use this styling for every page"** copies the backdrop and props (re-posed to fit each piece) to the other pages, so only the lamp is left; on Relaxed each page opens on "Osei suggests…" for backdrop and props. **Osei's lamp** (Assist) snaps to the sweet spot and caps the page at 0.8. Reduced motion shows the glint as a meter. A page stores `{backdrop, props (poses), lampAngle, light, assisted}`; the album redraws pages from the save and never stores a picture.
- **Fun at 8 and at 15:** at 8, choosing shiny stones, pulsing one lamp for two earrings and arranging shells around a pendant. At 15, matching tints on a tight budget, packing five pieces round the holes of one wide sheet, holding the twin glow in a thin overlap and pricing the Pop-up against the hearts each piece draws.

### 10.5 The Lantern Night Launch (the event moment, like ADEEVA's runway)

1. **Launch Board** (like ADEEVA's `CollectionBoard`): the theme card (2 tags, a 4-colour palette, 3 mood words), every collection piece, the Lookbook pages and a "missing page" note for any unphotographed piece. A piece still on the bench shows "Joins next season's line" (§10.2). It opens on the collection ready to go.
2. **Planner** (`stageLaunch {plan}`, one action; `useRovingRadio` groups): the **reveal order** ("Save your favourite for last"), a **lantern colour** (amber "warm", rose "sweet", moon-white "soft", teal "cool"), **music** from the engine's `MUSIC_MOODS` (dreamy-strings "dreamy", beach-pop "sunny", synth-pulse "bright", classic-jazz "cosy") and a **story card** (3 lines written for the theme, one of which fits it best). On Relaxed it opens on "Osei suggests…" (the theme's best lantern, music and card, the best piece last), confirmed with one tap. On Standard and Challenging the player matches the lantern and the music to the theme's mood words, reads the cards and chooses the order.
3. **The reveal** (Lantern Night; day 14 is late): dusk under the arcade's glass roof, lantern strings brighten row by row over a little wooden stage. Each piece rises on Mr. Osei's **music-box plinth**, which winds up while notes float up with `MusicChip` (no audio); the player opens the lid with a tap, Enter or Space, or it opens by itself after 3 s. As each lid opens, that piece's Lookbook page is projected behind the stage as a **magic-lantern slide** (its backdrop and props; a plain slide in the lantern colour for a missing page), a beam in the lantern colour sweeps across and the piece glints, the glint's size following the page's light, with a caption ("Moon Drops · crescent motif"). After the last reveal a **thread of light** runs piece to piece, its brightness the Harmony Circle score; paper stars drift down (`PetalFall`, whose `FallShape` gains `star`), and visitors (studio `Avatar`) clap and lift paper lanterns that glow electric. **Finale:** this theme's paper lantern on the Lantern Garland lights in the award colour (cream, rose, silver, gold, moon-white), then four panel cards flip up and count. Total ≈ 30 s; **Skip** (or Escape) once a reveal has played. Reduced motion shows every beat, the slides, thread and garland lantern included, as stills with captions and the same taps.
4. **Panels** (each 0–100 through the engine's `panel()` and `subScore`; every member is an adult neighbour; no one is called a judge):

| panel (members)                                                                                                                    | parts (weight)                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Craft Table** (Mr. Osei; Bea Okafor of the Bead Barn; Tomasz Pike, the arcade's clock keeper)                                    | Craft 0.5 = mean piece quality · Clean cuts 0.15 = mean cut accuracy × 100 · Joins 0.15 = mean join accuracy × 100 · Sheet use 0.1 = `clamp(200 × sheet use, 0, 100)` · Fine metal 0.1 = 60 / 80 / 100 for 1 / 2 / 3 sparkle                                                                                                          |
| **Harmony Circle** (Rosa Delgado, who paints the arcade signs; Ottilie Marsh, window dresser at the draper's)                      | Motif 0.35 = share of pieces carrying the motif · Every motif crisp 0.2 (§10.4) · Stones 0.25 = Stone match · Palette 0.2 = engine `paletteCohesion` of the pieces' colours. With no stones, Palette weighs 0.45                                                                                                                      |
| **Sparkle Lanterns** (June Hale, who looks after the arcade's lanterns; Felix Amari of the kaleidoscope stall)                     | Shine 0.35 = mean polish score × 100 · Shimmer 0.25 = 50 / 75 / 100 for mean shimmer 1 / 2 / 3 (no stones: finish sparkle, High Shine 100, Starlit 100, Glaze 80, others 70) · Lookbook light 0.25 = mean page light × 100 (missing page 0) · Lantern 0.15 = 100 for the theme's lantern colour, else 40                              |
| **Story Corner** (three past clients' grown-ups drawn each season; a family appears as the adult's card, "Mr. Tanabe, Kiko's dad") | Theme 0.35 = share of pieces with a theme tag **and** a theme palette colour (Market Day's `fitsTheme`) · Styling 0.2 = mean page score (backdrop matches the theme's mood word 50 + 50 × share of props with a theme tag) · Staging 0.25 = engine `stagingScore(best music, best story card)` · Reveal 0.2 = engine `closerStrength` |

5. **Overall** = engine `overallScore` (mean of the 4 panels) − `lateShowPenalty`. **Awards** come from fixed bands, never placings: Lantern Ribbon (< 55, "The arcade cheered every piece!"), Ribbon of Merit (55–69), Silver Lantern (70–84), Gold Lantern (85–94), Moonlit Lantern (95+). Verdict words from the engine's `panelVerdict`.
6. **Rewards (`launchPrize`):** coins `25 + 15 × spot + 4 × max(0, overall − 50)`; reputation from the engine's `showReputation` with `GENTLE_SHOW_SETBACKS` (below 50: 0, or −1 on Challenging); buzz `round(overall ÷ 10)`. **Launch Notes** give one praise line per panel from its best part (`bestSubScore`) and one "Next time, try…" tip from `weakestTip` on the weakest part. The award goes to `launch.awardsBySeason[seasonNumber]` and, if better, `launch.garland[themeId]`. Every piece enters the Keepsake Case with source `{kind: "collection", themeId, award}`.
7. **Spots (progression):** the next spot opens when overall ≥ **70** (Silver Lantern; ≥ 75 on Challenging). On Relaxed it moves up only when the player taps **"Move to a bigger spot?"** on the results, offered at overall ≥ 55. There is no step back.

| spot | name                | pieces | Ready for Lantern Night (Std; +6 Challenging) | stone budget per seat | extra                |
| ---- | ------------------- | ------ | --------------------------------------------- | --------------------- | -------------------- |
| 1    | Lantern Corner      | 3      | 72                                            | 8                     | —                    |
| 2    | Fountain Steps      | 3–4    | 74                                            | 9                     | —                    |
| 3    | Arcade Stage        | 4–5    | 76                                            | 10                    | `jb-spot-stage`      |
| 4    | Grand Lantern Stage | 5      | 78                                            | 11                    | Lantern Garland goal |

"Ready for Lantern Night" is a checklist mark only; the spot card says "Ready or not, the lanterns are lit for you."

### 10.6 The Pop-up Window (price and arrange the line)

On Pop-up Day (season day 14, 3 h, after the Launch) an empty shopfront at the arcade gate becomes your window for a day.

- **Arrange:** the launched pieces sit on their stands automatically (one row of velvet stands). The player picks the **window-plinth** piece by drag, tap then tap, or arrows and Enter. A **Little shelf** holds up to 2 stall-box or Line Drawer pieces, which sell by Market Day's `salePrice(piece, overall)` when the Launch overall is ≥ 35 (always on Relaxed).
- **Hearts:** `H = max(n, n + 2 + round((overall − 60) ÷ 10))` for n pieces, +1 with Velvet Window Stands. **Every piece gets 1 heart**; the remaining H − n are shared by appeal (`quality + 20 × theme fit + 20 × page light`) with the largest-remainder rule (ties go to the earlier reveal slot); the plinth adds +1 to its own piece. A strong, well-lit, on-theme piece draws more, and moving the plinth updates the counts at once.
- **Price:** each piece takes a tag: **Gentle** (× 0.8, needs 1 ♥), **Fair** (× 1.0, 2 ♥) or **Special** (× 1.3, 3 ♥). Fair price = `round(lineBase × (0.6 + 0.6 × quality ÷ 100) × (1 + 0.15 × (sparkle − 1)) × harmony × award)`; harmony = 1.1 when the Harmony Circle scored ≥ 80, award = 1.1 for Silver Lantern or better. The pricing board shows each piece's exact ♥ count and a live **"sells"** or **"waits in the drawer"** mark under its tag. The price breakdown labels the metal term **"Sparkle bonus"**. On Relaxed the tags open on "Osei suggests…" (the dearest tag each piece's hearts reach). Since every piece holds at least 1 heart, a line priced all Gentle always sells out.
- **Visitors:** silhouettes stroll past the window and drop the board's heart tokens into little velvet pots (≈ 15 s, **Skip**; reduced motion shows the counts).
- **Sales:** a piece sells when its hearts reach its tag's need. On Relaxed a piece short of hearts sells at Gentle anyway ("A visitor came back for it!"). Trait lines apply as on Market Day (the private `traitLines` moves to `core/saleTraitLines.ts` and both use it). Buzz +1 per piece sold; no reputation.
- **Copy requests:** hearts not needed by sold pieces, plus hearts on unsold ones, are counted; every 2 become one **copy request** (at most 2), pinned the next day as an order from a Pop-up visitor (§10.8) for the most-loved piece (most hearts, then the earlier slot): same product, motif and metal, the theme's first tag, the piece's colours as favourites, fee = `round(1.2 × the piece's Fair price)`, budget = its spend + 10, 5–7 days, minimum quality 70 (+6 Challenging). Its design is pre-filled and takes **0 h**, as a collection run's does. So pricing Gentle trades coins today for a well-paid order tomorrow.
- Unsold pieces go to the Line Drawer. The Pop-up result card shows the sold tags, the coin tally and any copy requests.

### 10.7 Launch themes and the Lantern Garland

On season day 1 the theme card offers the season's 2 themes (ADEEVA's `NextSeasonPicker` pattern) and Rest the line; Trendsetter sees next season's pair early. A theme's three mood words name its best music, lantern and backdrop. Every palette colour comes from a metal tone, glaze, cord, ribbon, stone, charm or the Shadowed charcoal.

| id              | season | name            | tags             | palette                       | best music (word)       | best lantern | best backdrop |
| --------------- | ------ | --------------- | ---------------- | ----------------------------- | ----------------------- | ------------ | ------------- |
| first-blossom   | Spring | First Blossom   | nature, dainty   | blush, sage, ivory, rose-gold | beach-pop (sunny)       | rose         | linen         |
| kite-meadow     | Spring | Kite Meadow     | playful, bold    | sky, coral, mustard, copper   | synth-pulse (bright)    | amber        | linen         |
| rock-pools      | Summer | Rock Pools      | nature, playful  | teal, sky, sage, silver       | beach-pop (sunny)       | teal         | slate         |
| midsummer-stars | Summer | Midsummer Stars | sparkly, dreamy  | navy, gold, lavender, ivory   | dreamy-strings (dreamy) | moon-white   | moon-paper    |
| apple-harvest   | Autumn | Apple Harvest   | classic, nature  | ruby, mustard, bronze, sage   | classic-jazz (cosy)     | amber        | linen         |
| clocktower      | Autumn | Clocktower      | classic, bold    | charcoal, gold, navy, bronze  | synth-pulse (bright)    | moon-white   | slate         |
| first-frost     | Winter | First Frost     | elegant, dainty  | ivory, sky, silver, lavender  | dreamy-strings (dreamy) | teal         | teal-velvet   |
| winter-lanterns | Winter | Winter Lanterns | sparkly, elegant | plum, gold, navy, ruby        | classic-jazz (cosy)     | rose         | teal-velvet   |

The slice Market Day theme `lantern-night` keeps its id but is shown as "Lantern Glow Market", so it never reads as the Launch. Backdrop words: teal-velvet "deep", linen "fresh", slate "strong", moon-paper "magic". Each theme's 3 story cards live in `content/launchTheme.ts` (e.g. First Blossom: "Made for the first warm morning." ✓ · "Bold as a brass band." · "Cosy as a winter scarf.").

**Lantern Garland:** a string of 8 paper lanterns across the loft window, one per theme, each lit to the best award won there. The finale beat `jb-lantern-garland` plays once each of the 4 seasons has a Silver Lantern or better and a Gold has been won (at least 4 seasons; about 4–6 for a decent player). Gold or better on all 8 plays `jb-every-lantern-gold`. Play continues afterwards.

### 10.8 Content, about twice the slice

| kind         | slice | added | total | added ids                                                                                                                                     |
| ------------ | ----- | ----- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| metals       | 6     | 4     | 10    | pewter, steel, white-gold, green-gold                                                                                                         |
| stones       | 8     | 8     | 16    | rose-quartz, turquoise, lapis, sunstone, tiger-eye, topaz, rose-garnet, plum-glass                                                            |
| products     | 7     | 7     | 14    | motif-ring, stone-drops, bangle, coat-badge, bag-charm, friendship-halves, hair-slide                                                         |
| part options | 12    | 8     | 20    | shell, flower, wave, lantern (shapes); twist-band, beaded-band; moon-window, heart-window                                                     |
| finishes     | 4     | 3     | 7     | frosted, two-tone, starlit                                                                                                                    |
| extras       | 6     | 6     | 12    | motif-charm, moon-charm, shell-charm, bag-clip, beaded-cord, velvet-ribbon                                                                    |
| clients      | 8     | 8     | 16    | ms-adaeze, asha-and-meera, captain-rui, coach-imani, nana-ife, mr-abebe (Charmer), zara (Trendsetter), dr-sorensen                            |
| upgrades     | 4     | 4     | 8     | sorting-tray, twin-lamp-stand, light-box, window-stands                                                                                       |
| decor        | 3     | 3     | 6     | music-box-shelf (60), paper-moon (electric lamp, 50), patchwork-rug (one of the 4 cloth colours, 90)                                          |
| story beats  | 8     | 21    | 29    | table below                                                                                                                                   |
| new kinds    | —     | 74    | 74    | 2 careers, 8 launch themes, 24 story cards, 4 spots, 4 lanterns, 4 backdrops, 8 props, 3 price tags, 3 tints, 8 line names, 6 Pop-up visitors |

**Metals** (§4.1 columns: price, hardness, hammers, warmRate, tone, sparkle, tags, unlock rep): pewter 4, 0.15, 1, 0.30, pewter `#9aa0a6`, 1, classic/nature, 14 · steel 10, 0.45, 3, 0.48, steel `#7d8894`, 2, bold/classic, 20 · white-gold 22, 0.30, 2, 0.42, white-gold `#e6e2d6`, 3, elegant/dainty, 34 · green-gold 20, 0.30, 2, 0.40, green-gold `#b8b25a`, 3, nature/elegant, 38. The 4 tones join `JewelColour`. Steel's `hard` factor is 0.55, so its cut tolerance sits on the 8 px floor; slow pewter is the gentlest lamp.

**Stones** (§4.2 columns: price, colour, cut, tags, unlock rep): rose-quartz 5, blush, round, dainty/dreamy, 14 · turquoise 5, teal, round, nature/playful, 14 · lapis 6, navy, oval, classic/dreamy, 16 · sunstone 6, coral, teardrop, bold/sparkly, 18 · tiger-eye 5, gold, square, bold/nature, 20 · topaz 7, sky, teardrop, elegant/sparkly, 24 · rose-garnet 7, rose, oval, elegant/dreamy, 26 · plum-glass 4, plum, square, dreamy/bold, 14. Tints and shimmer are art, Harmony and Sparkle only. Supply Cabinet stones and returned pot stones are plain (`stoneTint: null`, drawn true).

**Products** (parts mm, W × H; `lineBase` of slice products: stack-ring 34, stone-ring 52, shape-pendant 44, stone-pendant 56, clip-pair 52, drop-pair 46, charm-bracelet 50)

| id                | name              | kind     | parts                                   | slots         | joints         | stones | needs             | stock         | copper cost  | tags    | lineBase | stallBase |
| ----------------- | ----------------- | -------- | --------------------------------------- | ------------- | -------------- | ------ | ----------------- | ------------- | ------------ | ------- | -------- | --------- |
| motif-ring        | Motif Ring        | ring     | band 56×3, top 12×12                    | band, shape   | ring seam, top | 0      | —                 | strip + sheet | 7            | classic | 42       | 26        |
| stone-drops       | Stone Drops       | earrings | 2 × drop 12×24 (mirrored), 2 seats 6×6  | shape         | clip loop ×2   | 2      | clips (2)         | sheet         | 6 + stones   | elegant | 58       | 34        |
| bangle            | Bangle            | bracelet | band 80×5                               | band, accent  | ring seam ×1   | 0      | —                 | strip         | 3            | bold    | 40       | 26 ✓      |
| coat-badge        | Coat Badge        | badge    | plate 30×30, clip bar 24×4              | shape, accent | bar ×1         | 0      | clip back (2)     | sheet         | 6            | playful | 40       | 26        |
| bag-charm         | Bag Charm         | charm    | plate 26×26, loop 10×4                  | shape         | loop ×1        | 0      | bag-clip          | sheet         | 7            | playful | 38       | 26 ✓      |
| friendship-halves | Friendship Halves | pendant  | 2 × half 14×26 (mirrored), 2 loops 10×4 | shape         | loop ×2        | 0      | 2 chains or cords | sheet         | 4 + 2 chains | playful | 48       | 30        |
| hair-slide        | Hair Slide        | slide    | plate 36×10                             | band, accent  | clip ×1        | 0      | clips (2)         | strip         | 5            | dainty  | 36       | 24        |

`ProductDef.kind` widens with badge, charm and slide. `ProductDef.stallBase` stays required on every product, and Line Drawer and Little-shelf pieces sell by it; ✓ marks the products that can be made as stall pieces (bangle and bag charm join `STALL_PRODUCT_IDS`). A friendship half is the motif cut down its middle, so the split ends carry corner dots. Bangles, bag charms, coat badges and hair slides take charms at Display.

**Part options:** `shell` Shell (nature, dainty; 3 shallow scallops, 1 corner dot) · `flower` Five Petals (nature, playful; 5 curves, 5 inner corner dots) · `wave` Wave (bold, nature; S-curve, 2 corner dots) · `lantern` Little Lantern (dreamy, classic; rounded body with a top tab, 4 corner dots) · `twist-band` Twist Band (bold, playful; wavy long edges with offset crests) · `beaded-band` Beaded Edge (dainty; dotted art on a straight strip) · `moon-window` Moon Window (dreamy; small closed crescent) · `heart-window` Heart Window (playful; small closed heart). Every option reshapes inside its part's rectangle, so no part list, joint list or canonical layout changes.

**Finishes:** `frosted` Frosted 3 (dainty; metal tone, pale matte) · `two-tone` Two-Tone 5 (bold; metal tone with a gold rim) · `starlit` Starlit 4 (sparkly; fine sparkle dots drawn on the metal).

**Extras:** `motif-charm` Motif Charm 2 (the tags of its stored shape; metal tone; §10.4) · `moon-charm` Tiny Moon Charm 2 (dreamy; ivory) · `shell-charm` Tiny Shell Charm 2 (nature; blush) · `bag-clip` Bag Clip 3 (playful; charcoal; bag charm only) · `beaded-cord` Beaded Cord 4 (playful; one of the 8 glaze colours) · `velvet-ribbon` Velvet Ribbon 3 (elegant; one of the 8 glaze colours; a chain or cord alternative).

**Clients** (rolled as §4.5; open in both careers; each lowest budget roll covers the cheapest valid build with 6–10 coins to spare; the cheapest builds cost Adaeze 7, Asha and Meera 10, Rui 4, Imani 10, Ifẹ 16, Abebe 9, Zara 6, Sørensen 22. New clients enter the draw pool only at reputation ≥ 14 through `freeClients`, so early seeded draws do not move.)

| id             | who                                               | gate / min rep   | product           | required tags    | favoured               | avoid                 | required extras | budget | fee     | days | min Q |
| -------------- | ------------------------------------------------- | ---------------- | ----------------- | ---------------- | ---------------------- | --------------------- | --------------- | ------ | ------- | ---- | ----- |
| ms-adaeze      | Ms. Adaeze, who runs the arcade bookshop          | — / 14           | coat-badge        | classic          | navy, ivory, gold      | coral                 | —               | 15–25  | 55–70   | 4–6  | 70    |
| asha-and-meera | Asha and Meera, best friends, with Asha's grandad | — / 16           | friendship-halves | playful          | coral, sky, lavender   | charcoal              | —               | 18–28  | 60–75   | 4–6  | 70    |
| captain-rui    | Captain Rui, who runs the harbour ferry           | — / 18           | bangle            | bold             | navy, teal, silver     | blush                 | —               | 12–22  | 60–75   | 4–6  | 72    |
| coach-imani    | Coach Imani of the junior swim club               | — / 22           | bag-charm         | playful          | teal, sky, coral       | —                     | star-charm ×1   | 18–28  | 70–85   | 4–6  | 74    |
| nana-ife       | Nana Ifẹ, who grows sunflowers                    | — / 24           | stone-drops       | nature           | mustard, emerald, gold | black                 | —               | 26–40  | 80–100  | 5–7  | 74    |
| mr-abebe       | Mr. Abebe, who plays accordion by the fountain    | Charmer / 16     | motif-ring        | classic, playful | ruby, mustard, gold    | —                     | —               | 18–30  | 85–105  | 4–6  | 74    |
| zara           | Zara, who draws the arcade's comic strip          | Trendsetter / 18 | hair-slide        | bold, sparkly    | plum, coral, gold      | —                     | —               | 12–24  | 90–110  | 4–6  | 76    |
| dr-sorensen    | Dr. Sørensen, the town astronomer                 | — / 32           | stone-pendant     | dreamy, elegant  | navy, silver, sky      | metals: copper, brass | —               | 30–44  | 110–130 | 5–7  | 80    |

| client         | request                                                  | delighted                                          |
| -------------- | -------------------------------------------------------- | -------------------------------------------------- |
| ms-adaeze      | A badge for my reading coat. Something classic, please.  | It looks like it came from a story. Wonderful.     |
| asha-and-meera | One necklace in two halves. One for each of us!          | They click together! Best friends forever.         |
| captain-rui    | A strong bangle for a ferry captain, please.             | Sturdy as my boat. Thank you, crew-mate.           |
| coach-imani    | Our club needs a team charm for the kit bag.             | The whole team cheered when they saw it!           |
| nana-ife       | Earrings that feel like my sunflowers. Bright and green. | They glow like my garden at noon. Thank you, dear. |
| mr-abebe       | A ring for playing tunes. Cheerful, like a polka!        | It makes my fingers want to dance. Bravo!          |
| zara           | Make me something bold and sparkly for my comic launch.  | It's going in my next comic strip!                 |
| dr-sorensen    | A pendant like the night sky. Exact and elegant, please. | Like holding a little star chart. Splendid.        |

Near-miss lines follow §4.5's tone in content. Delivery scenes reuse the 4 backdrops: Kitchen table (Asha and Meera, Nana Ifẹ), Shop counter (Ms. Adaeze, Coach Imani, Zara, Captain Rui), Concert hall foyer (Mr. Abebe), Night garden (Dr. Sørensen). Asha and Meera's grandad pays and collects. **Pop-up visitors:** 6 named adult or family entries (`content/popupVisitor.ts`, e.g. "Mrs. Lune and her son Theo"), `ClientDef`-shaped (lines and delivery scene) and resolved by `clientById`, but never in `freeClients` or the offer roll; they only carry copy requests (§10.6), with one shared set of warm lines.

**Upgrades** (collection career only, gated by Launch progress, since every collection player is past reputation 45 or started at 30; 630 coins in all)

| id              | name                 | price | opens  | effect                                                        |
| --------------- | -------------------- | ----- | ------ | ------------------------------------------------------------- |
| sorting-tray    | Stone Sorting Tray   | 140   | spot 1 | the tray sorts by type and tint; 2-shimmer stones cost 1 less |
| twin-lamp-stand | Twin Lamp Stand      | 150   | spot 1 | both Twin Lamp zones ×1.15                                    |
| light-box       | Lookbook Light Box   | 160   | spot 2 | Lookbook light band ×1.2                                      |
| window-stands   | Velvet Window Stands | 180   | spot 3 | +1 heart shared by appeal at every Pop-up                     |

**Line names** (picked at `openLoft` or a collection start, changeable at a season start): Little Lantern, Moon & Thimble, Brass Sparrow, Sea Pebble, Velvet Comet, Glimmer Lane, Wild Clover, Starling Row. **Props:** sea-shell (nature, dainty), pressed-flower (nature, dainty), teacup (classic, elegant), storybook (dreamy, classic), ribbon-spool (playful, elegant), river-pebble (nature, bold), paper-star (sparkly, dreamy), glass-marble (sparkly, playful).

**Story beats** (player lines voiced by trait as §4.8)

| id                    | trigger                             | lines (short)                                                                                                                 |
| --------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| jb-loft-offer         | loft-offer                          | **Osei:** "The loft upstairs is empty. Room for a whole collection of your own." / choice: Launch my own collection · Not yet |
| jb-intro-loft         | intro-loft                          | **Osei:** "Bench downstairs, loft upstairs. Both yours." / **You:** (byTrait)                                                 |
| jb-loft-open          | loft-opened                         | **Narrator:** Dust sheets off; the round window glows over the arcade. / **You:** (byTrait)                                   |
| jb-first-board        | first Collection Board              | **Osei:** "A collection is one idea, told a few times. Same motif, same metal."                                               |
| jb-kemi-hello         | first Gem Market                    | **Auntie Kemi:** "Welcome to Pebble & Prism! Hold them to the light. Pale, true or deep?"                                     |
| jb-first-line-sheet   | first piece planned on a line sheet | **Osei:** "Plan around the gaps. A tidy sheet is a happy sheet."                                                              |
| jb-first-twin         | first twin glow                     | **Narrator:** Two little glows rise together. / **You:** (byTrait)                                                            |
| jb-first-lookbook     | first Lookbook closed               | **Osei:** "Good light tells the story before anyone reads the card."                                                          |
| jb-launch-invite      | first collection season             | **June Hale:** "Lantern Night is ours! Every maker gets a lantern ribbon."                                                    |
| jb-first-launch       | first Launch done                   | **Narrator:** The plinth lid opens and the whole arcade claps. / **You:** (byTrait)                                           |
| jb-first-popup        | first Pop-up                        | **Osei:** "Your own window. I always hoped someone would light it up."                                                        |
| jb-copy-request       | first copy request                  | **Mrs. Lune:** "Could you make one more like the one in your window?"                                                         |
| jb-gold-lantern       | first Gold Lantern or better        | **Bea Okafor:** "I've sorted beads forty years. That line is something special."                                              |
| jb-spot-stage         | spot 3 reached                      | **June:** "The Arcade Stage! The lanterns hang lowest there, just for you."                                                   |
| jb-spot-grand         | spot 4 reached                      | **Osei:** "The Grand Lantern Stage. My music boxes played here, long ago."                                                    |
| jb-launch-skipped     | Launch skipped                      | **June:** "We kept your plinth warm. See you next Lantern Night!"                                                             |
| jb-tight-season       | loft grace used (Standard)          | **Osei:** "Lean fortnight? I'll cover some of the rent this once."                                                            |
| jb-lantern-garland    | Silver+ in all 4 seasons, a Gold    | **Narrator:** Every lantern on the garland glows. / **Osei:** "Proudest loft in Thimble Lane."                                |
| jb-every-lantern-gold | Gold or better on all 8 lanterns    | **Osei:** "Gold on every lantern. I'm winding up every music box I own."                                                      |
| jb-trait-abebe        | Mr. Abebe first pins an offer       | **Mr. Abebe:** "They say you're the friendliest jeweller in the arcade. Make me a ring that sings!"                           |
| jb-trait-zara         | Zara first pins an offer            | **Zara:** "My comic needs the boldest piece in the arcade. Ready?"                                                            |

The two trait beats follow §4.8's rule: each plays for its own trait only, when that client first pins an offer.

**Hint lines (≤ 12 words):** "Pick stones with the same tint for a matched line." · "Plan around the gaps on your line sheet." · "Cut it like your motif master." · "Keep the glow where both gold zones meet." · "Slide the lamp until it sparkles, then snap." · "Props can't cover the piece." · "Pick your favourite piece for the window plinth." · "Special tags need more hearts. Gentle tags sell easily." · "Finish every piece before Lantern Night."

### 10.9 Economy sanity checks (Standard unless noted)

- **Market Day at depth:** a stall sale pays `salePrice × (1 + clamp(reputation − 20, 0, 40) ÷ 40)`: × 1 below reputation 20, so every slice test stands, and × 1.625 at reputation 45, so a 3-piece tray earns ≈ +125 for its 18 h (stall pieces included).
- **Bench baseline at reputation 45+:** open clients average a fee of ≈ 80. A pass pays ≈ 1.18 × fee plus fine metal ≈ 100 for ≈ 20 of materials (net ≈ +80); a soft fail ≈ 32 − 20 = +12. At 85% that is ≈ +70 an order, about 7 h each with supply visits (≈ 10 an hour). With the Comfy Stool a fortnight is 154 h. The best bench fortnight skips Market Day: 22 orders × 70 − rent 180 ≈ **+1360**; with two Market Days (≈ 17 orders) it is ≈ +1250.
- **Collection season (decent, spot 2, 4 pieces in silver: stone pendant, motif ring, stone drops, charm bracelet; garnet; one line sheet):** line work ≈ 31 h (board 1, Gem Market 1, pieces ≈ 20, Lookbook 2, Lantern Night ≈ 4, Pop-up 3). Every part fits one silver wide sheet (≈ 2000 mm² of bounding boxes on 3200). Stone budget 3 seats × 9 = 27. Costs ≈ wide sheet 22 + 3 two-shimmer garnets 24 + 2 chains and clips 10 ≈ **56**. Launch (overall ≈ 83): 25 + 30 + 132 = **187**. Pop-up: Fair prices 80 / 60 / 83 / 71; H = 4 + 2 + 2 = 8, so each piece holds 1 heart plus 1 by appeal, and the plinth piece 3; Special on the plinth piece and Fair on the rest sells all four for **319**. Line net ≈ +450 for 31 h (≈ 14.5 an hour). Orders in the other 123 h ≈ +1230; rent −260. **≈ +1420 ≈ 1.04 × bench**; with the week-1 Market Day (+125 for 18 h) ≈ +1365.
- **Pricing trade:** all Fair earns 294 and leaves 1 spare heart. Special on the 3-heart plinth piece and Fair on the rest earns 319. Gentle on that piece instead earns 42 less today but frees 2 hearts, one copy request at round(1.2 × 83) = 100, worth ≈ +35 after its materials and bench hours: roughly even. All Gentle earns 235 and brings 2 copy requests. All Special sells only the plinth piece (108) and the other three wait in the drawer. The board shows every count, so reading the hearts is the skill, no single tag wins every time, and a wrong tag only sends a piece to the drawer, never into a loss.
- **Collection-max bot** (spot 4, 5 pieces in gold with 3-shimmer stones, quality 94, Harmony ≥ 80, every upgrade, the best tags every time): Fair ≈ 95 each; H = 5 + 2 + round(3.6) + 1 (Window Stands) = 12, plus the plinth's 1 = 13 hearts, so 2–3 Special and the rest Fair ≈ 532–570; costs ≈ 2 gold wide sheets 86 + stones 70 + extras 15 = 171; Launch at overall 96: 25 + 60 + 184 = 269; line net ≈ +668 for ≈ 37 h; orders in the other 117 h at its own pace ≈ +1203; rent −260: ≈ **+1611** against its own best bench fortnight of ≈ +1404 (**1.15 ×**). The simulation must keep it ≤ 1.3 ×; if it lands above, D6 lowers the dearest `lineBase` values 4 at a time.
- **Decent panels** (quality 88, cuts 0.88, joins 0.90, silver, sheet use 0.45, motif on 3 of 4 pieces, weakest motif cut 0.82, 2 of 3 stones one tint, cohesion 0.6, polish 0.95, mean shimmer 2, page light 0.8, lantern, music and card matched, best piece last, 3 of 4 pieces on theme, 2 of 3 props on theme): Craft ≈ 44 + 13 + 14 + 9 + 8 = 88; Harmony ≈ 26 + 16 + 17 + 12 = 71; Sparkle ≈ 33 + 19 + 20 + 15 = 87; Story ≈ 26 + 17 + 25 + 18 = 86. **Overall ≈ 83: Silver Lantern**, and the spot advances.
- **Other players:** Standard with every Assist and the player's own sensible choices ≈ 80 (Silver, advances). Relaxed with every Assist and "Osei suggests" everywhere ≈ 85 (Gold): generous for an 8-year-old. A careless line (off theme, separate sheets, half the pieces without the motif, no Lookbook, wrong music and card) ≈ 55 (Merit, stays). Mastery (quality 94, gold, motif everywhere, 3 shimmer in one tint, light 0.95, all matched) ≈ 96 (Moonlit Lantern).
- **Pass rate target 75–90%:** decent quality is ≈ 88 ± 4.5. By minimum quality a decent piece passes ≈ 99% up to 76, 96% at 80 and ≈ 81% at Mr. Farouk's 84; tag, extra or deadline slips cost ≈ 8%. Over the 16-client pool that is **≈ 86–89%**. Copy requests (minimum 70) pass ≈ 91%. Minimums are read from `content/client.ts`, never from this doc; if the simulation lands outside 75–90%, the minimum quality of the 4 highest new clients moves ±2 at a time.
- **No bankruptcy spiral:** weekly costs are rent 130 and 6 shifts pay 270. A week of all soft fails (7 × 12 = 84) loses ≈ 46, but shifts and **Rest the line** (rent 90) turn it round: 3 shifts (135) + 4 soft fails (48) − 90 = +93. Every Pop-up piece holds at least 1 heart, so a line priced Gentle always sells out, and at quality 60 in copper a Gentle piece still earns several times its materials. **Loft grace** (Standard, once a season, the engine's `seasonGrace`): if coins after rent would go below 0, Osei covers `GRACE_COINS` (60) and `jb-tight-season` plays. Unsold pieces wait in the drawer.
- **Relaxed is always recoverable:** rent is × 0, every order passes, every Pop-up piece sells, the shift pays 45 and every Launch pays at least 40 coins and a ribbon. Coins never fall at a week's end.
- **Challenging:** rent 195, minimums +6, a fail pays 0 and costs −3 reputation, spots need 75. 6 shifts (270) cover the rent, and A Quiet Week (§4.8) points there. A decent player passes ≈ 75–80%.
- **Unlock pacing:** decent Standard (88%) on days 19–20; ≈ 70% pass on days 26–28; Relaxed ≈ days 16–17; Challenging ≈ days 29–34 (§10.1). All sit inside the simulation band.

### 10.10 Save migration (schema 1 → 2)

- `SCHEMA_VERSION = 2`. A new `core/saveMigrations.ts` exports `SAVE_MIGRATIONS = { 1: addCollectionFields }` (the empty map leaves `save.ts`), passed to the engine's `parseSaveWith` as ADEEVA, Patisserie, Thrift-Flip and Workshop do.
- `addCollectionFields(raw)` is pure and returns a new object. It adds `career: "bench"`, `collection: null`, `launch: null` and `profile.startedAs: "bench"`; zero counts for the 4 new metals (every stock size), 8 new stones and 6 new extras; `twin: false` on every join record of `activeRun`; `stoneTint: null` on every `PieceLook` in `keepsakes[].look`, `stallBox[].look` and `market.last.slots[].look`; and `shape: null` on every placed charm in those looks and in `activeRun.display.charms`. Every key is added because `objectOf` parsers (`pieceLookParser`, `placedCharmParser`) require all of them. Purposes, plans, cuts, sets, polish, display, briefs, gigs, calendar, upgrades, decor, stall box, Keepsake Case, log, story (`seen`, `flags`, `queue`), trends, market theme and RNG are kept, so an order or stall piece in progress continues exactly. Metal, stone, product, option, finish, extra, keepsake source and run kind unions are widened, never narrowed.
- v2 shapes: `PieceLook` gains `stoneTint: StoneTint | null` and `PlacedCharm` gains `shape: OptionId | null` (set only on a Motif Charm). `collection = {seasonStartDay, seasonNumber, themeId, rested, carried, lineNameId, brief, pieces, gemTray, stonePot, gemSpent, lineSheets, motifMaster, lookbook, drawer, graceSeason, nextPieceNumber}`, where a `CollectionPiece` is a `StallPiece` plus `{slot, runId, cutAccuracy, motifCutAccuracy, joinAccuracy, setAccuracy, polish, carriesMotif, potStones, sparkle, spend}` and a pot stone is `{stoneId, tint, shimmer, used}`; `launch = {spot, spotOffer, result, popup, garland: Record<LaunchThemeId, AwardId | null>, awardsBySeason}`. The parser rejects a collection save with `collection: null`, a bench save that has one, a collection-purpose run in a bench save, a `twin: true` record on a product that is not a pair, twin records with unequal `ticks`, and a `shape` on any charm but the Motif Charm.
- `earnedReputation` accepts version ≤ 2, so `reputationOf` reads both. An eligible v1 player sees `jb-loft-offer` after their next delivery, Market Day or End Day; the migration never queues a beat or grants anything.
- **Fixtures** (committed v1 saves written by the slice's own serializer through `testPlaythrough` before any type changes, as Interior's were): fresh on day 1; mid-order at join with one joint recorded; a stall piece at Display with placed charms; just after Market Day with market keepsakes that include charms; at the threshold (reputation 45, 14 delivered, 3 active gigs); and full stock with all upgrades and decor. Each loads, continues to a delivery and End Day, and saves as v2; the threshold one gets the offer and opens the loft. A deep-frozen fixture proves the input is never mutated. v3 and damaged saves are reported, never reset.
- **Slice stays still:** every slice-era seeded test passes unchanged, since new clients, metals and stones open only at reputation ≥ 14 and Day 1 is still Gran Mina.

### 10.11 Safety notes for the loft, the Launch and the Pop-up

- **Kind showcase, not a TV format.** On screen it is "Lantern Night" with "panels" of named neighbours. Never shown: judge, elimination, rounds, winner, loser, challenge, "going home", countdowns, rivals or rankings. Neighbouring stalls are scenery. Every launch gets an award from fixed bands; lines praise first and the one tip starts "Next time, try…".
- **Pieces, never bodies.** Jewellery rises on music-box plinths, sits on stands and Lookbook cards, and is never worn by a model, a visitor or the avatar; there are no ears, necks, wrists or hands in any art. The Lookbook photographs objects with props only and nobody poses; Snap is a pretend camera, with no device camera, no people photographed and no export. Coat badges use a clip back and earrings stay clip-on.
- **No real technique.** The Twin Lamp is still a glowing game lamp with a 0–1 bar: no flame, torch, gas, flux, pickle, temperature or soldering words. Line sheets and motif masters are game rules with game numbers. The §8 real-world line stays on Cut and Join, and the Lookbook adds nothing to copy at home.
- **Lights stay electric.** Lanterns, the paper moon and the visitors' lanterns are paper or electric glows; no candles, sparklers, fireworks or flames. Paper stars drift down; nothing is released into the sky.
- **No value or pressure talk.** Stones have tints and shimmer, never grades, carats, clarity or "real vs fake"; birthstones, luck and healing are never mentioned. Prices are small game coins; tags read Gentle, Fair and Special, the metal term in a price breakdown is the "Sparkle bonus", and there is no "sale", "discount", "limited", countdown or "worth". Visitors never haggle, complain or leave unhappy; hearts are the only reaction.
- **Adults stay public.** The Launch and the Pop-up are busy arcade events. Copy requests are pinned order tags collected at the stall; no adult asks to meet privately or keep a secret. Children appear only beside their family (Asha and Meera with her grandad, Mrs. Lune and Theo).
- **Randomness is free; coins only.** Kemi's tray, themes, visitors and briefs come from the seeded RNG; nothing can be rerolled or bought with money. No entry fee, no real money, no online sharing. Line names are presets. Before shipping, check that "Lantern Night Launch", "Pebble & Prism", "the Lantern Loft", the 8 line names and the new client names are not real trading, event or brand names.

### 10.12 Build and test plan

- **Reuse first; extend without breaking anything:** `ui/newGame/CareerStep`, `careerDraft` and `careerFacts`; the engine's `panelScore` (`panel`, `subScore`, `overallScore`, `bestSubScore`, `panelVerdict`), `showOrder` (`closerStrength`), `showDay` (`stagingScore`, `lateShowPenalty`, `showReputation`, `GENTLE_SHOW_SETBACKS`), `qualityTip`, `musicMood` (`MUSIC_MOODS`), `paletteCohesion`, `geometry/polygonArea`, `weekSettlement` and `weekMoneyLines` (rent lines), `parseSaveWith`, `earnedReputation`, `rngDraw` and story choices with typed effects. `ui/kit` gives `PanelCard`, `useShowClock`, `easing`, `useRovingRadio`, `useArmedAfter` and `useCountUp`; `ui/show` gives `MusicChip` and `show.css`; `ui/art` gives `PlacedLayer` for props and `PetalFall`, whose `FallShape` gains `star` while its default stays `petal`. Jewellery's own `sheetPlan`, `cutRecord`, `joiningLamp`, `stoneSetting`, `polish`, `displayChoice`, `pieceQuality` and `pieceEvaluate` take collection inputs without changing any order or stall result. Jewellery imports no other game and adds no lint allow-list entry.
- **Lift the reveal step timeline:** `ui/show` `showSegments` and `useShowPlayback` run a fixed auto-advancing timeline that can't wait for a tap, so `LanternLaunch` does not use them. Patisserie (`ui/screens/fair/showcaseSteps.ts`, `useShowClock` per step) and Workshop (`ui/screens/fair/revealSteps.ts`) each keep their own glide → wait → reveal list. Lift it into `ui/show/revealSteps.ts` (kinds title, lights, glide, wait, reveal, finale, panels; per-game `MOTION_MS` and `STILL_MS`; reduced motion drops glide and lights; Workshop's `lift` step is the `reveal` kind) and `ui/show/useRevealSteps.ts` (the step index, a one-shot `next` guarded against a tap and the timer advancing twice, and Escape skip once a reveal has played). Patisserie's `FairShowcase` and Workshop's `BoothReveal` move onto both with their tests unchanged, and `LanternLaunch` uses them.
- **Lift the season clock and grace:** `seasonDay`, `nextSeasonStart` and the grace rule already live in Workshop (`core/seasonCalendar.ts`, `core/shopGrace.ts`), and Thrift-Flip has its own `seasonCalendar`. Lift `engine/seasonClock.ts` (`seasonDay(start, day, length)`, `nextSeasonStart`) and `engine/seasonGrace.ts` (`graceDue`, `GRACE_COINS = 60`), and move Workshop onto both with its tests unchanged. Jewellery's `seasonCalendar` and `loftGrace` are thin adapters over them.
- **Slice copy fix:** "Hear that little chime?" in `ui/screens/bench/LampBench.tsx` has no sound behind it and becomes "See that little chime?".
- **New content files** (one concept each): `career` (becomes `CAREERS`), `launchTheme` (with story cards), `launchSpot`, `lanternColour`, `lookbookBackdrop`, `lookbookProp`, `priceTag`, `stoneTint`, `lineName`, `panelMember` and `popupVisitor`; the catalogue files gain their ids, metal tones, `lineBase`, `stallBase` and the widened `kind`.
- **New core files:** `loftOffer` (unlock check and `openLoft`), `collectionStart`, `seasonCalendar`, `restLine`, `loftGrace`, `collectionBrief`, `collectionBoard` (confirm, Osei's suggestion and the hours estimate), `gemTray`, `stonePot`, `lineSheet`, `motifMaster`, `twinLamp`, `stoneMatch`, `motifShare`, `collectionPiece`, `lineDrawer`, `lookbook`, `lookbookLight`, `launchPlan`, `launchPanels`, `launchPrize`, `launchSeason` (theme pick, partial launch, skip, carry, spot step), `lanternGarland`, `popupPlinth`, `popupPrice`, `popupHearts`, `popupSale`, `copyRequests`, `saleTraitLines`, `marketReputationBonus`, `loftUpgrades`, `jewelleryProfile` and `saveMigrations`. `reduce.ts` (119 lines) sends the new cases to `reduceCollection.ts` and `reduceLaunch.ts`, so every file stays ≤ 700 lines.
- **New UI:** the career cards, line-name picker and bench-tour toggle; `CollectionBoard` (side-by-side preview, Harmony meter, checklist with the hours line); `GemMarket` (`GemTray`, `LinePot`, tinted `StoneArt` with tint patterns) and the Settings "Tint labels" toggle; the line-sheet holes and filmstrip on Plan; the motif-master outline on Cut; `TwinLamp` (one bar, two zones) on Join; the pot picker on Set; the shine bar on Polish; `Lookbook` (`PhotoCard`, `PropArt` × 8, `BackdropArt` × 4, `LampRing`); `LaunchBoard`, `LaunchPlanner`, `LanternLaunch` (`LanternStageBackdrop`, `MusicBoxPlinth`, `LanternSlide`, `LanternBeam`, `LightThread`) and `LaunchResults`; `PopupWindow` (one row of generic `StandArt`, the plinth picker, `PriceTagPicker` with ♥ counts and sells marks, `HeartPots`); `LanternGarland`; `LoftBackdrop`; and `PiecePreview` drawings for the 7 new products, 8 options and 3 finishes. All work with mouse, touch and keyboard, controls are ≥ 44 px (lamp, Snap and lid 56 px), and reduced motion is respected.
- **Build order:** D1 careers, migration, unlock and start here; D2 content × 2 in both careers; D3 Collection Board, collection runs, Gem Market, line sheet, motif master, Twin Lamp and pot pick; D4 Lookbook; D5 the reveal-step and season-clock lifts, Launch season, planner, reveal, panels, awards and the garland; D6 Pop-up and copy requests; D7 simulation tuning and e2e.
- **Unit tests:** unlock at 44/45 reputation and the 13/14 delivered guard, no second queue while `loft-offer` waits, and "Not yet" keeps the card; `startedAs` and studio reputation (missing → 0, collection start 30); rent timing around `seasonStartDay`, the 130 loft rent, Rest the line and loft grace; the season calendar when the loft opens in an odd and an even week, Lantern Night as a working day before staging, the day-13 deadline shift, a partial Launch at 2 finished pieces (Relaxed 1) moving unfinished runs to next season, End Day refused on day 14 while the Launch can be staged, and the skipped Launch carrying the line; Collection Board rules (sizes per spot, 2 kinds, one product each, motif carriers) and the hours estimate; collection briefs without budget or deadline criteria; Gem Market tray generation (hero and accent types only, always solvable within budget), prices by shimmer, the per-seat budget block, leaving refused until every seat is covered, tint words and patterns on every difficulty and the toggle; pot stones returning as plain stock after the Launch; line sheets (holes, first-cut consumption once, Show me into gaps, sheet use with and without a line sheet, clearing after the Launch); motif master and Every motif crisp at 0.90 and with the assisted 0.8; the Motif Charm's stored shape on collection and bench pieces; Twin Lamp zones per difficulty and upgrade, the shared tick counter, own-zone inside and over counts, the twin glow at 90 and 91 ticks apart, the 0 h Join stage, records and refusals on non-pairs; Stone match; Lookbook light at band edges, prop overlap refusal, "Use this styling for every page" and Osei's lamp cap; every panel formula including the no-stone weights, award band edges, `launchPrize`, spot advance at 70 (75 Challenging) and the Relaxed offer at 55; Market Day's reputation multiplier at 20, 45 and 60; Pop-up hearts (one per piece, H − n by appeal with largest remainder and its tie rule, the plinth on its own piece, Window Stands), the H = n = 3 case with appeals 140 / 140 / 20 selling all Gentle, sales per tag, live sells marks, the Relaxed Gentle rule, Little shelf sales, trait lines and copy requests (capped at 2, fee 1.2 × Fair, 0 h design, brief contents); the full Line Drawer selling its oldest piece; collection runs never touching `log` or `ordersDelivered` and `abandonRun` refused after the first cut; every new action returns the same reference when illegal; the six migration fixtures.
- **Content tests:** unique ids; every canonical layout fits for every new product with every option it allows; every motif split for friendship halves gives closed outlines that fit 14 × 26 with ≥ 12 live polish cells, and every motif on the 10 × 10 clip face does the same; a line sheet can hold the parts of every 3-piece line from the products that fit on one sheet each; every theme palette and client colour can be made; every client budget is above its cheapest valid build; every Pop-up visitor resolves through `clientById` and none is in `freeClients`; every product has a `stallBase`; hint lines ≤ 12 words; client lines ≤ 2 sentences; and no grown-up jewellery or luck words on screen (§1, plus "carat", "clarity", "grade", "solder", "luck" and "lucky" in every new string).
- **Simulation (`depthEconomy.test.ts`, seeded, 5 seeds):** a decent bench bot gets the offer between day 15 and day 28 and passes 75–90% of its orders; each bot is compared with the same-skill bench bot using its better Market Day policy; a decent collection fortnight earns between 1.0 × and 1.3 × that bench fortnight; a collection-max bot stays ≤ 1.3 ×; a struggling Standard bot using shifts and Rest the line never ends two fortnights running below 0; a Relaxed collection season never takes coins below 0 and replays identically.
- **e2e** (`MAKER_PORT=5197`, 1280×800 and 820×1180, zero network requests): `e2e/jewellery/loftUnlock.spec.ts` (a committed v1 save at the threshold delivers, gets the offer, opens the loft, saves and reloads); `e2e/jewellery/collection.spec.ts` (start here as Collection Designer, confirm a 3-piece board, buy matching stones at the Gem Market by drag and by keyboard, plan on a line sheet around holes, cut a motif against the master, a Twin Lamp join by real pulses, set from the pot, shoot a Lookbook page); `e2e/jewellery/lanternNight.spec.ts` (a prepared Lantern Night save: planner, the reveal in motion and in reduced motion with keyboard lid openings, a tap landing as the timer fires advancing once, skip, the award on the garland, then the Pop-up with the plinth pick, tags, ♥ counts and a copy request on the board, save and continue). Patisserie's and Workshop's existing showcase and reveal specs pass unchanged after the lift.
- **Checks:** `MAKER_PORT=5197 pnpm lint`, `pnpm typecheck`, `pnpm test` (twice) and `pnpm e2e` pass, with no `Math.random` or `Date` in core or content, no comments, no file over 700 lines, and every process started for the task stopped at the end.

### 10.13 As built (where the implementation differs)

- **Unlock and start here:** the offer beat's line-name picker sits inside the story card; `chooseStoryOption {beatId, choiceId, lineNameId}` opens the loft in one action, and "Not yet" leaves the hub's "The Lantern Loft" card with the same picker. New Game shows the line names under the career cards only when "Your Own Collection" is picked; a bench start stores `little-lantern` and never shows it. The slice Market Day theme `lantern-night` is shown as "Lantern Glow Market".
- **Season:** the theme can be picked on season days 1–10 (Rest the line only on day 1). The Collection Board, Gem Market, Lookbook, Launch and Pop-up are their own screens (`board`, `gems`, `lookbook`, `launch`, `popup` play views); the hub's line card walks the steps in order and holds the velvet tray of slots. The Story Corner's three grown-ups are drawn once per season from past clients (`collection.storyCorner`).
- **Line sheet:** one line sheet per season. The first collection cut on a wide sheet claims it; later pieces plan around its holes (owned by run id) and the sheet is counted once in Sheet use. Show me fills the gaps first and, when the usual search from the middle finds no room, tries the sheet's left edge.
- **Twin Lamp and pot:** the Join stage offers "Join both" or "One at a time" before any seam is joined; the twin record is written in one `recordTwinJoin` and the glow is kept on the run (`twinGlow`). The steady lamp holds the glow at the centre of the overlap (`twinSteadyTick`). Pot stones are chosen with `choosePotStones` at Set and leave the pot on the first `setStone`.
- **Collection review:** `addToCollection` scores the piece with `pieceQuality` (there is no client to evaluate) and pays only the finish; pot stones are not counted in the piece's spend. The bench header and rail say "Ready for the line" / "To the line".
- **Copy requests** are briefs with a `preset` design (`Brief.preset`); a preset design is locked and its Design step costs 0 h. Budget = the piece's spend + its catalogue stone cost + 10.
- **Lookbook:** opening a page styles it at once (Linen and no props, or Osei's page on Relaxed). Closing needs at least one snapped page and charges the 2 h then. The sweet spot is seeded from the run's seed. Tint labels are a per-session Settings choice (on by default on Relaxed), not saved.
- **Line Drawer:** a ninth piece sells the oldest at 0.8 × its Market Day price.
- **Loft upgrades** are listed under the catalogue's "Loft upgrades" heading and open by spot (Sorting Tray and Twin Lamp Stand at spot 1, Light Box at 2, Window Stands at 3).
- **Lantern Night:** the reveal is one SVG stage (`LanternStage`, `MusicBoxPlinth`, `LanternSlide`, `LanternBeam`, `LightThread`, `LanternGarland`); the crowd is four Pop-up visitors and the Story Corner. Motion timings: title 2.6 s, lights 1.8 s, wind 1.4 s, wait 3 s, reveal 1.8 s, finale 4.2 s, panels 4.4 s. The flip cards are the shared `ui/show/PanelFlips`.
- **Pop-up:** the window plinth is picked by tap or arrow keys (no drag). The visitors' stroll is 15 s with Skip; reduced motion shows the heart counts with a "See how it went" button.
- **Shared lifts:** `ui/show/revealSteps.ts` (with `restX`), `ui/show/useRevealSteps.ts` and `ui/show/PanelFlips.tsx`; Workshop's `BoothReveal` keeps its `lift-N` scene names, and Patisserie keeps `showcaseSteps` as a thin adapter, so their specs are unchanged. `engine/seasonClock.ts`, `engine/seasonGrace.ts` and `pointParser` in `engine/stateParsers.ts` are lifted from Workshop and Interior. `PetalFall` gains `star`.
- **Tests:** the unlock pacing bot (`benchBot.ts`) passes about 93% of its orders (offer on days 16–19 across five Standard seeds), so the test bounds the pass rate at 75–100%. The fortnight economy comparison (`depthEconomy.test.ts`) was not built. e2e: `loftUnlock.spec.ts` ends the day on the v1 threshold save (the offer queues at End Day), says "Not yet", opens the loft from the hub card, reloads and plays into Season 1; `collection.spec.ts` starts from a prepared loft save and makes one pair piece (stone drops) by hand through every step, at both viewports; the Lookbook, New Game career path and every new screen are in `loftScreens.spec.ts`; `lanternNight.spec.ts` is as planned.
