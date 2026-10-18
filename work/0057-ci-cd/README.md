# CI/CD for Maker Studio

Task 57, branch `task/0057-ci-cd`, 2026-10-18. This page is the working agreement for getting a change from a branch to the kids' devices. It covers the GitHub workflows, the Cloudflare setup Shan does once, releases, rollbacks and the free-minutes budget.

Shan's decisions (2026-10-18):

- Production deploys happen on release tags (`v*.*.*`), never on merge.
- Every pull request gets its own Cloudflare Pages preview, behind Cloudflare Access.
- Branch protection is by convention, and the repo stays on the free plan. Every change goes through a pull request, and merges happen only on green CI.

## The workflows

| File                               | Runs on                                       | What it does                                                                                                                                       |
| ---------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`         | every pull request to `main`, push to `main`  | install, typecheck, lint, unit tests, build, `pnpm audit`, a gitleaks scan of the whole history, and the browser tests on Chromium and WebKit      |
| `.github/workflows/preview.yml`    | every pull request from a branch in this repo | builds the PR and deploys it to its own Cloudflare Pages preview, then posts (and keeps updating) one comment with the link                        |
| `.github/workflows/release.yml`    | a pushed `v*.*.*` tag, or a manual re-run     | checks the tag is on `main`, runs the whole of `ci.yml` again on that commit, deploys the tested build to production and creates a GitHub Release  |
| `.github/dependabot.yml`           | weekly, Mondays                               | grouped minor and patch updates for npm and GitHub Actions; TypeScript majors are ignored (it stays on 6.x); npm versions must be 5 days old first |
| `.github/pull_request_template.md` | every new pull request                        | what changed, evidence, the gate checklist, screenshots for UI, and a security impact line                                                         |

### Job graph

```text
ci.yml
  verify ──┬── e2e chromium (1/2) ──┐
           ├── e2e chromium (2/2) ──┼── ci-ok
           └── e2e webkit ──────────┤
  secrets ──────────────────────────┘

preview.yml
  build ── deploy ── comment

release.yml
  tag is on main ── ci (the whole of ci.yml) ── deploy production ── github release
```

- **verify:** `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, the two audits below, and the `dist` folder uploaded as an artifact (kept 7 days).
- **secrets:** the gitleaks CLI over the full git history. The binary is pinned by version and checked against the release's SHA-256 before it runs. (gitleaks-action is not used: it needs a paid licence for organisations.)
- **e2e chromium:** the `chromium`, `android-handheld` and `chromebook` projects, split into 2 shards. **e2e webkit:** the `webkit-iphone` and `webkit-ipad` projects in one job. Both wait for `verify`, so a lint or unit-test failure costs about 5 minutes, not 40. Each job installs its browser with its OS packages, caches the browser download per Playwright version, runs with 2 workers (the runners have 2 vCPUs), and uploads the HTML report and the traces only when it fails. Traces are kept only for failed tests, and screenshots are off in `playwright.config.ts` by design.
- **ci-ok:** runs even when something before it failed or was skipped, and passes only when all four jobs before it passed. **`ci-ok` is the one check name to look at** before merging.

### The audit policy

- `pnpm audit --prod` fails on any advisory, at any level, in what ships to players (today only React and React DOM).
- `pnpm audit --audit-level high` fails on a high or critical advisory anywhere, dev dependencies included. The build and test tools (Vite, Vitest, Playwright, ESLint, TypeScript) run in CI with the code checked out and produce the files that ship, so a serious hole there is a supply-chain risk. Low and moderate advisories in dev tools are usually about local dev servers or slow regexes on input we never feed them. They still print in the log, and the weekly Dependabot run picks up their fixes, but they don't block every pull request.

### Pinning

Every action is pinned by its full commit SHA, with the version in a trailing comment. Only official `actions/*` actions and `pnpm/action-setup` are used. Each SHA was checked to be the commit the release tag points to (annotated tags dereferenced).

| Action                      | Version | Commit                                     |
| --------------------------- | ------- | ------------------------------------------ |
| `actions/checkout`          | v7.0.1  | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `pnpm/action-setup`         | v6.1.0  | `ea17c68df8912ef543352723c149a84f56e3d413` |
| `actions/setup-node`        | v7.1.0  | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| `actions/upload-artifact`   | v7.0.2  | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |
| `actions/download-artifact` | v8.0.2  | `9000827ccba6bdab643e8b6fd33ac0654aef8333` |
| `actions/cache`             | v6.1.0  | `55cc8345863c7cc4c66a329aec7e433d2d1c52a9` |
| `actions/github-script`     | v9.0.0  | `3a2844b7e9c422d3c10d287c895573f7108da1b3` |

