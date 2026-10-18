# Maker Studio — Design

One local web app holding seven maker-career games that share an engine, an avatar and a safety promise: **ADEEVA**, **Thrift-Flip Studio**, **Patisserie Atelier**, **Workshop & Wood**, **Interior Studio**, **Jewellery Bench** and **Six Kitchens**. Status, open work and what comes next live in `work/0003-studio/roadmap.md`.

Players are aged 8 to 15+. The safety promise holds everywhere: fully offline, no ads, no chat, no accounts, no data leaving the device, no in-game currency purchases, no randomised rewards for money, and no appearance scoring of people.

## 1. Decisions (from Shan)

| Topic     | Decision                                                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Structure | One studio app with a home screen of game tiles and a shared engine                                                                                                                                                |
| Depth     | Every game grows to ADEEVA's depth: a second career or show mode in the same save, about twice the slice content, a showcase event, retuned economy. Six Kitchens is built at full depth (ladder plus three paths) |
| Ages      | 8–12, 13–15 and 15+: short plain sentences, a difficulty chosen at start (Relaxed suits younger players), mouse and touch                                                                                          |
| Shared    | One avatar used in every game; a studio reputation that unlocks cosmetic perks across games; a parent page                                                                                                         |

## 2. Architecture

```
src/
  main.tsx
  studio/          StudioApp (hash routes #/, #/<gameId>, #/parent, #/about), home hall, registry, profile, perks, playtime, parent page, About and privacy page with SVG install guides, update notice, slot store, generic useGameSession, settings and toasts
  offline/         serviceWorker.js (template; the build fills in the version and file list), worker registration and update tracking, the signed-out check, storage persistence
  engine/          Pure, generic, deterministic TS shared by every game (no React, no DOM, no Date, no Math.random); small generic modules such as clamp and average sit at its root, geometry/ holds polygon maths
  ui/kit/          Shared UI primitives (Button, Card, Dialog, PanelCard, toasts and the rest), hooks such as useShowClock and useTickLoop, and lazyScreen and useIdlePreload for idle-preloaded screens
  ui/art/          Shared art: avatar/ (Avatar, face, hair, outfits, accessories), cloth/ (Cloth, fabric look and pattern, garment pieces, ButtonArt), tiles/ (home tile art), PetalFall, PlacedLayer, colourMix, useSvgId
  ui/newGame/      The shared New Game steps (career, avatar, trait, difficulty)
  ui/show/         Shared showcase playback (timeline, reveal steps, panel flips, music chip)
  styles/          Shared tokens and global CSS
  games/
    adeeva/        core/, content/, ui/ (fashion-specific screens and art), plus its tests
    thrift-flip/   same shape
    patisserie/
    workshop/
    interior/
    jewellery/
    chef/          Six Kitchens
e2e/               Playwright: a folder of specs per game, a studio spec, fixtures/, and release/ (install, offline, integrity, update, signed out, About)
tooling/           Build-time helpers: the service-worker build, the precache list and the _headers reader for vite preview
```

Rules:

