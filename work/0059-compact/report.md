# Maker Studio — Compact layout for short and narrow screens

Roadmap task 12a (task 59). Branch `task/0059-compact-small-screens`, 2026-10-18, based on `task/0058-final-pass` (`b15f69d`). Design: `work/0003-studio/design.md` §6.

**Result.** On the Android handheld in landscape (863×360) and an upright iPhone 15 (393×659), the sticky headers that took 89–299 px of the height are gone: every header is now one slim row that scrolls away with the page. Craft steps put the surface beside its tray or controls (landscape) or just above them (portrait). Of the craft steps with a hands-on surface, 58 of 61 now fit on one handheld screen (23 before) and 53 of 60 on the iPhone (30 before). Nothing scrolls sideways any more; 12 iPhone screens did before. The desktop (1280×800), Chromebook (1366×768) and iPad look the same as before; see **No regressions**.

## 1. How it was measured

A Playwright script in the session scratchpad (not the repo) opened every game's hubs and every craft, mini-game, showcase and results screen from prepared saves. It ran on two production builds served with `vite preview`: the branch point (`636c663`, "before") and this branch ("after"). Sizes: handheld 863×360 (Pixel 7 landscape, Chromium), iPhone 15 393×659 (WebKit), and as no-regression checks desktop 1280×800, Chromebook 1366×768 and iPad (gen 11). That's 117 screens per size, 585 readings per build.

For each screen it recorded:

- **band**: the height of whatever stays pinned at the top (a sticky or fixed header, rail or panel);
- **work**: the height of the step's surface plus its tray or controls (not the Next button), and whether that whole area fits on one screen below the band, once scrolled to it;
- **sideways**: how far the page scrolls sideways.

