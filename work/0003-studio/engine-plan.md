# Maker Studio: plan for extracting the shared engine and reorganising the tree (read-only)

This is based on reading every file in `src/core`, `src/content`, `src/app`, `src/ui/kit` and `src/ui/art`, plus the import graph of `src/ui/screens`, the e2e specs and the config files.

## 0. What I found that changes the plan

1. **`Y:\ADEEVA` is not a git repository.** Nothing can be rolled back. Before step 1, either run `git init` and commit the current tree, or zip the folder.
2. **The avatar is tied to fashion art.**
   - `ui/art/Avatar.tsx` has a `dress` prop that pulls in `DressGarment`, `DressLook` and `TrimLayer`.
   - `AvatarOutfit.tsx` uses `FabricPattern`, `fabricLook`, `GarmentPiece`, `SkirtShape` and `TrimArt`.
   - Through those, the avatar depends on the content files colour, material, print, fabric and trim.
   - `fabricLook` only uses `colour`, `material.id`, `print` and `id` from a fabric. That makes a narrow `Cloth` type possible (step 5).
3. **The game logic must not import from `ui`.** `Profile.look` and `ClientDef.look` both use `AvatarLook`. So the avatar data, and the cloth palette the default outfits need, go into `src/engine` as pure data. This is the only data-like part of the engine.
4. **Thrift-Flip reuses ADEEVA's fabric, garment and sewing systems.** The plan lets it import from `games/adeeva/{core,content,ui/art}` in one direction only, rather than moving fashion code into the engine.
5. **A home screen will break the e2e specs.** All 6 `page.goto("/")` calls expect ADEEVA's title screen. ADEEVA gets a hash deep link `/#/adeeva`, and those 6 lines change.
6. **The e2e specs import from `../src/core`, `../src/core/testPlaythrough`, `../src/content/fabric` and `../src/content/trim`.** These paths must be rewritten.
7. **The exact localStorage keys in use:**
   - `adeeva.save.1..3`
   - `adeeva.lastSlot`
   - `adeeva.probe`
   - `adeeva.settings` (seeded directly by `e2e/craft.spec.ts`)
8. **`Play Maker Studio.cmd` already exists.** It runs `pnpm dev` and opens the browser after a fixed 4-second wait. The dev server uses port 5173 with `strictPort`, so a busy port makes the server fail. This may be why the link didn't load; the caller should check it separately.

## 1. Target layout

```
src/main.tsx                      renders <StudioApp/>
src/studio/                       app shell, home, registry, profile, perks, playtime, parent page, slot store, settings, toast
src/engine/                       pure TS (no React/DOM/Date/Math.random), barrel index.ts
src/ui/kit/                       unchanged + generic useDispatchOnce
src/ui/art/                       avatar/ and cloth/ (shared art)
src/styles/                       tokens, kit, art, global, + shell.css (was app/app.css)
src/games/adeeva/{module.ts, core/, content/, ui/}
e2e/studio.spec.ts, e2e/adeeva/*.spec.ts, e2e/fixtures/*
```

## 2. Every file: destination and change

Short forms used in the tables:

- **GA** = `src/games/adeeva`
- **E** = `src/engine`
- **"as is"** = file moves, only import paths change.

### src/core (all except the rows below → `GA/core/<same name>`, as is)