Tools pinned inside the workflows (Dependabot can't see these, so they're bumped by hand):

| Tool     | Version | How it's pinned                                                                                                                                  |
| -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| gitleaks | 8.30.1  | `GITLEAKS_VERSION` and `GITLEAKS_SHA256` in `ci.yml`; the hash matches the release's checksums file and GitHub's asset digest                    |
| wrangler | 4.151.1 | `WRANGLER_VERSION` in `preview.yml` and `release.yml`; run with `npx --yes wrangler@<version>`, never a project dependency                       |
| pnpm     | 11.28.5 | `packageManager` and `devEngines.packageManager` in `package.json`; `pnpm/action-setup` reads `devEngines` first, so both hold the exact version |
| Node     | 24      | `node-version: 24` in each `setup-node` step                                                                                                     |

To bump gitleaks: take the `linux_x64` line from the new release's `gitleaks_<version>_checksums.txt`, and check it against the asset's digest on the release page. To bump wrangler: change both files together.

### Permissions and secrets

- Every workflow sets `permissions: contents: read` at the top. Only two jobs get more: the preview **comment** job (`pull-requests: write`) and the release **github release** job (`contents: write`). Neither runs any project code.
- The Cloudflare secrets reach only the two deploy jobs. Those jobs download the built `dist` artifact and run wrangler. They never run `pnpm install` or any dependency's code, so a bad package can't read the token.
- Previews run only for pull requests from branches in this repo. A fork's pull request never gets a preview, because secrets are involved.
- Dependabot pull requests don't receive repo secrets, so their preview job skips with a notice. CI still runs on them in full.
- Untrusted text (the branch name) reaches shell scripts only through environment variables, never pasted into a script.

**What the free plan can't stop.** Repo secrets are visible to any workflow on any branch, and environments with required reviewers aren't available for private repos on the free plan. So anyone with write access could push a branch whose workflow deploys to production. Today only Shan has write access, and work reaches GitHub only when Shan pushes. Keep it that way. If a collaborator ever joins, either move to a paid plan (environments with required reviewers for `production`) or keep the production token out of GitHub and deploy releases by hand.

## Day to day: branches, pull requests and merging

1. Every change starts on a branch named `task/NNNN-slug`, for example `task/0058-art-pass`. The number is the next free one under `work/`.
2. Push the branch and open a pull request into `main`. Fill in the template. CI and the preview start on their own.
3. Merge only when **`ci-ok`** is green. Use **Rebase and merge** or **Squash and merge**, never a merge commit, so `main` stays a straight line.
4. Delete the branch after merging (GitHub does it automatically once the setting below is on), and remove its local worktree.
5. Never push straight to `main`. The only things pushed outside a pull request are release tags.

### Why branch protection is by convention

Branch protection rules, rulesets and environment reviewers aren't available for private repos on the free plan. The rules above are therefore a habit, not something GitHub enforces. What holds them up:

- `ci-ok` is a single, always-reported check. A red or missing `ci-ok` means don't merge.
- A release can't deploy a commit that isn't on `main`, and it reruns all of CI on that commit before it deploys. A bad direct push to `main` would still be caught at release time.
- Only Shan can push.

### One-time repository settings (all on the free plan)

In **Settings → General → Pull Requests**:

- untick **Allow merge commits**; keep **Allow squash merging** and **Allow rebase merging** on;
- tick **Automatically delete head branches**;
- tick **Always suggest updating pull request branches**.

In **Settings → Actions → General**:

- **Actions permissions:** "Allow Shanmuga-Raja-Portfolio, and select non-Shanmuga-Raja-Portfolio, actions and reusable workflows", with "Allow actions created by GitHub" ticked and `pnpm/action-setup@*` in the allowed list. If the option is offered, also tick **Require actions to be pinned to a full-length commit SHA**;
- **Workflow permissions:** "Read repository contents and packages permissions" (the workflows ask for more where they need it), and leave "Allow GitHub Actions to create and approve pull requests" unticked;
- **Fork pull request workflows:** leave off.

## Releases

### Cutting a release

From an up-to-date `main` with a green `ci-ok`:

```sh
git switch main
git pull --ff-only
git tag -a v1.0.0 -m "Maker Studio 1.0.0: first family release"
git push origin v1.0.0
```

Then watch **Actions → Release**. It runs these steps:

