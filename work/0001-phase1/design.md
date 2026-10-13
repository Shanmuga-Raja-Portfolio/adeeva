# ADEEVA — Phase 1 Design

Working title: **ADEEVA**. An original fashion-design career sim for a 15+ player, built around a hands-on dressmaking craft loop. All code, art, names, text and data are original. Language is clean and warm. Fully offline: no network calls, no telemetry, no accounts. The player name is stored only in the browser's localStorage.

## 1. Decisions (from Shan)

| Topic      | Decision                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Platform   | Web, TypeScript + Vite + React, SVG art drawn in code                                                                                 |
| Input      | Mouse and touch. Pointer Events only; nothing needs a keyboard or hover                                                               |
| Personas   | Two starts, **Student Designer** and **Label Designer** (fashion show), plus a progress path: a Student can launch a label            |
| Traits     | Dreamer, Perfectionist, Trendsetter, Charmer. Each trait has a mechanic modifier, a dialogue voice and gated clients/story            |
| Sim depth  | Medium: day calendar with hours, coins, reputation, buzz, weekly rent, one hireable assistant, weekly trend market, 4 studio upgrades |
| Craft loop | All 7 steps, polished: brief → sketch → fabric → cut → assemble → sew → decorate → deliver                                            |
| Show mode  | Themed 3-look collection, then an animated runway with walk order, music mood and lighting, scored by critics, buyers and audience    |
| Failure    | Difficulty picked at New Game: Relaxed (no fail), Standard (soft fail), Challenging (real stakes)                                     |
| Avatar     | Inclusive builder: name, skin tone, hair style, hair colour, outfit style. Stylised; no photos                                        |

## 2. Architecture

```
src/
  main.tsx                 React root
  app/                     App shell, screen router, store hook, persistence adapter
  core/                    Pure TS game rules. No React, no DOM, no Date.now, no Math.random
  content/                 Catalog data (ids, numbers, text). No logic
  ui/art/                  Presentational SVG components (paper doll, garment parts, fabrics, trims, avatar, runway)
  ui/screens/              One screen per file
  ui/kit/                  Small UI primitives (Button, Panel, Meter, Dialog)
  styles/                  Global CSS and design tokens
e2e/                       Playwright playthroughs
```

Rules:

- `core` is deterministic. All randomness goes through a seeded RNG whose state lives in `GameState`.
- State changes go through `reduce(state, action) => state`. It is pure and never mutates its input. The UI dispatches actions and never edits state directly.
- Illegal actions return the same state reference unchanged. The UI disables controls using the `can*` query functions from core.
- One concept per file. Folders named utils/helpers/common/shared are not allowed.
- No comments in code. Names carry the meaning.
- Persistence: the app layer serialises `GameState` to localStorage (key `adeeva.save.<slot>`, 3 slots) with `schemaVersion`. On load, `core/save` validates and migrates; an invalid save is reported, never silently reset. The pending autosave is flushed before the shell routes into a lazily loaded view (craft or label).
- Lazily loaded views sit inside one error boundary in `app`. While a view loads, a small card says the studio is opening; if it fails to load, a card says "This part of the studio didn't load. Reload to continue — your progress is saved." with a Reload button.
- Catalog lookups by id live in `core/catalog` (colour, fabric, part, client, theme, story beat, material, trim, career, difficulty, upgrade); core and UI both use them, so names and hexes come from one place.

## 3. Content model (`src/content`)

Ids are kebab-case string literals, exported as `as const` arrays so types derive from them.

- **Style tags**: `elegant, playful, romantic, edgy, casual, classic, bold, dreamy, sporty, regal`
- **Colours**: named palette entries `{id, name, hex}`. There are 16 of them.
- **Materials**: `cotton, linen, wool, silk, satin, velvet, tulle, denim`, each `{id, name, drape (0-1), sheen (0-1), sewDifficulty (0-1), tags}`
- **Fabrics**: `{id, name, material, colour, print: solid|floral|stripe|dot|check|sparkle, pricePerMetre, tags, unlockReputation}`. At least 18.
- **Garment parts**: categories `bodice (3), neckline (3), sleeves (4 incl. none), skirt (4)`. Each part has `{id, category, name, tags, pieces: PatternPieceDef[], seams: SeamDef[], hours}`.
  - `PatternPieceDef {id, name, shape: polygon points in cm, grain: 'straight'|'bias-friendly', mirrorPair?: boolean}`
  - `SeamDef {id, name, path: points (0-1 normalised wiggle profile), length}`