| File                                                                                       | Destination             | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rng.ts, rng.test.ts                                                                        | E/rng.ts, E/rng.test.ts | as is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| rngDraw.ts                                                                                 | E/rngDraw.ts            | as is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| clamp.ts, average.ts, recordWithout.ts, ownEntry.ts                                        | E/util/*.ts             | as is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| actionCheck.ts                                                                             | E/actionCheck.ts        | as is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| week.ts                                                                                    | E/week.ts               | as is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| shapeParser.ts                                                                             | E/parse.ts              | as is (rename only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| triangulate.ts, polygonOverlap.ts(+test), piecePolygon.ts, rotation.ts, layoutTolerance.ts | E/geometry/*.ts         | `Point` now imported from `E/geometry/point.ts`; rename `LAYOUT_TOLERANCE_CM` → `OVERLAP_EPSILON` (same value 0.01)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| traceAccuracy.ts                                                                           | E/geometry/trace.ts     | as is; `ASSIST_CUT_ACCURACY` stays (assist mode applies in every game)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| dayHours.ts                                                                                | split                   | E/dayHours.ts gets calendar-level `hasHours`, `spendCalendarHours`, `hoursShortfallReason`, `BASE_DAY_HOURS`. GA/core/dayHours.ts keeps `hoursPerDay` (mood-board), `MOOD_BOARD_BONUS_HOURS`, and thin wrappers `hasHours(state,h)`, `spendHours(state,h)`, `hoursShortfallReason(state,h)`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| standing.ts                                                                                | E/standing.ts           | made generic over the state type (see §3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| criterion.ts                                                                               | split                   | E/score.ts gets `Criterion<Id>`, `passMix`, `starsForScore`, `STAR_THRESHOLDS`, `gatePassed`. GA keeps `CRITERION_IDS`, `CRITERION_WEIGHTS` and `type CriterionId`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| evaluate.ts                                                                                | GA/core                 | uses `E/score` (`starsForScore` re-exported from the GA index)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| rewards.ts                                                                                 | split                   | E/reward.ts gets `settleReward` (outcome per difficulty, fee share, charmer tip, late penalty, soft/hard fail). GA/core/rewards.ts builds the trend, trendsetter and dreamer bonus lines, calls `settleReward`, then adds `trendMatches`. **Line order must stay Fee → Trend → Trendsetter → Dreamer → Charmer → Late**                                                                                                                                                                                                                                                                                                                                                                                                              |
| offers.ts, offerResponse.ts, gigDeadline.ts                                                | split                   | E/gigBoard.ts (generic board). The GA files become wrappers with the same exported names and signatures (`rollOffers`, `acceptOffer`, `declineOffer`, `offerAcceptIssue`, `eligibleClients`, `clientIsEligible`, `offersFor`, `lapseOverdueGigs`, `isGigLate`, `gigLapseDay`, `LATE_GRACE_DAYS`, `MAX_ACTIVE_GIGS`)                                                                                                                                                                                                                                                                                                                                                                                                                  |
| storyQueue.ts, storyVoice.ts                                                               | split                   | E/story.ts (generic queue and voice). GA wrappers keep `queueStoryTrigger(state,t)`, `currentBeat`, `markBeatSeen`, `completeBeat`, `beatLines`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| storyChoice.ts                                                                             | GA/core                 | as is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| save.ts, saveMigrations.ts                                                                 | split                   | E/saveEnvelope.ts (`parseSaveWith`, `migrateRaw`, `SaveMigration`; **error strings unchanged**). GA/core/save.ts keeps `parseSave(json)` and `serialize`; GA/core/saveMigrations.ts keeps migrations 1 and 2 and `legacySeamCounts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| catalog.ts                                                                                 | GA/core                 | private `requireEntry` replaced by `E/catalog.requireById`; `colourById` re-exported from `E/palette`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| newGame.ts                                                                                 | GA/core                 | `newGameIssues` = `profileIssues(settings)` (E/profile) followed by the career check, keeping today's message order; `isAvatarLook` comes from E/avatar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| studio.ts                                                                                  | GA/core                 | `upgradePurchaseIssues` delegates to E/upgrades; assistant stays in GA                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| calendar.ts                                                                                | GA/core                 | uses `E/standing.decayBuzz`, `E/difficulty.weeklyRent`, `E/gigBoard.expireOffers`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| index.ts                                                                                   | GA/core/index.ts        | keeps **every current export name**, re-exporting the moved ones from E (`isWeekEnd`, `DAYS_PER_WEEK`, `weekEndDay`, `ActionCheck`, `polygonsOverlap`, `placedPolygon`, `polygonBounds`, `rotatedShape`, `Bounds`, `ROTATIONS`, `Rotation`, `traceAccuracy`, `distanceToOutline`, `ASSIST_CUT_ACCURACY`, `starsForScore`, `beatLines`, `SpokenLine`, `currentBeat`, `BASE_DAY_HOURS`, `hoursShortfallReason`, `MAX_NAME_LENGTH`, `colourById`, `difficultyById`, `MAX_ACTIVE_GIGS`, `offerCountForBuzz`, etc.), so UI and e2e only change the path                                                                                                                                                                                   |
| Adeeva-only, as is                                                                         | GA/core                 | action, activeRunUpdate, assembly, brief, catalogIdParsers, checklist, cutCommit(+test), cutLayout, cutMetres, cutTolerance, decoration, delivery(+test), designFabrics, dressQuality, dressRun, dressRunParser, dressSnapshot, dressTags, finishedLook, gameState, gameStateParser, grainScore(+test), hourCost, kindFeedback, labelLaunch(+test), labelSeason(+test), paletteCohesion, piecePlacementIssues(+test), pressQuote, reduce, requiredPieces, requiredSeams, resultParsers, runLifecycle, runSpend, runStage, runway, runwayScore(+test), seamAccuracy, seamLine, seasonFlow, seasonMinQuality, sewBand, sewing(+test), shop, sketch, stageNavigation(+test), stageReadiness, testPlaythrough, trendMarket, trendPreview |
| Tests that stay in GA (they go through `reduce`)                                           | GA/core                 | calendar, catalog, evaluate, offers, rewards, save, story, studentGig, tolerance. New engine tests are added for gigBoard, story, reward, saveEnvelope, profile and score                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

`gameState.ts` keeps the exact field names and shape. `Profile` becomes `ProfileBase & { career }`, `StoryState` comes from E, and `Offer`, `Gig`, `LapsedGig` and `GigBoard` become `E` generics instantiated with `Brief`. The JSON shape is unchanged and `SCHEMA_VERSION` stays 3.

### src/content

| File                                                                                                                     | Destination            | Change                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| avatarOption.ts                                                                                                          | E/avatar.ts            | as is, plus `isAvatarLook` moved here from newGame                                                                                                                                                                                                                   |
| colour.ts, print.ts                                                                                                      | E/palette.ts           | `COLOURS`, `ColourId`, `colourById`, `PRINTS`, `PrintId`                                                                                                                                                                                                             |
| material.ts                                                                                                              | GA/content/material.ts | `MATERIAL_IDS` and `MaterialId` move to E/palette; `MaterialDef` (drape, sheen, sewDifficulty, StyleTag tags) stays in GA                                                                                                                                            |
| difficulty.ts                                                                                                            | split                  | E/difficulty.ts gets `DIFFICULTY_IDS`, `DifficultyId`, `DIFFICULTY_RULES` (rentMultiplier, toleranceMultiplier, minQualityBonus) and `DifficultyText`. GA/content/difficulty.ts builds `DIFFICULTIES` with the same objects and values and ADEEVA's description text |
| trait.ts                                                                                                                 | split                  | E/trait.ts gets `TRAIT_IDS`, `TraitId`, `TraitDef` shape. GA/content/trait.ts keeps `TRAITS` (perk text is per game)                                                                                                                                                 |
| career, client, fabric, garmentPart, garmentSlot, runwayLight, runwayMood, showTheme, storyBeat, styleTag, trim, upgrade | GA/content             | as is. `garmentPart` imports `Point` from E (no re-export). `storyBeat` types become `StoryBeatDef = E.StoryBeat<StoryTrigger, "launch-label">`                                                                                                                      |

### src/app

| File                                  | Destination                 | Change                                                                                                                                                                     |
| ------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App.tsx                               | studio/StudioApp.tsx        | providers + `StudioShell` (home / game / parent)                                                                                                                           |
| GameShell.tsx                         | GA/ui/AdeevaGame.tsx        | add prop `onExitToStudio`; take its slot store from `createSlotStore("adeeva", …)`                                                                                         |
| appRoute.ts                           | GA/ui/adeevaRoute.ts        | as is (ADEEVA's internal title/newGame/play routing)                                                                                                                       |
| useGameSession.ts                     | studio/useGameSession.ts    | generic over the game's state, action and new-game settings, plus a slot store (see §3)                                                                                    |
| saveSlots.ts (+test)                  | studio/slotStore.ts (+test) | generic `createSlotStore(gameId, codec)`; keys are built from `gameId`, giving the same `adeeva.*` keys                                                                    |
| appSettings.ts                        | studio/settings.ts          | key stays `"adeeva.settings"` (constant renamed to `SETTINGS_KEY`, value unchanged); fields unchanged; `assistCut`/`assistSew` are used for trace and timing in every game |
| SettingsContext.tsx, ToastContext.tsx | studio/                     | as is                                                                                                                                                                      |
| ViewLoadBoundary.tsx                  | studio/                     | as is                                                                                                                                                                      |
| newSeed.ts                            | studio/newSeed.ts           | as is                                                                                                                                                                      |
| app.css                               | styles/shell.css            | as is; imported from main.tsx                                                                                                                                              |

### src/ui/kit

All files stay where they are.

- **`useDispatchOnce.ts`** becomes generic, which removes the core import: `useDispatchOnce<S, A>(state: S, dispatch: (a: A) => boolean): (event: ClickLike, ...actions: readonly A[]) => boolean`.
- **`IconSet.tsx`** stays and gains icons later.

### src/ui/art

| File                                                                      | Destination              | Change                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Avatar.tsx                                                                | ui/art/avatar/Avatar.tsx | the `dress` prop is replaced by a generic `garment` prop (see §3)                                                                                                                                                                                                                                                                                 |
| AvatarFace, AvatarHair, Croquis                                           | ui/art/avatar/           | as is (imports from E/avatar)                                                                                                                                                                                                                                                                                                                     |
| AvatarOutfit.tsx                                                          | ui/art/avatar/           | its `cloth()` returns the `Cloth` type, and buttons use `ButtonArt`                                                                                                                                                                                                                                                                               |
| colourMix, useSvgId, seedFromText, GarmentShape, GarmentPiece, SkirtShape | ui/art/cloth/            | as is                                                                                                                                                                                                                                                                                                                                             |
| fabricLook.ts, FabricPattern.tsx                                          | ui/art/cloth/            | parameter `FabricDef` becomes `Cloth`. `FabricLook.material: MaterialDef` becomes `material: MaterialId`; update the 6 `look.material.id` reads in the art. `FabricDef` still fits `Cloth` structurally, so callers don't change                                                                                                                  |
| (new) ButtonArt.tsx                                                       | ui/art/cloth/            | the `button` and `pearl` drawings moved out of TrimArt **byte-for-byte**                                                                                                                                                                                                                                                                          |
| TrimArt.tsx                                                               | GA/ui/art                | its button and pearl cases call `ButtonArt` / `PearlArt`                                                                                                                                                                                                                                                                                          |
| All the rest                                                              | GA/ui/art                | as is: AtelierStudio, BedroomStudio, BodiceShape, DressFormArt, DressGarment, DressLook, DressPreview, FabricBolt, FabricSwatch, NecklineShape, PatternPieceShape, RunwayAudience, RunwayStage, SeamStrip, SewingNeedle, SewingStage, SleeveShape, SlotHighlight, StudioBackdrop, TrimLayer, designLook, runwayGeometry, runwayWalker, slotAnchor |
| (new) dressGarment.tsx                                                    | GA/ui/art                | `dressGarment(dress): AvatarGarment` adapter used by ResultsStage, StageFigures and StagePreview                                                                                                                                                                                                                                                  |

### src/ui/screens, styles, e2e, config

- **`ui/screens/**`** (craft, hub, label, newGame, settings, story, title) moves to `GA/ui/screens/**` as is. The title screen gets a "Back to studio" button calling `onExitToStudio`. `AvatarStep` pre-fills its look from the studio profile.
- **`styles/*`** stays. `main.tsx` adds `styles/shell.css`.
- **e2e:**
  - Move the four specs to `e2e/adeeva/*.spec.ts`.
  - Rewrite imports to `../../src/games/adeeva/{core,content}/…` and fixtures to `../fixtures/…`.
  - Change the 6 `goto("/")` calls to `goto("/#/adeeva")`; put it in one helper in `fixtures`.
  - Keep `adeeva.*` keys exactly as they are.
  - Add `e2e/studio.spec.ts`.
- **`eslint.config.js`:**
  - Pure-code files are now `src/engine/**/*.ts` and `src/games/*/{core,content}/**/*.ts`. They may not import `react`, `react-dom`, `**/ui/**`, `**/studio/**` or `**/games/**` (engine only), and the restricted globals stay.
  - Add a rule that no game imports another game except `games/thrift-flip/** → games/adeeva/**`.
- **`vite.config.ts`** (`src/**/*.test.ts`), **`playwright.config.ts`** and **`tsconfig.json`** need no change.

## 3. Engine API (signatures)

```ts
// rng.ts / rngDraw.ts (unchanged)
type RngState = number; nextRandom(s): [number, RngState]
drawInt(s, min, max): [number, RngState]; drawItem<T>(s, items): [T, RngState]; drawDistinct<T>(s, items, n): [T[], RngState]

