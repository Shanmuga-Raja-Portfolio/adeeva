# Maker Studio — Final pass before deploy

Roadmap task 12. Branch `task/0058-final-pass`, 2026-10-18, based on the tip of pull request #2 (`task/0056-ai-security-tools`).

**Result.** On the production build at desktop size, every game plays from the studio home through its first order, a save, a return to the studio and a Continue, and every second career or showcase plays from the prepared saves, with no console errors, no blocked content and no request leaving the site. Three layout bugs on narrow screens are fixed. One bigger layout problem on short and narrow screens is left open for Shan to decide (see **Left open**). The docs match the code again, dead code and CSS are gone, and every audit is clean.

## 1. Playthrough

The production build (`vite build`, then `vite preview` on `127.0.0.1:5230`, which applies `public/_headers`) was driven by Playwright scripts kept in the session scratchpad, not the repo. Every test also watched the console, `securitypolicyviolation` events and every request, and took a screenshot each time the screen's heading, dialog or story changed. About 1,000 screenshots were reviewed by sampling every kind of screen; their list is in the scratchpad (`final/screenshots.txt`), not here.

Sizes: desktop 1280×800 (Chromium), iPhone 15 393×659 (WebKit), iPad (gen 11) 656×944 (WebKit), and as cross-checks iPhone size in Chromium and the Android handheld (Pixel 7 landscape, 863×360).

What was played, per game:

- **Studio round trip** (all seven, at all three main sizes): studio home → game tile → New Game (every wizard step) → story → hub → Save & exit → Back to studio → tile again → Continue → hub. 25 of 25 passed (2 signed-out runs skipped on WebKit, see below).
- **First order through every step to the results, save and continue:** ADEEVA (`craft`, `newGame`), Patisserie (`order`), Thrift-Flip (`order`), Interior (`makeover`), Workshop (`order`), Jewellery (`order`), Six Kitchens (`lesson`), with the e2e fixtures driving each hand step.
- **Second career and showcase from the prepared saves in `e2e/fixtures` and the `v1Saves`:** ADEEVA Label and runway (`label`), Patisserie Comet Room and Fair (`salonCareer`), Thrift-Flip Resale Boutique, Upcycle Showcase, Swap & Mend and Till Day (`boutique`), Interior Larkspur keys, show home and Open House (`larkspurUnlock`, `showHome`), Workshop showroom to a Fair rosette (`showroomJourney`), Jewellery loft unlock and Lantern Night (`loftUnlock`, `lanternNight`), Six Kitchens Crossroads, restaurant, food truck and TV (`crossroads`, `restaurant`, `truck`, `tv`).
- **Family pages:** the studio home, the Parent page, the About page with every install section open, and the Signed out mark on all three. The mark was checked in Chromium only: Playwright's WebKit routes requests before the service worker sees them, so an expired session can't be faked there, which is also why the repo runs that spec on Chromium only.

Results:

- **Desktop 1280×800:** 48 of 48 game and studio tests passed. No console errors, no page errors, no CSP violations and no request to any other origin. The only console lines were the 401s that the signed-out tests fake on purpose.
- **iPhone and iPad (WebKit):** every studio round trip, the family pages, and 28 of the 48 longer tests passed. The 20 that failed are hand-step tests whose helpers aim at desktop layouts: they don't scroll the bowl, saw line or tray into view first, and Playwright's mouse on WebKit's phone emulation is not a finger. 12 of them also fail in Chromium at phone size. They aren't counted as app bugs, but looking at them showed the layout problem under **Left open**.
- **WebKit noise, not app bugs:** Playwright's own screenshot step injects a stylesheet that the strict CSP refuses in WebKit (checked: no violation before the first screenshot, and one more per screenshot). WebKit also warns that a preloaded module went unused when a test navigates away within seconds.

## 2. Bugs found and fixed