- **Trims**: `button, bow, lace, flower-applique, sequin-patch, ribbon-belt, pearl, star-applique`, each `{id, name, price, tags}`
- **Traits** (§6), **Clients and gigs** (§7), **Show themes** (§8), **Upgrades** (§5), **Story beats** (§9)

## 4. Craft loop (one `DressRun`)

`DressRun.stage`: `brief → sketch → fabric → cut → assemble → sew → decorate → review → done`. Moving forward requires the current stage to be complete. Moving back is allowed only to stages whose outputs are not yet consumed: before any cut, sketch and fabric can be revisited; after a cut, the design is locked.

1. **Brief**: client portrait, occasion, deadline day, budget, required tags (1–2), favoured colours, avoided colours/materials, required trims (`{trim, count}`), minimum quality, fee. A live checklist stays visible on every later stage.
2. **Sketch** (1 h): pick one part per category, then assign an owned or planned fabric per category. Preview on the paper doll.
3. **Fabric** (1 h per shop visit): the shop sells by 0.5 m. Coins are checked and deducted atomically. Trims are sold here too.
4. **Cut** (2 h): a fabric bolt rectangle `width 140 cm × owned length`, with the grain arrow vertical. Each required piece (from the chosen parts, mirrored pairs counted twice) is dragged onto its fabric, rotated in 45° steps, and must be in bounds and non-overlapping (polygon AABB plus SAT test).
   - **Grain score per piece**: angle 0/180 = 1.0. Angle 45/135 = bias: 1.0 for skirts tagged bias-friendly (and adds `dreamy` drape), 0.7 for others. Angle 90/270 = 0.6.
   - **Cut**: a trace interaction along the highlighted outline. Accuracy = the share of sampled pointer points within the tolerance band (`base 1.2 cm` × trait × upgrade × difficulty). An **Assist cut** toggle gives a flat 0.8 accuracy.
   - Confirming the cut consumes `ceil((maxY of all pieces on that fabric) / 50) × 0.5 m` exactly once per fabric and creates `CutPanel`s. The confirm action is idempotent (keyed by run id + fabric id).
