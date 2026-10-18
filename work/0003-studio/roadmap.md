# Maker Studio — Roadmap and task list

This is the single place for status, open tasks and the order of work. Game designs live in `work/0003-studio/games/<id>.md`; the studio contract is in `work/0003-studio/design.md`.

**Working agreement:** everything stays local. Each task gets its own branch and worktree, two adversarial reviews and every check, then one commit. `main` is fast-forwarded locally only after it passes every check again. Pushes to GitHub (`Shanmuga-Raja-Portfolio/adeeva`, private) wait for Shan, and are done together, one by one. Every job's processes are cleaned up when it finishes.

## Status

| Game               | Playable slice        | Depth (second career or showcase)                    | Quality loop (bar 85%)               |
| ------------------ | --------------------- | ---------------------------------------------------- | ------------------------------------ |
| ADEEVA             | ✅                    | ✅ Student → Label, runway                           | ✅ 88%                               |
| Patisserie Atelier | ✅                    | ✅ Salon Pâtissier: Tea Salon and Patisserie Fair    | ✅ 88%                               |
| Thrift-Flip Studio | ✅                    | ✅ Resale Boutique and Upcycle Showcase              | ✅ 100% (merging after the race fix) |
| Interior Studio    | ✅                    | ✅ Show-Home Development and Open House              | ✅ 100% (merging after the race fix) |
| Workshop & Wood    | ✅                    | ✅ Furniture Showroom and Larkspur Craft Fair        | 🔄 gap round running                 |
| Jewellery Bench    | ✅                    | ✅ Collection Launch and Lantern Night               | ✅ 88%                               |
| Six Kitchens       | ✅ school → head chef | ✅ Crossroads: Restaurant, Food Truck, TV & Cookbook | ✅ 88%                               |

Every score comes from a blind panel of three critics against official store screenshots (see Phase C below). Art is still the criterion we lose most often; we win on clarity, feedback, readability and touch.

Research done (reference only): `work/0013-research/references.md` and `work/0013-research/competition-gtm.md`.

## Goal now (Shan, 2026-10-17)

Get Maker Studio deployed online, safe and secure, so the kids can play and Shan can invite friends and relatives to try it. See **Release plan** below.

## Task queue (in order; two lines at a time)

Done:

