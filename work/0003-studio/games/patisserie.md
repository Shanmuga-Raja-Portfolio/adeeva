# Patisserie Atelier — Game Design (id: `patisserie`)

A Maker Studio game (`work/0003-studio/design.md`). §1–§9 describe the Corner Baker slice as built (about a third of ADEEVA's depth); §10 is the Phase B depth design that takes it to ADEEVA's depth with a second career, the Salon Pâtissier, and the Larkspur Patisserie Fair. You take over a small corner bakery, **Crumb & Comet** on Larkspur Street, from **Otti, the retired baker who hands you the keys**. Neighbours bring cake and pastry orders. For each order you design the bake, weigh, stir, bake, pipe and top it, then deliver it. On the seventh day of each week you open the counter and box up treats. Every delivered bake goes into your **Bake Book**, a gallery you can show off. All names, text, amounts and art are original. The safety promise from the studio contract applies to every screen.

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

**Careers:** _Corner Baker_ (this section) and _Salon Pâtissier_ (§10), in the same save. Corner Baker at Crumb & Comet starts with: 80 coins, reputation 0, a starter pantry (2 flour, 2 caster sugar, 1 icing sugar, 2 butter, 1 milk, 2 egg boxes, 1 vanilla), weekly rent 70.

**Hub loop:** check the order board → start an order or a counter tray → bake it through to the box → end the day. Days 1–6 of each week are baking days; day 7 is **Counter Day** (§3.6): a finished bake can still be delivered and the pantry is open, but no new bake starts, no step moves forward and no shift happens that day. Rent is charged when Counter Day ends.

**First order guide:** on Relaxed, the Day-1 offer is Pip's order with a guide on: one hint bubble per stage (the §3.7 line for that screen), dismissed with one tap. A hub toggle turns the guide off.

**`BakeRun.stage`** = `brief → design → pantry → weigh → mix → bake → stack → pipe → decorate → review → done`

| #   | Stage    | Hours                                        | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | brief    | 0                                            | Order card: product(s) allowed, required tags, required or avoided flavour, favoured and avoided colours, required toppings, budget, fee, deadline and minimum quality. The live checklist (ADEEVA `checklist`) stays visible afterwards. Skipped for counter trays.                                                                                                                                                                                                                                                                                                                              |
| 2   | design   | 1                                            | Pick a product (§4.3), a mix per batch, a filling, icing colours (1–3 from the shared 16) and one of the product's 2 piping patterns (§4.3). Each mix card shows its ideal heat ("Oven: ● ● ● ○ ○"). `BakePreview` shows the bake on a stand.                                                                                                                                                                                                                                                                                                                                                     |
| 3   | pantry   | 1 per shopping trip (0 if nothing is needed) | Shelves show packs, gel pots, filling jars and toppings. The shopping list covers everything the design needs: weighed ingredients, eggs, the butter and icing sugar for buttercream or icing (§4.1), gels, filling jars and the toppings the order asks for. Missing amounts are highlighted and the basket starts filled with them. Several items can be bought in one trip, and coins are checked atomically. The first purchase in this step costs the hour; a **Quick pantry trip** dialog (1 h per purchase) is also open from the weigh (when a bag runs empty), stack and toppings steps. |
| 4   | weigh    | 1 (2 for the two-tier cake)                  | Scoop & Weigh, 4 ingredients per batch (§3.1). Each egg is tapped to crack (counted, not scored). **Into the bowl** commits the batch and uses the grams actually poured.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 5   | mix      | 1                                            | Stir, one bowl per batch (§3.2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 6   | bake     | 2 (3 for the two-tier cake)                  | Oven, one bake per batch (§3.3). The two tiers bake one after another inside the 3 h. The bake commit is idempotent per run and batch.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 7   | stack    | 0                                            | Layer and two-tier cakes: drag layers or tiers onto the stand's slots, using ADEEVA's `assignSlot`/`slotAssignmentIssue` pattern; wrong slots are refused with a reason. Cupcakes, biscuits and the tart case place themselves. The filling goes in with one **Fill** tap here: between layers, between tiers, into the tart case or into the cupcake centres. Not scored.                                                                                                                                                                                                                        |
| 8   | pipe     | 2                                            | Pipe 2–4 icing paths (§3.4).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 9   | decorate | 1                                            | Place toppings (§3.5).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 10  | review   | 0                                            | The finished bake on a doily with the checklist. **Deliver the box** evaluates once and rewards once, adds the bake to the Bake Book and opens Results; a tray goes onto the counter instead.                                                                                                                                                                                                                                                                                                                                                                                                     |

Order hours for the §10.7 products, available in both careers by reputation gate, follow the same per-stage formula (weigh and bake +1 per extra batch): petits fours 8, tartlet set 8, spiral roll 8, biscuit wreath 10, three-tier cake 12 (11 with "Bake them together", §10.4).

A one-batch order costs 8 h plus an optional pantry trip, so it fits in a 10-hour day. The two-tier cake costs 10 h and usually runs into a second day. The design step can be revisited until the first batch goes into the bowl, and the pantry step until the first bake goes into the oven (ADEEVA `stageNavigation`/`canGoBack` pattern).

**Counter trays** (6 cupcakes or 6 iced biscuits) run `design → pantry → weigh → mix → bake → review`: design 1 + weigh 1 + mix 1 + bake 2 = **5 h** plus pantry. They get a free auto swirl or auto outline in one chosen icing colour, with no toppings. Their quality uses `0.35·weigh + 0.25·stir + 0.40·bake`. Trays earn coins only on Counter Day; they give no reputation or buzz.

## 3. Hands-on mini-games

Input uses Pointer Events (mouse and touch) and the keyboard controls listed for each mini-game below; nothing depends on hover. Every handle, button, ingredient tile, item and topping is at least 44×44 px, and piping paths are drawn at least 12 px wide. Scoring lives in core: the UI runs the animation loop and sends counts or samples, and core validates them. Tolerances multiply as **base × trait × upgrade × difficulty**. Difficulty uses ADEEVA `content/difficulty` `toleranceMultiplier` (Relaxed 1.3, Standard 1, Challenging 0.85). Perfectionist is ×1.2 on every tolerance below (ADEEVA `PERFECTIONIST_TOLERANCE_MULTIPLIER`). **Assist caps a step's accuracy at 0.8 on every mini-game**, matching ADEEVA's `ASSIST_CUT_ACCURACY` and `ASSIST_SEW_ACCURACY_CAP`.

The four mini-games use four different skills: **Weigh** is stop-at-the-right-amount, **Stir** is keep-a-steady-speed, **Oven** is read-and-time with two decisions, and **Pipe** is follow-a-line.

### 3.1 Scoop & Weigh (new)

- **Input:** the target shows as a green zone on a big dial scale. For **pour** ingredients, press and hold the scoop over the bowl to pour. Flow starts at 0.08 × target per second; after 1.5 s of holding it ramps linearly to 0.6 × target per second over 0.5 s. Releasing stops the flow, and **each new press restarts at the slow flow**. After release the scale keeps going: `settle = flowAtRelease × (0.10 + 0.25 × pourDifficulty)` seconds of flow are added. **Piece** ingredients (butter slices of 25 g, vanilla drops of 1 g) are tapped in one at a time. A **Scoop back** button (48 px) removes 0.1 × target per tap.
- **Stock cap:** poured grams stop at `min(3 × target, pantry stock)`. If the stock runs out first, the pour stops with "The bag is empty! Buy more in the pantry." and Back to pantry is offered.
- **Scored per ingredient:** `e = |grams − target| ÷ target`; `band = 0.05 × trait × upgrade (Bright Scale 1.2) × difficulty`. `weighAccuracy = 1` if `e ≤ band`, else `max(0, 1 − (e − band) ÷ (3 × band))`. A tidy-scale factor then multiplies it: `minActions = 1` for pour and `ceil(target ÷ pieceSize)` for piece; `extra = actions − minActions`; factor `= max(0.6, 1 − 0.04 × max(0, extra − 2))`, where actions counts pours, taps and scoop-backs. So 7 taps of butter for 175 g, or one pour plus two fixes, costs nothing. On Standard, 186 g against 180 g (3.3%) scores 1.0, and 198 g (10%) scores 0.67.
- **Record and checks:** `{ingredientId, grams, actions, assisted}`. Grams and actions are whole numbers with `0 ≤ grams ≤ min(3 × target, stock)` and `1 ≤ actions ≤ 40`; core rejects anything else. Committing a batch consumes the grams actually poured from the pantry.
- **Assist** ("Scale helper"): a stop line appears, and the pour stops by itself so the settle lands on the target. Accuracy is capped at 0.8.
- **Keyboard:** holding Space or Enter on the pour button pours; piece ingredients are added with one press each.
- **Fun at 8 and at 15:** at 8, pouring flour clouds and dropping in butter with a plop. At 15, judging the settle on honey and icing sugar and landing it in one pour.

### 3.2 Stir (new UI; tick loop and record shared with ADEEVA's sewing)

- **Input:** a top-down bowl. Hold and circle the spoon round the bowl at any radius. A small speed gauge on the bowl rim shows the spoon's speed, with its green arc drawn at the true band width. Sponges take 3 laps and pastries take 2; directions alternate, shown by an arrow. The mix visibly turns from streaky to smooth. Too fast throws a harmless splash onto the bench (wiped off by itself); too slow leaves the mix streaky.
- **Scored:** at 60 ticks per second while the pointer is down and the spoon moves at ≥ 0.5 rad/s in this lap's direction (moving the wrong way neither counts nor progresses), a tick counts as inside when the spoon's angular speed is in the green band: `|ω − 3.5| ≤ halfWidth`, with `halfWidth = 1.0 × (1 − 0.4 × stiffness) × trait × difficulty` rad/s (stiffness §4.2). The base band is 2.5–4.5 rad/s; on Standard it is about ±0.88 for sponges and ±0.68 for biscuit dough. The spoon trails the finger and never exceeds 9 rad/s. `stirAccuracy = insideTicks ÷ ticks`.
- **Record and checks:** `{batchId, progress, ticks, insideTicks, assisted}` through the shared `recordFollow` (generalised from ADEEVA's `recordSeam`). Counts are whole numbers and only grow, `insideTicks ≤ ticks`, and progress (laps) moves strictly forward. Each lap's ticks must be at least 40 and at most 1200; the 9 rad/s spoon cap and the 0.5 rad/s floor keep honest play inside these bounds. Resuming continues the stored counts.
- **Assist** ("Steady spoon"): the band widens ×1.6 (ADEEVA `ASSIST_SEW_WIDENING`) and accuracy is capped at 0.8.
- **Keyboard:** holding the right or left arrow key on the focused bowl stirs clockwise or the other way at a steady, in-band speed.
- **Fun at 8 and at 15:** at 8, swirling a big bowl until it goes glossy and seeing what happens when you go wild. At 15, holding a narrow band on a stiff dough.

### 3.3 Oven (new)

- **Input:** a 5-dot heat dial with a 56 px knob that snaps to each dot, then **Bake**. The ideal heat is printed on the mix card ("Oven: ● ● ● ○ ○"), so setting the dial is a reading check. Inside the oven window the bake rises and changes colour through five stops by `f` (below): **pale** under 0.80, **light** 0.80–0.94, **golden** 0.94–1.06, **deep** 1.06–1.25 and **toasty** above 1.25. At `f = 0.5` a **Turn tray** prompt (64 px) appears and stays until tapped. A big **Take out** button (64 px) ends the bake. Game time runs at 1 game minute per 0.3 s real, so a 24-minute bake takes 7.2 s. Reduced motion swaps the rise animation for a colour bar.
- **Scored:** `k = heat − idealHeat`. `heatScore = max(0, 1 − 0.6 × |k|)`. Done time is `idealMinutes × (1 − 0.16 × k)`, so hotter is faster. `f = takenMinutes ÷ doneTime`. `window = 0.06 × trait × upgrade (Oven Lamp 1.2) × difficulty`. `timingScore = 1` if `|f − 1| ≤ window`, else `max(0, 1 − (|f − 1| − window) ÷ 0.25)`. `evenScore = 1` if the tray was turned at `|turnedMinutes ÷ doneTime − 0.5| ≤ 0.15`, else 0.6 (including never turned). `bakeAccuracy = 0.2 × heatScore + 0.6 × timingScore + 0.2 × evenScore`. On Standard, a 24-minute sponge has a perfect window of 22.6–25.4 minutes, about ±0.43 s real (±0.56 s on Relaxed); missing it by another 0.1 of done time still scores 0.6 on timing.
- **No tap:** if Take out is never tapped, the bake comes out by itself at `ceil(2 × doneTime)` minutes, toasty. The two tiers bake one after the other: the small tier's oven opens once the big tier is out.
- **Record and checks:** `{batchId, heat, turnedMinutes | null, takenMinutes, assisted}`. Heat is a whole number from 1 to 5; minutes are whole numbers with `1 ≤ turnedMinutes < takenMinutes ≤ ceil(2 × doneTime)`; each batch commits exactly once. There is no rebake in this slice; a toasty bake still continues, with a kind line: "A little toasty. Icing hides a lot!"
- **Assist** ("Oven helper"): the dial is preset to the ideal heat, the tray turns itself at `f = 0.5`, and a bell rings and takes the bake out at `f = 1`. Accuracy is capped at 0.8.
- **Fun at 8 and at 15:** at 8, watching a cake puff up, turning it, and shouting "now!". At 15, reading the colour stops and nailing a ±0.43 s window.

### 3.4 Pipe (reuses ADEEVA's trace)

- **Input:** a turntable view of the bake's top or side, about 24 × 24 cm in canvas units. Press to squeeze and drag along the dotted path; samples are taken only while pressed, and no closer than 0.2 cm apart, up to 2000 per path. Paths come from the chosen pattern (§4.3). A **Scrape** button redoes the current path; finished paths are never touched, mirroring ADEEVA's seam restart.
- **Scored per path:** `pipeAccuracy = traceAccuracy(samples, path, tol) × coverage`. `coverage` is the share of checkpoints, one every 1 cm along the path, that have a sample within `tol`, so a short perfect squiggle cannot score high. `tol = 0.8 cm × trait × upgrade (Pro Piping Set 1.15) × difficulty`. This reuses ADEEVA `traceAccuracy`/`distanceToOutline`, extended with a `closed: boolean` flag so open swirls and swags do not join their last point to their first. ADEEVA calls keep `closed = true`.
- **Record and checks:** the UI sends `{pathId, samples, assisted}` once, when **Keep this line** is tapped; core checks 2–2000 samples inside the 24 cm canvas and at least 0.2 cm apart, computes the accuracy, and stores only `{accuracy, assisted}`. Each path is kept once; **Scrape** clears the current attempt before it is kept.
- **Assist** ("Guide dots"): the bag snaps onto the path as you drag, and the right arrow key pipes along it from the keyboard. Accuracy is capped at 0.8.
- **Fun at 8 and at 15:** at 8, thick, squishy icing lines in any colour. At 15, a clean scalloped border on a two-tier cake that a picky client will notice.

### 3.5 Toppings (reuses ADEEVA's decoration)

- Drag toppings from the tray onto the preview (or press one from the keyboard to drop it in the middle), then move, rotate (in 15° steps) and scale them (0.5–2, ADEEVA `MIN/MAX_DECORATION_SCALE`). Tapping a placed topping returns it to stock; dragging one moves it and selects it for the turn, size and put-back buttons. This reuses the ADEEVA `Decoration` pose `{x, y, rotation, scale, layer}` through a generic `PlacedLayer` on a 400 × 400 cake canvas. Sprinkles count as one topping per placed pinch.
- This step is creative, not scored on skill. It feeds the style, colours and toppings criteria.

### 3.6 Box It Up (Counter Day only; new)

- **Stock:** counter trays baked on days 1–6, of 6 items each. An item's kind is its product (cupcake or biscuit) and icing colour. The counter holds 3 trays, or 4 with the Display Counter.
- **Cards:** the counter shows **6 order cards** (8 with the Display Counter). Each card shows 2–4 pictured items, drawn by the seeded RNG from the item kinds in stock, so every card could be filled but not every card can be filled at once.
- **Input:** drag items (≥ 56 px) into a card's box, or tap an item and then tap a box. A box that holds exactly its card's items closes with a ribbon and sells. A wrong item bounces back with "That box needs something else." and no penalty. Half-filled boxes can be emptied back to the trays at any time. There is no per-card timer, no queue and nobody leaves. A whole-session limit of 150 s shows as a sun crossing the shop window; it is off on Relaxed, and a paused or hidden tab freezes it. **Close shop** ends the session early.
- **Pay:** each item in a sold box pays `3 + round(3 × trayQuality ÷ 100)` coins (5–6). A card containing an item whose tray carries one of this week's hot tags pays +1 per item. Charmer adds +1 coin per box.
- **Result:** coins for every box sold. Items left over are "shared with the neighbours", with a kind line and no penalty or reward.
- **Record and checks:** a box is held on screen until it is full, then sent as `{cardIndex, trayIds[]}`; core checks the items match the card and are still in stock, and each card sells at most once. Cards are drawn without replacement from the individual items on the counter, so each card on its own can always be filled.
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

Briefs are varied by seeded RNG, as in ADEEVA's `rollClientBrief` (budget, fee, deadline, 2 of the favoured colours). The min Q column matches `content/client.ts`; the simulation (§10.11) reads it from content.

| id             | name, relation                               | gate / min rep  | products                    | required tags                      | favoured colours     | avoid                | required toppings           | budget | fee    | days | min Q |
| -------------- | -------------------------------------------- | --------------- | --------------------------- | ---------------------------------- | -------------------- | -------------------- | --------------------------- | ------ | ------ | ---- | ----- |
| pip            | Pip's dad, for Pip's 7th birthday (upstairs) | — / 0           | cupcake-tray                | playful                            | sky, blush, mustard  | colour charcoal      | sprinkles×1, party-candle×1 | 20–30  | 35–45  | 3–5  | 62    |
| coach-dani     | Coach Dani, under-10s football               | — / 0           | iced-biscuits               | sporty                             | emerald, navy, ivory | colour ruby          | team-ball×2                 | 20–30  | 35–50  | 3–5  | 64    |
| grandpa-tomasz | Grandpa Tomasz, retired postman              | — / 0           | layer-cake                  | classic, romantic                  | ivory, rose, gold    | flavour lemon-sponge | sugar-rose×2                | 30–45  | 45–60  | 4–6  | 67    |
| mrs-adeyemi    | Mrs. Adeyemi, choir leader                   | — / 4           | fruit-tart                  | elegant                            | ruby, blush, ivory   | colour black         | fresh-berries×8             | 35–50  | 55–75  | 4–6  | 74    |
| ms-farrow      | Ms. Farrow, poetry-club librarian            | — / 8           | cupcake-tray                | dreamy                             | lavender, sky, ivory | colour mustard       | wafer-butterfly×3           | 35–50  | 70–90  | 5–7  | 78    |
| rosa-mateo     | Rosa & Mateo, cousins graduating             | — / 12          | two-tier-cake               | elegant, bold                      | navy, gold, emerald  | colour blush         | gold-star×3, sugar-pearls×1 | 70–90  | 95–120 | 5–7  | 84    |
| saffi          | Saffi, owner of the Paper Lantern Café       | Trendsetter / 6 | cupcake-tray, iced-biscuits | this week's first hot tag          | any 2 of 16 (rolled) | —                    | —                           | 25–40  | 70–90  | 3–5  | 76    |
| mr-bramwell    | Mr. Bramwell, quiet neighbour at No. 9       | Charmer / 5     | layer-cake                  | classic; **requires** honey-sponge | sage, mustard, ivory | —                    | —                           | 25–40  | 80–100 | 4–6  | 72    |

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

| id                     | trigger                                                                   | lines                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pa-intro               | intro                                                                     | **Otti:** "Forty years I opened this door at six. Your turn now." / **Otti:** "The oven's old but honest. Watch the colour, not the clock." / **You:** (byTrait) |
| pa-first-delivery      | first-delivery                                                            | **Narrator:** Through the window you see your bake carried down the street like treasure. / **You:** (byTrait)                                                   |
| pa-first-counter       | first-counter-day                                                         | **Otti:** "Counter Day. Trays out, boxes ready, smile on." / **Otti:** "Whatever's left goes to the neighbours. Nothing wasted." / **You:** (byTrait)            |
| pa-first-week          | first-week                                                                | **Otti:** "Rent day. Every shop on Larkspur pays it." / **Otti:** "Short on coins? The café always needs a tray washer." / **You:** (byTrait)                    |
| pa-bankrupt            | bankrupt (Challenging only)                                               | **Narrator:** "Rent paid. The coin jar is empty." / **You:** (byTrait)                                                                                           |
| pa-trait-dreamer       | trait-dreamer (a finished design with 3 colours or a dreamy or bold feel) | **Narrator:** "Sugar Clouds." You sketch a cake with a sky inside it. / **Otti:** "Only a dreamer bakes weather. Keep going."                                    |
| pa-trait-perfectionist | trait-perfectionist (an unassisted weigh lands exactly on its target)     | **Narrator:** "To the Gram." / **Otti:** "You let go of the scoop just early enough. Who taught you that?" / **You:** "Nobody. I just watched the needle."       |
| pa-trait-trendsetter   | trait-trendsetter (Saffi first pins up an order)                          | **Narrator:** "Menu Board." Saffi peers in. / **Saffi:** "You always know what the town wants next. Let's work together."                                        |
| pa-trait-charmer       | trait-charmer (Mr. Bramwell first pins up an order)                       | **Narrator:** "Number Nine." / **Mr. Bramwell:** "...You wave at everyone. Even me." / **You:** "Especially you. The whole street's glad you're here."           |

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
- **Decent player:** weigh 0.90, stir 0.88, bake 0.88, pipe 0.82, fit 1 → quality ≈ 87. That clears the minimums 62–78 with a margin; Rosa & Mateo (84) is the stretch order, passed about half the time. Most other failure risk is a missed oven window or a style or topping slip.
- **Full assist:** 0.8 on every step, fit 1 → quality 81. It passes every client up to 78 on Standard; Rosa & Mateo (84) needs unassisted steps, and on Challenging (+6) assist also misses Ms. Farrow and Saffi. Stars separate: assist with 2 favoured colours scores 25 + 60.75 + 2 ≈ 88 (4★), and decent play ≈ 92 (5★).
- **Week 1:** buzz stays under 34, so offers stay at 1 a day and about 4 orders fit (starter fees ≈ 45, pay ≈ 45 × 1.17 ≈ 52, value used ≈ 20, net ≈ +32 each, so ≈ +128). One 10-hour day makes 2 counter trays (12 items, ≈ 26 in ingredients); boxing about 10 of them at 6 coins pays ≈ 60, net ≈ +34. Week 1 ends at about 80 + 128 + 34 − 70 ≈ 170 coins. Bright Scale (60) becomes affordable after the first pass, at reputation 3.
  - A struggling player with 2 soft fails (0.4 × 45 − 20 ≈ −2 each), 1 pass and 1 shift ends week 1 at about 80 − 4 + 32 + 30 − 70 = 68 coins.
  - 4 soft fails leave about 2 coins; one more bad week goes below 0, and the coin-jar rule above points to the shift.
- **Reputation pace:** a decent pass gives +3, so Ms. Farrow (8) opens around order 3, Rosa & Mateo (12) in week 2, and the §10.7 clients (10–26) through weeks 2–3.

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

**Engine (`src/engine`, shared with ADEEVA):** `rng` and `rngDraw`; `week`, `weekday` and `dayHours`; `standing`; `gigBoard` (offers, `offerCountForBuzz`, `clientIsOpen`, `rollOffers`, lapses, `MAX_ACTIVE_GIGS`); `difficulty`; `story` and `storyVoice` (with `byTrait`); `score` (`Criterion`, `starsForScore`, `passMix`, `gatePassed` and `judgedScore` with a per-game `ScoreRule`: Patisserie uses `{0.25, 0.75}` and a colour bonus of 1 per colour, max 3; ADEEVA keeps `{0.5, 0.5}`, 3 per colour, max 9); `reward` and `trendReward` (`settleTrendReward`: pass, soft-fail and fail per difficulty, trend, Trendsetter, Dreamer and Charmer lines); `styleTag` and `trendMarket` (moved from ADEEVA); `kindFeedback` (the shared colours, budget and deadline lines); `followRecord` (`recordFollow`, generalised from ADEEVA's `recordSeam`, with per-unit tick bounds: sewing uses 60–1200 per seam, stirring 40–1200 per lap) and `followAccuracy`; `assistCap` (`ASSIST_ACCURACY_CAP = 0.8` for every mini-game); `placedPose` (pose checks, `clampPose`, `MIN/MAX_PLACED_SCALE`, used by ADEEVA decorations and Patisserie toppings); `geometry/traceAccuracy` (with the new `closed` flag; ADEEVA keeps `closed = true`); `parse` (plus `keyedRecordOf`) and `stateParsers` (shared parsers for the gig board, story, trends, days, colours and style tags); `saveEnvelope`; `actionCheck`; `upgrades`; `profile`; `avatar`; `palette`.

**Shared UI:** `ui/kit` (`Button`, `Card`, `Dialog`, `Meter`, `StarRating`, `StatChip`, `TagPill`, `ToggleSwitch`, `useCountUp`, `useDispatchOnce`, plus `useTickLoop` extracted from ADEEVA's sewing machine and used by the scale, the bowl and the oven, and `clientToSvg` and `useElementSize` moved from ADEEVA); `ui/art` (`Avatar`, `colourMix`, `useSvgId`, `TileBackdrop`, and `PlacedLayer`, the generic layer that ADEEVA's `TrimLayer` and Patisserie's `ToppingLayer` both use); `ui/newGame` (`AvatarStep`, `TraitStep`, `DifficultyStep`, `ChoiceCard`, `SwatchRow`, `NewGameStepper`, moved from ADEEVA and shared by both new-game flows). The studio's `useGameSession`, `createSlotStore`, `SettingsContext`, `ToastContext`, `ViewLoadBoundary` and `lookAllowed` are used as ADEEVA uses them.

**Patterns followed from ADEEVA (re-implemented over Patisserie's own types):** `updateActiveRun`, `stageNavigation`/`canGoBack`, `stageReadiness`/`canAdvance`, `hourCost`, `assembly` (`slotAssignmentIssue` becomes `stack`), cut-commit idempotency (bake commits once per batch), `delivery`/`lastResult`, `checklist`, `materialFit` (becomes `flavourFit`), the save codec with a versioned parser, `testPlaythrough`, the double-dispatch guard, the story overlay, set-aside and save-on-exit.

**New code (`src/games/patisserie`):**

- `content/`: `ingredient`, `mix`, `filling`, `product`, `pipeShape`, `pipePattern`, `topping`, `client`, `upgrade`, `storyBeat`, `career`, `trait`, `difficulty`.
- `core/`: `gameState`, `action`, `reduce`, `catalog`, `brief`, `bakeRun`, `runStage`, `runLifecycle`, `hourCost`, `dayHours`, `stageNavigation`, `stageReadiness`, `design`, `bakeNeeds`, `pantry`, `weighAccuracy`, `weigh`, `stir`, `oven`, `stack`, `icing`, `pipe`, `toppingPlacement`, `bakeTags`, `bakeSpend`, `bakeQuality`, `skillTolerance`, `skillBands`, `construction`, `criterion`, `kindFeedback`, `bakeEvaluate`, `rewards`, `delivery`, `bakeBook`, `checklist`, `offers`, `calendar`, `counter`, `boxItUp`, `upgrades`, `guide`, `storyQueue`, `newGame`, `save`, `gameStateParser`, `bakeRunParser`, `resultParsers`, `testPlaythrough`, and `index`.
- `reputationOf.ts` reads the raw save JSON (schema version and reputation only), so the studio's main chunk never loads the core; `module.ts` is the live registry entry.
- `ui/`: `PatisserieGame`, the title, new-game, story, settings, hub, bake (one screen per stage plus the Quick pantry trip), Counter Day and Bake Book screens; the art in §6 (`BakeryBackdrop`, `ShopSign`, `BakePreview` with `CupcakeArt`, `LayerCakeArt`, `TierCakeArt`, `TartArt`, `BiscuitSetArt`, `CakeBody` and `CakeStand`, `ToppingArt`, `ToppingLayer`, `IngredientPack`, `DialScale`, `MixingBowl`, `OvenCutaway`, `PipeSurface`, `HeatDots`, `TreatIcon`, `GiftBox`); the guide bubbles; and `theme.css`, which retints the shared tokens (apricot, pistachio, blueberry, cocoa and buttercream) inside the game only.
- Unit tests per rule (weigh band edges, tidy factor, flow ramp and stock cap; stir band per stiffness, direction and tick bounds; oven colour stops, heat, turn window, auto-out and windows per difficulty; pipe checkpoints and coverage on open and closed paths; Box It Up draws, pay and box checks; trait perks and trait-gated clients; Saffi's hot-tag brief; rewards on every difficulty; coins below zero and rent; illegal actions returning the same state; save round trip and damaged saves; a full scripted order). `e2e/patisserie/order.spec.ts` plays a new game and Pip's order through every step with real pointer input (a hand pour, stir, oven, three traces and two topping drags), delivers, checks the coins, saves, reloads and continues, and checks the studio tile opens the game and comes back home. `e2e/patisserie/counter.spec.ts` opens Counter Day with two prepared trays, fills a box by dragging, sees a wrong item bounce, closes the shop and finds the coins and the shared-with-the-neighbours line.

## 8. Safety notes for this theme

- **No real recipes or kitchen instructions.** Amounts and heat dots are game numbers. The oven uses 1–5 heat dots, never °C, °F or gas marks, and there are no method cards or "how to bake at home" steps. The only real-world line is: "Real ovens, mixers and knives: ask an adult first."
- **No diet or body talk.** There are no calories, sugar counts, "healthy/unhealthy", "treat yourself", "guilt-free" or "cheat day" lines. No one comments on eating, weight or bodies. Customers are not drawn on Counter Day, and no person is ever scored.
- **No allergy or medical framing.** Avoided flavours are personal taste ("not a fan of lemon"), never allergies, intolerances or diets, so the game never implies that food is safe for anyone.
- **No fire play.** Party candles are always shown unlit, and flames never appear. The oven glows but there is no smoke, burning or alarm; an over-baked result is "toasty".
- **Safe adult characters.** No adult invites the player anywhere private or asks for a secret. Adult clients speak about their own events, and kindness lines point to the whole street.
- **No waste shame or pressure.** Leftovers are shared with neighbours. Box It Up has no fail state, no lost coins, no one waiting and no one leaving, and it pauses when the tab is hidden.
- **Original, not imitative.** No real brands or chocolate makers. No TV baking-competition terms or formats: no judges, eliminations, head-to-heads, leaderboards or numbered rounds; the Fair rules are in §10.10. Box It Up avoids customer queues, per-customer patience timers, customers walking out, order-ticket rails and tip ratings, which are the core of existing bakery and diner time-management games. Before shipping, check that "Crumb & Comet" and "Paper Lantern Café" are not real trading names.
- **Coins only.** No real currency symbols, no prices in real money, and nothing to buy. There are no ads, no chat and no network. Offer and card randomness is seeded and free, with no rerolls. The Bake Book stays in the local save.

## 9. Out of scope (slice and depth)

- A third career, a hired assistant, staff, a café kitchen and any savoury menu.
- Bread, savoury bakes, choux, frozen desserts, sugar-work and chocolate tempering; more than 3 batches per bake; cakes taller than three tiers.
- Rebaking a batch, free-hand piping, free lettering (only the preset plaque words in §10.4) and photo import.
- Content beyond §10.7; ingredient spoilage or expiry dates; Fair days outside the season calendar.
- Rival bakers who are scored, ranked or shown losing; any entry fee, prize in real money or online leaderboard.
- Image export or printing of Bake Book cards, real recipes, printable recipe cards, real temperatures and any online sharing.

## 10. Depth: Patisserie Competition and Tea Salon

Phase B brings the game to ADEEVA's depth. ADEEVA grows Student → Label, with 3-look collections and an animated runway. Here, **Corner Baker** grows into **Salon Pâtissier**. Otti's closed back parlour reopens as **The Comet Room**, a small tea salon serving seasonal afternoon-tea menus. Each season ends at the **Larkspur Patisserie Fair**, a kind, skill-focused village fair in the town glasshouse. There you bring a showpiece made for a themed brief, unveil it in an animated showcase, and three warm panels of neighbours give it ribbons. Nobody is sent home, ranked against other bakers or timed against a rival. "Competition" is a design word only and never appears on screen.

All new products, mixes, fillings, toppings and clients in §10.7 are open in **both** careers by their reputation gates, so a Corner Baker meets new content in weeks 2–3. Only Table Service, the Fair and the salon upgrades belong to the salon career.

### 10.1 Careers, unlock and "start here"

| id       | on screen       | start coins | start rep | weekly rent (Standard)                                    | shift (any difficulty)                    |
| -------- | --------------- | ----------- | --------- | --------------------------------------------------------- | ----------------------------------------- |
| `bakery` | Corner Baker    | 80          | 0         | 70 (105 on Challenging)                                   | "Washing trays at the café", 30           |
| `salon`  | Salon Pâtissier | 400         | 30        | 100 (150 on Challenging), label "Bakery and parlour rent" | "Setting up tables at the glasshouse", 45 |

- **Unlock (same save):** while `career === "bakery"`, the check `salonOfferReady` (reputation ≥ **30** and `ordersDelivered` ≥ **12**, and `pa-salon-offer` not yet seen) runs after each delivery and at End Day. When it passes, it queues `salon-offer`. A decent Standard player gets there late in week 3 (≈ +2.7 reputation per pass and about 4–5 orders a week). That pace matches ADEEVA's Student Showcase (reputation 40, 8 gigs).
- **Story beat `pa-salon-offer`:** Otti unlocks the parlour door. It is the game's first story choice, using ADEEVA's `storyChoice` pattern ported over. **"Open the Comet Room"** dispatches `openSalon`. **"Not yet"** sets the flag `salon-later`, and the hub then shows a persistent Comet Room card with the same Open button (`canOpenSalon`), so the offer can never be missed.
- **`openSalon`:** sets `career: "salon"` and keeps coins, reputation, pantry, upgrades, Bake Book, log and active orders. It adds **Otti's Parlour Box** (1 tin of each tea, 1 jar of each new filling) and opens Fair Season 1 on the next week start, stored as `fair.seasonStartDay` (§10.2). The salon rent applies from the first settlement on or after `fair.seasonStartDay`, so the settlement that closes the current week stays 70. Illegal when already `salon`, below the thresholds, or while `activeRun` is a tray. In those cases it returns the same state.
- **"Start here" (older players):** New Game gains a **Career** step between Trait and Difficulty. It uses ADEEVA's `CareerStep`, which moves to `ui/newGame/CareerStep.tsx` with career cards as props; ADEEVA's flow keeps the same cards and copy. The cards are Corner Baker ("Start small: neighbours' orders and Counter Day. Great for first-time bakers.") and Salon Pâtissier ("For bakers who already know the oven: tea salon and the Fair."). Corner Baker is preselected. A salon start gets 400 coins, reputation 30, the starter pantry ×2, the Parlour Box, the guide off and the intro beat `pa-intro-salon`, with `fair.seasonStartDay = 1`.
- **Studio reputation:** `profile.startedAs: CareerId` is fixed at New Game and never changes. It is read by a Patisserie Profile parser (`patisserieProfile`) built on the shared `ProfileBase`, which stays unchanged. `module.ts` switches from `fixedStartReputation` to `earnedReputation(..., (profile) => startOf(profile.startedAs))`, the same as ADEEVA's `careerReputation`. `reputationOf` maps a missing `startedAs` (v1 saves) explicitly to a start of 0. Opening the salon never changes the studio's earned reputation.
- **Rest the parlour:** at each season start, while the season's plan is still undecided, the salon player may pick **"Rest the parlour this season"** (`restParlour`) on the Menu Board instead of opening the parlour with the menu. For that season the rent is 70, day 6 is a normal baking day and there is no Fair entry. The Fair tent and ribbons are kept. This is the player-chosen safety valve against a hard stretch. The plan resets to undecided at the next season start.

### 10.2 How play changes (salon career)

A **season** is two weeks (14 days) that starts on `fair.seasonStartDay`, which is always a week start. Salon Day and Fair Day are computed from that anchor (`seasonDay = day − seasonStartDay`), never from the global week parity, because the salon can open in any week. Seasons cycle Spring → Summer → Autumn → Winter, and the next anchor is `seasonStartDay + 14`.

| Weekday | Season week 1                                   | Season week 2                        |
| ------- | ----------------------------------------------- | ------------------------------------ |
| 1–5     | Baking days: orders, counter trays, salon trays | Same; the showpiece (§10.4)          |
| 6       | **Salon Day**: Table Service (§10.3)            | **Fair Day**: Fair Showcase (§10.5)  |
| 7       | Counter Day (§3.6); rent when it ends           | Counter Day; rent; next season opens |

- **Menu Board (`salonMenu`):** at each season start the board sets, for each tier of a three-tier cake stand, a product + mix pair and **two** icing colours. **Top**: `petit-fours` or `cupcake-tray` (any sponge). **Middle**: `tartlet-set` or `spiral-roll`. **Bottom**: `iced-biscuits` + `biscuit-dough` or `iced-biscuits` + `rose-biscuit`. The board opens on "Marigold suggests…": pairs carrying the season tags and colours from the season's theme palettes, confirmed with one tap. The menu is fixed for the season; changing it mid-season is refused with "The menu changes with the season." Season tags give a **menu bonus**: Spring romantic/dreamy, Summer playful/casual, Autumn classic/bold, Winter elegant/regal.
- **Salon trays:** a tray run (`purpose: { kind: "salon-tray", tier }`) on the tier's menu pair runs `design (pre-filled) → pantry → weigh → mix → bake → pipe (1 path, "Quick pipe") → review` = **6 h**. At design the tray picks a **colour split** of its two menu colours: 6/0, 4/2, 3/3, 2/4 or 0/6. The split costs no extra hours; a two-colour tray uses one more gel. Quality is `0.30·weigh + 0.20·stir + 0.30·bake + 0.20·pipe`. The **Salon shelf** holds 3 trays, one per tier (6 items each).
- **Leftovers:** after Salon Day, unplated salon items move onto the counter for Counter Day as extra stock, up to the counter's tray capacity; any that don't fit are "shared with the neighbours". `TrayProductId` widens to every menu product so Box It Up accepts them, and `TreatIcon` gains art for petits fours, tartlets, roll slices and the rose biscuit.
- **Orders keep coming:** all 16 clients (§10.7) still pin orders. Salon days and Fair days are like Counter Day: a finished bake can be delivered and the pantry is open, but no new bake starts and no shift is worked.
- **Hub additions:** a Season ribbon (season name, Fair tent, days to Fair Day), the Menu Board with the season's bookings, the Salon shelf, the Fair Board, the Ribbon Wall (§10.6) and the parlour toggle at season start.

### 10.3 Table Service (Salon Day; reuses Weigh, Stack and Pipe)

- **Bookings (`salonBookings`):** drawn by the seeded RNG when the season's menu is confirmed and shown on the Menu Board all week. Each table books one of the two menu colours per tier and two teas. Guests are adults or family groups drawn from the 16 clients ("Pip and his dad", "Inès, Sofia and their mum"). One table in four has an **occasion** ("Table 2 is celebrating!"). There are 4 tables, +1 with the Tea Trolley and +1 from Fair tent 3 onward, so 6 at most.
- **Planning puzzle:** the tray splits should match the bookings. With 6 tables all 18 items are used, so the splits must match exactly. On Relaxed the splits are pre-filled ("Otti counted the bookings"). Standard and Challenging show a running tally per tier ("Blush: 4 booked, 4 planned").
- **Session:** no queue, no patience meter and nobody leaves. A whole-session sun limit of 180 s runs, off on Relaxed and frozen while the tab is hidden, as in Box It Up. **Close the salon** ends early, and unserved tables "enjoyed the garden view and will come back". With an empty shelf, Salon Day shows "A quiet day in the parlour." and pays 0 with no penalty.
- **Plate the stand (reuses `stack` slot assignment):** drag, or tap then tap, each item onto its tier slot. A wrong tier is refused with a reason ("Tartlets sit on the middle tier."). Not scored; a full stand is required to serve.
- **Booked colour missing:** when the shelf has no item of a booked colour for a tier, that tier offers **"Swap colour"**: any item of the tier is plated, the table pays −4 and loses the booking bonus, and the line is "Table 3 loved the surprise colour!" No table is ever refused.
- **Tea Pour (reuses Scoop & Weigh's flow, settle and `weighAccuracy`):** a teapot over a cup with a line. Target 150 ml. The flow, ramp and settle follow §3.1, with each tea's `pourDifficulty`. The band is `0.06 × trait × upgrade (Gooseneck Teapot 1.2) × difficulty`. One pour per table: the first booked tea is poured by hand and the second cup fills itself to match, so a 6-table Salon Day stays under about 2 minutes. The record is `{tableIndex, ml, actions, assisted}`, with whole numbers and `0 ≤ ml ≤ 300`, `1 ≤ actions ≤ 40`. **Steady pot** assist caps the pour at 0.8. Keyboard: hold Space or Enter on the pour button. Tea is "warm" and there is no steam play.
- **Serve:** `serveTable {tableIndex}` checks the stand and the pour, then pays once per table:
  `tablePay = 29 + round(12 × standQuality ÷ 100) + round(6 × pour) + 4 (every tier matches its booking) + 3 (menu bonus, if any plated item carries a season tag)`, then × 1.10 with Silver Cake Stands and +1 for Charmer. A swap-colour table loses the +4 and takes −4. `standQuality` is the mean of the three items' tray qualities. Pay is coins only, with no reputation; buzz is **+2** per table served. The base is 29 so that a 6-table Salon Day, which leaves nothing for Counter Day, still out-earns a 4-table one (§10.8).
- **Fun at 8 and at 15:** at 8, building a pretty stand and pouring the cup to the line. At 15, counting the bookings, splitting the trays so every table gets its colours, and landing thick Hot Cocoa in one pour.

### 10.4 Showpiece and Fair twists (reusing the four mini-games in fresh ways)

- **Showpiece run:** `startShowpiece` (from season week 1, day 3 through week 2, day 5; one per season) opens a `BakeRun` with `purpose: { kind: "showpiece" }` and a brief built by `fairBrief(theme, tent, difficulty)`. The products are those the tent allows; the required tags are the theme's 2; the favoured colours are the theme's palette; the required toppings are the theme topping × (1 + ⌈tent ÷ 2⌉); the budget is `80 + 15 × tent`; the minimum quality is the tent's "Ready for the Fair" mark (§10.5) + the difficulty bonus; the deadline is Fair Day. While an order run is active it is refused with "Finish or set aside your current bake first." It is evaluated with `bakeEvaluate` like any order. The checklist reads "Ready for the Fair"; it is guidance only and never stops the showpiece going to the Fair. Nothing is paid until the Fair. **Take to the Fair** stores a `FairEntry` snapshot (design, toppings, tags, colours, spend, evaluation and extra-touch accuracies).
- **Showpiece not at the Fair by the end of Counter Day:** the Fair is skipped with "We saved your spot for next season." There is no ribbon, prize or reputation change, and the tent stays. The run is closed through the existing `abandonRun`, and its ingredients stay spent.
- **Extra touches (`flourish`, optional, at most 2, chosen at design):** never required, and they never lower quality. They feed the Bakers' Bench's **Flair** (§10.5): `Flair = min(100, 40 + 30 × Σ touch accuracy)`, so none gives 40, one at 0.85 gives 65.5 and two at 0.9 give 94. Assist is allowed on a touch and caps that touch at 0.8, so an 8-year-old with two assisted touches still earns 88. Dreamer gets +10 Flair when the showpiece uses 3 or more icing colours (still capped at 100).

| id                 | on screen            | reuses                                  | rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | -------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blind-scale`      | "Covered scale"      | Weigh                                   | The green zone is hidden until the settle ends; scoring is unchanged. Touch accuracy is the mean weigh accuracy (each assisted weigh capped at 0.8).                                                                                                                                                                                                                                                                                                                                                                                                             |
| `ribbon-stir`      | "Fold, then whisk"   | Stir (`recordFollow`)                   | Only with the `ribbon-chiffon` mix, whose laps alternate band centres 2.5 / 4.5 rad/s (`lapSpeeds`); the gauge's green arc moves each lap. Touch accuracy = stir accuracy.                                                                                                                                                                                                                                                                                                                                                                                       |
| `bake-together`    | "Bake them together" | Oven                                    | For 2+ batches: two tiers (the bottom and middle of a three-tier) bake at once with one heat dial and one Turn tray, each with its own Take out button. Each tier's `idealMinutes` comes from its mix's minutes: the bigger tier × 1.0, the smaller × 0.75. When the two mixes have different ideal heats, both heat-dot rows show and each tier's `heatScore` uses its own ideal, so a compromise heat is a visible choice. `bakeTogether {batches, heat, turnedMinutes, takenMinutes[]}` stores two §3.3 records. Saves 1 h. Touch accuracy = mean of the two. |
| `plaque-lettering` | "Piped words"        | Pipe (`traceAccuracy`, `closed: false`) | A plaque with one preset word: JOY, HOME, BLOOM, CHEER, HELLO or THANKS. Each letter is an open path of strokes (`letterPath`), scored as §3.4 with checkpoints and coverage. Touch accuracy = mean letter accuracy. +1 h.                                                                                                                                                                                                                                                                                                                                       |

- **Level it (automatic on `three-tier-cake`; reuses the stack slots and `placedPose`):** after each tier lands, nudge it left or right (drag, or the arrow keys) until the centre line glows with a soft click. It is an unscored ritual: tier balance is not part of quality or any panel.
- **Hours:** layer cake 8, biscuit wreath 10, two-tier 10 (9 together), three-tier 12 (11 together), +1 for piped words, −2 with the Showpiece Trolley (one hour off piping and one off toppings). A showpiece spans 1–2 baking days, so a teen can plan a 12 h three-tier around Salon Day.

### 10.5 The Fair Showcase (the event moment, like ADEEVA's runway)

1. **Fair Board** (like ADEEVA's `CollectionBoard`): the theme card, the **showpiece** slot and 2 **side plate** slots. A side plate is any Bake Book entry not already shown at a Fair (`fair.shownRunIds`). On every difficulty the board opens with **"Otti's picks"**: the two entries carrying the most theme tags, then the most palette colours (ties go to the newer entry). The player can swap them or empty a slot; one tap confirms.
2. **Planner** (the plan is sent with `stageFair { plan }` in one action): the **unveil order** ("Save your best plate for last"), a **table cloth** (`linen`, `gingham`, `velvet`) and **music** (`string-trio`, `brass-band`, `music-box`, `garden-birdsong`), using `useRovingRadio` radio groups. The theme card shows two mood words (§10.6), and each cloth and music card shows its own word, so matching them is a reading puzzle, not a guess. The Planner opens on "Marigold suggests…" (the matching cloth and music, best plate last), confirmed with one tap.
3. **Showcase** (`stageFair`, Fair Day only; on Counter Day it is late, with −10 except on Relaxed). In the glasshouse at golden hour the string lights brighten; each plate glides along the long table on a little trolley to a turntable under a glass cloche. The player lifts each cloche with a tap, Enter or Space, and it lifts by itself after 3 s; reduced motion keeps the same tap and timing. Each lift brings a sugar-star sparkle; the last plate brings petal fall and the three panels clapping (drawn with the studio `Avatar`). Then the three panel cards flip up and count up. Total ≈ 28 s; **Skip** appears after the first unveil. Reduced motion shows crossfaded stills with captions (ADEEVA's `STILL_MS` pattern).
4. **Panels** (each 0–100, ADEEVA `panel()` sums). Everyone on a panel is an adult neighbour or volunteer; no panel is called a judge. The 3 slots are the showpiece and the 2 side plates; an empty slot counts as 0 wherever a rule says so.

| panel (members)                                                                                                             | parts (weight)                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bakers' Bench** (Otti; Ruth Fenwick, village bread baker; Mr. Hollis, retired pastry teacher)                             | Craft 0.55 = showpiece quality; Companions 0.15 = mean side-plate quality (empty slot 0); Flair 0.20 (§10.4); Sensible cost 0.10 = `clamp(100 × (1.5 − spend ÷ budget), 0, 100)`, ADEEVA's buyers cost rule                                                                     |
| **Garden Club** (Marigold Asante, Fair organiser; Mr. Pell, glasshouse keeper)                                              | Theme 0.5 = mean theme-tag share over the 3 slots (empty slot 0); Palette 0.3 = (share of icing colours on the present plates that are in the theme palette) × (plates present ÷ 3); Harmony 0.2 = 100 × (side plates sharing at least one icing colour with the showpiece) ÷ 2 |
| **Visitors' Table** (three past clients drawn each season, adults only or shown as a family pair such as "Pip and his dad") | Wonder 0.4 = ADEEVA wow rule over the 3 slots on toppings tagged dreamy/regal/bold (empty slot: 0 toppings, no tag); Setting 0.3 = music (70 best / 20) + cloth (30 best / 10); Unveil 0.3 = ADEEVA `closerStrength` × (plates present ÷ 3)                                     |

5. **Side-plate quality:** new Bake Book entries record their `quality`; a migrated v1 entry has `quality: null` and counts as the lower edge of its star band (90 / 75 / 55 / 35 / 0).
6. **Overall** = round(mean of the 3 panels) − late penalty. **Ribbons** come from fixed bands, never from placings: Baker's Ribbon (< 55, "Thank you for bringing your bake!"), Ribbon of Merit (55–69), Silver Ribbon (70–84), Gold Ribbon (85–94), Comet Rosette (95+). Panel verdict words: Delighted ≥ 85, Loved it ≥ 70, Enjoyed it ≥ 55, Warmly cheered below that.
7. **Rewards (`fairPrize`):** coins `30 + 10 × tent + 3 × max(0, overall − 50)`; reputation `round((overall − 40) ÷ 6)` when overall ≥ 50, otherwise 0 (−1 on Challenging); buzz `round(overall ÷ 10)`. **Fair Notes** shows one kind line per panel plus one "Next time, try…" tip from the engine's `qualityTip`. The ribbon goes to `fair.ribbonsByRun[runId]` and, if better, `fair.ribbonWall[themeId]`; the Bake Book card shows it by looking up its `runId`, and no Bake Book entry is rewritten. The showpiece and both side plates join `fair.shownRunIds`.
8. **Fair tents (progression across seasons):** on Standard the next tent opens when overall ≥ **60** (≥ 65 on Challenging). On Relaxed the tent moves up only when the player taps **"Move up a tent?"** on Fair Results, so nobody is pushed onto the three-tier-only Grand Glasshouse. Otherwise the player stays in the same tent with a new theme: there is no step back and no exit.

| tent | name             | showpiece products                         | Ready for the Fair (Std) | theme topping × | budget | extra            |
| ---- | ---------------- | ------------------------------------------ | ------------------------ | --------------- | ------ | ---------------- |
| 1    | Village Table    | layer-cake, biscuit-wreath, tartlet-set    | 72                       | 2               | 95     | —                |
| 2    | Garden Tent      | two-tier-cake, biscuit-wreath, spiral-roll | 74                       | 2               | 110    | —                |
| 3    | Glasshouse Hall  | two-tier-cake, three-tier-cake             | 76                       | 3               | 125    | +1 salon table   |
| 4    | Lantern Pavilion | two-tier-cake, three-tier-cake             | 78                       | 3               | 140    | —                |
| 5    | Grand Glasshouse | three-tier-cake                            | 80                       | 4               | 155    | Ribbon Wall goal |

"Ready for the Fair" is a checklist mark only: it never gates the Fair, and the tent card says so ("Ready or not, the Fair is glad to see you.").

9. **Season start:** the player picks 1 of the season's 2 themes (ADEEVA `NextSeasonPicker` pattern) and receives the **Baker's Hamper** (1 flour, 1 butter, 1 caster sugar and the theme topping × 2, ≈ 30 coins of value). Trendsetter also sees the next season's two themes on the Season ribbon.

### 10.6 Fair themes, settings and the Ribbon Wall

Mood words: cloths are linen "soft", gingham "sunny", velvet "rich"; music is string-trio "graceful", brass-band "lively", music-box "twinkly", garden-birdsong "breezy". A theme's two mood words name its best cloth and music. Every lantern in the game (Midsummer Lanterns, Lantern Pavilion, Lantern Night) is drawn as a paper or electric glow with no flame.

| id                 | season | name               | tags             | palette (favoured)           | theme topping   | mood words     | best cloth | best music      |
| ------------------ | ------ | ------------------ | ---------------- | ---------------------------- | --------------- | -------------- | ---------- | --------------- |
| blossom-lane       | Spring | Blossom Lane       | romantic, dreamy | blush, lavender, ivory, sage | sugar-daisy     | soft, graceful | linen      | string-trio     |
| kite-day           | Spring | Kite Day           | playful, casual  | sky, mustard, coral, ivory   | candied-orange  | sunny, lively  | gingham    | brass-band      |
| seaside-postcard   | Summer | Seaside Postcard   | casual, playful  | teal, sky, coral, ivory      | wafer-fan       | sunny, breezy  | gingham    | garden-birdsong |
| midsummer-lanterns | Summer | Midsummer Lanterns | dreamy, regal    | navy, gold, lavender, plum   | sugar-shimmer   | rich, twinkly  | velvet     | music-box       |
| harvest-moon       | Autumn | Harvest Moon       | classic, bold    | mustard, plum, gold, ruby    | toffee-shard    | soft, lively   | linen      | brass-band      |
| library-nook       | Autumn | Library Nook       | classic, elegant | emerald, navy, ivory, gold   | wafer-fan       | rich, graceful | velvet     | string-trio     |
| snow-globe         | Winter | Snow Globe         | elegant, dreamy  | ivory, sky, lavender, teal   | sugar-snowflake | soft, twinkly  | linen      | music-box       |
| comet-night        | Winter | Comet Night        | regal, bold      | navy, gold, charcoal, plum   | gold-star       | rich, graceful | velvet     | string-trio     |

**Ribbon Wall:** a hub frame with one hook per theme that shows the best ribbon won there (`fair.ribbonWall`). The finale beat `pa-ribbon-wall` plays once each of the **4 seasons** has a Silver Ribbon or better on one of its hooks **and** at least one Gold Ribbon or better has been won. That takes at least 4 seasons, and a decent player gets there in about 4–6. Gold or better on all 8 hooks is an optional collection that plays `pa-every-hook-gold`. Play continues afterwards: seasons keep cycling and Comet Rosettes stay collectable.

### 10.7 Content, about twice the slice

| kind          | slice | added | total | added ids                                                                                                                        |
| ------------- | ----- | ----- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| ingredients   | 10    | 8     | 18    | ground-almond, brown-sugar, cream, orange-zest, rose-drops, cinnamon, oats, choc-buttons                                         |
| mixes         | 6     | 6     | 12    | almond-sponge, spice-sponge, orange-sponge, ribbon-chiffon, oat-crust, rose-biscuit                                              |
| fillings      | 3     | 3     | 6     | lemon-curd, choc-cream, berry-cream                                                                                              |
| products      | 5     | 5     | 10    | petit-fours, tartlet-set, spiral-roll, biscuit-wreath, three-tier-cake                                                           |
| pipe patterns | 10    | 16    | 26    | 2 per new product (10), plus 6 plaque words (letter paths)                                                                       |
| toppings      | 9     | 9     | 18    | candied-orange, sugar-shimmer, mint-leaf, sugar-daisy, wafer-fan, marzipan-bee, choc-sail, sugar-snowflake, toffee-shard         |
| clients       | 8     | 8     | 16    | twins-ines-sofia, mr-osei, ms-lindqvist, juniper-troop, councillor-nwosu, aunt-maribel, wren (Dreamer), mr-quill (Perfectionist) |
| upgrades      | 4     | 4     | 8     | gooseneck-teapot, tea-trolley, showpiece-trolley, silver-stands                                                                  |
| story beats   | 9     | 19    | 28    | §10.7 story table, plus `pa-parlour-grace` and `pa-fair-skipped`                                                                 |
| new kinds     | —     | 26    | 26    | 4 teas, 8 Fair themes, 5 tents, 3 cloths, 4 music, 2 career defs                                                                 |

**Ingredients** (same columns as §4.1): ground-almond Ground Almonds 250 g, 8, pour 0.7; brown-sugar Soft Brown Sugar 500 g, 5, pour 0.5; cream Pouring Cream 300 g, 6, pour 0.3; orange-zest Orange Zest 60 g, 5, pour 0.5; rose-drops Rose Drops 50 g, 7, piece 1 g; cinnamon Ground Cinnamon 50 g, 5, pour 0.85; oats Rolled Oats 500 g, 3, pour 0.4; choc-buttons Chocolate Buttons 200 g, 9, piece 5 g. **Teas** (tin of 20 cups, 6 coins; all caffeine-free, which is never mentioned): garden-mint Garden Mint (pour 0.2), apple-cinnamon Apple & Cinnamon (0.5), red-bush-vanilla Red Bush Vanilla (0.4), hot-cocoa Hot Cocoa (0.8, thick).

**Mixes**

| id             | name               | weighed (g)                                          | eggs | heat | min | laps | stiff | tags              | value |
| -------------- | ------------------ | ---------------------------------------------------- | ---- | ---- | --- | ---- | ----- | ----------------- | ----- |
| almond-sponge  | Almond Cloud       | flour 120, ground-almond 100, caster 180, butter 175 | 3    | 3    | 26  | 3    | 0.35  | elegant, classic  | 11.4  |
| spice-sponge   | Cinnamon Lantern   | flour 200, brown-sugar 180, butter 175, cinnamon 6   | 3    | 3    | 28  | 3    | 0.35  | classic, bold     | 9.8   |
| orange-sponge  | Orange Blossom     | flour 200, caster 180, butter 175, orange-zest 12    | 3    | 3    | 24  | 3    | 0.3   | romantic, playful | 9.8   |
| ribbon-chiffon | Ribbon Chiffon     | flour 160, caster 150, cream 120, butter 100         | 4    | 2    | 32  | 4    | 0.2   | dreamy, elegant   | 10.5  |
| oat-crust      | Oat Crumble Crust  | flour 150, oats 100, brown-sugar 60, butter 120      | 1    | 4    | 20  | 2    | 0.75  | casual, classic   | 5.3   |
| rose-biscuit   | Rose Petal Biscuit | flour 300, butter 200, caster 100, rose-drops 4      | 1    | 2    | 12  | 2    | 0.8   | romantic, dreamy  | 8.0   |

**Fillings:** lemon-curd Lemon Curd (7; playful, casual), choc-cream Chocolate Cream (8; bold, elegant), berry-cream Strawberry Cream (7; romantic, playful).

**Products** (order hours in §2)

| id              | name                   | mixes (batches)                   | stack                                                     | frosted units | filling         | patterns A / B                                      | tags             |
| --------------- | ---------------------- | --------------------------------- | --------------------------------------------------------- | ------------- | --------------- | --------------------------------------------------- | ---------------- |
| petit-fours     | Petits Fours (6)       | any sponge (1)                    | auto, 6 squares                                           | 1 (icing)     | optional        | 6 dot crowns (closed) / 6 lattice ticks (open)      | elegant, dreamy  |
| tartlet-set     | Tartlet Set (6)        | shortcrust or oat-crust (1)       | auto, 6 cases                                             | 0             | any 1, required | rosette dots (closed) / glaze swirls (open)         | elegant, casual  |
| spiral-roll     | Spiral Roll (6 slices) | any sponge (1)                    | one **Roll** tap, then auto                               | 1             | required        | top zigzag (open) / pearl line (open)               | playful, classic |
| biscuit-wreath  | Biscuit Wreath (12)    | biscuit-dough or rose-biscuit (2) | drag 12 into a ring of 12 slots, or **Place a batch** (6) | 2 (icing)     | none            | 4 outlines + bow (closed) / 4 outlines + leaf trail | playful, dreamy  |
| three-tier-cake | Three-Tier Garden Cake | sponge per tier (3)               | drag 3 tiers + Level it                                   | 3             | 3 required      | 3 scallop borders + swag / 3 bead borders + loops   | regal, elegant   |

**Toppings:** candied-orange (3; playful, bold), sugar-shimmer Sugar Shimmer (pinch, 3; dreamy, regal), mint-leaf (2; casual, elegant), sugar-daisy (3; playful, romantic), wafer-fan (3; elegant, classic), marzipan-bee (4; playful, dreamy), choc-sail Chocolate Sail (4; bold, elegant), sugar-snowflake (3; dreamy, elegant), toffee-shard (3; bold, classic).

**Clients** (rolled as §4.5; request lines kept to ≤ 2 sentences in content; open in both careers)

| id               | who                                           | gate / min rep     | products                                                  | required tags                            | favoured colours      | avoid           | required toppings                  | budget  | fee     | days | min Q |
| ---------------- | --------------------------------------------- | ------------------ | --------------------------------------------------------- | ---------------------------------------- | --------------------- | --------------- | ---------------------------------- | ------- | ------- | ---- | ----- |
| juniper-troop    | Juniper Troop leaders, badge day              | — / 10             | biscuit-wreath                                            | playful, casual                          | emerald, mustard, sky | colour black    | marzipan-bee×2                     | 35–50   | 70–90   | 3–5  | 74    |
| twins-ines-sofia | Inès & Sofia (with their mum), 10th birthday  | — / 14             | spiral-roll, petit-fours                                  | playful, dreamy                          | lavender, blush, sky  | colour charcoal | sugar-daisy×4                      | 40–55   | 80–100  | 4–6  | 76    |
| mr-osei          | Mr. Osei, allotment keeper                    | — / 16             | tartlet-set                                               | casual; **requires** oat-crust           | sage, mustard, ivory  | —               | mint-leaf×6                        | 35–50   | 75–95   | 4–6  | 76    |
| councillor-nwosu | Councillor Nwosu, Lantern Night               | — / 20             | layer-cake, two-tier-cake                                 | dreamy, regal                            | navy, gold, lavender  | colour coral    | sugar-snowflake×4                  | 80–100  | 120–150 | 5–7  | 80    |
| ms-lindqvist     | Ms. Lindqvist, music teacher's concert        | — / 22             | petit-fours                                               | elegant                                  | navy, ivory, gold     | colour ruby     | sugar-pearls×6                     | 45–60   | 95–120  | 5–7  | 80    |
| aunt-maribel     | Aunt Maribel & Uncle Joss, silver anniversary | — / 26             | three-tier-cake                                           | regal, romantic; **avoids** cocoa-sponge | ivory, gold, blush    | —               | sugar-rose×3, sugar-shimmer×2      | 110–140 | 170–210 | 6–8  | 84    |
| wren             | Wren, mural painter                           | Dreamer / 8        | cupcakes, layer cake, biscuits, petits fours, spiral roll | dreamy, plus 3+ icing colours            | any 2 of 16 (rolled)  | —               | wafer-butterfly×2, sugar-shimmer×1 | 40–55   | 90–110  | 4–6  | 76    |
| mr-quill         | Mr. Quill, clockmaker                         | Perfectionist / 10 | petit-fours                                               | classic, elegant                         | ivory, charcoal, gold | —               | wafer-fan×3                        | 40–55   | 110–130 | 5–7  | 84    |

Value used at the lowest budget (fresh pantry, §5 rules): troop ≈ 29 (budget 35), twins ≈ 24–33 (40), Osei ≈ 25 (35), Nwosu ≈ 40 (layer cake) or 66–73 (two-tier) (80), Lindqvist ≈ 30 (45), Maribel ≈ 81 (110), Wren ≈ 24–31 (40), Quill ≈ 21 (40). Every brief fits with 5–30 coins of headroom. Wren's "3+ colours" is a new brief field, `minColours` (0 on every other brief), checked by the colours criterion.

**Upgrades** (salon career only)

| id                | name               | price | min rep | effect                |
| ----------------- | ------------------ | ----- | ------- | --------------------- |
| gooseneck-teapot  | Gooseneck Teapot   | 80    | 30      | Tea Pour band ×1.2    |
| showpiece-trolley | Showpiece Trolley  | 130   | 32      | Showpiece hours −2    |
| tea-trolley       | Tea Trolley        | 140   | 34      | +1 table on Salon Day |
| silver-stands     | Silver Cake Stands | 160   | 38      | Table pay ×1.10       |

**Story beats** (shared beats with **You** lines get 5 `byTrait` variants in content, written in the §4.7 voices)

| id                                                   | trigger                                           | lines (short)                                                                                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pa-salon-offer                                       | salon-offer                                       | **Otti:** "This key opens the back parlour. Tea and cake, like the old days." / **Otti:** "The glasshouse fair starts soon, too." / choice: Open the Comet Room · Not yet |
| pa-intro-salon                                       | intro-salon                                       | **Otti:** "The bakery and the parlour, both yours. I'll pop in for tea." / **You:** (byTrait)                                                                             |
| pa-salon-open                                        | salon opened                                      | **Narrator:** Dust sheets off, lamps on. The Comet Room glows. / **You:** (byTrait)                                                                                       |
| pa-first-salon-day                                   | first-salon-day                                   | **Otti:** "Stands up, cups warm, napkins folded." / **Otti:** "Every table is a small celebration." / **You:** (byTrait)                                                  |
| pa-fair-invite                                       | first fair season                                 | **Marigold Asante:** "Welcome to the Fair! Bring one showpiece and your best smile." / **Marigold:** "Every baker goes home with a ribbon."                               |
| pa-first-showpiece                                   | first showpiece started                           | **Otti:** "Big bakes are just small steps, stacked. One at a time."                                                                                                       |
| pa-first-fair                                        | first-fair-done                                   | **Narrator:** The cloche lifts and the glasshouse claps. / **You:** (byTrait)                                                                                             |
| pa-gold-ribbon                                       | first Gold Ribbon or better                       | **Ruth Fenwick:** "Steady hands and a happy cake. Gold suits you."                                                                                                        |
| pa-tent-glasshouse                                   | Glasshouse Hall reached                           | **Mr. Pell:** "The big hall! Mind the plants, and the sunbeams on your icing."                                                                                            |
| pa-tent-grand                                        | Grand Glasshouse reached                          | **Marigold:** "The Grand Glasshouse. Otti showed a cake here, years ago."                                                                                                 |
| pa-otti-tea                                          | third season start                                | **Otti:** "You remembered how I take my tea. The street's lucky to have you."                                                                                             |
| pa-ribbon-wall                                       | Silver or better in all 4 seasons, and a Gold won | **Narrator:** Ribbons hang from every season on the wall. / **Otti:** "Forty years, and I never filled a wall like that. Proud of you."                                   |
| pa-every-hook-gold                                   | Gold or better on all 8 hooks                     | **Otti:** "Every hook gold. I'm framing this."                                                                                                                            |
| pa-trait-dreamer-wren / pa-trait-perfectionist-quill | Wren / Mr. Quill first pins an order              | **Wren:** "Paint me a cake that feels like weather." · **Mr. Quill:** "I like things exactly so. I hear you do too."                                                      |
| pa-trait-trendsetter-preview                         | Trendsetter first sees next season's themes       | **Marigold:** "You've spotted next season's themes already? You're a step ahead."                                                                                         |
| pa-trait-charmer-parlour                             | Charmer's first Salon Day ends                    | **Otti:** "Half the street asked for you by name. That's a parlour full of friends."                                                                                      |

### 10.8 Economy sanity checks (Standard unless noted)

- **Baseline:** a decent Corner Baker week at reputation 30 is about 6 orders × ≈ +64 − rent 70 ≈ **+316**, so ≈ **+632** over two weeks. 18 h of orders earns ≈ +164.
- **Value used:** salon trays ≈ petits fours 11.5, tartlets 12, biscuits 10.5, plus one gel per two-colour tray, so ≈ 36 for a full shelf. Showpiece ≈ layer cake 28, wreath 29, two-tier 61–70, three-tier 84–96, each under its tent budget (95–155). The Baker's Hamper covers ≈ 30.
- **Salon week (decent, 4 tables):** 3 salon trays (18 h), then 3 orders at fees ≈ 90 (pay ≈ 103, value ≈ 30, net ≈ +73 each) = +219. Salon Day: 4 tables × ≈ 51 (29 + 10 + 5 + 4 + 3) = 204 − 36 trays − 2 tea = +166. Counter Day sells the ≈ 6 unplated items at 5.5 = +33. Rent −100. **≈ +318.** The 18 h of trays earn ≈ +199, more than 18 h of orders, so baking for the salon pays.
- **Fair week (decent):** 2 days of showpiece, 3 orders = +219. The Fair (tent 2, overall ≈ 77) pays 30 + 20 + 81 = +131; the showpiece costs ≈ 61 − 30 (hamper) = −31; rent −100. **≈ +219.**
- **Season:** ≈ +318 + 219 = **+537**, about 0.85 × the Corner Baker's +632. With 6 tables all 18 items are plated and none reach the counter: Salon Day 6 × 51 − 36 − 4 = +266, salon week ≈ +385 and season ≈ **+604**, about 0.96 ×. Fair reputation, ribbons and the +2 buzz per table make up the rest.
- **Decent panels** (showpiece quality 87, spend 0.6 × budget, one extra touch at 0.85, side plates of quality 85 carrying one of the two theme tags):
  - Bench = 0.55 × 87 + 0.15 × 85 + 0.20 × 65.5 + 0.10 × 90 ≈ 83.
  - Garden ≈ 33 + 21 + 20 ≈ 75.
  - Visitors ≈ 18 + 27 + 30 ≈ 75.
  - Overall ≈ 77: Silver Ribbon, and the tent advances.
- **Other players:** full assist ≈ 73 (Silver, advances). No side plates ≈ 48 (Baker's Ribbon; does not advance on Standard). Mastery (quality 92, two touches at 0.9, side plates carrying both theme tags) ≈ 89 (Gold).
- **Pass rate target 75–90%:** the simulated "decent Standard" player draws step accuracies from the seeded RNG (weigh 0.88 ± 0.08, stir 0.85 ± 0.08, bake 0.85 ± 0.15, pipe 0.80 ± 0.10) and makes a style or topping slip 8% of the time. Minimum qualities are read from `content/client.ts`, never from this doc. Salon-season bots own the 4 bakery upgrades. If the simulation lands outside 75–90%, the minimum quality of the 4 highest clients is tuned first, ±2 at a time.
- **No bankruptcy spiral:** the worst steady case, all soft fails (0.4 × 90 − 30 ≈ +6 each), gives a salon week of 3 × 6 + Salon Day (tables at quality 50 and pour 0.5: 4 × 38 − 38 ≈ +114) + Counter Day 30 − 100 ≈ +62, and a Fair week of 18 + 50 − 31 − 100 ≈ −63, so a season breaks even. **Parlour grace** (Standard only, once per season): if coins after rent would go below 0, Otti covers the parlour's 30 and the beat line says so. "Rest the parlour" drops rent to 70 for a season. The §5 coin-jar rule and shifts still apply.
- **Relaxed is always recoverable:** rent is ×0, every order passes, every table pays at least 29, and the shift is always open, so coins can never stay at 0.
- **Challenging:** rent 150, minimums +6, a fail pays 0 and costs −3 reputation; the panels are unchanged; tents need 65. A decent player passes ≈ 75–80%.

### 10.9 Save migration (schema 1 → 2)

- `SCHEMA_VERSION = 2`; new `core/saveMigrations.ts` exports `SAVE_MIGRATIONS = { 1: addDepthFields }`, passed to `parseSaveWith` as ADEEVA (`saveMigrations.ts`) and Thrift-Flip do.
- `addDepthFields(raw)` is pure and builds a new object without touching its input. It:
  - adds `career: "bakery"`, `salon: null` and `fair: null`;
  - adds `profile.startedAs: "bakery"`, read back by the Patisserie Profile parser (§10.1);
  - adds zero counts for the 8 new ingredients, 3 fillings and 9 toppings, and a new `pantry.teas` with all 4 teas at 0;
  - adds `minColours: 0` to every `Brief`: each gig offer, each active gig and `activeRun.brief`, because the parser is strict;
  - adds `flourishes: []`, `word: null` and `design.split: 6` when `activeRun` is not null;
  - adds `quality: null` to each Bake Book entry (§10.5).
- Everything else (calendar, gigs, the counter session with its `productId` values, Bake Book, log, story, RNG) is kept as is, so an in-progress order or Counter Day continues exactly. `TrayProductId` is widened, never narrowed.
- `fair`, once created by `openSalon` or a salon start, holds `seasonStartDay`, `tent`, `themeId`, `entry`, `shownRunIds`, `ribbonWall: Record<FairThemeId, RibbonId | null>` and `ribbonsByRun: Record<runId, RibbonId>`. Ribbons live here, outside the Bake Book, which keeps only the newest 30 entries.
- The parser accepts only version 2 after migration. Unknown or damaged saves are still reported, never reset. `earnedReputation` accepts version ≤ 2, so the studio's `reputationOf` reads both v1 and v2 raw saves.
- An existing v1 player who already meets the thresholds sees `pa-salon-offer` after their next delivery or End Day. Nothing is granted silently.

### 10.10 Safety notes for the Fair and the salon

- **Kind fair, not a TV format.** On screen it is a "Fair" with "panels" of named neighbours. These words never appear: judge, elimination, rounds, star baker, showstopper, signature, technical, "bake off", "on your marks", "stop baking". There is no countdown drama, no rival bakers, no ranking or placings, no "going home" and no head-to-head. Every entry gets a ribbon from fixed score bands. Neighbouring stalls are scenery and are never scored.
- **Panels are warm and specific.** Lines praise first; the one growth tip starts "Next time, try…". Panels talk about the bake, never the baker's body, age or worth. No panel is shown frowning or giving a thumbs-down. Low scores read "Warmly cheered". Every panel member is an adult; a child only appears beside their family ("Pip and his dad").
- **No flames anywhere.** The glasshouse "string lights brighten"; nothing rises or floats away. Every lantern is a paper or electric glow, as §8 requires.
- **Salon:** guests are never timed, impatient or unhappy, and no one leaves. Tea is "warm" with no steam or scald play. Teas are caffeine-free, and caffeine and diet are never mentioned. There is no eating commentary and no calories. Spiral rolls slice themselves, with no knife shown. Candles stay unlit. The topping is "Sugar Shimmer" on screen so it never reads as craft glitter.
- **Adults stay safe and public.** The Fair is a busy public glasshouse; no adult asks the player to meet privately or keep a secret. Children (Pip, the twins) appear only with their families.
- **Defaults for 8-year-olds:** the Menu Board, Fair Board and Planner all open on a suggested choice ("Marigold suggests…", "Otti's picks") that one tap confirms.
- **Hint lines (≤ 12 words):**

| Screen      | Hint                                               |
| ----------- | -------------------------------------------------- |
| Tea Pour    | Hold to pour. Let go before the line!              |
| Plate       | Drag each treat to its tier.                       |
| Bookings    | Count the bookings, then pick each tray's colours. |
| Piped words | Trace each letter, one stroke at a time.           |
| Fair Board  | Pick two bakes to stand beside your showpiece.     |
| Planner     | Choose a cloth, some music, and who goes last.     |
| Level it    | Nudge the tier until the line glows.               |

- **Coins and ribbons only.** No entry fee, no real money and no online sharing. Before shipping, check that "Larkspur Patisserie Fair", "The Comet Room" and the new client names are not real trading or event names.

### 10.11 Build and test plan

- **Reuse first; extend without breaking anything:**
  - From ADEEVA's `core/runwayScore.ts`, the private `closerStrength`, the wow rule and `panel()` move to `engine/showOrder.ts`, `engine/wowScore.ts` and `engine/panelScore.ts`, with a generic `PanelScore.id: string`. `useShowClock`, `easing` and `PanelCard` (made generic through props) move to `ui/kit`, and `PetalFall` moves to `ui/art`. `CareerStep` moves to `ui/newGame`. ADEEVA's `storyChoice` pattern is ported to Patisserie's story queue.
  - ADEEVA imports the moved code and keeps its tests unchanged.
  - The salon and Fair reuse `weighAccuracy` and the pour model, `recordFollow`, the oven records, `traceAccuracy`, the `stack` slots, `placedPose`, `boxItUp`'s draw-without-replacement, ADEEVA's buyers cost rule, `qualityTip`, `rngDraw`, `abandonRun` and `storyVoice`.
- **New content files** (one concept each): `career` (becomes `CAREERS`), `tea`, `fairTheme`, `fairTent`, `tableCloth`, `fairMusic`, `menuTier`, `flourish`, `letterPath`, `panelMember`; the catalogue files above gain their ids.
- **New core files:** `salonOffer`, `openSalon`, `parlour`, `seasonCalendar`, `salonMenu`, `salonTray`, `traySplit`, `salonBookings`, `tableSession`, `teaPour`, `standPlating`, `tablePay`, `fairSeason`, `fairBrief`, `showpiece`, `flair`, `bakeTogether`, `fairEntry`, `sidePlates`, `fairPlan`, `fairPanels`, `fairPrize`, `fairSkip`, `ribbonWall`, `patisserieProfile` and `saveMigrations`. `reduce.ts` (112 lines today) sends the new cases to `reduceSalon.ts` and `reduceFair.ts`, so every file stays ≤ 700 lines.
- **New UI:** `CareerStep` cards, `MenuBoard` (with bookings and the split tally), `SalonShelf`, `TableService` (`TeaPourStation` with new `Teapot`/`TeaCup` art, `StandPlating` with `ThreeTierStand`), `FairBoard`, `FairPlanner`, `FairShowcase` (`GlasshouseBackdrop`, `ShowTrolley`, `Cloche`, `PanelBench`), `FairResults`, `RibbonWall` with `Rosette` art, new `TreatIcon` art, and the Level it and lettering overlays on the existing stack and pipe stages. All are mouse, touch and keyboard, ≥ 44 px, and follow reduced motion.
- **Build order:**
  - B1: careers, migration, unlock and start here.
  - B2: content ×2 in both careers.
  - B3: season calendar, salon menu, trays, bookings and Table Service.
  - B4: Fair season, showpiece and extra touches.
  - B5: showcase, panels, ribbons and the Ribbon Wall.
  - B6: simulation tuning and e2e.
- **Unit tests:**
  - Unlock thresholds at 29/30 reputation and 11/12 orders; "Not yet" keeps the card.
  - `startedAs`, the Patisserie Profile parser and studio reputation (missing `startedAs` → 0).
  - Rent timing around `seasonStartDay`, rest the parlour and parlour grace.
  - Season anchor: Salon Day and Fair Day when the salon opens in an odd and in an even global week.
  - Menu lock, salon-tray quality, hours and splits, booking draws, the split tally, swap colour, the empty-shelf day, pour bands per tea and upgrade, plating refusals and `tablePay` on every difficulty.
  - The Fair brief per tent; the `startShowpiece` window and its refusal during an order run; the skipped Fair.
  - Each extra touch's accuracy, Flair (none, assisted, Dreamer), `bakeTogether` minutes and validation, Otti's picks, the panel formulas with empty slots, ribbon band edges, `fairPrize`, tent advancement per difficulty and the Relaxed "Move up a tent?" choice, late staging, and the finale and every-hook rules.
  - Every new action is illegal in the wrong state and returns the same reference.
  - Migration: committed v1 fixtures (fresh, mid-order at pipe, open Counter Day, at threshold, 4 pending offers with 3 active gigs, and a day that is not a week start) load, keep their data, continue to a delivery and End Day, and get the offer when eligible. A deep-frozen fixture proves the input is never mutated. v3 and damaged saves are rejected.
- **Simulation (`depthEconomy.test.ts`, seeded):** a busy decent Corner Baker bot (one order every baking day, noisy step accuracies from the seeded RNG) plays 5 bakery weeks for five seeds; the parlour key arrives between day 11 and day 28 (days 13–16 in practice, so a player at 4–5 orders a week gets it late in week 3) and at least 70% of its orders pass. A decent salon season (three salon trays, served tables, orders, a showpiece and Otti's Fair plan) earns at least 0.80 × the same bot's two bakery weeks. A Relaxed salon season never takes coins below 0 and replays identically.
- **e2e** (`MAKER_PORT=5188`):
  - `patisserie/unlock.spec.ts`: a v1 save at the threshold loads, delivers, sees the offer and opens the Comet Room.
  - `patisserie/salon.spec.ts`: start here as Salon Pâtissier, confirm the suggested menu, read the bookings, bake a salon tray by hand with a split, then on Salon Day plate a stand by drag and by keyboard, pour and serve.
  - `patisserie/fair.spec.ts`: a prepared Fair Day save; confirm Otti's picks, plan, run the showcase in motion and in reduced motion, lift a cloche, skip, see the ribbon on the Bake Book card, save, reload and continue.
- **Checks:** `MAKER_PORT=5188 pnpm lint`, `pnpm typecheck`, `pnpm test` (twice) and `pnpm e2e` all pass, with no network requests, no `Math.random`/`Date` in core or content, no comments, and no file over 700 lines.

### 10.12 As built

- **Shared code moved, not copied:** `engine/panelScore.ts` (`panel()` and a generic `PanelScore`), `engine/showOrder.ts` (`closerStrength`) and `engine/wowScore.ts` (the wow rule) now serve ADEEVA's runway and the Fair panels; `ui/kit/PanelCard.tsx` (props for icon, tone, blurb and verdict), `ui/kit/useShowClock.ts`, `ui/kit/easing.ts`, `ui/art/PetalFall.tsx` (now with an optional stage size), `ui/newGame/CareerStep.tsx` (cards as props) and `ui/newGame/careerDraft.ts` (the career step's draft and checks) are shared; ADEEVA imports them and its tests are unchanged.
- **Season start order:** pick the theme (Baker's Hamper arrives), then the Menu Board opens on Marigold's suggestion with **Open the parlour with this menu** or **Rest the parlour this season**. Each tier picks one of its products, any mix of that product's kind and two colours from the season theme's palette.
- **Salon trays** use buttercream like orders plus one gel per split colour; they carry no filling. The quick pipe is the first path of the product's pattern A.
- **Tea** is sold as tins of 20 cups (6 coins) from the Tea tins list on the salon plan and in the Comet Room; serving a table uses one cup of each booked tea. A pour can be redone until the table is served.
- **Plaque** words are only for Fair showpieces (Piped words); salon tables have no plaque. A plaque uses 40 g of Chocolate Buttons, so that ingredient has a use. The word is stored on the Fair entry and drawn on every preview of the showpiece.
- **A showpiece** goes into the Bake Book when it is taken to the Fair (owner "Fair showpiece") so its ribbon shows on its card. A set-aside showpiece can be started again in the same season; ingredients stay spent. A showpiece still on the bench, or an entry never staged, at the end of the season plays `pa-fair-skipped`.
- **Flair** is rounded to a whole number (one touch at 0.85 gives 66). Panel notes praise the part that added the most to the panel's score; the verdict word sits above them.
- **Level it** is an unscored, unsaved ritual on the three-tier stack: nudge the middle and small tiers with the arrow buttons or arrow keys until the centre line glows.
- **The showcase** runs title, lights, then for each plate a trolley glide, a cloche that lifts on tap, Enter or Space (or by itself after 3 s) and a sparkle reveal, then petals and clapping, then the three panel cards flip up and count. Skip appears after the first reveal; reduced motion shows crossfaded stills with the same tap and timing.
- **Core files** follow §10.11 with a few merges: the unlock check lives in `openSalon.ts`, the Fair entry is built in `showpiece.ts`, the skipped Fair is handled when `fairSeason.ts` rolls the season, `fairPlan.ts` and `fairStage.ts` hold planning and staging, `upgradeShop.ts` keeps salon upgrades for the salon career and `storyChoice.ts` handles the parlour key.
- **e2e:** `e2e/patisserie/salonCareer.spec.ts` (a committed version 1 save at the threshold, the parlour key, the first season, a showpiece by hand with piped words, the Fair Board, Planner, showcase with three cloche lifts, ribbons, save and reload), `e2e/patisserie/tableService.spec.ts` (start here as Salon Pâtissier, a salon tray with a keyboard-chosen split; Salon Day plating by drag, keyboard and tap, a keyboard tea pour, serving, closing and reloading) and `e2e/patisserie/depthScreens.spec.ts` (every new screen at 1280×800 and 820×1180 with no sideways scroll, plus the reduced-motion showcase).