// util
clamp(v, min, max); average(xs); recordWithout<T>(rec, key); ownEntry<T>(rec, key)
interface ActionCheck { ok; reasons }  actionCheck(reasons): ActionCheck

// week.ts / dayHours.ts
DAYS_PER_WEEK; isWeekEnd(day); weekEndDay(day)
interface CalendarState { day: number; hoursLeft: number; shopOpen: boolean }   // as today
BASE_DAY_HOURS = 10
hasHours(c: CalendarState, h): boolean
spendCalendarHours(c: CalendarState, h): CalendarState | null    // returns same ref when h === 0
hoursShortfallReason(c: CalendarState, h): string | null          // same text

// standing.ts
interface Standing { coins: number; reputation: number; buzz: number }
MAX_BUZZ = 100; BUZZ_DECAY_PER_DAY = 2
applyStanding<S extends Standing>(s: S, change: Standing): S
decayBuzz(buzz: number): number

// trait.ts / difficulty.ts
TRAIT_IDS; type TraitId; interface TraitDef { id; name; tagline; perk; voice }
DIFFICULTY_IDS; type DifficultyId
DIFFICULTY_RULES: Record<DifficultyId, { rentMultiplier; toleranceMultiplier; minQualityBonus }>
weeklyRent(baseRent: number, d: DifficultyId): number            // Math.round(base * mult)

