# Thrift-Flip Studio — Game Design (id: `thrift-flip`)

A playable slice of the Maker Studio contract (`work/0003-studio/design.md`), at about a third of ADEEVA's depth. You run a small remake stall at a weekend market. Regulars bring you briefs; you plan the piece, buy secondhand finds, take them apart, clean them, then remake them with ADEEVA's fabric, cutting and sewing systems. Each week you sell your own pieces on Stall Day. All names, text and art are original. The safety promise from the studio contract applies to every screen.

## 1. Fantasy and audience

- **Fantasy:** "I found a tired old shirt for 6 coins and turned it into the tote everyone at the market asked about." You spot a find's potential and bring it back to life; Results opens on a before/after split card.
- **Ages 8–15+.**
  - 8–11 play on Relaxed with Assist toggles on. They enjoy scrubbing stains, decorating with patches and writing price tags.
  - 12–15+ play Standard or Challenging. They plan layouts around worn spots, chase a clean seam, and price fairly.
- **Reading level:** UI hints of one sentence and 12 words or fewer, at about Grade 3. Client lines are 1–2 short sentences. Numbers always come with an icon (coin, clock, leaf).
- **Why it is good for kids (without overclaiming):** it practises fine pointer control and planning within a budget, treats reuse as creative rather than a chore, and asks for fair pricing rather than "get rich" flipping.
- **Parent page sentence (exact):** "This game does not teach real sewing, washing or tool use."

**Kid-facing labels** (used on every screen; the design terms on the left never appear in hints):

| Design term      | Label on screen        |
| ---------------- | ---------------------- |
| notions          | "Saved buttons & bows" |
| pitch fee / rent | "Stall rent"           |
| sustainability   | "Leaves"               |
| unpick           | "Snip old stitches"    |
| snag             | "Snag"                 |
| grain            | "Fabric lines"         |

## 2. Core loop and stages

**Career (only one):** _Market Stall Remaker_ at a striped stall in "Saltmarsh Lane Market". Start: 90 coins, reputation 0, weekly stall rent 80.

**Hub loop:** check the offer board → start a flip (commission or own piece) → deliver it or keep it for Stall Day → end the day. Days 1–6 of each week are working days; day 7 is **Stall Day**.

**Stall Day** takes the whole day: rack, prices, sales scene, then rent. No flip or shift that day. Own-stall flips skip brief, fee, deadline and the review criteria, and are judged by quality and sustainability only.

**`FlipRun.stage`** = `brief → design → market → unpick → clean → layout → cut → sew → finish → review → done`

| #   | Stage  | Hours                     | What happens                                                                                                                                                                                                                                                                                                                                           |
| --- | ------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | brief  | 0                         | Client card: recipe(s) allowed, required tags, favoured and avoided colours, avoided materials, required finishes, budget, fee, deadline, minimum quality and minimum Leaves. The live checklist stays visible afterwards. Skipped for own-stall runs.                                                                                                 |
| 2   | design | 1                         | Pick a recipe and its ADEEVA parts. `ProductPreview` shows it on a hanger or stand (never a body).                                                                                                                                                                                                                                                     |
| 3   | market | 1 per visit               | The rail shows 6 finds (§4.1), each with a condition ribbon, a price and a **Fits** badge (✓ or ✗) for the chosen plan. Opening the rail costs 1 hour; several finds can be bought in one visit and coins are checked atomically. Bought finds are picked for the flip automatically (up to 2). Owned finds can be used instead, which costs no hours. |
| 4   | unpick | 1                         | Pull out each stitch on the chosen finds (§3.1). Opens them into flat **panels** and saves their buttons & bows.                                                                                                                                                                                                                                       |
| 5   | clean  | 1                         | Scrub stains off the panels (§3.2). Sets the restored condition.                                                                                                                                                                                                                                                                                       |
| 6   | layout | 0                         | Drag pattern pieces onto the panels (§3.3).                                                                                                                                                                                                                                                                                                            |
| 7   | cut    | 2 (layout + cut together) | ADEEVA cut trace per piece. Confirming is idempotent per run and panel.                                                                                                                                                                                                                                                                                |
| 8   | sew    | 2 (1 for scrunchie-trio)  | ADEEVA sewing machine, one strip per seam.                                                                                                                                                                                                                                                                                                             |
| 9   | finish | 1                         | Place patches, mend stitches and ADEEVA trims on the preview.                                                                                                                                                                                                                                                                                          |
| 10  | review | 0                         | Evaluate once and reward once. Commissions are delivered from the hub; own pieces go to the stall rack.                                                                                                                                                                                                                                                |

A full flip costs 9 hours (8 when using owned finds), against a 10-hour day, so one flip fits per working day. Completing a stage costs that stage's hours the first time only; walking forward again after a revisit is free, unless a new find joins the flip, which reopens the workbench hours. The plan, the rail and the layout can be revisited until the cut; after that the plan is locked, as in ADEEVA's `stageNavigation`. Going back closes the rail. Changing the plan or the finds clears the layout; unpick and clean progress stays with each find that is still chosen. Kept cut traces are stored on the flip and stay until their piece moves. No flip work happens on Stall Day.

**Finds on the bench.** Chosen finds stay in the stockroom until the cut, so setting a flip aside before the cut costs only the hours spent. At the cut the finds are used up, their saved buttons & bows go into stock and their leftovers become scraps.

**Fits badge.** It comes from a hand-written fit table in `content/findFit.ts`, listing for each find the plans it holds on its own. A plan is keyed by recipe, plus the chosen ADEEVA parts for the skirt and top (for example `remade-skirt:pencil-skirt` or `remade-top:wrap-bodice+cap-sleeve`), because the badge is shown after the plan is chosen. A unit test checks every ✓ entry with a real placement through the core auto-layout, once for each of the find's two worn-spot positions, and a recipe's blocked materials are never ✓. Examples of ✗: Gingham Shirt for Envelope Cushion and Market Tote; Grandad's Blazer, Teal Satin Dress and Coral Check Coat for the pencil skirt; any denim find for the Remade Top. A ✗ find can still be used as one of two finds (§3.3).

