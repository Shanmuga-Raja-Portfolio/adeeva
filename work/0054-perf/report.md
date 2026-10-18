# Task 0054 — Speed on slow devices, all games

Roadmap task 7. The kids play on a Chromebook and a cheap Android handheld, so every game was measured at 6× CPU throttle and every transition was held to a 1.5 s budget.

## Method

- **Build:** the production build (`vite build` + `vite preview`), not the dev server.
- **Throttle:** Playwright in Chromium with `Emulation.setCPUThrottlingRate` at 6×, viewport 1280 × 720, animations on (reduced motion off), as a player would have it.
- **What one number means:** time from the click event (`event.timeStamp`) to the first painted frame that shows the next screen's key element (its `main` with `data-stage`, or a screen-only `data-testid`). An in-page probe polls on `requestAnimationFrame` and stamps the time from a task queued right after the frame that first lays the element out. Long tasks come from a `PerformanceObserver` on `longtask`.
- **Idle preloading counts:** after landing on a hub the script waits 2 s, about as long as a child takes to read it, before it taps on.
- **Coverage, 7 games, 269 transitions:**
  - studio home → title, title → new game, and the new-game wizard → first story;
  - title → hub with prepared saves (starter hub and second-career hub);
  - hub → every main screen and back;
  - hub → every craft step, using a prepared run at each stage;
  - review → results;
  - hub → showcase or fair planner → the live show.
- **Before and after on the same machine at the same time:** both builds were served side by side and the runs alternated per game (before, after, before, after…), three runs each. Each figure below is the median of 3.
- **Kept out of the repo:** the scripts were throwaway Playwright scenarios in the session scratchpad. They reused the repo's `e2e/fixtures` and core playthrough helpers for the prepared saves.
- **Profiling:** a CPU profile and a Chromium trace (style, layout, paint and layerize totals) for any slow transition, run on an unminified build.
- **Same visuals:** seven avatar-heavy scenes were captured as full-page screenshots on the old build and compared with the new one at `maxDiffPixels: 0`. They were the Thrift-Flip hub, Showcase planner and Swap hall, the Workshop fair-day hub, the Patisserie salon hub, the Six Kitchens hub and the ADEEVA label hub. All seven were pixel-identical, with animations disabled for the capture.
- **Avatar matrix (review):** 800 still avatar scenes were rendered from both builds and diffed: every pose, all five outfits, three skin tones, the portrait, full and three-quarter frames, the chef whites, all seven diner styles, four ADEEVA dress sleeves, the dress preview, and the Thrift-Flip and Six Kitchens scene figures, both facings. 798 were byte-identical. Two `point` scenes differed by anti-aliasing only: 43 and 101 pixels, at most 14 of 255 on one channel. Removing the hidden nodes from the old build's page gives exactly the new image, and painting them solid magenta shows no magenta in any of 616 posed scenes, so the removed geometry was never visible.
- **Animated figures move very slightly.** `transform-box: fill-box` and the Patisserie `GuestLayer` `getBBox()` measure geometry even when it is clipped away. The hidden arms used to widen each posed figure's box, for example from 582 to 714 doll units for `wave`. The idle sway, breathe and bob animations now pivot on the visible figure. Frozen mid-animation, the figures shift by under a pixel; at rest they match.

## What was slow and why

- **Noise from a busy machine.** A first pass ran while another agent's e2e suite (8 workers) loaded the machine. In that pass these went over 1.5 s:
  - Thrift-Flip: hub → Showcase planner 4.8 s, title → stall hub 1.9 s, boutique hub → Swap hall 1.6 s;
  - Workshop: title → fair-day showroom hub 2.3 s, a set's sand step 1.7 s.

  Measured again on a quiet machine, the "before" build stays under 1.5 s everywhere. The slowest were the Swap hall at 1.35 s and the Showcase planner at 1.26 s.

- **Where the time goes.** On the slowest screens almost no time is JavaScript. The main thread is busy with style, layout, paint and layerize on very large SVG scenes, for example:
  - the planner draws about 15,400 elements, 12,600 of them in the hall backdrop;
  - each audience avatar is about 630 SVG nodes.
- **Avatar arms.** A posed avatar draws its arms and sleeves six times (upper arm, elbow joint and forearm, for each side, each clipped). Every copy carried _both_ arms, and the clip then hid the other one, so 60% of an avatar's nodes were arm copies.
- **Fairy lights.** The hall backdrop's fairy lights ran 48 separate CSS opacity animations inside the big SVG (one per bulb, two strings). The light previews draw the hall three more times, so 192 in all.
- **Plain `React.lazy` screens.** In five games (ADEEVA, Six Kitchens, Interior, Jewellery, Workshop) the screens used plain `React.lazy`, so the first visit to each screen waited on a chunk fetch and a Suspense fallback. That cost 250–300 ms per hop.

