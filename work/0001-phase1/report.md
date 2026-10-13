# Task 0001 — Phase 1 report

## What changed

A new local repository holding ADEEVA, an original fashion-design career sim. It is web-only (React 19, TypeScript 6, Vite 8), runs fully offline, and draws all of its art in SVG code. Design: `work/0001-phase1/design.md`.

- **Start of game:** New Game builds an inclusive avatar (8 skin tones, 8 hair styles, 8 hair colours, 4 outfits) and then picks one of 4 traits (Dreamer, Perfectionist, Trendsetter, Charmer), one of 2 careers (Student Designer, Label Designer) and one of 3 difficulties (Relaxed, Standard, Challenging).
- **Craft loop (`src/ui/screens/craft`):** brief → sketch → fabric shop → cutting table → assembly on a mannequin → sewing machine → decoration → delivery and results.
  - Cutting table: drag, rotate, a grain/bias score, and a traced cut.
  - Sewing machine: a hold-and-steer mini-game whose score is computed in core.
  - Decoration: trims are moved, rotated, scaled and layered.
- **Studio hub:**
  - Calendar of 10-hour days, coins, reputation, buzz.
  - Weekly rent, an assistant, 4 upgrades, a weekly trend market and part-time shifts.
  - Inbox of client offers, including trait-gated clients.
  - Story beats, an end-of-day summary, and 3 save slots with autosave.
- **Label Designer:**
  - Season theme and a collection board of 3 looks with a cohesion score.
  - Runway planner: walk order, music mood, lighting.
  - Animated runway show with a reduced-motion version.
  - Critics, Buyers and Audience reviews, a press clipping, and orders paid in coins.
  - The next season has a new theme and a bigger venue.
- **Career link:** a Student Designer who reaches reputation 40 with 8 gigs delivered can launch a label in the same save.
- **Rules engine:** pure and deterministic, with a seeded RNG. Every state change goes through `reduce`, and an illegal action returns the same state. Saves are versioned (v3), with migrations from v1 and v2 and validation at load.

## Evidence (final run, this session)

```
pnpm typecheck                → tsc -p tsconfig.json --noEmit (no errors)
pnpm lint                     → eslint --max-warnings 0 clean; "All matched files use Prettier code style!"
pnpm test (run 1)             → Test Files 22 passed (22) / Tests 151 passed (151)
pnpm test (run 2)             → Test Files 22 passed (22) / Tests 151 passed (151)
pnpm build                    → ✓ built, no chunk-size or other warnings
pnpm audit                    → No known vulnerabilities found
pnpm licenses list --prod     → react MIT, react-dom MIT, scheduler MIT
playwright test (run 1)       → 17 passed (1.6m)
playwright test (run 2)       → 17 passed (1.6m)
comment grep (src, e2e)       → 0 matches
files > 700 lines             → none (largest newGame.css 635)
```

## Gate results

| Gate                                                      | Result                                                                                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Syntax: format and lint, warnings as errors               | Pass                                                                                                                                                       |
| Behaviour: unit tests (151) and e2e (17)                  | Pass                                                                                                                                                       |
| Flake: unit and e2e each run twice with identical results | Pass                                                                                                                                                       |
| Licenses and advisories                                   | Pass. Everything shipped is MIT. Dev-only tools include MPL-2.0 (lightningcss), CC-BY-4.0 (caniuse-lite) and BlueOak-1.0.0 (minimatch), none of which ship |
| Size: 700/1400 lines                                      | Pass                                                                                                                                                       |
| Comments                                                  | Pass                                                                                                                                                       |
| Knowledge bundle                                          | Not run: Shan deferred the formal process scaffolding (stages/, knowledge/, OKF) for this run                                                              |

## Review findings and triage

Five adversarial reviews and two balance playtests ran. Every finding below was reproduced by a probe before it was fixed.

- **Core review (11 confirmed, all fixed):**
  - Assistant wage could be dodged by firing before the week ended.
  - Bias bonus applied to bodice and neckline pieces, not just skirts.
  - A Standard late penalty existed that the design never specified.
  - Inherited object keys were accepted as seam or piece ids.
  - Delivered trims were subtracted twice from the available count.
  - The bounds check and the fabric-metres check used different tolerances.
  - Overlap checks reported false overlaps on concave pieces (now exact, using ear-clipping triangulation).
  - Unknown catalog ids made the reducer throw.
  - Save-parser holes.
  - No-op actions returned a new state object.
  - The showcase "launch" choice was consumed even when launching failed.
- **UI review (8 confirmed, all fixed):**
  - Soft-lock: there was no way to set aside a dress that could not be finished.
  - A failed save went unreported, and Save & exit then lost the game.
  - Overlays were not truly modal.
  - Assist sew inflated the score while the copy said it did not.
  - Seam scoring lived in the UI and skewed on resume.
  - Blocked storage showed three fake "damaged" slots.
  - Continue offered the wrong slot.
  - Some controls could not be used from the keyboard.
- **Playtest:**
  - The game was far too generous: every gig passed and a student could launch on day 5.
  - It was rebalanced: fabric prices ×3, reputation per gig, launch threshold, quality weights, minimum qualities, +6 minimum quality on Challenging, runway scoring, a show-day gate, rent, buzz decay and trait perks.
  - Double-dispatch on advance, Deliver and hiring the assistant was fixed.
- **Final review (5 confirmed, all fixed):**
  - Relaxed could soft-lock with no way to earn (shifts are now allowed on every difficulty).
  - The Challenging label board showed the wrong minimum quality.
  - A failed lazy load blanked the app (now caught by an error boundary with Reload).
  - Seam samples were not bounded against progress.
  - Toggling Assist mid-hold left the display stale.
- **Rejected:**
  - "Spec file at repo root": kept and git-ignored, as Shan decided.
  - "`abandonRun` leaves the shop open": a shop visit is paid once per day by design, so this is not an exploit.
  - "A fast second click on Buy is ignored": this is the intended double-click guard, and the quantity stepper covers buying more.
- **Accepted as designed:**
  - Cut accuracy is computed in the UI from the core `traceAccuracy` (offline, single player).
  - A completed seam may be redone.
  - Fabric spend is valued at the price at cut time.

## Unverified

- The balance targets come from a scripted-player model. The playtest projected Standard pass rates of roughly 75–95% at good accuracy, with Challenging lower. Real human trace and sewing accuracy has not been measured, so the minimum qualities may need tuning after Shan's daughter plays.
- The tablet craft e2e stalled once during a concurrent run and has not reproduced in 10 or more runs since.
- Visual quality was checked from screenshots at 1280×800 and 820×1180 only, not on a physical tablet.
- The OKF v0.2 knowledge-bundle format was not used.

## Incomplete

- There is no audio; music moods are visual only.
- Runway figures face front only; the walk back is a fade.
- Story beats queued during craft or label screens play when the player returns to the hub.
- Browser Back leaves the app; there is no history integration.
- No CI/CD and no deployment, per instruction; everything is local.
