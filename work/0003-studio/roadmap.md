# Maker Studio — Roadmap and task list

This is the single place for status, open tasks and the order of work. Game designs live in `work/0003-studio/games/<id>.md`; the studio contract is in `work/0003-studio/design.md`.

**Working agreement:** everything stays local. Each task gets its own branch and worktree, two adversarial reviews and every check, then one commit. `main` is fast-forwarded locally only after it passes every check again. Pushes to GitHub (`Shanmuga-Raja-Portfolio/adeeva`, private) wait for Shan, and are done together, one by one. Every job's processes are cleaned up when it finishes.

## Status

| Game               | Playable slice        | Depth (second career or showcase)                                                    | Quality loop |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------ | ------------ |
| ADEEVA             | ✅                    | ✅ Student → Label, runway                                                           | ⬜           |
| Patisserie Atelier | ✅                    | ✅ Salon Pâtissier: Tea Salon and Patisserie Fair                                    | ⬜           |
| Thrift-Flip Studio | ✅                    | 🔄 Resale Boutique and Upcycle Showcase: built and reviewed, integrating onto `main` | ⬜           |
| Interior Studio    | ✅                    | ⬜ room makeovers → show-home development                                            | ⬜           |
| Workshop & Wood    | ✅                    | ⬜ commissions → furniture showroom and fair                                         | ⬜           |
| Jewellery Bench    | ✅                    | ⬜ stall → collection launch                                                         | ⬜           |
| Six Kitchens       | ✅ school → head chef | ✅ Crossroads: Restaurant, Food Truck, TV & Cookbook                                 | ⬜           |

Research done (reference only): `work/0013-research/references.md` and `work/0013-research/competition-gtm.md`.

## Task queue (in order; two lines at a time)

1. 🔄 **Thrift-Flip depth**, integration onto `main`. Patisserie depth already moved the same ADEEVA career and runway pieces into shared code; this merges each into one shared version.
2. 🔄 **Browser-test stability:** run the browser tests against a production build so they stay stable under parallel load, and prove it.
3. ⬜ **Interior depth:** show-home development.
4. ⬜ **Workshop depth:** furniture showroom and fair.
5. ⬜ **Jewellery depth:** collection launch.
6. ⬜ **Kit dialog focus:** shared dialogs don't move keyboard focus into themselves when they open (seen in Thrift-Flip's leave-draft dialog and ADEEVA's set-aside dialog). Fix it once in `ui/kit`, with a test.
7. ⬜ **Phase C quality loop** for all seven games (below).
8. ⬜ **Final pass:** every check on `main`, a playthrough of every game from the studio home, and a closing report.

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
4. **Pass bar:** a game passes when our screen wins or ties at least 60% of pairs and no pair is judged "clearly worse".
5. **Improver loop:** otherwise an improver fixes the named defects and every check runs again. New screenshots, new random labels and a fresh critic follow, for up to 4 rounds. Any gap left after that is reported plainly.

Out of scope: 3D or ThreeJS rewrites and comparisons with AAA shooters. These games are 2D SVG cozy sims by design.
