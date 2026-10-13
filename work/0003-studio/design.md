# Maker Studio — Design

One local web app holding six maker-career games that share an engine, an avatar and a safety promise. ADEEVA is the first game; five new ones join it: **Thrift-Flip Studio**, **Patisserie Atelier**, **Workshop & Wood**, **Interior Studio**, and **Jewellery Bench**.

Players are aged 8 to 15+. The safety promise holds everywhere: fully offline, no ads, no chat, no accounts, no data leaving the device, no in-game currency purchases, no randomised rewards for money, and no appearance scoring of people.

## 1. Decisions (from Shan)

| Topic            | Decision                                                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structure        | One studio app with a home screen of game tiles and a shared engine                                                                                                           |
| Depth this round | All five new games as polished playable slices: one career, the full loop, 6–8 clients, avatar, traits and difficulty, original SVG art. About a third of ADEEVA's depth each |
| Ages             | 8–12, 13–15 and 15+: short plain sentences, a difficulty chosen at start (Relaxed suits younger players), mouse and touch                                                     |
| Shared           | One avatar used in every game; a studio reputation that unlocks cosmetic perks across games; a parent page                                                                    |

## 2. Architecture

```
src/
  main.tsx
  studio/          StudioApp (hash routes #/, #/<gameId>, #/parent), home hall, registry, profile, perks, playtime, parent page, slot store, generic useGameSession, settings and toasts
  engine/          Pure, generic, deterministic TS shared by every game (no React, no DOM, no Date, no Math.random); small generic modules such as clamp and average sit at its root, geometry/ holds polygon maths
  ui/kit/          Shared UI primitives (existing)
  ui/art/          Shared art: avatar/ (Avatar, face, hair, outfits, accessories), cloth/ (Cloth, fabric look and pattern, garment pieces, ButtonArt), tiles/ (home tile art), colourMix, useSvgId
  styles/          Shared tokens and global CSS
  games/
    adeeva/        core/, content/, ui/ (fashion-specific screens and art), plus its tests
    thrift-flip/   same shape
    patisserie/
    workshop/
    interior/
    jewellery/
e2e/               Playwright, one spec file per game plus a studio spec
```

Rules:

- `engine` holds only what at least two games use. It is extracted from ADEEVA's existing core, so no parallel implementation exists. Candidates: the seeded random number generator and its draws, calendar/week/day hours, coins/reputation/buzz standing, client offers mechanics, difficulty rules, the story queue, criterion/evaluation shapes, the reward outcome per difficulty, polygon geometry (overlap, triangulate, trace accuracy), save envelope and migrations framework, and the `ActionCheck` shape.
- Each game's core is a pure `reduce(state, action)` that builds on engine modules. Illegal actions return the same reference.
- Each game exports one `GameModule` from `src/games/<id>/module.ts`: `{ status: "live", id, title, tagline, ages, tileArt, load: () => import(...), reputationOf(rawSave) }`. Its screen receives `{ player, lookOptions, onPlayerChange, onExit }`. The studio lazy-loads each game. `src/studio/registry.ts` lists all six games; a game not built yet is a `{ status: "workshop", ... }` entry shown as "In the workshop", so adding a game means swapping that one entry for its module.
- Saves: each game owns `<id>.save.1..3`, `<id>.lastSlot` and `<id>.probe` in localStorage through `createSlotStore(id, codec)`. ADEEVA's keys `adeeva.save.N`, `adeeva.lastSlot`, `adeeva.probe` and `adeeva.settings` keep working unchanged.
- Studio profile: `studio.profile` in localStorage holds `{ version: 1, name, look: AvatarLook, accessory, theme, perks }`. On first run it is seeded from the name and avatar of the last-played save. A game's New Game flow pre-fills name and avatar from the profile and lets the player tweak them; starting the game writes them back to the profile.
- Studio reputation: each game module exposes `reputationOf(rawSave) => number`, the reputation earned in that save (ADEEVA subtracts its career's starting reputation). The studio sums the best slot per game. Perks unlock at 4, 8, 13, 19, 26, 34, 43 and 53 (rose-gold hair, star hair clip, twilight hall, sunny dungarees, round glasses, ocean-teal hair, garden hall, flower crown), so a few finished orders unlock the first one. Unlocked perks are never taken away. They are cosmetic only: no gameplay advantages, no purchases and no randomness. Locked hair colours and outfits are hidden from every game's avatar step until unlocked.
- Parent page (`#/parent`, linked from the home footer): plain-language "What this studio does not do" list, how saves work with a clear-all button per game, and local playtime per game (counted only while a game screen is visible, stored in localStorage `studio.playtime` as `{ version: 1, seconds }`).
- Launcher: `Play Maker Studio.cmd` at the repo root starts the dev server and opens the browser on the studio home.

## 3. Shared game shape

Every game follows: **brief → design → materials → hands-on making (2–3 mini-games) → finish → show or sell → evaluation → coins, reputation and story**, on a calendar of days with hours, weekly rent, upgrades and client offers. The same four traits (Dreamer, Perfectionist, Trendsetter, Charmer) and three difficulties apply, with game-flavoured perk text. Each game is one career with 6–8 clients, including trait-gated clients.

## 4. The five games (detailed design per game lives in `work/0003-studio/games/<id>.md`)

- **Thrift-Flip Studio** — buy secondhand pieces at a market (condition, price), unpick and clean, then redesign by reusing ADEEVA's fabric, garment and sewing systems, then price and resell at a stall. Adds a sustainability score.
- **Patisserie Atelier** — cake and pastry orders: design tiers, flavours and decoration, weigh ingredients, mix, bake by temperature and time, pipe decoration (trace), deliver, run a bakery counter.
- **Workshop & Wood** — furniture commissions: design from parts, lay out a cutting list on planks with wood grain, saw (trace), join (alignment), sand and finish, deliver.
- **Interior Studio** — room makeovers: client brief, floor-plan furniture placement on a grid, paint, flooring and lighting under a budget, a reveal with client reaction, then show homes.
- **Jewellery Bench** — design rings, pendants and earrings, choose metals and stones, saw-pierce (trace), solder (timing), set stones (precision), polish, build a market-stall collection.

## 5. Acceptance

1. The home screen shows six tiles. Live games open from their tile and Back to studio returns home; games still being built show as "In the workshop" and cannot be opened yet.
2. ADEEVA plays exactly as before: its unit tests and e2e specs still pass, and existing saves load.
3. Each new game: new game → one client order played through every step → evaluation → coins and reputation → save, reload and continue, all tested end to end.
4. Making the avatar once shows it in every game. Studio reputation and perks update from every game.
5. The parent page shows playtime and the safety promise. Zero network requests in any game.
6. Gates: typecheck, lint (zero warnings), unit tests twice, e2e twice, build with no warnings, no comments in code, no file over 700 lines.