## What changed

1. **`lazyScreen` and `useIdlePreload` moved to `src/ui/kit`** (from `src/studio`), and every game now uses them. Heavy screens are lazy chunks, preloaded one by one while the hub is idle, then rendered synchronously with no fallback flash. This applies to ADEEVA (craft, label), Six Kitchens (dish, service, crossroads, path hub, diary), Interior (makeover, show home, open house), Jewellery (all eight screens), Workshop (build, fair, floor), and to Patisserie and Thrift-Flip, which already used them.
2. **Avatar arms draw one side per segment.** `PosedSide` tells its children which side it is drawing (`src/ui/art/avatar/armSide.ts`), and `CroquisArms` and `AvatarOutfitSleeves` draw only that side's arm and sleeve. The other side was always fully clipped away, so nothing visible is lost (see Same visuals and Avatar matrix above for the anti-aliasing and pivot details). Every SVG node of the arm and sleeve geometry lies within its own half of the doll (x ≤ 157 for sleeves, ≤ 150 for arms, midline 200). Each posed avatar loses about 190 nodes, in every game and on the studio home.
3. **Fairy lights twinkle as two layers.** The 24 bulbs of each string sit in two animated groups (even and odd bulbs, with the same timing and delay as before) instead of 24 animated groups. Bulbs in a group never overlap, so the result looks the same. Each bulb's effective opacity matches the old build at every 200 ms step of the 2.4 s cycle, and reduced motion (the system setting or the in-game switch) still leaves every bulb at full opacity. Only the anti-aliased rims of the halos differ, because each layer is now composited as one group.

**Initial JS (checked, no change needed):**

- The entry chunk is 332 kB (102 kB gzip). It holds React DOM, the studio, the avatar art for the home screen, and each game's `module.ts` (title, tile art, reputation reader).
- Each game's screens are their own chunk, loaded when its tile is opened. Within a game, heavy screens are separate chunks, preloaded while the hub is idle.
- A cold load to the studio home takes about 0.46 s at 6×.

## Result

- **Nothing is over 1.5 s.** No transition in any game reaches 1.5 s at 6× throttle, before or after; the slowest after the change is 1.05 s.
- **Hub → screen hops:** every lazy hub → screen hop in the five converted games fell from about 400–620 ms to about 100–440 ms.
- **The heaviest screens:**
  - Swap hall: 1354 → 1017 ms;
  - Showcase planner: 1260 → 996 ms;
  - Thrift-Flip stall hub: 1007 → 876 ms.
- **Still the closest to the budget:** the Thrift-Flip boutique hub at 1.05 s. It is a dense scene: the shop, rack, passers-by and townsfolk avatars, `mix-blend-mode` light shafts, and seven staggered dust motes inside the scene SVG. These are art choices, so changing them would change how it looks.
- **Checks:** `pnpm typecheck`, `pnpm lint` and `pnpm test` pass. The e2e specs for the changed areas pass with `--workers=2` (82 passed, 8 quality-shot tests skipped): studio, all of Thrift-Flip, and the hub-to-screen journeys of the other six games.
- **Load-failure test:** ADEEVA's "a studio view that fails to load" test blocked the CraftFlow chunk only after the hub was open. The hub now preloads that chunk while it is idle, so it had already loaded and the test failed. The test now blocks the chunk before the game opens. This also covers the new path: the idle preload fails quietly, the click tries the fetch again, and the boundary offers Reload.

## Before and after (ms, median of 3, 6× CPU throttle)

### Studio

| Screen                  | Before ms | After ms |
| ----------------------- | --------: | -------: |
| cold load → studio home |       455 |      476 |

### Patisserie Atelier

| Screen                        | Before ms | After ms |
| ----------------------------- | --------: | -------: |
| studio home → title           |       476 |      477 |
| title → new game              |       382 |      393 |
| new game → first story        |       406 |      394 |
| hub → bake (order card)       |       141 |      151 |
| bake → hub                    |       226 |      203 |
| title → hub (weigh save)      |       438 |      429 |
| hub → bench step weigh        |       214 |      214 |
| title → hub (pipe save)       |       450 |      428 |
| hub → bench step pipe         |       173 |      173 |
| title → hub (decorate save)   |       458 |      443 |
| hub → bench step decorate     |       189 |      184 |
| title → hub (review save)     |       469 |      445 |
| hub → bench step review       |       202 |      198 |
| review → results              |       135 |      138 |
| title → hub (seasoned save)   |       504 |      486 |
| hub → bake book               |        95 |       79 |
| bake book → hub               |       299 |      268 |
| title → salon hub (career 2)  |       580 |      519 |
| title → hub (fair day)        |       571 |      512 |
| hub → fair board              |       189 |      180 |
| fair board → planner          |        75 |       76 |
| planner → fair showcase       |       200 |      197 |
| title → salon hub (salon day) |       587 |      536 |
| salon hub → table service     |       249 |      250 |

