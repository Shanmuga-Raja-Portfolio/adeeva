# Patisserie Atelier — Game Design (id: `patisserie`)

A playable slice of the Maker Studio contract (`work/0003-studio/design.md`), at about a third of ADEEVA's depth. You take over a small corner bakery, **Crumb & Comet** on Larkspur Street, from **Otti, the retired baker who hands you the keys**. Neighbours bring cake and pastry orders. For each order you design the bake, weigh, stir, bake, pipe and top it, then deliver it. On the seventh day of each week you open the counter and box up treats. Every delivered bake goes into your **Bake Book**, a gallery you can show off. All names, text, amounts and art are original. The safety promise from the studio contract applies to every screen.

## 1. Fantasy and audience

- **Fantasy:** "I made a two-tier cake with gold stars for my cousins' graduation, and the piping was perfect." You turn a short request into something beautiful that people celebrate with. Results opens on the bake in a ribboned box with its lid lifting, and the bake then sits in the Bake Book with the client's thank-you line.
- **Ages 8–15+.**
  - 8–11 play on Relaxed with Assist toggles available. Their first order is a guided Pip order (§2). They enjoy pouring on the scale, watching cakes rise and colour, and piling on toppings.
  - 12–15+ play Standard or Challenging. They release the scoop early so the scale settles on target, take bakes out at exactly golden, pipe clean borders for picky clients, and pick which Counter Day boxes to fill with limited stock.
- **Reading level:** hints are one sentence of 12 words or fewer, at about Grade 3. Client lines are 1–2 short sentences. Every number has an icon: coin, clock, scale, heat dot.
- **Why it is good for kids (without overclaiming):** it practises fine pointer control, reading a scale and comparing numbers ("is 186 close to 180?"), steady pacing, patience with timing, and planning within a budget and a deadline. It does **not** teach real baking or kitchen safety.
- **Parent page sentence (exact):** "Amounts and oven dots are game numbers, not a real recipe. It does not teach real cooking."

**Kid-facing labels** (the design terms on the left never appear on screen):

| Design term      | Label on screen                            |
| ---------------- | ------------------------------------------ |
| tolerance / band | (never shown; the green zone is the label) |
| settle           | "The scale keeps going after you let go!"  |
| batter / dough   | "Mix"                                      |
| heat level       | "Heat dots" (1–5 dots, no degrees)         |
| rent             | "Bakery rent"                              |
| topper           | "Toppings"                                 |

## 2. Core loop and stages

**Career (only one):** _Corner Baker_ at Crumb & Comet. Start: 80 coins, reputation 0, a starter pantry (2 flour, 2 caster sugar, 1 icing sugar, 2 butter, 1 milk, 2 egg boxes, 1 vanilla), weekly rent 70.

**Hub loop:** check the order board → start an order or a counter tray → deliver or stock the counter → end the day. Days 1–6 of each week are baking days; day 7 is **Counter Day** (§3.6): deliveries are allowed before opening, but no baking or shift happens that day. Rent is charged when Counter Day ends.

**First order guide:** on Relaxed, the Day-1 offer is Pip's order with a guide on: one hint bubble per stage (the §3.7 line for that screen), dismissed with one tap. A hub toggle turns the guide off.

**`BakeRun.stage`** = `brief → design → pantry → weigh → mix → bake → stack → pipe → decorate → review → done`

| #   | Stage    | Hours                                | What happens                                                                                                                                                                                                                                                                                                                                                               |
| --- | -------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | brief    | 0                                    | Order card: product(s) allowed, required tags, required or avoided flavour, favoured and avoided colours, required toppings, budget, fee, deadline and minimum quality. The live checklist (ADEEVA `checklist`) stays visible afterwards. Skipped for counter trays.                                                                                                       |
| 2   | design   | 1                                    | Pick a product (§4.3), a mix per batch, a filling, icing colours (1–3 from the shared 16) and one of the product's 2 piping patterns (§4.3). Each mix card shows its ideal heat ("Oven: ● ● ● ○ ○"). `BakePreview` shows the bake on a stand.                                                                                                                              |
| 3   | pantry   | 1 per visit (0 if nothing is needed) | Shelves show packs. The shopping list covers everything the design needs: weighed ingredients, eggs, and the butter and icing sugar for buttercream or icing (§4.1). Missing amounts are highlighted. Several packs can be bought in one visit, and coins are checked atomically.                                                                                          |
| 4   | weigh    | 1 (2 for the two-tier cake)          | Scoop & Weigh, 4 ingredients per batch (§3.1). Eggs are a tap-to-crack animation and are not scored.                                                                                                                                                                                                                                                                       |
| 5   | mix      | 1                                    | Stir, one bowl per batch (§3.2).                                                                                                                                                                                                                                                                                                                                           |
| 6   | bake     | 2 (3 for the two-tier cake)          | Oven, one bake per batch (§3.3). The two tiers bake one after another inside the 3 h. The bake commit is idempotent per run and batch.                                                                                                                                                                                                                                     |
| 7   | stack    | 0                                    | Layer and two-tier cakes: drag layers or tiers onto the stand's slots, using ADEEVA's `assignSlot`/`slotAssignmentIssue` pattern; wrong slots are refused with a reason. Cupcakes, biscuits and the tart case place themselves. The filling goes in with one **Fill** tap here: between layers, between tiers, into the tart case or into the cupcake centres. Not scored. |
| 8   | pipe     | 2                                    | Pipe 2–4 icing paths (§3.4).                                                                                                                                                                                                                                                                                                                                               |
| 9   | decorate | 1                                    | Place toppings (§3.5).                                                                                                                                                                                                                                                                                                                                                     |
| 10  | review   | 0                                    | Evaluate once and reward once. Orders are delivered from the hub and added to the Bake Book; trays go to the counter.                                                                                                                                                                                                                                                      |

A one-batch order costs 8 h plus an optional pantry visit, so it fits in a 10-hour day. The two-tier cake costs 10 h and usually runs into a second day. Going back is allowed until the first bake commits; after that the design is locked (ADEEVA `stageNavigation`/`canGoBack`).

**Counter trays** (6 cupcakes or 6 iced biscuits) run `design → pantry → weigh → mix → bake → review`: design 1 + weigh 1 + mix 1 + bake 2 = **5 h** plus pantry. They get a free auto swirl or auto outline in one chosen icing colour, with no toppings. Their quality uses `0.35·weigh + 0.25·stir + 0.40·bake`. Trays earn coins only on Counter Day; they give no reputation or buzz.