1. ✅ All seven games have depth (second career and showcase), and the kit dialogs focus the safe choice.
2. ✅ Browser-test stability and the first load-race sweep. The Patisserie Fair double-advance bug is fixed, and the trace screencast that blocked browser close is off.
3. ✅ Avatar feet, redrawn as grounded ankle boots (Shan's report).
4. ✅ Phase C for ADEEVA, Patisserie, Jewellery and Six Kitchens, each at 88%. Patisserie's bench and salon render fast on slow devices: screens preload while the hub is idle, and animated guests have their own layers.

Next:

5. 🔄 **Race sweep 2:** browser tests that wait on scenes which move on by themselves, in the newer specs (Jewellery Lantern Night, the Patisserie Fair timeout). After it lands, merge Thrift-Flip and Interior Phase C.
6. 🔄 **Workshop Phase C gap round:** the showroom hub, the finish step, and the Craft Fair crowd.
7. ⬜ **Speed on slow devices, all games:** move Patisserie's `lazyScreen` and `useIdlePreload` into `src/ui/kit` and use them in every game. Measure every hub and screen at 6× CPU throttle, and fix anything slower than 1.5 s. Check the richer Phase C art for animations inside big SVGs and heavy filters.
8. ⬜ **Dependency refresh and security audit:** apply the patch updates (Playwright 1.64.1, React 19.3.1, typescript-eslint 8.71.2, Vitest 5.0.5, ESLint 10.13.0; TypeScript stays on 6.x), remove anything unused, confirm `pnpm audit` is clean, check every licence is commercially permissive, and run the full gate.
9. ⬜ **Installable web app (PWA) and hardening** (see Release plan): manifest, icons, offline service worker, an update prompt, storage persistence, security headers, a no-network check, and an "About and privacy" page for families. Test at Android-handheld size and on a Chromebook. Add a Playwright **WebKit** project, so Safari's engine runs the smoke and install checks on every gate, and test at iPhone and iPad sizes. Check that Cloudflare Access sign-in works inside an installed iOS app, and that an expired session never breaks offline play: the cached game keeps working, and updates wait until next sign-in.
10. ⬜ **Final pass:** every check on `main`, a playthrough of every game from the studio home, a pre-deploy security review, and a closing report.
11. ⬜ **Deploy with Shan:** Shan creates the hosting account, we push and deploy together, then Shan invites the kids, friends and relatives.
12. ⬜ **After the first players:** a shared art pass (lighting, texture, depth) guided by what the kids and invited families say, and the Interior Challenging economy check (seed 2 earns 0.79× the loft).

Parked: the Tauri desktop app for the Windows PC (Shan, 2026-10-17). Rust 1.99.1, tauri-cli 2.11.2, MSVC Build Tools and WebView2 are already installed.

## Release plan (installable web app)

**What players get.** A link. On first visit the browser downloads the whole game once (a few MB) and stores it. After that it runs offline, launches from its own icon, and opens in its own window without browser bars.

- **Android handheld:** Chrome shows "Install app" or "Add to Home screen".
- **Chromebook:** an install icon in the address bar; the game then sits in the launcher like an app.
- **Windows PC:** Chrome or Edge, using the install icon in the address bar.
- **iPhone and iPad (Safari):** Share, then **Add to Home Screen**. Apple shows no install prompt, so the About page carries picture steps. Saves live inside the home-screen app and are separate from Safari tabs, so play from the icon. Safari's 7-day clean-up of website data doesn't apply to home-screen apps.
- **Mac:** Safari, File, then **Add to Dock** (macOS 14 or later), or the Chrome or Edge install icon.

**Saves.** Each device keeps its own saves in its browser storage. Nothing is uploaded and nothing is shared between devices. The app asks the browser to keep that storage persistent so it isn't cleared under space pressure. Uninstalling the app or clearing site data deletes the saves on that device, and the About page says so plainly.

**Updates.** When we deploy a new version, an installed copy notices it in the background the next time it's opened online. It then shows a gentle "A new version is ready, restart when you like" note, and never interrupts a game. Saves carry over: every game has versioned saves with migrations.

**Hosting.** The game is a static site: HTML, JavaScript, CSS and images, with no server code, database, accounts or logins of its own. It runs on a free static host with HTTPS. The suggestion is Cloudflare Pages: Shan creates the account, and the project gets a free `*.pages.dev` address. A custom domain is optional later.

**Who can open it.** Two options for Shan to choose:

- **Private link:** anyone with the link can play. It's simple, but a link can be forwarded.
- **Invite-only (recommended for friends and relatives):** Cloudflare Access sits in front of the site. Only email addresses Shan adds can get in. They type their email, get a one-time code, and play. It's free for small groups, and Shan can add or remove people at any time. The game itself still collects nothing; the one-time code is handled by Cloudflare.

**Safe and secure by design.**

- No ads, chat, accounts, analytics, tracking, third-party scripts, fonts or images. The app makes zero network requests besides loading itself, and a browser test checks that.
- Strict security headers on every response: a Content Security Policy that allows only the site itself, no framing by other sites, no referrer leaks, and camera, microphone, location and other device features switched off.
- HTTPS only, enforced by the host.
- Dependencies are audited before every deploy (`pnpm audit`), the lockfile is frozen, and builds come from a clean install.
- An "About and privacy" page for parents covers what the app stores (saves on the device only), what it never does, and how to delete everything.
- The host keeps its own standard request logs (IP addresses), as every website does. The About page mentions it.

**How a deploy happens.** Deploys are deliberate, never automatic from work in progress:

1. Every check passes on `main`, and the security review is clean.
2. Shan and I push together. The host builds from the pushed branch, or I upload the checked build after Shan logs in.
3. We open the live link on each device and check that it installs, plays offline and keeps its saves.

**Feedback from invited players.** It happens outside the game: a short form or an email to Shan. The game itself never collects anything.

## Waiting for Shan (do together, one by one)

- Create the hosting account (Cloudflare Pages, plus Cloudflare Access for invite-only), and choose a private link or invite-only.
- Push `main` and each task branch to GitHub once that task is merged and has passed every check.
- Read the research reports and decide whether anything in them is worth discussing.
- Playtest with the kids, then the invited friends and relatives. Their reactions are the final judge.

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
