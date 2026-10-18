# Maker Studio — Roadmap and task list

This is the single place for status, open tasks and the order of work. Game designs live in `work/0003-studio/games/<id>.md`; the studio contract is in `work/0003-studio/design.md`.

**Working agreement:** each task gets its own `task/NNNN-slug` branch and worktree, two adversarial reviews and every check, then one commit. Pushes to GitHub (`Shanmuga-Raja-Portfolio/adeeva`, private) wait for Shan, and are done together, one by one. Once CI is live (task 57), every change reaches `main` through a pull request that merges only on a green `ci-ok`, with rebase or squash and the branch deleted afterwards; production deploys come only from release tags. The details are in `work/0057-ci-cd/README.md`. Every job's processes are cleaned up when it finishes.

## Status

| Game               | Playable slice        | Depth (second career or showcase)                    | Quality loop (bar 85%) |
| ------------------ | --------------------- | ---------------------------------------------------- | ---------------------- |
| ADEEVA             | ✅                    | ✅ Student → Label, runway                           | ✅ 88%                 |
| Patisserie Atelier | ✅                    | ✅ Salon Pâtissier: Tea Salon and Patisserie Fair    | ✅ 88%                 |
| Thrift-Flip Studio | ✅                    | ✅ Resale Boutique and Upcycle Showcase              | ✅ 100%                |
| Interior Studio    | ✅                    | ✅ Show-Home Development and Open House              | ✅ 100%                |
| Workshop & Wood    | ✅                    | ✅ Furniture Showroom and Larkspur Craft Fair        | ✅ 88%                 |
| Jewellery Bench    | ✅                    | ✅ Collection Launch and Lantern Night               | ✅ 88%                 |
| Six Kitchens       | ✅ school → head chef | ✅ Crossroads: Restaurant, Food Truck, TV & Cookbook | ✅ 88%                 |

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

5. ✅ **Race sweep 2:** the newer specs bind their show and scene waits to held time, a show-clock frame is capped so a stall never skips a scene, and toast lifetimes start when the toast appears. Thrift-Flip (100%) and Interior (100%) Phase C are merged.
6. ✅ **Workshop Phase C gap round:** 88% from a fresh three-critic panel, none clearly worse. The Craft Fair showcase is still the screen it loses; it is on the art-pass list.
7. ✅ **Speed on slow devices, all games:**
   - `lazyScreen` and `useIdlePreload` now live in `src/ui/kit`, and every game uses them.
   - 269 transitions across all seven games were measured at 6× CPU throttle on the production build. Nothing reaches 1.5 s; the slowest is the Thrift-Flip boutique hub at 1.05 s.
   - Posed avatars draw only their own arm in each arm segment, about 190 fewer SVG nodes each. Still pictures match apart from anti-aliasing in 2 of 800 diffed scenes. Idle animations now pivot on the visible figure, which moves it by under a pixel.
   - The hall's fairy lights twinkle as two layers instead of 48.
   - The method and the before and after table are in `work/0054-perf/report.md`.
