# Maker Studio — Security review and local pen test

Roadmap task 10, local part. Branch `task/0055-security-review`, 2026-10-18. Threat model: `threat-model.md`. ZAP reports: `zap/`.

**Scope.** Everything that needs neither Shan's API keys nor the live site. Strix and Alibaba Open Code Review need Shan's MiniMax key and are pending.

**Result.** No high or medium findings. Eight low findings: seven fixed, one (F9) closed by an Access setting on deploy day. Informational ZAP alerts explained below. Deploy-day checks remain before any invite.

**Adversarial review.** F1 was revised and F9–F12 were added by an adversarial review of the first draft of this task. The review dropped `Cross-Origin-Embedder-Policy` again, made the fuzz runner see throws that `parseSaveWith` catches, added self-tests for the runner, and wrapped the About page's storage clearing.

## Findings

| #   | Severity | Finding                                                                                                                                                                                                                                                                                                                                                                                                                           | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1  | Low      | No `Cross-Origin-Resource-Policy` (ZAP 90004, `zap/baseline-before.md`). Another site could pull our scripts, styles or icons into its own page as `no-cors` sub-resources, bringing their bytes into its process.                                                                                                                                                                                                                | **Fixed.** `public/_headers` sends `Cross-Origin-Resource-Policy: same-origin` on every path. `Cross-Origin-Embedder-Policy` is deliberately not sent: with a CSP of `'self'` it blocks nothing, and its only effect is cross-origin isolation, which the app does not use (see the threat model). Both pinned in `tooling/releaseFiles.test.ts` and `e2e/release/install.spec.ts`. All release specs pass on Chromium, Android, Chromebook and WebKit iPhone/iPad, both with and without COEP. The ZAP scans in `zap/` were taken with COEP on; without it, ZAP 90004 again lists COEP as missing on the 3 HTML pages, which is accepted. |
| F2  | Low      | A damaged-save message could quote a stored key of any length: `recordOf` put the raw key in the error path shown on the slot card. Fuzzing produced 20,000-character messages (Thrift-Flip `activeRun.cutTraces`, Workshop `activeRun.sanding`). React escapes it, so this is screen flooding, not script injection.                                                                                                             | **Fixed at the root.** `src/engine/parse.ts` cuts keys to 40 characters plus "…". Test in `src/engine/parse.test.ts`; the fuzz runner fails on any message over 2,000 characters.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| F3  | Low      | A migration or parser that throws would escape `parseSaveWith`. None does today (210,231 fuzz cases), but nothing guaranteed it.                                                                                                                                                                                                                                                                                                  | **Fixed (defence in depth).** `src/engine/saveEnvelope.ts` returns "The save file is damaged and could not be opened." and keeps the error in `thrown` (see F10). Test in `src/engine/saveEnvelope.test.ts`.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| F4  | Low      | `readCutDraft` looked up `book.drafts[cut]`, so a cut named `constructor` returned `Object`. Not reachable today; cut ids come from content.                                                                                                                                                                                                                                                                                      | **Fixed.** `Object.hasOwn` check; new `src/games/jewellery/ui/cutDraft.test.ts`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| F5  | Info     | `vite preview` answered CORS for `localhost` origins (`OPTIONS` 204, all methods allowed). Local only; Cloudflare Pages sends no CORS for static files.                                                                                                                                                                                                                                                                           | **Fixed.** `vite.config.ts` `preview: { cors: false }`. `OPTIONS` now 404, no `Access-Control-*` headers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| F6  | Info     | The preview serves `/_headers` as a file. Its content is not secret.                                                                                                                                                                                                                                                                                                                                                              | **Accepted locally.** Deploy day: confirm Pages doesn't serve it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| F7  | Info     | Unknown paths answer 200 with the studio page; under `/assets/*` that answer is `immutable`.                                                                                                                                                                                                                                                                                                                                      | **Accepted.** Asset names are content hashes and never reused, and the service worker never stores it (`integrity.spec.ts`). Routes are all `#/`, so a real `404.html` is possible later.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| F8  | Info     | HSTS is sent over the plain-HTTP preview. Browsers ignore it there. The preview drops `upgrade-insecure-requests` by design (`overPlainHttp`).                                                                                                                                                                                                                                                                                    | **Expected locally.** Check both on the live HTTPS address.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| F9  | Low      | Another site can learn whether this browser is signed in to Access. `CF_Authorization` is `SameSite=None` by default, so cross-site sub-requests carry it. CORP does not stop this; it changes the signal. With CORP, a cross-site `fetch(…, { mode: "no-cors" })` of our file fails when signed in and succeeds when Access answers; without CORP, an icon `<img>` loads only when signed in. Reproduced in Chromium and WebKit. | **Open until deploy day.** Set the Access application's cookie to `SameSite=Lax` (Strict can loop on sign-in), then repeat the probe from another site. Listed in the threat model and the deploy-day checks.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| F10 | Low      | F3's `catch` hid a throwing migration from the fuzz tests: they counted it as a refused save. An injected `TypeError` in ADEEVA's version 1 migration passed `src/games/adeeva/core/saveFuzz.test.ts`, and the migration tests showed only "damaged" with no stack.                                                                                                                                                               | **Fixed.** The failed result keeps the error in `thrown`; `fuzzSaves` reports it as "threw … inside the loader", and test failures print it. Re-running with the injected bug now fails the ADEEVA fuzz test.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| F11 | Low      | The fuzz runner itself had no tests, and the report said each case "never hangs" without saying what enforces it.                                                                                                                                                                                                                                                                                                                 | **Fixed.** New `src/engine/saveFuzz.test.ts` checks that the generator is seeded and that the runner reports throws (caught or not), long messages, saves that change on reload, broken play and prototype changes. Hangs: Vitest fails any fuzz test that runs past its 60 or 120 s limit (checked: it fails a synchronous test that overruns), and the slowest committed case takes about 35 ms. A true endless loop would stall the run rather than fail it; the engine layer bans clocks, so there is no per-case timer.                                                                                                               |
| F12 | Low      | The About page's **Delete everything** called `localStorage.clear()` unwrapped. When the browser blocks storage (cookies blocked), the click threw and the page never reloaded.                                                                                                                                                                                                                                                   | **Fixed.** `src/studio/AboutPage.tsx` wraps the clearing; the reload always follows.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## 1. Threat model