### ADEEVA

| Screen                                   | Before ms | After ms |
| ---------------------------------------- | --------: | -------: |
| studio home → title                      |       475 |      471 |
| title → new game                         |       402 |      403 |
| new game → first story                   |       249 |      244 |
| hub → craft brief (gig card)             |       423 |      129 |
| craft → hub                              |       117 |      111 |
| title → hub (starter save)               |       372 |      327 |
| hub → day transition                     |       149 |      147 |
| hub → title (save & exit)                |       143 |      136 |
| title → hub (brief save)                 |       359 |      338 |
| hub → craft step brief                   |       480 |      168 |
| title → hub (sketch save)                |       367 |      327 |
| hub → craft step sketch                  |       624 |      436 |
| title → hub (fabric save)                |       365 |      331 |
| hub → craft step fabric                  |       570 |      328 |
| title → hub (cut save)                   |       360 |      330 |
| hub → craft step cut                     |       554 |      318 |
| title → hub (assemble save)              |       370 |      331 |
| hub → craft step assemble                |       554 |      267 |
| title → hub (sew save)                   |       356 |      331 |
| hub → craft step sew                     |       473 |      205 |
| title → hub (decorate save)              |       340 |      325 |
| hub → craft step decorate                |       448 |      155 |
| title → hub (review save)                |       372 |      327 |
| hub → craft step review                  |       450 |      173 |
| review → results                         |       145 |      139 |
| title → label hub (career 2, new season) |       338 |      334 |
| label hub → collection board             |       465 |      165 |
| collection board → hub                   |       154 |      144 |
| label hub → collection board (again)     |        71 |       70 |
| board → craft (design look 1)            |       437 |      119 |
| title → label hub (career 2, show eve)   |       503 |      470 |
| label hub → collection board (show eve)  |       550 |      257 |
| board → runway planner                   |       477 |      462 |
| planner → runway show                    |       109 |      107 |

### Thrift-Flip Studio

| Screen                              | Before ms | After ms |
| ----------------------------------- | --------: | -------: |
| studio home → title                 |       553 |      535 |
| title → new game                    |       395 |      397 |
| new game → first story              |       703 |      629 |
| hub → flip brief (gig card)         |       269 |      212 |
| flip → hub                          |       337 |      284 |
| title → hub (starter save)          |      1007 |      876 |
| hub → day transition                |       808 |      651 |
| hub → title (save & exit)           |       360 |      311 |
| title → hub (stall day save)        |       978 |      887 |
| hub → stall day                     |       321 |      242 |
| stall day → hub                     |       696 |      607 |
| title → hub (brief save)            |       768 |      691 |
| hub → flip step brief               |       286 |      231 |
| title → hub (design save)           |       782 |      695 |
| hub → flip step design              |       273 |      275 |
| title → hub (market save)           |       763 |      687 |
| hub → flip step market              |       317 |      293 |
| title → hub (unpick save)           |       774 |      715 |
| hub → flip step unpick              |       328 |      279 |
| title → hub (clean save)            |       789 |      697 |
| hub → flip step clean               |       323 |      265 |
| title → hub (layout save)           |       771 |      720 |
| hub → flip step layout              |       268 |      241 |
| title → hub (cut save)              |       788 |      703 |
| hub → flip step cut                 |       281 |      261 |
| title → hub (sew save)              |       800 |      722 |
| hub → flip step sew                 |       305 |      276 |
| title → hub (finish save)           |       786 |      715 |
| hub → flip step finish              |       298 |      242 |
| title → hub (review save)           |       786 |      727 |
| hub → flip step review              |       255 |      210 |
| review → results                    |       197 |      200 |
| title → boutique hub (career 2)     |      1124 |     1048 |
| boutique hub → window               |       251 |      230 |
| window → hub                        |       656 |      566 |
| title → boutique hub (till day)     |      1067 |      946 |
| boutique hub → till                 |       290 |      255 |
| till → hub                          |       692 |      612 |
| title → boutique hub (swap day)     |       931 |      845 |
| boutique hub → swap hall            |      1354 |     1017 |
| swap hall → hub                     |       680 |      573 |
| title → boutique hub (showcase day) |       967 |      872 |
| hub → showcase planner              |      1260 |      996 |
| planner → showcase show             |       288 |      224 |