Screenshots: `C:\Users\shanc\AppData\Local\Temp\claude\y--ADEEVA\fd74eac9-5065-4828-8ba3-4fdeb3d9b773\scratchpad\compact\shots\before\` and `C:\Users\shanc\AppData\Local\Temp\claude\y--ADEEVA\fd74eac9-5065-4828-8ba3-4fdeb3d9b773\scratchpad\compact\shots\after\`, one folder per size and game. They live in the session scratchpad, not the repo.

## 2. What changed

- **Shared** (`src/styles/compact.css`). It works through two kit classes:
  - `ad-pinned-head` (with `__title`, `__stats` and `__back`) now sits on all seven hub top bars and all seven craft headers. In compact mode the header stops sticking and becomes one wrapping row: the eyebrow is hidden, the title shrinks to 1.25rem with an ellipsis, and the stat chips keep their labels for screen readers only.
  - `ad-step-rail` sits on six step rails: steps other than the current one show only their number, on a button still at least 44 px wide.

  On narrow screens, back buttons show only their arrow (the accessible name stays) and rails wrap. The large spacing and heading tokens shrink a step. On short screens `--work-max-h` becomes `calc(100dvh - 16px)`, which surfaces use to cap their height.

- **Per game**, a `compact.css` next to the flow it changes, imported after that flow's CSS:
  - Workshop: saw, join and sand benches beside their controls; the layout boards beside a scrolling parts tray, whose part names wrap instead of being cut off; extras beside the tin. `SawBench`'s smallest scale went from 6 to 3 px per cm, so the plank shrinks to fit a phone instead of scrolling sideways.
  - Patisserie: weigh, stir, oven, stack, pipe and decorate side by side; Counter Day and Table Service with a slimmer sunset band and the glass case kept in reach.
  - Interior: plan, light, style, paint, floor and reveal side by side; on an upright phone the plan (42% of the height) and its tray (40%) fit on one screen; the checklist moves after the work area, visually only.
  - Jewellery: stats, scene and tools in one row, the stats column narrow enough that the stone stays at least 44 px; the design and display previews stick 8 px from the top and fit the height. They used to stick at 84 px, under a header that no longer sticks.
  - Six Kitchens: chop, sizzle, simmer, taste and plate sized to the height; the service tabs become a right-hand column; the step rail wraps on phones (it used to scroll up to 115 px sideways).
  - Thrift-Flip: unpick, cut, sew and finish sized to the height, with the finishing drawer's tabs sharing its width and, on phones, the footer's Next button wrapping under its status (CI's Linux fonts scrolled these 45 and 13 px sideways); stall day and the window display tighter.
  - ADEEVA: cutting with the tray beside the board; trace and machine capped to the height; the sewing HUD wraps. It used to scroll sideways on phones, in Thrift-Flip too.
- **Kept**: all Phase C art, the source and focus order, touch targets of at least 44 px and body text of at least 14 px.

## 3. Before and after

Band and work are in CSS px.

- "fits" means the work area fits on one screen below the band.
- "—" means a screen with no single work area: a story, a brief or a shop list.

### ADEEVA

| Screen            | Handheld band | Handheld work       | iPhone band | iPhone work                      |
| ----------------- | ------------- | ------------------- | ----------- | -------------------------------- |
| career2-hub       | 117 → 0       | — → —               | 216 → 0     | — → —                            |
| collection-board  | 61 → 61       | 1406 no → 1318 no   | 68 → 61     | 3390 no → 3238 no                |
| hub               | 117 → 0       | 44 fits → 44 fits   | 216 → 0     | 44 fits → 44 fits                |
| results           | 0 → 0         | 52 fits → 52 fits   | 0 → 0       | 52 fits → 52 fits                |
| runway-planner    | 61 → 61       | 1786 no → 1704 no   | 68 → 68     | 2421 no → 2314 no                |
| runway-show       | 360 → 360     | 360 no → 360 no     | 659 → 659   | 659 no → 659 no                  |
| stage-assemble    | 117 → 0       | 266 no → 266 fits   | 174 → 0     | 488 no → 488 fits                |
| stage-brief       | 117 → 0       | — → —               | 174 → 0     | — → —                            |
| stage-cut         | 117 → 0       | 368 no → 283 fits   | 174 → 0     | 557 no → 557 fits                |
| stage-cut-trace   | 117 → 0       | 300 no → 288 fits   | 174 → 0     | 120 fits → 120 fits              |
| stage-decorate    | 117 → 0       | 281 no → 281 fits   | 174 → 0     | 514 no → 514 fits                |
| stage-fabric      | 117 → 0       | 44 fits → 44 fits   | 174 → 0     | 51 fits → 44 fits                |
| stage-fabric-shop | 117 → 0       | — → —               | 174 → 0     | — → —                            |
| stage-review      | 117 → 0       | 52 fits → 52 fits   | 174 → 0     | 52 fits → 52 fits                |
| stage-sew         | 117 → 0       | 180 fits → 208 fits | 174 → 0     | 223 fits, 60 sideways → 229 fits |
| stage-sketch      | 117 → 0       | — → —               | 174 → 0     | — → —                            |

### Six Kitchens

| Screen       | Handheld band | Handheld work       | iPhone band | iPhone work                      |
| ------------ | ------------- | ------------------- | ----------- | -------------------------------- |
| career2-hub  | 172 → 0       | 64 fits → 64 fits   | 254 → 0     | 64 fits → 64 fits                |
| cook-chop    | 129 → 0       | 472 no → 327 fits   | 188 → 0     | 249 fits, 46 sideways → 249 fits |
| cook-simmer  | 129 → 0       | 543 no → 348 fits   | 184 → 0     | 421 fits, 85 sideways → 421 fits |
| cook-sizzle  | 129 → 0       | 266 no → 266 fits   | 184 → 0     | 476 no, 20 sideways → 476 fits   |
| cook-taste   | 129 → 0       | 396 no → 306 fits   | 184 → 0     | 739 no, 16 sideways → 558 fits   |
| crossroads   | 0 → 0         | 1712 no → 1712 no   | 0 → 0       | 1964 no → 1964 no                |
| hub          | 172 → 0       | 44 fits → 44 fits   | 254 → 0     | 44 fits → 44 fits                |
| results      | 0 → 0         | 64 fits → 64 fits   | 0 → 0       | 64 fits → 64 fits                |
| service-rush | 0 → 0         | 328 no → 352 fits   | 0 → 0       | 542 no → 548 no                  |
| stage-mise   | 129 → 0       | 248 no → 248 fits   | 188 → 0     | 547 no, 115 sideways → 547 fits  |
| stage-pass   | 129 → 0       | 206 fits → 206 fits | 184 → 0     | 206 fits, 58 sideways → 206 fits |
| stage-plate  | 129 → 0       | 974 no → 328 fits   | 184 → 0     | 665 no, 63 sideways → 612 fits   |
| stage-ticket | 129 → 0       | — → —               | 184 → 0     | — → —                            |

### Interior Studio

| Screen             | Handheld band | Handheld work      | iPhone band | iPhone work         |
| ------------------ | ------------- | ------------------ | ----------- | ------------------- |
| career2-hub        | 121 → 121     | — → —              | 249 → 201   | — → —               |
| hub                | 163 → 0       | 52 fits → 52 fits  | 211 → 0     | 52 fits → 52 fits   |
| open-house-doors   | 121 → 121     | 52 fits → 52 fits  | 249 → 241   | 52 fits → 52 fits   |
| open-house-planner | 121 → 121     | 44 fits → 44 fits  | 249 → 241   | 44 fits → 44 fits   |
| open-house-show    | 360 → 360     | 360 no → 360 no    | 659 → 659   | 659 no → 659 no     |
| results            | 0 → 0         | 52 fits → 52 fits  | 0 → 0       | 52 fits → 52 fits   |
| stage-brief        | 187 → 0       | — → —              | 193 → 0     | — → —               |
| stage-floor        | 113 → 0       | 327 no → 304 fits  | 169 → 0     | 563 no → 576 fits   |
| stage-light        | 137 → 0       | 620 no → 304 fits  | 193 → 0     | 839 no → 595 fits   |
| stage-paint        | 163 → 0       | 949 no → 328 fits  | 193 → 0     | 706 no → 719 no     |
| stage-plan         | 187 → 0       | 1301 no → 298 fits | 193 → 0     | 2221 no → 620 fits  |
| stage-reveal       | 0 → 0         | 378 no → 355 fits  | 0 → 0       | 394 fits → 405 fits |
| stage-shop         | 187 → 0       | 52 fits → 52 fits  | 193 → 0     | 52 fits → 52 fits   |
| stage-style        | 163 → 0       | 1240 no → 309 fits | 193 → 0     | 1687 no → 1486 no   |

### Jewellery Bench

| Screen           | Handheld band | Handheld work       | iPhone band | iPhone work         |
| ---------------- | ------------- | ------------------- | ----------- | ------------------- |
| career2-hub      | 114 → 0       | 778 no → 778 no     | 208 → 0     | 1001 no → 1001 no   |
| collection-board | 0 → 0         | 664 no → 664 no     | 0 → 0       | 1227 no → 1219 no   |
| gem-market       | 408 → 408     | 548 no → 548 no     | 0 → 0       | 875 no → 875 no     |
| hub              | 114 → 0       | 52 fits → 52 fits   | 208 → 0     | 52 fits → 52 fits   |
| launch-board     | 0 → 0         | 52 fits → 52 fits   | 0 → 0       | 52 fits → 52 fits   |
| launch-planner   | 0 → 0         | 52 fits → 52 fits   | 0 → 0       | 52 fits → 52 fits   |
| launch-show      | 0 → 0         | 507 no → 507 no     | 0 → 0       | 281 fits → 281 fits |
| results          | 0 → 0         | 52 fits → 52 fits   | 0 → 0       | 52 fits → 52 fits   |
| stage-brief      | 89 → 0        | — → —               | 169 → 0     | — → —               |
| stage-cut        | 89 → 0        | 228 fits → 167 fits | 169 → 0     | 313 fits → 329 fits |
| stage-design     | 89 → 528      | 380 no → 380 no     | 169 → 0     | 300 fits → 300 fits |
| stage-display    | 89 → 524      | 887 no → 807 no     | 169 → 0     | 1248 no → 1184 no   |
| stage-join       | 89 → 0        | 380 no → 300 fits   | 169 → 0     | 468 fits → 468 fits |
| stage-plan       | 89 → 0        | 240 fits → 240 fits | 169 → 0     | 448 fits → 448 fits |
| stage-polish     | 89 → 0        | 308 no → 243 fits   | 169 → 0     | 552 no → 568 fits   |
| stage-review     | 89 → 0        | 52 fits → 52 fits   | 169 → 0     | 52 fits → 52 fits   |
| stage-set        | 89 → 0        | 308 no → 243 fits   | 169 → 0     | 552 no → 568 fits   |
| stage-supplies   | 89 → 0        | 52 fits → 52 fits   | 169 → 0     | 52 fits → 52 fits   |

### Patisserie Atelier

| Screen         | Handheld band | Handheld work       | iPhone band | iPhone work         |
| -------------- | ------------- | ------------------- | ----------- | ------------------- |
| career2-hub    | 118 → 0       | 52 fits → 52 fits   | 204 → 0     | 52 fits → 52 fits   |
| counter-day    | 81 → 0        | 486 no → 219 fits   | 156 → 0     | 876 no → 437 fits   |
| fair-board     | 74 → 74       | 52 fits → 52 fits   | 120 → 120   | 52 fits → 52 fits   |
| fair-planner   | 74 → 74       | 52 fits → 52 fits   | 120 → 120   | 52 fits → 52 fits   |
| fair-showcase  | 0 → 0         | 473 no → 481 no     | 0 → 0       | 613 fits → 613 fits |
| hub            | 118 → 0       | 44 fits → 44 fits   | 204 → 0     | 44 fits → 44 fits   |
| results        | 0 → 0         | 64 fits → 64 fits   | 0 → 0       | 64 fits → 64 fits   |
| stage-bake     | 91 → 0        | 1010 no → 328 fits  | 259 → 0     | 639 no → 639 fits   |
| stage-brief    | 91 → 0        | — → —               | 259 → 0     | — → —               |
| stage-decorate | 91 → 0        | 691 no → 344 fits   | 259 → 0     | 828 no → 652 fits   |
| stage-design   | 91 → 0        | 125 fits → 129 fits | 259 → 0     | 130 fits → 130 fits |
| stage-mix      | 91 → 0        | 519 no → 300 fits   | 259 → 0     | 369 fits → 369 fits |
| stage-pantry   | 91 → 0        | 44 fits → 44 fits   | 259 → 0     | 44 fits → 44 fits   |
| stage-pipe     | 91 → 0        | 251 fits → 278 fits | 259 → 0     | 280 fits → 280 fits |
| stage-review   | 91 → 0        | 52 fits → 52 fits   | 259 → 0     | 52 fits → 52 fits   |
| stage-stack    | 91 → 0        | 554 no → 328 fits   | 259 → 0     | 627 no → 622 fits   |
| stage-weigh    | 91 → 0        | 737 no → 280 fits   | 259 → 0     | 683 no → 493 fits   |
| table-service  | 81 → 0        | 591 no → 355 fits   | 167 → 0     | 801 no → 548 fits   |

### Thrift-Flip Studio

| Screen           | Handheld band | Handheld work       | iPhone band | iPhone work                     |
| ---------------- | ------------- | ------------------- | ----------- | ------------------------------- |
| career2-hub      | 144 → 0       | 52 fits → 52 fits   | 245 → 0     | 52 fits → 52 fits               |
| hub              | 144 → 0       | 52 fits → 52 fits   | 245 → 0     | 52 fits → 52 fits               |
| results          | 0 → 0         | 52 fits → 52 fits   | 0 → 0       | 52 fits → 52 fits               |
| showcase-planner | 0 → 0         | 52 no → 52 no       | 0 → 0       | 52 no → 52 no                   |
| showcase-show    | 360 → 360     | 360 no → 360 no     | 659 → 659   | 659 no → 659 no                 |
| stage-brief      | 0 → 0         | — → —               | 0 → 0       | — → —                           |
| stage-clean      | 0 → 0         | 280 fits → 280 fits | 0 → 0       | 315 fits → 315 fits             |
| stage-cut        | 0 → 0         | 300 fits → 288 fits | 0 → 0       | 107 fits → 123 fits             |
| stage-design     | 0 → 0         | 200 fits → 200 fits | 0 → 0       | 200 fits → 200 fits             |
| stage-finish     | 0 → 0         | 300 fits → 280 fits | 0 → 0       | 640 no, 31 sideways → 646 fits  |
| stage-layout     | 0 → 0         | 315 fits → 315 fits | 0 → 0       | 407 fits → 422 fits             |
| stage-market     | 0 → 0         | — → —               | 0 → 0       | — → —                           |
| stage-review     | 0 → 0         | 52 fits → 52 fits   | 0 → 0       | 52 fits → 52 fits               |
| stage-sew        | 0 → 0         | 180 fits → 208 fits | 0 → 0       | 313 no, 134 sideways → 223 fits |
| stage-unpick     | 0 → 0         | 420 no → 240 fits   | 0 → 0       | 260 no, 117 sideways → 260 fits |
| stall-day        | 0 → 0         | 404 no → 236 fits   | 0 → 0       | 404 fits → 236 fits             |
| window           | 0 → 0         | 1095 no → 296 fits  | 0 → 0       | 815 no → 497 fits               |

### Workshop & Wood

| Screen       | Handheld band | Handheld work       | iPhone band | iPhone work         |
| ------------ | ------------- | ------------------- | ----------- | ------------------- |
| career2-hub  | 161 → 0       | 52 fits → 52 fits   | 209 → 0     | 52 fits → 52 fits   |
| fair-board   | 0 → 0         | 52 fits → 52 fits   | 0 → 0       | 52 fits → 52 fits   |
| fair-booth   | 0 → 0         | 500 no → 508 no     | 0 → 0       | 426 fits → 426 fits |
| fair-planner | 0 → 0         | 52 fits → 52 fits   | 0 → 0       | 52 fits → 52 fits   |
| hub          | 161 → 0       | 52 fits → 52 fits   | 209 → 0     | 52 fits → 52 fits   |
| results      | 0 → 0         | 52 fits → 52 fits   | 0 → 0       | 52 fits → 52 fits   |
| set-design   | 128 → 0       | 194 fits → 198 fits | 250 → 0     | — → —               |
| set-finish   | 128 → 0       | 1048 no → 344 fits  | 250 → 0     | 755 no → 767 no     |
| set-join     | 128 → 0       | 604 no → 320 fits   | 250 → 0     | 387 fits → 398 fits |
| set-layout   | 128 → 0       | 1217 no → 334 fits  | 250 → 0     | 2328 no → 1118 no   |
| set-review   | 128 → 0       | 52 fits → 52 fits   | 250 → 0     | 52 fits → 52 fits   |
| set-saw      | 128 → 0       | 400 no → 320 fits   | 250 → 0     | 354 no → 205 fits   |
| stage-brief  | 128 → 0       | — → —               | 299 → 0     | — → —               |
| stage-design | 128 → 0       | 294 no → 294 fits   | 274 → 0     | 238 fits → 250 fits |
| stage-finish | 128 → 0       | 1048 no → 344 fits  | 299 → 0     | 755 no → 767 no     |
| stage-join   | 128 → 0       | 604 no → 320 fits   | 274 → 0     | 387 no → 398 fits   |
| stage-layout | 128 → 0       | 1083 no → 280 fits  | 274 → 0     | 1018 no → 630 fits  |
| stage-review | 128 → 0       | 52 fits → 52 fits   | 274 → 0     | 52 fits → 52 fits   |
| stage-sand   | 128 → 0       | 377 no → 289 fits   | 274 → 0     | 166 fits → 174 fits |
| stage-saw    | 128 → 0       | 400 no → 318 fits   | 274 → 0     | 336 no → 192 fits   |
| stage-timber | 128 → 0       | 446 no → 446 no     | 299 → 0     | 849 no → 788 no     |

Jewellery design and display on the handheld: the after run shows a 528 px band. That is the preview panel, still sticking at 84 px once the header stopped sticking. It was fixed after the run: the panel now sticks at 8 px and is capped to the height. Re-measured, the band is 320 and 256 px: the preview stands beside the choices, which scroll next to it.

## 4. No regressions on the desktop, Chromebook and iPad

None of the compact rules match these sizes. The before and after screenshots were compared pixel by pixel:

- desktop: 111 of 117 identical; Chromebook: 110 of 117; iPad: 91 of 117;
- most differences have no pixel off by more than 24 of 255. They are anti-aliasing and the frame an animation was caught on;
- the larger ones are animated screens (the Open House, Upcycle Showcase and Lantern Night shows, the Fair bunting) and one results screen where the scripted sewing scored 97 instead of 92;
- one real change: on the iPad, Workshop's saw plank is 1–2 px smaller. The old 6 px per cm floor sat just above the scale that fits the card there, so the plank no longer pokes past it.

## 5. Tests

`e2e/release/compact.spec.ts` (new) runs on `android-handheld` and `webkit-iphone` and skips at other sizes. For each game it checks that:

- the hub's Save & exit is in view at the top;
- one or two representative steps show the surface and its controls on screen together;
- nothing scrolls sideways.

Its fixtures are `e2e/fixtures/workArea.ts` (the checks, built on `stillBox` and `settle`) and `e2e/fixtures/compactStages.ts` (the prepared saves). It also checks that every enabled button on those screens is at least 44 px each way, and that the Jewellery stone is at least 44 px. On both sizes it drags a Workshop part from the tray onto a board, and an Interior armchair from the tray onto the plan, with the tray and the plan on screen together.

| Check                                                    | Result                                                                                                                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`                                         | clean                                                                                                                                                                         |
| `pnpm lint` (eslint with zero warnings, Prettier)        | clean                                                                                                                                                                         |
| `pnpm test`                                              | 291 files, 1,523 tests passed                                                                                                                                                 |
| `e2e/release` (`MAKER_PORT=5236 --workers=2`)            | 62 passed, 27 skipped                                                                                                                                                         |
| `e2e/release/compact.spec.ts` on handheld and iPhone     | 18 passed                                                                                                                                                                     |
| full `pnpm e2e` (`--workers=2`, before the review fixes) | 213 passed, 81 skipped, 1 failed: `update.spec.ts` on Chromium hit Windows' `net::ERR_NO_BUFFER_SPACE` at its first `page.goto`. Re-run on its own, both of its tests passed. |