// avatar.ts / palette.ts
SKIN_TONES, HAIR_STYLES, HAIR_COLOURS, OUTFIT_STYLES; type AvatarLook; isAvatarLook(look): boolean
COLOURS; type ColourId; colourById(id); MATERIAL_IDS; type MaterialId; PRINTS; type PrintId

// profile.ts
MAX_NAME_LENGTH = 24
interface ProfileBase { name: string; look: AvatarLook; trait: TraitId; difficulty: DifficultyId }
interface ProfileSettings extends ProfileBase { seed: number }
profileIssues(s: ProfileSettings): string[]       // name, length, seed, avatar, trait, difficulty — same strings/order

// catalog.ts
requireById<T extends { id: string }>(items: readonly T[], id: string, kind: string): T

// gigBoard.ts  (B = the game's brief type)
interface DatedBrief { deadlineDay: number }
interface Offer<B> { id; clientId; brief: B; expiresDay }
interface Gig<B> { id; clientId; brief: B; acceptedDay }
interface LapsedGig { gigId; clientId; day; reputation }
interface GigBoard<B> { offers: readonly Offer<B>[]; active: readonly Gig<B>[]; lapsed: readonly LapsedGig[]; nextGigNumber: number }
interface GatedClient { id: string; minReputation: number; traitGate?: TraitId }
MAX_PENDING_OFFERS=4; OFFER_LIFETIME_DAYS=2; BUZZ_PER_EXTRA_OFFER=34; MAX_OFFERS_PER_DAY=3; MAX_ACTIVE_GIGS=3; LATE_GRACE_DAYS=3
offerCountForBuzz(buzz): number
clientIsOpen(c: GatedClient, reputation: number, trait: TraitId): boolean
freeClients<C extends GatedClient, B>(clients: readonly C[], board: GigBoard<B>, isOpen: (c: C) => boolean): C[]
rollOffers<C extends GatedClient, B>(board: GigBoard<B>, pool: readonly C[], args: {
  day: number; buzz: number; rng: RngState;
  rollBrief: (client: C, day: number, rng: RngState) => [B, RngState] }): { board: GigBoard<B>; rng: RngState; arrived: readonly C[] }   // board === input when count<=0