- `engine` holds only what at least two games use. It is extracted from ADEEVA's existing core, so no parallel implementation exists. Candidates: the seeded random number generator and its draws, calendar/week/day hours, coins/reputation/buzz standing, client offers mechanics, difficulty rules, the story queue, criterion/evaluation shapes, the reward outcome per difficulty, polygon geometry (overlap, triangulate, trace accuracy), save envelope and migrations framework, and the `ActionCheck` shape.
- Each game's core is a pure `reduce(state, action)` that builds on engine modules. Illegal actions return the same reference.
- Each game exports one `GameModule` from `src/games/<id>/module.ts`: `{ id, title, tagline, ages, tileArt, load: () => import(...), reputationOf(rawSave), parentNote? }`. Its screen receives `{ player, lookOptions, onPlayerChange, onExit }`. The studio lazy-loads each game. `src/studio/registry.ts` lists every game module; adding a game means adding one entry. A module may add an optional `parentNote` shown on the parent page.
- Saves: each game owns `<id>.save.1..3`, `<id>.lastSlot` and `<id>.probe` in localStorage through `createSlotStore(id, codec)`. ADEEVA's keys `adeeva.save.N`, `adeeva.lastSlot`, `adeeva.probe` and `adeeva.settings` keep working unchanged.
- Studio profile: `studio.profile` in localStorage holds `{ version: 1, name, look: AvatarLook, accessory, theme, perks }`. On first run it is seeded from the name and avatar of the last-played save. A game's New Game flow pre-fills name and avatar from the profile and lets the player tweak them; starting the game writes them back to the profile.
- Studio reputation: each game module exposes `reputationOf(rawSave) => number`, the reputation earned in that save (ADEEVA subtracts its career's starting reputation). The studio sums the best slot per game, capping each game's contribution at 24 (`PER_GAME_REPUTATION_CAP`) so every perk needs play across several games. Perks unlock at 4, 8, 13, 19, 26, 34, 43 and 53 (rose-gold hair, star hair clip, twilight hall, sunny dungarees, round glasses, ocean-teal hair, garden hall, flower crown), so a few finished orders unlock the first one. Unlocked perks are never taken away. They are cosmetic only: no gameplay advantages, no purchases and no randomness. Locked hair colours and outfits are hidden from every game's avatar step until unlocked.
- Parent page (`#/parent`, linked from the home footer): plain-language "What this studio does not do" list, how saves work with a clear-all button per game, and local playtime per game (counted only while a game screen is visible, stored in localStorage `studio.playtime` as `{ version: 1, seconds }`).
- About and privacy (`#/about`, linked from the home footer and the parent page): what is stored and where, what the app never does, the host's request logs, picture steps to install on Android, Chromebook, Windows, iPhone/iPad and Mac, per-device saves, and a "Delete everything on this device" button that only works once a grown-up types the word delete.
- Installable offline app (production builds only): `public/manifest.webmanifest` and icons (`public/icons/maker-studio.svg` is the source drawing), a hand-written service worker built by `tooling/offlineBuild.ts` that precaches every built file under a versioned cache, checks each file against its SHA-384 hash so a damaged or mismatched file fails the whole install, and stores nothing beyond that list; an update notice ("A new version is ready — restart when you like") shown only outside games; and a "Signed out" mark with a Sign in button on the home, parent and About pages when the Cloudflare Access session has expired. `public/_headers` holds the security headers for Cloudflare Pages; `vite preview` applies the same file path by path, as the host does, so every browser test runs under the real CSP and caching rules (minus `upgrade-insecure-requests`, which the plain-HTTP preview can't honour). The manifest link sends credentials, so it still loads behind Cloudflare Access.
- Launcher: `Play Maker Studio.cmd` at the repo root starts the dev server and opens the browser on the studio home.

## 3. Shared game shape

Every game follows: **brief → design → materials → hands-on making (2–3 mini-games) → finish → show or sell → evaluation → coins, reputation and story**, on a calendar of days with hours, weekly rent, upgrades and client offers. The same four traits (Dreamer, Perfectionist, Trendsetter, Charmer) and three difficulties apply, with game-flavoured perk text. Each game starts with one career and its trait-gated clients, then unlocks a second career or show mode in the same save.

## 4. The games (detailed design per game lives in `work/0003-studio/games/<id>.md`; ADEEVA's in `work/0001-phase1/design.md`)

- **Thrift-Flip Studio** — buy secondhand pieces at a market (condition, price), unpick and clean, then redesign by reusing ADEEVA's fabric, garment and sewing systems, then price and resell at a stall. Adds a sustainability score.
- **Patisserie Atelier** — cake and pastry orders: design tiers, flavours and decoration, weigh ingredients, mix, bake by temperature and time, pipe decoration (trace), deliver, run a bakery counter.
- **Workshop & Wood** — furniture commissions: design from parts, lay out a cutting list on planks with wood grain, saw (trace), join (alignment), sand and finish, deliver.
- **Interior Studio** — room makeovers: client brief, floor-plan furniture placement on a grid, paint, flooring and lighting under a budget, a reveal with client reaction, then show homes.
- **Jewellery Bench** — design rings, pendants and earrings, choose metals and stones, saw-pierce (trace), solder (timing), set stones (precision), polish, build a market-stall collection.
- **Six Kitchens** — cookery school → line cook → sous chef → head chef across six cuisines with mentors (chop, sizzle, simmer, taste, plate, service rush), then the Crossroads: own restaurant, food truck "Clementine", or TV show "Spoon & Story" with cookbook.

## 5. Acceptance

1. The home screen shows a tile per game. Each opens its game, and Back to studio returns home. An unknown address leads home.
2. ADEEVA plays exactly as before: its unit tests and e2e specs still pass, and existing saves load.
3. Each new game: new game → one client order played through every step → evaluation → coins and reputation → save, reload and continue, all tested end to end.
4. Making the avatar once shows it in every game. Studio reputation and perks update from every game.
5. The parent page shows playtime and the safety promise. Zero network requests in any game.
6. Gates: typecheck, lint (zero warnings), unit tests twice, e2e three consecutive runs, build with no warnings, no comments in code, no file over 700 lines.