See `threat-model.md`.

## 2. Code review: injection and unsafe parsing

| Pattern                                                                                                                                        | Result                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `createContextualFragment`, `DOMParser`, `srcdoc` | None in app code; the only hits in `dist/` are inside React DOM.                                                                                                                                                                                                                       |
| `eval`, `new Function`, string `setTimeout`/`setInterval`                                                                                      | None in source or build.                                                                                                                                                                                                                                                               |
| `javascript:` URLs, `window.open`                                                                                                              | None.                                                                                                                                                                                                                                                                                  |
| Dynamic `href`/`src`/`style`                                                                                                                   | `href` values are fixed routes (`routeHash`) or `#id` references to the component's own SVG; SVG `url(#…)` fills use `useId`. Nothing is built from stored data; colours come from catalogue ids checked against fixed lists.                                                          |
| Navigation                                                                                                                                     | `useStudioRoute` only navigates to `routeHash(parseRoute(hash))`, a whitelist. `signInAgain` goes to the fixed `/?signin=1`. No open redirect.                                                                                                                                         |
| `postMessage` / `message`                                                                                                                      | The page sends `{type:"SKIP_WAITING"}` to its own worker and has no `message` listener. The worker accepts only that exact message, and only same-origin pages can message a service worker.                                                                                           |
| `JSON.parse`                                                                                                                                   | Three sites, all in `try`: `saveEnvelope.ts`, `storedJson.ts`, `cutDraft.ts`.                                                                                                                                                                                                          |
| Prototype pollution                                                                                                                            | `objectOf` copies known keys only; `recordOf` and migrations use `Object.fromEntries` and spread, so `__proto__` stays an own data property. Look-ups use `Object.hasOwn`, `find` or `includes`. No `Object.assign` or deep merge of parsed data.                                      |
| Every storage read is validated                                                                                                                | Game slots (`createSlotStore` plus each game's `parseSave`, all seven games), raw slots (`earnedReputation`, `profileFromSave`), `studio.profile`, `studio.playtime`, `adeeva.settings`, `<game>.lastSlot` (exactly `1`/`2`/`3`), `chef.sound` (exactly `"off"`), the jewellery draft. |
| Bad save can't blank the screen                                                                                                                | Parsers never throw (fuzzed, and guarded by F3). A damaged slot shows "Damaged save" while the others load. `ViewLoadBoundary` catches render errors and offers Back to studio and Reload.                                                                                             |

## 3. Fuzzing

Seeded generator on the game RNG (`src/engine/hostileJson.ts`) and a runner (`src/engine/saveFuzz.ts`), no new dependency. Inputs:

- fixed hostile texts: empty, `null`, BOM, broken braces, `NaN`, `1e999`, bad `schemaVersion`, `__proto__`/`constructor.prototype` payloads, 200,000-deep nesting, a 3 MB string, a 100,000-item array;
- random trees from hostile keys and leaves (`__proto__`, `constructor`, a 20,000-character key, markup, `javascript:`, a lone surrogate, `-0`, ±1e21, `MAX_VALUE`, `MAX_SAFE_INTEGER+2`, ±Infinity, `NaN`, 1 MB strings, 50,000-deep nesting);
- valid saves from real playthroughs with one field mutated: hostile leaf, random tree, removed, nudged, wrong type, polluted, foreign key, duplicated or grown to 5,000 items, or an older `schemaVersion` so migrations run on current data;
- truncated and byte-flipped copies of the valid saves.

Each case must load or be refused with a message of 2,000 characters or fewer. It must never throw (a throw that `parseSaveWith` catches still counts, through `thrown`), never change `Object`/`Array`/`Function`/`String.prototype`, and finish inside the test's 60 or 120 s limit, which Vitest enforces (the slowest committed case takes about 35 ms). Loaded saves must reload to identical text and survive `endDay`. The generator is seeded from the game RNG, so every run tries the same cases; `src/engine/saveFuzz.test.ts` checks that, and that the runner catches each kind of failure.

| Target                                                                     | Test                                      | Committed                             | Deep run                                                                                                 |
| -------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 7 game save loaders and migrations                                         | `src/games/*/core/saveFuzz.test.ts`       | 533 per game                          | 30,033 per game (210,231 total): 0 failures after F2. Each game loaded 4,272–4,830 and refused the rest. |
| Profile, settings, play time, slot store, reputation, blocked/full storage | `src/studio/storageFuzz.test.ts`          | 333 texts per reader, 3,000 raw saves | —                                                                                                        |
| Jewellery cut drafts                                                       | `src/games/jewellery/ui/cutDraft.test.ts` | 633 texts × 5 cut ids                 | —                                                                                                        |

Before F2 was fixed, the deep run failed with `foreign key at activeRun.cutTraces: rejection message is 20079 characters long`. The committed 500-round seeds do not reach that case, so F2 is pinned by `src/engine/parse.test.ts` instead.

Cost: the fuzz files add about 4 s of test time, spread across workers, and `pnpm test` takes as long as before (about 20 s on Shan's PC). The fuzz files peak at about 85 MB of heap and pass with a 128 MB heap limit. `JSON.parse` in V8 does not recurse, so the 200,000-deep texts parse even with a quarter of the normal stack.

## 4. Secret scan

- `gitleaks detect --source . --log-opts="--all" --redact`: 57 commits, every branch, about 11.5 MB. No leaks.
- `gitleaks dir . --redact`: about 10.4 MB. No leaks.

`dist/` holds 188 files. Outside `/assets/` there are only `_headers`, `index.html`, `manifest.webmanifest`, `sw.js` and 5 icons. There are no `.map` files, `sourceMappingURL` comments, `.env` or `VITE_` values, `debugger`, `console.log`, Vite dev client, `localhost`, `127.0.0.1` or `0.0.0.0`. The only absolute URLs are `www.w3.org` namespaces and React's `react.dev` error-decoder link text, neither of which is fetched.

## 5. Dependencies and licences

- `pnpm audit` and `pnpm audit --prod`: no known vulnerabilities.
- `pnpm licenses list --prod`: react, react-dom, scheduler (all MIT).
- All licences: MIT 136, Apache-2.0 18, ISC 9, BSD-2 6, BSD-3 2, BlueOak 1, CC-BY-4.0 1 (`caniuse-lite`, build data), MPL-2.0 2 (`lightningcss`, build only).
- Bundle contents, from a throwaway source-map build (deleted): react, react-dom, scheduler, plus 1,894 app source files.

## 6. OWASP ZAP (local preview)

Setup: `vite build`, then `vite preview --outDir dist --host 127.0.0.1 --port 6220`, with `MAKER_PORT=5220` (Playwright derives `MAKER_PORT+1000`). The preview serves the real `_headers`. Vite blocks the `host.docker.internal` host name with 403, so it was allowed via `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`. Image `ghcr.io/zaproxy/zaproxy:stable` (2.17.0), AJAX spider on.

| Run                        | Report                  | FAIL | WARN | PASS |
| -------------------------- | ----------------------- | ---- | ---- | ---- |
| Baseline before fixes      | `zap/baseline-before.*` | 0    | 6    | 64   |
| Baseline after F1          | `zap/baseline.*`        | 0    | 5    | 65   |
| Full active scan (77 URLs) | `zap/full-scan.*`       | 0    | 1    | 148  |

Triage:

- **COEP/CORP missing (90004):** CORP real, fixed by F1. These scans were taken while COEP was still sent; it is now left off on purpose (F1), so ZAP will list COEP as missing on the 3 HTML pages again. Accepted.
- **Timestamp Disclosure (10096), `1831565813`:** false positive. It is the RNG constant `0x6d2b79f5`.
- **localStorage information (120000):** by design; saves live on the device.
- **Base64 Disclosure (10094):** false positive; chunk file names in the preload map.
- **Modern Web Application (10109):** expected; the AJAX spider was on.
- **Sec-Fetch-\* missing (90005):** false positive; these are request headers the browser sends, not the server.
- **Storable/cacheable (10049):** intended caching.
- **HSTS over HTTP and the dropped `upgrade-insecure-requests`:** local only (F8).

## 7. Manual checks (local preview)

- **Headers:** every response, including unknown and traversal paths, carries CSP, HSTS, nosniff, no-referrer, DENY, COOP, CORP and Permissions-Policy (and, after the review, no COEP).
- **Caching:** `no-cache` on `/`, `/index.html`, `/sw.js` and the manifest; `immutable` for a year on `/assets/*`.
- **Service worker:**
  - registered with `scope: "/"` and `updateViaCache: "none"`;
  - stores only precache entries that are 200, `basic` and not redirected, fetched with SRI and `redirect: "error"`, and never stores anything at runtime;
  - skips other origins, non-GET, `Range` and `/cdn-cgi/`;
  - covered by `install.spec.ts`, `integrity.spec.ts` ("never stored", damaged file) and `noNetwork.spec.ts`.
- **Directory listing:** off. `/assets/` and `/icons/` return the studio page.
- **Stray files:** `/src/main.tsx`, `/package.json`, `/.git/HEAD`, `/node_modules/...` and traversal paths all return the studio page.
- **Manifest:** `id`, `start_url` and `scope` are `/`; standalone; three same-origin PNG icons; no protocol handlers or share targets.
- **`?signin`:** `/?signin=1`, `=https://evil.example/`, `=<script>`, `//evil.example/?signin=1` and `/index.html?signin=1` all return 200 with the unchanged page, no `Location` header and nothing reflected.
- **Methods:** POST and TRACE return 404; OPTIONS returns 404 after F5.
- **CSP and navigation:** `noNetwork.spec.ts` plays ADEEVA, Six Kitchens and the About page under the strict CSP with zero violations on Chromium and WebKit, with CORP (and with COEP before the review dropped it).

## Commands run

```text
pnpm typecheck / pnpm lint / pnpm test                       clean; 291 files, 1,522 tests
vitest run saveFuzz (30,000 rounds once, then 500)           0 failures after F2
gitleaks detect --source . --log-opts="--all" --redact       no leaks
gitleaks dir . --redact                                      no leaks
pnpm audit ; pnpm audit --prod ; pnpm licenses list [--prod]
MAKER_PORT=5220 pnpm build ; vite preview ... --port 6220
zap-baseline.py / zap-full-scan.py -t http://host.docker.internal:6220/ -j -a
curl probes: headers, paths, methods, CORS, ?signin
MAKER_PORT=5221 playwright test e2e/release --workers=2      39 passed (twice)
review: Playwright probe in Chromium and WebKit             COEP on: crossOriginIsolated, icons load;
                                                             cross-site <img> blocked by CORP; no-cors oracle (F9)
review: injected throwing migration                          caught by the ADEEVA fuzz test only after F10
```

Preview servers and ZAP containers stopped; `dist/`, `dist-e2e/` and `test-results*` deleted.

## Still to do

**For Shan:**

- Strix against the preview, then the live address, and Alibaba Open Code Review over the release diff, once the MiniMax key is provided.
- `/code-review ultra`, which Shan starts.

**Deploy day (live site):**

- **ZAP baseline and full scan of the live URL:** once with an Access service token or session, and once without, to confirm every path goes to Access.
- **Access bypass attempts:**
  - direct asset URLs, `GET` and `HEAD /sw.js`;
  - `*.pages.dev` preview and branch URLs (the policy must cover `<project>.pages.dev` and `*.<project>.pages.dev`);
  - `/cdn-cgi/` and an expired cookie;
  - a cached service worker after removal from the policy;
  - `CF_Authorization` cookie flags: `HttpOnly`, `Secure`, and `SameSite=Lax` set in the Access application (F9). Then repeat the cross-site probe from another site: a `no-cors` fetch and an icon `<img>` must look the same signed in and signed out.
- **Headers as Cloudflare serves them:**
  - CSP including `upgrade-insecure-requests`, HSTS over HTTPS, COOP, CORP, no COEP, and the caching rules;
  - `/_headers` not served;
  - no HTML rewriting (Web Analytics, Rocket Loader, email obfuscation, Bot Fight Mode).
- **`?signin` redirects at the host:** `//evil.example/?signin=1`, `/index.html?signin=1` and trailing-slash variants never send a `Location` to another site.
- **iOS installed-app Access sign-in:** iPhone and iPad, plus offline play after the session expires and the Signed out mark.
