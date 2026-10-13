# Task 0003 — Maker Studio shell report

## What changed

- **Shared engine:** generic rules were extracted from ADEEVA into `src/engine`:
  - seeded RNG, calendar, day hours, standing
  - story queue, scoring, rewards per difficulty
  - gig board, upgrades
  - geometry, trace accuracy
  - save envelope
  - avatar data, palette, traits, difficulty and profile rules
- **ADEEVA moved** to `src/games/adeeva/{module.ts, core, content, ui}`. Its behaviour is unchanged, and its save keys and settings key are unchanged.
- **Studio shell** (`src/studio`):
  - hash routes `#/`, `#/<game>` and `#/parent`
  - a game registry; each game is lazy-loaded, and adding a game is a one-entry change
  - a generic slot store and game session
  - the studio profile, with first-run seeding from ADEEVA
  - cosmetic perks unlocked by studio reputation, which counts earned reputation only
  - playtime counted only while a game is visible
  - a parent page
- **Home screen:** a studio hall with six tiles. ADEEVA is live, and the five new games show as "In the workshop".
- **Shared art:** the avatar and its accessories, plus the cloth art, moved to `src/ui/art`.
- **ESLint boundaries:**
  - the engine and game cores stay pure
  - the only cross-game import allowed is thrift-flip → adeeva
  - the studio reaches games only through their `module` file
- **Saving on exit:** leaving a game by any route saves first.
- **Launcher:** `Play Maker Studio.cmd`.

## Evidence (independent run, this session)

```
pnpm typecheck            → no errors
pnpm lint                 → clean, Prettier clean
pnpm test (×2)            → Test Files 41 passed (41) / Tests 221 passed (221)
pnpm build                → ✓ built, no warnings
pnpm audit                → No known vulnerabilities found
playwright test (×2)      → 27 passed (1.6m)
comment grep              → 0; no file > 700 lines; no banned folder names
```

## Review findings and triage

Two adversarial reviewers checked the work: one for regressions and correctness, one for studio UX and compliance.

**Fixed:**

- Leaving a game by a hash change lost recent play.
- Locked perk looks were no longer refused when starting a game.
- The ESLint purity and boundary rules had bypasses.
- Unknown hashes and hashes for games not yet live were kept in the address bar.
- Saves that ADEEVA itself would refuse to open still counted toward studio reputation.
- The error boundary had no way back to the studio.
- Focus was lost on every route change.
- Several perks unlocking at once flooded the screen with toasts.
- The profile was written even when starting a game was refused.
- Three localStorage JSON readers did the same job.

**Rejected:** showing "8 of 8 perks" next to a reputation of 0 is by design, because perks are never taken away.

## Unverified

- `Play Maker Studio.cmd` has not been run by double-click. A dev server was already running on port 5173, and the launcher opens the same URL.

## Incomplete

- The five new games are next: tasks 0004 to 0008.