1. **tag is on main** fails unless the tag is exactly `vMAJOR.MINOR.PATCH` and its commit is on `origin/main`.
2. **ci** runs the whole of `ci.yml` on the tagged commit: every gate, including all browser tests. Expect about 15 to 20 minutes.
3. **deploy production** takes the `dist` that CI just built and tested, and runs `wrangler pages deploy dist --project-name maker-studio --branch main`. It fails if Cloudflare reports anything other than a production deployment.
4. **github release** creates the GitHub Release with generated notes.

Only one release runs at a time (`concurrency: release-production`). A second tag waits for the first to finish.

After the deploy, open the live link on each device and check that it installs, plays offline and keeps its saves (see the roadmap's release plan).

### Rolling back

Choose the fastest option that works:

- **Cloudflare dashboard (seconds).** Workers & Pages → `maker-studio` → Deployments → the last good production deployment → ⋯ → **Rollback to this deployment**. Nothing is rebuilt. Installed copies pick it up the next time they open online, as with any update.
- **Re-deploy an older tag (about 20 minutes).** Actions → Release → **Run workflow**, and under "Use workflow from" pick the tag, for example `v1.0.0`. The tag is checked, CI runs again on it, and its build is deployed. No new GitHub Release is created. This works for every tag made after this task is merged, because the tag must contain `release.yml`.

A rollback serves older files, and saves only migrate forward. If the release being rolled back raised a game's save version (a codec's `version` in the diff between the two tags), any save that was opened in the newer build now reads "This save uses version N, which this game does not recognise" in the older one (`src/engine/saveEnvelope.ts`). In that case roll forward with a fixed tag (for example `v1.0.1`) instead. Rolling forward is the better choice anyway whenever the fix is small.

## Cloudflare setup (Shan, once)

Do these in order. The first preview or release will fail, or skip, until they're done.

### 1. Create the Pages project as Direct Upload

Wrangler will **not** create the project from CI. A non-interactive `wrangler pages deploy` stops with "The Pages project does not exist". Only an interactive run offers to create it, and wrangler 4.151 hands an AI agent's session to Workers instead of Pages when the project is missing. So create it yourself first, using either of these:

- **Dashboard:** Workers & Pages → Create → Pages → **Use direct upload** (not "Connect to Git") → project name `maker-studio` → upload any small folder as a placeholder → Deploy. Then check Settings → **Production branch** is `main`.
- **Your own terminal** (not from a Claude session): `npx --yes wrangler@4.151.1 login`, then `npx --yes wrangler@4.151.1 pages project create maker-studio --production-branch main`.

Note the address Cloudflare gives the project. It's `maker-studio.pages.dev` if the name is free, and otherwise a variant like `maker-studio-abc.pages.dev`. If it differs, use that name everywhere below and in the two workflows. The project name `maker-studio` is what the workflows deploy to.

Never connect the project to GitHub. Builds come only from our workflows, so Cloudflare never needs access to the repo.

### 2. Create the API token, scoped to Pages only

dash.cloudflare.com → **My Profile → API Tokens → Create Token → Create Custom Token**:

