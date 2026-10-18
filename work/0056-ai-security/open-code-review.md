# Alibaba Open Code Review: raw output

Tool output, unedited except for flattening whitespace. LLM findings are unverified here; the verdict for each one is in `triage.md`.

- **Tool:** Open Code Review v1.13.1 (`opencodereview-windows-amd64.exe`, GitHub release, SHA-256 checked against the release's `sha256sum.txt`).
- **Model:** MiniMax-M3 on the MiniMax OpenAI-compatible endpoint (`https://api.minimax.io/v1`), through the `OCR_LLM_*` environment variables. Telemetry off. Isolated home folder, so nothing was written to `~/.opencodereview`.
- **Command shape:** `ocr scan --path <31 files> --concurrency 4 --timeout 30 --format json --audience agent --background <app description> --output scan.json` (default effort `medium`, 2 review rounds).
- **Files:** `index.html`, `public/_headers`, `vite.config.ts`, all of `src/offline/` and `tooling/` (tests excluded by the tool), `src/engine/parse.ts`, `saveEnvelope.ts`, `profile.ts`, `src/studio/storedJson.ts`, `slotStore.ts`, `profile.ts`, `AboutPage.tsx`, `SignedOutMark.tsx`, `useStudioRoute.ts`, `src/games/jewellery/ui/cutDraft.ts`, and the save parsers of two games: ADEEVA (`save.ts`, `saveMigrations.ts`, `gameStateParser.ts`) and Six Kitchens (`save.ts`, `saveMigrations.ts`, `gameStateParser.ts`, `runParser.ts`).
- **Run:** status `success`, 31 files, 130 comments, 1,415,223 tokens, 12m16s.
- **By severity (tool's own rating):** critical 2, high 35, medium 54, low 39.
- **By category:** bug 54, maintainability 48, security 18, performance 5, style 4, documentation 1.

## Findings

**O001** · medium · security · `index.html:5-6`

There is no `<meta http-equiv="Content-Security-Policy">` fallback. The requirements state strict CSP is set via `public/_headers` (and mirrored by a Vite preview plugin), but if this file is ever loaded from a host that does not inject those headers (local `file://` debugging, an alternate deployment target, or a misconfigured preview), the app — which parses untrusted save/import JSON — runs with zero XSS containment. Consider a restrictive meta-CSP (`default-src 'self'; script-src 'self'; ...`) as defense-in-depth so CSP is enforced everywhere the HTML is served from, not only behind Cloudflare/Pages.

**O002** · high · security · `index.html:13`

`crossorigin="use-credentials"` on the webmanifest forces the browser to send cookies/HTTP credentials with the manifest request. For a same-origin install this is unnecessary: it leaks credentials to any sub/CDN host that ever serves `/manifest.webmanifest`, and the install flow can silently fail if that origin's CORS configuration isn't set up to allow credentials. Drop the attribute unless there's a documented cross-origin reason for it.

**O003** · low · maintainability · `index.html:17-20`

No `lang` on `<html>` to do with, but no `<noscript>` fallback either: if the module script fails to load or the user's environment disables JS, the user sees a blank page with no explanation. For a children's offline PWA where the install path may have very limited diagnostics, add a small `<noscript>` block inside `<body>` so the failure mode is at least visible.

**O004** · high · security · `index.html:19`

The requirements state the build is served with SRI via the service worker, but the entry `<script>` here ships without an `integrity` (and no `crossorigin`) attribute. This is the highest-impact asset on the page — if it's the one place SRI isn't applied, a tampered `index.html` plus compromised `main.tsx` response would bypass everything else. Add `integrity="<sha384-...>"` (crossorigin="anonymous") computed at build time, or document explicitly that SRI is only enforced on precached sub-resources and not on the HTML/entry script.

**O005** · high · security · `public/_headers:0`

`form-action 'none'` forbids every form submission on the origin (including GET forms, password resets, OAuth redirects, and search boxes). For a fully offline PWA this is defensible, but verify the app has zero forms — including dynamically built ones from settings dialogs, debug menus, or future features — before shipping. If any form is ever added, every user must redeploy to be unblocked, so consider `'self'` or specific origins instead.

**O006** · high · bug · `public/_headers:0`

`style-src 'self'` (and the implied `style-src-attr 'self'`) blocks inline `<style>` blocks and `element.style = ...` assignments that React, MUI, Mantine, styled-components, Vite's HMR, and many UI libs emit at runtime. With a React/Vite PWA this policy will almost certainly break the UI in production. Either restrict via `style-src-attr 'none'` and add hashes/nonces for known inline `<style>` blocks, or whitelist via `'unsafe-inline'` + `'unsafe-hashes'` if runtime-generated CSS cannot be avoided.

**O007** · high · security · `public/_headers:2`

CSP has no `report-to` / `report-uri` directive and no matching `Reporting-Endpoints` header. Violations, mixed-content probes, and attempted XSS payloads will be silently dropped by the browser, leaving the team blind to misconfigurations or active attacks. Add a `report-to` endpoint (and `Report-To`/`Reporting-Endpoints` headers) pointing at a collector URL so violations surface during rollout of new hashes/directives.

**O008** · medium · maintainability · `public/_headers:3`

`Strict-Transport-Security` is missing the `preload` directive. Without it the site cannot be submitted to the browser HSTS preload list, which is the only way to get HSTS protection on first contact (before any response is received). For a long-lived PWA where users may visit from history/shortcuts, add `; preload` and submit at https://hstspreload.org after confirming all subdomains are HTTPS-only.

**O009** · medium · security · `public/_headers:17-18`

Only `/sw.js` is explicitly marked `no-cache`. If the build also emits workbox companion files (e.g. `/workbox-*.js`, `/sw-register.js`, `registerSW.js`) or if Vite's PWA plugin emits the SW under a hashed name, those files will fall through to the default `no-cache` from `/` — which is fine — but a separate hash-named SW (e.g. `/sw-abc123.js`) bypasses the explicit rule entirely and would be served as `/assets/*` `immutable`, breaking SW updates. Confirm the exact emitted filename(s) and add explicit entries; also consider no-cache'ing any precache manifest JSON such as `/precache-manifest.*.js` so deploys are picked up immediately.

**O010** · medium · security · `public/_headers:23-24`

`/assets/*` is `immutable` for one year. The strategy is only safe if every file under `/assets/` is content-hashed in its filename. If anything un-hashed lands there (videos, audio, fonts without hashes, manual `public/` copies, source maps, debug screenshots, favicons, or `index.html` accidentally), users will be permanently stuck on the old copy with no way to refresh — and since the SW precaches the build with SRI, an un-hashed stale asset will also produce an SRI mismatch and a hard error. Add a build-pipeline assertion that `/assets/` only contains hashed filenames, or narrow the rule to a stricter glob such as `/assets/*.{js,css,woff2}`.

**O011** · low · bug · `src/engine/parse.ts:9-11`

`failed` unconditionally prepends `${path}:` to the message, so root-level errors (where `path` is `""`) render as `": expected a number"` with a stray leading colon and space. The whole API assumes non-empty paths. Either insert a space only when `path` is non-empty, or pass a sentinel root path ("$" or similar) consistently across callers so the error formatting is well-defined.

**O012** · medium · bug · `src/engine/parse.ts:19-21`

`isPlainObject` only rejects `null` and arrays. It does **not** verify that the prototype is `Object.prototype`, so values like `new Date()`, `new Map()`, `new Set()`, `RegExp`, or any class instance pass the check. Downstream `objectOf`/`recordOf`/`fixedRecordOf` then iterate `Object.keys`/`Object.entries` on these and produce an effectively empty result while still type-narrowing to `Readonly<Record<string, unknown>>`. For a module that exists specifically to validate untrusted input (per the parser's purpose), this is the wrong definition of "plain object". Use `Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null` (or a `toString.call(input) === '[object Object]'` check) so non-plain objects are rejected up front.

**O013** · low · bug · `src/engine/parse.ts:47-57`

`rangeParser` and `integerRangeParser` do not validate that `min <= max`. A caller that accidentally swaps the arguments (or passes a constant derived from a config that becomes inverted) constructs a parser that rejects every finite number forever, with no compile-time or runtime signal. Guard against inverted bounds so misuse fails fast at construction rather than silently producing a never-succeeding parser.

**O014** · medium · bug · `src/engine/parse.ts:98-110`

Both `objectOf` and `fixedRecordOf` silently ignore any keys in the input that are not part of the declared shape/keys, while the sibling `recordOf` rejects unknown keys via `isKey`. For an untrusted-input parser this inconsistency is a data-integrity hazard: a corrupted or malformed save containing extra fields is accepted without notice, and callers cannot tell whether the unused fields were absent or simply dropped. Consider adding an option (or a separate strict variant) that fails on unknown keys, so the three object-style combinators behave consistently.

**O015** · low · maintainability · `src/engine/parse.ts:146-151`

`keyedRecordOf` is just `recordOf` with an unsafe `as` cast. The return type `Readonly<Partial<Record<K, T>>>` is _almost_ accurate but obscures a real semantic: a key that appears in the input is mandatory and validated (not "optional"), and keys outside `K` are absent (not "optional either"). More importantly, the cast silences any future signature change in `recordOf`. Prefer a structural wrapper that keeps the type information intact and propagates errors, e.g. by re-exporting `recordOf` typed directly via overloads rather than an `as` cast.

**O016** · low · maintainability · `src/engine/profile.ts:20`

`profileIssues` validates the trimmed `name` but does not return it; the untrimmed `settings.name` is what callers will read from the original object. Callers must remember to `trim()` again, otherwise leading/trailing whitespace ends up stored or rendered. Either return the sanitized settings alongside the issues, or document the trimming requirement so callers do not store `settings.name` verbatim.

**O017** · medium · bug · `src/engine/profile.ts:22`

Name length uses `String.prototype.length`, which counts UTF-16 code units rather than Unicode code points or grapheme clusters. A single emoji (e.g. `🎉`) is counted as 2 units and a ZWJ family sequence like `👨‍👩‍👧‍👦` is 11 units, so `MAX_NAME_LENGTH = 24` is effectively bypassed by Unicode input and may surprise users. Consider `[...name].length` or a grapheme-cluster aware library for the limit check.

**O018** · low · maintainability · `src/engine/profile.ts:23-26`

The runtime guards `Number.isInteger`, `isAvatarLook`, `TRAIT_IDS.includes`, and `DIFFICULTY_IDS.includes` duplicate compile-time type guarantees on a `ProfileSettings` parameter. They are only meaningful when the function is called with values parsed from JSON or other untrusted input that has been cast to `ProfileSettings` — which would silently violate the type contract. If untrusted input is the realistic flow (project uses localStorage JSON envelopes and file import), prefer a dedicated parse function with explicit `unknown -> ProfileSettings` narrowing instead of relying on these hidden runtime checks behind a typed signature.

**O019** · medium · bug · `src/engine/saveEnvelope.ts:33`

`migrateRaw` performs only a shallow spread (`{ ...migration(current), schemaVersion: version + 1 }`), so nested values from a previous migration step are shared by reference with the next step's `current`. A migration that mutates nested fields of its input will also mutate the caller's original `raw` (the parsed JSON object), violating the `Readonly` contract and corrupting untrusted input if it is later inspected or retained. Deep-clone the migration result (e.g., `structuredClone`) before chaining the next step, or document that migrations must be pure.

**O020** · medium · security · `src/engine/saveEnvelope.ts:55-57`

The `thrown` field on the failure branch leaks the raw exception object (which may carry stack traces, internal paths, or untrusted message text from a hostile save) up to every caller of `parseSaveWith`. Since saves are fully untrusted input, a crafted migration/parse throw can inject attacker-controlled strings into UI surfaces or logs. Either omit `thrown` from the public result type or restrict it to development builds, and avoid interpolating raw `thrown`/`outcome.error` text into user-facing messages without sanitisation.

**O021** · high · bug · `src/engine/saveEnvelope.ts:60-62`

`serializeSave` JSON.stringifies the state verbatim with no `schemaVersion` envelope, so its output cannot be fed back into `parseSaveWith` — `parseSaveWith` will reject it with "The save file has no version number." This breaks the symmetric save/load contract implied by the rest of the file. Either accept a `SaveCodec<S>` (or at least a version) and wrap with `{ schemaVersion: codec.version, ...state }`, or document that callers must pre-wrap the state. As shipped, the round-trip is silently broken.

**O022** · low · maintainability · `src/engine/saveEnvelope.ts:60-62`

`serializeSave<S>(state: S)` accepts any `S`, including primitives (`string`, `number`, `null`). `JSON.stringify(42)` yields `"42"`, which `parseSaveWith` will then reject as "does not contain a game". Tighten the signature to require an object-like state (`S extends Record<string, unknown>`) or, if the fix above is taken, `S extends Record<string, unknown>` together with the codec parameter, so misuse is caught at compile time.

**O023** · medium · bug · `src/games/adeeva/core/gameStateParser.ts:79`

`coins: integerParser` accepts any integer including negative values, while sibling fields `reputation` and `gigsDelivered` use `countParser` (`integerRangeParser(0, Number.MAX_SAFE_INTEGER)`) which enforces non-negativity. This inconsistency lets crafted saves set negative currency. For a children's game where coins represent spending money, negative values are almost certainly unintended and could cause display/UI issues downstream. Consider using `countParser` or explicitly bounding with `integerRangeParser`.

**O024** · high · bug · `src/games/adeeva/core/gameStateParser.ts:90`

Run IDs are not validated as `run-N` strings. `deliveredRunIds: arrayOf(stringParser)` accepts any string, and the `runNumbersBelowNext` refinement uses `runNumber` which returns 0 for any string not matching the `run-` prefix (see `idNumber` in `src/engine/idNumber.ts`). Since `0 < nextRunNumber` is always true (nextRunNumber is parsed via `dayParser` with min 1), malformed IDs trivially pass the 'run counter above every saved run' invariant. A crafted save with `deliveredRunIds: ["garbage"]` (or `"__proto__"`, extremely long strings, etc.) would be accepted. Other games in this codebase validate run IDs explicitly: `src/games/chef/core/runParser.ts` and `src/games/workshop/core/runParser.ts` use `refined(stringParser, (id) => /^run-\d+$/.test(id), "a run id")`. The same validation should be applied to `deliveredRunIds`, log entry `runId` (see `logEntryParser` in `src/games/adeeva/core/resultParsers.ts` which uses plain `stringParser`), and `dressRunParser`'s `id` field.

**O025** · high · security · `src/games/adeeva/core/gameStateParser.ts:96-100`

The `runNumbersBelowNext` refinement is correct only because all parsed inputs are strings and `runIdsBelow` does its own prefix matching — but the underlying invariant is weaker than it looks. Because `runNumber("anything-not-matching")` returns 0 and `nextRunNumber` is always >= 1, the `every(id => runNumber(id) < nextRunNumber)` check passes for _every_ malformed ID. The check only catches IDs whose numeric run number is >= nextRunNumber; it does not catch garbage. Combine this with the lack of run-ID format validation (see comment on `deliveredRunIds`) and an attacker can freely inject arbitrary strings into the run history. Adding a `runIdParser` (`refined(stringParser, (id) => /^run-\d+$/.test(id), "a run id")`) and using it for `deliveredRunIds`, `logEntry.runId`, and `dressRunParser.id` closes this gap.

**O026** · low · maintainability · `src/games/adeeva/core/save.ts:12`

The `serialize` export uses a verbose type annotation `export const serialize: (state: GameState) => string = serializeSave;`. The annotation is redundant because `serializeSave` already provides the exact `(state: GameState) => string` signature, and TypeScript will infer it. Additionally, this annotation could mask future signature drift in `serializeSave` (e.g., if it becomes async or accepts optional options) by forcing a manual update here. A simpler form such as `export const serialize = serializeSave;` or `export { serializeSave as serialize };` is cleaner and keeps the types derived from the source of truth.

**O027** · medium · maintainability · `src/games/adeeva/core/saveMigrations.ts:6-10`

Silent structural fallback in `addAssistantPaidThroughDay`: when `raw.studio` is missing or not a plain object, the migration returns `{...raw}` unchanged with no logging. An imported/tampered save can therefore load with `assistantPaidThroughDay` simply absent, after which downstream code (paid-through checks, calendar money logic) silently misbehaves. Surface the structural miss via the existing SaveParseResult error channel (e.g. throw from the migration and let `parseSaveWith`'s try/catch convert it to a user-facing error) or at least log a warning.

**O028** · low · documentation · `src/games/adeeva/core/saveMigrations.ts:12`

Domain-meaning magic number: `LEGACY_SEAM_TICKS = 247` clearly represents the maximum ticks for a perfectly-completed legacy seam (it's the denominator behind the legacy progress→tick derivation), but that intent is not captured in the file. A future maintainer tuning tick ceilings or chasing a tick-balance bug will have no clue where 247 came from. Add a short comment describing the role and the calibration rationale, and consider whether it should live next to the `BoundedShare`/progress constants rather than buried in a migrations file.

**O029** · high · bug · `src/games/adeeva/core/saveMigrations.ts:19-24`

Data preservation issue in `countSeam` → `legacySeamCounts`: the result is a freshly constructed object containing only `{progress, ticks, insideTicks, assisted}`. Any other properties on the incoming legacy seam (e.g. future fields, or a pre-existing `assisted` boolean carried by an alternate legacy format) are silently dropped, and `assisted` is unconditionally forced to `false`. Spread the original seam into the result so unknown fields survive and only the missing/new fields are filled in: `{ ...seam, ...counts }`. As-is, re-running migration 2 on a partially-migrated or non-standard save corrupts player data with no signal.

**O030** · medium · maintainability · `src/games/adeeva/core/saveMigrations.ts:26-31`

Silent structural fallback in `countSeamTicks`: the `!isPlainObject(run) || !isPlainObject(run.seams)` guard bails out and returns `{...raw}` without logging. On an imported save whose `activeRun` or `seams` shape is wrong, this leaves the save loaded without tick counts but with no indication anything was skipped — the user just sees seams as '0/% complete' with no recovery path. Either throw (so `parseSaveWith` reports a clear damaged-save error) or log the structural miss so it is debuggable.

**O031** · high · bug · `src/games/chef/core/gameStateParser.ts:99-101`

`runNumber` silently relies on `idNumber` returning a non-positive sentinel (e.g. 0 or NaN) when the prefix doesn't match. `Math.max(idNumber(id, "run"), idNumber(id, "service"))` will yield that sentinel for any id whose prefix is neither "run-" nor "service-". The downstream `countersFit` check `runNumber(id) < state.nextRunNumber` will then happily accept an id that has nothing to do with a run or service. Verify `idNumber`'s behavior on non-matching prefixes and either (a) assert the prefix here, or (b) reject any id whose extracted number is the default sentinel, before using it in the `< nextRunNumber` comparison.

**O032** · medium · bug · `src/games/chef/core/gameStateParser.ts:103-106`

`countersFit` only verifies that each present id's runNumber is `< nextRunNumber`. It does not verify that `state.activeRun.id` and `state.service.id` are distinct when both are populated, nor that they individually match their kind (e.g. an id shaped like "service-3" attached to `activeRun` would still pass because `Math.max(idNumber(id,"run"), idNumber(id,"service"))` treats it as valid). Since this file is the trust boundary for untrusted JSON, consider asserting the id prefix matches the slot it occupies and that the two slots never collide.

**O033** · low · performance · `src/games/chef/core/gameStateParser.ts:115-121`

`orderDishesFit` is O(n²): for every entry it does `state.gigs.active.find(...)` (O(gigs)) and `state.orderDishes.filter(...)` (O(n)). With a long active order list this becomes wasteful, especially since the validation runs on every load/import of an untrusted save. Build a single `Map<gigId, number>` of current counts (and a `Map<gigId, Gig>` of active gigs) once and reuse them across the predicate.

**O034** · high · bug · `src/games/chef/core/gameStateParser.ts:134-138`

The function name promises "one thing at a time" but it does NOT reject the combination `testDay !== null && activeRun is cooking` (stage !== "done") when `service === null`. With `service === null` the first guard is skipped and `testDay === null || service === null` evaluates to `true`, so a save that simultaneously has an active test day and a live cooking run passes. Add a clause that also rejects when `testDay !== null && cooking`, e.g. `return state.testDay === null || state.service === null` plus an early-out that combines testDay with cooking.

**O035** · high · bug · `src/games/chef/core/runParser.ts:0`

The switch over `kind.value.kind` has no `default` branch and no `never`-based exhaustiveness check. If `RunPurpose["kind"]` is ever extended, this function silently returns `undefined`, which violates the `Parser<RunPurpose>` return type contract. Any malformed input whose `kind` fails the initial lookup already returns an error from `kind`; the real risk is the TypeScript-compile-time gap if a new variant is added — the compiler will not flag this switch as non-exhaustive. Add a `default` branch with a `never` assertion that returns a descriptive `failed(path, ...)` so future variants are caught at compile time and runtime.

**O036** · medium · bug · `src/games/chef/core/runParser.ts:51-58`

`tastePointParser` uses `arrayOf`, which accepts arrays of arbitrary length (see engine/parse.ts:85-96). The subsequent guard `outcome.value.length === 2 && x !== undefined && y !== undefined` re-validates shape that the `arrayOf` does not enforce. More importantly, the `x !== undefined && y !== undefined` half is dead code: `integerRangeParser` rejects non-integer inputs at parse time and never yields `undefined`, so when length === 2 the destructured values are guaranteed to be numbers. Either drop the redundant `undefined` checks (relying on `integerRangeParser`'s guarantees) or, if extra-paranoid validation is desired, unify the failure message with the path-aware format used elsewhere. Also: the success branch returns `[x, y]` as a fresh 2-tuple, but the original `outcome.value` could be a longer array — `arrayOf` happily accepted it; the current code is correct but the shape is obscured.

**O037** · high · bug · `src/games/chef/core/runParser.ts:121`

`sides` is a count field (pan-side selection, 0/1/2), but the code uses `rangeParser(0, 2)`, which is `refined(numberParser, ...)` and accepts any finite number — including 1.5, 0.7, or 1.999. Because the save layer treats these as JSON-untrusted input, a crafted save can inject fractional side counts that downstream index/branch logic likely treats as integers. Use `integerRangeParser(0, 2)` to match the integer semantics used for all sibling count fields (`tip`, `index`, `kindTips`, `savoury`, `pinches`, `tastes`).

**O038** · high · bug · `src/games/chef/core/runParser.ts:126`

`progress` is bounded 0–4 and named like an integer counter (stages of follow-the-leader), yet uses `rangeParser(0, 4)`, which accepts fractional values. A crafted save could persist e.g. `2.5` here, which downstream tick/loop logic probably rounds or indexes unsafely. Use `integerRangeParser(0, 4)` for parity with the integer-only count fields elsewhere in this module. The companion `ticks` and `insideTicks` already use `countParser` (integer), so this is an internal inconsistency.

**O039** · low · maintainability · `src/games/chef/core/runParser.ts:175`

The `refined` expectation string `"a run id"` is uninformative and grammatically odd. Other `refined` sites in the codebase typically describe what was expected (a format, a range, etc.). For consistency and to aid debugging of malformed saves, prefer something like `"a run id matching run-<digits>"` so the produced error reads naturally as `${path}: expected a run id matching run-<digits>`.

**O040** · low · maintainability · `src/games/chef/core/runParser.ts:181`

`mise` uniqueness is enforced only via the outer `refined` check `new Set(run.mise).size === run.mise.length`. If a save has duplicate ingredients, the parser still performs full nested work before failing. The engine already exposes `distinctListOf` / `distinctBy` for early-rejection parsing. Wrapping `arrayOf(ingredientIdParser)` with one of those helpers would fail fast with a clearer error path (e.g. `path.mise[3]` rather than the top-level "a dish run") and matches the established pattern in the parse library.

**O041** · low · maintainability · `src/games/chef/core/save.ts:12`

The `serialize` export is a 1:1 alias for `serializeSave` with no transformation. This creates two names for the same operation, doubling the surface area that has to be tracked when `serializeSave`'s signature changes. If the game module deliberately wants to own its own naming (so consumers don't depend on the engine's identifier), prefer `export const serialize = serializeSave;` without the explicit `(state: GameState) => string` annotation — let inference handle it, and add a narrowing annotation only if `serializeSave` is actually generic and needs to be constrained here.

**O042** · low · maintainability · `src/games/chef/core/saveMigrations.ts:0`

`pans: 1` and the `service.plan` defaults are unnamed magic literals inside a migration. Promote them to named constants (e.g. `V1_PANS`, `V1_PATH`, `V1_PEEKED`) so the migration is self-documenting and reviewers can tell at a glance which values are historical defaults vs. live gameplay tuning.

**O043** · high · bug · `src/games/chef/core/saveMigrations.ts:5-7`

`openService` short-circuits and returns the original `service` unchanged whenever `service.plan` is not already a plain object. For the very first migration (v0 → v1) the whole point is to introduce `service.plan` defaults, but pre-v1 saves that lacked `service.plan` (a likely real case) will be silently passed through with no `lampHoldSeconds`, `pans`, or `spotlight: null` applied, leaving the save in a broken state. Treat a missing plan as "needs initialization", not as a reason to abort the migration.

**O044** · medium · bug · `src/games/chef/core/saveMigrations.ts:5-7`

Migrations handle untrusted input (imported save files). When the outer `service` or `service.plan` fails the `isPlainObject` guard the original value is returned as-is with no logging and no error, so a crafted import can sneak malformed data past validation and crash later consumers. At minimum, surface the anomaly (e.g. throw or return a distinguishable sentinel) so `parseSaveWith` can reject the save rather than hand a half-migrated record to gameplay code.

**O045** · high · maintainability · `src/games/chef/core/saveMigrations.ts:9-14`

Migrations must preserve historical state. Importing the live `LAMP_HOLD_SECONDS` constant from `./serviceRail` means that any later tuning of that constant silently rewrites every already-migrated save the next time it is opened. Freeze a version-tagged literal (e.g. `V1_LAMP_HOLD_SECONDS = 20`) inside this migration module so old saves keep the value they were created with.

**O046** · medium · bug · `src/games/chef/core/saveMigrations.ts:14-16`

`addCareerPaths` is not idempotent: `path: null` overwrites any pre-existing `path`, and `peeked: []` wipes any history that may have already been recorded. The migration runner in `saveEnvelope.migrateRaw` chains migrations sequentially and stamps `schemaVersion` itself, so re-running this function on partially upgraded input (e.g. after a retry or version-detection edge case) will silently destroy player progress. Guard with "only set when key is absent" semantics.

**O047** · low · maintainability · `src/games/chef/core/saveMigrations.ts:18-20`

`SAVE_MIGRATIONS` only declares key `1`, but the surrounding runner (`migrateRaw`) expects migrations to chain sequentially from `fromVersion` to `toVersion - 1` and bumps `schemaVersion` after each call. Document the contract here (each entry transforms FROM version N TO N+1; the envelope stamps the new version) so the next contributor adding v2 does not double the version bump or reverse the direction.

**O048** · medium · bug · `src/games/jewellery/ui/cutDraft.ts:22-28`

Asymmetric validation: `isStrokes` enforces the 4000-point cap only on read, while `writeCutDraft` accepts any `CutStrokes` and persists it without re-validating. An oversized draft is stored successfully and then silently dropped on the next `readCutDraft` (the `isStrokes` filter rejects it). The requirement treats every stored value as untrusted input, so write paths must enforce the same invariants (point count, nested-array shape) before serializing — otherwise valid-looking writes can vanish with no error.

**O049** · medium · bug · `src/games/jewellery/ui/cutDraft.ts:22-28`

Empty inner strokes are accepted as valid data: `isStrokes` treats an empty `stroke` array as valid because `Array.every` on an empty array is vacuously `true`, and `writeCutDraft` only checks the _outer_ `strokes.length === 0`. So a payload like `[[]]` round-trips through storage and `readCutDraft` returns `[[]]`, which will then be fed to the renderer and likely draw a stray move-to-only segment. Either reject strokes whose inner arrays are empty, or strip them at write time so callers can't persist no-op data.

**O050** · high · bug · `src/games/jewellery/ui/cutDraft.ts:30-51`

Silent error swallowing in storage I/O loses user data without notice. `readBook` returns `null` on any parse/validation failure (dropping the entire draft book, including unrelated cuts, on the next read), and `writeBook` returns silently on `QuotaExceededError` or serialization errors. Children drafting a cut will lose work with no telemetry, no UI signal, and no retry path. Consider surfacing failures (e.g. console warn + a callback/return value) so the caller can notify the user and/or fall back to an export prompt.

**O051** · medium · maintainability · `src/games/jewellery/ui/cutDraft.ts:59-64`

Read-modify-write pattern with no locking is fragile. `writeCutDraft` reads the whole book, merges the new cut, then writes the whole book back; this relies on the assumption that no other consumer (current or future) will mutate `DRAFT_KEY` between the read and write. Single-tab JS execution makes this safe today, but a future refactor that adds an async step (e.g. an import/export hook), a `requestIdleCallback`, or any `await` inside the call chain will introduce a TOCTOU bug that silently overwrites concurrent changes. Worth a comment marking the assumption, or rewriting as a single `setItem` with the in-memory book kept in module state.

**O052** · low · maintainability · `src/offline/keepSaves.ts:1-9`

Lost persistence status: the function returns `void` and discards the boolean outcome of `persist()`. When the user denies the prompt, callers have no way to warn that saves may still be evicted by the browser. Consider returning `Promise<boolean>` (or letting the caller await it) so the UI can surface the risk.

**O053** · medium · bug · `src/offline/keepSaves.ts:2`

Weak feature detection: `"storage" in navigator` returns true even when the property is `undefined` (e.g. older Safari builds or polyfilled environments). The next line then dereferences `storage.persist` and throws `TypeError: Cannot read properties of undefined`. Prefer `typeof navigator.storage !== "undefined"` or a truthiness check after assignment.

**O054** · medium · maintainability · `src/offline/keepSaves.ts:5-8`

Project rules require preferring async/await over Promise chains. The whole body after the guards is a `.then().catch()` chain; rewriting as `async/await` improves readability and lets the caller use `try/catch`.

**O055** · low · style · `src/offline/keepSaves.ts:7`

Redundant ternary: `(kept ? true : storage.persist())` is equivalent to `(kept || storage.persist())` since `kept` is already a boolean and the outer `.then` flattens the inner promise. Simplifies the expression and avoids the awkward `true | Promise<boolean>` return type.

**O056** · medium · maintainability · `src/offline/keepSaves.ts:8`

Silent error handling: `.catch(() => undefined)` discards every error with no logging, telemetry, or fallback. At minimum log a debug message so a denied persistence prompt or quota error is observable during QA.

**O057** · low · security · `src/offline/serviceWorker.js:6`

HOST_PATHS only excludes `/cdn-cgi/` and `/sw.js`. Any other dynamic endpoint that must never be cached (telemetry, API, future serverless functions, websockets) is silently swallowed by the catch-all `fromCache`, and the cached response will then be served from cache on subsequent loads. Add an explicit allowlist (e.g. only precached assets) rather than a two-entry denylist, or at minimum expand this list as endpoints are added - leaving the list undocumented and uncommented makes future additions easy to forget.

**O058** · high · bug · `src/offline/serviceWorker.js:32-38`

Race condition in precacheAll cleanup: when Promise.all rejects, `stop.abort()` is signalled and `caches.delete(CACHE_NAME)` is awaited, but other lanes may still be inside `await cache.put(...)`. cache.put does not take the abort signal and cannot be cancelled, so it may complete on a cache that has just been deleted, throwing a DOMException that is then silently swallowed (Promise.all already settled). The handler also does not wait for the in-flight lanes to actually settle before deleting, so unhandled rejections from sibling lanes leak out. Fix by collecting each lane's promise (e.g. via tracking an array of in-flight writes) and `Promise.all`-ing both the work and the cleanup before deciding to delete.

**O059** · medium · bug · `src/offline/serviceWorker.js:36`

The `!reused` guard prevents cleanup when a same-version cache already existed, so a previous failed install of this exact version can leave partial/old entries behind. On the next attempt, cache.put overwrites only successful fetches and a failure leaves the cache in a mixed state (old + new asset versions), which is precisely the cache-poisoning hazard SRI is meant to prevent. Always delete the install cache on failure (use a separate staging cache name if you need to preserve a previously-good cache).

**O060** · low · maintainability · `src/offline/serviceWorker.js:61-67`

The `signIn` decision is encoded as a single dense boolean that mixes "no shell", "auth challenge", and "good response" into one expression, and the variable name `answer` for the live response is non-obvious. This branch hides an important behavioural choice: when the user is online and already authenticated (200 OK), the SW silently serves the cached shell instead of the live response. That is fine for the SPA index, but the SW treats any URL with `?signin=true` this way, including deep links that should bypass the shell. Split the branches and rename the variable so the intent (and the silent fall-through to shell) is obvious.

**O061** · medium · security · `src/offline/serviceWorker.js:71`

`ignoreVary: true` bypasses the Vary-header check when matching cached responses. Today the cache only holds SRI-precached static assets so this is benign, but the SW has no allowlist of cacheable URL patterns - any same-origin GET that the app later adds to the runtime cache (API responses, user-specific JSON, auth-gated HTML) would be served across all Vary variants (Accept-Language, Authorization, Cookie, etc.). Drop the flag, or restrict `fromCache` to a static-asset allowlist that doesn't include dynamic ones.

**O062** · medium · maintainability · `src/offline/serviceWorker.js:79-81`

Missing `self.clients.claim()` in the activate handler. Combined with the optional `SKIP_WAITING` message, this means an updated SW won't control already-open tabs until they reload, undermining the offline-first update story that the precache step exists to deliver. Add `await self.clients.claim();` (inside `event.waitUntil`) so the new SW takes over existing clients on activation.

**O063** · low · maintainability · `src/offline/signInState.ts:4`

`PROBE_URL = "/sw.js"` is a business-critical endpoint hardcoded as a magic string. Per project rules, business-related URL paths must not be hardcoded. Move it to a typed configuration module (e.g. `src/config.ts`) so the same path can be reused by the service-worker registration code and is easy to change.

**O064** · high · bug · `src/offline/signInState.ts:10-15`

304 Not Modified is misclassified as `signed-out`. The HEAD probe uses `cache: "no-store"`, but a service worker or CDN can still answer with 304 for a conditional revalidation; 304 is a legitimate "still authenticated" response, so this branch will spuriously flip the user to signed-out. Narrow the 3xx check to redirect statuses (301/302/303/307/308) and treat 304 (and 305) as `signed-in` (or `unknown` and re-probe).

**O065** · high · maintainability · `src/offline/signInState.ts:17-21`

Unsafe iteration of the listener Set in `settle()`. (a) If any listener throws, the remaining listeners are never notified because iteration stops at the first throw. (b) Set semantics during `for..of` visit newly-added entries in the same pass, so a listener that calls `subscribeToSignIn` will be invoked again immediately. Snapshot the listeners (e.g. `for (const listener of [...listeners]) { try { listener(); } catch { /* swallow or report */ } }`) so each subscriber is isolated and additions don't fire in this tick.

**O066** · low · performance · `src/offline/signInState.ts:23-32`

`probe()` swallows every fetch error with `.catch(() => undefined)`, violating the async-handling rule and making auth-probe outages invisible. At minimum log/emit a structured warning so the production incident is diagnosable; consider distinguishing network failures (skip) from unexpected rejections (alert).

**O067** · medium · maintainability · `src/offline/signInState.ts:41-50`

`watchSignIn()` registers `visibilitychange` and `online` listeners every time it is called, with no removal or idempotency guard. A double-invocation (e.g. dev-mode HMR, future router rework) doubles the number of probes per event and leaks closures. Either guard with a module-level `started` flag, or store handler references and call `removeEventListener` on a teardown path.

**O068** · low · maintainability · `src/offline/useUpdateReady.ts:2-6`

No documentation on the SSR contract or the expected stability guarantees of the imported `subscribeToUpdate` / `updateIsReady`. `useSyncExternalStore` requires (a) a subscribe function with a stable identity that returns an unsubscribe, and (b) a getSnapshot returning a referentially stable value when the underlying state is unchanged. The correctness of this hook depends entirely on `./workerUpdates` honoring those contracts; a short JSDoc here would document the dependency for future maintainers.

**O069** · medium · bug · `src/offline/useUpdateReady.ts:5`

Hydration mismatch risk: `() => false` forces the SSR/server snapshot to `false`, but if the service worker registers and detects an update before React hydrates on the client, `updateIsReady()` can return `true` during the first client render. React will then log a hydration mismatch and may revert client UI. Consider either guarding `useUpdateReady` to only enable after hydration (e.g., gate with a `useEffect` that flips a `mounted` flag), or ensuring the initial client snapshot is also `false` until the worker module explicitly signals readiness, so the server and client first-paint snapshots agree.

**O070** · medium · maintainability · `src/offline/workerUpdates.ts:13-17`

`announce` unconditionally sets `dismissed = false`. When a user has explicitly dismissed an update notification, the next `updatefound` for the same registration (or the same waiting worker being re-detected) will re-show the toast, ignoring the user's choice. Track dismissal per-`scriptURL` (or clear `dismissed` only when `worker` actually changes / is new), and add a regression note about the intended UX. At minimum, guard with `if (waiting !== worker) dismissed = false;`.

**O071** · medium · bug · `src/offline/workerUpdates.ts:19-26`

`offerWhenInstalled` registers a `statechange` listener that is never removed. Once the worker reaches `activated`, this listener stays bound for the lifetime of the page even though it can no longer become `'installed'` again. With multiple registrations (see startOfflineSupport issue) these listeners accumulate. Remove the listener after announcing, e.g. `worker.removeEventListener("statechange", check)` once `worker.state === "installed" || worker.state === "redundant"`.

**O072** · low · performance · `src/offline/workerUpdates.ts:33-35`

The visibilitychange handler calls `registration.update()` on every tab refocus. On long-running sessions with many refocuses, this can pin the SW cache eviction policy and waste bandwidth for users who explicitly don't have a new build. Debounce (e.g. throttle to once per N minutes) or only trigger after the SW controller hasn't been updated in a while. Also, this handler is added inside `watch()` with no removal — combined with the lack of idempotency in `startOfflineSupport`, refocusing accumulates identical handlers.

**O073** · high · bug · `src/offline/workerUpdates.ts:38-43`

Silent error swallowing: both `.catch(() => undefined)` callbacks discard every failure with no logging, violating the project's async error-handling rule. SW registration failures and update-check failures will be invisible in production; at minimum, log to `console.warn` (or surface to the listener set) so misconfigured scopes/SRI/caching issues can be diagnosed.

**O074** · high · maintainability · `src/offline/workerUpdates.ts:45-52`

`startOfflineSupport` has no idempotency guard. The function early-returns only on environment/serviceWorker absence, so calling it twice (HMR, React StrictMode double-mount in dev, or a future refactor that wires it into multiple entry points) accumulates: (1) an extra `controllerchange` listener on `navigator.serviceWorker`, (2) an extra `updatefound` listener on the registration via `.then(watch)`, and (3) an extra `visibilitychange` listener on `document` (added inside `watch` with no removal). Each is a real listener leak that doubles reload / update / fetch behavior. Add a module-level `started` flag and bail out on the second call.

**O075** · high · bug · `src/offline/workerUpdates.ts:47-49`

`restarting` is set to `true` and never reset. Any subsequent `controllerchange` event (e.g. DevTools-driven SW override, an unexpected takeover, or the next normal activation cycle) will unconditionally reload the page. Also, if the SKIP_WAITING postMessage fails or the worker never activates, `restarting` stays `true` forever and the next legitimate controllerchange reloads unexpectedly. Reset `restarting = false` inside a `setTimeout`/`finally`, or scope the reload trigger to the specific SKIP_WAITING round-trip.

**O076** · high · bug · `src/offline/workerUpdates.ts:70-78`

`restartIntoUpdate` silently falls back to `window.location.reload()` when the worker is non-null but not `'installed'`. If `worker.state === 'activating'` (very common race window — installed → activating happens within the same tick after SKIP_WAITING), the function skips the proper skip-waiting path and does a full reload instead, defeating the whole purpose of SKIP_WAITING. Also `worker.postMessage(...)` has no error handling; if the SW is already gone, the rejection is unhandled. Consider awaiting state with a one-shot `statechange` listener or checking for `'activating' | 'installed'` and treating both as valid.

**O077** · high · bug · `src/studio/AboutPage.tsx:20-27`

Silent error swallowing in clearStorage hides failed deletions. `localStorage.clear()`/`sessionStorage.clear()` can throw `SecurityError` in private browsing, sandboxed iframes, or when storage quota/disable prevents it. The user clicked "Delete everything on this device", but if both calls throw, the function returns silently and `forgetThisDevice` still navigates/reloads — the family believes saves are gone while they remain. At minimum log the error; ideally surface a user-visible failure so the action can be retried.

**O078** · medium · maintainability · `src/studio/AboutPage.tsx:29-33`

Same hardcoded "#/" magic string in forgetThisDevice — see related finding on the back link. Combine both into a single shared constant.

**O079** · low · bug · `src/studio/AboutPage.tsx:29-33`

Dialog state is not reset before reload. If the reload is delayed, blocked by a browser prompt, or the user has another tab keeping the page alive, `ForgetDeviceDialog` stays mounted in the "open" state with stale props and no recovery path. Call `setForgetting(false)` before triggering navigation/reload so the UI is consistent until the page actually unloads.

**O080** · medium · maintainability · `src/studio/AboutPage.tsx:43`

Hardcoded route "#/" duplicated as a magic string in the back link and in forgetThisDevice. If routing changes (e.g., "#/home", "/"), both call sites break silently. Per the project's hardcoding rule for URL paths, extract this to a shared constant (e.g., `HOME_ROUTE` or a router-level helper) and reuse it.

**O081** · low · maintainability · `src/studio/AboutPage.tsx:79-84`

Using the full promise string as the React key is fragile — any copy change, localization, or accidental duplicate causes incorrect reconciliation and stale DOM. Give the array a stable id (e.g., tuple `[id, text] as const` or a typed array with an explicit `id` field) and key off that.

**O082** · low · performance · `src/studio/AboutPage.tsx:160`

Inline arrow `onKeep={() => setForgetting(false)}` is reallocated on every render and breaks referential equality, defeating any `React.memo`/`useCallback` memoization inside `ForgetDeviceDialog`. Wrap it with `useCallback` (or pass the setter directly via `useCallback` if the dialog supports it) for stable identity.

**O083** · medium · maintainability · `src/studio/profile.ts:49-56`

Only `name` and `look` are read from rawSave.profile; `accessory`, `theme`, and `perks` silently fall back to NEW_PROFILE defaults. If this is intentional legacy migration, it should be documented with a comment; otherwise run them through their respective parsers (oneOf(ACCESSORIES), oneOf(HOME_THEMES), arrayOf(refined(...isPerkId))) so existing users do not lose their unlocked perks/themes when loading from a save file.

**O084** · high · bug · `src/studio/profile.ts:54`

If the saved name trims to longer than MAX_NAME_LENGTH it is silently replaced with an empty string, dropping the user's chosen display name without any signal upstream. Consider truncating to MAX_NAME_LENGTH, or at least preserving the trimmed prefix so the player keeps _some_ of their name instead of an empty field.

**O085** · low · maintainability · `src/studio/profile.ts:60-65`

The bare `catch {}` collapses every failure mode (QuotaExceededError, SecurityError when storage is disabled, JSON serialization error) into a single `false` return, making persistence debugging and user-facing messaging impossible. At minimum, log the caught error (and ideally branch on `err.name`) so storage issues are observable from the console and callers can distinguish "no space" from "storage disabled".

**O086** · medium · bug · `src/studio/profile.ts:71`

seedSave() is invoked with no guard. If the seed provider throws (corrupt seed blob, JSON.parse failure, unexpected runtime error) the exception propagates out of loadProfile and can crash studio startup, leaving the app without a usable profile. Wrap the seed path in a try/catch and fall back to NEW_PROFILE on failure so first-run resilience is preserved.

**O087** · high · bug · `src/studio/profile.ts:72`

The boolean returned by writeProfile is discarded; if localStorage.setItem throws (QuotaExceededError, SecurityError in private mode, disabled storage) the caller never learns that the seeded profile was not persisted, and it will be lost on reload. Either propagate the failure (e.g. return null / throw / log + return seeded) so the UI can warn the user, or at least surface the result for observability.

**O088** · medium · bug · `src/studio/SignedOutMark.tsx:13-14`

The signed-out indicator is suppressed whenever `updateShowing` is true (`signedOut && !updateShowing`). If both conditions are simultaneously true the user loses both the "Signed out" status text and the "Sign in" button precisely when offline/auth flows may matter most. Consider whether the mark should remain visible (perhaps rendered alongside the update prompt) or whether the update prompt itself should expose a sign-in affordance, rather than silently hiding this one.

**O089** · medium · maintainability · `src/studio/SignedOutMark.tsx:20-22`

`onClick={signInAgain}` binds the imported `signInAgain` function directly. If `signInAgain` is async and can reject/throw, a user click could produce an unhandled promise rejection with no in-UI feedback (and no error boundary above this component is visible from this file). Wrap the call here (or inside `signInAgain`) with error handling and surface a friendly message/toast on failure, matching the project's "async functions must include proper error handling with user-friendly error messages" rule.

**O090** · medium · security · `src/studio/slotStore.ts:42-54`

`readRawSlots` and `readLastRawSlot` parse stored text directly with `parseJson`, never going through `codec.parse`. Given the requirement that every stored/imported value is untrusted, a consumer that reaches for these "raw" helpers expecting envelope-validated data may inadvertently handle values `readAllSlots` would have flagged as `"damaged"`. Either document them as "raw, untrusted, no envelope validation" loudly, or route them through `codec.parse` so callers have a single validated path.

**O091** · low · maintainability · `src/studio/slotStore.ts:56-63`

`clearGameSaves` touches `window.localStorage` directly instead of going through the `storage()` helper. The rest of the module routes through `storage()` so that `null`/`throws-from-getter` paths are handled consistently. Here a thrown getter falls into the same try/catch, so behavior is equivalent — but the inconsistency makes the module harder to reason about (e.g., a future change that swaps `storage()` for an in-memory mock will silently skip this function). Route through `storage()` and early-return on `null`.

**O092** · low · maintainability · `src/studio/slotStore.ts:90-99`

The `const store = storage(); if (store === null) return ...;` prelude is duplicated five times inside `createSlotStore` (`savingAvailable`, `markLastSlot`, `writeSlot`, `deleteSlot`, and the public free-function paths). A small `withStore<T>(fn: (s: Storage) => T): T | null` higher-order helper would unify the null-safety contract and shrink each method to its actual logic.

**O093** · high · bug · `src/studio/slotStore.ts:101-110`

Partial-failure return contract: if `setItem(slotKey, ...)` succeeds but the trailing `markLastSlot` setItem fails (e.g., quota filled between calls), the slot data is persisted yet `writeSlot` returns `false`. Callers cannot distinguish "nothing saved" from "state saved, pointer missing", so a UI that surfaces an error to the user may make them think the save was lost (it's not — but `continueSlot` will fall back to `ready[0]` since `lastKey` is stale). Either combine both writes in a single try (so a failure means the slot didn't get committed either) or return a richer result so callers can act on each case.

**O094** · medium · bug · `src/studio/slotStore.ts:123-127`

`continueSlot` reads `lastKey` via `readStoredText` without going through the `storage()` null-guard that every other method in `createSlotStore` uses. Every other entry point degrades gracefully when localStorage is blocked (private mode, quota, security errors), but this path can throw out of `continueSlot` instead, breaking "Continue" without an obvious cause. The same is true of the standalone `readRawSlots` / `readLastRawSlot` exports — they bypass `storage()` entirely.

**O095** · medium · maintainability · `src/studio/storedJson.ts:1-15`

Both `readStoredText` and `parseJson` silently swallow every error (localStorage disabled / SecurityError / QuotaExceededError / SyntaxError) and collapse them to `null`. Callers cannot tell apart "key missing", "storage unavailable", and "value corrupted", and there is no log surface so silent data loss/reset incidents become nearly invisible during development. Suggest at minimum a `console.warn` (or a dedicated debug channel) in the `catch`, and/or returning a discriminated result like `{ ok: true, value } | { ok: false, reason: 'missing' | 'parse' | 'storage' }` so upstream code can react appropriately (e.g. fall back to defaults vs. surface a "your save is corrupt" message).

**O096** · low · style · `src/studio/storedJson.ts:11`

The `as unknown` cast on `JSON.parse(raw)` is a no-op: `JSON.parse` already returns `any`, and the declared return type is already `unknown`. The cast adds noise without adding type safety. Either drop it (`return JSON.parse(raw);`) or, if the intent is documentation, replace it with a real runtime schema/type-guard so callers don't have to re-validate `unknown` themselves — for untrusted save/import data this module is the natural place to enforce the envelope shape (version + payload) before handing it off.

**O097** · medium · maintainability · `src/studio/storedJson.ts:17-20`

`readStoredJson` returns `null` for three semantically distinct conditions: (a) the key is absent from storage, (b) the stored value parses to the JSON literal `null`, (c) the stored value is malformed JSON. Because `readStoredText` also collapses storage errors to `null`, there are effectively four sources of `null` and the caller has no way to tell them apart. For a save-game boundary this is a data-integrity hazard — a corrupted import could look identical to a fresh install and silently wipe progress. Consider a result type (e.g. `{ status: 'absent' } | { status: 'value', data: unknown } | { status: 'parse_error' } | { status: 'storage_error' }`) or at minimum separate the "absent" case from the "parse error" case so corrupted data can be quarantined/recovered instead of being treated as missing.

**O098** · medium · bug · `src/studio/useStudioRoute.ts:29-31`

useSyncExternalStore's server snapshot returns "", so during SSR `canonical = routeHash(parseRoute("", isLive))` and `arrival` is seeded from that. On the client's very first render `getSnapshot` returns the real `window.location.hash`, which yields a different `canonical`, making the line below it call `setArrival` and produce a hydration mismatch plus a redundant render. Either align the server snapshot (which is impossible since `window` is absent) or seed `arrival` lazily via a `useEffect` keyed on `hash` so the initial client render is not "wrong" compared to the SSR HTML.

**O099** · high · security · `src/studio/useStudioRoute.ts:30`

`parseRoute(hash, isLive)` runs on every render with the raw URL hash (user-controlled, untrusted input per the project's threat model). Any exception – a malformed hash, a value that fails the type guard, a future regex that throws on unexpected bytes – propagates out of the hook and unmounts every consumer. This is the only line standing between an attacker-controlled bookmark/link and the entire React tree. Wrap the parse in a try/catch and fall back to a safe default route so crafted URLs degrade gracefully instead of crashing the app.

**O100** · high · bug · `src/studio/useStudioRoute.ts:31-32`

setArrival is called directly inside the render body, which violates the React purity rule ("render must be a pure function of state and props"). Although the `if` guard prevents an infinite loop, it still causes an extra commit + re-render on every canonical change, breaks under Concurrent React/StrictMode double-invocation, and silently turns setState into a side effect of rendering. Track `from` via a separate state slice updated in a `useEffect` (or use `useSyncExternalStore` to drive both fields), and derive the current route from `hash`/`canonical` instead of mirroring it in state.

**O101** · medium · bug · `src/studio/useStudioRoute.ts:35`

`window.location.replace(canonical)` overwrites the _current_ history entry instead of pushing a new one, so the browser's Back button cannot return to the previous in-app route – it leaves the app entirely. This silently breaks navigation for users and loses history entries on every canonicalization (which fires not just on direct `navigate` calls but on every `hashchange`). To preserve the back stack, push the canonical hash with `window.location.hash = canonical` or `history.pushState(null, "", canonical)` so each route becomes a real history entry.

**O102** · low · maintainability · `src/studio/useStudioRoute.ts:38-41`

`navigate` unconditionally calls `window.scrollTo(0, 0)`, baking a UX side effect into every caller with no way to opt out (e.g., a sub-navigation in a panel, or a route that is intentionally preserving the scroll position). Worse, because `useSyncExternalStore` only fires one render per `hashchange`, this scroll runs _after_ React has already scheduled the new view, often producing a visible jump. Either drop the scroll entirely (let the route component decide) or make it opt-in via a second parameter so consumers aren't forced into a behavior contract they didn't ask for.

**O103** · medium · bug · `tooling/headersFile.ts:32-33`

Replacing `*` with `.*` lets a path wildcard match `/` characters, so a pattern like `/foo*` will also match `/foo/bar/baz`. If single-segment wildcard semantics are intended (which is the common Cloudflare/Netlify convention for path globs), this is over-matching and can cause headers meant for `/foo/<anything>` to also apply to deeper paths. If cross-segment matching is intended, document it; otherwise change the substitution to `[^/]*` (negated slash) so wildcards stay within a single path segment.

**O104** · low · performance · `tooling/headersFile.ts:32-33`

`matchesPath` builds and throws away a fresh `RegExp` on every call. Because patterns are static once parsed (they come from `_headers`), they can be compiled once at parse time. For an offline build/preview tool this isn't catastrophic, but it's wasted work and constructing RegExps repeatedly also exposes you to accidental ReDoS if hostile patterns ever sneak in. Either memoize per-pattern (e.g., a `WeakMap<string, RegExp>`), or attach the compiled regex to each `HeaderRule` (extend `HeaderRule` with a `readonly patternRe: RegExp`) and match against that.

**O105** · critical · bug · `tooling/headersFile.ts:40-44`

Multiple `Set-Cookie` headers are joined with `", "` into a single comma-separated string, which is invalid per RFC 6265 — `Set-Cookie` MUST NOT be combined via commas (each cookie must be sent in its own header line). Because `headersFor` returns a `Record<string, string>` and merges on a lowercased key, any path that matches more than one rule defining `Set-Cookie` (or any rule with repeated `Set-Cookie` entries) silently corrupts those cookies. Either treat `Set-Cookie` as a special multi-valued header (change the return shape to `Record<string, string | string[]>` and never merge it), or keep Set-Cookie entries as separate keys / array values. The current behavior can break session/cookie behavior for the app.

**O106** · high · security · `tooling/headersFile.ts:50-61`

`overPlainHttp` only strips `upgrade-insecure-requests` from `Content-Security-Policy`, but it leaves `Content-Security-Policy-Report-Only` (which is meaningless/insecure over plain HTTP) and `Strict-Transport-Security` (HSTS) untouched. HSTS sent over plain HTTP is at best ignored and at worst the parser stores it without honoring it; CSP-RO will still send reports to arbitrary endpoints. For an offline children's app this is a meaningful security gap — extend the downgrade to at least strip HSTS over plain HTTP and process CSP-RO identically to CSP.

**O107** · medium · bug · `tooling/headersFile.ts:54-58`

CSP directives are split on a raw `;`, but source expressions can legally contain quoted semicolons — most commonly `data:` URLs like `img-src 'self' data:image/svg+xml;base64,...` or `font-src data:font/woff2;base64,...`. Splitting on `;` will corrupt those quoted source expressions, throwing away the remainder of the source list and potentially allowing resources that shouldn't be allowed. A correct downgrader should respect quoted source-list segments (e.g., tokenize on `;` while skipping `;` and other punctuation inside `'…'` / `"…"` quotes).

**O108** · medium · security · `tooling/hostHeaders.ts:0`

`response.setHeader(name, value)` silently replaces any existing header of the same name. Because this plugin is registered as a single middleware inside `configurePreviewServer`, the order in which Vite installs other preview middleware (or future plugins) determines who wins — and security headers like CSP/HSTS could be overwritten by a later middleware that is less strict. Prefer asserting the headers in `configurePreviewServer`'s `pre` hook (early) or at minimum document the ordering invariant so a later contributor can't accidentally weaken CSP by running middleware after this one.

**O109** · medium · maintainability · `tooling/hostHeaders.ts:4-6`

The hardcoded `"http://preview.invalid"` base is a magic string whose only purpose is to let `URL` extract a pathname. There's no comment explaining the intent, and the assumption that `request.url` is always path-shaped is implicit. If a proxy or future Vite version ever forwarded a fully-qualified URL into `request.url`, the base would be silently ignored and the resolved pathname would change. Add a brief comment documenting the contract, or derive the pathname via `require("url").parse(request.url).pathname`/a small helper that avoids the fake base entirely.

**O110** · medium · bug · `tooling/hostHeaders.ts:12-16`

No try/catch around `new URL(request.url ?? "/", "http://preview.invalid")` in the middleware. While the base makes this very permissive, truly malformed input (e.g., control characters, invalid percent-encoding on certain platforms) still throws `TypeError` and would propagate up the middleware chain without falling through to `next()`. Wrap in try/catch and call `next(err)` (or `next()` after logging) so a single bad URL can't take down the preview server.

**O111** · low · maintainability · `tooling/hostHeaders.ts:13`

`request.url ?? "/"` is dead defensive code: Node.js types `IncomingMessage.url` as `string`, not `string | undefined`, so the fallback can never fire here. It also hides the assumption that malformed input is handled elsewhere. Either drop the coalescing or replace it with an explicit guard + error path so the type contract is honest.

**O112** · high · bug · `tooling/offlineBuild.ts:7-13`

`namesUnder` recurses without any symlink/cycle detection. `statSync` follows symlinks by default, so a symlinked directory inside `publicDir` that points back to itself (or any ancestor) will cause unbounded recursion and a `RangeError: Maximum call stack size exceeded` during the build. Add symlink detection (`statSync(path, { throwIfNoEntry: false })` plus `lstatSync` comparison) or a `Set<string>` of visited real paths.

**O113** · low · maintainability · `tooling/offlineBuild.ts:7-13`

`namesUnder` includes every entry returned by `readdirSync`, which on macOS/Windows typically contains dotfiles such as `.DS_Store`, `Thumbs.db`, and `.gitignore`. These files are also copied by Vite's publicDir copy step, so they end up both in the precache manifest (wasting cache budget and being served to clients) and as version seed bytes. Filter entries whose name starts with `.` (or use a `withFileTypes` call plus an explicit allow-list of asset extensions).

**O114** · medium · bug · `tooling/offlineBuild.ts:11`

On Windows, `path.relative()` throws `TypeError: path arguments must have the same root` when the two paths resolve to different drives (e.g. `publicDir` configured on `C:` and the repo on `D:`, or a junction/symlink crossing drives). Combined with the symlink-following `statSync` in `namesUnder`, this will crash the build instead of producing a useful error. Guard the `relative()` call or pre-validate that both paths share a root.

**O115** · medium · security · `tooling/offlineBuild.ts:21-23`

`publicDir` is taken verbatim from `config.publicDir` with no validation that it is inside the project root or that it does not contain sensitive paths. Vite allows `publicDir` to be an arbitrary absolute path, and a misconfigured (or, in CI, attacker-influenced) value such as `/etc`, `~/.ssh`, or a parent containing a `node_modules` cache will be walked and every file will be added to the precache list and then read from `outDir`. Resolve and assert `publicDir` is within the project root (or an allow-list) before walking.

**O116** · medium · maintainability · `tooling/offlineBuild.ts:24-36`

`writeBundle` performs several synchronous filesystem operations (`readdirSync`, `statSync`, `readFileSync`, `writeFileSync`) with no `try/catch`. A missing publicDir, an inaccessible bundle entry, or an unreadable template will surface as a raw `ENOENT`/`EACCES` stack trace instead of a clear build-time error. Wrap the body in `try { ... } catch (err) { throw new Error(\`offlineBuild failed: ${(err as Error).message}\`); }` (or per-call handlers) so build failures are actionable.

**O117** · low · maintainability · `tooling/offlineBuild.ts:32`

`{ path: "sw.js", bytes: template }` is mixed into the `buildVersion` input as a self-reference whose payload is the template's bytes (not the eventual `sw.js` content). The intent is presumably to invalidate the cache whenever the SW template changes, but it relies on `buildVersion`/`precacheList` ignoring the literal path "sw.js" later and on a magic string that is easy to drift from if `sw.js` is ever renamed. Pull the template-hash seed into a named constant and document the contract (e.g. extract `const SW_FILE = "sw.js"` and pass it both here and to `writeFileSync`).

**O118** · medium · maintainability · `tooling/precacheList.ts:4`

`HOST_ONLY` matching is exact-case and exact-name. Cloudflare's `_headers`/`_redirects` are case-sensitive on Pages, but a developer with a stray `Sw.js`, `SW.JS`, or `_HEADERS` (easy on macOS/Windows due to case-insensitive filesystems) would NOT be filtered out and would be precached, potentially shadowing the real service worker. Consider matching case-insensitively, or normalizing via `name.toLowerCase()` before the lookup. Suggested change: `const HOST_ONLY = new Set(["_headers", "_redirects", "sw.js"]); function isHostOnly(name: string): boolean { return HOST_ONLY.has(name.toLowerCase()); }`

**O119** · medium · maintainability · `tooling/precacheList.ts:7-9`

`servedName` only normalizes backslashes and leading slashes. It does NOT collapse `..`/`.` segments, strip Windows drive-letter prefixes (`C:/foo` → `C:/foo`, which would slip through `isServed` because `C:` has length > 0 and doesn't start with `.`), or percent-decode segments. If unusual entries reach this function from the build pipeline, they could produce unexpected URL keys. Either expand the normalization, or reject obviously malformed paths early. Suggested extension: `function servedName(file: string): string { return file .replaceAll("\\", "/") .replace(/^[A-Za-z]:\//, "") // strip Windows drive prefix .replace(/^\/+/, "") .replace(/\/{2,}/g, "/") // collapse repeated slashes .split("/") .filter(p => p !== "" && p !== "." && p !== "..") .join("/"); }`

**O120** · critical · security · `tooling/precacheList.ts:16-18`

SRI hash correctness depends on byte-faithful input: `createHash("sha384").update(bytes)` treats a JS `string` as UTF-8. If `BuiltFile.bytes` is a UTF-8 stringification of binary content (images, wasm, fonts, etc.) rather than the raw `Uint8Array`, the emitted `sha384-…` will NOT match the hash the browser computes from the served bytes, and the browser will refuse to use the precached resource (or, worse, swap in a different file). Either restrict the parameter to `Uint8Array`, or document/encode explicitly (e.g. `Buffer.from(bytes).toString("base64")` vs `Bytes`). Suggested hardening: `export function integrityOf(bytes: Uint8Array): string { return`sha384-${createHash("sha384").update(bytes).digest("base64")}`; } `

**O121** · high · bug · `tooling/precacheList.ts:25`

Implicit `index.html` requirement for the shell URL: the precache list only contains `SHELL_URL ("/")` when an `index.html` file is emitted by the build. If a future build configuration renames it (`index.htm`, `200.html`, `main.html`) or omits it entirely, no shell entry is produced and the precache is silently missing the SPA entry point — the offline app will fail to boot. Make the shell source explicit and validated, e.g. assert at least one shell candidate exists, or read the configured entry from a shared constant used by both the build and the precache tool. Suggested check: `if (![...entries.values()].some(e => e.url === SHELL_URL)) { throw new Error("precacheList: no shell entry (index.html) found"); }`

**O122** · high · bug · `tooling/precacheList.ts:26`

Silent duplicate-URL handling can hide build mistakes: `if (!entries.has(url))` keeps the FIRST file's integrity and drops any later file that normalizes to the same URL without warning. If two built files collapse to the same URL (path alias, case-insensitive collision, stray copy), the second is silently ignored and the precache may serve a stale or unintended asset. Either throw, `console.warn`, or assert equality of bytes when a collision occurs. Example fix: ` const existing = entries.get(url); if (existing) { if (existing.integrity !== integrityOf(file.bytes)) { throw new Error(`Duplicate precache URL ${url} with different contents`); } continue; } entries.set(url, { url, integrity: integrityOf(file.bytes) }); `

**O123** · low · style · `tooling/precacheList.ts:28`

Nested ternary in the sort comparator violates the project's "no nested ternaries" rule. Use an explicit `if`/`return` chain or `localeCompare` for readability and to satisfy the linter. Suggested replacement: `function byUrl(a: PrecacheEntry, b: PrecacheEntry): number { if (a.url < b.url) return -1; if (a.url > b.url) return 1; return 0; } return [...entries.values()].sort(byUrl);`

**O124** · low · style · `tooling/workerSource.ts:22`

Nested ternary expression in the sort comparator. The project rules explicitly forbid nested ternaries ("Nested ternary expressions are not allowed"). Refactor to a flat comparator, e.g. `return a.path.localeCompare(b.path);` or an explicit if/return chain.

**O125** · medium · bug · `tooling/workerSource.ts:23-26`

`hash.update(file.bytes)` is deterministic only if every caller passes the same concrete type. When `file.bytes` is a `string`, Node hashes it as UTF-8; when it is a `Uint8Array`, it hashes the raw bytes with no encoding step. The same logical payload represented two different ways yields two different version hashes, undermining the cache-busting guarantee. Normalize once (e.g. convert `string` → `Uint8Array` via `new TextEncoder().encode(...)`) before feeding the hash, or constrain the type to `Uint8Array` only.

**O126** · low · maintainability · `tooling/workerSource.ts:33`

The thrown error fires for both "zero occurrences" and "two-or-more occurrences" but conveys neither. Include the actual count (and ideally the offending positions) so a build break caused by a missing or duplicated `__MAKER_BUILD__` is debuggable without adding `console.log`.

**O127** · high · security · `tooling/workerSource.ts:34`

`JSON.stringify` does NOT escape `</script>` (or `<`/`/`) by default, so a `PrecacheEntry.url` or `.integrity` value containing the literal sequence `</script>` will be emitted verbatim into the template. If the worker source is ever inlined inside an HTML `<script>` block rather than served as a separate JS file, an attacker-controlled value (e.g. an imported save with a malicious URL) can terminate the script context and inject markup/JS into the page. Either (a) document that callers must load the result via `<script src=...>` only and reject values containing `</script>`, or (b) post-process the JSON to escape `<` to `\u003c` (the well-known `JSON.stringify` `</script>` mitigation).

**O128** · medium · bug · `vite.config.ts:9`

The `??` operator only catches `null`/`undefined`, so several env-var inputs slip through to `Number()` and yield surprising values: `MAKER_PORT=""` → `Number("")` = `0`, `MAKER_PORT=abc` → `NaN`, `MAKER_PORT=70000` → a number that Node will reject for dev servers. Combined with `strictPort: true` below, this surfaces as a cryptic `EADDRINUSE` / "Port must be a number" failure rather than a clear configuration error. Parse and validate explicitly.

**O129** · medium · maintainability · `vite.config.ts:10-12`

This synchronous file read runs at module-load time with no error handling. A missing, deleted, or unreadable `public/_headers` crashes `vite`/`vitest` with a raw `ENOENT` from Node and no project-specific guidance, which is especially painful because the file is part of the Cloudflare Pages security-header pipeline that gets mirrored here. Wrap the read and provide a clearer message, or guard with `existsSync`.

**O130** · low · maintainability · `vite.config.ts:16`

Both `offlineBuild` and `hostHeaders` are unconditionally registered and their template/rules are eagerly resolved at module load, so even a pure `vitest` run depends on `public/_headers` and `src/offline/serviceWorker.js` existing on disk. If those files are intentionally dev/preview-only (mirroring Cloudflare Pages headers, producing the precaching SW), gate them by mode so test runs and CI don't fail on missing build artifacts.

## Tool's project summary

Let me analyze the comments to identify cross-cutting patterns and the most important findings. Categories I see: 1. **Offline / Service Worker** - many critical findings around race conditions, missing claim(), hardcoded paths, error swallowing 2. **Save / Migration / Parsing** - data preservation, validation gaps, mutual-asymmetric validation 3. **Storage / localStorage** - silent error handling, lost results, partial-failure contracts 4. **Headers / CSP / SRI** - security headers, SW integration, missing report-to, hash correctness 5. **Build tooling** - symlink cycles, magic strings, no try/catch 6. **React / SSR hydration** - hydration mismatch, render side effects, missing useCallback 7. **Profile / User data** - silently dropped names, lost persistence 8. **Routing** - magic strings, history.replace, scrollTo side effect Module hotspots by comment density: - src/games/chef/core/ - many parser/migration issues - src/offline/ - race conditions, missing claim(), idempotency - tooling/ - precacheList.ts and offlineBuild.ts have many issues - src/studio/ - many storage/routing issues - src/engine/ - parse.ts validation gaps - public/_headers - CSP/HSTS issues - vite.config.ts - module-load fragility Cross-cutting patterns: 1. **Silent error swallowing** - appears in keepSaves, workerUpdates, storedJson, profile, SignInState probe, cutDraft, slotStore — `catch(() => undefined)` / bare `catch {}` loses errors 2. **Missing idempotency / double-invocation hazards** - workerUpdates, signInState watchers 3. **Hardcoded magic strings for routes/URLs** - AboutPage "#/", signInState "/sw.js", useStudioRoute 4. **Missing SRI / integrity** - index.html script tag, while service-worker-managed assets have it 5. **Inconsistent parser validation** - parse.ts allowing non-plain objects, fractional ranges where integers expected, integer where ranges where parse array shape 6. **Lost persistence returns** - profile write, keepSaves returns void, slotStore partial failure 7. **Build/tooling fragility** - offlineBuild no try/catch, no symlink guard 8. **CSP gaps** - no report-to, style-src 'self' blocks inline styles, no HSTS preload 9. **Migration safety** - unlogged fallbacks, non-idempotent migrations, mutable shared references Quick wins: 1. Add `self.clients.claim()` to activate handler 2. Add `integrity` attribute to <script> tag in index.html 3. Add useCallback for setForgetting wrapper 4. Extract HOME_ROUTE constant 5. Replace nested ternary in workerSource and precacheList with explicit comparator 6. Replace `String.length` with [...s].length for name 7. Make `parseRoute` safe-wrapped in useStudioRoute 8. Add try/catch + warn logs to silent `.catch(() => undefined)` 9. Add idempotency guard for startOfflineSupport 10. Document/strengthen CSP with report-to and address style-src 'self' concern Let me now structure this into the requested markdown format. ### Top Issues 1. **Service worker loses its "update story" by missing `clients.claim()` and a coherent precache cleanup.** `src/offline/serviceWorker.js` has no `self.clients.claim()` in activate, an unsafe `!reused` guard that can leave mixed-version entries behind, and a `cache.put` operation that ignores the abort signal used by the cleanup lane. Combined, an updated SW will not control already-open tabs until reload and can leave the cache in a mixed state across rollbacks. (See precacheAll / install / activate comments.) 2. **Untrusted-input parsers silently accept invalid shapes.** `src/engine/parse.ts` lets non-plain prototypes (`new Date`, `RegExp`, class instances) through `isPlainObject`, mutates-by-reference nested migration objects (`saveEnvelope.ts` `migrateRaw` shallow spread), leaks raw thrown exception objects (`thrown` field) up through `parseSaveWith`, and returns untrimmed settings from `profileIssues`. Game parsers in `src/games/chef/core/runParser.ts` and `src/games/adeeva/core/gameStateParser.ts` accept fractional values where integers are named, accept negative `coins` while siblings require counts, and rely on sentinel returns from `idNumber` for distinguishing run vs. service ids. A crafted save can survive validation and crash downstream consumers. 3. **Persistence helpers swallow every error and discard their result.** Repeats across `src/offline/keepSaves.ts`, `src/offline/workerUpdates.ts`, `src/studio/storedJson.ts`, `src/studio/profile.ts`, `src/games/jewellery/ui/cutDraft.ts`, and `src/studio/slotStore.ts`. The pattern is uniform: `.catch(() => undefined)` or bare `catch {}` collapses missing-key / storage-disabled / quota-exceeded / parse-failed / SecurityError into a single indistinguishable failure, and success returns a boolean that callers cannot inspect. Storage data is silently lost (cut drafts, profile, slots, kept-saves prompt, seeded profile) without observability. 4. **Build-time tooling can crash the dev/CI pipeline with raw Node errors and emit unsafe SRI.** `tooling/offlineBuild.ts` runs `readdirSync` / `statSync` / `readFileSync` with no `try/catch`, recurses without symlink/cycle detection, follows symlinks that can point outside the project, and trusts `config.publicDir` verbatim. `tooling/precacheList.ts` hashes whatever `BuiltFile.bytes` contains (UTF‑8 vs raw bytes ambiguity) and silently drops duplicate URLs by keeping only the first entry, hiding build mistakes. `vite.config.ts` reads `public/_headers` at module-load with no error handling, so a missing file crashes `vitest` runs. 5. **Headers and CSP leave the PWA exposed and under-observed.** `public/_headers` lacks `report-to` / `report-uri` (no violation telemetry), `Strict-Transport-Security` is shipped without `preload` (no HSTS on first contact), `form-action 'none'` blocks every form without verification, `style-src 'self'` will break every UI library that injects inline styles, and only `/sw.js` is marked `no-cache` (companion workbox/Vite-PWA files will fall back to defaults). `tooling/headersFile.ts` joins multiple `Set-Cookie` values with `, ` (invalid per RFC 6265), corrupts CSP source expressions containing quoted semicolons, and over-matches path wildcards by translating `*` to `.*`. 6. **No SRI on the entry `<script>` while every other asset ships with it.** `index.html` has no `integrity` / no `crossorigin` on its module entry, while the service-worker-managed precache assets carry sha384. The highest-impact asset on the page is also the one with no integrity guarantee. There is also no `<noscript>` fallback and no CSP fallback for `file://` debugging or third-party hosts. 7. **Auth probe misclassifies state and registers leaking listeners.** `src/offline/signInState.ts` treats a 304 response as signed-out, iterates the listener `Set` in `settle()` so one throw blocks all other listeners (and new entries are visited in the same pass), and `watchSignIn()` re-registers `visibilitychange` / `online` listeners on every call with no idempotency guard. `PROBE_URL = "/sw.js"` is also a hardcoded business-critical path (see #8). 8. **Hardcoded URL paths violate the project rule that "business-related URL paths must not be hardcoded."** Cited in: `src/offline/signInState.ts` (`"/sw.js"`), `src/studio/AboutPage.tsx` (`"#/"` duplicated across two call sites), and `src/studio/useStudioRoute.ts` (canonical routing computed inline). Each must move to a typed config module. 9. **Service-worker lifecycle is not idempotent and reloads aggressively.** `src/offline/workerUpdates.ts` lacks an idempotency guard around `startOfflineSupport` (HMR / StrictMode double-invocation accumulates `controllerchange` + `statechange` listeners), keeps a `statechange` listener bound forever after activation, resets `dismissed` on every `updatefound` (so user-dismissed toasts re-appear), debounces nothing on `visibilitychange` (refocus storms pin cache eviction), and sets `restarting = true` with no reset path. `offerWhenInstalled` falls back to `window.location.reload()` even for a worker in the common `activating` race window. 10. **React purity / SSR hydration violations in Studio route and update hooks.** `src/studio/useStudioRoute.ts` calls `setArrival` inside the render body, mutates history with `replace` (breaks Back), and unconditionally `scrollTo(0,0)`. `src/offline/useUpdateReady.ts` returns `() => false` from `getServerSnapshot` while `getSnapshot` may return `true` on first client render, producing a hydration mismatch. `src/studio/AboutPage.tsx` reallocates an inline `useCallback`-less handler every render, uses the promise text as a React key, and leaves the forget dialog open if reload is blocked. ### Module Hotspots - **`src/games/chef/core/`** — 13 parser/migration findings. The bulk of untrusted-input validation defects live in `runParser.ts`, `gameStateParser.ts`, and `saveMigrations.ts`. - **`src/offline/`** — race conditions in `serviceWorker.js`; lost-results / silent-error pattern in `keepSaves.ts`; listener leaks and 304 misclassification in `signInState.ts`; non-idempotent lifecycle and reload storms in `workerUpdates.ts`; hydration mismatch in `useUpdateReady.ts`. - **`src/studio/`** — `storedJson.ts`, `profile.ts`, `slotStore.ts`, `useStudioRoute.ts`, `AboutPage.tsx`, `SignedOutMark.tsx` together account for many findings on silent error swallowing, hardcoded routes, render-side effects, and storage error contracts. - **`src/engine/parse.ts`** and **`src/engine/saveEnvelope.ts`** — the structural-validation defaults that every per-game parser inherits; weak `isPlainObject`, asymmetric `objectOf` vs. `recordOf`, schema-version envelope missing on `serializeSave`, thrown-object leak. - **`tooling/`** — `precacheList.ts`, `offlineBuild.ts`, `headersFile.ts`, `workerSource.ts` together carry ~14 findings on SRI correctness, symlink recursion, raw filesystem errors, header parsing, JSON injection, and forbidden nested ternaries. - **`public/_headers`** + **`tooling/headersFile.ts`** — both the deployed policy and the parser that produces it have overlapping correctness issues. ### Cross-Cutting Concerns - **Silent `.catch(() => undefined)` and bare `catch {}`** — appears in `src/offline/keepSaves.ts`, `src/offline/workerUpdates.ts`, `src/offline/signInState.ts` (`probe`), `src/studio/storedJson.ts`, `src/studio/profile.ts`, `src/games/jewellery/ui/cutDraft.ts` (silent quota drop). All conflate distinct failure modes into indistinguishable outcomes and discard the boolean that callers could otherwise surface to the user. - **Asymmetric / inconsistent validation across sibling fields** — `integerParser` accepts negatives while sibling `countParser` rejects them (`src/games/adeeva/core/gameStateParser.ts`); `objectOf` ignores unknown keys while `recordOf` rejects them (`src/engine/parse.ts`); `isStrokes` enforces the cap on read only, while `writeCutDraft` does not re-validate (`src/games/jewellery/ui/cutDraft.ts`); `serializeSave` produces no `schemaVersion`, but `parseSaveWith` requires one (`src/engine/saveEnvelope.ts`). These asymmetries let crafted/untrusted input survive parsing in some code paths and fail in others. - **Migration safety (immutability, idempotency, observability)** — shared references via shallow spread (`saveEnvelope.migrateRaw`), `addCareerPaths` overwrites pre-existing fields (`saveMigrations.ts`), `countSeam` drops unknown fields (`src/games/adeeva/core/saveMigrations.ts`), live tuning of `LAMP_HOLD_SECONDS` rewrites historical saves (`src/games/chef/core/saveMigrations.ts`), and every "fall through to `{...raw}`" path emits no log. - **Hardcoded URLs / magic strings** — `"/sw.js"` in `signInState.ts`, `"#/"` in `AboutPage.tsx` (twice), `"/"` shell URL implicit in `precacheList.ts`, `/cdn-cgi/` / `/sw.js` exclusion list in `serviceWorker.js`. Project rules forbid hardcoded business paths — none of these live in a typed config. - **Listener / subscription leaks and missing idempotency** — `signInState.watchSignIn`, `workerUpdates.startOfflineSupport` + `offerWhenInstalled` + `controllerchange`, and `useSyncExternalStore` listeners in `useStudioRoute.ts`. None guard against double-invocation or remove listeners when no longer needed. - **Service-worker update semantics are split across files** — `clients.claim` missing in `serviceWorker.js`, `SKIP_WAITING` messaging split between `serviceWorker.js` and `workerUpdates.ts`, `restarting` flag never reset in `workerUpdates.ts`, and `304`/cache interplay between `signInState.ts` (probe) and `serviceWorker.js` (`ignoreVary`). The split makes it easy for one site to regress another's contract. - **Tools that read the filesystem at module load with no try/catch** — `vite.config.ts` reads `public/_headers`, `tooling/offlineBuild.ts` enumerates `publicDir`, `tooling/hostHeaders.ts` uses fall-through URL bases. A dev/CI environment missing any one file crashes the whole tool rather than degrading. - **CSP / headers policy vs. parser drift** — `style-src 'self'` and `form-action 'none'` in `public/_headers` are not validated against the actual app (React/MUI inline styles, any form). `tooling/headersFile.ts` parser still drops `upgrade-insecure-requests` only (not Report-Only or HSTS), corrupts CSP source expressions on quoted `;`, and over-matches `*` as `.*`. ### Quick Wins 1. Add `await self.clients.claim()` in the activate handler (`src/offline/serviceWorker.js`). 2. Add `integrity` and `crossorigin` to the entry `<script>` in `index.html`, plus a `<noscript>` fallback and a `<meta http-equiv="Content-Security-Policy">` baseline. 3. Replace `name.length` with `[...name].length` (or a `Intl.Segmenter`) in `src/engine/profile.ts` so emojis / ZWJ sequences count correctly against `MAX_NAME_LENGTH`. 4. Have `profileIssues` return the trimmed `settings.name` so callers stop having to re-trim (`src/engine/profile.ts`). 5. Tighten `serializeSave<S>` to require `S extends Record<string, unknown>`, and emit a `schemaVersion` envelope so its own output round-trips through `parseSaveWith` (`src/engine/saveEnvelope.ts`). 6. Make `isPlainObject` reject non-`Object.prototype` prototypes, and make `objectOf`/`fixedRecordOf` reject unknown keys to match `recordOf` (`src/engine/parse.ts`). 7. Use `integerRangeParser` (not `rangeParser`) for `coins`, `sides`, `progress`, and similar integer-named fields across `gameStateParser.ts` / `runParser.ts`. 8. Centralize `HOME_ROUTE = "#/"` and `PROBE_URL` (e.g. `"/sw.js"`) in a single `src/config.ts` and reuse from `AboutPage.tsx`, `useStudioRoute.ts`, and `signInState.ts`. 9. Add a module-level idempotency guard around `startOfflineSupport` and a per-registration `statechange` cleanup; reset `dismissed` per user intent and reset `restarting` on a timeout in `src/offline/workerUpdates.ts`. 10. Replace `.catch(() => undefined)` with explicit logging (`console.warn` minimum) and propagate the boolean in `keepSaves.ts`, `workerUpdates.ts`, `storedJson.ts`, `profile.ts`, `cutDraft.ts`, `slotStore.ts`, `signInState.ts`. 11. Flatten the two nested-ternary sort comparators (`tooling/precacheList.ts`, `tooling/workerSource.ts`) to satisfy the project rule. 12. Wrap `startOfflineSupport` and the precache cleanup's `cache.put` calls behind a single `_installInProgress` / abortable lane, so `stop.abort()` actually stops the per-asset writes (`src/offline/serviceWorker.js`). 13. Debounce `visibilitychange`-driven `registration.update()` in `src/offline/workerUpdates.ts` (e.g. once per N minutes) to stop refocus storms. 14. Add `setForgetting(false)` before reload, wrap `onKeep` in `useCallback`, and replace the promise-text React key with a stable id in `src/studio/AboutPage.tsx`. 15. In `vite.config.ts`, wrap the synchronous `public/_headers` read in a guarded `try/catch` and lazily resolve header rules so a `vitest` run no longer depends on that file.