## 3. Hands-on mini-games

All mini-games use Pointer Events (mouse and touch) and never rely on hover. Every draggable item, handle and button is at least 44×44 px, and trace paths are drawn at least 12 px wide. Keyboard players use the assisted path of each step: Enter on a stitch snips it with the helper, Soak it, Assist cut, Space to sew with the arrow keys to steer, Enter on a pattern piece or finish to lay it down, nudge and turn buttons, and the price slider. Scoring lives in core: the UI only sends counts or samples. Tolerances multiply as **base × trait × upgrade × difficulty**; difficulty is ADEEVA `content/difficulty` `toleranceMultiplier` (Relaxed 1.3, Standard 1, Challenging 0.85). Perfectionist is ×1.2 on every tolerance below. **Assist caps:** the two new mini-games (Unpick, Clean) cap at 0.7; Cut and Sew keep ADEEVA's 0.8.

### 3.1 Unpick ("Snip old stitches"; pull-the-stitch)

- **Input:** each stitch line shows 6–12 stitch marks, one every 4 cm, each with a hit area of at least 44 px. Press on a mark, drag outwards in any direction, release. With drag distance `d` (panel cm):
  - `1.0 cm ≤ d ≤ maxPull`: **clean pop**; the stitch comes out.
  - `d < 1.0 cm`: nothing happens, no penalty.
  - `d > maxPull`: **snag**; the stitch stays in. Condition −0.02 per snag, at most −0.10 per find.
- **Tolerance:** `maxPull = 4.0 cm × (1 − 0.5 × sewDifficulty) × trait × upgrade (Sharp Seam Ripper 1.15) × difficulty`. On Standard this is about 3.8 cm on cotton and 2.6 cm on silk, so delicate fabrics really are harder.
- **Score:** `unpickAccuracy = pops ÷ (pops + snags)`, averaged over lines.
- **Record and checks:** per line `{popped: stitch indices, snagsAt: stitch indices, attempts, assisted}`; the UI sends one pull at a time (stitch and drag distance) and the core decides pop or snag. Each pop or snag is an attempt; a pull under 1 cm changes nothing. A popped stitch cannot be pulled again. A line is done when every stitch has popped; if it reaches 3 × stitches attempts, its remaining stitches come loose and count as snags (for accuracy and for condition).
- **Close-up:** each stitch line is shown on its own, turned flat across the bench, so a 4 cm pull is a comfortable drag on a tablet.
- **Buttons & bows:** each notion (button, bow, lace, ribbon-belt, pearl, sequin-patch) sits on one stitch; a line can hold several. It is saved when that stitch pops cleanly. A snag on that stitch loses it; with the Sharp Seam Ripper, only the second snag loses it. Saved notions reach the stock as saved ADEEVA trims at the cut.
- **Assist:** tap a stitch to pop it. No snags; accuracy is capped at 0.7.
- **Fun at 8 and at 15:** at 8, a row of satisfying pops with a "ping" for each saved button. At 15, short, careful pulls on silk where a greedy drag costs condition.

### 3.2 Clean (scrub stains)