- **Name:** `maker-studio GitHub deploy`
- **Permissions:** one row only, `Account` · `Cloudflare Pages` · `Edit`
- **Account Resources:** `Include` · Shan's account (the one account, not "All accounts")
- **Zone Resources:** none (the row doesn't appear for account-only permissions)
- **Client IP Address Filtering:** leave empty (GitHub's runners use many addresses)
- **TTL:** an end date about a year out; put a reminder in the calendar to roll it

Continue → Create Token, and copy the value once. Nothing else is needed: with the account ID set, wrangler doesn't look up memberships or user details.

### 3. Add the repo secrets

GitHub → the `adeeva` repo → **Settings → Secrets and variables → Actions → New repository secret**:

- `CLOUDFLARE_API_TOKEN`: the token from step 2.
- `CLOUDFLARE_ACCOUNT_ID`: the account ID from the Cloudflare dashboard (Workers & Pages overview, right-hand column, "Account ID").

Or from a terminal, which prompts for the value so it never lands in shell history: `gh secret set CLOUDFLARE_API_TOKEN --repo Shanmuga-Raja-Portfolio/adeeva`, then the same for `CLOUDFLARE_ACCOUNT_ID`.

Until both exist, previews skip with a notice ("Preview skipped") and releases fail at **deploy production** with a clear error.

### 4. Put Cloudflare Access in front of everything

Do this **before** the first preview or release. Without it, every `*.pages.dev` address is public.

Zero Trust dashboard → **Access → Applications → Add an application → Self-hosted**:

- **Application name:** Maker Studio
- **Public hostnames:** add both of these:
  - `maker-studio.pages.dev` (production)
  - `*.maker-studio.pages.dev` (every preview: branch aliases like `task-0058-art-pass.maker-studio.pages.dev`, and per-commit addresses like `1a2b3c4d.maker-studio.pages.dev`)

  The wildcard doesn't match the bare name, so both entries are needed.

- **Session duration:** 1 month is kind to the kids; offline play keeps working after it expires either way.
- **Policy:** Action **Allow**, Include **Emails**, listing the family and invited addresses. Login method **One-time PIN**.
- **Cookie settings:** **SameSite: Lax** (found during the security review: the default `None` lets another site probe whether a browser is signed in), and **HTTP Only** on.

If you also tick "Enable access policy" for preview deployments in the Pages project's settings, Cloudflare creates a second Access app for `*.maker-studio.pages.dev`. That's harmless, but one app covering both hostnames is easier to keep right.

Check: open `https://maker-studio.pages.dev` and a preview link in a private window. Both must ask for the email code.

### 5. Keep these off

The service worker installs the game for offline play by fetching every file with its SHA-384 hash. If Cloudflare changes even one byte of a page, the install fails and the game never works offline. So nothing may rewrite or inject into HTML or scripts:

- **Web Analytics** for the Pages project (Workers & Pages → `maker-studio` → Metrics): leave it off. Enabling it injects a beacon script on the next deploy.
- If a custom domain on a Cloudflare zone is added later, keep these zone features off for it: **Rocket Loader**, **Email Address Obfuscation**, **Automatic HTTPS Rewrites**, **Cloudflare Fonts**, **Zaraz**, **Mirage** and image polishing, **Server-side Excludes**, Bot Fight Mode's **JavaScript detections**, and any Transform Rule, Snippet or Worker that edits responses. (On a plain `*.pages.dev` address these can't be turned on.)
- No Pages Functions and no `_worker.js`. The site is static files plus `_headers`.

## Free-minutes budget

The repo is private on the free plan: 2,000 Linux minutes a month on 2-vCPU runners. GitHub bills each job separately, rounded up to the whole minute.

These figures come from the Linux rehearsal below (2 CPUs, 2 Playwright workers), plus about a minute per job for checkout, pnpm, Node and the cached install, and about 1.5 minutes for each browser install with its OS packages. GitHub's vCPUs may be up to about 30% slower than the rehearsal machine, so treat these as estimates and check them against the first real runs (each run's "Usage" page).

| Job                    | Measured work                                                                     | Billed minutes (estimate) |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------- |
| verify                 | install 25 s, typecheck 19 s, lint 49 s, unit tests 70 s, build 17 s, plus audits | 5                         |
| secrets                | gitleaks over 59 commits: 6 s                                                     | 1                         |
| e2e chromium (1/2)     | 92 tests in 11.0 min                                                              | 14 to 17                  |
| e2e chromium (2/2)     | 84 tests in 10.0 min                                                              | 13 to 16                  |
| e2e webkit             | 18 tests in 1.9 min                                                               | 5                         |
| ci-ok                  | a few seconds                                                                     | 1                         |
| **one CI run**         |                                                                                   | **about 40 to 45**        |
| preview (3 jobs)       | build about 2 min, deploy and comment under a minute each                         | about 5                   |
| release (on top of CI) | tag check, deploy, GitHub Release                                                 | about 3                   |

The wall-clock time of a CI run is about 20 minutes: `verify`, then the longest shard.

What that means for the 2,000 minutes:

- One push to an open pull request costs about 50 minutes (CI plus preview). Concurrency cancels a superseded run, so a quick second push stops paying for the first one, though GitHub still bills the minutes it already used.
- A merge costs another CI run of about 45 minutes on `main`.
- A pull request merged after one push therefore costs about 95 minutes. That's about 20 merged pull requests a month, or fewer when they take several pushes. A release adds about 50.

If minutes run short, these levers come first, roughly in order of savings:

1. Push to a pull request when a batch of work is ready, not after every commit (the local gate still runs first).
2. Drop the browser tests from the `push` to `main` run. A release reruns all of CI on the tagged commit anyway, so `main` would lose only an early warning.
3. Stop documentation-only pull requests from triggering CI. Because `ci-ok` would then never report on them, merging those by convention needs care.
4. Fewer shards cost slightly fewer minutes (each shard repeats about 3 minutes of setup) but take longer. Going from 2 shards to 1 saves about 3 minutes a run and adds about 10 minutes of waiting.