## 3. Hands-on mini-games

Input is Pointer Events only (mouse and touch), with no keyboard or hover. Every handle, button, ingredient tile, item and topping is at least 44×44 px, and piping paths are drawn at least 12 px wide. Scoring lives in core: the UI runs the animation loop and sends counts or samples, and core validates them. Tolerances multiply as **base × trait × upgrade × difficulty**. Difficulty uses ADEEVA `content/difficulty` `toleranceMultiplier` (Relaxed 1.3, Standard 1, Challenging 0.85). Perfectionist is ×1.2 on every tolerance below (ADEEVA `PERFECTIONIST_TOLERANCE_MULTIPLIER`). **Assist caps a step's accuracy at 0.8 on every mini-game**, matching ADEEVA's `ASSIST_CUT_ACCURACY` and `ASSIST_SEW_ACCURACY_CAP`.

The four mini-games use four different skills: **Weigh** is stop-at-the-right-amount, **Stir** is keep-a-steady-speed, **Oven** is read-and-time with two decisions, and **Pipe** is follow-a-line.

### 3.1 Scoop & Weigh (new)

- **Input:** the target shows as a green zone on a big dial scale. For **pour** ingredients, press and hold the scoop over the bowl to pour. Flow starts at 0.08 × target per second; after 1.5 s of holding it ramps linearly to 0.6 × target per second over 0.5 s. Releasing stops the flow, and **each new press restarts at the slow flow**. After release the scale keeps going: `settle = flowAtRelease × (0.10 + 0.25 × pourDifficulty)` seconds of flow are added. **Piece** ingredients (butter slices of 25 g, vanilla drops of 1 g) are tapped in one at a time. A **Scoop back** button (48 px) removes 0.1 × target per tap.
- **Stock cap:** poured grams stop at `min(3 × target, pantry stock)`. If the stock runs out first, the pour stops with "The bag is empty! Buy more in the pantry." and Back to pantry is offered.
- **Scored per ingredient:** `e = |grams − target| ÷ target`; `band = 0.05 × trait × upgrade (Bright Scale 1.2) × difficulty`. `weighAccuracy = 1` if `e ≤ band`, else `max(0, 1 − (e − band) ÷ (3 × band))`. A tidy-scale factor then multiplies it: `minActions = 1` for pour and `ceil(target ÷ pieceSize)` for piece; `extra = actions − minActions`; factor `= max(0.6, 1 − 0.04 × max(0, extra − 2))`, where actions counts pours, taps and scoop-backs. So 7 taps of butter for 175 g, or one pour plus two fixes, costs nothing. On Standard, 186 g against 180 g (3.3%) scores 1.0, and 198 g (10%) scores 0.67.
- **Record and checks:** `{ingredientId, grams, actions, assisted}`. Grams and actions are whole numbers with `0 ≤ grams ≤ min(3 × target, stock)` and `1 ≤ actions ≤ 40`; core rejects anything else. Committing a batch consumes the grams actually poured from the pantry.
- **Assist** ("Scale helper"): a stop line appears, and the pour stops by itself at the target. Accuracy is capped at 0.8.
- **Fun at 8 and at 15:** at 8, pouring flour clouds and dropping in butter with a plop. At 15, judging the settle on honey and icing sugar and landing it in one pour.

### 3.2 Stir (new UI; tick loop and record shared with ADEEVA's sewing)