offerAcceptIssue<B>(board, offerId): string | null                // same strings
acceptOffer<B>(board, offerId, day): GigBoard<B>                   // same ref if illegal
declineOffer<B>(board, offerId): GigBoard<B>
expireOffers<B>(board, day): GigBoard<B>                           // same ref if none expire
isGigLate<B extends DatedBrief>(gig: Gig<B>, day); gigLapseDay(gig)
lapseReputation(d: DifficultyId, t: TraitId): number
lapseOverdue<B extends DatedBrief>(board, day, d, t): { board: GigBoard<B>; lapsedIds: ReadonlySet<string>; reputation: number } | null

// story.ts  (T = trigger id union, E = effect union)
interface StoryState { seen: readonly string[]; flags: readonly string[]; queue: readonly string[] }
type StoryLine = spoken | { kind: "player"; text; byTrait: Partial<Record<TraitId,string>> }
interface StoryChoice<E> { id; label; setsFlag: string; effect: E | null }
interface StoryBeat<T extends string, E> { id; trigger: T; title; repeatable; lines: readonly StoryLine[]; choices: readonly StoryChoice<E>[] }
queueTrigger<T,E>(story: StoryState, beats: readonly StoryBeat<T,E>[], trigger: T): StoryState  // same ref if no-op
headBeatId(story): string | null
completeBeat(story, beatId, flag: string | null): StoryState
interface SpokenLine { speaker; text; isPlayer }  beatLines(beat, trait, playerName): SpokenLine[]