Storage stays well inside the free 500 MB for artifacts and 10 GB for caches: `dist` is a few MB and is kept for 7 days, reports are uploaded only on failure, and the caches hold the pnpm store plus one Chromium and one WebKit download.

## Checked for Linux

The suite had only ever run on Windows. Before the first push it was run in Microsoft's Playwright image for 1.64.1 (Ubuntu 24.04, the same OS as `ubuntu-24.04` runners), limited to 2 CPUs like a runner:

- First run: WebKit 18 passed (1.9 min). Chromium: 163 passed, **13 failed**, 56 skipped. All 13 failures had the same cause: Chromium on Linux logged `Error with Permissions-Policy header: Unrecognized feature: 'bluetooth'.` and the tests that watch the console (the strict-policy test and Thrift-Flip's boutique and order journeys) correctly count that as a problem. Web Bluetooth ships in Chromium on Windows, macOS, ChromeOS and Android, but it's behind a flag on desktop Linux, so the `bluetooth=()` entry in `public/_headers` is "unrecognised" there.
- The fix is in `playwright.config.ts`, not in the tests or the headers. The three Chromium projects launch with `--enable-blink-features=WebBluetooth`, so Linux Chromium knows the feature, as Chromebooks and Android devices do. No assertion was weakened and the policy keeps `bluetooth=()`. A real player on desktop Linux Chromium would see the same harmless console line; nothing breaks for them.
- Second run, with the fix: install, typecheck, lint, unit tests and build all passed. Chromium shard 1/2 had 92 passed (11.0 min) and shard 2/2 had 84 passed (10.0 min), with 56 skipped in all (the quality-screenshot specs, which run only with `QUALITY_SHOTS_DIR`). The affected specs also pass on Windows with the flag (27 passed, `MAKER_PORT=5226`, 2 workers).
- WebKit on Linux runs the service worker, offline play and the update prompt exactly as it does on Windows.

- `testMatch` in `playwright.config.ts` already accepts both separators (`release[\\/]...`).
- A script compared every relative import, CSS `url()` and asset reference in `src`, `e2e`, `tooling`, `public` and the configs against the exact file names on disk: 13,758 references, no case mismatches. Git tracks no two paths that differ only in case.
- Fonts: the app uses system font stacks only, so Linux renders with the fonts Playwright's `--with-deps` installs. No test compares pixels, so font differences can only matter where a test measures layout.
- gitleaks 8.30.1 (the Linux binary the workflow downloads, after its checksum check) scanned this branch's whole history in the same image: no leaks.

## Verification of the workflow files

- `actionlint` 1.7.12 (release binary in `Y:\TOOLS\actionlint\v1.7.12`, SHA-256 checked against the release's checksums file) with ShellCheck 0.11.0 (`Y:\TOOLS\shellcheck\v0.11.0`, checked against GitHub's asset digest): no findings in the three workflows.
- `check-jsonschema` against SchemaStore's GitHub workflow and Dependabot schemas: all valid.
- `prettier --check` covers every new file through `pnpm lint`.

The workflows have not run on GitHub yet. Watch the first runs for the points in **First runs to watch** below.

## First runs to watch

- **`pnpm/action-setup` and pnpm 11.** The action reads `devEngines.packageManager` before `packageManager`, which is why both now hold exactly `11.28.5`. The lockfile records that specifier, so `--frozen-lockfile` passes.
- **Runner speed.** If a shard runs past about 20 minutes, or a timing-sensitive test fails only on GitHub, look at the trace in the failure artifact before changing anything. Don't add retries: the suite has been kept deterministic on purpose.
- **WebKit dependencies.** `playwright install --with-deps webkit` pulls a long list of apt packages on `ubuntu-24.04`. If apt is slow or a mirror fails, the WebKit job fails before any test runs. Re-run it.
- **Dependabot and pnpm 11.** Dependabot's support for pnpm 11 lockfiles hasn't been seen working here yet. If its first npm pull request fails to update `pnpm-lock.yaml`, update that dependency by hand on a task branch.
- **The first preview** skips with "Preview skipped" until the two Cloudflare secrets exist. After that, the comment must show both a per-commit link and a branch link, and both must ask for the Access email code.
- **The first release** fails at `deploy production` if the Pages project doesn't exist yet or its production branch isn't `main`. That's on purpose: it refuses to make a preview deployment by mistake.
- **`GITHUB_SHA` on an annotated tag.** The tag check compares the tag's commit with `GITHUB_SHA` after dereferencing both, so it works whether GitHub reports the tag object or the commit.
