# Thrift-Flip Studio — Game Design (id: `thrift-flip`)

A Maker Studio game (`work/0003-studio/design.md`). §1–§8 describe the playable slice, at about a third of ADEEVA's depth; §9 designs Phase B, a second career that brings it to ADEEVA's depth. You run a small remake stall at a weekend market. Regulars bring you briefs; you plan the piece, buy secondhand finds, take them apart, clean them, then remake them with ADEEVA's fabric, cutting and sewing systems. Each week you sell your own pieces on Stall Day. All names, text and art are original. The safety promise from the studio contract applies to every screen.

## 1. Fantasy and audience

- **Fantasy:** "I found a tired old shirt for 6 coins and turned it into the tote everyone at the market asked about." You spot a find's potential and bring it back to life; Results opens on a before/after split card.
- **Ages 8–15+.**
  - 8–11 play on Relaxed with Assist toggles on. They enjoy scrubbing stains, decorating with patches and writing price tags.
  - 12–15+ play Standard or Challenging. They plan layouts around worn spots, chase a clean seam, and price fairly.
- **Reading level:** UI hints of one sentence and 12 words or fewer, at about Grade 3. Client lines are 1–2 short sentences. Numbers always come with an icon (coin, clock, leaf).
- **Why it is good for kids (without overclaiming):** it practises fine pointer control and planning within a budget, treats reuse as creative rather than a chore, and asks for fair pricing rather than "get rich" flipping.
- **Parent page sentence (exact):** "This game does not teach real sewing, washing or tool use."

**Kid-facing labels** (used on every screen; the design terms on the left never appear in hints):

| Design term      | Label on screen               |
| ---------------- | ----------------------------- |
| notions          | "Saved buttons & bows"        |
| pitch fee / rent | "Stall rent"                  |
| sustainability   | "Leaves"                      |
| unpick           | "Snip old stitches"           |
| snag             | "Snag"                        |
| grain            | "Fabric lines"                |
| capsule shelf    | "Show shelf"                  |
| curated rack     | "Season rack bonus"           |
| in season        | "Season pick"                 |
| window pick      | "In the window"               |
| kept in use      | "Things saved"                |
| haberdashery     | "Mrs. Pell's old sewing shop" |

## 2. Core loop and stages

**First career:** _Market Stall Remaker_ at a striped stall in "Saltmarsh Lane Market". Start: 90 coins, reputation 0, weekly stall rent 80. The second career, the Resale Boutique, is in §9.

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
- **Boutique, Swap & Mend and the Showcase** add their own notes in §9.10.

## 9. Depth: Resale Boutique

Phase B (`work/0003-studio/roadmap.md`) grows Thrift-Flip to ADEEVA's depth. ADEEVA runs Student → Label; Thrift-Flip runs **Market Stall → Resale Boutique** in the same save. The stall teaches the craft. The boutique adds curation, care for the community, and one warm show each season. Everything in §1–§8 still applies unless this section changes it.

### 9.1 The second career and how to unlock it

**Careers** (`content/career.ts` becomes a list, `CAREER_IDS = ["stall", "boutique"]`; `profile.career` is new):

| id       | name                 | place                                        | start coins      | start rep       | weekly rent (Std) | shift (pay)                        |
| -------- | -------------------- | -------------------------------------------- | ---------------- | --------------- | ----------------- | ---------------------------------- |
| stall    | Market Stall Remaker | Saltmarsh Lane Market                        | 90               | 0               | 80                | Sorting at the swap shop (30)      |
| boutique | Boutique Owner       | Larkspur Row, in Mrs. Pell's old sewing shop | 320 (start here) | 40 (start here) | 160               | Mending help at the swap shop (40) |

Rent scales by difficulty as before (Relaxed ×0, Challenging ×1.5 = 240).