// score.ts
interface Criterion<Id extends string> { id: Id; label; passed; detail; weight }
STAR_THRESHOLDS = [90,75,55,35]; starsForScore(score): number
passMix(criteria): number          // 100 * passedWeight / totalWeight
gatePassed<Id>(criteria, gate: readonly Id[]): boolean

// reward.ts
type RewardOutcome = "pass" | "soft-fail" | "fail"
interface RewardLine { label; amount }
interface RewardCore { outcome; coins; reputation; buzz; lines: readonly RewardLine[] }
settleReward(a: { passed: boolean; score: number; stars: number; fee: number; late: boolean;
  difficulty: DifficultyId; trait: TraitId; bonusLines: readonly RewardLine[]; extraBuzz: number }): RewardCore

// upgrades.ts
interface UpgradeCore { id: string; name: string; price: number; minReputation: number }
upgradeIssues(owned: readonly string[], u: UpgradeCore, coins: number, reputation: number): string[]

// geometry/
type Point = readonly [number, number]; type Triangle; triangulate(poly)
interface Bounds; polygonBounds; rotatedShape(shape, r); placedPolygon(shape, {x,y,rotation})
ROTATIONS; type Rotation; isRotation; OVERLAP_EPSILON; convexPolygonsOverlap; polygonsOverlap
distanceToOutline(p, outline); traceAccuracy(samples, outline, tolerance); ASSIST_CUT_ACCURACY