| #   | Where                                     | Bug                                                                                                                                                                                                                                                                                         | Fix                                                                                                                                                   |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | ADEEVA, Patisserie, Thrift-Flip, Workshop | On a phone, New Game or Continue opened the hub scrolled 53–130 px down, keeping the long wizard's scroll, so the top of the hub (the day panel, the scene sign) sat under the sticky header. Interior, Jewellery and Six Kitchens already scrolled to the top whenever they opened a view. | Opening the hub now scrolls to the top in all seven (`src/games/*/ui/*Game.tsx`). Measured afterwards at iPhone and iPad sizes: every hub opens at 0. |
| B2  | Thrift-Flip hub                           | At 760 px and narrower the wordmark stretched across the one-column header, so its hanging price tag hung 16 px past the screen edge and the page scrolled sideways (iPhone and iPad).                                                                                                      | The wordmark keeps its own width (`.tf-hub-top__row > .tf-wordmark`).                                                                                 |
| B3  | Six Kitchens New Game                     | At 760 px and narrower the step card was full width plus its margins, so every step scrolled sideways by 8 px.                                                                                                                                                                              | The card's width follows its margins on narrow screens (`newGame.css`).                                                                               |

The regression test is a new device smoke test in `e2e/release/smoke.spec.ts`: a Thrift-Flip New Game opens the hub at the top without sideways scroll, and Six Kitchens' first New Game step fits the screen. It runs on Chromium, the Android handheld, the Chromebook, the iPhone and the iPad.

## 3. Drift fixed