- **Input:** drag over a stain (a circle of 6–10 cm radius, drawn at no less than 44 px). Each stain is a grid of 9–16 cells. While the pointer is down inside a stain the UI samples at 60 ticks per second, and a tick counts only when pointer speed is at least 3 cm/s, so holding still does nothing. A counted tick is **harsh** when speed is above the gentle limit.
- **Clearing:** a cell clears after `ticksToClear ÷ cells` non-harsh moving ticks inside it. `ticksToClear = 180 × materialFactor ÷ washTub` (materialFactor 1.0 cotton, linen, denim; 1.2 wool; 1.3 silk, satin, velvet, tulle; Big Wash Tub 1.25).
- **Gentle limit (every material):** `gentle = 60 cm/s × (1 − 0.6 × sewDifficulty) × trait × upgrade (wash-tub 1.15) × difficulty`: about 56 cm/s on cotton and 35 cm/s on silk.
- **Scored per stain:** `dirt` = share of cells not yet cleared; `fade = min(0.3, 0.002 × harshTicks)`. `cleanAccuracy = (1 − average dirt) × (1 − average fade)`.
- **Validation:** the UI sends cumulative counts per stain `{cellTicks per cell, harshTicks, scrubTicks}` about every 300 ms; counts only grow, `harshTicks ≤ scrubTicks`, moving plus harsh ticks ≤ scrubTicks, and at most 1200 scrubTicks per stain. Pointer speed is measured every animation frame, so holding still does nothing.
- **Done:** a stain is done when every cell is cleared or it has used its 1200 ticks; every stain must be done (or soaked) before the layout.
- **Stains** are rolled when a find is bought: panel, radius 6–10 cm, centre inside the panel, and 9, 12 or 16 cells (3×3, 3×4 or 4×4 over the stain's square).
- **Restored condition:** `restored = condition − snagLoss + (1 − condition) × cleanAccuracy × 0.8`, clamped to 0–1, averaged over the finds used.
- **Assist** ("Soak it"): one tap clears every stain; cleanAccuracy is capped at 0.7 and fade is 0.
- **Fun at 8 and at 15:** at 8, bubbles and sparkle as stains vanish. At 15, steady circles on silk, balancing speed against fading.

### 3.3 Layout and cut (reused from ADEEVA)

- **Finds per flip:** a flip may use panels from up to **2 finds**. Bounds are the union of their panels. Hours do not change.
- **Layout:** the same drag and 45°-rotate interaction as ADEEVA's cut layout (double-tap turns a piece 90°), with the panels as bounds. Panels of the chosen finds are laid out in rows up to 160 cm wide with 6 cm gaps; a piece must sit wholly on one panel. A Tired find's worn spot (12×12 cm) is an obstacle in the overlap test.
- **Auto-layout (Relaxed only, Scrunchie Trio and Envelope Cushion):** one tap keeps well-placed pieces and places the rest (or all of them if needed); grain is capped at 0.8.
- **Fabric lines (grain):** ADEEVA's `grainScore` (0/180 → 1.0; bias 1.0 for bias-friendly pieces, else 0.7; 90/270 → 0.6). Recipe pieces carry `slot?: GarmentSlot`; with no slot, no bias bonus applies.
- **Cut:** ADEEVA's `TraceMat` on each piece; the UI sends the traced samples and the core scores them with `traceAccuracy` and `cutTolerance`: base 1.2 cm × trait × upgrade (Cutting Mat 1.15) × difficulty. **Assist cut** sends no samples for a piece and scores a flat 0.8. All pieces are cut together in one idempotent commit.
- **Fun:** fitting pieces around a worn spot, or across two finds, is a small puzzle; the trace keeps ADEEVA's "steady hand" feel.

### 3.4 Sew (reused from ADEEVA)

- ADEEVA's sewing machine, unchanged: hold to feed, move sideways to steer; `isNeedleOnLine` each tick; `recordSeam` validates 60–1200 ticks per seam; `seamAccuracy = insideTicks / ticks`; band from `sewBand` = 0.12 × (1 − 0.5 × sewDifficulty) × trait × machine × difficulty.
- The Refurbished Machine (ADEEVA) is not sold here. **Assist sew** widens the band ×1.6 and caps the seam at 0.8. Recipes have 1–4 seams.

### 3.5 Finish (reused decoration, new patches)

- Drag finishes onto the preview (or press Enter on a drawer item), then move, rotate (15° steps) and scale them (0.5–2, ADEEVA's `MIN/MAX_DECORATION_SCALE`) with handles or buttons. Tapping a placed finish returns it to stock. The preview canvas is 400×400; ADEEVA's `TrimArt` draws trims.
- New trims, mend stitches and paint dots are paid when placed and refunded when removed or when the flip is set aside. Saved trims and scraps leave the stock when the flip is delivered or racked.
- Paint dots take one of six palette colours (coral, mustard, teal, lavender, ivory, rose).
- **Scraps:** each patch uses 1 scrap and takes on its source's colour and tags; it counts as secondhand. At most 12 scraps are held.
  - The tf-intro gift is "Femi's scrap tin": 4 ADEEVA fabric scraps (`sage-linen`, `emerald-velvet`, `ruby-velvet`, `sky-gingham`).
  - Each used find leaves 1 scrap per 600 cm² of panel area not covered by pieces, at most 3 per find.
- This step is creative, not scored on skill. It feeds the style, colours, finishes and Leaves criteria.

### 3.6 Price tag (Stall Day only)

- **Input:** a big slider on a kraft price tag, in steps of 1 coin with ±1 buttons sized 48 px; arrow keys work on the slider. The slider runs from 1 to twice the fair value and each tag starts at 125% of it, above the band, so the player picks a price. One tag per own-made piece; the rack holds 4 (6 with the Stall Awning). Every piece needs a tag before the awning opens; the stall can be held once per Stall Day, even with an empty rack.
- **Fair value:** `V = round(recipe.baseValue × (0.6 + 0.4 × quality/100) × (1 + 0.1 × hotTagMatches) + 0.1 × sustainability)`.
- **Guide:** "Pieces like this go for `round(0.9V)`–`round(1.1V)`." The fair band is exactly these two numbers, inclusive.
- **Outcome** (deterministic, no RNG; one rack-wide "sold or stayed" result, no per-shopper reactions):

| Price                 | Result                                                                            |
| --------------------- | --------------------------------------------------------------------------------- |
| ≤ 0.7V                | Sells. The tag reads "A bargain!"                                                 |
| 0.7V – below the band | Sells                                                                             |
| In the fair band      | Sells, with the **Fair Price** badge and +1 reputation (at most +2 per Stall Day) |
| Above the band        | Stays on the rack until next week. Nothing is lost.                               |

- The most coins come from the top of the fair band, so the fair price is also the best price.
- **Fun at 8 and at 15:** at 8, writing tags and seeing the rack empty. At 15, hitting the fair band and planning pieces for this week's crowd.

### 3.7 Hint lines (≤ 12 words; never "notions", "bias", "selvedge" or "pitch")

| Screen             | Hint                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| Unpick             | Drag each stitch out a little. Too far makes a snag.                 |
| Clean              | Keep moving! Gentle circles clear stains. Too fast fades the colour. |
| Layout             | Fit every piece on the fabric. Dodge the worn spots.                 |
| Cut                | Follow the dashed line slowly with your scissors.                    |
| Sew                | Hold to sew. Slide sideways to stay on the line.                     |
| Finish             | Add patches and saved buttons & bows. Tap one to remove.             |
| Price tag          | Pick a price between the guide's two numbers.                        |
| Assist fallback    | Stuck? Tap Assist for help. You can switch back anytime.             |
| Safety (Workbench) | Real washing, irons and sharp tools: ask an adult first.             |

## 4. Content catalog

Shared from ADEEVA (imported from `src/games/adeeva`) and the engine palette: style tags (10), colours (16), prints (6), materials (8), trims (8) and fabrics (20, as scraps only).

### 4.1 Finds (14). Panels are W×H in cm; stitch lines list stitches per line.

| id               | name               | material | colour / print    | panels              | price | tags              | notions        | stitch lines | rep | backstory                            |
| ---------------- | ------------------ | -------- | ----------------- | ------------------- | ----- | ----------------- | -------------- | ------------ | --- | ------------------------------------ |
| faded-jeans      | Faded Jeans        | denim    | navy / solid      | 60×95, 60×95        | 14    | casual, edgy      | button×1       | 10, 10, 6    | 0   | Climbed a hundred apple trees        |
| gingham-shirt    | Gingham Shirt      | cotton   | sky / check       | 55×70, 28×70, 28×70 | 8     | playful, casual   | button×6       | 9, 9, 8      | 0   | Went to every school picnic          |
| linen-curtain    | Linen Curtain      | linen    | sage / solid      | 120×160             | 20    | classic, casual   | ribbon-belt×1  | 12, 12       | 0   | Shaded a bakery window               |
| sailor-top       | Stripy Sailor Top  | cotton   | navy / stripe     | 50×60, 50×60        | 10    | casual, classic   | —              | 8, 8         | 0   | Sailed a tiny boat round the harbour |
| polka-tablecloth | Polka Tablecloth   | cotton   | mustard / dot     | 130×130             | 12    | playful           | —              | 12           | 0   | Hosted thirty birthday teas          |
| tea-dress        | Garden Tea Dress   | cotton   | blush / floral    | 120×70, 40×40       | 18    | romantic, playful | bow×1          | 10, 8, 6     | 0   | Danced at forty summer fairs         |
| black-jeans      | Midnight Jeans     | denim    | black / solid     | 60×95, 60×95        | 16    | edgy, bold        | button×1       | 10, 10, 6    | 5   | Played in a garage band              |
| tulle-petticoat  | Puffy Petticoat    | tulle    | blush / solid     | 140×60              | 12    | dreamy, romantic  | lace×1         | 12, 8        | 5   | Twirled through a school play        |
| wool-blazer      | Grandad's Blazer   | wool     | charcoal / solid  | 50×70, 30×70, 30×70 | 22    | classic, elegant  | button×3       | 9, 9, 8, 6   | 9   | Went to chess club every Tuesday     |
| scarf-pair       | Twin Silk Scarves  | silk     | lavender / floral | 70×70, 70×70        | 15    | romantic, elegant | —              | 8            | 9   | Blew about on a seaside pier         |
| satin-dress      | Teal Satin Dress   | satin    | teal / solid      | 60×110              | 16    | elegant           | pearl×2        | 10, 10       | 13  | Went to a wedding by the lake        |
| party-skirt      | Velvet Party Skirt | velvet   | plum / solid      | 90×65               | 18    | regal, bold       | —              | 9, 8         | 13  | Sparkled at a New Year party         |
| sparkle-cardigan | Disco Cardigan     | satin    | black / sparkle   | 50×60, 50×60        | 20    | bold, edgy        | sequin-patch×2 | 8, 8, 6      | 18  | Spun round a roller-rink disco       |
| check-coat       | Coral Check Coat   | wool     | coral / check     | 60×90, 35×90        | 24    | classic, bold     | button×4       | 10, 10, 8, 6 | 18  | Walked a big dog through ten winters |

**Per-find content** (`content/find.ts`): each stitch line is `{panel, from, to, stitches, notions: [{stitch, notion}]}` with hand-placed endpoints in panel cm, one stitch every 4 cm; and `wornSpots: [pos, pos]`, two hand-placed 12×12 positions, of which the seeded roll picks one for a Tired find. Every ✓ in the fit table fits with either spot. Each find also has a flat silhouette (`jeans`, `shirt`, `dress`, `cloth`, `coat` or `skirt`).

**Condition grades** (rolled per rail slot, weights 25/50/25):

| Grade    | Condition | Price multiplier | Stains | Worn spots |
| -------- | --------- | ---------------- | ------ | ---------- |
| Like New | 0.9       | ×1.0             | 1      | 0          |
| Loved    | 0.7       | ×0.75            | 2      | 0          |
| Tired    | 0.5       | ×0.5             | 3      | 1          |

**Rail roll (daily, seeded):** 6 distinct finds via `drawDistinct` from the unlocked pool; if the pool has fewer than 6, show them all. For every pending or active brief, at least one slot is a find marked ✓ for that brief's recipe (seeded swap). Condition is rolled per slot; prices round to whole coins.

### 4.2 Recipes (6)

| id             | name             | pieces (cm)                                                            | seams (profiles)                                    | base value | tags            | blocked materials |
| -------------- | ---------------- | ---------------------------------------------------------------------- | --------------------------------------------------- | ---------- | --------------- | ----------------- |
| scrunchie-trio | Scrunchie Trio   | 3× strip 50×10                                                         | tube (straight), loop (gentle)                      | 18         | playful         | wool              |
| cushion-cover  | Envelope Cushion | front 45×45; 2× back 45×30                                             | hems (straight), outer (gentle)                     | 35         | classic         | tulle             |
| tote-bag       | Market Tote      | 2× body 36×40; 2× strap 8×60                                           | sides, straps (straight), top hem (gentle)          | 40         | casual          | tulle, silk       |
| bucket-hat     | Bucket Hat       | crown octagon Ø18; 2× band 30×8; 2× brim arc 40×12                     | band (gentle), crown (curved), brim (wavy)          | 45         | sporty, playful | tulle, silk       |
| remade-skirt   | Remade Skirt     | ADEEVA `mini-skirt`, `a-line-skirt` or `pencil-skirt` pieces           | ADEEVA `skirtSeams`                                 | 60         | the part's tags | —                 |
| remade-top     | Remade Top       | ADEEVA `fitted-bodice` or `wrap-bodice` + `sleeveless` or `cap-sleeve` | ADEEVA `bodiceSeams` (+ `setSleeveSeams` with caps) | 70         | the part's tags | denim             |

Blocked materials apply to every find in the flip. The flip's tags are the union of the recipe or part tags, the finds' tags, the material tags and the finish tags (a patch adds its own tags and its scrap's tags). Its colours are the finds' colours plus those of its patches (the scrap's colour) and paint dots; ADEEVA trims carry no colour. The **main find** is the one holding the most placed area; its material sets the sewing band.

### 4.3 Finishes

- **ADEEVA trims (8):** prices as in ADEEVA (`sequin-patch` is bought here). A saved notion is free and counts as secondhand.
- **New finishes (6):** patches cost 1 scrap each (§3.5).

| id           | name                | price   | tags              | notes                           |
| ------------ | ------------------- | ------- | ----------------- | ------------------------------- |
| patch-heart  | Heart Patch         | 1 scrap | playful, romantic | + source tags                   |
| patch-star   | Star Patch          | 1 scrap | bold, playful     | + source tags                   |
| patch-round  | Round Patch         | 1 scrap | casual            | + source tags                   |
| patch-square | Square Patch        | 1 scrap | classic           | + source tags                   |
| mend-cross   | Visible Mend Stitch | 1 coin  | edgy, casual      | new thread                      |
| paint-dots   | Fabric Paint Dots   | 2 coins | bold, playful     | new; colour from ADEEVA palette |

### 4.4 Clients (8; 2 trait-gated)

Briefs are varied by seeded RNG like ADEEVA's `rollClientBrief` (budget, fee, deadline, 2 favoured colours).

| id           | name, relation                                  | gate / min rep     | recipes                    | required tags   | favoured colours               | avoid           | required finishes | budget | fee   | days | min Q | min Leaves |
| ------------ | ----------------------------------------------- | ------------------ | -------------------------- | --------------- | ------------------------------ | --------------- | ----------------- | ------ | ----- | ---- | ----- | ---------- |
| nana-bea     | Nana Bea, neighbour with the sunny porch        | — / 0              | cushion-cover              | classic         | sage, ivory, mustard           | black           | button×2          | 25–35  | 30–40 | 4–6  | 68    | 0          |
| juniper-wren | Juniper & Wren, the twins next door             | — / 0              | scrunchie-trio             | playful         | blush, sky, lavender           | charcoal        | any patch×1       | 15–25  | 22–30 | 3–5  | 64    | 0          |
| lumi         | Lumi, art-club classmate                        | — / 0              | tote-bag                   | casual, playful | coral, mustard, sky            | —               | any patch×2       | 30–45  | 32–44 | 4–6  | 72    | 40         |
| kofi         | Kofi, cousin who skates                         | — / 0              | bucket-hat                 | sporty          | navy, black, emerald           | ivory, sky      | patch-star×1      | 25–40  | 36–48 | 4–6  | 72    | 0          |
| ms-okafor    | Ms. Okafor, school librarian                    | — / 12             | remade-skirt               | classic         | navy, teal, sage               | material: denim | button×1          | 40–60  | 52–66 | 5–7  | 82    | 0          |
| rafa         | Rafa, drummer in your sister's band             | — / 24             | remade-top                 | edgy            | black, charcoal, ruby          | ivory           | sequin-patch×1    | 45–65  | 58–72 | 5–7  | 87    | 0          |
| marisol      | Marisol, muralist with paint on her sleeves     | Dreamer / 15       | tote-bag, cushion-cover    | bold            | lavender, coral, teal, mustard | —               | any patch×3       | 35–50  | 66–80 | 5–7  | 84    | 70         |
| mr-halvorsen | Mr. Halvorsen, retired tailor at the next stall | Perfectionist / 18 | remade-skirt (pencil only) | elegant         | charcoal, navy                 | gold            | button×2          | 40–60  | 70–86 | 5–7  | 88    | 0          |

| client       | request                                                                                         | delighted                                              | nearMiss                                                   |
| ------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| nana-bea     | My porch bench needs a cushion. Something tidy, dear?                                           | It looks like it was always there. Thank you, dear.    | It's lovely. A few loose bits, but I'll treasure it.       |
| juniper-wren | We need matching scrunchies! But not boring ones!                                               | Matching! We're wearing them all week!                 | They're fun! One came a bit wobbly, that's okay.           |
| lumi         | My brushes need a bag with personality. Patches, please!                                        | This tote is basically art. I love it.                 | Cool idea! The seams could be a little neater.             |
| kofi         | Need a hat for the skate park. Sporty, and nothing that shows dust.                             | This is the one. Everyone's asking about it.           | Nice hat! The brim's a bit uneven, but I'll wear it.       |
| ms-okafor    | A skirt for book-fair day? Classic, no denim.                                                   | Perfect for the reading corner. Wonderful work.        | Very kind of you. Let's look at the hem together sometime. |
| rafa         | Stage top for our first gig. Edgy, with one sparkle patch. Pale shades vanish under the lights. | We're going to look amazing up there. Thanks!          | It's rad. A couple of seams wandered off, though.          |
| marisol      | Make me something loud and patchy. Use all the leftovers.                                       | It's a walking mural! Every scrap found a home.        | So close to wild! Maybe more patches next time.            |
| mr-halvorsen | I'd like a pencil skirt for my daughter. Straight lines, please.                                | Proper work. I couldn't have cut it straighter myself. | A good start. Patience with the seams comes with time.     |

Day 1: the first offer is drawn from `[nana-bea, juniper-wren]` only.

### 4.5 Upgrades (4; one-time; reputation-gated)

| id           | name                 | price | min rep | effect                                                 |
| ------------ | -------------------- | ----- | ------- | ------------------------------------------------------ |
| sharp-ripper | Sharp Seam Ripper    | 60    | 4       | maxPull ×1.15; a saved button or bow survives one snag |
| wash-tub     | Big Wash Tub         | 90    | 9       | ticksToClear ÷1.25; gentle limit ×1.15                 |
| cutting-mat  | Cutting Mat          | 110   | 13      | cut tolerance ×1.15                                    |
| stall-awning | Striped Stall Awning | 140   | 18      | +2 buzz each Stall Day; the rack holds 6 pieces        |

### 4.6 Story beats (9; player lines voiced by trait as in ADEEVA's `storyVoice`)

| id                     | trigger                                               | lines                                                                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tf-intro               | intro                                                 | **Femi:** "This stall was mine for twenty years. Now it's yours." / **Femi:** "Everything here had a life before. Give it another." / **Femi:** "Take my scrap tin too. Every scrap is a patch waiting." / **You:** "I won't let a single button go to waste." |
| tf-first-delivery      | first-delivery                                        | **Narrator:** Your first flip walks past the stall on its new owner. / **You:** "That was a curtain last week!"                                                                                                                                                |
| tf-first-stall-day     | first-stall-day                                       | **Femi:** "Awning up, tags out. Today the rack does the talking." / **Femi:** "Fair prices bring people back." / **You:** "Then fair it is."                                                                                                                   |
| tf-first-week          | first-week                                            | **Femi:** "Stall rent day. Every stall pays it." / **Femi:** "If the till is ever thin, the swap shop needs sorters." / **You:** "Good to know. I'll keep flipping."                                                                                           |
| tf-trait-dreamer       | trait-dreamer (Marisol writes in)                     | **Narrator:** "The Scrap Box." You lay leftovers side by side until they sing. / **Marisol:** "Now that's a colour story. Call me when you've got time."                                                                                                       |
| tf-trait-perfectionist | trait-perfectionist (Mr. Halvorsen writes in)         | **Narrator:** "Straight and True." / **Mr. Halvorsen:** "Small pulls, steady hands. You've done this before." / **You:** "Only in my head, a hundred times."                                                                                                   |
| tf-trait-trendsetter   | trait-trendsetter (after the first Stall Day is held) | **Narrator:** "Rail Whispers." / **Shopper:** "Has anyone got hats like that?" / **You:** (quietly) "Not yet. By next week, I will."                                                                                                                           |
| tf-trait-charmer       | trait-charmer (on the first Fair Price sale)          | **Narrator:** "Regulars." / **Femi:** "Same faces every Stall Day. That's your fair prices working." / **You:** "Regulars come back. I like that."                                                                                                             |
| tf-rack-of-ten         | ten-flips                                             | **Narrator:** "Ten Rescued." / **Femi:** pins a small rosette to the awning. "Ten things that nearly got thrown out." / **You:** "And ten that didn't."                                                                                                        |

ADEEVA's shared `bankrupt` beat ("Tight Week") is reused (Challenging only). There is no game over. Femi, the mentor, has her own portrait.

## 5. Evaluation, rewards and economy

**Quality** (0–100): `100 × (0.15·unpick + 0.05·clean + 0.25·cut + 0.35·seams + 0.05·grain + 0.15·restored)`. Each term averages the run's lines, stains, pieces and seams; an unfinished seam counts as 0, as in ADEEVA's `dressQuality`.

**Leaves (sustainability, 0–100):** `round(100 × (0.45·reuse + 0.25·salvage + 0.30·secondhand))`

- `reuse = min(1, placed area ÷ (0.5 × area of panels that hold at least one piece))`, with area from the shoelace formula on `placedPolygon`.
- `salvage` = buttons & bows saved ÷ those on the finds used (1 when there are none).
- `secondhand` = share of placed finishes that are patches or saved notions (1 when there are no finishes).
- Shown as a 5-leaf meter; never as a real-world CO₂ or water figure.

**Criteria** (ADEEVA ids and weights; trims renamed **finishes**, plus one new criterion):

| Criterion      | Weight | Pass rule                                                                                  | kindFeedback on a miss                                        |
| -------------- | ------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| construction   | 3      | All stitches out, all pieces cut, all seams sewn. Mandatory.                               | (ADEEVA line)                                                 |
| quality        | 2      | Quality ≥ brief minimum.                                                                   | (ADEEVA line)                                                 |
| style          | 2      | Every required tag present, and the main find's material is not in `brief.avoidMaterials`. | (ADEEVA line)                                                 |
| colours        | 1      | No avoided colour. +2 per favoured colour used, up to +4.                                  | (ADEEVA line)                                                 |
| finishes       | 1      | Required counts met; "any patch" counts any of the 4 patches.                              | "So close! The brief asked for a few more finishing touches." |
| budget         | 1      | Spend on finds and new finishes ≤ budget.                                                  | (ADEEVA line)                                                 |
| deadline       | 1      | Delivered by the deadline day.                                                             | (ADEEVA line)                                                 |
| sustainability | 1      | Leaves ≥ the brief's minimum.                                                              | "Lovely piece! Next time, try using more of the old fabric."  |

**Score** = `clamp(round(0.3·passMix + 0.7·quality + colourBonus), 0, 100)`. Stars use ADEEVA's `starsForScore` (90/75/55/35). The **pass gate** is construction, style, finishes and quality, as in ADEEVA.

**Rewards** (ADEEVA's `rewards` rules and constants):

- **Pass:** `fee × (0.8 + 0.4·score/100)`, plus trait lines, reputation `1 + round(2·score/100)` and buzz `1 + stars + 3 per trend match`. Leaves ≥ 75 adds +1 buzz (the "Leaf Pick" badge).
- **Standard soft fail:** 40% of the fee, reputation −1 (0 for Charmer), and kind feedback from the failed criteria.
- **Relaxed:** every run counts as a pass; stars still reflect quality. Rent ×0.
- **Challenging:** min quality +6; a fail pays 0 with reputation −3; late delivery costs 50% of the fee; rent ×1.5 (120).
- **Own-stall pieces:** no fee or reputation from review; they earn only through §3.6. Their score is their quality, and starting one needs a free rack hook.

**Traits** (game-flavoured perk text; ADEEVA mechanics plus stall effects):

| Trait         | Perk text                                                                           | Mechanic                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Dreamer       | "Patchwork heart: +15% fee when a flip has 3+ colours or feels dreamy or bold."     | +15% fee                                                                                                      |
| Perfectionist | "Steady hands: every stitch pull, scrub, cut and seam is more forgiving."           | ×1.2 on all tolerances, including maxPull and the gentle limit                                                |
| Trendsetter   | "You hear the market buzz: see next week's crowd early."                            | +10% fee per trend match; next week's hot tags shown as a "Hot" marker on rail finds and Fits badges          |
| Charmer       | "Regulars come back: 10% tip on happy deliveries, and fair sales bring extra buzz." | No reputation loss on a near miss; Fair Price sales also give +1 buzz, and the Fair Price reputation cap is 3 |

**Stall crowd** reuses ADEEVA's `trendMarket` (2 hot tags per week).

**Economy:** day of 10 h; start 90 coins; stall rent 80 at the end of each Stall Day. Shift: "Sorting at the swap shop" pays 30 coins for a whole untouched working day, on every difficulty. Offers come from `offerCountForBuzz` (1–3 a day, 4 pending at most, 2-day lifetime); active gigs are capped by `MAX_ACTIVE_GIGS`.

**Sanity checks (Standard):**

- **Day 1:** Nana Bea: a Linen Curtain or Polka Tablecloth (6–20 coins), plus 2 buttons. Buy the buttons new (2 coins), or unpick a Gingham Shirt (4–8 coins) as a second find for 6 free buttons. Juniper & Wren: a Gingham Shirt (4–8 coins), with a patch from Femi's scrap tin.
- **Week 1:** 6 working days, one flip each. Ms. Okafor opens at reputation 12 and Rafa at 24, so week 1 is mostly starter orders (fees 22–48, pay ≈ fee × 1.17, materials ≈ 8–18, net ≈ +30 each). A scripted decent player taking only commissions ends week 1 at 191–280 coins (12 seeds, mean ≈ 240), near the 245 target.
  - A struggling player with 2 soft fails (≈ +19 − 15 each) and 1 shift ends week 1 at about 90 + 8 + 30 − 80 = 48 coins and stays solvent.
  - On Challenging (rent 120, fails pay 0) the same player can dip below 0; the bankrupt beat points to the shift.
- **Pass rate:** a decent player (unpick 0.85, clean 0.9, cut 0.85, seams 0.8 ± 0.1 from flip to flip) lands at quality 78–93. Over 3 weeks on Standard it passes ≈ 89% of orders (starters 64–72 almost always; Ms. Okafor 82, Marisol 84 and Rafa 87 need a good day; Mr. Halvorsen 88 is ≈ 50/50). A weaker player (seams 0.6, cut ≈ 0.7, unpick ≈ 0.75) passes ≈ 63%. Challenging (+6) passes ≈ 81% and Relaxed every order.
- **Assist:** full assist ≈ 78–79 [unpick, clean 0.7; cut, seams 0.8; grain 0.9; restored 0.8–0.85]. This passes the four starter clients (64–72) and falls short of the mid and gated clients (82–88), which ask for a steady hand.
- **Stars separate:** with all criteria met and 1–2 favoured colours, assist scores ≈ 87–89 (4★) and decent play ≈ 91–93 (5★).
- **Condition:** a Tired find against Like New moves quality by about 2 points through `restored`, and costs a worn spot to plan around.
- **Stall Day:** a Remade Top at quality 80 and Leaves 70 gives V ≈ 70 × 0.92 + 7 ≈ 71. The guide and fair band read 64–78, and 78 earns the most coins.

## 6. Screens and art direction

**Screens:**

- **Title** (Thrift-Flip's own, with Continue, New Game, Settings and three price-tag save slots) → **New Game** (name and avatar pre-filled from the studio profile, then trait and difficulty; starting writes the name and avatar back to the profile) → **tf-intro**.
- **Stall Hub:** striped awning top bar (coins, reputation, buzz, Settings, Save & exit), a chalkboard with week, day and weekday, the hours left, the swap-shop shift and End the day; the order board as hanging price tags on cork with bunting; your orders; the stall rack with "Make a piece for Stall Day"; recent flips; this week's crowd (and next week's for Trendsetters); the stockroom (finds, saved buttons & bows, scraps); stall upgrades. On Stall Day the hero turns into the striped Stall Day banner with "Open the stall".
- **Flip steps:** a header with the step title and Set aside, a step rail (plan, rail and layout can be revisited before the cut) and the live order checklist beside every step.
- **Design:** recipe cards with a sample-fabric `ProductPreview`, part choices for the skirt and top, and a large preview.
- **Market Rail:** finds swaying on a rail, each with a condition ribbon, price, Fits badge, backstory line and a Hot marker for Trendsetters; tap for a close-up; pick several and buy them together; "Use for this flip" lists the stockroom.
- **Workbench:** Unpick, then Clean, on a wooden table: one stitch line or one stain at a time in close-up, with chips to switch, a progress bar, the assist switch and the safety line.
- **Layout and Cut:** the opened finds laid flat with worn spots on a cutting mat, a piece tray, a piece inspector (turn, nudge, back to the tray), then ADEEVA's `TraceMat` per piece.
- **Sew:** ADEEVA's `SewingMachine`. **Finish:** the preview with handles, and a drawer with scrap patches, saved buttons & bows, the trim tin and mend & paint.
- **Review:** the finished piece with a meter per quality term and the leaf meter, then Hand it over (or Hang it on the stall rack).
- **Results:** before/after split card (the find as bought, then the finished flip), score counting up, stars, leaf meter, the client's delighted or near-miss line, criteria with reasons, kind feedback and reward lines.
- **Stall Day:** the lantern-lit lane, the rack with a price tag per piece, stylised shopper silhouettes (never scored, described or reacting one by one) and one rack-wide result with Fair Price badges.

**Art direction (distinct from ADEEVA, same tokens):**

- **Palette:** the studio's ink, shadow, radius and focus tokens, re-tinted inside `.tf-theme` in `games/thrift-flip/ui/theme.css`: kraft `#e8d9bd`, denim `#3f5d84`, tangerine `#f08a3c`, mint `#8fcfb2`, twine `#a07a52`, chalk `#2f3d38`. The shared kit buttons and cards pick up the tangerine and mint through the token overrides.
- **Motifs:** price-tag cards with a punched hole and twine, a scalloped striped awning, bunting, a chalkboard, dashed "stitch" borders.
- **Fonts:** display `"Rockwell", "Roboto Slab", Georgia, serif` (system-only); body `system-ui`.
- **Original SVG art** (`ui/art`): `StallBackdrop` (market lane with lanterns, bunting and neighbouring stalls), `Awning`, `Bunting`, `Wordmark`, `FindArt` (6 flat silhouettes on wooden hangers, filled with `FabricPattern`, with stains and a worn patch for Loved and Tired finds), `StainArt` (soft blobs that fade cell by cell, with bubbles and a sparkle when clean), `PatchArt` (4 shapes with a stitched edge, in the scrap's fabric), `MarkArt` (mend crosses, paint dots), `FinishArt`, `ProductPreview` (one silhouette per recipe on a hanger, clip, hook, hat stand, stool or peg, filled with the main find's fabric, with finishes on top), `PriceTag`, `LeafMeter`, `Shoppers`, and the studio tile.
- Motion respects reduced motion (system setting or the in-game toggle).

## 7. Reuse map

**Engine (`src/engine`):** `rng`, `rngDraw`; `week`, `dayHours`; `standing`; `gigBoard` (offers, accept, decline, expiry, lapses, `offerCountForBuzz`, `clientIsOpen`); `difficulty`; `story` and `storyVoice`; `score` (`passMix`, `gatePassed`, `starsForScore`); `reward` (`settleReward`); `upgrades`; `catalog`; geometry (`polygonOverlap`, `placedPolygon`, `rotatedShape`, `traceAccuracy`); `saveEnvelope` and `parse`; `actionCheck`; `profile`.

**ADEEVA, imported directly** (Thrift-Flip is the only game allowed to import another game; ESLint enforces the direction):

- Content: `styleTag`, `material`, `trim`, `fabric`, `garmentPart` (skirt, bodice and sleeve parts; the seam profiles are exported as `SEAM_PROFILES`), `garmentSlot`, and the shared "Tight Week" story beat.
- Core: `grainScore` (pieces with no slot get no bias bonus), `trendMarket`, `seamAccuracy`, `nextSeamProgress` (the seam validation behind ADEEVA's `recordSeam`), the cutting and sewing constants (`BASE_CUT_TOLERANCE_CM`, `BASE_SEW_BAND`, `ASSIST_SEW_WIDENING`, Perfectionist ×1.2), decoration scale limits, and the budget, colours and deadline kind-feedback lines.
- UI: `TraceMat` (now returns its samples), `PlacedPieceArt`, `PieceThumb`, `PatternPieceShape`, `SewingMachine` (now reports through callbacks and can be played with the keyboard), `SewingStage`, `TrimArt`, `FabricSwatch`, `AssistSwitch`, `clientToSvg`, piece geometry helpers, the new-game `AvatarStep`, `TraitStep`, `DifficultyStep` and stepper (now data-driven), and the story, settings, sewing, trace and new-game styles.
- Studio and kit: `useGameSession`, `createSlotStore`, profile and look options, settings (with new Assist snip and Assist soak flags), toasts, and every `ui/kit` component.

**New code (`src/games/thrift-flip`):**

- `content/`: `career`, `condition`, `find`, `findFit`, `recipe`, `finish`, `client`, `upgrade`, `storyBeat`, `trait`, `difficulty`, `hint`.
- `core/`: `ownedFind` (stain and worn-spot rolls), `marketRail`, `market`, `findChoice`, `design`, `designChoice`, `flipPieces`, `panelBoard`, `placement`, `autoLayout`, `layout`, `polygonArea`, `unpick`, `clean`, `restoration`, `cutCommit`, `sewing`, `finishing`, `scrap`, `flipTags`, `flipQuality`, `sustainability`, `criterion`, `kindFeedback`, `flipEvaluate`, `rewards`, `delivery`, `rackPiece`, `stallDay`, `stallCalendar`, `calendar`, `offers`, `brief`, `runLifecycle`, `stageReadiness`, `stageNavigation`, `flipStage`, `flipRun`, `runUpdate`, `storyQueue`, `trendPreview`, `tolerance`, `dayHours`, `upgrades`, `checklist`, `newGame`, `gameState`, `action`, `reduce`, save (`save`, `saveMigrations`, `gameStateParser`, `flipRunParser`, `briefParser`, `resultParsers`, `idParsers`, `taggedParser`), `testPlaythrough` and `index`.
- `ui/`: `ThriftFlipGame`, routes and slots, theme, the art in §6, and the title, new game, hub, flip steps (brief, design, market, unpick, clean, layout, cut, sew, finish, review, results), Stall Day, story and settings screens.
- `module.ts` (`reputationOf` reads the raw save and counts reputation above the career's start), a unit test per rule (including the fit-table placement test), and `e2e/thrift-flip/order.spec.ts` (a new game through one order with a real drag or trace in every mini-game, results, save, reload and continue, at 1280×800 and 820×1180), `stallDay.spec.ts` and `studio.spec.ts`.
- The parent page shows this game's note: "This game does not teach real sewing, washing or tool use."

## 8. Safety notes for this theme

- **No real cleaning guidance.** In-game cleaning is "soap, water and patience". No named chemicals, bleach, stain-remover recipes, or washing-machine or iron instructions.
- **Sharp tools stay fictional.** The seam ripper and scissors are game tools. Tooltip: "Real rippers and scissors are sharp. Ask an adult."
- **No bodies.** Flips are shown on hangers, cushions and stands only. No size, weight, fit or "flattering" talk. Clients comment on the piece, never on themselves or others. Shoppers are never scored.
- **No gender-coded colours.** No client avoids a colour as "for girls" or "for boys"; avoidances are practical (dust, stage lights) or personal.
- **No shame.** Secondhand is never "cheap", "gross" or "for poor people". Finds are "loved" or "tired", never "dirty". No real brands, labels, logos or "designer find" authentication.
- **Fair, not hustle.** No "flip for profit" or get-rich framing. The best-paying price is the fair one; overpricing just leaves the piece on the rack; underpricing earns no bonus. Prices are in coins only, with no real currency symbols or marketplace names.
- **Honest sustainability.** The leaf meter is game-only, with no real-world CO₂ or water claims and no guilt for buying new trims.
- **Randomness is free.** Rail stock, worn spots and condition are rolled by seeded RNG with no purchase or reroll for money. Nothing to buy, no ads, no chat, no network.

## 9. Out of scope for this slice

- A second career (an upcycling label or pop-up shop), a hired assistant, and a runway or show mode.
- Recipes beyond the 6: jackets, dresses, quilts, knitwear, dyeing and embroidery.
- Flips from more than 2 finds; a free-draw mending mini-game; photo or camera import of real clothes.
- Trait-gated clients for Trendsetter and Charmer (each has a story beat only).
- More markets or locations, weather, haggling dialogue trees and stock that carries over between saves.
- Real measurements or printable patterns, and any online selling, sharing or leaderboards.