- **Input:** a top-down bowl. Hold and circle the spoon round the bowl at any radius. A small speed gauge on the bowl rim shows the spoon's speed, with its green arc drawn at the true band width. Sponges take 3 laps and pastries take 2; directions alternate, shown by an arrow. The mix visibly turns from streaky to smooth. Too fast throws a harmless splash onto the bench (wiped off by itself); too slow leaves the mix streaky.
- **Scored:** at 60 ticks per second while the pointer is down and the spoon moves at ≥ 0.5 rad/s, a tick counts as inside when the spoon's angular speed is in the green band: `|ω − 3.5| ≤ halfWidth`, with `halfWidth = 1.0 × (1 − 0.4 × stiffness) × trait × difficulty` rad/s (stiffness §4.2). The base band is 2.5–4.5 rad/s; on Standard it is about ±0.88 for sponges and ±0.68 for biscuit dough. The spoon trails the finger and never exceeds 9 rad/s. `stirAccuracy = insideTicks ÷ ticks`.
- **Record and checks:** `{batchId, progress, ticks, insideTicks, assisted}` through the shared `recordFollow` (generalised from ADEEVA's `recordSeam`). Counts are whole numbers and only grow, `insideTicks ≤ ticks`, and progress (laps) moves strictly forward. Each lap's ticks must be at least 40 and at most 1200; the 9 rad/s spoon cap and the 0.5 rad/s floor keep honest play inside these bounds. Resuming continues the stored counts.
- **Assist** ("Steady spoon"): the band widens ×1.6 (ADEEVA `ASSIST_SEW_WIDENING`) and accuracy is capped at 0.8.
- **Fun at 8 and at 15:** at 8, swirling a big bowl until it goes glossy and seeing what happens when you go wild. At 15, holding a narrow band on a stiff dough.

### 3.3 Oven (new)

- **Input:** a 5-dot heat dial with a 56 px knob that snaps to each dot, then **Bake**. The ideal heat is printed on the mix card ("Oven: ● ● ● ○ ○"), so setting the dial is a reading check. Inside the oven window the bake rises and changes colour through five stops by `f` (below): **pale** under 0.80, **light** 0.80–0.94, **golden** 0.94–1.06, **deep** 1.06–1.25 and **toasty** above 1.25. At `f = 0.5` a **Turn tray** prompt (64 px) appears and stays until tapped. A big **Take out** button (64 px) ends the bake. Game time runs at 1 game minute per 0.3 s real, so a 24-minute bake takes 7.2 s. Reduced motion swaps the rise animation for a colour bar.
- **Scored:** `k = heat − idealHeat`. `heatScore = max(0, 1 − 0.6 × |k|)`. Done time is `idealMinutes × (1 − 0.16 × k)`, so hotter is faster. `f = takenMinutes ÷ doneTime`. `window = 0.06 × trait × upgrade (Oven Lamp 1.2) × difficulty`. `timingScore = 1` if `|f − 1| ≤ window`, else `max(0, 1 − (|f − 1| − window) ÷ 0.25)`. `evenScore = 1` if the tray was turned at `|turnedMinutes ÷ doneTime − 0.5| ≤ 0.15`, else 0.6 (including never turned). `bakeAccuracy = 0.2 × heatScore + 0.6 × timingScore + 0.2 × evenScore`. On Standard, a 24-minute sponge has a perfect window of 22.6–25.4 minutes, about ±0.43 s real (±0.56 s on Relaxed); missing it by another 0.1 of done time still scores 0.6 on timing.
- **No tap:** if Take out is never tapped, the bake comes out by itself at `2 × doneTime`, toasty.
- **Record and checks:** `{batchId, heat, turnedMinutes | null, takenMinutes, assisted}`. Heat is a whole number from 1 to 5; minutes are whole numbers with `1 ≤ turnedMinutes < takenMinutes ≤ ceil(2 × doneTime)`; each batch commits exactly once. There is no rebake in this slice; a toasty bake still continues, with a kind line: "A little toasty. Icing hides a lot!"
- **Assist** ("Oven helper"): the dial is preset to the ideal heat, the tray turns itself at `f = 0.5`, and a bell rings and takes the bake out at `f = 1`. Accuracy is capped at 0.8.
- **Fun at 8 and at 15:** at 8, watching a cake puff up, turning it, and shouting "now!". At 15, reading the colour stops and nailing a ±0.43 s window.

### 3.4 Pipe (reuses ADEEVA's trace)

- **Input:** a turntable view of the bake's top or side, about 24 × 24 cm in canvas units. Press to squeeze and drag along the dotted path; samples are taken only while pressed, and no closer than 0.2 cm apart, up to 2000 per path. Paths come from the chosen pattern (§4.3). A **Scrape** button redoes the current path; finished paths are never touched, mirroring ADEEVA's seam restart.
- **Scored per path:** `pipeAccuracy = traceAccuracy(samples, path, tol) × coverage`. `coverage` is the share of checkpoints, one every 1 cm along the path, that have a sample within `tol`, so a short perfect squiggle cannot score high. `tol = 0.8 cm × trait × upgrade (Pro Piping Set 1.15) × difficulty`. This reuses ADEEVA `traceAccuracy`/`distanceToOutline`, extended with a `closed: boolean` flag so open swirls and swags do not join their last point to their first. ADEEVA calls keep `closed = true`.
- **Assist** ("Guide dots"): the bag snaps along the path as you drag. Accuracy is a flat 0.8, like Assist cut.
- **Fun at 8 and at 15:** at 8, thick, squishy icing lines in any colour. At 15, a clean scalloped border on a two-tier cake that a picky client will notice.

### 3.5 Toppings (reuses ADEEVA's decoration)

- Drag toppings from the tray onto the preview, then move, rotate (in 15° steps) and scale them (0.5–2, ADEEVA `MIN/MAX_DECORATION_SCALE`). Tapping a placed topping returns it to stock. This reuses the ADEEVA `Decoration` pose `{x, y, rotation, scale, layer}` through a generic `PlacedLayer` on a 400 × 400 cake canvas. Sprinkles count as one topping per placed pinch.
- This step is creative, not scored on skill. It feeds the style, colours and toppings criteria.

### 3.6 Box It Up (Counter Day only; new)

- **Stock:** counter trays baked on days 1–6, of 6 items each. An item's kind is its product (cupcake or biscuit) and icing colour. The counter holds 3 trays, or 4 with the Display Counter.
- **Cards:** the counter shows **6 order cards** (8 with the Display Counter). Each card shows 2–4 pictured items, drawn by the seeded RNG from the item kinds in stock, so every card could be filled but not every card can be filled at once.
- **Input:** drag items (≥ 56 px) into a card's box. A box that holds exactly its card's items closes with a ribbon and sells. A wrong item bounces back with "That box needs something else." and no penalty. Half-filled boxes can be emptied back to the trays at any time. There is no per-card timer, no queue and nobody leaves. A whole-session limit of 150 s shows as a sun crossing the shop window; it is off on Relaxed, and a paused or hidden tab freezes it. **Close shop** ends the session early.
- **Pay:** each item in a sold box pays `3 + round(3 × trayQuality ÷ 100)` coins (5–6). A card containing an item whose tray carries one of this week's hot tags pays +1 per item. Charmer adds +1 coin per box.
- **Result:** coins for every box sold. Items left over are "shared with the neighbours", with a kind line and no penalty or reward.
- **Record and checks:** `{cardIndex, items[]}` per box; core checks the items match the card and are still in stock, and each card sells at most once.
- **Fun at 8 and at 15:** at 8, matching pictures and tying ribbons. At 15, a small packing puzzle: with limited stock, which cards to fill (hot-tag cards pay more) so the fewest treats are left over.

### 3.7 Hint lines (≤ 12 words)

| Screen               | Hint                                                      |
| -------------------- | --------------------------------------------------------- |
| Weigh                | Hold to pour. Let go early: the scale keeps going!        |
| Stir                 | Stir round the bowl. Not too fast, not too slow!          |
| Oven                 | Set the heat dots, turn the tray, take out at golden.     |
| Stack                | Drag each layer onto the stand. Tap Fill for the filling. |
| Pipe                 | Press and trace the dots. Scrape to try again.            |
| Toppings             | Drag toppings on. Tap one to put it back.                 |
| Counter              | Fill each box with the treats on its card.                |
| Assist fallback      | Stuck? Tap Assist for help. You can switch back anytime.  |
| Safety (Oven, Weigh) | Real ovens, mixers and knives: ask an adult first.        |

## 4. Content catalog

Shared via the engine: style tags (10), colours (16, used as icing colours), difficulty (3) and trait names (4). All ids are kebab-case, `as const`.

### 4.1 Ingredients (10)

Mode: **pour** (dial and settle) or **piece** (tap to add). The used share of a pack's price counts toward a run's budget (§5).

| id           | name          | pack     | price | mode                        | pourDifficulty / piece size |
| ------------ | ------------- | -------- | ----- | --------------------------- | --------------------------- |
| flour        | Plain Flour   | 500 g    | 4     | pour                        | 0.6                         |
| caster-sugar | Fine Sugar    | 500 g    | 4     | pour                        | 0.2                         |
| icing-sugar  | Icing Sugar   | 500 g    | 4     | pour                        | 0.7                         |
| butter       | Butter        | 500 g    | 8     | piece                       | 25 g slice                  |
| milk         | Milk          | 1000 g   | 3     | pour                        | 0.1                         |
| cocoa        | Cocoa Powder  | 250 g    | 8     | pour                        | 0.8                         |
| vanilla      | Vanilla Drops | 50 g     | 6     | piece                       | 1 g drop                    |
| lemon-zest   | Lemon Zest    | 60 g     | 5     | pour                        | 0.5                         |
| honey        | Clover Honey  | 350 g    | 8     | pour                        | 0.9 (slow drip)             |
| eggs         | Eggs          | box of 6 | 6     | crack (counted, not scored) | 1 egg                       |

**Icing gel:** one pot per colour, 5 coins, lasting 10 uses. Ivory buttercream is free. Buttercream for each frosted unit uses 125 g butter and 250 g icing sugar; an icing-only unit (biscuits) uses 250 g icing sugar alone. These amounts are on the pantry shopping list from the design stage and are drawn automatically at the pipe step.

### 4.2 Mixes (6; 4 weighed ingredients each)

| id             | name           | weighed (g)                                  | eggs | heat dots | minutes | laps | stiffness | tags              |
| -------------- | -------------- | -------------------------------------------- | ---- | --------- | ------- | ---- | --------- | ----------------- |
| vanilla-sponge | Vanilla Cloud  | flour 200, caster 180, butter 175, milk 30   | 3    | 3         | 24      | 3    | 0.3       | classic (neutral) |
| cocoa-sponge   | Midnight Cocoa | flour 170, cocoa 40, caster 180, butter 175  | 3    | 3         | 26      | 3    | 0.35      | bold, edgy        |
| lemon-sponge   | Sunny Lemon    | flour 200, caster 180, butter 175, zest 12   | 3    | 3         | 24      | 3    | 0.3       | playful, casual   |
| honey-sponge   | Honeycomb Gold | flour 200, honey 120, caster 60, butter 175  | 3    | 2         | 30      | 3    | 0.4       | classic, romantic |
| shortcrust     | Crumbly Crust  | flour 220, butter 110, icing 50, milk 30     | 1    | 4         | 18      | 2    | 0.7       | classic, elegant  |
| biscuit-dough  | Snap Biscuit   | flour 300, butter 200, caster 100, vanilla 5 | 1    | 2         | 12      | 2    | 0.8       | playful, classic  |

**Fillings (3, one jar per unit):** `raspberry-jam` (6; romantic, playful), `vanilla-cream` (7; classic, dreamy), `honey-cream` (8; classic, romantic).

### 4.3 Products (5)

| id            | name                      | mixes allowed (batches) | stack              | frosted units  | filling            | tags              |
| ------------- | ------------------------- | ----------------------- | ------------------ | -------------- | ------------------ | ----------------- |
| cupcake-tray  | Cupcake Tray (6)          | any sponge (1)          | auto, 6 cups       | 1              | optional (centres) | playful           |
| layer-cake    | Two-Layer Cake            | any sponge (1)          | drag, 2 layers     | 1              | required           | classic           |
| two-tier-cake | Two-Tier Celebration Cake | sponge per tier (2)     | drag, 2 tiers      | 2              | 2 required         | elegant, regal    |
| fruit-tart    | Glazed Fruit Tart         | shortcrust (1)          | auto, 1 case       | 0              | vanilla-cream      | elegant, romantic |
| iced-biscuits | Iced Biscuit Set (6)      | biscuit-dough (1)       | auto, 6 tray spots | 1 (icing only) | none               | playful, casual   |

**Piping patterns (`pipePattern`, 2 per product; the player picks one at design):**

| product       | pattern A                                                        | pattern B                                                    |
| ------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| cupcake-tray  | 3 swirls (open spiral, 8 cm)                                     | 3 rosettes (closed petal ring, r 3)                          |
| layer-cake    | top scallop ring (closed, r 9) + base bead border (closed, r 11) | top rope ring (closed, r 9) + base dot border (closed, r 11) |
| two-tier-cake | 2 scallop borders (closed) + swag garland (open wave)            | 2 bead borders (closed) + drop-loop garland (open)           |
| fruit-tart    | rosette ring (closed) + glaze zigzag (open)                      | shell ring (closed) + glaze wave (open)                      |
| iced-biscuits | 4 outlines: star, heart, flower, round (closed)                  | 4 outlines: moon, leaf, ball, round (closed)                 |

On the cupcake tray the other 3 cupcakes copy the best piped one; on the biscuit set the other 2 biscuits copy the best two. Copies show the result but are not scored separately.

The bake's tags are the product's tags, plus each mix's, filling's and topping's tags.

### 4.4 Toppings (9)

| id              | name                      | price | tags              |
| --------------- | ------------------------- | ----- | ----------------- |
| sprinkles       | Rainbow Sprinkles (pinch) | 3     | playful           |
| sugar-rose      | Sugar Rose                | 4     | romantic, elegant |
| fresh-berries   | Fresh Berry               | 2     | romantic, casual  |
| party-candle    | Party Candle (unlit)      | 1     | playful           |
| choc-curls      | Chocolate Curls           | 3     | bold, edgy        |
| sugar-pearls    | Sugar Pearls              | 3     | elegant, regal    |
| wafer-butterfly | Wafer Butterfly           | 3     | dreamy            |
| gold-star       | Gold Sugar Star           | 4     | regal, bold       |
| team-ball       | Sugar Team Ball           | 3     | sporty            |

Every style tag is reachable: elegant through fruit-tart, two-tier, shortcrust, sugar-rose and sugar-pearls; regal through two-tier, sugar-pearls and gold-star; dreamy through vanilla-cream and wafer-butterfly; bold and edgy through cocoa-sponge, choc-curls and gold-star; romantic, playful, casual, classic and sporty as listed. Any hot tag can be met.

### 4.5 Clients (8; 2 trait-gated)

Briefs are varied by seeded RNG, as in ADEEVA's `rollClientBrief` (budget, fee, deadline, 2 of the favoured colours).

| id             | name, relation                               | gate / min rep  | products                    | required tags                      | favoured colours     | avoid                | required toppings           | budget | fee    | days | min Q |
| -------------- | -------------------------------------------- | --------------- | --------------------------- | ---------------------------------- | -------------------- | -------------------- | --------------------------- | ------ | ------ | ---- | ----- |
| pip            | Pip's dad, for Pip's 7th birthday (upstairs) | — / 0           | cupcake-tray                | playful                            | sky, blush, mustard  | colour charcoal      | sprinkles×1, party-candle×1 | 20–30  | 35–45  | 3–5  | 50    |
| coach-dani     | Coach Dani, under-10s football               | — / 0           | iced-biscuits               | sporty                             | emerald, navy, ivory | colour ruby          | team-ball×2                 | 20–30  | 35–50  | 3–5  | 52    |
| grandpa-tomasz | Grandpa Tomasz, retired postman              | — / 0           | layer-cake                  | classic, romantic                  | ivory, rose, gold    | flavour lemon-sponge | sugar-rose×2                | 30–45  | 45–60  | 4–6  | 55    |
| mrs-adeyemi    | Mrs. Adeyemi, choir leader                   | — / 4           | fruit-tart                  | elegant                            | ruby, blush, ivory   | colour black         | fresh-berries×8             | 35–50  | 55–75  | 4–6  | 62    |
| ms-farrow      | Ms. Farrow, poetry-club librarian            | — / 8           | cupcake-tray                | dreamy                             | lavender, sky, ivory | colour mustard       | wafer-butterfly×3           | 35–50  | 70–90  | 5–7  | 66    |
| rosa-mateo     | Rosa & Mateo, cousins graduating             | — / 12          | two-tier-cake               | elegant, bold                      | navy, gold, emerald  | colour blush         | gold-star×3, sugar-pearls×1 | 70–90  | 95–120 | 5–7  | 74    |
| saffi          | Saffi, owner of the Paper Lantern Café       | Trendsetter / 6 | cupcake-tray, iced-biscuits | this week's first hot tag          | any 2 of 16 (rolled) | —                    | —                           | 25–40  | 70–90  | 3–5  | 64    |
| mr-bramwell    | Mr. Bramwell, quiet neighbour at No. 9       | Charmer / 5     | layer-cake                  | classic; **requires** honey-sponge | sage, mustard, ivory | —                    | —                           | 25–40  | 80–100 | 4–6  | 60    |

Flavour requirements and avoids are taste preferences only, never allergies or diets. The brief gains `requiredMixes`/`avoidMixes`, which the style criterion checks. Pip's order is placed and paid by his dad; the request and thank-you lines are Pip's.

| client         | request                                                                | delighted                                                                | nearMiss                                                      |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| pip            | It's my birthday! Can my cupcakes have sprinkles AND a candle?         | They're the best cupcakes in the whole universe!                         | I love them! One swirl went a bit wiggly.                     |
| coach-dani     | Biscuits for the team party, please. Sporty, and no red.               | The team cheered louder for these than for the goal!                     | Great biscuits! A few outlines wandered off the edge.         |
| grandpa-tomasz | Fifty years married on Sunday. Something classic, with two roses.      | Just like the cake at our wedding. Thank you.                            | It's lovely. The border's a touch uneven, but the love shows. |
| mrs-adeyemi    | A tart for the choir's last practice. Elegant, lots of berries.        | The choir sang a thank-you song. It was for you!                         | Beautiful fruit. The crust could be a shade more golden.      |
| ms-farrow      | Our poetry club meets Friday. Something dreamy, like a cloud.          | It's a poem you can eat. I'm speechless.                                 | Charming! A few swirls went a little wobbly.                  |
| rosa-mateo     | We both graduate on the same day! Elegant but bold, gold stars please. | Our photos are going to be amazing!                                      | So close! The top tier's border needs a steadier hand.        |
| saffi          | My café's menu changes every week. Bake me whatever's in right now.    | Sold out by lunch. You read the town perfectly.                          | Nice bake! It's just not quite this week's vibe.              |
| mr-bramwell    | ...Honey cake. Like my mother made. If you've time.                    | ...That's exactly it. I'll bring her old recipe tin to the street party. | Kind of you. Not quite hers, but kind of you.                 |

Day 1: the first offer is drawn from `[pip, coach-dani]` only (always Pip when the first order guide is on).

### 4.6 Upgrades (4; one-time; reputation-gated)

| id              | name            | price | min rep | effect                                        |
| --------------- | --------------- | ----- | ------- | --------------------------------------------- |
| bright-scale    | Bright Scale    | 60    | 3       | weigh band ×1.2                               |
| display-counter | Display Counter | 100   | 5       | counter holds 4 trays and shows 8 order cards |
| oven-lamp       | Oven Lamp       | 90    | 7       | bake window ×1.2                              |
| piping-set      | Pro Piping Set  | 120   | 11      | pipe tolerance ×1.15                          |

### 4.7 Story beats (9)

Player lines are voiced by trait through ADEEVA's `storyVoice`: each **You** line in a shared beat has a `byTrait` variant (below). Trait beats play only for their own trait, so their **You** lines are already in that voice.

| id                     | trigger                     | lines                                                                                                                                                            |
| ---------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pa-intro               | intro                       | **Otti:** "Forty years I opened this door at six. Your turn now." / **Otti:** "The oven's old but honest. Watch the colour, not the clock." / **You:** (byTrait) |
| pa-first-delivery      | first-delivery              | **Narrator:** Through the window you see your bake carried down the street like treasure. / **You:** (byTrait)                                                   |
| pa-first-counter       | first-counter-day           | **Otti:** "Counter Day. Trays out, boxes ready, smile on." / **Otti:** "Whatever's left goes to the neighbours. Nothing wasted." / **You:** (byTrait)            |
| pa-first-week          | first-week                  | **Otti:** "Rent day. Every shop on Larkspur pays it." / **Otti:** "Short on coins? The café always needs a tray washer." / **You:** (byTrait)                    |
| pa-bankrupt            | bankrupt (Challenging only) | **Narrator:** "Rent paid. The coin jar is empty." / **You:** (byTrait)                                                                                           |
| pa-trait-dreamer       | trait-dreamer               | **Narrator:** "Sugar Clouds." You sketch a cake with a sky inside it. / **Otti:** "Only a dreamer bakes weather. Keep going."                                    |
| pa-trait-perfectionist | trait-perfectionist         | **Narrator:** "To the Gram." / **Otti:** "You let go of the scoop just early enough. Who taught you that?" / **You:** "Nobody. I just watched the needle."       |
| pa-trait-trendsetter   | trait-trendsetter           | **Narrator:** "Menu Board." Saffi peers in. / **Saffi:** "You always know what the town wants next. Let's work together."                                        |
| pa-trait-charmer       | trait-charmer               | **Narrator:** "Number Nine." / **Mr. Bramwell:** "...You wave at everyone. Even me." / **You:** "Especially you. The whole street's glad you're here."           |

| beat              | default                                     | Dreamer                                                     | Perfectionist                             | Trendsetter                                     | Charmer                                            |
| ----------------- | ------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| pa-intro          | "I'll keep the bell on the door ringing."   | "I'll fill that window with cakes nobody's dreamed of yet." | "I'll learn this oven to the minute."     | "Larkspur Street won't know what hit it."       | "I'll keep the bell ringing and learn every name." |
| pa-first-delivery | "I made that!"                              | "It looked like a cloud floating down the street!"          | "I made that. Every gram of it."          | "Everyone on the street saw that box."          | "I made that! I hope they share it."               |
| pa-first-counter  | "Then everyone wins."                       | "Then every tray is a little gift."                         | "Then I'll count exactly what they love." | "Then I'll see what the street picks first."    | "Then everyone wins. I'll wrap them nicely."       |
| pa-first-week     | "Good to know. Back to the oven."           | "Good to know. Now, back to my sketches."                   | "Noted. I'll plan next week to the hour." | "Good to know. Next week's menu is in my head." | "Good to know. I'll say hi to the café team."      |
| pa-bankrupt       | "A few café shifts, then back to the oven." | "I'll doodle cakes on the café napkins."                    | "A plan, a few shifts, and we're steady." | "Every great bakery has a comeback week."       | "Shifts mean new regulars. I can work with that."  |

There is no game over.

## 5. Evaluation, rewards and economy

**Quality** (0–100): `round(100 × (0.25·weigh + 0.15·stir + 0.25·bake + 0.30·pipe + 0.05·flavourFit))`. Each term averages the run's ingredients, bowls, bakes and paths; an unfinished path counts as 0, as in ADEEVA's `dressQuality`. `flavourFit` reuses ADEEVA's `materialFit` rule: the share of mixes whose tags meet the brief's tags or are neutral (`classic`). Counter trays use `0.35·weigh + 0.25·stir + 0.40·bake`.

**Criteria** (ADEEVA's criterion shape and weights, with one renamed id):

| Criterion    | Weight | Pass rule                                                                                           | kindFeedback on a miss                                       |
| ------------ | ------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| construction | 3      | All batches weighed, stirred and baked, everything stacked and filled, every path piped. Mandatory. | (ADEEVA line)                                                |
| quality      | 2      | Quality ≥ brief minimum.                                                                            | (ADEEVA line)                                                |
| style        | 2      | Every required tag present; required mixes used; no avoided mix.                                    | (ADEEVA line) plus "This one hoped for a different flavour." |
| colours      | 1      | No avoided icing colour.                                                                            | (ADEEVA line)                                                |
| toppings     | 1      | Required counts met.                                                                                | "So close! A few more toppings were on the order."           |
| budget       | 1      | Value used (below) ≤ budget.                                                                        | (ADEEVA line)                                                |
| deadline     | 1      | Delivered by the deadline day.                                                                      | (ADEEVA line)                                                |

**Value used** (`bakeSpend`, new; it replaces ADEEVA's `runSpend` for this game): for each ingredient, `grams used × pack price ÷ pack grams` (eggs at 1 each); gel at 0.5 per colour; filling jars and toppings at full price. This reads as "you used 18 coins of ingredients", so leftovers already in the pantry are never charged twice and buying a whole pack never fails a budget by itself.

**Score and pass gate differ from ADEEVA.** Score weights are `{passMix: 0.25, quality: 0.75}`, the favoured-colour bonus is 1 per colour (max 3), and criterion id `toppings` replaces `trims`, also in `PASS_GATE`. These become per-game parameters of the engine's `evaluate`; ADEEVA keeps its own `{0.5, 0.5}`, bonus 3 (max 9) and `trims`. So **score** = `clamp(round(0.25·passMix + 0.75·quality + colourBonus), 0, 100)`. Stars use ADEEVA's `starsForScore` (90/75/55/35). The pass gate is construction, style, toppings and quality.

**Rewards** (ADEEVA's `rewards` rules and constants):

- **Pass:** `fee × (0.8 + 0.4·score/100)`, plus trait lines, reputation `1 + round(2·score/100)` and buzz `1 + stars + 3 per trend match`. A trend match adds +10% of the fee.
- **Standard soft fail:** 40% of the fee, reputation −1 (0 for Charmer), and kind feedback from the failed criteria.
- **Relaxed:** every run counts as a pass; stars still reflect quality. Rent ×0.
- **Challenging:** min quality +6; a fail pays 0 with reputation −3; late delivery costs 50% of the fee; rent ×1.5 (105).
- **Coins below zero (Standard and Challenging):** rent may push coins below 0. Buying is then blocked, and the pantry shows "Work a shift to refill the coin jar." Starter-pantry leftovers and shifts always allow a way back.

**Traits** (game-flavoured perk text over ADEEVA's mechanics):

| Trait         | Perk text                                                                           | Mechanic                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Dreamer       | "Sugar clouds: +15% fee when a bake uses 3+ icing colours or feels dreamy or bold." | ADEEVA Dreamer flair                                                                                        |
| Perfectionist | "Steady hands: weighing, stirring, oven timing and piping are all more forgiving."  | ×1.2 on the weigh band, stir band, bake window and pipe tolerance                                           |
| Trendsetter   | "You know what the town's craving: see next week's favourites early."               | +10% fee per trend match; next week's hot tags show as a "Soon" ribbon on mixes and toppings; unlocks Saffi |
| Charmer       | "Friendly counter: a 10% tip on happy orders, and a little extra per box."          | Charmer tip; no reputation loss on a near miss; +1 coin per box on Counter Day; unlocks Mr. Bramwell        |

**Town favourites** reuse ADEEVA's `trendMarket` (2 hot tags per week, from the shared 10).

**Bake Book:** each delivered order appends `{day, clientId, productId, mixIds, fillingId, colours, patternId, toppings (poses), stars, line}` to the save (the newest 30 are kept). The hub's Bake Book renders each entry with `BakePreview` and `PlacedLayer` as an SVG card with the client's delighted or nearMiss line and stars. It stores no pictures and leaves the device in no way.

**Economy:** day of 10 h; start 80 coins plus the starter pantry; rent 70 when Counter Day ends. Shift: "Washing trays at the café" pays 30 coins for a whole untouched baking day, on every difficulty. Offers come from `offerCountForBuzz` (1–3 a day, 4 pending at most, 2-day lifetime); active orders are capped by `MAX_ACTIVE_GIGS`.

**Sanity checks (Standard):**

- **Day 1 is affordable:** Pip's vanilla sponge (≈ 8.9) and buttercream (4.0) come from the starter pantry; with sprinkles 3, candle 1 and 2 gels at 0.5, value used ≈ 18 against a budget of 20–30. Cash spent is 2 gel pots 10 + sprinkles 3 + candle 1 = 14 of 80. Coach Dani's biscuit dough (≈ 8.0) plus icing (2), team-ball×2 (6) and gels (1) comes to ≈ 17 against 20–30. Those two orders use exactly the starter's 500 g of icing sugar.
- **Value used per client** (fresh pantry): Grandpa ≈ 28–29 (budget 30–45), Mrs. Adeyemi ≈ 29 (35–50), Ms. Farrow ≈ 9 + 4 + 7 + 9 + 1 ≈ 30 (35–50), Rosa & Mateo ≈ 54–61 depending on mixes and fillings (70–90), Saffi ≈ 20–24 (25–40), Mr. Bramwell ≈ 21–23 (25–40). Every brief fits at its lowest budget, with 2–16 coins of headroom for extra toppings.
- **Decent player:** weigh 0.90, stir 0.88, bake 0.88, pipe 0.82, fit 1 → quality ≈ 87. That clears every minimum (50–74) with a margin; most of the failure risk is a missed oven window or a style or topping slip.
- **Full assist:** 0.8 on every step, fit 1 → quality 81. It passes everyone except a Challenging Rosa & Mateo (74 + 6 = 80, marginal). Stars separate: assist with 2 favoured colours scores 25 + 60.75 + 2 ≈ 88 (4★), and decent play ≈ 92 (5★).
- **Week 1:** buzz stays under 34, so offers stay at 1 a day and about 4 orders fit (starter fees ≈ 45, pay ≈ 45 × 1.17 ≈ 52, value used ≈ 20, net ≈ +32 each, so ≈ +128). One 10-hour day makes 2 counter trays (12 items, ≈ 26 in ingredients); boxing about 10 of them at 6 coins pays ≈ 60, net ≈ +34. Week 1 ends at about 80 + 128 + 34 − 70 ≈ 170 coins. Bright Scale (60) becomes affordable after the first pass, at reputation 3.
  - A struggling player with 2 soft fails (0.4 × 45 − 20 ≈ −2 each), 1 pass and 1 shift ends week 1 at about 80 − 4 + 32 + 30 − 70 = 68 coins.
  - 4 soft fails leave about 2 coins; one more bad week goes below 0, and the coin-jar rule above points to the shift.
- **Reputation pace:** a decent pass gives +3, so Ms. Farrow (8) opens around order 3 and Rosa & Mateo (12) in week 2.

## 6. Screens and art direction

**Screens:**

- **Title** (studio-wide) → **New Game** (avatar pre-filled from the studio profile, then trait and difficulty) → **pa-intro**.
- **Bakery Hub:** calendar, hours, coins, reputation, buzz, the "Town favourites" board, an order board of pinned order cards, active orders, a pantry peek, counter trays, upgrades, Bake Book, End Day, Shift, Save and Back to Studio.
- **Design:** product cards, then a builder for mix (with its heat dots), filling, icing colours and pattern A or B, with a live `BakePreview` on a cake stand.
- **Pantry:** wooden shelves of packs, each with a price and a "need" badge; a shopping list beside them.
- **Bench:** Scoop & Weigh (dial scale and bowl), then Stir (top-down bowl with a speed gauge), on the same marble bench.
- **Oven:** a cutaway oven with a 5-dot heat dial, a window, Turn tray and Take out buttons.
- **Decorating table:** Stack (with the Fill tap) and Pipe on a turntable, then Toppings from a tray.
- **Results:** the bake in a ribboned box with the lid lifting, the criteria list, stars and reward lines.
- **Bake Book:** a scrapbook grid of bake cards; tapping one shows it large with its line and stars.
- **Counter Day:** a glass counter with trays, the street through the shop window with the sun crossing it, and a row of order cards with open boxes. No people are drawn on this screen.

**Art direction (distinct from ADEEVA, same tokens):**

- **Palette:** ADEEVA's ink, cream, shadow, radius and focus tokens, plus a game accent set in `games/patisserie/ui/theme.css`: buttercream `#fff1cf`, pistachio `#a9c98b`, cocoa `#6b4232`, blueberry `#4b5aa6`, apricot `#f4a259`. Rose is kept out of the accents, so the game never reads as ADEEVA.
- **Motifs:** scalloped doily card edges, white subway-tile backdrops, pedestal cake stands, a copper-pan rail, ribbon-tied boxes and a crescent-moon-and-star shop sign (Crumb & Comet).
- **Fonts:** display `"Bookman Old Style", "Georgia", serif` (system fonts only, as in ADEEVA); body `system-ui`.
- **Original SVG scenes:** `BakeryBackdrop` (shopfront with a striped-tile floor and a window onto Larkspur Street); `PantryShelf`; `DialScale`; `MixingBowl` (streaky-to-smooth gradient, splash, speed gauge); `OvenCutaway` (rise, tray turn and five colour stops); `Turntable` with `PipingPath`; `BakePreview` (one silhouette per product, 5 in all, filled with mix and icing colours, with `ToppingLayer` on top); `ToppingArt` (9 icons); `CounterScene` with `OrderCard` and `OrderBox`; `BakeBookCard`.
- Motion respects `prefers-reduced-motion`: the rise becomes a colour bar, the sun becomes a shrinking bar, and ribbons appear without the tying animation.

## 7. Reuse map

**Engine (`src/engine`, per the studio contract):** `rng`, `rngDraw` (`drawDistinct`, `drawInt`); `week`, `dayHours`, the calendar `endDay` skeleton, `weeklyBill` and `workShift`; `standing` (coins, reputation, buzz); offers (`offerCountForBuzz`, `clientIsEligible`, `rollOffers` skeleton, `MAX_PENDING_OFFERS`, `OFFER_LIFETIME_DAYS`); difficulty rules; `storyQueue` and `storyVoice` (with `byTrait`), generic over a per-game trigger union (adds `first-counter-day`); `criterion` shape, `starsForScore`, the `evaluate` judge pattern with per-game score weights, colour bonus and pass gate, and `kindFeedback` tone; `rewards` per difficulty; `trendMarket`; `traceAccuracy` and `distanceToOutline` (plus the new `closed` flag); save envelope and migrations; `actionCheck`; `checklist`.

**ADEEVA modules reused directly (they move to `src/engine/` root, not `engine/textile/`, because Patisserie is a non-textile user):**

- Content: `styleTag`, `colour`, `difficulty`, `trait` (names only).
- Core: the `sewing` `recordSeam` validation, generalised to `recordFollow` with per-unit tick bounds (Stir uses 40–1200 per lap); the `seamAccuracy` cap pattern (`ASSIST_SEW_ACCURACY_CAP`, `ASSIST_SEW_WIDENING`); the `cutTolerance`/`sewBand` multiplier pattern as pure functions; `decoration` (pose, `MIN/MAX_DECORATION_SCALE`, add/move/remove rules parameterised by canvas size); `assembly` (`assignSlot`, `slotAssignmentIssue`, generic over a slot union); `cutCommit` idempotency, reused for bake commits; `stageNavigation`, `stageReadiness`, `hourCost` and `delivery` (`canDeliver`, `lastResult`) as patterns; the `materialFit` rule, reused as `flavourFit`. `seamLine` is not used by this game.
- UI: the hold-and-tick loop of `SewingStage` (60 ticks a second, record on release and on unmount, re-sync to stored counts) is extracted as a shared `useTickLoop` hook used by `MixingBowl`. The `TrimLayer` pattern becomes a generic `PlacedLayer` used by `ToppingLayer` and `BakeBookCard`. `Avatar`, `ColourSwatch` and all of `ui/kit` are reused.

**New code (`src/games/patisserie`):**

- `content/`: `ingredient`, `mix`, `filling`, `product`, `pipePattern`, `topping`, `client`, `upgrade`, `storyBeat`, `career`.
- `core/`: `pantry` (packs, stock, buy, consume, shopping list); `weigh` (flow ramp, settle, stock cap, `weighAccuracy`, tidy factor, record validation); `stir` (speed band, adapter onto `recordFollow`); `oven` (`doneTime`, colour stop, turn, auto-remove, `bakeAccuracy`, idempotent commit); `pipe` (`coverage`, `pipeAccuracy`); `stack` (slots and fill); `bakeSpend`; `bakeQuality`, `bakeEvaluate`; `boxItUp` (stock, seeded cards, box validation, pay); `bakeBook`; `bakeRun`, `reduce`, `gameState`, `save`, `reputationOf`.
- `ui/`: Bakery Hub, Design, Pantry, Bench (Weigh, Stir), Oven, Decorating table (Stack, Pipe, Toppings), Results, Bake Book and Counter Day screens, plus the art in §6, and the first order guide bubbles.
- `module.ts`, unit tests per core file (weigh band edges, tidy factor on piece ingredients, flow ramp and stock cap, stir speed band per stiffness and tick bounds, oven colour stops, turn window, auto-remove and windows per difficulty, pipe coverage on open and closed paths, Box It Up card draws and pay, the Saffi hot-tag brief, coins below zero) and `e2e/patisserie.spec.ts`, covering a full guided Day-1 Pip order through to the Bake Book, a counter tray boxed on Counter Day, and save/reload mid-bake.

## 8. Safety notes for this theme

- **No real recipes or kitchen instructions.** Amounts and heat dots are game numbers. The oven uses 1–5 heat dots, never °C, °F or gas marks, and there are no method cards or "how to bake at home" steps. The only real-world line is: "Real ovens, mixers and knives: ask an adult first."
- **No diet or body talk.** There are no calories, sugar counts, "healthy/unhealthy", "treat yourself", "guilt-free" or "cheat day" lines. No one comments on eating, weight or bodies. Customers are not drawn on Counter Day, and no person is ever scored.
- **No allergy or medical framing.** Avoided flavours are personal taste ("not a fan of lemon"), never allergies, intolerances or diets, so the game never implies that food is safe for anyone.
- **No fire play.** Party candles are always shown unlit, and flames never appear. The oven glows but there is no smoke, burning or alarm; an over-baked result is "toasty".
- **Safe adult characters.** No adult invites the player anywhere private or asks for a secret. Adult clients speak about their own events, and kindness lines point to the whole street.
- **No waste shame or pressure.** Leftovers are shared with neighbours. Box It Up has no fail state, no lost coins, no one waiting and no one leaving, and it pauses when the tab is hidden.
- **Original, not imitative.** No real brands or chocolate makers. No TV baking-competition terms or formats (no judges, eliminations or named rounds). Box It Up avoids customer queues, per-customer patience timers, customers walking out, order-ticket rails and tip ratings, which are the core of existing bakery and diner time-management games. Before shipping, check that "Crumb & Comet" and "Paper Lantern Café" are not real trading names.
- **Coins only.** No real currency symbols, no prices in real money, and nothing to buy. There are no ads, no chat and no network. Offer and card randomness is seeded and free, with no rerolls. The Bake Book stays in the local save.

## 9. Out of scope for this slice

- A second career (a café or wedding-cake studio), a hired assistant and any show or competition mode.
- Bread, savoury bakes, choux, frozen desserts, sugar-work and chocolate tempering; more than 2 batches per order; three-tier cakes.
- Rebaking a batch, free-hand piping or lettering, and photo import.
- More products, mixes, fillings or patterns than listed; seasonal events; ingredient spoilage or expiry dates.
- Trait-gated clients for Dreamer and Perfectionist (each has a story beat only).
- Image export or printing of Bake Book cards, real recipes, printable recipe cards, real temperatures and any online sharing or leaderboards.