- `work/0003-studio/roadmap.md`: tasks 1–9 sit together under Done; task 10 stays in progress with its live checks pending (pull request #2 noted); task 11 is marked merged as pull request #1, with the drag-timing race fixed before the merge; the 176 + 18 Linux rehearsal figure is labelled as the rehearsal (the other 56 Chromium tests are quality shots that skip without `QUALITY_SHOTS_DIR`); "Waiting for Shan" drops pushing the CI branch and adds the repo's merge settings and `/code-review ultra`; task 12 is marked done; task 14 gains the small-screen layout.
- `work/0003-studio/design.md`: the folder tree gains `ui/newGame/`, `ui/show/` and `tooling/`, says what `ui/kit/` and `ui/art/` hold, and describes the real `e2e/` layout; the offline section mentions the Signed out mark. The saves contract matched the code.
- `work/0003-studio/games/jewellery.md`: `src/engine/textile/` and `engine/poseFit` never existed; they now read `src/engine/geometry/`, and the seat gate `isSeated` and score `seatFit` in `core/stoneSetting`.
- `work/0003-studio/games/interior.md` and `workshop.md`: the as-built spec lists gain `homeReturn.spec.ts` and `showroomControls.spec.ts`.
- `work/0055-security/threat-model.md`: the pipeline entry now describes GitHub Actions, and says the Cloudflare token reaches two deploy steps (the release and the per-PR preview), not one.
- `work/0057-ci-cd/README.md`: merged as pull request #1; Dependabot grouping covers npm and Actions only; CI has run, previews skip until the secrets exist and no release has run; the example branch is now `task/0059-…`.
- Checked and correct: every action SHA and tool version, the save versions in each game doc (ADEEVA 3, the others 2), every backticked path, every `pnpm` script, `work/0054-perf/report.md` and `work/0056-ai-security/*.md`. Dated figures in earlier reports (for example "1,522 tests" in the security report) are records of their day and were left as they are.

## 4. Staleness sweep and removals

- **knip 6, full report:** no unused dependencies. One unused file, `src/games/thrift-flip/ui/art/Bunting.tsx`, is removed with its `.tf-bunting` rule. knip listed 778 unused exports and 179 unused exported types. Each name was looked up across `src`, `e2e` and `tooling`: all but one are used inside their own file or re-exported by a game's `core/index.ts` barrel. The one truly dead export, `shotLine` in `e2e/fixtures/preparedJewellery.ts`, is removed, and so is knip's one duplicate export, Patisserie's `ORDER_STAGES` alias of `RUN_STAGES`.
- **CSS:** every class in the 200 stylesheets was looked up in the code, including names built from template strings (`${block}__name`, `--${tone}`, `--l${level}`). Ten rules matched nothing and are removed: `.ck-pan__label`, `.jb-velvet-card`, `.jb-coin-line`, `.pa-steam--late`, `.pa-stack__filling`, `.pa-safety--quiet`, `.tf-bunting`, `.tf-stitch-border`, `.ww-hub__bench` and `.ad-display`.
- **Rules:** no TODOs and no code comments (the only `/*` hits are glob strings). No file in `src`, `e2e` or `tooling` is over 700 lines; the largest is `jewellery/ui/screens/hub/hub.css` at 693. Only the ZAP reports in `work/0055-security/zap/` (tool output) are longer. No `utils`, `helpers`, `common` or `shared` folders.
- **Ignore files:** `.gitignore` lost a byte-order mark and a stray blank line. `.prettierignore` now lists only what `.gitignore` doesn't already cover, since Prettier 3 reads `.gitignore` itself: `pnpm-lock.yaml`, the ZAP reports and the deploy lockfile.
- **Scripts and stray files:** `Play Maker Studio.cmd` and every `package.json` script are current, and the tracked tree has no stray files.

## 5. Audit

| Check                     | Result                                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm audit`              | No known vulnerabilities                                                                                                                                                                   |
| `pnpm audit --prod`       | No known vulnerabilities                                                                                                                                                                   |
| `pnpm outdated`           | Only TypeScript 6.0.3 → 7.0.2 (a major; it stays on 6.x)                                                                                                                                   |
| `gitleaks dir . --redact` | No leaks                                                                                                                                                                                   |
| `gitleaks git . --redact` | No leaks in 63 commits                                                                                                                                                                     |
| `pnpm licenses list`      | MIT 136, Apache-2.0 18, ISC 9, BSD-2-Clause 6, BSD-3-Clause 2, BlueOak-1.0.0 1, MPL-2.0 2 (`lightningcss`, build only), CC-BY-4.0 1 (`caniuse-lite`, browser data read at build time only) |

What ships is our own code plus React and React DOM (MIT).

## 6. Checks

- `pnpm typecheck` and `pnpm lint`: clean.
- `pnpm test`: 291 files, 1,523 tests passed.
- Affected browser tests (`MAKER_PORT=5230`, 2 workers): the release smoke on all five projects, plus ADEEVA, Patisserie, Thrift-Flip, Workshop, the studio, and the touched Six Kitchens and Jewellery specs. 136 passed and 32 quality shots skipped.
- Full `pnpm e2e` (`MAKER_PORT=5230`): 255 tests, 199 passed and 56 quality shots skipped, in 7.2 minutes. An earlier full run stalled with 253 of 255 done, all of them passing: the two WebKit iPad `noNetwork` tests never reported and their worker stayed stuck past the 120 s test timeout. Run alone, both pass on the iPad and the iPhone, and the second full run above passed clean. If WebKit stalls again under 8 workers, look at its worker teardown.

## 7. Left open

- **Short and narrow screens: decide before inviting phone or handheld players.** Every hub and craft step keeps its header pinned to the top. On the Android handheld (863×360 in landscape) the hub headers take 114–172 px, a third to a half of the height. On an iPhone in portrait they take 204–259 px of 659. Craft steps that need a drag or a traced line then don't fit beside the header. At phone size, Workshop's saw line starts under the header, and on the handheld the Plan your boards board and its parts tray can't be on screen together. Tablets, Chromebooks and PCs are fine. A compact layout for short screens (headers that scroll away below about 500 px tall, and tighter craft stages) is now part of task 14. If the kids will play on the handheld from day one, it should come first.
- **Deploy day (unchanged):** the live-site checks in task 10, the Cloudflare setup and Access (`SameSite=Lax`), and Access sign-in inside an installed iOS app.
- **`pnpm check` runs `pnpm test` twice.** It has done so since phase 1, and nothing documents why. It is left as it is; remove the second run if it wasn't meant as a repeat.
- **Rebase before the pull request.** Pull request #2 was rebase-merged, so `origin/main` has its own commit id for it. Rebase this branch onto `origin/main` before opening the pull request.
