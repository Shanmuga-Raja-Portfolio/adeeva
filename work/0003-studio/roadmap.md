# Maker Studio — Roadmap and task list

This is the single place for status, open tasks and the order of work. Game designs live in `work/0003-studio/games/<id>.md`; the studio contract is in `work/0003-studio/design.md`.

**Working agreement:** everything stays local. Each task gets its own branch and worktree, two adversarial reviews and every check, then one commit. `main` is fast-forwarded locally only after it passes every check again. Pushes to GitHub (`Shanmuga-Raja-Portfolio/adeeva`, private) wait for Shan, and are done together, one by one. Every job's processes are cleaned up when it finishes.

## Status

| Game               | Playable slice        | Depth (second career or showcase)                    | Quality loop                    |
| ------------------ | --------------------- | ---------------------------------------------------- | ------------------------------- |
| ADEEVA             | ✅                    | ✅ Student → Label, runway                           | 🔄 75% (needs 85%)              |
| Patisserie Atelier | ✅                    | ✅ Salon Pâtissier: Tea Salon and Patisserie Fair    | 🔄 75%, salon hub clearly worse |
| Thrift-Flip Studio | ✅                    | ✅ Resale Boutique and Upcycle Showcase              | 🔄 63% (needs 85%)              |
| Interior Studio    | ✅                    | ✅ Show-Home Development and Open House              | 🔄 first pass running           |
| Workshop & Wood    | ✅                    | ✅ Furniture Showroom and Larkspur Craft Fair        | ⬜                              |
| Jewellery Bench    | ✅                    | ✅ Collection Launch and Lantern Night               | ⬜                              |
| Six Kitchens       | ✅ school → head chef | ✅ Crossroads: Restaurant, Food Truck, TV & Cookbook | 🔄 first pass running           |

Research done (reference only): `work/0013-research/references.md` and `work/0013-research/competition-gtm.md`.

## Task queue (in order; two lines at a time)

1. ✅ **Thrift-Flip depth**, merged.
2. ✅ **Browser-test stability**, merged. Tests run against a production build on 127.0.0.1 and wait on real state.
3. ✅ **Browser-test load races**, merged. Chef waits follow the live board and pan; timed show scenes are stepped with Playwright's clock. A real Patisserie Fair bug is fixed: a tap and the timer in the same frame skipped the child's reveal.
4. ✅ **Workshop depth**, merged.
5. ✅ **Interior depth**, merged, plus the show kit lifted into `src/ui/show` so Interior doesn't import ADEEVA. Thrift-Flip → ADEEVA is the only cross-game import.
6. ✅ **Browser-close hang**, merged. Trace screencast frames are off; their write backlog to the USB drive blocked context close under load.
7. ✅ **Avatar feet**, merged. Shan reported the feet; they were redrawn as grounded ankle boots.
8. ✅ **Jewellery depth**, merged. All seven games now have their second career and showcase.
9. ✅ **Kit dialog focus**, merged. Dialogs focus their marked safe choice after the modal opens.
10. 🔄 **Phase C first pass** for every game (bar 85%, below). Merged so far: ADEEVA 75%, Patisserie 75% with the salon hub clearly worse, Thrift-Flip 63%. These count as progress, not passes. Six Kitchens and Interior are running; Workshop and Jewellery are next.
11. ⬜ **Phase C gap rounds:** every game below 85% gets more rounds aimed at its losing screens. Known gaps:
    - Patisserie: redesign the salon hub so the tiers and bookings sit inside the parlour scene, and make Scoop & Weigh livelier.
    - Thrift-Flip: both hubs and the snip step.
    - ADEEVA: the title and sketch screens.
12. ⬜ **Shared art pass:** lighting, texture and depth in `src/ui/art` and the kit, because art is the criterion we lose most often. Every game is then re-judged blind against the 85% bar.
13. ⬜ **Interior Challenging economy:** on seed 2 the home earns 0.79× the loft, and the bot scores Gold where about 76 was the target.
14. ⬜ **Family release (stage 1):** the kids play on a Windows PC, a Chromebook and an Android handheld, and saves stay on each device. Make Maker Studio an installable offline web app (PWA): a manifest, icons, offline caching and relative asset paths. Test it at Android-handheld size (small landscape screen, touch, gamepad buttons if present) and on the Chromebook (touchpad and keyboard). Hosting must be HTTPS, and Shan creates that account. Also build a Tauri desktop app for the Windows PC (Shan wants both). Tauri needs a Rust toolchain, so ask Shan before installing it. Stages 2 (a private playtest with trusted families, with feedback gathered outside the game) and 3 (public, itch.io first) wait for Shan.
15. ⬜ **Final pass:** every check on `main`, a playthrough of every game from the studio home, and a closing report.

## Waiting for Shan (do together, one by one)

- Push `main` and each task branch to GitHub once that task is merged and has passed every check.
- Read the research reports and decide whether anything in them is worth discussing.
- Playtest with the kids. Their reactions are the final judge in Phase C.

## Phase B — Depth (definition)

Each slice game grows to ADEEVA's depth:

- a second career or show mode, unlocked by reputation or order thresholds inside the same save;
- a showcase event judged by warm panels (no eliminations and no TV-competition formats);
- about twice the slice content (clients, materials, products, upgrades, story beats);
- an economy retuned so a decent Standard player passes 75–90% of orders and Relaxed is always recoverable;
- a save migration so existing saves load and continue.

## Phase C — Quality loop (definition)

For each game:

1. **External references:** use the references listed in `work/0013-research/references.md`. Official Steam and itch.io screenshots are fetched into the session scratchpad, used for internal comparison only, and never copied, traced or committed.
2. **Matched pairs:** each of our screenshots is paired with a reference showing the same kind of screen (hub with hub, crafting step with crafting step, results with results) at the same size.
3. **Blind judging:** a script randomly assigns each pair the labels A and B and strips filenames and logos. A fresh critic that has never seen our code picks the better image on fixed criteria (art, typography, feedback and juice, readability for ages 8–15+, touch comfort), explains each verdict and names concrete defects. The labels are revealed only after judging.
4. **Pass bar (Shan, 2026-10-17):** a game passes when our screen wins or ties at least **85%** of pairs and no pair is judged "clearly worse". 60% was the first bar; Shan raised it.
5. **Improver loop:** otherwise an improver fixes the named defects and every check runs again. New screenshots, new random labels and a fresh critic follow, for up to 4 rounds per pass. A game below the bar gets further gap passes aimed at its losing screens; any gap still left is reported plainly.

Out of scope: 3D or ThreeJS rewrites and comparisons with AAA shooters. These games are 2D SVG cozy sims by design.