// parse.ts (= shapeParser, unchanged API)   saveEnvelope.ts
type SaveMigration = (raw: Readonly<Record<string, unknown>>) => Record<string, unknown>
interface SaveCodec<S> { version: number; migrations: Readonly<Record<number, SaveMigration>>; parse: Parser<S> }
type SaveParseResult<S> = { ok: true; state: S } | { ok: false; error: string }
parseSaveWith<S>(json: string, codec: SaveCodec<S>): SaveParseResult<S>     // identical messages
migrateRaw(raw, from, to, migrations): Readonly<Record<string, unknown>> | null
```

Rules for the ADEEVA wrappers:

- When the engine returns the same object it was given, the wrapper must return the **same `state` reference**. For example: `const story = queueTrigger(...); return story === state.story ? state : { ...state, story }`.
- `rollOffers` and `lapseOverdueGigs` keep ADEEVA's current order of RNG draws: pick clients first, then roll briefs in order. This keeps seeded saves and tests deterministic.

### Studio and shared UI API

```ts
// studio/gameModule.ts
type GameId = "adeeva" | "thrift-flip" | "patisserie" | "workshop" | "interior" | "jewellery"
interface GameScreenProps { onExit: () => void; profile: StudioProfile; onLookChange: (look: AvatarLook) => void }
interface GameModule {
  id: GameId; title: string; tagline: string; ages: string;
  tileArt: ComponentType<{ size?: number }>;
  load: () => Promise<{ default: ComponentType<GameScreenProps> }>;
  reputationOf: (rawSave: unknown) => number;   // reads JSON.parse'd slot; non-negative int, 0 if unreadable; no core import
}
// studio/registry.ts: GAMES: readonly GameModule[]   (ADEEVA first; others added as built)

// studio/slotStore.ts
interface SlotCodec<S> { parse(json): SaveParseResult<S>; serialize(s: S): string }
createSlotStore<S>(gameId: GameId, codec): { savingAvailable; readAllSlots; writeSlot; deleteSlot; markLastSlot; continueSlot; rawSlots(): unknown[] }
// keys: `${id}.save.${n}`, `${id}.lastSlot`, `${id}.probe`  → identical for adeeva

// studio/useGameSession.ts
useGameSession<S, A, N>(game: { reduce(s: S, a: A): S; create(n: N): S; newGameIssues(n: N): string[] }, store, onSaveFailed)

// studio/profile.ts — key "studio.profile"
interface StudioProfile { version: 1; name: string; look: AvatarLook; perks: readonly PerkId[] }
readProfile(): StudioProfile | null; writeProfile(p): boolean
// first run: if absent, seed name+look from adeeva's lastSlot save profile when present

// studio/perks.ts — pure
PERKS: readonly { id: PerkId; threshold: number; kind: "hair-colour"|"outfit"|"accessory"|"home-theme"; label }[]
studioReputation(games, reads: (id) => unknown[]): number   // best slot per game, summed
unlockedPerks(rep, already: readonly PerkId[]): PerkId[]    // monotonic union

// studio/playtime.ts — key "studio.playtime" = { version: 1, seconds: Partial<Record<GameId, number>> }
usePlaytime(gameId)   // performance.now deltas, counts only while document.visibilityState==="visible"; flush every 15s + pagehide

// studio routing: hash routes "#/" home, "#/<gameId>", "#/parent"