8. ✅ **Dependency refresh and security audit:** Playwright 1.64.1, React 19.3.1, typescript-eslint 8.71.2, Vitest 5.0.5 and ESLint 10.13.0 (TypeScript stays on 6.x). `pnpm audit` is clean, knip finds no unused dependencies, and every licence is permissive (MIT, Apache-2.0, ISC, BSD, BlueOak); MPL-2.0 appears only in the lightningcss build tool, which is not shipped.
9. ✅ **Installable web app (PWA) and hardening** (branch `task/0053-pwa-hardening`). Built:
   - a manifest (`public/manifest.webmanifest`, standalone, scope `/`), icons at 192, 512 and 512 maskable plus a 180 apple-touch icon, all drawn from one SVG based on the studio mark, and the theme-colour and Apple tags in `index.html`;
   - a hand-written service worker with no new dependency. `tooling/offlineBuild.ts` writes the build's version and full file list into `src/offline/serviceWorker.js` as `sw.js`. It precaches every built file under a versioned cache, fetching each one with its SHA-384 integrity hash so that a damaged file, or a file from a different deploy, fails the whole install and leaves nothing behind. It deletes old caches on activate, handles same-origin GETs only, stores nothing outside the precache list, and leaves `/cdn-cgi/` (Cloudflare Access) to the network. A navigation always serves the cached studio straight away. If the family's Cloudflare Access session has expired, the studio screens show a small "Signed out" mark with a Sign in button (Shan, 2026-10-18): the app asks for its own `/sw.js` headers (a `HEAD` request that skips every cache) on open, when it returns to the foreground and when the device comes back online, and a redirect, 401 or 403 means signed out. The mark sits in the page header of the home, parent and About pages, never over the content and never inside a game. Sign in opens `/?signin=1`, which the worker passes to the network so the host's sign-in page appears. Once the host answers normally again, the worker still serves the saved studio, so the running version always matches what is kept for offline play, and the flag is removed from the address afterwards;
   - an update notice ("A new version is ready — restart when you like") with Restart and Later. It shows on the home, parent and About pages only, never inside a game, and Restart is the only thing that reloads. The worker registers in production builds only;
   - one `navigator.storage.persist()` request per launch, only when storage isn't already persistent, never awaited and silent if refused;
   - `public/_headers` for Cloudflare Pages with the strict CSP, HSTS, `nosniff`, `no-referrer`, `DENY` framing, COOP `same-origin`, a locked-down `Permissions-Policy`, `no-cache` for `/`, `/index.html`, `/sw.js` and the manifest, and a year's immutable caching for `/assets/*`. `vite preview` applies the same file path by path, as Cloudflare does, so every browser test runs under the real policy and caching rules. The manifest link uses `crossorigin="use-credentials"`, because browsers fetch a manifest without cookies otherwise and Access would turn it away. The plain-HTTP preview drops only `upgrade-insecure-requests`, because WebKit upgrades even loopback requests;
   - an "About and privacy" page (`#/about`, linked from the home footer and the parent page) with SVG picture steps for each device and a "Delete everything on this device" button, which stays locked until a grown-up types the word delete;
   - browser tests in `e2e/release/` (smoke, no network with no CSP violations and a check that the watch really sees a blocked style, manifest, per-path caching headers and offline play, update prompt, a damaged-file install that never takes over, nothing stored outside the build, About page), with new projects for an Android handheld (Pixel 7 landscape), a Chromebook (1366×768), and WebKit at iPhone 15 and iPad sizes. WebKit runs the service worker too, so offline play and the update prompt are checked there as well.

   Left for deploy day, on the live site: check that Cloudflare Access sign-in works inside an installed iOS home-screen app, and that an expired session never breaks offline play (the cached game keeps working, and updates wait until the next sign-in). Keep Cloudflare Web Analytics and any other HTML rewriting off: the worker checks every file's hash, so a page the host changes would never install for offline play. Also check on the live site that the headers arrive as written, and that the Signed out mark appears when an Access session expires (Access may answer the `/sw.js` check with a redirect or a 401). A captive-portal Wi-Fi that redirects every request will also show the mark until the portal is passed. Found along the way and fixed: a kit button's 1px hover lift moved its own hit area, so a pointer resting on its bottom edge flipped hover on and off every frame (seen on ADEEVA's story panel in WebKit). The button now keeps a still hit area while it lifts. Other cards and tiles with their own hover lift use the same pattern and are worth the same check.

10. 🟨 **Security hardening and pen test** (must be clean before any invite; local part and Shan's AI tools done, live part pending):
    - a written threat model (static site, children as users, invite-only access);
    - a strict CSP and headers via `_headers`, verified on the preview and the live URL: `default-src 'self'`, no inline scripts, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, HSTS, `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, and a locked-down `Permissions-Policy`;
    - a code review for XSS sinks (`dangerouslySetInnerHTML`, `innerHTML`, dynamic URLs) and safe parsing of every save and settings value read from storage (the parsers already reject bad saves; fuzz them);
    - service-worker safety (scope, cache versioning, no caching of opaque or third-party responses, update integrity);
    - a dependency audit, licence check and secret scan (git history included);
    - an OWASP ZAP baseline scan and a manual pen-test pass against the local preview and then the live address, including Cloudflare Access bypass attempts (direct asset URLs, preview URLs, cached service worker);
    - review tools Shan chose (no Aikido):
      - **Alibaba Open Code Review** (`alibaba/open-code-review`, Apache-2.0) over the release diff, run on the cheap MiniMax API or a small local model;
      - **Claude Code Review** (`/code-review ultra`), which only Shan can start because it is billed;
      - **Strix** (`usestrix/strix`, Apache-2.0, Docker sandbox) as AI pen-test agents against our own preview and live address only, alongside OWASP ZAP;
      - small local models (Ollama) and MiniMax for mundane, repetitive checks. API keys are Shan's and never printed;
    - a security report in `work/` with findings and fixes.

    Local part done (branch `task/0055-security-review`, 2026-10-18; `work/0055-security/threat-model.md` and `report.md`, ZAP reports in `work/0055-security/zap/`):
    - threat model written: assets, actors, entry points, mitigations with code pointers, residual risks;
    - code review: no HTML sinks, `eval`, string timers or `javascript:` URLs in app code; navigation is whitelisted; every storage read goes through a validating parser;
    - fuzzing with no new dependency (`src/engine/hostileJson.ts`, `src/engine/saveFuzz.ts`): every game's save loader and migrations, the profile, settings, play time, slot store, studio reputation and the jewellery drafts. A deep run of 210,231 cases has 0 failures; the committed tests run about 4,500 seeded cases;
    - fixed: `Cross-Origin-Resource-Policy: same-origin` on every path (COEP deliberately left off: it adds nothing under our CSP and only turns on cross-origin isolation); parse errors cut stored keys to 40 characters; `parseSaveWith` turns a throwing migration or parser into a damaged-save message, keeping the error for tests; cut drafts look up their own keys only; the About page's delete survives blocked storage; `vite preview` no longer sends CORS headers;
    - found: CORP does not stop another site from probing whether a browser is signed in to Access, because `CF_Authorization` defaults to `SameSite=None`; set the Access cookie to `SameSite=Lax` on deploy day;
    - `gitleaks` clean (working tree and all 57 commits); `dist/` has no source maps, `.env` values or local addresses; `pnpm audit` clean; the bundle holds only React (MIT) and app code;
    - OWASP ZAP 2.17.0 on the local preview: baseline 0 FAIL, full active scan 0 FAIL with 1 low false positive (the RNG constant read as a timestamp);
    - manual checks of headers, caching, service-worker scope, directory listing, stray files, the manifest and `?signin`, all clean.

    Shan's AI tools done (branch `task/0056-ai-security-tools`, 2026-10-18; `work/0056-ai-security/strix.md`, `open-code-review.md`, `triage.md`). Both ran on MiniMax-M3; the key was read only from the environment and never printed or stored:
    - **Strix 1.7.0** (Docker sandbox) against the local preview only:
      - 1 Medium, missing SRI on `index.html`'s tags: a false positive, because the HTML and assets are one origin and one atomic deploy;
      - 30 surfaces ruled out, 1 verification gap (the `/sw.js` update path, by design);
      - its agents broke scope with 22 read-only advisory lookups (OSV, npm, GitHub API), so lock down the sandbox network before the live run;
    - **Alibaba Open Code Review 1.13.1** over 31 release files: 130 comments (2 critical, 35 high by its own rating), every one checked and every one a false positive or a style opinion;
    - **triage confirmed 2 issues:**
      - fixed: the route parser's trailing-slash regex was quadratic, so a crafted `#/////…x` link froze WebKit for 19 s; it is now a linear trim, with a timing test;
      - upstream, preview only: one malformed request (`GET http://[`) crashes `vite preview` inside Vite's own URL parsing; keep the preview on `127.0.0.1` except during Docker scans.

    Pending: Strix against the live address (after the sandbox network lockdown); `/code-review ultra` (Shan starts it); and on deploy day, ZAP against the live URL, Cloudflare Access bypass attempts (direct asset URLs, `*.pages.dev` preview and branch URLs, the cached service worker, `HEAD /sw.js`, cookie flags including `SameSite=Lax`), the headers as Cloudflare actually serves them, and Access sign-in inside an installed iOS app.

11. 🟨 **CI/CD** (task 57, branch `task/0057-ci-cd`, 2026-10-18; built, waiting for Shan to push and watch the first runs). Built:
    - `ci.yml` on every pull request and push to `main`: verify (frozen install, typecheck, lint, unit tests, build, `pnpm audit --prod` at any level plus `--audit-level high` for everything, `dist` artifact), a gitleaks scan of the full history (pinned, checksum-checked CLI), the browser tests in 2 Chromium shards plus one WebKit job, and a single `ci-ok` check;
    - `preview.yml`: every same-repo pull request gets its own Cloudflare Pages preview and one self-updating comment with the link; it skips with a notice until the Cloudflare secrets exist;
    - `release.yml`: a `v*.*.*` tag on `main` reruns all of CI, deploys the tested build to production, then creates a GitHub Release; a manual run from an older tag is the slow rollback;
    - Dependabot (weekly, grouped minor and patch, TypeScript majors ignored), a pull request template, every action pinned by commit SHA, `actionlint` and ShellCheck clean;
    - `packageManager: pnpm@11.28.5` in `package.json`, with `devEngines` pinned to the same exact version;
    - a Linux rehearsal of the whole browser suite (Playwright's Ubuntu 24.04 image, 2 CPUs) found that Linux Chromium doesn't recognise `bluetooth` in our `Permissions-Policy`, and the console watch failed 13 tests. The Chromium projects now launch with `--enable-blink-features=WebBluetooth`, as Chromebooks and Android do. With that, everything passes on Linux: 176 Chromium tests and 18 WebKit.

    Waiting for Shan: push the branch and watch the first runs; create the Pages project, the Pages-only API token, the two repo secrets and the Access application (both `maker-studio.pages.dev` and `*.maker-studio.pages.dev`, cookie `SameSite=Lax`), and set the repo's merge settings. All steps are in `work/0057-ci-cd/README.md`.

12. ⬜ **Final pass:** every check on `main`, a playthrough of every game from the studio home, a drift sweep, and a closing report.
13. ⬜ **Deploy with Shan:** Shan sets up Cloudflare as in `work/0057-ci-cd/README.md`, we tag `v1.0.0` and watch the release deploy, then Shan invites the kids, friends and relatives.
14. ⬜ **After the first players:** a shared art pass (lighting, texture, depth) guided by what the kids and invited families say, and the Interior Challenging economy check (seed 2 earns 0.79× the loft).

**Recurring: drift and staleness sweep.** Run one at every milestone (after each phase, before every deploy) and whenever docs lag behind the code (Shan, 2026-10-17). It checks that:

- docs match the code (statuses, paths, scripts, numbers);
- there is no dead code, no unused files or dependencies, and no stale worktrees, branches or stray untracked files;
- every rule still holds;
- `pnpm audit` is clean.

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

**Hosting.** The game is a static site: HTML, JavaScript, CSS and images, with no server code, database, accounts or logins of its own. It runs on a free static host with HTTPS. The suggestion is Cloudflare Pages: Shan creates the account, and the project gets a free `*.pages.dev` address. Shan has no domain and none is needed: the game lives at the free address, for example `https://maker-studio.pages.dev` (the name depends on what is free). A custom domain costs about $10 a year and is optional later. Check when setting up: Cloudflare Access must protect the production `pages.dev` address and not only preview builds, and find out whether the free Zero Trust plan (up to 50 users) asks for a payment card on file.

**Who can open it.** Two options for Shan to choose:

- **Private link:** anyone with the link can play. It's simple, but a link can be forwarded.
- **Invite-only (recommended for friends and relatives):** Cloudflare Access sits in front of the site. Only email addresses Shan adds can get in. They type their email, get a one-time code, and play. It's free for small groups, and Shan can add or remove people at any time. The game itself still collects nothing; the one-time code is handled by Cloudflare.

**Safe and secure by design.**

- No ads, chat, accounts, analytics, tracking, third-party scripts, fonts or images. The app makes zero network requests besides loading itself, and a browser test checks that.
- Strict security headers on every response: a Content Security Policy that allows only the site itself, no framing by other sites, no referrer leaks, and camera, microphone, location and other device features switched off.
- HTTPS only, enforced by the host.
- Dependencies are audited on every pull request and before every deploy (`pnpm audit`), the lockfile is frozen, and builds come from a clean install on GitHub's runners.
- An "About and privacy" page for parents covers what the app stores (saves on the device only), what it never does, and how to delete everything.
- The host keeps its own standard request logs (IP addresses), as every website does. The About page mentions it.

**How a deploy happens.** Deploys are deliberate, never automatic from work in progress, and never from a merge (Shan, 2026-10-18). The full workflow is in `work/0057-ci-cd/README.md`.

1. Every change reaches `main` through a pull request. Each pull request gets its own preview link behind Cloudflare Access, and merges only when the `ci-ok` check is green.
2. When `main` is ready and the security review is clean, Shan tags it (`git tag -a v1.0.0 -m …`) and pushes the tag.
3. The release workflow checks that the tag is on `main`, runs every check again on that commit, deploys the tested build to production with `wrangler pages deploy`, and creates a GitHub Release. Cloudflare never builds anything and is never connected to the repo.
4. We open the live link on each device and check that it installs, plays offline and keeps its saves.
5. To roll back, use the Cloudflare dashboard's "Rollback to this deployment" (instant), or re-run the release workflow from an older tag. If the newer release raised a save version, roll forward with a fix instead.

**Feedback from invited players.** It happens outside the game: a short form or an email to Shan. The game itself never collects anything.

## Waiting for Shan (do together, one by one)

- Create the hosting account (Cloudflare Pages, plus Cloudflare Access for invite-only), and choose a private link or invite-only. The steps for the Pages project, the API token, the repo secrets and the Access application are in `work/0057-ci-cd/README.md`.
- Push each task branch to GitHub and open its pull request; merge on a green `ci-ok`.
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
