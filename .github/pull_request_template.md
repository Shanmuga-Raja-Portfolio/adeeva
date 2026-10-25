## What changed

<!-- One or two sentences, plus the task number (task/NNNN-slug). -->

## Evidence

<!-- Commands run and their results, test counts, measurements, links to reports in work/. -->

## Gate

- [ ] Every commit is signed off (`git commit -s`, DCO); CI's sign-off check passes
- [ ] `pnpm typecheck`, `pnpm lint` and `pnpm test` pass locally
- [ ] Affected browser specs pass locally (`MAKER_PORT=<free port> pnpm e2e <specs> --workers=2`)
- [ ] No code comments, every file is 700 lines or fewer, no utils, helpers, common or shared folders
- [ ] Docs and the roadmap match the change
- [ ] `ci-ok` is green before merging (rebase or squash only; delete the branch afterwards)

## Screenshots (UI changes)

<!-- Before and after, at the sizes the change affects. Write "None" if nothing on screen changed. -->

## Security impact

<!-- One line: "None", or what changes for storage, network, headers, the service worker, dependencies or CI secrets. -->