### Workshop & Wood

| Screen                                 | Before ms | After ms |
| -------------------------------------- | --------: | -------: |
| studio home → title                    |       457 |      455 |
| title → new game                       |       349 |      370 |
| new game → first story                 |       301 |      289 |
| hub → build brief (job card)           |       412 |      119 |
| build → hub                            |       159 |      141 |
| title → hub (starter save)             |       429 |      395 |
| hub → day transition                   |       214 |      205 |
| hub → title (save & exit)              |        98 |       95 |
| title → hub (brief save)               |       372 |      354 |
| hub → build step brief                 |       423 |      133 |
| title → hub (design save)              |       374 |      350 |
| hub → build step design                |       403 |      109 |
| title → hub (timber save)              |       402 |      381 |
| hub → build step timber                |       430 |      155 |
| title → hub (layout save)              |       437 |      394 |
| hub → build step layout                |       525 |      242 |
| title → hub (saw save)                 |       426 |      417 |
| hub → build step saw                   |       431 |      158 |
| title → hub (join save)                |       395 |      370 |
| hub → build step join                  |       496 |      229 |
| title → hub (sand save)                |       398 |      375 |
| hub → build step sand                  |       448 |      187 |
| title → hub (finish save)              |       393 |      369 |
| hub → build step finish                |       492 |      225 |
| title → hub (review save)              |       414 |      370 |
| hub → build step review                |       448 |      179 |
| review → results                       |       180 |      171 |
| title → showroom hub (career 2)        |       636 |      628 |
| showroom hub → floor arrange           |       471 |      184 |
| floor arrange → hub                    |       361 |      358 |
| title → showroom hub (set layout save) |       543 |      508 |
| showroom hub → set step layout         |       536 |      272 |
| set build → hub                        |       233 |      219 |
| title → showroom hub (set saw save)    |       577 |      522 |
| showroom hub → set step saw            |       428 |      163 |
| title → showroom hub (set join save)   |       509 |      478 |
| showroom hub → set step join           |       507 |      258 |
| title → showroom hub (set sand save)   |       544 |      527 |
| showroom hub → set step sand           |       465 |      220 |
| title → showroom hub (set finish save) |       549 |      515 |
| showroom hub → set step finish         |       472 |      228 |
| title → showroom hub (set review save) |       555 |      524 |
| showroom hub → set step review         |       454 |      208 |
| title → showroom hub (fair day)        |       588 |      564 |
| hub → fair board                       |       406 |      111 |
| fair board → hub                       |       330 |      313 |
| hub → fair board (again)               |        73 |       76 |
| fair board → planner                   |        84 |       91 |
| planner → booth reveal                 |       229 |      228 |

### Interior Studio

| Screen                                 | Before ms | After ms |
| -------------------------------------- | --------: | -------: |
| studio home → title                    |       485 |      479 |
| title → new game                       |       399 |      387 |
| new game → first story                 |       275 |      258 |
| hub → makeover (order card)            |       420 |      135 |
| makeover → hub                         |       115 |      108 |
| title → hub (brief save)               |       325 |      315 |
| hub → makeover step brief              |       440 |      143 |
| title → hub (plan save)                |       330 |      303 |
| hub → makeover step plan               |       589 |      360 |
| title → hub (shop save)                |       344 |      316 |
| hub → makeover step shop               |       488 |      213 |
| title → hub (paint save)               |       328 |      317 |
| hub → makeover step paint              |       472 |      205 |
| title → hub (floor save)               |       333 |      314 |
| hub → makeover step floor              |       471 |      200 |
| title → hub (light save)               |       352 |      313 |
| hub → makeover step light              |       459 |      185 |
| title → hub (style save)               |       321 |      311 |
| hub → makeover step style              |       452 |      193 |
| title → hub (reveal save)              |       328 |      313 |
| hub → makeover step reveal             |       442 |      145 |
| reveal → results                       |       153 |      150 |
| results → hub                          |       196 |      182 |
| title → hub (seasoned save)            |       387 |      375 |
| hub → makeover (seasoned order)        |       448 |      155 |
| title → hub (show-home save, career 2) |       391 |      382 |
| hub → home screen                      |       473 |      219 |
| home → home room                       |       416 |      139 |
| home room → home                       |       147 |      143 |
| home → hub                             |       159 |      154 |
| title → hub (open house day)           |       453 |      469 |
| hub → home screen (open house day)     |       409 |      123 |
| planner → open house show              |       398 |       88 |
| title → hub (after open house)         |       466 |      456 |
| hub → open house results               |       440 |      142 |
| open house results → hub               |       231 |      219 |