// ui/art/avatar/Avatar.tsx
interface AvatarGarment { defs(idBase: string): ReactNode; body(idBase: string): ReactNode; sleeves(idBase: string): ReactNode }
AvatarFigure({ look, mood?, garment? }); Avatar({ ..., garment? })   // garment absent → look.outfit, as today
// ui/art/cloth
interface Cloth { id: string; colour: ColourId; material: MaterialId; print: PrintId }
```

Perks are cosmetic only. If perk colours or outfits are later added to `HAIR_COLOURS` and `OUTFIT_STYLES`, the lists only grow, so the ADEEVA save parser still accepts every older save.

## 4. Order of moves (`pnpm typecheck && pnpm lint && pnpm test`, plus e2e where noted, must pass after each step)

0. **Snapshot.** `git init` and commit, or zip the folder. Run `pnpm check` and record the test counts.
1. **Move ADEEVA without changing logic.**
   - Move `core` → GA/core, `content` → GA/content, `ui/screens` → GA/ui/screens, and every `ui/art` file → GA/ui/art for now.
   - Rewrite relative imports and the e2e import paths; update the eslint globs.
   - `app/` stays.
   - Full e2e. Expect zero behaviour change.
2. **Move the pure leaf modules to the engine.** These are rng, rngDraw, util, actionCheck, week, parse and geometry (`Point` too).
   - GA/core/index.ts re-exports them.
   - Move rng.test and polygonOverlap.test.
3. **Move shared data to the engine.** avatar, palette, the trait and difficulty ids and rules, profile, catalog `requireById`.
   - GA content keeps `TRAITS` and `DIFFICULTIES` with identical values.
   - Add a unit test asserting `DIFFICULTIES` values equal `DIFFICULTY_RULES`.
4. **Generic rule modules.**
   - Order: standing → dayHours → story → score → reward → gigBoard → upgrades → saveEnvelope.
   - For each one: add the engine module and its engine test, rewrite the GA file as a wrapper, run the full unit tests. The existing GA tests are the regression oracle.
   - Run e2e at the end of the step.
5. **Studio shell.**
   - `app/*` → `studio/*`, and `GameShell` → `GA/ui/AdeevaGame.tsx`.
   - `createSlotStore("adeeva")`, generic `useGameSession`, generic `useDispatchOnce`, `app.css` → `styles/shell.css`.
   - `StudioApp` still renders ADEEVA directly. Full e2e.
6. **Shared avatar.**
   - Add the `Cloth` type, `ButtonArt`, and the `garment` prop with the `dressGarment` adapter.
   - Move the avatar/ and cloth/ files to `src/ui/art`.
   - Check visually: title slot cards, hub hero, new-game avatar step, runway figures. A Playwright screenshot diff before and after is cheap.
7. **Home screen.**
   - Registry with ADEEVA's `GameModule` (`reputationOf` reads `raw.reputation`).
   - Hash routes; ADEEVA's title screen gets "Back to studio".
   - Change the e2e `goto` calls to `/#/adeeva` and add `e2e/studio.spec.ts`: home → ADEEVA → back, and zero requests via `page.on("request")` checking that no request URL leaves `localhost`.
8. **Profile, perks, playtime and parent page.** Studio unit tests for perks and the profile parser.
9. **New games, one at a time.** For each: `games/<id>/{module.ts, core, content, ui}`, `e2e/<id>.spec.ts`, then the registry entry. Each step is green on its own.

## 5. Risks

- **No version control.** See step 0.
- **Lost reference equality** in the wrappers would make illegal actions look like changes. That triggers autosaves and breaks the `useDispatchOnce` and `dispatch` return value. Add one engine test per no-op path.
- **RNG order drift** in the `rollOffers` refactor would change seeded games, and tests and e2e expectations along with them. Keep the draw order exactly: `drawDistinct` first, then briefs in order.
- **Changed messages.** Reward line order, the issue strings in `profileIssues` and `upgradeIssues`, and the save error strings are asserted by tests and e2e. Copy them verbatim.
- **Settings key.** It stays `adeeva.settings`. Renaming it would silently reset players' assist and reduced-motion choices and break `craft.spec`.
- **Avatar look must stay identical.** Moving the button and pearl art out of TrimArt has to be a verbatim copy; check with screenshot diffs.
- **Bundle split.** A `GameModule` file must not import its game's core, or the whole game lands in the main bundle. `reputationOf` reads the raw JSON on purpose.
- **Cross-game import.** Thrift-Flip → ADEEVA is the only allowed one; enforce it with eslint so it doesn't spread.
- **Engine scope creep.** `seamLine`, trends, assistant and runway stay in ADEEVA until a second game actually uses them.
- **Quality gates.** Every file must stay under 700 lines and have no code comments. The wrappers and engine files are small; `e2e/adeeva/label.spec.ts` is at 356 lines.
- **E2E goto edits.** These must land in the same step as the home screen. Before that step, `/` still opens ADEEVA.

### Critical Files for Implementation

- Y:\ADEEVA\work\0003-studio\design.md
- Y:\ADEEVA\src\core\index.ts
- Y:\ADEEVA\src\core\offers.ts (with offerResponse.ts, gigDeadline.ts, rewards.ts, storyQueue.ts, save.ts)
- Y:\ADEEVA\src\app\GameShell.tsx (with saveSlots.ts, useGameSession.ts, appSettings.ts)
- Y:\ADEEVA\src\ui\art\Avatar.tsx (with AvatarOutfit.tsx, fabricLook.ts, FabricPattern.tsx, TrimArt.tsx)
- Y:\ADEEVA\eslint.config.js and Y:\ADEEVA\e2e\fixtures\preparedGame.ts