**Unlock rule** (`core/boutiqueUnlock.ts`, mirrors ADEEVA's `labelLaunch`): `canOpenBoutique` needs career `stall`, **reputation ≥ 40**, **gigs delivered ≥ 10** and **Fair Price sales ≥ 3** (the existing `fairSales` counter). Reasons list what is missing ("Deliver 3 more orders.", "Sell 1 more piece at a fair price.").

- **Story beat:** when a Stall Day ends and the rule passes, End Day queues `boutique-offer`. Its beat `tf-boutique-offer` has two choices. "Open the boutique" has effect `open-boutique`. "Not yet, the stall is home" sets flag `boutique-later`. Story choices gain a typed effect, as in ADEEVA (`StoryBeat<StoryTrigger, "open-boutique">`).
- **Later:** after "Not yet", the hub shows a "Larkspur Row" card with an Open button whenever the rule passes. The offer never expires.
- **When:** opening is legal only on the first day of a week, with all 10 hours left. A flip on the bench does not block it: the bench run carries over, like active orders. The beat arrives at exactly that moment, and the card says "Larkspur Row opens at the start of a week." An illegal `openBoutique` returns the same state reference.
- **Opening** (`openBoutique {signId}`): sets career `boutique` and keeps coins, reputation, buzz, stock, upgrades, scraps, log, active orders and the bench run. Stall rack pieces move to the boutique rack. Season 1 starts that day. The first week (the week of `openedDay`) is rent-free ("Mrs. Pell's welcome week"). The player picks a shop sign from 4 names: Second Bloom, Mended & Merry, The Turnaround, Patch & Pocket.
- **Pacing (Standard, scripted decent player):** the script takes **5 commissions and 1 own piece a week**. Reputation grows about 16 a week, so the rule passes after the third Stall Day for about 60% of seeds and the offer lands on day 22; otherwise on day 29. A weaker player gets it on day 36–43, Challenging on day 29–36 and Relaxed on day 22.
- **"Start here" for older players:** New Game gains a Career step between Trait and Difficulty, using the lifted `CareerStep` (§9.11). Cards: "Market Stall (start here if you're new)" and "Resale Boutique (for players who know the stall, or want a bigger shop; suggested 12+)". The suggestion is a label, never a gate. A boutique start gets 320 coins, reputation 40, Femi's scrap tin, a Loved Linen Curtain and a Like New Gingham Shirt in stock, and the beat `tf-boutique-intro` in place of `tf-intro`. Its welcome week is also rent-free.
- **Studio reputation:** `module.reputationOf` follows ADEEVA's `careerReputation` pattern: it subtracts the start reputation of the save's career (0 or 40), and a save with no career counts as a stall save.

### 9.2 How play changes

A **season** is 28 days (4 weeks) from the day it starts. Seasons cycle in the order of §9.6, and each brings a theme with 2 tags, a 4-colour palette, a best music mood and a best light.

| Season day              | What happens                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1–6, 8–13, 15–20, 22–27 | Working days: commissions, mend and alter tickets (§9.3), own pieces, the window display (§9.3)             |
| 7, 14, 21, 28           | **Till Day**: the rack sells (price tags, as §3.6), then rent. Nothing else happens                         |
| 11                      | **Swap & Mend** community day (§9.4), only if the player opens the hall                                     |
| 22–27                   | **Upcycle Showcase** (§9.5) can be staged on any of these days; day 27 counts as late (−10, not on Relaxed) |

- **Order board:** commissions come from the boutique clients (§9.7) plus the stall clients from reputation 12 up. The starter clients (Nana Bea, Juniper & Wren, Lumi, Kofi) now send tickets instead of flips. At most **1 ticket offer** is pending at a time. **Regulars rule:** if no ticket is pending or active and the board has room, the daily roll adds one, so a job that needs no coins is always in view (§9.8).
- **Seasonal rack** (8 hooks, 10 with Rail Extension): own pieces hang here and sell on Till Day. The fair value from §3.6 gets ×1.1 **Season pick** when the piece's tags include a tag of the current season (worked out on the day, never stored), and ×1.1 **In the window** when it stands in the window. Three or more Season picks on the rack add +2 buzz (**Season rack bonus**). Unsold pieces stay; nothing is lost. The fair band, the slider and "the fair price is the best price" are unchanged.
- **Show shelf** (the capsule shelf, 3 slots): on any working day, any rack piece made this season (`madeDay` ≥ the season's start) can move to the shelf, or back to the rack, for 0 hours, until the Showcase is staged.
- **Things saved** (`keptInUse`): a game-only tally with a leaf icon. It goes up by 1 for each find used in a flip, each ticket delivered, each swap and each well-mended Swap & Mend table. It is never shown as kilograms, CO₂ or water. The hub shows it beside the Rosette Wall.
- **Stall upgrades carry over.** The awning hangs over the boutique door: +2 buzz each Till Day. The stall rack size no longer applies.
- **Bills:** rent is 160 on Standard. The shift pays 40 for an untouched working day, on every difficulty. Offers, gig caps and buzz rules are the engine's.

### 9.3 Mini-game twists (the existing games, used in fresh ways)

| Twist                  | Reuses                                    | Hours                     | What is new                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mend ticket**        | Unpick, Clean, Sew, Finish                | 4 (3 with Mending Basket) | The client lends their own item (§9.7 ticket table: a find def at Loved or Tired; it costs 0 and goes home after). Stages `brief → unpick → clean → sew → finish → review`. Unpick opens the item's **one** named split line, Clean lifts its named stain, and the sew step has one "close the split" seam (gentle). |
| **Alter ticket**       | Unpick, Layout, Cut, Sew                  | 4 (3)                     | A **"Fresh hem"**: replace a worn or frayed hem band, never about length or fit. Unpick the old hem line; lay **one** hem band (40×8 cm) on the item's own panel. **Edge rule:** the band's long side sits within 2 cm of the panel's bottom edge (`alterLayout`). Cut it and sew one hem seam (wavy).               |
| **Window display**     | Finish drag, rotate, scale, keyboard path | 1 to set up or rearrange  | A 600×400 shop window. Place up to 3 rack pieces (4 with Window Plinths) as `ProductPreview` art and up to 4 props (5). It stays up week to week; a piece that sells or moves to the show shelf leaves it. Scored when Till Day opens (§9.5.1). Props are owned and never used up.                                   |
| **Swap & Mend tables** | Unpick, Clean, Sew (single element)       | 1 each, up to 6           | A neighbour's item on a table: pop one stitch line, lift one stain, or sew one short seam (seeded per table). Assist is allowed, with its usual caps.                                                                                                                                                                |
| **Swap rail**          | Market rail cards                         | 0                         | Trade owned stockroom finds only, 1-for-1, no coins: up to 3 swaps (5 with Swap Shelf) for 6 seeded swap-rail finds. Rack pieces never go on the swap rail.                                                                                                                                                          |
| **Patch throw layout** | Layout across 2 finds                     | as a flip                 | The new Patchwork Lap Throw needs 9 squares with **at least 3 on each of 2 different finds**, a real two-find puzzle around worn spots.                                                                                                                                                                              |
| **Showcase staging**   | ADEEVA walk order, mood and light pickers | 0                         | Pick the walk order, music and light, plus one story card per piece (§9.5).                                                                                                                                                                                                                                          |

**Ticket rules:**

- **Quality** (no layout grain, no full build). Mend: `100 × (0.30·unpick + 0.20·clean + 0.40·seams + 0.10·restored)`. Alter: `100 × (0.20·unpick + 0.30·cut + 0.40·seams + 0.10·grain)`.
- **Criteria:** the §5 set, with `sustainability` replaced by `kept` (always passes and shows "Things saved +1"). Minimum quality 62–74. Tags are the item's tags plus the finish tags.
- **Budget 3.** A mend ticket requires **`kind: "mend-or-patch"` ×1**, which any mend mark or any patch satisfies. Mend marks placed on a ticket cost 0 coins (the client's thread), and a scrap patch costs no coins, so every ticket can be done at 0 coins. An alter ticket has no finish requirement.
- **Rewards:** a pass pays `fee × (0.8 + 0.4·score/100)` as §5, with a flat **+1 reputation** and **+1 buzz**. A soft fail pays 40% of the fee (0 on Challenging) with 0 reputation; a ticket never lowers reputation.
- **Patch throw layout rule:** a placement check in `layout` with the reason "Use squares from both finds." until each of 2 finds holds 3 or more squares.

### 9.4 Swap & Mend community day (season day 11)

- Day 11 is a normal working day unless the player opens the hall. The hub shows "Swap & Mend is on today" with an "Open the hall" button. The first table or swap commits the day to the hall: no flips, tickets or shift after that. Choosing a normal day is never mentioned again.
- In the hall, Femi runs the tea urn. Up to **6 tables** (7 with Swap Shelf) are rolled from the seed, each with a neighbour's item and a short line ("My scarf's got a pulled thread. Could you help?"). A table counts as **well mended** at accuracy ≥ 0.6 (on Relaxed, every finished table counts). Each table is idempotent by its id.
- **Rewards:** +1 Things saved and +1 buzz for each well-mended table; reputation `+floor(well mended ÷ 2)`, at most +3; and +3 scraps ("Off-cuts from the hall"), within the 12-scrap cap. No coins change hands. Rent is still due on Till Day as usual.
- **Swap rail** is open all day in the hall (§9.3). A swapped-in find enters the stockroom at its rolled grade. Swapping is always optional.

### 9.5 The Upcycle Showcase (each season, days 22–27)

A small community runway in **Larkspur Hall**: fairy lights, folding chairs and a hand-painted banner. It is a celebration, not a contest. There are no eliminations, no rivals, no audience vote, no hosts and no cameras.

- **Show:** 1–3 pieces from the show shelf. The season's tags are the theme. On day 22, if the shelf has fewer than 3 pieces, the hub suggests this season's best rack pieces by quality: "Your show shelf has room. Add these?" (one tap adds them). On Relaxed, if nothing has been staged by the end of day 27, the Showcase is staged automatically with the shelf plus the suggested pieces.
- **Staging** (0 hours, on any day 22–27): walk order (opener and closer matter), music mood (ADEEVA's 4) and light (ADEEVA's 3), plus a **story card** per piece. Each piece offers up to 3 cards: the backstories of its finds and "A fresh start". Cards are flavour, never scored. From the second Showcase on (always on Relaxed) the planner shows the season's best mood and light as a **Hall tip**.
- **Story cards:** each card shows the find as it was bought (`FindArt`), an arrow, then the finished piece (`ProductPreview`), with the backstory line, like the `BeforeAfter` results card. A piece with no find ids (a v1 piece) shows its finished piece and "A fresh start".
- **The show** (reuses ADEEVA's `RunwayStage`, `walkerFrame`, show clock and `PanelCard`, and `StageFigures` through its `carry` prop, §9.11): stylised volunteer neighbours in their own avatar outfits carry each piece on a hanger, or glide it past on a wheeled rail with Rolling Rails. The pieces are judged, never the walkers. Each piece pauses at the front while its story card fades in, and the hall claps for every piece. With reduced motion the same story cards appear as stills, one after another.
- **Three kind panels** (each 0–100; averages use the pieces shown; each part has one warm detail line):

| Panel                                          | Parts (weight)                                                                                                                                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Craft Circle** (the Larkspur menders' group) | Craft = average quality (0.6) · Finishing touches = share of pieces with 2 or more finishes × 100 (0.2) · Theme = share of season tags carried (0.2)                                                   |
| **Green Thread** (the repair café volunteers)  | Leaves = average Leaves (0.5) · Many finds = `100 × min(1, distinct finds across the pieces ÷ 4)` (0.3) · Saved bits = share of pieces with at least one scrap patch or saved button & bow × 100 (0.2) |
| **Story Table** (the library story circle)     | Range = 100 / 70 / 40 for 3 / 2 / 1 distinct recipes (0.3) · Cohesion = `paletteCohesion` of the pieces' colours × 100 (0.3) · Music and light = 70/20 mood + 30/10 light (0.2) · Show flow (0.2)      |

- Range pulls against Cohesion, and Theme rewards the season's tags, so building the show across the season is a real puzzle.
- **Show flow** is `closerStrength(scores)` in `src/engine/showOrder.ts` (§9.11), shared with ADEEVA and Patisserie; it is 100 with one piece.
- **Overall** = average of the three panels, minus 10 if staged on day 27 (not on Relaxed).
- **Rosettes** (never "lost" or "failed"): Gold Thread ≥ 85, Silver Thread 70–84, Copper Thread 55–69, and a Thank-you Ribbon below 55 ("The hall clapped for every piece. Here's what we loved…"). Each panel writes one praise line and, below 70, one "Next time, try…" tip from its weakest part.
- **Rewards:** capsule requests `max(0, round((overall − 50) ÷ 5))`, each worth `30 + 8 × (min(season, 5) − 1)` coins. Reputation is `round((overall − 40) ÷ 6)` when overall ≥ 50; below that it is 0, or −1 on Challenging. The −1 is deliberately gentler than ADEEVA's −2, because the boutique show is a community celebration. Buzz is `round(overall ÷ 4)`. The rosette goes on the Rosette Wall. The pieces return to the rack with `showcaseSeason` set, and sell as **Showcase pieces** (×1.1 fair value) for the rest of that season.
- **Not staged by day 27?** The season closes quietly on Till Day, the shelf pieces go back to the rack, and nothing is lost but the show.

#### 9.5.1 Window score

`window = 0.35·theme + 0.25·colour + 0.20·balance + 0.20·leaves`. Theme is the share of the season's tags present across the shown pieces and props; colour is `paletteCohesion` of the shown colours (each piece's `colours`, each prop's colour) with the season palette; balance is 100, 66 or 33 for items in 3, 2 or 1 thirds of the window (by each item's centre x); leaves is the average Leaves of the shown pieces.

On Till Day the window gives +`round(window ÷ 25)` buzz (0–4), and its pieces sell as In the window. String Lights (a prop) adds nothing extra; it only scores through its tags and colour.

### 9.6 Seasons (4)

| id            | name              | tags              | palette                      | best mood      | best light | showcase banner        |
| ------------- | ----------------- | ----------------- | ---------------------------- | -------------- | ---------- | ---------------------- |
| blossom-mend  | Blossom & Mend    | romantic, playful | blush, sage, ivory, lavender | dreamy-strings | warm       | "Bloom Again"          |
| seaside-swap  | Seaside Swap      | casual, sporty    | sky, teal, coral, mustard    | beach-pop      | cool       | "Washed Up, Made New"  |
| orchard-patch | Orchard Patchwork | classic, bold     | mustard, plum, ruby, emerald | beach-pop      | warm       | "Harvest of Scraps"    |
| lantern-night | Lantern Night     | elegant, regal    | navy, gold, plum, charcoal   | classic-jazz   | spotlight  | "Light the Long Night" |

The first boutique season is the one at index `(week − 1) mod 4` in this order, so a long stall run doesn't always start in spring.

### 9.7 Content, about twice the slice

The boutique about doubles the slice: 14 finds (28 in all), 6 recipes (12), 6 finishes (12), 12 clients (2 ticket-only; 20 in all) plus 8 ticket templates, 6 upgrades (10) and 14 story beats (23), plus 4 seasons, 8 window props, 4 shop signs and 3 panels.

**Finds (14, boutique rail only, min rep 40–52).** Same columns as §4.1. Each gets hand-placed stitch lines, notions, two worn spots and fit-table rows, tested by placement as in §2. Silhouettes: the jacket, shirts, track jacket and coat use `coat` or `shirt`; trousers use `jeans`; sundress and robe use `dress`; the two skirts use `skirt`; curtains, cloths and rugs use `cloth`.

| id             | name                   | material | colour / print   | panels              | price | tags              | notions        | stitch lines | rep | backstory                              |
| -------------- | ---------------------- | -------- | ---------------- | ------------------- | ----- | ----------------- | -------------- | ------------ | --- | -------------------------------------- |
| denim-jacket   | Patchy Denim Jacket    | denim    | sky / solid      | 55×65, 30×65, 30×65 | 22    | casual, edgy      | button×5       | 10, 10, 8, 6 | 40  | Went to every summer music day         |
| rose-curtains  | Rose Garden Curtains   | cotton   | rose / floral    | 130×150             | 22    | romantic, classic | ribbon-belt×1  | 12, 12       | 40  | Framed a window full of geraniums      |
| stripe-shirt   | Mustard Stripe Shirt   | cotton   | mustard / stripe | 55×72, 28×70, 28×70 | 9     | casual, playful   | button×7       | 9, 9, 8      | 40  | Painted three garden fences            |
| linen-trousers | Sage Linen Trousers    | linen    | sage / solid     | 55×100, 55×100      | 15    | casual, classic   | button×1       | 11, 11, 6    | 40  | Pottered round an allotment            |
| coral-sundress | Coral Dot Sundress     | cotton   | coral / dot      | 110×70, 40×40       | 14    | playful, romantic | bow×2          | 10, 8, 6     | 40  | Ate ice cream on the seafront          |
| linen-cloth    | Ivory Sunday Cloth     | linen    | ivory / solid    | 140×140             | 18    | classic, elegant  | lace×2         | 12, 12       | 42  | Laid for a hundred Sunday lunches      |
| track-jacket   | Teal Track Jacket      | cotton   | teal / stripe    | 50×60, 50×60        | 12    | sporty, casual    | button×4       | 8, 8, 6      | 42  | Ran the school sports-day relay        |
| picnic-blanket | Checked Picnic Rug     | wool     | emerald / check  | 140×120             | 20    | classic, casual   | —              | 12, 12       | 44  | Spread under an old oak every June     |
| satin-robe     | Lavender Satin Robe    | satin    | lavender / solid | 70×110              | 18    | dreamy, elegant   | bow×1          | 10, 10       | 44  | Heard a bedtime story every night      |
| silk-blouse    | Gold Silk Blouse       | silk     | gold / solid     | 50×65, 25×55, 25×55 | 18    | elegant, regal    | pearl×4        | 9, 9, 7      | 46  | Went to a concert twice a year         |
| plum-skirt     | Plum Check Skirt       | wool     | plum / check     | 90×65               | 17    | classic, bold     | button×2       | 9, 8         | 46  | Twirled at a New Year barn dance       |
| starry-tulle   | Starry Tulle Skirt     | tulle    | navy / sparkle   | 140×70              | 16    | dreamy, bold      | sequin-patch×1 | 12, 8        | 48  | Twinkled at a winter concert           |
| theatre-velvet | Theatre Velvet Curtain | velvet   | ruby / solid     | 130×160             | 26    | regal, bold       | ribbon-belt×1  | 12, 12, 10   | 50  | Opened a hundred school shows          |
| duffle-coat    | Charcoal Duffle Coat   | wool     | charcoal / solid | 60×95, 35×95        | 26    | classic, sporty   | button×4       | 10, 10, 8, 6 | 52  | Waited at a snowy bus stop each winter |

**Recipes (6 new).** Same columns as §4.2. The pinafore's sew step is 3 hours, so it fills a whole 10-hour day (9 with owned finds). The bunting can also stand in the window as a piece.

| id              | name                | pieces (cm)                                                                          | seams (profiles)                                      | base value | tags              | blocked     |
| --------------- | ------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- | ---------- | ----------------- | ----------- |
| hair-bow-set    | Hair Bow Set        | 4× bow 24×12; 2× knot 6×10                                                           | loops (gentle), knots (straight)                      | 22         | romantic, playful | wool        |
| book-sleeve     | Book Sleeve         | 2× body 30×38; flap 30×16                                                            | sides (straight), flap (curved)                       | 30         | classic, playful  | tulle       |
| bunting-string  | Bunting String      | 6× pennant triangle 20×24; tape 6×120                                                | pennant edges (wavy), tape (straight)                 | 38         | playful, bold     | —           |
| garden-apron    | Garden Apron        | bib 30×28; skirt 60×45; 2× tie 8×70                                                  | hems (straight), ties (straight), waist (gentle)      | 50         | casual, classic   | tulle, silk |
| patch-throw     | Patchwork Lap Throw | 9× square 20×20 (at least 3 on each of 2 finds); 2× binding 8×64                     | rows (straight), columns (straight), binding (gentle) | 75         | classic, dreamy   | tulle       |
| remade-pinafore | Remade Pinafore     | ADEEVA `fitted-bodice` or `wrap-bodice` + `a-line-skirt` or `mini-skirt`, sleeveless | ADEEVA `bodiceSeams` + `skirtSeams` + waist           | 110        | the parts' tags   | —           |

**Finishes (6 new).** Two new finish requirement kinds: `kind: "mend"` accepts any of the three mend marks; `kind: "mend-or-patch"` accepts any mend mark or any patch.

| id           | name                | price    | tags              | notes                                                       |
| ------------ | ------------------- | -------- | ----------------- | ----------------------------------------------------------- |
| patch-leaf   | Leaf Patch          | 1 scrap  | classic, dreamy   | + source tags                                               |
| patch-flower | Flower Patch        | 1 scrap  | romantic, playful | + source tags                                               |
| patch-pocket | Pocket Patch        | 2 scraps | casual            | + source tags; counts as "any patch"                        |
| mend-running | Running Stitch Mend | 1 coin   | classic, elegant  | new thread (0 coins on a ticket)                            |
| mend-darn    | Woven Darn          | 2 coins  | casual, classic   | new thread (0 coins on a ticket); a mend ticket's favourite |
| stamp-leaf   | Leaf Stamp Print    | 2 coins  | dreamy, bold      | new; colour from the paint palette                          |

**Clients (10 new commission clients; boutique only).** Same columns as §4.4.

| id           | name, relation                                 | gate / min rep   | recipes                     | required tags     | favoured colours             | avoid           | required finishes | budget | fee     | days | min Q | min Leaves |
| ------------ | ---------------------------------------------- | ---------------- | --------------------------- | ----------------- | ---------------------------- | --------------- | ----------------- | ------ | ------- | ---- | ----- | ---------- |
| dot          | Dot, starting at the dance school              | — / 40           | hair-bow-set                | romantic, playful | blush, lavender, rose        | —               | any patch×1       | 15–25  | 46–58   | 3–5  | 74    | 30         |
| ms-adebayo   | Ms. Adebayo, head of Larkspur library          | — / 40           | book-sleeve                 | classic           | teal, navy, sage             | —               | button×1          | 20–30  | 54–66   | 3–5  | 76    | 50         |
| pip-and-otto | Pip & Otto, brothers who run the bakery        | — / 40           | garden-apron                | casual            | mustard, coral, ivory        | black           | patch-pocket×1    | 25–40  | 60–74   | 4–6  | 78    | 40         |
| mr-hendrick  | Mr. Hendrick, owner of the corner café         | — / 42           | bunting-string              | playful, bold     | coral, mustard, sky, teal    | —               | any patch×2       | 25–40  | 64–78   | 4–6  | 80    | 60         |
| bex          | Bex, skate-park volunteer                      | — / 44           | tote-bag, bucket-hat        | sporty, edgy      | teal, black, mustard         | ivory           | patch-star×1      | 30–45  | 70–84   | 4–6  | 80    | 60         |
| grandpa-ike  | Grandpa Ike, who naps on every sofa            | — / 48           | patch-throw                 | classic           | sage, emerald, mustard, plum | —               | any patch×2       | 40–60  | 88–104  | 5–7  | 82    | 70         |
| ana-lucia    | Ana-Lucía, film-club host                      | — / 52           | remade-top                  | bold              | ruby, black, gold            | sky             | sequin-patch×1    | 45–65  | 90–106  | 5–7  | 84    | 50         |
| sol          | Sol, choir leader at Larkspur Hall             | — / 58           | remade-pinafore             | elegant           | navy, plum, gold             | material: denim | pearl×2           | 55–75  | 112–130 | 6–8  | 86    | 40         |
| zuri         | Zuri, who makes the community noticeboard zine | Trendsetter / 46 | remade-skirt (mini, a-line) | bold, playful     | coral, teal, lavender        | charcoal        | any patch×2       | 45–60  | 96–112  | 5–7  | 85    | 60         |
| mrs-ferreira | Mrs. Ferreira, who knows every regular by name | Charmer / 46     | patch-throw, cushion-cover  | romantic, classic | rose, blush, sage            | —               | any patch×3       | 40–55  | 92–108  | 5–7  | 84    | 75         |

**Tickets (8 templates; `content/ticket.ts`).** Each template names a find id, the stitch line to open, the stain to lift and the worn edge, all hand-placed. Budget 3; requirement as §9.3. Theo (the postie whose jacket seam split) and Rosa & June (sisters who share one coat) are ticket-only clients; the rest are the regulars' `tickets`, which use the last two dialogue rows below with `[item]` filled from the template ("blazer elbow", "skirt hem").

| client        | kind  | item (find)                           | gate / min rep     | fee   | days | min Q | favoured colours |
| ------------- | ----- | ------------------------------------- | ------------------ | ----- | ---- | ----- | ---------------- |
| nana-bea      | mend  | blazer elbow (`wool-blazer`)          | — / 40             | 14–18 | 2–3  | 62    | sage, mustard    |
| juniper-wren  | mend  | jeans pocket (`faded-jeans`)          | — / 40             | 14–18 | 2–3  | 62    | blush, sky       |
| lumi          | mend  | painting-shirt cuff (`gingham-shirt`) | — / 40             | 16–20 | 2–3  | 64    | coral, mustard   |
| kofi          | mend  | track-jacket cuff (`track-jacket`)    | — / 40             | 16–22 | 2–3  | 66    | navy, emerald    |
| theo          | mend  | jacket seam (`denim-jacket`)          | — / 40             | 16–22 | 2–3  | 64    | navy, mustard    |
| ms-okafor     | alter | skirt hem (`party-skirt`)             | — / 40             | 20–26 | 3–4  | 72    | navy, teal       |
| mr-halvorsen  | alter | trouser hem (`linen-trousers`)        | Perfectionist / 40 | 22–28 | 3–4  | 74    | charcoal, navy   |
| rosa-and-june | alter | coat hem (`duffle-coat`)              | — / 44             | 22–28 | 3–4  | 70    | plum, teal       |

| client         | request                                                          | delighted                                                | nearMiss                                             |
| -------------- | ---------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| dot            | Bows for my first dance class? Soft colours, please.             | They bounce when I spin! Thank you!                      | I love them! One bow is a little floppy.             |
| ms-adebayo     | A sleeve to keep the library's story books safe.                 | The books look proud in it. Lovely work.                 | Very useful. The flap could sit a little straighter. |
| pip-and-otto   | Two aprons for the bakery. A pocket for the pencil!              | Flour-proof and handsome. We'll wear them every morning. | Great aprons! A seam has wandered, but they'll do.   |
| mr-hendrick    | Bunting for the café window. Loud and cheerful!                  | The whole street smiles when it walks past.              | Cheerful! A couple of flags are a bit wobbly.        |
| bex            | Something sporty for the park. Nothing pale, it's dusty.         | Everyone at the ramp wants one now.                      | Looks good! The edges could be neater next time.     |
| grandpa-ike    | A throw for my nap chair. Patches with stories, please.          | Every square reminds me of something. Perfect.           | Very cosy. A few squares don't quite line up.        |
| ana-lucia      | A top for our film-night premiere. Bold, with one sparkle.       | It shines like the big screen. Thank you!                | It's great! Some seams drifted a little.             |
| sol            | A pinafore for the choir's spring concert. Elegant, no denim.    | It moves beautifully when I conduct. Wonderful.          | So close. The waist seam needs a steadier hand.      |
| zuri           | A skirt for the zine launch. Bright and patchy, like our pages.  | I'm putting it on the cover of the next issue!           | Fun! More colour next time, maybe?                   |
| mrs-ferreira   | Something warm for the shop chair, made from lots of old things. | Now the shop feels like home. Thank you, dear.           | Lovely. A few more patches would make it sing.       |
| theo           | My jacket seam split on my round. Could you mend it?             | Good as new, and stronger too. Thanks a lot!             | It holds! A little wobbly, but it'll do the round.   |
| rosa-and-june  | Our shared coat's hem frayed in the puddles. A fresh one?        | Neat as a pin. We'll keep taking turns!                  | Thank you! The new hem wobbles a tiny bit.           |
| (mend ticket)  | My [item] has come apart. Could you mend it?                     | It's back in use! Thank you so much.                     | It holds! A tiny bit wobbly, but I love it.          |
| (alter ticket) | My [item] has gone frayed. A fresh hem, please?                  | A fresh hem! Ready for years more.                       | Thank you! The hem wobbles just a little.            |

**Upgrades (6 new; boutique only).**

| id             | name           | price | min rep | effect                                                                       |
| -------------- | -------------- | ----- | ------- | ---------------------------------------------------------------------------- |
| swap-shelf     | Swap Shelf     | 80    | 40      | Swap & Mend: +2 swaps and +1 table                                           |
| mending-basket | Mending Basket | 110   | 42      | Tickets take 1 hour less                                                     |
| window-plinths | Window Plinths | 130   | 46      | The window holds 4 pieces and 5 props                                        |
| rail-extension | Rail Extension | 160   | 50      | The seasonal rack holds 10 pieces                                            |
| thread-library | Thread Library | 180   | 54      | Sewing band ×1.1 (stacks with the trait and difficulty)                      |
| rolling-rails  | Rolling Rails  | 220   | 60      | Show pieces glide past on a wheeled hanger rail; Show flow +10 (at most 100) |

**Window props (8; bought in the boutique, never used up; price · tags · colour):** Book Stack 8 · classic, playful · teal; Paper Moon 10 · dreamy, romantic · ivory; Wicker Basket 10 · casual, romantic · mustard; Potted Fern 12 · classic, dreamy · emerald; Bicycle Wheel 14 · sporty, edgy · charcoal; String of Lights 16 · dreamy, bold · gold; Old Suitcase 18 · classic, elegant · plum; Ladder Shelf 20 · casual, classic · coral (ids `book-stack`, `paper-moon`, `wicker-basket`, `potted-fern`, `bike-wheel`, `string-lights`, `suitcase`, `ladder-shelf`).

**Story beats (14 new).** Player lines are voiced by trait, as in §4.6. Mrs. Pell has her own portrait. ADEEVA's shared "Tight Week" beat still covers Challenging.

| id                 | trigger                                    | lines                                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tf-boutique-offer  | boutique-offer                             | **Femi:** "Mrs. Pell's old sewing shop on Larkspur Row is empty." / **Mrs. Pell:** "I'm retiring to my garden at last. The shop needs someone who mends things. I think that's you." / Choices: Open the boutique · Not yet, the stall is home |
| tf-boutique-opened | boutique-opened                            | **Narrator:** The new sign goes up over the door. / **Mrs. Pell:** "First week's rent is on me. Welcome." / **You:** "I'll fill this window with second chances."                                                                              |
| tf-boutique-intro  | intro-boutique (start here)                | **Femi:** "You've had a stall for years. Now you've got walls!" / **Femi:** "Same rule as ever: everything had a life before." / **You:** "And it gets another one here."                                                                      |
| tf-first-mend      | first-mend                                 | **Narrator:** "Good as New." / **Nana Bea:** "I thought this old blazer was done for." / **You:** "Not while I've got thread."                                                                                                                 |
| tf-first-window    | first-window                               | **Femi:** "A window is a promise. Show them what's inside." / **You:** "Then the best pieces go up front."                                                                                                                                     |
| tf-first-till-day  | first-till-day                             | **Mrs. Pell:** "The bell's been ringing all morning." / **Femi:** "Fair prices, same as the stall." / **You:** "Always."                                                                                                                       |
| tf-swap-and-mend   | swap-day (first hall opened)               | **Narrator:** "Swap & Mend." Tables, tea and a queue of loved things. / **Femi:** "No coins today. Just fixing and swapping." / **You:** "Best kind of day."                                                                                   |
| tf-showcase-invite | season-start (first boutique season)       | **Mrs. Pell:** "End of each season, the hall holds an Upcycle Showcase." / **Mrs. Pell:** "Up to three pieces, one theme. Everyone gets a rosette." / **You:** "I'll start my show shelf."                                                     |
| tf-showcase-done   | showcase-done (first)                      | **Narrator:** The hall claps for every piece. / **Femi:** "You told the story of each thing. That's the craft." / **You:** "Next season, even braver."                                                                                         |
| tf-season-turn     | season-turn (repeatable)                   | **Narrator:** A new season on Larkspur Row. / **Mrs. Pell:** "New theme on the hall noticeboard."                                                                                                                                              |
| tf-kept-50         | kept-50                                    | **Narrator:** "Fifty Saved." / **Femi:** "Fifty things still in use because of you." / **You:** "Fifty stories still going."                                                                                                                   |
| tf-kept-100        | kept-100                                   | **Narrator:** "A Hundred Saved." / **Mrs. Pell:** hangs a hand-stitched banner over the till. / **You:** "Let's make it two hundred."                                                                                                          |
| tf-trait-zuri      | boutique-trendsetter (Zuri writes in)      | **Narrator:** "Cover Story." / **Zuri:** "Our zine wants the bravest skirt on Larkspur Row." / **You:** "Then I'd better make it."                                                                                                             |
| tf-trait-ferreira  | boutique-charmer (Mrs. Ferreira writes in) | **Narrator:** "Every Name." / **Mrs. Ferreira:** "You remember every regular. So do I." / **You:** "Then we'll get on just fine."                                                                                                              |

### 9.8 Economy checks (boutique)

Numbers below come from the scripted players in §5. The test in §9.11 makes them a contract.

- **Per hour:** an early commission nets about 62 × 1.17 − 20 ≈ 52 coins over 9 hours (5.8 coins and 0.33 reputation an hour). A ticket pays about 18 × 1.17 ≈ 21 over 4 hours (5.3 coins and 0.25 reputation an hour; with the Mending Basket about 7 coins and 0.33 reputation). With one ticket offer at a time, mending all day is never available, and late commissions (net about 75 at 85% pass) stay the best work.
- **Week money, Standard (rent 160).** At reputation 40–46 the open clients average a fee of about 62; with an 80% pass rate a commission nets about 43. Own pieces are shared between the rack and the show shelf.

| Week (Standard, rent 160) | Commissions  | Tickets     | Own sales + capsule share | Net after rent |
| ------------------------- | ------------ | ----------- | ------------------------- | -------------- |
| Decent, reputation 40–46  | 3 × 43 = 129 | 2 × 21 = 42 | ≈ 115                     | ≈ **+126**     |
| Decent, reputation 52+    | 3 × 75 = 225 | 42          | ≈ 115                     | ≈ **+220**     |
| Weaker                    | ≈ 83         | ≈ 36        | ≈ 80                      | ≈ **+39**      |

- **Upgrades:** the 6 upgrades (880) plus all 8 props (108) cost 988 coins, about 2 seasons of saving.
- **At opening:** a decent player has about 300–500 coins, and the welcome week has no rent.
- **No bankruptcy spiral:** 6 shifts pay 240, at least the rent on every difficulty (160 Standard, 240 Challenging). A week where the player opens the Swap & Mend hall has 5 shift days, which pay 200, still above Standard rent. A ticket needs 0 coins (§9.3), the regulars rule keeps one on the board, and rack pieces never expire, so a player at 0 coins always has a positive Standard week.
- **Challenging:** shifts only cover the 240 rent, so the player has to take jobs to grow; that is the intended bite. The Tight Week beat points to tickets and the shift. There is no game over.
- **Relaxed is always recoverable:** rent 0, every job passes, and the shift pays 40. Coins never fall at week end.
- **Pass rate (Standard, decent player: quality 78–93, about 86 ± 4.5, as in §5):** by min quality, commissions pass about 99% at 74–76, 96% at 78, 91% at 80, 81% at 82, 67% at 84, 50% at 86 and 41% at 87 (Rafa). Over the open commission pool that is about 80%, inside the **0.72–0.88** target. Tickets (min Q 62–74; decent mend quality about 84) pass about 99%, above the **0.95** floor. Commission and ticket pass rates are always reported separately. A weaker player passes about 60% of commissions, Challenging (+6) about 65%, and Relaxed every job.
- **Assist:** full assist gives a mend quality of about 75 (unpick and clean 0.7; seams 0.8; restored 0.8). That passes every ticket and the 74–78 commissions (assisted flips score about 78–79), but not the 80+ ones, which ask for a steady hand, as in §5.
- **Till Day:** a Remade Top at quality 85 and Leaves 70, a Season pick and in the window: `V ≈ round(70 × 0.94 × 1.21 + 7) = 87`, with a fair band of 78–96. A Patch Throw at quality 82 and Leaves 45 is V ≈ 74 base, so about 89 with both bonuses.
- **Showcase:** a decent 3-piece show (3 recipes, 4+ finds, mostly in palette, best mood) scores about **80–84** (Silver Thread): about 6 capsule requests, 180 coins in season 1, reputation +7 and buzz +21. Full assist scores about **72–76**, and a careless show (one recipe, off palette, low Leaves, wrong mood) about **58–62** (Copper Thread). Every show earns at least the Thank-you Ribbon and the Showcase-piece bonus on the rack.
- **Swap & Mend:** 6 well-mended tables give +6 Things saved, +6 buzz and +3 reputation, about the reputation of one commission, with no coins, so the day is worth doing but never required.

### 9.9 Save migration (schemaVersion 1 → 2)

`SCHEMA_VERSION` becomes 2, and `saveMigrations.ts` gains `1: migrateV1toV2`, a pure function on the raw object:

- `profile.career = "stall"`.
- `boutique = null`. When open, it holds `{signId, openedDay, season: {number, themeId, startDay, capsule, showcase, swapDay}, window, props}`. The welcome week is derived from `openedDay`, never stored.
- `keptInUse = flipsFinished`. A v1 `LogEntry` has no find list, so this is the only path.
- Every brief in `gigs.offers`, `gigs.active`, `gigs.lapsed` and `activeRun.brief` gains `kind: "flip"`. `LogEntry.kind` may now also be `"ticket"`.
- `RackPiece` gains `findIds: FindId[]`, `seamAccuracy: number`, `leavesParts: {reuse, salvage, secondhand}`, `colours: ColourId[]` and `showcaseSeason: number | null`. v1 defaults: `findIds: []`, `seamAccuracy: quality / 100`, every Leaves part `leaves / 100`, `colours: [cloth.colour]` plus the colours of its patches and paint dots, and `showcaseSeason: null`. Nothing stores "in season"; it is worked out from the piece's tags and the current season.
- Story `seen`, `flags` and `queue` are kept. A v1 save that already meets the unlock rule gets the offer at its next Stall Day's End Day. The migration itself never queues anything.

The v2 parser rejects a boutique save with no `boutique`, and a stall save that has one. `module.reputationOf` accepts v1 and v2 (§9.1). **Fixtures:** three real v1 saves captured from the current build are committed: mid-flip after the cut, on Stall Day with a stall result, and with a full rack. Each loads, continues and saves again as v2. The mid-flip one also holds Stall Day, reaches the offer and opens the boutique. A v2 save round-trips exactly, and a damaged one is reported, never reset.

### 9.10 Safety notes for the boutique

- **Kind show, no contest.** There are no eliminations, rankings against others, audience votes, judges' "verdicts", hosts, cameras or TV formats. Every show gets a rosette, and the panels speak only in praise plus one gentle tip.
- **No bodies.** Pieces travel on hangers, stands and wheeled hanger rails, never on torso or display forms. Volunteer walkers are stylised studio avatars that are never scored, sized or described. There is no fit, size, length-for-a-person or "flattering" talk; alter tickets are fresh hems for worn edges only.
- **Not luxury, not hustle.** The boutique is a neighbourhood shop, never "exclusive", "designer" or "limited". There are no countdown sales, scarcity pressure or haggling. The fair price is still the best price.
- **Community, not charity theatre.** Swap & Mend is neighbours helping neighbours: no coins, no "donations", no real charity or organisation names. Swaps are always optional and 1-for-1.
- **Respectful mending.** Damaged items are "well-loved", never "ruined" or "cheap". Clients never apologise for wear, and no one is blamed for it.
- **Honest sustainability.** "Things saved" and Leaves are game tallies with no CO₂, water or weight claims. Buying new trims carries no guilt.
- **Tools and cleaning** stay as in §8: no real chemical, iron or machine instructions.
- **Rent and money** are told kindly. Mrs. Pell is a friendly landlady retiring to her garden, and missing rent never brings threats, eviction or debt language.

### 9.11 Build and test plan

**Order of work** (each step ends green on `pnpm lint`, `pnpm typecheck` and `pnpm test`):

1. **Save v2 and careers:** `content/career` list, `profile.career`, `migrateV1toV2` with the three v1 fixtures, parser and `reputationOf`, the `CareerStep` lift (below), and the boutique start.
2. **Unlock:** `boutiqueUnlock`, `openBoutique`, typed story effects, `tf-boutique-offer`, the Larkspur Row hub card and the sign picker.
3. **Boutique hub, rack and Till Day:** `boutique`, `seasonCalendar`, `season` content, `tillDay` (extends `stallDay` with the bonus multipliers; the stall path is unchanged), `capsuleShelf`, `keptInUse`, `BoutiqueBackdrop` art and the hub screen.
4. **Tickets:** brief `kind`, `ticket` content, `ticketBrief`, `mendQuality`, `alterLayout` (edge rule), the stage lists, the one-ticket-offer and regulars rules, and the reuse of the workbench, cut and sew screens.
5. **Window:** props content, `windowDisplay` and `windowScore`, and the window screen (finish-drawer interaction on a 600×400 canvas, with a keyboard path).
6. **Swap & Mend:** `swapDay` (hall commit, tables idempotent per id), `swapRail`, and the screens reusing `StitchBench`, `StainScrubber`, `SewingMachine` and the market cards.
7. **Showcase:** `src/engine/showOrder`, `src/engine/panelScore`, `src/engine/showDay`, `showcaseScore`, `showcase` (choose and stage, legal days, late rule, day-22 suggestion, Relaxed auto-stage), and the planner, show and results screens reusing ADEEVA's `RunwayStage`, `walkerFrame`, `WalkOrder`, `MoodPicker`, `LightPicker` and `StageFigures`, the shared `src/ui/kit/PanelCard` and show clock, plus new `StoryCard` (`FindArt` → `ProductPreview`) and `RosetteArt`.
8. **Content doubling:** finds, fit-table rows, recipes and `ProductPreview` shapes, finishes and their art, clients and tickets, upgrades, beats, and hint lines (each ≤ 12 words: "Lay the hem band along the bottom edge.", "Mix the season's colours. Fill left, middle and right.", "Pick a table. Each one is a quick fix.", "Swap one thing for one thing. No coins today.", "Pick pieces from this season that belong together.", "Choose who walks first. Save your favourite for last.").
9. **Balance and e2e,** then polish.

**Lifted shared pieces (backward-compatible):**

- **`CareerStep`** is the shared `src/ui/newGame/CareerStep.tsx` (also used by ADEEVA and Patisserie). It takes `cards: {id, name, pitch, placeName, badge?, window, facts}[]`; `badge` is an optional extra for Thrift-Flip, and every game builds `facts` with `careerFacts` from `src/ui/newGame/careerFacts.ts`. The hover zoom on the card window lives once in `newGameKit.css`.
- **`StageFigures`** gains an optional `carry(entry)` render prop: when given, a walker wears their own avatar outfit and holds the returned art (a `ProductPreview` on a hanger, or on a rail with Rolling Rails) instead of being dressed through `dressGarment`. ADEEVA's default path is unchanged.
- **`closerStrength(scores: number[])`** in `src/engine/showOrder.ts` keeps the exact maths (0.7·closing + 0.3·opening); ADEEVA, Patisserie and Thrift-Flip all use it, with ADEEVA's parity test. Panel weighting, sub-score clamping, overall score, late penalty, staging points and the kind show reputation are also shared (`src/engine/panelScore.ts`, `src/engine/showDay.ts`), as is the sub-score save parser (`subScoreParser`).

**Unit tests** (one per rule): unlock reasons and thresholds; `openBoutique` legality (bench run carried over) and same reference when illegal; the three migration fixtures; season calendar (Till, swap and showcase days); Till Day bonuses and Season rack bonus; show shelf moves; ticket quality, budget, 0-coin mend marks, flat rewards and no reputation loss; the alter edge rule for every alter item at both worn spots; the patch-throw two-find rule; the one-ticket-offer and regulars rules; swap rail takes stockroom finds only; the Swap & Mend hall commit; window score parts and persistence; Swap & Mend table bounds and idempotence; showcase panels with 1, 2 and 3 pieces, rosette bands, the late rule, the day-22 suggestion, Relaxed auto-stage and rewards; `closerStrength` parity; Things saved counting; content (unique ids, every new ✓ fit placed with both worn spots, gates, kid-line lengths); illegal actions for every new action.

**Balance test:** the planned 12-seed × 6-week sweep (`core/boutiqueBalance.test.ts`) is replaced by the pacing and showcase calibration tests in §9.12.

**E2E** (`e2e/thrift-flip/boutique.spec.ts` and `migration.spec.ts`, at 1280×800 and 820×1180, `MAKER_PORT`): a stall save at the threshold gets the offer, opens with a sign, and does a mend ticket with real drags, a window, a Till Day, and a Showcase staged with keyboard only. A committed v1 save loads into a slot and continues. A "start here" boutique new game is also covered. Reduced motion is checked on the show. There are zero network requests.

**Acceptance:** all of the above, plus `pnpm test` run twice, `pnpm e2e`, every file ≤ 700 lines, and no comments.

### 9.12 As built (where the implementation differs)

- **Rules:** the Pocket Patch costs 1 scrap like every patch. Window colour is the share of the season palette's four colours present in the window, not `paletteCohesion`; the whole window is committed with one "Dress the window" (1 hour) and props are bought on that screen. Craft Circle theme averages each piece's share of the season tags; Story Table cohesion is 100 for one piece. Show-shelf pieces use no rack hooks, and a piece cannot leave the shelf while the rack is full. When the show or the season turn returns shelf pieces, the rack can briefly hold more pieces than hooks; nothing is lost, the rack shows every piece, and new own pieces wait until Till Day frees a hook. A window needs at least one piece to earn Till Day buzz; props alone still score but give +0 buzz. A ticket pass is paid by the engine's `settleReward` (so the Charmer tip and the Challenging late cut apply) with the flat +1 reputation and +1 buzz; a ticket that lapses is removed with no reputation loss, on every difficulty. Till Day sales record their bonuses (`StallSale.bonuses`; v1 results migrate with `[]`).
- **Tickets** arrive only through the regulars rule (one offered or active at a time), plus one the day the shop opens. Hours: mend = unpick 1, clean 1, sew 1, finish 1; hem = unpick 1, lay out 0, cut 1, sew 1; the Mending Basket frees the unpick hour. The lent item never enters the stockroom, so a hem cut gives no scraps or buttons. **Swap & Mend** tables and rail are rolled at the start of season day 11 and saved; a table charges its hour on first work and remembers it (`charged`), so a restarted seam never pays again; the first table or swap commits the day and adds the 3 off-cuts, and a table seam can be restarted (`resetTableSeam`). The paid side job is not offered on Swap & Mend day, so one tap cannot end the day and lose the hall. After the Showcase is staged, the hub keeps a "See the Showcase" button for the rest of the show days, which opens the results and "Watch the show again".
- **Gating and content:** boutique finds, recipes, finishes and upgrades appear only in the boutique (stall upgrades stay buyable). The Lap Throw has no ✓ in the Fits table and shows "Use with a second find"; new fit rows were checked by real placement at both worn spots. A "start here" boutique opens as "Second Bloom"; the sign picker is used when a stall player opens the shop. The Larkspur Row card shows the three goals from reputation 20 and its Open button once the offer has been seen.
- **Shared lifts:** `CareerStep` and `src/ui/newGame/careerDraft.ts`; `StageFigures` takes `carry` and `stageShot` is generic over walkers; `MoodPicker` gains `whisper`, `LightPicker` gains `renderPreview` and `copy` (no "flattering" in the boutique), the results use the shared `src/ui/kit/PanelCard` with its `icon`, `tone`, `blurb` and `verdict` props; show flow is the shared `src/engine/showOrder.ts` with an ADEEVA parity test. The show runs in a new `HallBackdrop` (Larkspur Hall) on ADEEVA's timeline, clock, title card and walker frames.
- **Balance and tests:** `unlockPacing.test.ts` (scripted decent, weaker and Relaxed players; decent Standard offer on day 22–36, mostly 22) and the showcase calibration in `showcase.test.ts` stand in for the full 12-seed, 6-week sweep, which is not built. The scripted players get their finds free, never play tickets, the window, Swap & Mend or the Showcase, and stall on many boutique commissions, so the §9.8 week-money table, the "Assist passes every ticket" line and the §9.1 unlock days are design targets that no test covers. A probe over seeds 3, 7, 11 and 19 saw the Challenging decent offer on day 22–29, Standard weaker on day 29–36, and Challenging weaker not by day 70; coins never went negative and Relaxed never soft-locked. Unit files: `boutiqueUnlock`, `boutiqueSeason`, `boutiqueRules`, `boutiqueContent`, `ticket`, `windowDisplay`, `swapDay`, `showcase`, `saveMigration`; e2e: `boutique.spec.ts`, `migration.spec.ts`.

## 10. Out of scope

- A hired assistant, a third career, and more than one shop or market.
- Recipes beyond the 12: jackets, coats, knitwear, dyeing and embroidery.
- Flips from more than 2 finds; a free-draw mending mini-game; photo or camera import of real clothes.
- Weather, haggling dialogue trees and stock that carries over between saves.
- Real measurements or printable patterns, and any online selling, sharing or leaderboards.