### Jewellery Bench

| Screen                       | Before ms | After ms |
| ---------------------------- | --------: | -------: |
| studio home → title          |       483 |      482 |
| title → new game             |       390 |      389 |
| new game → first story       |       333 |      321 |
| hub → bench (order card)     |       428 |      127 |
| bench → hub                  |       151 |      137 |
| title → hub (brief save)     |       398 |      364 |
| hub → bench step brief       |       432 |      142 |
| title → hub (design save)    |       386 |      376 |
| hub → bench step design      |       516 |      267 |
| title → hub (supplies save)  |       436 |      423 |
| hub → bench step supplies    |       458 |      184 |
| title → hub (plan save)      |       437 |      420 |
| hub → bench step plan        |       486 |      201 |
| title → hub (cut save)       |       432 |      424 |
| hub → bench step cut         |       442 |      185 |
| title → hub (join save)      |       441 |      418 |
| hub → bench step join        |       457 |      175 |
| title → hub (set save)       |       421 |      415 |
| hub → bench step set         |       444 |      170 |
| title → hub (polish save)    |       429 |      411 |
| hub → bench step polish      |       439 |      173 |
| title → hub (display save)   |       421 |      421 |
| hub → bench step display     |       432 |      161 |
| title → hub (review save)    |       428 |      425 |
| hub → bench step review      |       416 |      122 |
| review → results             |       142 |      136 |
| results → hub                |       208 |      200 |
| title → hub (seasoned save)  |       388 |      365 |
| hub → keepsakes              |       361 |       64 |
| keepsakes → hub              |       171 |      170 |
| hub → bench (seasoned order) |       429 |      133 |
| title → hub (market day)     |       453 |      448 |
| hub → market                 |       383 |       86 |
| market → hub                 |       213 |      217 |
| title → line hub (career 2)  |       507 |      500 |
| line hub → lookbook          |       411 |      128 |
| lookbook → line hub          |       220 |      219 |
| title → hub (themed loft)    |       410 |      404 |
| line hub → collection board  |       468 |      221 |
| collection board → line hub  |       156 |      158 |
| title → hub (boarded loft)   |       439 |      442 |
| line hub → gem market        |       400 |      132 |
| gem market → line hub        |       177 |      168 |
| title → hub (lantern night)  |       521 |      515 |
| line hub → launch            |       394 |      108 |
| launch board → planner       |       103 |       95 |
| planner → Lantern Night show |       188 |      188 |
| title → hub (pop-up day)     |       536 |      522 |
| line hub → pop-up window     |       429 |      153 |
| pop-up window → line hub     |       244 |      236 |

### Six Kitchens

| Screen                                     | Before ms | After ms |
| ------------------------------------------ | --------: | -------: |
| studio home → title                        |       485 |      483 |
| title → new game                           |       410 |      403 |
| new game → first story                     |       619 |      595 |
| hub → dish (start lesson)                  |       558 |      321 |
| dish → hub                                 |       289 |      262 |
| title → hub (ticket save)                  |       523 |      503 |
| hub → dish step ticket                     |       486 |      209 |
| title → hub (mise save)                    |       523 |      495 |
| hub → dish step mise                       |       426 |      129 |
| title → hub (cook save)                    |       521 |      506 |
| hub → dish step cook                       |       436 |      139 |
| title → hub (plate save)                   |       693 |      678 |
| hub → dish step plate                      |       455 |      183 |
| title → hub (pass save)                    |       678 |      676 |
| hub → dish step pass                       |       462 |      181 |
| pass bell → results                        |       854 |      857 |
| results → hub                              |       364 |      344 |
| title → hub (seasoned save)                |       612 |      597 |
| hub → dish diary                           |       420 |      115 |
| dish diary → hub                           |       361 |      352 |
| title → hub (crossroads ready)             |       484 |      485 |
| hub → crossroads                           |       409 |      110 |
| crossroads → hub                           |       214 |      209 |
| crossroads → path hub                      |       565 |      290 |
| title → path hub (service night, career 2) |       783 |      757 |
| path hub → service rush                    |       479 |      214 |
| title → path hub (after service)           |       914 |      875 |
| path hub → service results                 |       708 |      706 |
| service results → path hub                 |       646 |      596 |
| path hub → dish diary                      |       389 |      391 |
| dish diary → path hub                      |       489 |      453 |