## 6. Still doesn't fit

- **Long tap-only screens** stay long, by design, because nothing on them is dragged: ADEEVA's collection board and runway planner, Jewellery's collection board, gem market and second-career hub, the Six Kitchens Crossroads, and Workshop's timber list. Their buttons are reachable by scrolling.
- **Showcase shows** (ADEEVA runway, Interior Open House, Thrift-Flip Upcycle Showcase) fill the whole screen on purpose.
- **iPhone, upright:** a few craft steps are taller than one screen. Each still works by scrolling, and no drag has to cross the scroll:
  - Interior style and paint (719–1,486 px);
  - Workshop layout, extras and finish (767–1,118 px);
  - Jewellery display (1,184 px);
  - Six Kitchens service rush (548 px against 659).
- **Handheld:** Workshop's timber list (446 px), and Jewellery design and display, where the preview sits beside choices that scroll.
- **Drags:** in the measured steps, every drag surface and its tray are on screen together on both sizes. On the iPhone's Interior plan the furniture tray scrolls inside itself under the room; the cards also add a piece with a tap.
- **Saw on a phone:** the 3 px per cm floor keeps the whole plank on screen, but the cut tolerance is in cm, so on the iPhone (3.4 px per cm, 6 before but scrolling sideways) the band a finger must stay in is about 4 px instead of 7. Left as is; widen the tolerance on small screens if children find it too hard.