5. **Assemble** (1 h): drag each cut panel onto its mannequin slot. Wrong slots are rejected with a reason, and missing slots are listed.
6. **Sew** (3 h, minus 1 h with the assistant): a list of seams. The mini-game: holding the pointer down feeds fabric, so the seam line scrolls under the needle; horizontal pointer position steers the fabric. Speed rises the longer the hold continues; releasing pauses. Band width × material `sewDifficulty` × trait × upgrade × difficulty.
   - **Scoring lives in core**: core decides whether the needle is on the line for a seam profile position and lateral offset against the band (`isNeedleOnLine`); the UI only runs the animation loop and reads pointer input. Each seam stores exact counts `{progress, ticks, insideTicks, assisted}`, and accuracy = `insideTicks / ticks`, computed by core.
   - `recordSeam {seamId, progress, ticks, insideTicks, assisted}` is validated: whole-number counts, `insideTicks ≤ ticks`, ticks only grow, the ticks on the line never grow faster than the ticks sewn, and every new tick moves progress strictly forward. The ticks added are bounded by the progress added: at least `MIN_TICKS_PER_SEAM` (60) and at most `MAX_TICKS_PER_SEAM` (1200, plus one for the final tick that is clamped at the seam's end) per whole seam. The machine feeds 70–230 units a second at 60 ticks a second over seams of 560–840 units, so a real seam takes 146–720 ticks and the bounds leave wide headroom. Resuming a seam (after a pause, a remount or a reload) continues the exact counts, and the machine re-syncs to the stored counts whenever they grow. Work in progress is recorded on release, on completion, when the machine is closed mid-hold and when Assist sew is toggled.
   - **Assist sew** widens the drawn and scored band ×1.6. A seam that was assisted at any point counts at most 0.8 accuracy, mirroring Assist cut's flat 0.8. Toggling it mid-hold keeps the machine running on the new band; the work sewn so far is recorded under the previous setting first.
   - Each seam can be restarted, and completed seams are never touched by a restart.
7. **Decorate** (1 h): drag trims from inventory onto the doll, then move, rotate and scale them, or delete them back to inventory. Stored as `{trimId, x, y, rotation, scale, layer}` in doll coordinates. Placed trims are consumed on delivery.
8. **Review/Deliver**: core evaluates the frozen run and commits the result once. A run id can never be rewarded twice.

### Evaluation (deterministic, `core/evaluate`)

Criteria, each `{id, label, passed, detail, weight}`:

- `construction`: all pieces cut, assembled and all seams sewn (mandatory)
- `quality` ≥ minimum. Quality = 100 × (0.35·avg cut accuracy + 0.45·avg seam accuracy + 0.10·avg grain score + 0.10·material fit), where material fit is the share of part fabrics whose material tags intersect the brief tags or are neutral
- `style`: every required tag appears in the dress tags (union of part, fabric, material and trim tags)
- `colours`: no avoided colour is used; a bonus for each favoured colour
- `trims`: required trim counts are met
- `budget`: fabric and trim spend for this run ≤ budget
- `deadline`: delivered on or before the deadline day

Score 0–100 = weighted pass mix + quality. Stars 1–5.

### Rewards (`core/economy`)

- Pass (construction + style + trims + quality): fee × (0.8 + 0.4 × score/100) + trait bonuses (Dreamer flair, Charmer tip, Trendsetter eye), plus reputation `+1..+3` and buzz.
- Soft fail (Standard): 40% of the fee, reputation −1, and kind feedback lines generated from the failed criteria.
- Relaxed: always counts as a pass, though stars still reflect quality.
- Challenging: every brief's minimum quality is 6 higher; a fail pays 0 and costs reputation −3; late delivery costs −50% of the fee.

## 5. Sim layer (`core/calendar`, `core/studio`)

- A day has **10 hours**. Every craft step and shop visit costs hours. **End Day** advances the calendar: buzz fades by 2 (never below 0), it expires overdue gigs (a late-penalty path), rolls new offers from the seeded RNG, and every 7th day charges **rent** (Student 80, Label 250) and pays the **assistant** wage (30/week). Rent and wage are both scaled by the difficulty's rent multiplier (×0 Relaxed, ×1 Standard, ×1.5 Challenging), at hire and weekly, so Relaxed has no bills at all.
- **Part-time shift** action (every difficulty, so a Relaxed player who spends down to 0 coins can always earn again): spend an untouched day for coins (Student café shift 35, Label pattern-drafting freelance 70).
- **Assistant**: hire/fire. While hired, sewing costs 1 h less and the cut tolerance gets +10%.
- **Trend market**: each week, 2 hot tags are drawn by seeded RNG. Dresses matching a hot tag get +10% fee and +3 buzz per match. Trendsetter sees next week's trends early.
- **Upgrades** (one-time purchases, gated by reputation): `pro-machine` (sew band +15%), `big-table` (cut tolerance +15%), `fabric-shelf` (10% shop discount), `mood-board` (+1 hour per day).
- **Buzz** 0–100 drives how many offers appear per day (1–3).
- **Bankrupt** (Challenging only, coins < 0 after rent): a story beat says you must take shifts. There is no game over.

## 6. Traits (`content/traits`)

| Trait         | Mechanic                                                                   | Voice                | Gated content                                                                                      |
| ------------- | -------------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------- |
| Dreamer       | +15% fee when the dress has ≥3 distinct colours or the `dreamy`/`bold` tag | wistful, imaginative | Iris — gallery-opening piece; story: "The Sketch That Wouldn't Sleep"                              |
| Perfectionist | Cut and sew tolerance +20%                                                 | precise, earnest     | Aunt Odile — formal recital gown; story: "Measure Twice"                                           |
| Trendsetter   | Sees next week's trends; +10% fee per trend match                          | upbeat, confident    | Jaz — creator-collab outfit; story: "Front Row"                                                    |
| Charmer       | Tip +10% of fee; soft-fail reputation loss 0                               | warm, chatty         | Mr. Abara — community theatre costume (a seed for the media/costume career); story: "Curtain Call" |

## 7. Student Designer (start A)

Setting: a bedroom studio. Gigs arrive as phone messages from friends and family. Start: 120 coins, reputation 0. There are 5 general clients (Mom — birthday dinner; Priya, best friend — winter formal; cousin Leo's partner Sam — graduation; neighbour Mrs. Chen — garden party; classmate Tomas — band gig, edgy) plus the trait-gated client. Each client has a brief template, and the seeded RNG varies budget, deadline and favoured colours.
Progress: at reputation ≥ 40, with ≥ 8 gigs delivered, the **Student Showcase** story beat offers **Launch your label**. Accepting switches `career` to `label` in the same save, keeps coins, traits and inventory, and starts Season 1 (§8).

## 8. Label Designer (start B, or progressed)

Setting: a small atelier. Start: 600 coins, reputation 20. A season = a themed show with a deadline (day 14 of the season).

- Themes (3): **Midnight Garden** (romantic, dreamy; deep colours; budget 170, min quality 68), **Coastal Breeze** (casual, playful; light colours; budget 130, min quality 68), **Neon Future** (edgy, bold; bright colours; budget 200, min quality 72; its pitch mentions sequin sparkle so a bold trim is discoverable). Each theme has required tags, a palette and a best-match music mood.
- A collection is 3 looks; each look is a full `DressRun` against the theme brief. The season's minimum quality is the theme's plus the difficulty bonus (`seasonMinQuality`); the theme brief, the season header and each finished look's quality mark all use it, and a look's mark shows its own quality verdict. Cohesion = palette overlap between looks.
- Private clients still arrive between looks (pageant, gala, and the trait-gated client), so the player balances time.
- **Runway**: choose the walk order (opener and closer matter: the strongest look closes), music mood (4 moods), and lighting (warm/cool/spotlight). An animated show plays: avatars walk, with camera flashes, then three panels score it:
  - Critics: avg quality, theme tags, cohesion
  - Buyers: wearability (casual/classic tags of the garment itself — parts and fabrics; materials and trims do not count), sensible cost
  - Audience: wow (25 points per distinct trim tagged `bold`/`dreamy`/`regal`, plus the share of looks carrying those tags), music match, closer strength
- The show can be staged from the day before its deadline (the venue is booked for show day); staging after the deadline costs 10 points except on Relaxed.
- Outcome: orders → coins (one order per 4 score points above 55; 40 per order, +10 per season up to season 5), reputation, buzz, and a press quote (written from score bands). The next season opens the day after the show's deadline, with a new theme and a bigger venue name.

## 9. Story (`content/story`)

Short scenes of 2–5 lines, triggered by flags such as `intro`, `first-delivery`, `first-week`, trait beats, `showcase-offer`, `season-start`, `runway-done`. Each scene has a speaker, its lines, and optional choices that set flags. Player lines vary by trait voice.

## 10. Screens

Title (Continue / New / Load slot) → New Game: Avatar → Trait → Career → Difficulty → intro scene → **Studio Hub** (calendar, hours, coins, rep, buzz, trends, inbox/offers, active gigs, studio and upgrades, assistant, end day, shift, save) → Craft screens (§4) → Results → Hub. Label mode adds **Collection board** and **Runway**. A Settings dialog offers reduced motion and Assist cut/sew defaults; its Assist sew copy says plainly that assisted seams count up to 80%.

## 11. Visual direction

Original, warm, boutique: cream paper `#fbf6ef`, ink `#2b2230`, accent rose `#d0587e`, sage `#7fa58a`, gold `#c9a227`. Rounded cards, soft shadows, serif display font stack (`"Playfair Display", Georgia, serif`) loaded locally from the system only; body `system-ui`. The paper doll is a stylised fashion croquis drawn in SVG; fabrics use SVG `<pattern>` fills per print. Motion respects `prefers-reduced-motion`.

## 12. Acceptance (phase 1)

1. A new game builds avatar, trait, career and difficulty; the intro plays; the hub shows.
2. A Student gig runs through all 7 craft steps end to end; inventory, coins and hours change exactly once per action.
3. Grain rotation, cut accuracy and seam accuracy measurably change quality.
4. Results list every criterion with a reason; rewards follow the difficulty rules; there is no double reward on reload.
5. End Day, rent, trends, assistant, upgrades and part-time shifts work.
6. Each trait's modifier is unit-tested, and its gated client appears only for that trait.
7. A Label season: 3 looks → runway animation → three panel scores → rewards → next season.
8. A Student meeting the threshold can launch a label in the same save.
9. Save, reload and continue in all three slots; a corrupted save is reported.
10. Evaluation and rewards are deterministic for the same state and actions.
11. `pnpm lint`, `pnpm typecheck`, `pnpm test` (twice) and `pnpm e2e` pass.
