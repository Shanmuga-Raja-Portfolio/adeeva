# Maker Studio

**Seven offline, family-safe games about running a small creative business —
bake, cook, make, mend, and grow a tiny studio of your own.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/Shanmuga-Raja-Portfolio/adeeva/actions/workflows/ci.yml/badge.svg)](https://github.com/Shanmuga-Raja-Portfolio/adeeva/actions/workflows/ci.yml)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

Maker Studio is a browser game collection about maker careers. Each game is a
small, honest simulation of a creative trade: take orders, do the work well,
and watch a little reputation grow. It installs as an offline app (PWA), runs
without an account, and collects no data. Everything works with the network
off.

The studio started with ADEEVA, a crafting game, and grew six siblings:

| Game                   | The trade                                                            |
| ---------------------- | -------------------------------------------------------------------- |
| **Adeeva**             | Craft workshop: take requests, choose materials, make the piece well |
| **Six Kitchens**       | Restaurant kitchen: prep, cook, plate and serve under the clock      |
| **Patisserie Atelier** | Bakery: bakes, cakes and a shop of your own                          |
| **Jewellery Bench**    | Fine jewellery: bench work, collections, lantern nights              |
| **Interior Studio**    | Home makeovers: plan, decorate and show the finished room            |
| **Thrift-Flip Studio** | Second-hand finds: mend, style and resell                            |
| **Workshop & Wood**    | Woodworking: commissions from the neighbourhood                      |

Built for families: gentle pacing, no ads, no purchases, no streaks, nothing
that punishes a child for walking away. A parent page inside the app explains
what is stored and how to forget it.

## Run it

You need [Node.js 24](https://nodejs.org) and [pnpm 11](https://pnpm.io)
(`corepack enable` gives you pnpm).

```bash
pnpm install
pnpm dev        # play at the local URL it prints
```

Other commands:

| Command        | What it does                                          |
| -------------- | ----------------------------------------------------- |
| `pnpm build`   | Type-check and build the offline app into `dist/`     |
| `pnpm preview` | Serve the built app locally                           |
| `pnpm test`    | Unit tests (Vitest)                                   |
| `pnpm e2e`     | Browser tests (Playwright; needs `MAKER_PORT=<port>`) |
| `pnpm check`   | Everything: typecheck, lint, unit tests, e2e          |

Double-clicking `Play Maker Studio.cmd` on Windows starts a local copy when
one is present.

## Deployments

Production deploys run from `v*.*.*` tags on `main`
(see [.github/workflows/release.yml](.github/workflows/release.yml)) and are
hosted on Cloudflare Pages as the `makers-studio` project. Pull requests get
their own preview deployments, kept private behind Cloudflare Access
([.github/workflows/preview.yml](.github/workflows/preview.yml)).

To release: tag `main` as `vMAJOR.MINOR.PATCH` and push the tag. To roll back,
re-run the Release workflow by hand from the older tag.

## Repository map

| Path                                    | What is there                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [src/games/](src/games)                 | One folder per game: `adeeva`, `chef`, `interior`, `jewellery`, `patisserie`, `thrift-flip`, `workshop` |
| [src/engine/](src/engine)               | Shared rules: judging, reputation, difficulty, geometry, scoring                                        |
| [src/studio/](src/studio)               | The shell around the games: home screen, parent page, stages                                            |
| [src/offline/](src/offline)             | Service worker and offline shell                                                                        |
| [src/ui/](src/ui)                       | Shared interface pieces                                                                                 |
| [e2e/](e2e)                             | Playwright specs per game, with fixtures                                                                |
| [tooling/](tooling)                     | Build tooling: headers, precache list, offline build checks                                             |
| [work/](work)                           | Design notes and research reports                                                                       |
| [.github/workflows/](.github/workflows) | CI, PR previews, release                                                                                |

## Safety and privacy

- **Offline first.** The app is a PWA with a precache; play does not need the
  network. Storage stays on the device; the parent page can forget it.
- **No accounts, no ads, no purchases, no analytics.**
- **Dependencies are audited in CI on every change** (`pnpm audit`, including
  a secrets scan), and shipped code must carry no known advisory.
- Security issues: see [SECURITY.md](SECURITY.md) — please report privately.

## Contributing

Issues and pull requests are welcome. The working agreement, local gates and
release process live in [CONTRIBUTING.md](CONTRIBUTING.md); behavior
expectations in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE). Names, characters and art are original; every game is built
on the shared engine in this repository.
