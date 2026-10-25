# Contributing to Maker Studio

Thank you for helping. These games are played by children and judged by their
grown-ups, so the bar is a little higher than usual: changes must be kind,
small, verified, and easy to review. When in doubt, make it plainer.

## Ground rules

- **Family-room standard.** No content, wording, art or examples that would be
  out of place in a family's living room. This applies to games, docs, issues
  and commit messages alike.
- **Gentle by design.** No ads, purchases, streaks, energy timers, or anything
  that punishes a child for stopping. Fail states encourage and offer an
  instant retry.
- **Every claim needs evidence.** Commands run, test counts, measurements,
  before/after screenshots for UI changes. Mark anything unrun as "untested".
- **No code comments.** The code should read plainly on its own; the PR
  description carries the why.
- **Small files.** Every file is 700 lines or fewer. No `utils`, `helpers`,
  `common` or `shared` folders — find the honest home for a thing.
- **Sign off your commits (DCO).** No CLA, ever — your contribution stays
  yours. Run `git commit -s` so the commit carries a `Signed-off-by:` line
  certifying you wrote it or may submit it under this project's license. CI
  checks for it on every pull request.

## Setup

You need Node.js 24 and pnpm 11 (`corepack enable`). Then:

```bash
pnpm install
```

## The gates (run all of them before opening a PR)

```bash
pnpm typecheck          # TypeScript, no emit
pnpm lint               # eslint + prettier
pnpm test               # unit tests (Vitest)
MAKER_PORT=<free port> pnpm e2e --workers=2    # affected browser specs
```

or everything at once: `pnpm check`.

`pnpm lint` includes `prettier --check` — run `pnpm format` before committing.

## Making a change

1. Branch from `main`, named after the task (`task/NNNN-short-slug`).
2. Make the change. Keep games in `src/games/<name>/`, shared rules in
   `src/engine/`, the shell in `src/studio/`.
3. Run the gates. Fill in the PR template: what changed, evidence, gate
   results, screenshots for UI work, and a one-line security impact note
   (storage, network, headers, service worker, dependencies, CI secrets).
4. `ci-ok` must be green before merging; rebase or squash only, and delete
   the branch afterwards.

## Releases

Production deploys run from a `v*.*.*` tag on `main` (see
`.github/workflows/release.yml`). To release: bump `version` in
`package.json`, update the changelog notes if you keep any, tag `main`, and
push the tag. To roll back, re-run the Release workflow by hand from the
older tag.

## Code of Conduct

[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) applies to all project spaces. Be
kind; everyone here is somebody's kid.

## Questions?

Open an issue. Security concerns go through the private channel in
[SECURITY.md](SECURITY.md), never a public issue.
